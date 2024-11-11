import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
@Entity()
export class Solicitud {

    @PrimaryGeneratedColumn()
    id_solicitud: number;

    @Column()
    id_tipo_solicitud:number;

    @Column({nullable:true})
    nro_solicitud:number;    
    
    @Column({ default: 0, nullable:true })
    id_estado_solicitud: number;       

    @Column()
    id_obra:number;

    @Column({ default: 0 })
    id_estado_general: number;      
        
    @Column({nullable:true})
    id_usuario: number;   

    @Column({nullable:true})
    proveido:string;        
            
    @CreateDateColumn({ type: 'timestamp without time zone', nullable: true })
    fecha_envio: Date  

    @CreateDateColumn({ type: 'timestamp without time zone', nullable: true })
    fecha_recepcion: Date       

    @Column({nullable:true})
    id_usuario_previo: number;

    @Column({nullable:true})
    usuario_registro: number;

    @Column({ 
        default: 1 
    })
    id_estado_registro: number;
  
    @CreateDateColumn({ type: 'timestamp without time zone', nullable: true })
    fecha_registro: Date

    @UpdateDateColumn({ type: 'timestamp without time zone', onUpdate: 'NOW()' })
    fecha_modificacion: Date

}
