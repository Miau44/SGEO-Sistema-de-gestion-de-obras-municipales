import { Correlativo } from "src/schema_public/correlativo/entities/correlativo.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
@Entity()
export class Informe {

    @PrimaryGeneratedColumn()
    id_informe: number;

    @Column({nullable:true})
    id_obra: number;

    @Column({nullable:true})
    id_correlativo:number;

    @Column()
    id_tipo_informe: number;

    @Column()
    antecedentes: string;
    
    @Column()
    analisis: string;

    @Column()
    obs_general: string;

    @Column({nullable:true})
    conclusion: string;

    @Column()
    recomendacion: string;

    @Column("json", { 
        nullable: true 
    })
    id_documento: string;

    @Column()
    usuario_registro: number;

    @Column({ default:1})
    id_estado: number;
  
    @CreateDateColumn({ type: 'timestamp without time zone', default: 'NOW()' , nullable:true})
    fecha_registro: Date

    @UpdateDateColumn({ type: 'timestamp without time zone', onUpdate: 'NOW()', nullable:true})
    fecha_modificacion: Date
    
    @OneToOne(() => Correlativo, (correlativo) => correlativo.informe)
    @JoinColumn({ name: 'id_correlativo' }) // Este es el lado propietario de la relación
    correlativo: Correlativo;
}
