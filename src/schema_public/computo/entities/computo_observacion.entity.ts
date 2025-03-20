import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Item } from 'src/schema_public/item/entities/item.entity'; //relacion con item
@Entity('')
export class ComputoObervacion {

    @PrimaryGeneratedColumn()
    id_computo_observacion: number;

    @Column()
    id_solicitud_historial: number;

    @Column()
    observacion_fiscal: string;

    ///campos de tabla generales
    @Column()
    id_usuario_registro: number;

    @CreateDateColumn({ type: 'timestamp without time zone', nullable: true })  
    fecha_registro: Date

    @UpdateDateColumn({ type: 'timestamp without time zone', onUpdate: 'NOW()' })
    fecha_modificacion: Date


    @Column()
    id_estado: number;

}



