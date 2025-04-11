import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinColumn, OneToOne } from 'typeorm';
import { ModificacionPago } from './modificacion_pago.entity';

@Entity()
export class Pago {

    @PrimaryGeneratedColumn()
    id_pago: number;

    @Column()
    id_modificacion_pago: number;

    @Column("decimal", { precision: 15, scale: 5, nullable: true })
    monto_presente: number;

    @Column("decimal", { precision: 15, scale: 5, nullable: true })
    deducciones: number;

    @Column("decimal", { precision: 15, scale: 5, nullable: true })
    retenciones: number;    

    @Column("decimal", { precision: 15, scale: 5, nullable: true })
    multas: number;  

    @Column("decimal", { precision: 15, scale: 5, nullable: true })
    importe_por_pagar: number;  

    @Column("decimal", { precision: 15, scale: 5, nullable: true })
    monto_acumulado: number;  

    @Column()
    porcentaje_ejecucion: number;      

    @Column({ type: 'date', nullable: true })
    fecha_aprobacion_pago: Date|null;

    @Column({ type: 'date', nullable: true })
    fecha_aprobacion_contrato: Date|null;

    @Column({ type: 'date', nullable: true })
    fecha_supervisor: Date|null;

    @Column({ type: 'date', nullable: true })
    fecha_fiscal: Date|null;

    @Column({ type: 'date', nullable: true })
    fecha_certificado: Date|null;

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




