import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
@Entity()
export class Transicion {
    @PrimaryGeneratedColumn()
    id_transicion: number;

    @Column()
    descripcion:string;  
    
    @Column()
    id_tarea_origen:number;    
    
    @Column()
    id_tarea_destino:number;    

    /*@Column()
    id_direccion:number; */   

    @Column()
    funcion_externa:string;    
    
    @Column()
    id_flujo:number;    

    @Column()
    usuario_registro: number;

    @Column({ 
        default: 1 
    })
    id_estado: number;
  
    @CreateDateColumn({ type: 'timestamp without time zone', default: 'NOW()' })
    fecha_registro: Date

    @UpdateDateColumn({ type: 'timestamp without time zone', onUpdate: 'NOW()' })
    fecha_modificacion: Date



}
