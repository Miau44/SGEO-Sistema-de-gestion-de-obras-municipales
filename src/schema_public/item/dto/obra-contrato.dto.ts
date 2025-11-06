import { PartialType } from '@nestjs/mapped-types';
import { CreateItemDto } from './create-item.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ItemObraContratoDto {
    @ApiProperty()
    id_obra: number;    
}