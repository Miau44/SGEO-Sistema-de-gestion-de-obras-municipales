import { Col } from "sequelize/types/utils";
import { Correlativo } from "src/schema_public/correlativo/entities/correlativo.entity";
import { Solicitud } from "src/schema_public/solicitud/entities/solicitud.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
@Entity()
export class Informe {

    @PrimaryGeneratedColumn()
    id_informe: number;

    @Column({nullable:true})
    id_obra: number;

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
    
    @Column({nullable:true})
    id_correlativo: number;

    @Column("json", { nullable: true })
    id_documento: { id_documento: number }[];

    @Column({nullable: true})
    id_solicitud: number;

    @Column()
    usuario_registro: number;

    @Column({nullable:true})
    anexos: string;

    @Column({ default:1})
    id_estado: number;
  
    @CreateDateColumn({ type: 'timestamp without time zone', default: 'NOW()' , nullable:true})
    fecha_registro: Date

    @UpdateDateColumn({ type: 'timestamp without time zone', onUpdate: 'NOW()', nullable:true})
    fecha_modificacion: Date     
    
    @OneToOne(() => Correlativo, (correlativo) => correlativo.informe)
    @JoinColumn({ name: 'id_correlativo' }) 
    correlativo: Correlativo;

    //modificar esto para solicitud
    @ManyToOne(() => Solicitud, (inform) => inform.informe)
    @JoinColumn({ name: 'id_solicitud' })
    informe: Solicitud;
}
