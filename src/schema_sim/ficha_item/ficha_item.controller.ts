import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ficha_itemService } from './ficha_item.service';
import { Public } from 'src/common/decorators/public.decorator';
import { CreateFichaDto } from '../../schema_public/ficha/dto/create-ficha.dto';
import { CreateObraDto } from '../../schema_public/obra/dto/create-obra.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateFichaItemDto } from './dto/ficha-item.dto';
import { error } from 'console';
import { IsNull, QueryFailedError } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';
import { json } from 'sequelize';

@ApiTags('ficha-item') // Etiqueta para agrupar en Swagger
@Controller('ficha-item')
export class FichaItemController {
  constructor(private readonly ficha_itemService: ficha_itemService) { }

  //@UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Crear una nueva Ficha y Obra' })
  @Post()
  //@ApiResponse({ status: 201, description: 'Ficha and Obra created successfully.' })
  async create(@Body() body: CreateFichaItemDto) {
    console.log(body);

    const createFichaDto: CreateFichaDto = {
      desc_cod_ue: body.desc_cod_ue,
      nombre_ue: body.nombre_ue,
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
      usuario_registro: 1321, //Asignar el usuario de registro según tu lógica
      id_estado: 1
    };
    console.log(createFichaDto);

    const createObraDto: CreateObraDto = {
      id_tipo_obra: body.id_tipo_obra,
      id_ficha: 0,
      id_modalidad: body.id_modalidad,
      anticipo: false,
      procede: 0,
      fecha_pago_anticipo: null,
      usuario_registro: 0,
      id_estado: 1,
      id_estado_general: 1
    };

    try {
      await this.ficha_itemService.importarFicha(createFichaDto, createObraDto, body.items_st, body.documentos_st);
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
          message: 'Ha ocurrido un error inesperado', error,
          details: error
        };
      }
    }
  }

  @Post('cargadoFichaItem')
  @Public()
  @ApiOperation({ summary: 'cargado de fichas e items' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        gestion: { type: 'number', example: 2025 },
        id_usuario: { type: 'number', example: 3984 },
      },
      required: ['gestion', 'id_usuario'],
    },
  })
  async cargadoFichaItem(@Body() body: { gestion: number, id_usuario: number }) { //añadir parametro de entrada a servicio test, gestion
    //validar que el id_usuario no sea nulo

    if (body == null) {
      console.error('Error: id_usuario es nulo');
      return { message: 'error', error: 'id_usuario es nulo' };
    }
    const { gestion, id_usuario } = body;
    //validar que la gestion no sea nulo y mayor a 2020
    if (gestion == null && gestion > 2020) {
      console.error('Error: gestion es nulo');
      return { message: 'error', error: 'gestion es nulo' };
    }
    const token = await this.ficha_itemService.obtenerToken();
    return await this.ficha_itemService.obtenerUes(gestion, id_usuario);
  }

  @Post('cargadoFichaItemPorCorrelativo')
  @Public()
  @ApiOperation({ summary: 'cargado de fichas e items' })
  async cargadoFichaItemPorCorrelativo(@Body() body: { correlativo_carpeta: number, id_usuario: number }) { //añadir parametro de entrada a servicio test, gestion
    //validar que el id_usuario no sea nulo

    if (body == null) {
      console.error('Error: id_usuario es nulo');
      return { message: 'error', error: 'id_usuario es nulo' };
    }
    const { correlativo_carpeta, id_usuario } = body;
    console.log(correlativo_carpeta, id_usuario);
    //validar que la gestion no sea nulo y mayor a 2020
    if (correlativo_carpeta == null) {
      console.error('Error: gestion es nulo');
      return { message: 'error', error: 'gestion es nulo' };
    }

    const r = this.ficha_itemService.obtenerToken();
    r.then((result) => {
      //return { message: 'Test successful' };
      console.log(correlativo_carpeta, id_usuario);

      const s = this.ficha_itemService.obtenerFichaporCorrelativo(correlativo_carpeta, id_usuario);
      s.then((result) => {
        console.log({ res: "OK" });
        //retornar un json con el resultado de la consulta
        return { message: 'Test successful', result };
      }).catch((error) => {
        console.error('Error:', error);
        return { message: 'Test error' };
      });
    }).catch((error) => {
      console.error('Error:', error);
      return { message: 'Test error' };
    });
  }

  @Post('verificarFicha')
  @Public()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        correlativo_carpeta: { type: 'number', example: 304582 },
        gestion: { type: 'number', example: 2025 },
        id_usuario: { type: 'number', example: 3984 },
        actualizar: { type: 'boolean', example: false }
      },
      required: ['gestion', 'id_usuario'],
    },
  })
  @ApiOperation({ summary: 'verificar si hay cambios en la ficha' })
  async verificarFicha(@Body() body: { correlativo_carpeta: number, id_usuario: number, gestion: number, actualizar?: boolean }) { //añadir parametro de entrada a servicio test, gestion

    //validar que el id_usuario no sea nulo 
    if (body == null) {
      //console.error('Error: id_usuario es nulo');
      return { message: 'error', error: 'id_usuario es nulo' };
    }
    const { correlativo_carpeta, id_usuario, gestion, actualizar } = body;
    //console.log(correlativo_carpeta, id_usuario);
    //validar que la gestion no sea nulo y mayor a 2020
    if (correlativo_carpeta == null) {
      //console.error('Error: correlativo_carpeta es nulo');
      return { message: 'error', error: 'correlativo_carpeta es nulo' };
    }
    try {
      const token = await this.ficha_itemService.obtenerToken();
      //console.log(token);

      return await this.ficha_itemService.verificarFicha(correlativo_carpeta, id_usuario, gestion, actualizar);

      // console.log({ correlativo_carpeta, id_usuario });
      // console.log({ res: 'OK' });

      // return { message: 'Test successful', result };
    } catch (error) {
      //console.error('Error:', error);
      return { message: 'Test error', error: error || error };
    }

    const r = this.ficha_itemService.obtenerToken();
    r.then(async (result) => {
      //return { message: 'Test successful' };
      console.log(correlativo_carpeta, id_usuario);
      var response = await this.ficha_itemService.verificarFicha(correlativo_carpeta, id_usuario, gestion, actualizar);
      console.log(response);
      return { message: 'OK', response };
    }
    ).catch((error) => {
      console.error('Error:', error);
      return { message: 'Test error' };
    });
  }

  @Post('ActualizacionItemPorCorrelativo')
  @Public()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        correlativo_carpeta: { type: 'number', example: 3315208 },
        id_usuario: { type: 'number', example: 3984 },
      },
      required: ['correlativo_carpeta', 'id_usuario'],
    },
  })
  @ApiOperation({ summary: 'cargado de fichas e items' })
  async ActualizacionItemPorCorrelativo(@Body() body: { correlativo_carpeta: number, id_usuario: number }) { //añadir parametro de entrada a servicio test, gestion
    //validar que el id_usuario no sea nulo
    if (body == null) {
      console.error('Error: id_usuario es nulo');
      return { message: 'error', error: 'id_usuario es nulo' };
    }
    const { correlativo_carpeta, id_usuario } = body;
    //validar que la gestion no sea nulo y mayor a 2020
    if (correlativo_carpeta == null) {
      console.error('Error: gestion es nulo');
      return { message: 'error', error: 'gestion es nulo' };
    }

    try {
      const token = await this.ficha_itemService.obtenerToken();
      const result = await this.ficha_itemService.ActualizacionItemPorCorrelativo(correlativo_carpeta, id_usuario);

      console.log({ correlativo_carpeta, id_usuario });
      console.log({ res: 'OK' });

      return { message: 'Test successful', result };
    } catch (error) {
      console.error('Error:', error);
      return { message: 'Test error', error: error || error };
    }
  }
}