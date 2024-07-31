import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { SolicitudDesignacion } from "src/schema_public/solicitud_designacion/entities/solicitud_designacion.entity";
@Entity()
export class Obra {
    @PrimaryGeneratedColumn()
    id_obra: number;

    @Column()
    id_ficha:number;    

    @Column({nullable:true})
    id_tipo_obra:number;

    @Column({nullable:true})
    id_modalidad:number;

    @Column()
    id_estado_general: number;    

    @Column()
    usuario_registro: number;

    @Column({default:1})
    id_estado: number;    
  
    @CreateDateColumn({ type: 'timestamp without time zone', default: 'NOW()' })
    fecha_registro: Date

    @UpdateDateColumn({ type: 'timestamp without time zone', onUpdate: 'NOW()' })
    fecha_modificacion: Date

    @OneToMany(type => SolicitudDesignacion, sol => sol.obra)
    items: SolicitudDesignacion[];   

}
