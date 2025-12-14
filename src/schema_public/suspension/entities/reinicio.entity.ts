import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Obra } from "src/schema_public/obra/entities/obra.entity";
import { Suspension } from "./suspension.entity";

@Entity()
export class Reinicio {
 @PrimaryGeneratedColumn()
    id_reinicio: number;

    @Column()
    id_suspension:number;

    @Column()
    fecha_reinicio:Date;

    @Column()
    justificacion_reinicio:string;

    @Column()
    id_usuario: number;

    @Column({  default: 1 })
    id_estado: number;
  
    @CreateDateColumn({ type: 'timestamp without time zone', nullable: true })
    fecha_registro: Date

    @UpdateDateColumn({ type: 'timestamp without time zone', onUpdate: 'NOW()' })
    fecha_modificacion: Date

    //relacion de uno a muchos con la entidad solicitud_historial
  /*  @OneToMany(() => SolicitudHistorial,(solhistorial)=> solhistorial.solicitud, {cascade:true} )
    solicitudHistorial:SolicitudHistorial[]*/

    //relacion muchos a uno con la entidad obra
    @ManyToOne(() => Suspension, (suspension) => suspension.id_suspension)
    @JoinColumn({ name: 'id_suspension' }) // Indica el nombre de la columna FK
    Suspension: Suspension; 
    





}
