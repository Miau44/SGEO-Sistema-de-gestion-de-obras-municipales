import { ApiProperty } from "@nestjs/swagger";

export class UsuarioPermisoXUeDto {

    @ApiProperty({ type: [Number], description: 'Array de IDs' })
    id_permiso: number[];

    @ApiProperty()
    desc_cod_ue: number;

    @ApiProperty({default:0})
    obra: number;    



}
