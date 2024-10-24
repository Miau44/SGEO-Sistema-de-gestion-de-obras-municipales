import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
@Entity()
export class Transicion {
    @PrimaryGeneratedColumn()
    id_transicion: number;

    @Column()
    descripcion_transicion:string;  
    
    @Column()
    id_tarea_origen:number;    
    
    @Column()
    id_tarea_destino:number;    

    @Column({default:false})
    condicion:boolean; 
    
    @Column({default:false})
    es_rechazo:boolean;   
    
    @Column()
    id_flujo:number;   
    
    @Column()
    usuario_registro: number;

    @Column({ 
        default: 1 
    })
    id_estado: number;
  
    @CreateDateColumn({ type: 'timestamp without time zone', nullable: true })
    fecha_registro: Date

    @UpdateDateColumn({ type: 'timestamp without time zone', onUpdate: 'NOW()' })
    fecha_modificacion: Date



}
