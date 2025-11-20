import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ArchivoActa {

    @PrimaryGeneratedColumn()
    id_archivo_acta: number;

    @Column({nullable:false})
    id_obra: number;

    @Column()
    id_tipo_acta: number;

    @Column()
    id_tipo_registro: number;

    @Column()
    nombre_encargado: string;

    @Column()
    hora_registro: string;

    @Column()
    numero_fojas: number;

    @Column({ type: 'timestamp without time zone'})
    fecha_in_out: Date;

    @Column()
    nombre_fiscal: string;

    @Column()
    ci_encargado: number;

    @Column()
    observacion: string;

    @Column()
    id_documento: number;

    @Column()
    num_fojas_devolucion: number;

    @Column({ type: 'timestamp without time zone', nullable:true})
    fecha_entrega_fiscal: Date;

    @Column({ type: 'timestamp without time zone', nullable:true})
    fecha_devolucion_fiscal: Date;

    @Column({ default:1})
    id_estado: number;

    @Column({nullable:false})
    usuario_registro: number;

    @Column({ type: 'timestamp without time zone', default: () => 'CURRENT_TIMESTAMP'  })
    fecha_registro: Date;

    @Column({ type: 'timestamp without time zone', default: () => 'CURRENT_TIMESTAMP'  })
    fecha_modificacion: Date;
}
