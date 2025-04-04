import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Item } from 'src/schema_public/item/entities/item.entity'; //relacion con item
import { ModificacionPago } from 'src/schema_public/modificacion_pago/entities/modificacion_pago.entity';
@Entity()
export class Computo {

    @PrimaryGeneratedColumn()
    id_computo: number;

    @Column()
    id_modificacion_pago: number;

   /* @Column({ nullable: true })
    id_tipo_computo: number;*/

    @Column()
    id_item: number;

    @Column({ type: 'varchar' })
    tramo: string;

    @Column({ type: 'varchar' })
    descripcion: string;

    @Column()
    numero_veces: number;

    @Column({ type: 'decimal', precision: 15, scale: 5 })
    alto: number;

    @Column({ type: 'decimal', precision: 15, scale: 5 })
    largo: number;

    @Column({ type: 'decimal', precision: 15, scale: 5 })
    ancho: number;

    @Column({ type: 'decimal', precision: 15, scale: 5 })
    area: number;

    @Column({ type: 'decimal', precision: 15, scale: 5 })
    area_total: number;

    @Column({ type: 'decimal', precision: 15, scale: 5 })
    volumen: number;

    @Column({ type: 'decimal', precision: 15, scale: 5 })
    volumen_total: number;

    @Column({ type: 'decimal', precision: 15, scale: 5 })
    parcial: number;

    @Column({nullable:true})
    version: number;  
    
   /* @Column("json", {nullable:true })
    observacion_fiscal: string;    */

    ///campos de tabla generales
    @Column()
    id_usuario_registro: number;

    @CreateDateColumn({ type: 'timestamp' })
    fecha_registro: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    fecha_modificacion: Date;

    @Column()
    id_estado: number;


    // Relación muchos a uno con Item
    @ManyToOne(() => Item, (item) => item.computo)
    @JoinColumn({ name: 'id_item' }) // Indica el nombre de la columna FK
    item: Item;


   // Relación muchos a uno con la entidad modificacion
    @ManyToOne(() => ModificacionPago, (modificacionpago) => modificacionpago.computomo)
    @JoinColumn({ name: 'id_modificacion_pago' }) // Indica el nombre de la columna FK
    modificacionpago: ModificacionPago;



}




