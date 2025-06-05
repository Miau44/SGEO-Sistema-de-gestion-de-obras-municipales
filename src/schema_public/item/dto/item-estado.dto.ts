import { PartialType } from '@nestjs/mapped-types';
import { CreateItemDto } from './create-item.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ItemEstadoDto {
    @ApiProperty()
    id_item: number;

    @ApiProperty()
    id_estado: number;

    @ApiProperty()
    id_modificacion_pago: number;

    
}