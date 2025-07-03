import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinColumn, OneToOne } from 'typeorm';
import { ModificacionPago } from './modificacion_pago.entity';

@Entity()
export class Modificacion {

    @PrimaryGeneratedColumn()
    id_modificacion: number;

    @Column()
    id_modificacion_pago: number;

    @Column()
    dias_variacion: number;

    @Column("decimal", { precision: 15, scale: 5, nullable: true })
    monto_variacion: number;

    @Column("decimal", { precision: 15, scale: 5, nullable: true })
    monto_total: number;

    //@Column()
    @Column("decimal", { precision: 15, scale: 5, nullable: true })
    porcentaje_modificacion: number;

    // @Column()
    @Column("decimal", { precision: 15, scale: 5, nullable: true })
    porcentaje_total: number;

    
    @Column({ nullable:true })
    numero_contrato_modificatorio: string;

    @Column({ type: 'timestamp without time zone', nullable: true })
    fecha_aprobacion_contrato: Date|null;

    @Column({ type: 'timestamp without time zone', nullable: true })
    fecha_supervisor: Date|null;

    @Column({ type: 'timestamp without time zone', nullable: true })
    fecha_fiscal: Date|null;

    @Column({ type: 'timestamp without time zone', nullable: true })
    fecha_memo_minuta: Date|null;

    @Column({ type: 'timestamp without time zone', nullable:true})
    fecha_aprobacion: Date |null; 

    @Column({ nullable:true })
    finalizado: boolean;

    @Column("decimal", { precision: 15, scale: 5, nullable: true })
    porcentaje_reordenamiento: number;     

    @Column("decimal", { precision: 15, scale: 5, nullable: true })
    total_incremento: number;

    @Column("decimal", { precision: 15, scale: 2, nullable: true })
    porcentaje_incremento: number;    

    @Column("decimal", { precision: 15, scale: 5, nullable: true })
    total_decremento: number;    

    @Column("decimal", { precision: 15, scale: 2, nullable: true })
    porcentaje_decremento: number;    

    @Column("decimal", { precision: 15, scale: 5, nullable: true })
    total_item_nuevo: number;         
    
    @Column("decimal", { precision: 15, scale: 2, nullable: true })
    pocentaje_item_nuevo: number;    

    @Column({nullable: true})
    total_dia_ampliado: number;

    @Column({nullable:true})
    total_plazo_autorizado: number;
        
    @Column({ type: 'timestamp without time zone', nullable: true })
    nueva_fecha_provisional: Date|null;

    @Column({ type: 'timestamp without time zone', nullable: true })
    nueva_fecha_definitiva: Date|null;
    ///campos de tabla generales

    @Column()
    id_usuario_registro: number;

    @CreateDateColumn({ type: 'timestamp' })
    fecha_registro: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    fecha_modificacion: Date;

    @Column()
    id_estado: number;

   // Relación uno a uno con la entidad modificacion_pago
    @ManyToOne(() => ModificacionPago, (modificacionpago) => modificacionpago.computomo)
    @JoinColumn({ name: 'id_modificacion_pago' }) // Indica el nombre de la columna FK
    modificacionpago: ModificacionPago;


/*//relacion muchos a uno con la entidad modifiacion pago
  @ManyToOne(() => ModificacionPago, (mod_pago) => mod_pago.)
  mod_pago: ModificacionPago;*/


}




