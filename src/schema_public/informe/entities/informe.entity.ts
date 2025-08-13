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
    
    @Column({nullable:true})
    referencia: string;

    @Column({ type: 'timestamp without time zone', nullable:true})
    fecha_aprobacion: Date; 

    @Column({ type: 'text', nullable:true }) // Este campo almacenará el texto enriquecido como HTML
    informe_modificacion: string;
  
    @Column()
    usuario_registro: number;

    @Column({nullable:true})
    anexos: string;


    @Column({ type: 'time without time zone', nullable: true })
    hora_registro: string;

    @Column({nullable:true})
    periodo_correccion: number;


    @Column({ default:1})
    id_estado: number;
  
   /* @CreateDateColumn({ type: 'timestamp without time zone', default: 'NOW()' , nullable:true})
    fecha_registro: Date*/

  
    @CreateDateColumn({ type: 'timestamp without time zone', default: () => 'CURRENT_TIMESTAMP' })
    fecha_registro: Date


    @UpdateDateColumn({ type: 'timestamp without time zone', onUpdate: 'NOW()', nullable:true})
    fecha_modificacion: Date 


    @Column({ type: 'date', nullable: true })
    fecha_acta: Date;

    @Column({nullable:true})
    a_nombre: string;

    @Column({nullable:true})
    a_cargo: string;

    @Column({nullable:true})
    via_nombre: string;

    @Column({nullable:true})
    via_cargo: string;

    @Column({nullable:true})
    de_nombre: string;

    @Column({nullable:true})
    de_cargo: string;

    @OneToOne(() => Correlativo, (correlativo) => correlativo.informe)
    @JoinColumn({ name: 'id_correlativo' }) 
    correlativo: Correlativo;

    //modificar esto para solicitud
    @ManyToOne(() => Solicitud, (inform) => inform.informe)
    @JoinColumn({ name: 'id_solicitud' })
    informe: Solicitud;


}
