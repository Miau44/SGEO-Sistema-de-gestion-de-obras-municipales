import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contrato } from './entities/contrato.entity';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { Ficha } from '../ficha/entities/ficha.entity';
import { Obra } from '../obra/entities/obra.entity';
import { ObraService } from '../obra/obra.service';
import { ResponseDto } from '../parametrica/dto/response.dto';
import { ContratoDlcDto } from './dto/contrato-dlc.dto';
import { LogService } from '../log/log.service';
import { Json } from 'sequelize/types/utils';

@Injectable()
export class ContratoService {

  constructor(
    @InjectRepository(Contrato)
    private contratoRepo: Repository<Contrato>,
    @InjectRepository(Ficha)
    private fichaRepo: Repository<Ficha>,
    @InjectRepository(Obra)
    private obraRepo: Repository<Obra>,

    @InjectRepository(Contrato)
    private contratoRepository: Repository<Contrato>,

    private readonly obraService: ObraService, // Inyección de ObraService
    private logService:LogService,
  ) { }

  private token: string | null = null;

  findAll() {
    return this.contratoRepo.find();
  }

  findOne(id: number) {
    return this.contratoRepo.findOne({ where: { id_contrato: id } });
  }

  // async create(createContratoModificatorioDto: CreateContratoModificatorioDto): Promise<ContratoModificatorio> {
  //   const contrato = this.contratoRepo.create(createContratoModificatorioDto);
  //   return await this.contratoRepo.save(contrato);
  // }

  async update(id: number, data: Partial<Contrato>) {
    await this.contratoRepo.update(id, data);
    return this.contratoRepo.findOne({ where: { id_contrato: id } });
  }

  delete(id: number) {
    return this.contratoRepo.delete(id);
  }

  async registrar_contrato_modificatorio(contratoDlc: ContratoDlcDto): Promise<ResponseDto> {
    try {
      this.saveLogs('iniciando registro...', { id_carpeta: contratoDlc.ridcodcarpeta } as any, 'OK');
      // verificar si existe la ficha en nuestra base
      const ficha = await this.fichaRepo.findOne({ where: { correlativo_carpeta: contratoDlc.ridcodcarpeta } });
      if (ficha == null) {
        let msg = `No se encontró la ficha con correlativo_carpeta: ${contratoDlc.ridcodcarpeta} en la base SGEO+`;
        let res = 'Error'
        this.saveLogs(msg, { id_carpeta: contratoDlc.ridcodcarpeta } as any, res);
        return new ResponseDto(res,0,msg);
      }

      const contrato = await this.contratoRepo.findOne({ where: { correlativo_carpeta: contratoDlc.ridcodcarpeta } });
      if (contrato != null) {
        let msg = `El contrato con cod_carpeta "${contratoDlc.ridcodcarpeta}" ya existe.`;
        let res = 'Error'
        this.saveLogs(msg, { id_carpeta: contratoDlc.ridcodcarpeta } as any, res);
        return new ResponseDto(res, 0, msg);
      }

      const montoContrato = this.limpiarMonto(contratoDlc.rmontocontrato);
      const fechaContrato = this.convertirFecha(contratoDlc.rfechacontrato);
      const obra = await this.obraRepo.findOne({ where: { id_ficha: ficha.id_ficha } });
      if (obra == null) {
        let msg = `No se encontró la obra con id_ficha: ${ficha.id_ficha} en la base SGEO+`;
        let res = 'Error'
        this.saveLogs(msg, { id_carpeta: contratoDlc.ridcodcarpeta } as any, res); 
        return new ResponseDto(res, 0, msg);
      }

      const nuevoContrato = this.contratoRepository.create({
        correlativo_carpeta: contratoDlc.ridcodcarpeta,
        cuse: contratoDlc.rcuce,
        cod_carpeta: contratoDlc.rcodporceso,
        monto_contrato: montoContrato,
        fecha_numeracion: fechaContrato,
        proponente_razon_social: contratoDlc.radjudicadocontrato,
        numero_contrato: contratoDlc.rnrocontrato,
        modalidad: contratoDlc.rmodalidad,
        tipo_contrato: contratoDlc.rtipocontrato,
        proponente_representante: contratoDlc.elreplegal,
        proponente_nit: contratoDlc.rnit,
        plazo_contrato: contratoDlc.rplazocontrato,
        id_obra: obra.id_obra,
        direccion: contratoDlc.rdomicilio,
        telefono: contratoDlc.rtelef,
        url: contratoDlc.url,
        id_contrato_dlc: Number(contratoDlc.id_contrato),
      });
      await this.contratoRepository.save(nuevoContrato);
      obra.plazo_ejecucion = contratoDlc.rplazocontrato;
      await this.obraRepo.save(obra);

      let msg = `Obra registrada correctamente`;
      let res = 'OK'
      this.saveLogs(msg, { parametros: contratoDlc } as any, res);
      return new ResponseDto(res, 0, msg);
    }
    catch (error) {
      let msg = `error en el servicio`;
      let res = 'Error'
      this.saveLogs(msg, { error } as any, res);
      return new ResponseDto('error', 0, `Error al registrar el contrato: ${error}`);
    }
  }

  formatDate(inputDate: string): Date {
    // Dividir la fecha en día, mes y año
    const [day, month, year] = inputDate.split('/').map(Number);

    // Crear un objeto Date (mes empieza en 0 en JavaScript)
    const date = new Date(year, month - 1, day);
    return date;
  }

  async obtenerToken(): Promise<any> {
    const url = process.env.URL_DLC + `auth/login`;
    const headers = {
      'Content-Type': 'application/json',
    };
    var response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        "email": "test@example.com",
        "password": "password123"
      }),
    });
    const data = await response.json();
    this.token = data.access_token;
  }

  async llenarContratosDesdeServicio(gestion: number,id_usuario:number): Promise<void> {
    console.log("gestion y usuario",gestion,id_usuario);
    try {
      const response = await fetch(process.env.URL_DLC + `consumer/reporteunodfo/${gestion}/0`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
      });
      console.log("id_usuario",id_usuario);

      const data = await response.json();

      // Verificar si hay data.data
      if (!data.data || data.data.length === 0) {
        console.log('No se encontraron datos para insertar.');
        return;
      }

      let totalContratos = 0;
      let totalUrl = 0;
      // Iterar sobre los datos y guardarlos en la base de datos
      for (const item of data.data) {

        // verificar si existe la ficha en nuestra base
        const ficha = await this.fichaRepo.findOne({ where: { correlativo_carpeta: item.ridcodcarpeta } });
        if (ficha == null) {
          console.log(`No se encontró la ficha con correlativo_carpeta: ${item.ridcodcarpeta}`);
          continue; // O manejar el error de otra manera
        }

        // verificar si existe el contrato creado en nuestra base
        const contrato = await this.contratoRepo.findOne({ where: { correlativo_carpeta: item.ridcodcarpeta } });
        if (contrato == null) { //registramos contrato
          // Limpiar y transformar los datos según sea necesario
          const montoContrato = this.limpiarMonto(item.rmontocontrato);
          const fechaContrato = this.convertirFecha(item.rfechacontrato);
          // con ese id_ficha buscar el id_obra en la tabla obra
          const obra = await this.obraRepo.findOne({ where: { id_ficha: ficha.id_ficha } });
          if (obra == null) {
            console.log(`No se encontró la obra con id_ficha: ${ficha.id_ficha}`);
            continue; // O manejar el error de otra manera
          }
          const nuevoContrato = this.contratoRepository.create({
            correlativo_carpeta: item.ridcodcarpeta,
            cuse: item.rcuce,
            cod_carpeta: item.rcodporceso,
            monto_contrato: montoContrato,
            fecha_numeracion: fechaContrato,
            proponente_razon_social: item.radjudicadocontrato,
            numero_contrato: item.rnrocontrato,
            modalidad: item.rmodalidad,
            tipo_contrato: item.rtipocontrato,
            proponente_representante: item.elreplegal,
            proponente_nit: item.rnit,
            plazo_contrato: item.rplazocontrato,
            id_contrato_dlc: item.elidcontra,
            id_obra: obra.id_obra,
            direccion: item.rdomicilio,
            telefono: item.rtelef,
            rpcrpa:item.rpcrpa,
            url: item.rlinkcontrat,
            id_estado: 1, // Activo
            fecha_registro: new Date(),
            id_usuario:id_usuario
          });
          console.log("creando  contrato, ficha " +item.ridcodcarpeta);
          await this.contratoRepository.save(nuevoContrato);

          obra.plazo_ejecucion = item.rplazocontrato;
          await this.obraRepo.save(obra);

          totalContratos++;
        }
        else { //como existe el contrato se debe verificar si la ruta no sea null tanto en la lista y el objeto
          //verify en item
          //console.log(item.rlinkcontrat, contrato.url);
          if (item.rlinkcontrat != null && contrato.url == null) {
            console.log("actualizando url, ficha " +item.ridcodcarpeta);
            
            contrato.url = item.rlinkcontrat;
            await this.contratoRepository.save(contrato);
            totalUrl++;
          }
        }
      }
      console.log('nuevos contratos:', totalContratos);
      console.log('urls actualizadas:', totalUrl);
    } catch (error) {
      console.error('Error al consumir el servicio o insertar datos:', error);
    }
  }

  async actualizarUrlContratosDesdeServicio(gestion: number): Promise<any> {
    try {
      console.log('Iniciando actualización de URLs de contratos...', gestion);

      const url = `${process.env.URL_DLC}consumer/reporteunodfo/${gestion}/0`;
      console.log('Consultando servicio externo:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
      });

      const data = await response.json();
      console.log('Respuesta del servicio:', data);

      if (data.statusCode == 500) {
        console.log('error en el servicio externo.');
        return { res: 'error', msg: data.data };
      }
      if (!data.data || data.data.length === 0) {
        console.log('No se encontraron datos en el servicio externo.');
        return { res: 'error', msg: data.data };
      }

      let contratosActualizados = 0;

      for (const item of data.data) {
        const correlativo = item.ridcodcarpeta;
        //const numeroContrato = item.rnrocontrato;
        if (!item.rlinkcontrat || item.rlinkcontrat.trim() === '') {
          console.log(`No se encontró la URL para el contrato con correlativo ${correlativo}`);
          continue;
        }
        else {
          console.log(`Se encontró la URL para el contrato con correlativo ${correlativo}, url: ${item.rlinkcontrat}`);
        }

        const contratoExistente = await this.contratoRepository.findOne({
          where: {
            correlativo_carpeta: correlativo/*,
            numero_contrato: numeroContrato,*/
          },
        });

        if (!contratoExistente) {
          console.log(`Contrato no encontrado: correlativo ${correlativo}`);
          continue;
        }

        contratoExistente.rpcrpa = item.rpcrpa; // Actualizando rpcrpa en lugar de url
        await this.contratoRepository.save(contratoExistente);
        contratosActualizados++;
      }

      console.log(`URLs actualizadas correctamente en ${contratosActualizados} contratos.`);
      return { res: 'success', msg: `URLs actualizadas correctamente en ${contratosActualizados} contratos.` };
    } catch (error) {
      console.error('Error al actualizar URLs de contratos:', error);
    }
  }

  /**
 * Limpia el monto del JSON para convertirlo en un valor numérico.
 * @param monto - Monto en formato "          10.600,00".
 * @returns El monto limpio como número.
 */
  private limpiarMonto(monto: string): number {
    return parseFloat(
      monto
        .trim() // Elimina espacios en blanco
        .replace(/\./g, '') // Elimina los puntos de separación de miles
        .replace(',', '.') // Reemplaza la coma decimal por un punto
    );
  }

  /**
   * Convierte una fecha en formato DD/MM/YYYY a un objeto Date.
   * @param fecha - Fecha en formato "DD/MM/YYYY".
   * @returns La fecha convertida en formato Date.
   */
  private convertirFecha(fecha: string): Date {
    const [dia, mes, anio] = fecha.split('/').map(Number);
    return new Date(anio, mes - 1, dia); // Mes comienza desde 0 en JavaScript
  }

  async saveLogs(mensaje:string,parametros:Json,respuesta:string){
      await this.logService.create({
      //id_usuario:0,
      parametro: JSON.stringify(parametros),
      mensaje:mensaje,
      funcionalidad: 'registrar contrato sicom',
      respuesta: respuesta,
    });
  }
}