import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
@Entity()
export class InstanciaFlujo {

    @PrimaryGeneratedColumn()
    id_ins_flujo: number;

    @Column()
    id_flujo:number;

    @Column()
    fecha_inicio: Date;    

    @Column({nullable:true})
    fecha_fin: Date; 
    
    @Column()
    id_generico:number; 

    @Column({default:false})
    finalizado:boolean; 

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
