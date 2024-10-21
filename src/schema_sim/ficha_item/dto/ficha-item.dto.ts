import { ApiProperty } from '@nestjs/swagger';
import { CreateFichaDto } from './../../../schema_public/ficha/dto/create-ficha.dto';
import { CreateObraDto } from './../../../schema_public/obra/dto/create-obra.dto';

export class CreateFichaItemDto {
    @ApiProperty({ type: CreateFichaDto })
    ficha: CreateFichaDto;

    @ApiProperty({ type: CreateObraDto })
    obra: CreateObraDto;

    @ApiProperty({ type: [String] }) // Suponiendo que 'item_st' es un array de strings
    item_st: string[];

    @ApiProperty({ type: [String] }) // Suponiendo que 'documentos_st' es un array de strings
    documentos_st: string[];
}
