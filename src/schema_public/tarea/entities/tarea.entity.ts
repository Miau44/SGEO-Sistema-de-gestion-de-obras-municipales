import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
@Entity()
export class Tarea {
    @PrimaryGeneratedColumn()
    id_tarea: number;

    @Column()
    nro_tarea_flujo: number;       

    @Column()
    descripcion:string;

    @Column()
    id_flujo: number;   
        
    @Column()
    tiempo_cumplimiento: number;  

  /*  @Column()
    tiene_formulario: number;     

    @Column()
    url_formulario: string; */ 
    
    @Column()
    id_tipo_tarea: number;       

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
