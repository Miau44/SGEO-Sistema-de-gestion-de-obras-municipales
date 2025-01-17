import { PartialType } from '@nestjs/mapped-types';
import { CreateItemDto } from './create-item.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ItemObra {
    @ApiProperty({ required: false })
    id_obra: number;

    @ApiProperty({ required: false })
    id_tipo_item: number;


    
}