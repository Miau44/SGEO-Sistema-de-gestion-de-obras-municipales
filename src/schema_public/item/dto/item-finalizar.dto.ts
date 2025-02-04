import { PartialType } from '@nestjs/mapped-types';
import { CreateItemDto } from './create-item.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ItemFinalizarDto {
    @ApiProperty()
    id_obra: number;


    
}