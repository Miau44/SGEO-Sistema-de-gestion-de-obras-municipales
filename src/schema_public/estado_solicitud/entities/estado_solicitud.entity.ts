import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, PrimaryColumn } from "typeorm";
@Entity()

export class EstadoSolicitud {

    @PrimaryColumn()
    id_estado_solicitud:number;

    @Column()
    desc_estado:string

    @Column()
    id_estado: number;

    @Column()
    usuario_registro: number;
    
    @CreateDateColumn({ type: 'timestamp without time zone', nullable: true })
    fecha_registro: Date

    @UpdateDateColumn({ type: 'timestamp without time zone', onUpdate: 'NOW()' })
    fecha_modificacion: Date    
    

}
