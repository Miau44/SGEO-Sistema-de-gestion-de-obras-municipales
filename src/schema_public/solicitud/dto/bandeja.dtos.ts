import { ApiProperty } from "@nestjs/swagger";

export class BandejaDto {
    
    @ApiProperty()
    gestion:number
    
    @ApiProperty()
    usuario:number

    @ApiProperty()
    permiso:number

    @ApiProperty({ type: [Number], description: 'Array de IDs' })
    estado: number[];



}