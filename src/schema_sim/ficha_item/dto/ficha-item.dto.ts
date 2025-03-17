import { ApiProperty } from '@nestjs/swagger';
import { CreateFichaDto } from './../../../schema_public/ficha/dto/create-ficha.dto';
import { CreateObraDto } from './../../../schema_public/obra/dto/create-obra.dto';

export class CreateFichaItemDto {

    @ApiProperty()
    desc_cod_ue: number;
    
    @ApiProperty()
    nombre_ue: string;
    
    @ApiProperty()
    cod_poa: number;
    
    @ApiProperty()
    correlativo_carpeta: number;
    
    @ApiProperty()
    id_carpeta: number;

    @ApiProperty()  // carpeta
    desc_carpeta: string;
    
    @ApiProperty()
    cod_estado_carpeta: number;
    
    @ApiProperty()
    fecha_validacion_carpeta: Date;
    
    @ApiProperty()
    total_carpeta: number;
    
    @ApiProperty()
    cod_carpeta: string;
    
    @ApiProperty()
    cod_prioridad_carpeta: number;
    
    @ApiProperty()
    gestion_carpeta: number;
    
    @ApiProperty()
    cod_carpeta_anterior: number;
    
    @ApiProperty()
    continuidad: number;
    
    @ApiProperty()
    desc_zona_carpeta: string;
    
    @ApiProperty()
    desc_distrito_carpeta: string;
    
    @ApiProperty()
    desc_macrodistrito_carpeta: string;
    
    @ApiProperty()
    id_tipo_obra: number;

    @ApiProperty()
    id_modalidad: number;
//==============================================
    @ApiProperty() 
    items_st: string;

    @ApiProperty() 
    documentos_st: string;
}
