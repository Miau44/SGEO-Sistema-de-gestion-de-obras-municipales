import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Obra } from "src/schema_public/obra/entities/obra.entity";
import { IsInt, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

@Entity()
export class CreateReinicioDto {

   @IsInt()  
    @IsNotEmpty()  
    @ApiProperty()
    id_obra: number;

   @IsInt()  
    @IsNotEmpty()  
    @ApiProperty()
    id_suspension: number;

    @ApiProperty()
    fecha_reinicio: Date;

    @ApiProperty()
    justificacion_reinicio: string;

    @IsInt()
    @ApiProperty()    
    id_memo: number;    

    @ApiProperty()
    finalizado: boolean;  
    
    @IsInt()
    @ApiProperty()
    @IsNotEmpty()    
    id_usuario: number;

    @IsInt()
    @ApiProperty()
    @IsNotEmpty()
    id_estado: number;


}