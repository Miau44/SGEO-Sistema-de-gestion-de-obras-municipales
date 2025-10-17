import { ApiProperty } from '@nestjs/swagger';

export class ReporteFiscalDFO{

    @ApiProperty()
    fecha_inicio: Date;

    @ApiProperty()
    fecha_fin: Date;

}