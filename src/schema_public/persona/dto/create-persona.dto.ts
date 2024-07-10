import { ApiProperty } from "@nestjs/swagger";

export class CreatePersonaDto {

    @ApiProperty()
    id_usuario: number;

    @ApiProperty()
    usuario: string;

    @ApiProperty()
    nombre: string;

    @ApiProperty()
    primer_apellido: string;

    @ApiProperty()
    segundo_apellido: string;

    @ApiProperty()
    cargo: string;

    @ApiProperty()
    puesto: string;

    @ApiProperty()
    id_profesion: number;

    @ApiProperty()
    registro_profesional: string;

    @ApiProperty()
    desc_cod_ue: number;    

   /* @ApiProperty()
    desc_cod_da: number;    */

    @ApiProperty()
    desc_cod_da_comision: number;    

  /*  @ApiProperty()
    nombre_da_comision: string;    */

    @ApiProperty()
    fecha_aprobacion: Date;

    @ApiProperty()
    fecha_conclusion: Date;
    
    @ApiProperty()
    fecha_vacacion_inicio: Date;
    
    @ApiProperty()
    fecha_vacacion_fin: Date;    

    @ApiProperty()
    id_permiso: number;

    @ApiProperty()
    gestion: number;  

    @ApiProperty()
    usuario_registro: number;


    @ApiProperty()
    id_estado: number;

    
}
  