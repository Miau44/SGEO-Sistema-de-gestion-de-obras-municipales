import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
@Entity()
export class PeriodoProvDef {
    @PrimaryGeneratedColumn()
    id_periodo: number;

    @Column()
    id_tipo_obra:number;

    @Column()
    menor:number;

    @Column()
    entre: number;  

    @Column()
    mayor: number;   
    
    @Column()
    usuario_registro: number;

    @Column({ default: 1 })
    id_estado: number;
  
    @CreateDateColumn({ type: 'timestamp without time zone', nullable: true })  
    fecha_registro: Date

    @UpdateDateColumn({ type: 'timestamp without time zone', onUpdate: 'NOW()' })
    fecha_modificacion: Date 
    
   

}
