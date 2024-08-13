import { Injectable } from '@nestjs/common';
import { CreateTipoDocumentoDto } from './dto/create-tipo_documento.dto';
import { UpdateTipoDocumentoDto } from './dto/update-tipo_documento.dto';
import { ResponseService } from 'src/response.service';
import { TipoDocumento } from './entities/tipo_documento.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { And, Any, Not, Repository } from 'typeorm';


@Injectable()
export class TipoDocumentoService {
  constructor(
    @InjectRepository(TipoDocumento) private tipoDocRepositorio: Repository<TipoDocumento>,
    private responseService: ResponseService

  ) { }  
  create(createTipoDocumentoDto: CreateTipoDocumentoDto) {
    return 'This action adds a new tipoDocumento';
  }

  async findAll() {
    try {
  /*    const resultado  = await this.tipoDocRepositorio.find({
        order: {
          id_tipo_documento: 'DESC',
        },
      });*/
      const query = `
       SELECT  td.id_tipo_documento, td.desc_tipo_documento, sub.desc_subtipo AS sistema, 
 td.id_subtipo_documento, td.id_etapa_documento,
 d.fecha_registro, d.usuario_registro 
    FROM  tipo_documento as td
    INNER JOIN (SELECT id_subtipo, desc_subtipo FROM parametrica WHERE id_tipo=11 ) sub ON td.id_subtipo_documento = sub.id_subtipo
	LEFT OUTER JOIN documento as d ON td.id_tipo_documento=d.id_tipo_documento
    ORDER BY 
    td.id_tipo_documento ASC;`;
    //const params = [id_estado_gral, id_obra];  
   const resultado = await this.tipoDocRepositorio.query(query);  

    return this.responseService.success(resultado, "Listado Correctamente.")

  } catch (error) {
    return this.responseService.error(error);
  }



  }

  findOne(id: number) {
    return `This action returns a #${id} tipoDocumento`;
  }

  update(id: number, updateTipoDocumentoDto: UpdateTipoDocumentoDto) {
    return `This action updates a #${id} tipoDocumento`;
  }

  remove(id: number) {
    return `This action removes a #${id} tipoDocumento`;
  }
}
