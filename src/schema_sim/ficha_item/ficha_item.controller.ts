import { Controller, Post, Body } from '@nestjs/common';
import { ficha_itemService } from './ficha_item.service';
import { Public } from 'src/common/decorators/public.decorator';
import { CreateFichaDto } from '../../schema_public/ficha/dto/create-ficha.dto';
import { CreateObraDto } from '../../schema_public/obra/dto/create-obra.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateFichaItemDto } from './dto/ficha-item.dto';
import { error } from 'console';
import { QueryFailedError } from 'typeorm';

@ApiTags('ficha-item') // Etiqueta para agrupar en Swagger
@Controller('ficha-item')
export class FichaItemController {
  constructor(private readonly ficha_itemService: ficha_itemService) {}

  @ApiOperation({ summary: 'Crear una nueva Ficha y Obra' })
  @Post()
  //@ApiResponse({ status: 201, description: 'Ficha and Obra created successfully.' })
  async create(@Body() body: CreateFichaItemDto) {


        //
        const createFichaDto: CreateFichaDto = {
            desc_cod_ue: body.desc_cod_ue,
            nombre_ue: body.nombre_ue,
            cod_poa: body.cod_poa,
            correlativo_carpeta: body.correlativo_carpeta,
            desc_carpeta: body.desc_carpeta,
            cod_estado_carpeta: body.cod_estado_carpeta,
            fecha_validacion_carpeta: body.fecha_validacion_carpeta,
            total_carpeta: body.total_carpeta,
            cod_carpeta: body.cod_carpeta,
            cod_prioridad_carpeta: body.cod_prioridad_carpeta,
            gestion_carpeta: body.gestion_carpeta,
            cod_carpeta_anterior: body.cod_carpeta_anterior,
            continuidad: body.continuidad,
            desc_zona_carpeta: body.desc_zona_carpeta,
            desc_distrito_carpeta: body.desc_distrito_carpeta,
            desc_macrodistrito_carpeta: body.desc_macrodistrito_carpeta,
            id_tipo_obra: body.id_tipo_obra,
            id_modalidad: body.id_modalidad,
            usuario_registro: 0, //Asignar el usuario de registro según tu lógica
            id_estado: 1, //Asignar el estado según tu lógica
        };

        const createObraDto: CreateObraDto = {
            id_tipo_obra : body.id_tipo_obra,
            id_ficha:0,
            id_modalidad:body.id_modalidad,
            usuario_registro:0,
            id_estado:1,
            id_estado_general:0
        };
        
    
    try {
        await this.ficha_itemService.importarFicha(createFichaDto,createObraDto,body.item_st,body.documentos_st); 
        return { message: 'Ficha, Obra, Items y Documentos creados exitosamente' };
    } catch (error) {
        if (error instanceof QueryFailedError) {
            // Si el error es de tipo QueryFailedError
            console.error('Error de la base de datos:', error.message);
            
            // Puedes retornar un mensaje más amigable para el cliente
            return {
              message: 'Error al insertar datos en la base de datos',
              details: error.message
            };
          } else {
            console.error('Error general:', error);
            return {
              message: 'Ha ocurrido un error inesperado',
              details: error
            };
          }
    }
}
}


//, createObraDto, items, documentos