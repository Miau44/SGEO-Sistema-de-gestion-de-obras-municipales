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
import { timeout } from 'rxjs';
import { ResponseService } from 'src/response.service';

@Injectable()
export class ficha_itemService {
  parametricaRepo: any;
  constructor(
    private responseService: ResponseService,
    
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

    const body = gestion_; 
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
      //console.log(nuevoArray);
      let msg = "";
      for (const valor of nuevoArray) {//saltar a un valor mayor a 100
        msg += await this.obtenerFichas(valor.codigo_ue, id_usuario);
      }
      return msg;
    } else {
      throw new Error(`164 Error en la llamada al servicio externo: ${response.statusText}`);
    }
  }

  // Método para obtener el listado de ues desde un servicio externo
  async obtenerFichas(desc_cod_ue_: number, id_usuario: number): Promise<any> {
    try {
      var corr_carpeta = 0
      //console.log("desc_cod_ue_",desc_cod_ue_);
      var maxCorrelativo = await this.fichaRepository.findOne({
        select: { correlativo_carpeta: true },
        order: { correlativo_carpeta: 'DESC' },
        where: { desc_cod_ue: desc_cod_ue_ }, // ← condición vacía explícita
      });

      // if (maxCorrelativo != null) {
      //   corr_carpeta = maxCorrelativo?.correlativo_carpeta;
      //   corr_carpeta++;
      // }
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
      if (data.res == "OK") {
        let msg = "";
        for (const fichaJson of data.datos) {

          //validar que fichaJson.desc_carpeta no contenga la palabra "SERVICIO" o "SERVICIOS" al inicio
          if (fichaJson.nombre_ficha.toUpperCase().startsWith("SERVICIO") || fichaJson.nombre_ficha.toUpperCase().startsWith("SERVICIOS")) {
            console.log( `Ficha con cod_carpeta ${fichaJson.cod_carpeta} es un servicio, no se guarda.` );
            msg += `${fichaJson.cod_carpeta}: es un servicio, no se guarda.\n`;
            continue; 
          }

          //validar que codigo_ficha tenga el texto 2025
          if (!fichaJson.codigo_ficha.includes("2025")) {
            msg += `${fichaJson.cod_carpeta}: no corresponde a la gestion 2025.\n`;
            continue;
          }

          //verificar si existe la ficha en la base de datos, si existe no guardar
          const fichaExistente = await this.fichaRepository.findOne({ where: { correlativo_carpeta: fichaJson.cod_carpeta } });
          //console.log('fichaExistente',fichaExistente);
          if (fichaExistente) {
            console.log(`Ficha con cod_carpeta ${fichaJson.cod_carpeta} ya existe en la base de datos.`);
            msg += `${fichaJson.cod_carpeta}: ya existe en la base de datos.\n`;
            continue; // Si ya existe, continuar con la siguiente ficha
          }



          const nueva_ficha = this.transformarFicha(fichaJson, desc_cod_ue_, this.gestion, id_usuario);
          //console.log(nueva_ficha);
          try {
            const nuevaFicha = await this.fichaRepository.save(nueva_ficha);
            const nuevaObra = await this.crearObraDesdeFicha(nuevaFicha, id_usuario);
            const obraGuardada = await this.obraRepository.save(nuevaObra);
            console.log(`ficha guardada, cod_carpeta: ` + fichaJson.cod_carpeta);
            msg += `${fichaJson.cod_carpeta}: guardada en la base de datos.\n`;
            msg += await this.guardarItems(fichaJson.d_item, obraGuardada, id_usuario);
          } catch (error) {
            //mandar  error si no se puede guardar la obra, trwow error
            //console.error(`❌ Error al procesar la obra ${nueva_ficha.cod_carpeta}:`, (error as any).message);
            msg += `${fichaJson.cod_carpeta}: Error al guardar la obra.\n`;
            return this.responseService.error(error,msg+ `\n ${fichaJson.cod_carpeta}: Error al guardar la obra.\n`, 500);
          }
        }
        return "ue: "+desc_cod_ue_+"\n"+msg;
      } else {
        console.log("error: sin datos de servicio", data.res);
        return "ue: "+desc_cod_ue_+"\n"+"sin datos para la UE";
        return this.responseService.error(data.res, 'sin datos de servicio', 500);
        //throw new Error(` 199 Error en la llamada al servicio externo: ${response.statusText}`);
      }
    } catch (error) {
      console.log("catch error:", error);
    }
  }

  async verificarFicha(id_correlativo: number, id_usuario: number,gestion:number,actualizar?: boolean): Promise<any> {
    //OBTENER PARAMETROS DE URL DESDE .env
    const url_sim = process.env.URL_SIM2;
    //Realizar la llamada al servicio externo metodo POST
    const url = `${url_sim}sgeo/wsDataFichaObra`;
    //Realizar la llamada al servicio externo
    var response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
      body: JSON.stringify({
        "cod_carpeta": id_correlativo
      })
    });

    const data = await response.json();
    var st_gestion: string = gestion.toString();
    if (data.res == "OK") {
      var fichaJson = data.datos[0];
        if (!fichaJson.codigo_ficha.includes(st_gestion)) {
          return `Ficha con cod_carpeta ${fichaJson.cod_carpeta} ${fichaJson.codigo_ficha} no corresponde a la gestion ${st_gestion}.`;
        }

        //for (const fichaJson of data.datos) {
        try {
          let id_ficha = 0; let objFicha = null; let objObra = null;
          //verificar si existe la ficha en la base de datos, si existe no guardar
          const fichaExistente = await this.fichaRepository.findOne({ where: { correlativo_carpeta: fichaJson.cod_carpeta } });
          if (fichaExistente==null) {
            return `Ficha inexistente`;
          }
          else {
            id_ficha = fichaExistente.id_ficha;
            objFicha = fichaExistente;
          }

          //verificar que id_ficha no sea 0
          if (id_ficha == 0) {
            throw new Error(`Error: id_ficha es 0, no se puede guardar la obra.`);
          }

          //validar si existe la obra en la base de datos, si existe no guardar
          let id_obra = 0;
          const obraExistente = await this.obraRepository.findOne({ where: { id_ficha: id_ficha } });
          if (obraExistente) {
            id_obra = obraExistente.id_obra;
            objObra = obraExistente;
          }
          else {
            return "Error, registro no encontrado";
          }

          var res = "";

          const partidasPermitidas = ["42310", "42230"];
          const registrosUnicos = new Map<string, any>();
          fichaJson.d_item.forEach((itemJson: { partida: string; orden: any; codigo_item: any; }) => {
            // Validar si la partida está permitida
            if (!partidasPermitidas.includes(itemJson.partida)) {
              return; //Saltar este item
            }

            // Crear una clave única basada en orden y codigo_item
            const claveRegistro = `${itemJson.orden}-${itemJson.codigo_item}`;

            // Si ya existe un item con esta clave, se ignora el nuevo
            if (registrosUnicos.has(claveRegistro)) {
              return; // Ignorar duplicados posteriores
            }

            // Agregar el item al Map como único (SOLO SE MANTIENE EL PRIMER ITEM ENCONTRADO)
            registrosUnicos.set(claveRegistro, itemJson);
            //console.log(`Item agregado al conjunto único: Orden=${itemJson.orden}, Código_Item=${itemJson.codigo_item}`);
          });

          if(actualizar == false){
            //verificar monto total
            const montoTotalExterno = this.roundTo(fichaJson.monto_total,2);
            const montoTotalInterno = this.roundTo(objFicha.total_carpeta,2);
            
            if (montoTotalExterno !== montoTotalInterno) {
              res += "Monto total no coincide: Externo=" + montoTotalExterno + ", Interno=" + montoTotalInterno + "\n";
              return this.responseService.error(null, 'Los items de la ficha no coinciden con los de la base de datos '+res, 500);
            }

            res += await this.comparacionItems(Array.from(registrosUnicos.values()), objObra);
            
            if(res != ""){
              return this.responseService.error(res, 'Los items de la ficha no coinciden con los de la base de datos '+res, 500);
            }
            else{
              return this.responseService.success("OK", 'No se encontraron diferencias ', 200);
            }
          }
          else{
            //actualizar monto_total
            objFicha.total_carpeta = fichaJson.monto_total;
            await this.fichaRepository.save(objFicha);
            
            return await this.actualizarItems(Array.from(registrosUnicos.values()), objObra);
            return res;
          }
        } catch (error) {
          //lanzar error si no se puede guardar la ficha

          //  console.error(`❌ Error al procesar la ficha ${ficha.cod_carpeta}:`, (error as any).message);
          //mandar  error si no se puede guardar la obra, trwow error
          console.error(`❌ Error al procesar la ficha: correlativo:  ${id_correlativo}:`, (error as any).message);
          throw new Error(`Error al procesar la ficha: ${error}`);
        }
    } else {
      console.log("error: sin datos de servicio, revise si existe la ficha introducida", data.res);
      return this.responseService.error(null, 'no existe datos de servicio');
      //throw new Error(` 199 Error en la llamada al servicio externo: ${response.statusText}`);
    }
  }

  async comparacionItems(itemsExterno: any[], obra:Obra){
    var texto = "";
    //get array items base y obtener la cantidad de items, id_estado = 1
    var itemsInterno = await this.itemRepository.find({where: {id_obra: obra.id_obra, id_estado: 1,id_tipo_item:264}});
    if(itemsInterno === null){
      return `No se encontraron items para la obra`;
    }

    //comparar tamaño de los arrays en los items
    if (itemsExterno.length !== itemsInterno.length) {
      //console.log(`Los tamaños de los arrays no coinciden: Externo=${itemsExterno.length}, Interno=${itemsInterno.length}`);
      texto += `Los tamaños de los arrays no coinciden: Externo=${itemsExterno.length}, Interno=${itemsInterno.length}\n`;
    }
    
    //comparar los items de ambos arrays
    for (const itemExterno of itemsExterno) {
      let error = '';
      const itemExistente = itemsInterno.find(item => item.codigo_item === itemExterno.codigo_item);
      if (!itemExistente) {
        error += `Item no encontrado: ${itemExterno.id}\n`;
        continue;
      }
      //texto += `Item: ${itemExterno.codigo_item}\n`;
      
      // Comparar propiedades del item: orden_sim,desc_item,unidad_medida_sim,cantidad_sim,p_unitario_sim,total_item_sim
      if (itemExistente.orden_sim !== itemExterno.orden) {
        error += `Orden no coincide, `;
      }
      if (itemExistente.desc_item !== itemExterno.item) {
        error += `Descripción no coincide, `;
      }
      if (itemExistente.unidad_medida_sim !== itemExterno.unidad) {
        error += `Unidad de medida no coincide, `;
      }
      let cantidadExternoFormateada = parseFloat(itemExterno.cantidad.toFixed(2));
      const redondeoExistente = this.roundTo(itemExistente.cantidad_sim, 2);
      const redondeoExterno = this.roundTo(itemExterno.cantidad, 2);
      if (redondeoExistente !== redondeoExterno) {
        error += `Cantidad no coincide ${itemExistente.cantidad_sim}:${cantidadExternoFormateada}, `;
      }
      const punitario = this.roundTo(itemExistente.p_unitario_sim, 2);
      const punitarioExterno = this.roundTo(itemExterno.real_unitario, 2);
      if (punitario !== punitarioExterno) {
        error += `Precio unitario no coincide, `;
      }
      const total = this.roundTo(itemExistente.total_item_sim, 2);
      const totalExterno = this.roundTo(itemExterno.total, 2);
      if (total !== totalExterno) {
        error += `Total no coincide, `;
      }
      if(error!=''){
        texto += `Item ${itemExterno.codigo_item}: `;
        texto += error+'\n';
      }
    }
    return texto;
  }

  roundTo(num: number, decimales: number): number {
    if (isNaN(num)) {
      return NaN;
    }
    const factor = Math.pow(10, decimales);
    return Math.round(num * factor) / factor;
  }

  
  async actualizarItems(itemsExterno: any[], obra:Obra){
    var texto = "";

    //validar que obra.id_obra no sea nulo ni 0
    if (obra.id_obra == null || obra.id_obra == 0) {
      console.error(`Error: id_obra es nulo o 0, no se puede actualizar los items.`);
      throw new Error(`Error: id_obra es nulo o 0, no se puede actualizar los items.`);
    }
    //get array items base y obtener la cantidad de items 
    var itemsInterno = await this.itemRepository.find({where: {id_obra: obra.id_obra}});

    //validar que existan items select * from obra where id_obra = obra.id_obra
    if (itemsInterno == null || itemsInterno.length == 0) {
      console.log(`No se encontraron items para la obra con id_obra: ${obra.id_obra}`);
      return `No se encontraron items para la obra con id_obra: ${obra.id_obra}`;
    }

    //dar de baja los items de una obra: update item set id_estado = 0 where id_obra = obra.id_obra, id_tipo_item = id_tipo_item
    var resBaja = await this.itemRepository.update({id_obra: obra.id_obra, id_tipo_item: 264}, {id_estado: 0});
    console.log("Items dados de baja", resBaja);

    const id_tipo_item: number = Number(process.env.ID_TIPO_ITEM);
    //comparar los items de ambos arrays
    for (const itemExterno of itemsExterno) {
      const itemExistente = itemsInterno.find(item => item.codigo_item === itemExterno.codigo_item);
      //console.log("item Existente",itemExistente);
      
      if (!itemExistente) {      
            var itemCreado=this.itemRepository.create({
              desc_item: itemExterno.item,
              cantidad_sim: itemExterno.cantidad,
              cantidad_autorizada: itemExterno.cantidad,
              unidad_medida_sim: itemExterno.unidad,
              p_unitario_sim: itemExterno.real_unitario,
              total_item_sim: itemExterno.total,
              obra: obra, // Relación con la obra
              codigo_item: itemExterno.codigo_item || '',
              partida_sim: itemExterno.partida || 0, // ajustar para el servicio
              orden_sim: itemExterno.orden, // ajustar para el servicio
              id_tipo_item: id_tipo_item, // ajustar para el servicio
              id_usuario_registro: obra.usuario_registro,
              id_estado: 1,
            })
            console.log("Item creado", itemCreado);
      }
      else{
        if (itemExistente.finalizado) {
          console.log(`Item con codigo_item ${itemExterno.codigo_item} ya está finalizado se actualiza el orden.`);
          //texto += `Item ${itemExterno.codigo_item}: ya está finalizado y no se puede actualizar.\n`;
          itemExistente.orden_sim = itemExterno.orden;
          itemExistente.id_estado = 1;
          let actItem = await this.itemRepository.save(itemExistente);
          //console.log("Orden de Item actualizado ", actItem.codigo_item);
        }
        else{
          itemExistente.cantidad_sim = itemExterno.cantidad;
          itemExistente.cantidad_autorizada = itemExterno.cantidad;
          itemExistente.p_unitario_sim = itemExterno.real_unitario;
          itemExistente.total_item_sim = itemExterno.total;
          itemExistente.orden_sim = itemExterno.orden;
          itemExistente.id_estado = 1;
          let actItem = await this.itemRepository.save(itemExistente);
          console.log("Item actualizado", actItem);
        }
      }
      //texto += `.\n`;
    }
    if(texto != ""){
      return this.responseService.error("Error", texto, 500);
    }
    else{
      return this.responseService.success("OK", 'Actualización realizada', 200);
    }
  }
  
  async obtenerFichaporCorrelativo(id_correlativo: number, id_usuario: number): Promise<any> {
    //OBTENER PARAMETROS DE URL DESDE .env
    const url_sim = process.env.URL_SIM2;
    
    //Realizar la llamada al servicio externo metodo POST
    const url = `${url_sim}sgeo/wsDataFichaObra`;
    
    //Realizar la llamada al servicio externo
    var response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
      body: JSON.stringify({
        "cod_carpeta": id_correlativo
      })
    });

    const data = await response.json();
    if (data.res == "OK") {
      for (const fichaJson of data.datos) {
        try { 
          //validar que codigo_ficha tenga el texto 2025
          if (!fichaJson.codigo_ficha.includes("2025")) {
            console.log(`Ficha con cod_carpeta ${fichaJson.cod_carpeta} ${fichaJson.codigo_ficha} no corresponde a la gestion 2025.`);
            continue; // Si no contiene el texto, continuar con la siguiente ficha
          }

          if (fichaJson.nombre_ficha.toUpperCase().startsWith("SERVICIO") || fichaJson.nombre_ficha.toUpperCase().startsWith("SERVICIOS")) {
            console.log( `Ficha con cod_carpeta ${fichaJson.cod_carpeta} es un servicio, no se guarda.` );
            //msg += `${fichaJson.cod_carpeta}: es un servicio, no se guarda.\n`;
            continue;
          }

          let id_ficha = 0; let objFicha = null; let objObra = null;
          //verificar si existe la ficha en la base de datos, si existe no guardar
          const fichaExistente = await this.fichaRepository.findOne({ where: { correlativo_carpeta: fichaJson.cod_carpeta } });
          if (fichaExistente) {
            console.log(`Ficha con cod_carpeta ${fichaJson.cod_carpeta} ya existe en la base de datos.`);
            id_ficha = fichaExistente.id_ficha;
            objFicha = fichaExistente;
          }
          else {
            const nueva_ficha = this.transformarFicha2(fichaJson, id_usuario);
            const nuevaFicha = await this.fichaRepository.save(nueva_ficha);
            id_ficha = nuevaFicha.id_ficha;
            objFicha = nuevaFicha;
            console.log(`Ficha guardada: ` + id_ficha);
          }

          //verificar que id_ficha no sea 0
          if (id_ficha === 0) {
            console.error(`Error: id_ficha es 0, no se puede guardar la obra.`);
            throw new Error(`Error: id_ficha es 0, no se puede guardar la obra.`);
          }

          //validar si existe la obra en la base de datos, si existe no guardar
          let id_obra = 0;
          const obraExistente = await this.obraRepository.findOne({ where: { id_ficha: id_ficha } });
          if (obraExistente) {
            console.log(`Obra con id_ficha ${obraExistente.id_ficha} ya existe en la base de datos.`);
            id_obra = obraExistente.id_obra;
            objObra = obraExistente;
          }
          else {
            const nuevaObra = this.crearObraDesdeFicha(objFicha, id_usuario);
            const obraGuardada = await this.obraRepository.save(nuevaObra);
            console.log(`Obra guardada`, obraGuardada.id_obra);
            objObra = obraGuardada;
          }

          const items = await this.guardarItemsIndividual(fichaJson.d_item, objObra, id_usuario);
          console.log(`Items guardados`, items);

        } catch (error) {
          //lanzar error si no se puede guardar la ficha

          //  console.error(`❌ Error al procesar la ficha ${ficha.cod_carpeta}:`, (error as any).message);
          //mandar  error si no se puede guardar la obra, trwow error
          console.error(`❌ Error al procesar la ficha: correlativo:  ${id_correlativo}:`, (error as any).message);
          throw new Error(`Error al procesar la ficha: ${error}`);
        }
      }
    } else {
      console.log("error: sin datos de servicio", data.res);
      //throw new Error(` 199 Error en la llamada al servicio externo: ${response.statusText}`);
    }
  }

  async ActualizacionItemPorCorrelativo(id_correlativo: number, id_usuario: number): Promise<any> {
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
    if (data.res == "OK") {
      const fichaJson = data.datos[0]; // Asumimos que solo hay un objeto en datos
      //for (const fichaJson of data.datos) {
      //validar que codigo_ficha tenga el texto 2025
      if (!fichaJson.codigo_ficha.includes("2025")) {
        console.log(`Ficha con cod_carpeta ${fichaJson.cod_carpeta} ${fichaJson.codigo_ficha} no contiene el corresponde a la gestion 2025.`);
        return;
      }

      try {
        let id_ficha = 0; let objFicha = null; let objObra = null;
        //verificar si existe la ficha en la base de datos, si existe no guardar
        const fichaExistente = await this.fichaRepository.findOne({ where: { correlativo_carpeta: fichaJson.cod_carpeta } }); //fichaJson.cod_carpeta viene del servicio externo sim
        if (!fichaExistente || fichaExistente.id_ficha == 0) {
          console.log(`Ficha con cod_carpeta ${fichaJson.cod_carpeta} no existe en la base de datos.`);
          return;
        }

        //validar si existe la obra en la base de datos, si existe no guardar
        id_ficha = fichaExistente.id_ficha;
        const obraExistente = await this.obraRepository.findOne({ where: { id_ficha: fichaExistente.id_ficha } });
        if (!obraExistente || obraExistente.id_obra == 0) {
          console.log(`Obra con id_ficha ${fichaExistente.id_ficha} ya existe en la base de datos.`);
          return;
        }

        var items_actualizados = "";
        //console.log(fichaJson)
        fichaJson.d_item.forEach(async (item: any) => {
          //validar que exista el item en la base de datos (por obra y por codigo_item), si existe se debe actualizar con datos del servicio externo
          const itemExistente = await this.itemRepository.findOne({
            where: {
              id_obra: obraExistente.id_obra,
              codigo_item: item.codigo_item
            }
          });
          //validar que exista el item en la base de datos, si existe se debe actualizar con datos del servicio externo
          if (itemExistente) {
            //validar que el campo finalizado no sea 1
            if (itemExistente.finalizado) {
              console.log(`Item con codigo_item ${item.codigo_item} ya está finalizado y no se puede actualizar.`);
              return;
            }
            // Actualizar el item existente
            itemExistente.cantidad_sim = item.cantidad;
            itemExistente.cantidad_autorizada = item.cantidad;
            itemExistente.p_unitario_sim = item.real_unitario;
            itemExistente.total_item_sim = item.total;
            //itemExistente.orden_sim = item.orden;
            await this.itemRepository.save(itemExistente);

            items_actualizados += `${itemExistente.id_item}-${item.codigo_item},`;
            console.log(`${itemExistente.orden_sim} actualizado`);
            
          } else {
            console.log(`Item con codigo_item ${item.codigo_item} no existe en la base de datos, se omitirá.`);
            return; // Si no existe, se omite
          }
        });
        //añadir un timeout para console.log("items actualizados: ",items_actualizados);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Espera de 1 segundo

        
        console.log("items actualizados: ",items_actualizados);
        return items_actualizados; // Retornar los items actualizados
      } catch (error) {
        //lanzar error si no se puede guardar la ficha

        //  console.error(`❌ Error al procesar la ficha ${ficha.cod_carpeta}:`, (error as any).message);
        //mandar  error si no se puede guardar la obra, trwow error
        console.error(`❌ Error al procesar la ficha: correlativo:  ${id_correlativo}:`, (error as any).message);
        throw new Error(`Error al procesar la ficha: ${error}`);
      }
      //}
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

  private async guardarItems(itemsJson: any[], obra: Obra, id_usuario_: number): Promise<string> {
    if (!itemsJson || itemsJson.length === 0) return "No hay items que guardar";

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
        return "Se guardaron " + itemsFiltrados.length + " items en la base de datos.";
      } else {
        console.log(`No se guardaron nuevos items porque todos fueron ignorados.`);
        return "No se guardaron nuevos items porque todos fueron ignorados.";
      }
    } catch (error) {
      console.error(`Error al guardar items: ${error}`);
      throw new Error(`Error al guardar items: ${error}`);
    }
  }

  private async guardarItemsIndividual(itemsJson: any[], obra: Obra, id_usuario_: number): Promise<number> {
    if (!itemsJson || itemsJson.length === 0) return 0; // No hay items que guardar

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
        //console.log(`Se guardaron ${itemsFiltrados.length} items en la base de datos.`);
        return itemsFiltrados.length;
      } else {
        //console.log(`No se guardaron nuevos items porque todos fueron ignorados.`);
        return 0;
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