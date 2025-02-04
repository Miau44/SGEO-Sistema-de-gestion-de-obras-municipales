import { ApiProperty } from '@nestjs/swagger';

export class ComputoItem{
    @ApiProperty()
    id_item: number;

    @ApiProperty()
    id_modificacion: number;    

}