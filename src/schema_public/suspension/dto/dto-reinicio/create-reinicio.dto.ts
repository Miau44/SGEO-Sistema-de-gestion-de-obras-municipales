import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Obra } from "src/schema_public/obra/entities/obra.entity";

@Entity()
export class CreateReinicioDto {


    @Column()
    id_suspension: number;

    @Column()
    fecha_reinicio: Date;

    @Column()
    justificacion_reinicio: Date;

    @Column()
    id_usuario: Date;
     
    @Column()
    id_estado: Date;


}