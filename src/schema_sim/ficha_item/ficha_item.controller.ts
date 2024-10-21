import { Controller, Post, Body } from '@nestjs/common';
import { ficha_itemService } from './ficha_item.service';
import { Public } from 'src/common/decorators/public.decorator';
import { CreateFichaDto } from '../../schema_public/ficha/dto/create-ficha.dto';
import { CreateObraDto } from '../../schema_public/obra/dto/create-obra.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateFichaItemDto } from './dto/ficha-item.dto';
import { error } from 'console';

@ApiTags('ficha-item') // Etiqueta para agrupar en Swagger
@Controller('ficha-item')
export class FichaItemController {
  constructor(private readonly ficha_itemService: ficha_itemService) {}

  @ApiOperation({ summary: 'Crear una nueva Ficha y Obra' })
  @Post()
  //@ApiResponse({ status: 201, description: 'Ficha and Obra created successfully.' })
  async create(@Body() body: CreateFichaItemDto) {
    const createFichaDto = body.ficha;
    const createObraDto = body.obra;
    const items = body.item_st; // Aquí manejar los items
    const documentos = body.documentos_st; // Aquí manejar los documentos
    
    try {
        await this.ficha_itemService.importarFicha(createFichaDto, createObraDto, items, documentos);
        return { message: 'Ficha, Obra, Items y Documentos creados exitosamente' };
    } catch (er) {
        // Manejo de errores
        console.log(er);
        return { message: er };
    }
}
}
