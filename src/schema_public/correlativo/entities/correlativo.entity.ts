
import { Memorandum } from "src/schema_public/memorandum/entities/memorandum.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
@Entity()
export class Correlativo {

    @PrimaryGeneratedColumn()
    id_correlativo: number;

    @Column()
    id_obra:number;    

    @Column({nullable:true})
    id_tipo_documento:number;

    @Column()
    correlativo: string;   
    
    @Column()
    usuario_registro: number;

    @Column({ default: 1 })
    id_estado: number;
  
    @CreateDateColumn({ type: 'timestamp without time zone', default: 'NOW()' })
    fecha_registro: Date

    @UpdateDateColumn({ type: 'timestamp without time zone', onUpdate: 'NOW()' })
    fecha_modificacion: Date 
    
    @OneToMany(type => Memorandum, memoriand => memoriand.correlativ)
    correla: Memorandum[];  

}
