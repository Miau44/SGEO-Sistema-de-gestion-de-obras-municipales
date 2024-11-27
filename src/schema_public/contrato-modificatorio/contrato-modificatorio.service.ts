import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContratoModificatorio } from './entities/contrato-modificatorio.entity';
import { CreateContratoModificatorioDto } from './dto/create-contrato-modificatorio.dto';
import { Ficha } from '../ficha/entities/ficha.entity';
import { Obra } from '../obra/entities/obra.entity';
import { ResponseDto } from './../parametrica/dto/response.dto';

@Injectable()
export class ContratoModificatorioService {
  constructor(
    @InjectRepository(ContratoModificatorio)
    private contratoRepo: Repository<ContratoModificatorio>,
    @InjectRepository(Ficha)
    private fichaRepo: Repository<Ficha>,
    @InjectRepository(Obra)
    private obraRepo: Repository<Obra>,
  ) {}

  findAll() {
    return this.contratoRepo.find();
  }

  findOne(id: number) {
    return this.contratoRepo.findOne({ where: { id_contrato_modificatorio: id } });
  }

  // async create(createContratoModificatorioDto: CreateContratoModificatorioDto): Promise<ContratoModificatorio> {
  //   const contrato = this.contratoRepo.create(createContratoModificatorioDto);
  //   return await this.contratoRepo.save(contrato);
  // }

  async update(id: number, data: Partial<ContratoModificatorio>) {
    await this.contratoRepo.update(id, data);
    return this.contratoRepo.findOne({ where: { id_contrato_modificatorio: id } });
  }

  delete(id: number) {
    return this.contratoRepo.delete(id);
  }

  async registrar_contrato(createContratoModificatorioDto: CreateContratoModificatorioDto): Promise<ResponseDto> {
    console.log("registrar_contrato");
    
    try {
      //Verificar si ya existe un contrato con el mismo cod_carpeta
      const { cod_carpeta } = createContratoModificatorioDto;
      const contrato = await this.contratoRepo.findOne({where: { cod_carpeta }});
      if (contrato!=null) {
        return new ResponseDto('error', 0, `El contrato con cod_carpeta "${cod_carpeta}" ya existe.`);// Si el contrato existe, retorna un error
      }
      
      let query = `select ficha.id_ficha,obra.id_obra from ficha inner join obra on obra.id_ficha = ficha.id_ficha where cod_carpeta = $1	`;
      
      const params = [cod_carpeta];  
      const resultado = await this.fichaRepo.query(query, params);   

      console.log(resultado,resultado.length);
      if(resultado==null || resultado.length==0){
        return new ResponseDto('error', 0, `Error, no se encontró la ficha registrada con el cod_carpeta.`);
      }

      createContratoModificatorioDto.id_obra=resultado[0].id_obra;
      const newContract = this.contratoRepo.create(createContratoModificatorioDto);
      await this.contratoRepo.save(newContract);
      return new ResponseDto('success', 1, 'Contrato registrado correctamente');

    } catch (error) {
      return new ResponseDto('error', 0, `Error al registrar el contrato: ${error}`);
    }
  }

  //async registrar_contrato(createContratoModificatorioDto: CreateContratoModificatorioDto): Promise<> {
  //   const ficha = await this.fichaRepo.findOne({
  //     where: { cod_carpeta: 'EMA-87-2024' },
  //     select: ['id_ficha'], 
  //   });

  //   console.log(ficha);
  //   return ficha ? { id_ficha: ficha.id_ficha } : null;
  // }
}