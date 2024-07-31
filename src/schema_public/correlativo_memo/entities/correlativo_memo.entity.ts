import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
@Entity()
export class CorrelativoMemo {
    @PrimaryGeneratedColumn()
    id_correlativo_memo: number;

    @Column()
    id_obra:number;
    
  /*  @Column()
    id_designacion: number;  */
    
    @Column()
    correlativo_memo: number;   
    
    @Column()
    usuario_registro: number;

    @Column({ default: 1 })
    id_estado: number;
  
    @CreateDateColumn({ type: 'timestamp without time zone', default: 'NOW()' })
    fecha_registro: Date

    @UpdateDateColumn({ type: 'timestamp without time zone', onUpdate: 'NOW()' })
    fecha_modificacion: Date      

}
