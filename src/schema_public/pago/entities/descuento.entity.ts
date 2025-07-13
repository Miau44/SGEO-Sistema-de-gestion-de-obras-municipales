import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinColumn, OneToOne } from 'typeorm';
import { Pago } from './pago.entity';
@Entity()
export class Descuento {

    @PrimaryGeneratedColumn()
    id_descuento: number;

    @Column()
    id_pago: number;

    @Column()
    id_tipo_descuento: number;

    @Column("decimal", { precision: 15, scale: 2})
    monto: number;

    @Column({  nullable: true })
    id_subtipo_descuento: number;    

    @Column( { nullable: true })
    detalle: string;  
      
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
    @ManyToOne(() => Pago, (pago) => pago.id_pago)
    @JoinColumn({ name: 'id_pago' }) // Indica el nombre de la columna FK
    pago: Pago;

}




