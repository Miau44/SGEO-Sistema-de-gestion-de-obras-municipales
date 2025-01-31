import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { ComputoPlanillaService } from './computo_planilla.service';
import { CreateComputoDto } from './dto/create-computo.dto';
import { UpdateComputoDto } from './dto/update-computo.dto';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { ComputoObra } from './dto/computo-obra.dto';

import { ComputoItem } from './dto/computo-Item.dto';
import { UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile } from '@nestjs/common';
import { Any } from 'typeorm';
import { ComputoImportarDto } from './dto/computo-importar.dto';
import { FormDataInterceptor } from './formData.interceptor';
import multer from 'multer';
import { error } from 'console';

@ApiTags('computo-planilla')
@Controller('computo-planilla')
export class ComputoPlanillaController {
  constructor(private readonly computoPlanillaService: ComputoPlanillaService) {}

  @Public()
  @Post('create-computo')
  async  create(@Body() createComputoPlanillaDto: CreateComputoDto) {
    return this.computoPlanillaService.create(createComputoPlanillaDto);
  }

  @Public()    
  @Get()
  findAll() {
    return this.computoPlanillaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.computoPlanillaService.findOne(+id);
  }

  @Public()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateComputoPlanillaDto: UpdateComputoDto) {
    try{
    return this.computoPlanillaService.update(+id, updateComputoPlanillaDto);
    }catch {error}
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    try{    
    return this.computoPlanillaService.remove(+id);
  }catch {error}    
  }



  @Public()
  @Post('computo-lista')
  listaItem(@Body() computoObraDto: ComputoObra) {
    try {  
      return this.computoPlanillaService.listaItemComputoXObra(computoObraDto);
    } catch (error) {
    }
  }

  @Public()
  @Post('computo-x-item')
  listaComputoItem(@Body() computoItemDto: ComputoItem) {
    try {  
      return this.computoPlanillaService.listaComputoXItem(computoItemDto);
    } catch (error) {
    }
  }

  @Public()
  @Get('tipo_computo/:id')
  getTipoComputo(@Param('id') id: string) {
    return this.computoPlanillaService.getTipoComputo(+id);
  }


  @Public()
  @Post('computo-exportar-excel')
  exportarComputos(@Body() computoObra: ComputoObra) {
    try {  
      return this.computoPlanillaService.descargarComputosMetricos(computoObra);
    } catch (error) {
    }
  }  

  @Post('computo-importar-excel')
  @UseInterceptors(FileInterceptor('file'))
  async importarExcel(@UploadedFile() file: Express.Multer.File, 
  @Body() body: {id_usuario: 'id_usuario', id_modificacion:'id_modificacion', id_tipo_computo:'id_tipo_computo'},)
  { 

    try {
 
      console.log('body', body.id_modificacion);
      
      if (!file) {
        throw new HttpException('No se ha subido ningún archivo', HttpStatus.BAD_REQUEST);
      }
      const resultado = await this.computoPlanillaService.procesarYGuardarExcel(file, body);

      if (!resultado.success) {
        return {
          success: resultado.success,
          message: resultado.message,
          errors:resultado.errores || [], 
          datos: body,
        };
      }
      return {
        success: true,
        message: resultado.message,
      };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Error interno al procesar el archivo',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  
 /* @UseInterceptors(FileInterceptor('file'))
  async importarExcel(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new HttpException('No se ha subido ningún archivo', HttpStatus.BAD_REQUEST);
      }
      // Procesar el archivo
      const resultado = await this.computoPlanillaService.procesarYGuardarExcel(file);
      return {
        success: true,
        message: 'Archivo procesado correctamente.',
        data: resultado,
      };
    } catch (error:any) {
      throw new HttpException(
        error.message || 'Error al procesar el archivo',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }*/


  
 


  ///////////////////////CRITERIO/////////////////////////

  @Public()
  @Get('criterio-lista')
  findAllCriterio() {
    try {
      return this.computoPlanillaService.findAllCriterio();
    } catch (error) {
    }    
  }  
}
