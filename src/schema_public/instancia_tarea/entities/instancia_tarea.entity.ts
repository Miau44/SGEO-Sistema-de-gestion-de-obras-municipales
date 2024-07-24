import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
@Entity()
export class InstanciaTarea {

    @PrimaryGeneratedColumn()
    id_inst_tarea: number;

    @Column()
    id_tarea:number;

    @Column()
    id_ins_flujo: number;    

    @Column()
    fecha_inicio: Date;    

    @Column({nullable:true})
    fecha_fin: Date; 
   
    @Column({default:false})
    finalizado: boolean;     
    
    @Column()
    observacion: string; 

    @Column()
    id_inst_tarea_anterior:number

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
