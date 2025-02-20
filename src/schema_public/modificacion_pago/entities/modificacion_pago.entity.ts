import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinColumn } from 'typeorm';
import { Obra } from '../../obra/entities/obra.entity'; // Relación con Obra
import { Computo } from 'src/schema_public/computo/entities/computo.entity';
import { Planilla } from 'src/schema_public/planilla/entities/planilla.entity';
import { Correlativo } from 'src/schema_public/correlativo/entities/correlativo.entity';
import { Modificacion} from './modificacion.entity';
import { Pago } from './pago.entity';
@Entity()
export class ModificacionPago {

    @PrimaryGeneratedColumn()
    id_modificacion_pago: number;

    @Column()
    id_obra: number;

    @Column()
    id_solicitud: number;

    @Column()
    id_tipo_mod_pago: number;

    @Column()
    id_correlativo_tipo: number;

    @Column()
    id_correlativo_subtipo: number;

    ///campos de tabla generales
    @Column()
    id_usuario_registro: number;

    @CreateDateColumn({ type: 'timestamp' })
    fecha_registro: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    fecha_modificacion: Date;

    @Column()
    id_estado: number;

    //relacion uno a muchos con la entidad computo
    @OneToMany(() => Computo, (computomo) => computomo.modificacionpago, { cascade: true })
    computomo: Computo[];

    //relacion uno a muchos con la entidad computo
    @OneToMany(() => Planilla, (planimo) => planimo.modificacion, { cascade: true })
    planimo: Planilla[];

    // Relación muchos a uno con la entidad correltivo
    @ManyToMany(() => Correlativo, (correlativomo) => correlativomo.modificacion)
    @JoinColumn({ name: 'id_correlativo' }) // Indica el nombre de la columna FK
    correlativomo: Correlativo;

    //relacion uno a muchos con la entidad Modificacion
    @OneToMany(() => Modificacion, (modificacion) => modificacion.modificacionpago)
    modificacion: Modificacion[];

   //relacion uno a muchos con la entidad pago    
    @OneToMany(() => Pago, (pago) => pago.modificacionpago)
    pago: Pago[];


}



