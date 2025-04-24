import { ApiProperty } from "@nestjs/swagger";

export class UsuarioPermisoXUeDto {

    @ApiProperty({ type: [Number], description: 'Array de IDs' })
    id_permiso: number[];
    //paola
//no es tan necesario despues de que las personas pueden ser pertenecer a una o otra ue
    @ApiProperty({required:false})
    desc_cod_ue: number;

    @ApiProperty()
    obra: number;    

    @ApiProperty({required:false})
    gestion: number;        


}
