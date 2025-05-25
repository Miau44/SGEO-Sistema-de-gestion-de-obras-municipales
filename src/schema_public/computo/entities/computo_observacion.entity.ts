import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class ComputoObservacion {

    @PrimaryGeneratedColumn()
    id_computo_observacion: number;

    @Column()
    id_computo: number;    


    @Column()
    id_solicitud_historial: number;

    @Column()
    observacion_fiscal: string;

    ///campos de tabla generales
    @Column()
    id_usuario_registro: number;

    @CreateDateColumn({ type: 'timestamp without time zone', nullable: true })  
    fecha_registro: Date

    @UpdateDateColumn({ type: 'timestamp without time zone', onUpdate: 'NOW()' })
    fecha_modificacion: Date


    @Column()
    id_estado: number;

}



