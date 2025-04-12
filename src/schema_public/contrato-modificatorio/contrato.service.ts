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
      //Verificar si ya existe un contrato con el mismo cod_carpeta
      const { ridcodcarpeta } = contratoDlc;

      const ficha = await this.fichaRepo.findOne({ where: { correlativo_carpeta: ridcodcarpeta } });
      if (ficha == null) {
        return new ResponseDto('error', 0, `Error, no se encontró la ficha registrada con el cod_carpeta en la base SGEO.`);
      }

      const contrato = await this.contratoRepo.findOne({ where: { correlativo_carpeta: ridcodcarpeta } });
      if (contrato != null) {
        return new ResponseDto('error', 0, `El contrato con cod_carpeta "${ridcodcarpeta}" ya existe.`);// Si el contrato existe, retorna un error
      }

      //Consulta para obtener el id_obra de la tabla obra
      let query = `select obra.id_obra from obra where id_ficha = $1`;
      const params = [ficha.id_ficha];
      const resultado = await this.fichaRepo.query(query, params);
      if (resultado == null || resultado.length == 0) {
        return new ResponseDto('error', 0, `Error, no se encontró la obra registrada con el id_ficha.`);
      }

      //transformar el objeto contratoDlc al objeto CreateContratoDto
      const createContratoDto: CreateContratoDto = {
        correlativo_carpeta: contratoDlc.ridcodcarpeta,
        cuce: contratoDlc.rcuce,
        cod_carpeta: contratoDlc.rcodporceso,
        id_obra: resultado[0].id_obra,
        contrato_monto: parseFloat(contratoDlc.rmontocontrato),
        contrato_fecha: new Date(contratoDlc.rfechacontrato),
        nombre_rpa: contratoDlc.radjudicadocontrato,
        apellido_p_rpa: '',
        apellido_m_rpa: '',
        pmc_cod_carp_sim: '',
        rpa: '',
        contrato_numero: contratoDlc.rnrocontrato,
        id_tipo_contrato: 1,
        proponente_razon_social: contratoDlc.radjudicadocontrato,
        proponente_representante: '',
        proponente_nit: contratoDlc.rnit,
        fecha_contrato: this.formatDate(contratoDlc.rfechacontrato),
        fecha_numeracion: new Date(),
      };


      createContratoDto.id_obra = resultado[0].id_obra;
      const newContract = this.contratoRepo.create(createContratoDto);
      await this.contratoRepo.save(newContract);

      const obraActualizada = await this.obraService.actualizarEstadoSicom(resultado[0].id_obra, 2);
      console.log(obraActualizada);

      return new ResponseDto('success', 1, 'Contrato registrado correctamente');
      // const params = [contratoDlc.rcodporceso];  
      // const resultado = await this.fichaRepo.query(query, params);
    }
    catch (error) {
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


  // async registrar_contrato(createContratoModificatorioDto: CreateContratoDto): Promise<ResponseDto> {
  //   try {
  //     //Verificar si ya existe un contrato con el mismo cod_carpeta
  //     const { cod_carpeta } = createContratoModificatorioDto;
  //     const contrato = await this.contratoRepo.findOne({where: { cod_carpeta }});
  //     if (contrato!=null) {
  //       return new ResponseDto('error', 0, `El contrato con cod_carpeta "${cod_carpeta}" ya existe.`);// Si el contrato existe, retorna un error
  //     }

  //     let query = `select ficha.id_ficha,obra.id_obra from ficha inner join obra on obra.id_ficha = ficha.id_ficha where cod_carpeta = $1	`;
  //     const params = [cod_carpeta];  
  //     const resultado = await this.fichaRepo.query(query, params);   

  //     console.log(resultado,resultado.length);
  //     if(resultado==null || resultado.length==0){
  //       return new ResponseDto('error', 0, `Error, no se encontró la ficha registrada con el cod_carpeta.`);
  //     }

  //     createContratoModificatorioDto.id_obra=resultado[0].id_obra;
  //     const newContract = this.contratoRepo.create(createContratoModificatorioDto);
  //     await this.contratoRepo.save(newContract);

  //     const obraActualizada = await this.obraService.actualizarEstadoSicom(resultado[0].id_obra, 2);
  //     console.log(obraActualizada);

  //     return new ResponseDto('success', 1, 'Contrato registrado correctamente');

  //   } catch (error) {
  //     return new ResponseDto('error', 0, `Error al registrar el contrato: ${error}`);
  //   }
  // }

  async obtenerToken(): Promise<any> {
    const url = process.env.URL_DLC+`auth/login`;
    const headers = {
      'Content-Type': 'application/json',
    };
    var response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        "email":"test@example.com",
        "password":"password123"
    }),});
    const data = await response.json();
    console.log(data);
    this.token = data.access_token;
  }

  async llenarContratosDesdeServicio(gestion:number): Promise<void> {
    try {
      console.log('Iniciando el proceso de llenado de la base de datos...');

      // Consumir el servicio externo
      console.log(process.env.URL_DLC+'consumer/reporteunodfo/'+gestion);
      
      const response = await fetch(process.env.URL_DLC+'consumer/reporteunodfo/2025', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
      });
      console.log(response.body);


      const data = await response.json();
      console.log('Datos recibidos del servicio:', data.statusCode);

      // Verificar si hay data.data
      if (!data.data || data.data.length === 0) {
        console.log('No se encontraron datos para insertar.');
        return;
      }

      // Iterar sobre los datos y guardarlos en la base de datos
      for (const item of data.data) {
        // Limpiar y transformar los datos según sea necesario
        const montoContrato = this.limpiarMonto(item.rmontocontrato);
        const fechaContrato = this.convertirFecha(item.rfechacontrato);

        // Crear una nueva instancia de Contrato
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
          id_contrato_dlc:item.elidcontra
        });

        // Guardar el registro en la base de datos
        await this.contratoRepository.save(nuevoContrato);
      }
      console.log('Datos insertados correctamente');
    } catch (error) {
      console.error('Error al consumir el servicio o insertar datos:', error);
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
}