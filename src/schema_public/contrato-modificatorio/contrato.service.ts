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
import { ResponseService } from 'src/response.service';

@Injectable()
export class ContratoService {

  constructor(
    private responseService: ResponseService,
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

  async llenarContratosDesdeServicio(gestion: number, id_usuario: number): Promise<any> {
  // console.log('Gestión:', gestion, '| Usuario:', id_usuario);

  const resultado = {
    nuevos: 0,
    actualizados: 0,
    sinFicha: [] as number[],
    sinObra: [] as number[],
    procesados: 0,
  };

  try {
    const url = `${process.env.URL_DLC}consumer/reporteunodfo/${gestion}/0`;
    // console.log('Consultando URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
    });

    const data = await response.json();

    if (!data?.data || data.data.length === 0) {
      // console.log(' No se encontraron datos en el servicio externo.');
      return { message: 'Sin datos para insertar' };
    }

    // console.log(` Registros recibidos: ${data.data.length}`);
    resultado.procesados = data.data.length;

    for (const item of data.data) {
      const correlativo = item.ridcodcarpeta;

      const ficha = await this.fichaRepo.findOne({ where: { correlativo_carpeta: correlativo } });
      if (!ficha) {
        resultado.sinFicha.push(correlativo);
        continue;
      }

      const contrato = await this.contratoRepo.findOne({ where: { correlativo_carpeta: correlativo } });
      if (!contrato) {
        const obra = await this.obraRepo.findOne({ where: { id_ficha: ficha.id_ficha } });
        if (!obra) {
          resultado.sinObra.push(correlativo);
          continue;
        }

        const nuevoContrato = this.contratoRepository.create({
          correlativo_carpeta: correlativo,
          cuse: item.rcuce,
          cod_carpeta: item.rcodporceso,
          monto_contrato: this.limpiarMonto(item.rmontocontrato),
          fecha_numeracion: this.convertirFecha(item.rfechacontrato),
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
          rpcrpa: item.rpcrpa,
          tipo_rpcrpa: item.tiporpcrpa,
          url: item.rlinkcontrat,
          id_estado: 1,
          fecha_registro: new Date(),
          id_usuario,
        });

        await this.contratoRepository.save(nuevoContrato);
        obra.plazo_ejecucion = item.rplazocontrato;
        await this.obraRepo.save(obra);

        resultado.nuevos++;
      } else if (item.rlinkcontrat && !contrato.url) {
        contrato.url = item.rlinkcontrat;
        await this.contratoRepository.save(contrato);
        resultado.actualizados++;
      }
    }

    return {
      nuevos: resultado.nuevos,
      actualizados: resultado.actualizados,
      sinFicha: resultado.sinFicha,
      sinObra: resultado.sinObra,
      procesados: resultado.procesados,
    };
  } catch (error) {
    console.error(' Error al consumir el servicio o insertar datos:', error);
    return { status: 'error', message: (error as any).message };
  }
}


async llenarContratosDesdeServicioPorCodCarpeta(
  gestion: number,
  id_usuario: number,
  codcarpetaOpcional: number
): Promise<any> {
  // console.log('=== Iniciando llenado de contratos desde servicio externo ===');
  // console.log('Gestión:', gestion);
  // console.log('ID Usuario:', id_usuario);
  // console.log('Correlativo (ridcodcarpeta):', codcarpetaOpcional);

  const resultado = {
    nuevos: 0,
    actualizados: 0,
    sinFicha: [] as number[],
    sinObra: [] as number[],
    procesados: 0,
  };

  try {
    const url = `${process.env.URL_DLC}consumer/reporteunodfo/${gestion}/${codcarpetaOpcional}`;
    // console.log('Consultando servicio externo en:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
    });

    const data = await response.json();

    if (!data?.data || data.data.length === 0) {
      console.log('No se encontraron datos en el servicio externo.');
      return { message: 'Sin datos para insertar' };
    }

    // console.log('Total de registros recibidos:', data.data.length);

    const contratoFiltrado = data.data.filter(
      (item: any) => Number(item.ridcodcarpeta) === Number(codcarpetaOpcional)
    );

    if (contratoFiltrado.length === 0) {
      console.log('No se encontró ningún registro con ridcodcarpeta =', codcarpetaOpcional);
      return { message: `No se encontró el contrato con ridcodcarpeta ${codcarpetaOpcional}` };
    }

    // console.log('Registros encontrados con ese ridcodcarpeta:', contratoFiltrado.length);
    resultado.procesados = contratoFiltrado.length;

    for (const item of contratoFiltrado) {
      const correlativo = item.ridcodcarpeta;
      // console.log('Procesando correlativo:', correlativo);

      const ficha = await this.fichaRepo.findOne({ where: { correlativo_carpeta: correlativo } });
      if (!ficha) {
        console.log('Sin ficha para correlativo', correlativo);
        resultado.sinFicha.push(correlativo);
        continue;
      }

      const contrato = await this.contratoRepo.findOne({ where: { correlativo_carpeta: correlativo } });
      if (!contrato) {
        const obra = await this.obraRepo.findOne({ where: { id_ficha: ficha.id_ficha } });
        if (!obra) {
          console.log('Sin obra asociada a la ficha', ficha.id_ficha);
          resultado.sinObra.push(correlativo);
          continue;
        }

        // console.log('Creando nuevo contrato para correlativo', correlativo);

        const nuevoContrato = this.contratoRepository.create({
          correlativo_carpeta: correlativo,
          cuse: item.rcuce,
          cod_carpeta: item.rcodporceso,
          monto_contrato: this.limpiarMonto(item.rmontocontrato),
          fecha_numeracion: this.convertirFecha(item.rfechacontrato),
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
          rpcrpa: item.rpcrpa,
          tipo_rpcrpa: item.tiporpcrpa,
          url: item.rlinkcontrat,
          id_estado: 1,
          fecha_registro: new Date(),
          id_usuario,
        });

        await this.contratoRepository.save(nuevoContrato);
        obra.plazo_ejecucion = item.rplazocontrato;
        await this.obraRepo.save(obra);

        // console.log('Contrato guardado correctamente para correlativo', correlativo);
        resultado.nuevos++;
      } else if (item.rlinkcontrat && !contrato.url) {
        contrato.url = item.rlinkcontrat;
        await this.contratoRepository.save(contrato);
        // console.log('URL actualizada para correlativo', correlativo);
        resultado.actualizados++;
      } else {
        console.log('Contrato existente sin cambios para correlativo', correlativo);
      }
    }

    // console.log('--------------------------------------');
    // console.log('Resumen del proceso:');
    // console.log('Nuevos contratos:', resultado.nuevos);
    // console.log('URLs actualizadas:', resultado.actualizados);
    // console.log('Sin ficha:', resultado.sinFicha.length, '-', resultado.sinFicha);
    // console.log('Sin obra:', resultado.sinObra.length, '-', resultado.sinObra);
    // console.log('Total procesados:', resultado.procesados);
    // console.log('--------------------------------------');

    return {
      status: 'ok',
      ...resultado,
    };
  } catch (error) {
    console.error('Error al consumir el servicio o insertar datos:', error);
    return { status: 'error', message: (error as any).message };
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
        contratoExistente.tipo_rpcrpa = item.tiporpcrpa; // actualizar tipo_rpcrpa

        await this.contratoRepository.save(contratoExistente);
        contratosActualizados++;
      }

      console.log(`URLs actualizadas correctamente en ${contratosActualizados} contratos.`);
      return { res: 'success', msg: `URLs actualizadas correctamente en ${contratosActualizados} contratos.` };
    } catch (error) {
      console.error('Error al actualizar URLs de contratos:', error);
    }
  }

    public async consultarContrato(correlativo_carpeta: number,gestion:number): Promise<any> {
    //OBTENER PARAMETROS DE URL DESDE .env
    const url_sim = process.env.URL_SIM2;
    const url = `${process.env.URL_DLC}consumer/reporteunodfo/${gestion}/${correlativo_carpeta}`;
    console.log('Consultando servicio externo:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
    });

    const data = await response.json();
    console.log(data);
    
    if(data.statusCode==200){
      return data;
    }
    else{
      return this.responseService.error('ERROR','No se encontraron datos.',500);
    }
  };
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