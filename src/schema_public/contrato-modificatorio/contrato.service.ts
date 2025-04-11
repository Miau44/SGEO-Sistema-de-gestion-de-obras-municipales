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
    private readonly obraService: ObraService, // Inyección de ObraService
  ) {}

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

  async registrar_contrato_modificatorio(contratoDlc:ContratoDlcDto): Promise<ResponseDto> {
    try{
      //Verificar si ya existe un contrato con el mismo cod_carpeta
      const { ridcodcarpeta } = contratoDlc;

      const ficha = await this.fichaRepo.findOne({where: { correlativo_carpeta: ridcodcarpeta }});
      if (ficha==null) {
        return new ResponseDto('error', 0, `Error, no se encontró la ficha registrada con el cod_carpeta en la base SGEO.`);
      }

      const contrato = await this.contratoRepo.findOne({where: { correlativo_carpeta: ridcodcarpeta }});
      if (contrato!=null) {
        return new ResponseDto('error', 0, `El contrato con cod_carpeta "${ridcodcarpeta}" ya existe.`);// Si el contrato existe, retorna un error
      }

      //Consulta para obtener el id_obra de la tabla obra
      let query = `select obra.id_obra from obra where id_ficha = $1`;
      const params = [ficha.id_ficha];
      const resultado = await this.fichaRepo.query(query, params);
      if(resultado==null || resultado.length==0){
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

      
      createContratoDto.id_obra=resultado[0].id_obra;
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
}