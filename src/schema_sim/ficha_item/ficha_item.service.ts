import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { CreateFichaDto } from './../../schema_public/ficha/dto/create-ficha.dto';
import { CreateObraDto } from './../../schema_public/obra/dto/create-obra.dto';
import { Ficha } from './../../schema_public/ficha/entities/ficha.entity';
import { Obra } from './../../schema_public/obra/entities/obra.entity';
import { Item } from './../../schema_public/item/entities/item.entity';  // Importamos la entidad de item
import { Documento } from '../../schema_public/documento/entities/documento.entity';
import { log } from 'node:console';
import { NUMBER } from 'sequelize';

@Injectable()
export class ficha_itemService {
  parametricaRepo: any;
  constructor(
    @InjectRepository(Ficha)
    private fichaRepository: Repository<Ficha>,

    @InjectRepository(Obra)
    private obraRepository: Repository<Obra>,

    @InjectRepository(Item)  // Añadimos el repositorio de Item
    private itemRepository: Repository<Item>,

    @InjectRepository(Documento)  // Nuevo repositorio
    private documentoRepository: Repository<Documento>,
    private connection: Connection
  ) { }


  private token: string | null = null;
  private gestion: number;
  private arrayUes?: { l_ue: any[] }[] | null = null;

  // Método para crear Ficha, Obra y Items
  async importarFicha(
    createFichaDto: CreateFichaDto,
    createObraDto: CreateObraDto,
    items_st: string,  // Array de items pasados en el body
    documentos_st: string  // JSON de documentos
  ): Promise<void> {
    console.log(createFichaDto);

    await this.connection.transaction(async (manager) => {
      // Insertar en la tabla "fichas"
      const ficha = manager.create(Ficha, createFichaDto);
      console.log(ficha);

      const fichaGuardada = await manager.save(ficha);
      console.log(fichaGuardada);

      // Insertar en la tabla "obras", haciendo referencia a la Ficha recién creada
      const obra = manager.create(Obra, {
        ...createObraDto,
        id_ficha: fichaGuardada.id_ficha,  // Relacionar la obra con la ficha
      });
      const obraGuardada = await manager.save(obra);
      const id_obra = obraGuardada.id_obra;

      console.log(items_st);
      // let items = [];
      console.log(items_st);
      if (items_st != null) {
        let items = JSON.parse(items_st);
        for (const item of items) {
          console.log(item);
          // Insertar en la tabla "items"
          const newItem = manager.create(Item, {
            ...item,
            id_estado: item.id_estado,
            id_usuario_registro: 0,
            // p_unitario_sim:item.unitario_ref,
            // p_unitario_adjudicado:item.unitario,
            // cantidad_sim:item.cantidad,
            // id_item_sim:item.id_item,
            codigo_item: item.codigo_item,
            item: item.codigo_detalle,
            // unidad_medida:item.unidad,
            // iditem_proc:item.id_orden_item,
            id_obra: obraGuardada.id_obra,
          });
          await manager.save(newItem);
        }
      }

      //documentos
      // let docs = [];
      // docs = JSON.parse(documentos_st);
      // //// Insertar en la tabla "documentos"
      // for (const documento of docs) {
      //   const newDocumento = manager.create(Documento, {
      //     ...documento,
      //     cumple:true,
      //     usuario_registro:0,
      //     id_obra: obraGuardada.id_obra,  // Relacionar el documento con la obra
      //   });
      //   await manager.save(newDocumento);
      // }
    });
  }

  //Método para obtener TOKEN DESDE UN SERVICIO EXTERNO
  async obtenerToken(): Promise<any> {
    const url_sim = process.env.URL_SIM2; // OBTENER PARAMETROS DE URL DESDE .env
    const url = `${url_sim}sgeo/wsToken`;
    const headers = {
      'Content-Type': 'application/json',
    };
    var response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(JSON.parse(process.env.CREDENCIALES_SIM2 || '{}')),
    });
    const data = await response.json();
    if (data.res == "OK") {

      this.token = data.datos.token;
      return data.datos.token;
    } else {
      throw new Error(`Error en la llamada al servicio externo: ${response.statusText}`);
    }
  }

  // Método para obtener el listado de ues desde un servicio externo
  async obtenerUes(gestion_: number, id_usuario: number): Promise<any> {
    this.gestion = gestion_;
    // OBTENER PARAMETROS DE URL DESDE .env
    const url_sim = process.env.URL_SIM2;
    const url = `${url_sim}sgeo/wsDataUnidadEjecutora`;

    // const qry = `select  from parametrica where id_parametrica = ${process.env.ID_TIPO_ITEM}`;
    // const resParam = await this.parametricaRepo.query(qry)
    // console.log("id_parm",resParam);

    const body = gestion_; //corregir esto... ***
    console.log(body);
    //consultar a la base de datos en tabla parametrica, con select


    // Realizar la llamada al servicio externo
    var response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}`, },
      body: JSON.stringify({ "gestion": this.gestion })
    });
    //const resultados = [];
    const data = await response.json();
    //console.log(data);
    if (data.res == "OK") {
      this.arrayUes = data.datos;
      const nuevoArray = this.arrayUes ? this.arrayUes.map((item: { l_ue: any[] }) => item.l_ue).flat() : [];
      nuevoArray.sort((a: { codigo_ue: number }, b: { codigo_ue: number }) => a.codigo_ue - b.codigo_ue);
      console.log(nuevoArray);
      for (const valor of nuevoArray) {//saltar a un valor mayor a 100
        // if (valor.codigo_ue < 100) {
        //   continue; // Salta a la siguiente iteración si el valor es mayor a 100
        // }
        console.log("gestion, " + gestion_ + ", CODIGO UE" + valor.codigo_ue);
        await this.obtenerFichas(valor.codigo_ue, id_usuario);
        //resultados.push(resultado);
      }
    } else {
      throw new Error(`164 Error en la llamada al servicio externo: ${response.statusText}`);
    }
  }

  // Método para obtener el listado de ues desde un servicio externo
  async obtenerFichas(desc_cod_ue_: number, id_usuario: number): Promise<any> {
    try {
      var corr_carpeta = 0
      console.log("desc_cod_ue_",desc_cod_ue_);
      var maxCorrelativo = await this.fichaRepository.findOne({
        select: { correlativo_carpeta: true },
        order: { correlativo_carpeta: 'DESC' },
        where: {desc_cod_ue:desc_cod_ue_}, // ← condición vacía explícita
      });
      
      if(maxCorrelativo != null ){
        corr_carpeta = maxCorrelativo?.correlativo_carpeta;
        corr_carpeta++;
      }
      console.log("corr_carpeta", corr_carpeta);
      // OBTENER PARAMETROS DE URL DESDE .env
      const url_sim = process.env.URL_SIM2;
      // realizar la llamada al servicio externo metodo POST
      const url = `${url_sim}sgeo/wsListaFichasObras`;
      // Realizar la llamada al servicio externo
      var response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
        body: JSON.stringify({
          "desc_cod_ue": desc_cod_ue_,
          "gestion": this.gestion,
          "cod_carpeta": corr_carpeta
        }),
      });
      const data = await response.json();
      console.log(data);
      
      if (data.res == "OK") {
        for (const fichaJson of data.datos) {
          //verificar si existe la ficha en la base de datos, si existe no guardar
          const fichaExistente = await this.fichaRepository.findOne({ where: { correlativo_carpeta: fichaJson.cod_carpeta } });
          //console.log('fichaExistente',fichaExistente);
          if (fichaExistente) {
            console.log(`Ficha con cod_carpeta ${fichaJson.cod_carpeta} ya existe en la base de datos.`);
            continue; // Si ya existe, continuar con la siguiente ficha
          }

          //validar que codigo_ficha tenga el texto 2025
          if (!fichaJson.codigo_ficha.includes("2025")) {
            console.log(`Ficha con cod_carpeta ${fichaJson.cod_carpeta} ${fichaJson.codigo_ficha} no contiene el corresponde a la gestion 2025.`);
            continue; // Si no contiene el texto, continuar con la siguiente ficha
          }

          const nueva_ficha = this.transformarFicha(fichaJson, desc_cod_ue_, this.gestion, id_usuario);
          //console.log(nueva_ficha);
          try {
            const nuevaFicha = await this.fichaRepository.save(nueva_ficha);
            const nuevaObra = this.crearObraDesdeFicha(nuevaFicha, id_usuario);
            const obraGuardada = await this.obraRepository.save(nuevaObra);
            console.log(`ficha guardada, cod_carpeta: ` + fichaJson.cod_carpeta);

            await this.guardarItems(fichaJson.d_item, obraGuardada, id_usuario);
          } catch (error) {
            //lanzar error si no se puede guardar la ficha

            //  console.error(`❌ Error al procesar la ficha ${ficha.cod_carpeta}:`, (error as any).message);
            //mandar  error si no se puede guardar la obra, trwow error
            console.error(`❌ Error al procesar la obra ${nueva_ficha.cod_carpeta}:`, (error as any).message);
            throw new Error(`Error al guardar la obra: ${error}`);
          }
        }
      } else {
        console.log("error: sin datos de servicio", data.res);
        //throw new Error(` 199 Error en la llamada al servicio externo: ${response.statusText}`);
      }
    } catch (error) {
      console.log("catch error:",error);
      
    }
  }


  async obtenerFichaporCorrelativo(id_correlativo: number, id_usuario: number): Promise<any> {
    //console.log("desc_cod_ue_",desc_cod_ue_);

    // OBTENER PARAMETROS DE URL DESDE .env
    const url_sim = process.env.URL_SIM2;
    // realizar la llamada al servicio externo metodo POST
    const url = `${url_sim}sgeo/wsDataFichaObra`;
    // Realizar la llamada al servicio externo
    var response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
      body: JSON.stringify({
        "cod_carpeta": id_correlativo
      })
    });
    const data = await response.json();
    console.log(data);
    if (data.res == "OK") {
      for (const fichaJson of data.datos) {
        //verificar si existe la ficha en la base de datos, si existe no guardar
        const fichaExistente = await this.fichaRepository.findOne({ where: { cod_carpeta: fichaJson.cod_carpeta } });
        if (fichaExistente) {
          console.log(`Ficha con cod_carpeta ${fichaJson.cod_carpeta} ya existe en la base de datos.`);
          continue; // Si ya existe, continuar con la siguiente ficha
        }

        //validar que codigo_ficha tenga el texto 2025
        if (!fichaJson.codigo_ficha.includes("2025")) {
          console.log(`Ficha con cod_carpeta ${fichaJson.cod_carpeta} ${fichaJson.codigo_ficha} no contiene el corresponde a la gestion 2025.`);
          continue; // Si no contiene el texto, continuar con la siguiente ficha
        }

        const nueva_ficha = this.transformarFicha2(fichaJson, id_usuario);
        //console.log(nueva_ficha);
        try {
          const nuevaFicha = await this.fichaRepository.save(nueva_ficha);
          const nuevaObra = this.crearObraDesdeFicha(nuevaFicha, id_usuario);
          const obraGuardada = await this.obraRepository.save(nuevaObra);
          console.log(`ficha guardada, cod_carpeta: ` + fichaJson.cod_carpeta);

          await this.guardarItemsIndividual(fichaJson.d_item, obraGuardada, id_usuario);
        } catch (error) {
          //lanzar error si no se puede guardar la ficha

          //  console.error(`❌ Error al procesar la ficha ${ficha.cod_carpeta}:`, (error as any).message);
          //mandar  error si no se puede guardar la obra, trwow error
          console.error(`❌ Error al procesar la obra ${nueva_ficha.cod_carpeta}:`, (error as any).message);
          throw new Error(`Error al guardar la obra: ${error}`);
        }
      }
    } else {
      console.log("error: sin datos de servicio", data.res);
      //throw new Error(` 199 Error en la llamada al servicio externo: ${response.statusText}`);
    }
  }



  private transformarFicha(fichaJson: any, desc_cod_ue: number, gestion: number, id_usuario: number): Ficha {
    //separar el campo cat_programatico en 3 partes
    const cat_progratica = fichaJson.cat_progratica.split('-');
    return this.fichaRepository.create({
      desc_cod_ue: desc_cod_ue,
      correlativo_carpeta: fichaJson.cod_carpeta,
      cod_carpeta: fichaJson.codigo_ficha,
      cod_sisin: fichaJson.sisin,
      desc_carpeta: fichaJson.nombre_ficha,
      desc_zona_carpeta: fichaJson.localizacion || '',
      id_estado: 1, //Asignar estado inicial
      estado_carpeta: fichaJson.estado,
      total_carpeta: fichaJson.monto_total,
      gestion_carpeta: gestion,
      cod_estado_carpeta: 1, //validado
      cod_prioridad_carpeta: 0,
      cod_carpeta_anterior: 0,
      continuidad: 0,
      desc_distrito_carpeta: fichaJson.distrito || '',
      desc_macrodistrito_carpeta: fichaJson.macrodistrito || '',
      fecha_validacion_carpeta: this.formatDate(fichaJson.fe_val),
      fecha_modificacion: undefined,
      fecha_registro: new Date(),
      usuario_registro: id_usuario, // Asignar según contexto de usuario
      url_adjuntos: fichaJson.url,
      programa: cat_progratica[0],
      proyecto: cat_progratica[1],
      actividad: cat_progratica[2],
    });
  }

  private transformarFicha2(fichaJson: any, id_usuario: number): Ficha {
    //separar el campo cat_programatico en 3 partes
    const cat_progratica = fichaJson.cat_progratica.split('-');

    return this.fichaRepository.create({
      correlativo_carpeta: fichaJson.cod_carpeta,
      cod_carpeta: fichaJson.codigo_ficha,
      cod_sisin: fichaJson.sisin,
      desc_carpeta: fichaJson.nombre_ficha,
      desc_zona_carpeta: fichaJson.localizacion || '',
      id_estado: 1, //Asignar estado inicial
      estado_carpeta: fichaJson.estado,
      total_carpeta: fichaJson.monto_total,
      gestion_carpeta: fichaJson.gestion,
      cod_estado_carpeta: 1, //validado
      cod_prioridad_carpeta: 0,
      cod_carpeta_anterior: 0,
      continuidad: 0,
      desc_distrito_carpeta: fichaJson.distrito || '',
      desc_macrodistrito_carpeta: fichaJson.macrodistrito || '',
      fecha_validacion_carpeta: this.formatDate(fichaJson.fe_val),
      fecha_modificacion: undefined,
      fecha_registro: new Date(),
      usuario_registro: id_usuario, // Asignar según contexto de usuario
      url_adjuntos: fichaJson.url,
      programa: cat_progratica[0],
      proyecto: cat_progratica[1],
      actividad: cat_progratica[2],
    });
  }

  private crearObraDesdeFicha(ficha: Ficha, id_usuario: number): Obra {
    const obra = new Obra();
    obra.id_ficha = ficha.id_ficha;  // Asigna la clave foránea
    obra.id_estado_general = 1;
    obra.anticipo = false;
    obra.procede = 1;
    obra.fecha_pago_anticipo = null;
    obra.monto_anticipo = 0;
    obra.usuario_registro = id_usuario;
    obra.id_estado = ficha.id_estado;
    return obra;
  }

  // private async guardarItems(itemsJson: any[], obra: Obra, id_usuario_: number): Promise<void> {
  //   if (!itemsJson || itemsJson.length === 0) return; // No hay items que guardar

  //   const items = itemsJson
  //   .filter(itemJson => 
  //     itemJson.codigo_item != "GM" && ["42310", "42230"].includes(itemJson.partida)
  //   ).map(itemJson => {
  //     const id_tipo_item: number = Number(process.env.ID_TIPO_ITEM); //Ajustar para el servicio

  //     return this.itemRepository.create({
  //       desc_item: itemJson.item,
  //       cantidad_sim: itemJson.cantidad,
  //       cantidad_autorizada: itemJson.cantidad,
  //       unidad_medida_sim: itemJson.unidad,
  //       p_unitario_sim: itemJson.real_unitario,
  //       total_item_sim: itemJson.total,
  //       obra: obra, //Relación con la obra
  //       codigo_item: itemJson.codigo_item || '',
  //       partida_sim: itemJson.partida || 0, //ajustar para el servicio
  //       orden_sim: itemJson.orden, //ajustar para el servicio
  //       id_tipo_item: id_tipo_item, //ajustar para el servicio
  //       id_usuario_registro: id_usuario_,
  //       id_estado: 1,
  //       finalizado: false,
  //     });
  //   });

  //   try {
  //     await this.itemRepository.save(items);
  //     console.log(`✅ ${items.length} items guardados para la obra con ID: ${obra.id_obra}`);
  //   } catch (error) {
  //     console.error(`❌ Error al guardar items de la obra ${obra.id_obra}:`, (error as any).message);
  //     throw new Error(`Error al guardar item: ${error}`);
  //   }
  // }

  private async guardarItems(itemsJson: any[], obra: Obra, id_usuario_: number): Promise<void> {
    if (!itemsJson || itemsJson.length === 0) return; // No hay items que guardar

    const id_tipo_item: number = Number(process.env.ID_TIPO_ITEM); // Ajustar para el servicio

    // Filtrar solo las partidas permitidas (42310 y 42230)
    const partidasPermitidas = ["42310", "42230"];
    const registrosUnicos = new Map<string, any>();

    itemsJson.forEach(itemJson => {
      // Validar si la partida está permitida
      if (!partidasPermitidas.includes(itemJson.partida)) {
        console.log(`Item ignorado: Partida no permitida. Partida=${itemJson.partida}, Orden=${itemJson.orden}, Código_Item=${itemJson.codigo_item}`);
        return; // Saltar este item
      }

      // Crear una clave única basada en orden y codigo_item
      const claveRegistro = `${itemJson.orden}-${itemJson.codigo_item}`;

      // Si ya existe un item con esta clave, se ignora el nuevo
      if (registrosUnicos.has(claveRegistro)) {
        console.log(`Item ignorado: Par (Orden, Código_Item) duplicado en el JSON. Orden=${itemJson.orden}, Código_Item=${itemJson.codigo_item}`);
        return; // Ignorar duplicados posteriores
      }

      // Agregar el item al Map como único (SOLO SE MANTIENE EL PRIMER ITEM ENCONTRADO)
      registrosUnicos.set(claveRegistro, itemJson);
      //console.log(`Item agregado al conjunto único: Orden=${itemJson.orden}, Código_Item=${itemJson.codigo_item}`);
    });

    const itemsFiltrados: any[] = Array.from(registrosUnicos.values());
    try {
      if (itemsFiltrados.length > 0) {
        // Guardar los items filtrados en la base de datos
        await this.itemRepository.save(
          itemsFiltrados.map(itemJson =>
            this.itemRepository.create({
              desc_item: itemJson.item,
              cantidad_sim: itemJson.cantidad,
              cantidad_autorizada: itemJson.cantidad,
              unidad_medida_sim: itemJson.unidad,
              p_unitario_sim: itemJson.real_unitario,
              total_item_sim: itemJson.total,
              obra: obra, // Relación con la obra
              codigo_item: itemJson.codigo_item || '',
              partida_sim: itemJson.partida || 0, // ajustar para el servicio
              orden_sim: itemJson.orden, // ajustar para el servicio
              id_tipo_item: id_tipo_item, // ajustar para el servicio
              id_usuario_registro: id_usuario_,
              id_estado: 1,
            })
          )
        );
        console.log(`Se guardaron ${itemsFiltrados.length} items en la base de datos.`);
      } else {
        console.log(`No se guardaron nuevos items porque todos fueron ignorados.`);
      }
    } catch (error) {
      console.error(`Error al guardar items: ${error}`);
      throw new Error(`Error al guardar items: ${error}`);
    }
  }

  private async guardarItemsIndividual(itemsJson: any[], obra: Obra, id_usuario_: number): Promise<void> {
    if (!itemsJson || itemsJson.length === 0) return; // No hay items que guardar

    const id_tipo_item: number = Number(process.env.ID_TIPO_ITEM); // Ajustar para el servicio

    // Filtrar solo las partidas permitidas (42310 y 42230)
    const partidasPermitidas = ["42310", "42230", "24300"];
    const registrosUnicos = new Map<string, any>();

    itemsJson.forEach(itemJson => {
      // Validar si la partida está permitida
      if (!partidasPermitidas.includes(itemJson.partida)) {
        console.log(`Item ignorado: Partida no permitida. Partida=${itemJson.partida}, Orden=${itemJson.orden}, Código_Item=${itemJson.codigo_item}`);
        return; // Saltar este item
      }

      // Crear una clave única basada en orden y codigo_item
      const claveRegistro = `${itemJson.orden}-${itemJson.codigo_item}`;

      // Si ya existe un item con esta clave, se ignora el nuevo
      if (registrosUnicos.has(claveRegistro)) {
        console.log(`Item ignorado: Par (Orden, Código_Item) duplicado en el JSON. Orden=${itemJson.orden}, Código_Item=${itemJson.codigo_item}`);
        return; // Ignorar duplicados posteriores
      }

      // Agregar el item al Map como único (SOLO SE MANTIENE EL PRIMER ITEM ENCONTRADO)
      registrosUnicos.set(claveRegistro, itemJson);
      //console.log(`Item agregado al conjunto único: Orden=${itemJson.orden}, Código_Item=${itemJson.codigo_item}`);
    });

    const itemsFiltrados: any[] = Array.from(registrosUnicos.values());
    try {
      if (itemsFiltrados.length > 0) {
        // Guardar los items filtrados en la base de datos
        await this.itemRepository.save(
          itemsFiltrados.map(itemJson =>
            this.itemRepository.create({
              desc_item: itemJson.item,
              cantidad_sim: itemJson.cantidad,
              cantidad_autorizada: itemJson.cantidad,
              unidad_medida_sim: itemJson.unidad,
              p_unitario_sim: itemJson.real_unitario,
              total_item_sim: itemJson.total,
              obra: obra, // Relación con la obra
              codigo_item: itemJson.codigo_item || '',
              partida_sim: itemJson.partida || 0, // ajustar para el servicio
              orden_sim: itemJson.orden, // ajustar para el servicio
              id_tipo_item: id_tipo_item, // ajustar para el servicio
              id_usuario_registro: id_usuario_,
              id_estado: 1,
            })
          )
        );
        console.log(`Se guardaron ${itemsFiltrados.length} items en la base de datos.`);
      } else {
        console.log(`No se guardaron nuevos items porque todos fueron ignorados.`);
      }
    } catch (error) {
      console.error(`Error al guardar items: ${error}`);
      throw new Error(`Error al guardar items: ${error}`);
    }
  }

  formatDate(inputDate: string): Date {
    // Dividir la fecha en día, mes y año
    const [day, month, year] = inputDate.split('/').map(Number);

    // Crear un objeto Date (mes empieza en 0 en JavaScript)
    const date = new Date(year, month - 1, day);
    return date;
  }
}