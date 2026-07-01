import { PartialType } from '@nestjs/mapped-types';
import { CreateItemDto } from './create-item.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ItemEstadoAvanceDto {

    @ApiProperty()
    id_item_avance: number;

}