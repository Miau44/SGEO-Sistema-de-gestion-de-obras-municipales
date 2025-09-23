import { ApiProperty } from '@nestjs/swagger';

export class ReporteActaDto{

    @ApiProperty()
    fecha_inicio: Date;

    @ApiProperty()
    fecha_fin: Date;

    @ApiProperty()
    estado: string;

}