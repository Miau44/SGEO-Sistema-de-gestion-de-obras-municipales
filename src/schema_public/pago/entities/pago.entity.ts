import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinColumn, OneToOne } from 'typeorm';
import { ModificacionPago } from 'src/schema_public/modificacion_pago/entities/modificacion_pago.entity';

@Entity()
export class Pago {

    @PrimaryGeneratedColumn()
    id_pago: number;

    @Column()
    id_modificacion_pago: number;

    @Column("decimal", { precision: 15, scale: 2, nullable: true })
    monto_presente: number;

    @Column("decimal", { precision: 15, scale: 2, nullable: true })
    deduccion: number;

    @Column("decimal", { precision: 15, scale: 2, nullable: true })
    retencion: number;    

    @Column("decimal", { precision: 15, scale: 2, nullable: true })
    multa: number;  

    @Column("decimal", { precision: 15, scale: 2, nullable: true })
    penalidad: number;      

    @Column("decimal", { precision: 15, scale: 2, nullable: true })
    importe_por_pagar: number;  

    @Column("decimal", { precision: 15, scale: 2, nullable: true })
    monto_acumulado: number;  

    @Column("decimal", { precision: 15, scale: 2, nullable: true })
    porcentaje_presente: number;    
    
    @Column("decimal", { precision: 15, scale: 2, nullable: true })
    porcentaje_acumulado: number;

    @Column({ type: 'timestamp without time zone', nullable: true })
    fecha_aprobacion_pago: Date|null;

    @Column({ type: 'timestamp without time zone', nullable: true })
    fecha_frp: Date|null;

    @Column({ type: 'timestamp without time zone', nullable: true })
    fecha_supervisor: Date|null;

    @Column({ type: 'timestamp without time zone', nullable: true })
    fecha_fiscal: Date|null;


    @Column({ type: 'timestamp without time zone', nullable: true })
    fecha_inicio_periodo: Date|null;
    
    @Column({ type: 'timestamp without time zone', nullable: true })
    fecha_fin_periodo: Date|null;

    @Column({ nullable:true })
    finalizado: boolean;
  
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

}




