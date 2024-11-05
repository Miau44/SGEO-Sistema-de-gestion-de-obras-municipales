import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
@Entity()

export class SolicitudHistorial {

    @PrimaryGeneratedColumn()
    id_historial: number;

    @Column()
    id_solicitud:number;    

    @Column()
    id_estado_solicitud:number;     

    @Column()
    id_usuario:number;     
   
    @Column("json", { nullable: true })
    data_solicitud: string;

    @Column()
    proveido:string;   

    @Column()
    id_usuario_previo:number;       
    
    @CreateDateColumn({ type: 'timestamp without time zone', nullable: true })
    fecha_envio: Date  
   
    @Column()
    usuario_registro: number;

    @CreateDateColumn({ type: 'timestamp without time zone', nullable: true })
    fecha_registro: Date

    @UpdateDateColumn({ type: 'timestamp without time zone', onUpdate: 'NOW()' })
    fecha_modificacion: Date    




}
