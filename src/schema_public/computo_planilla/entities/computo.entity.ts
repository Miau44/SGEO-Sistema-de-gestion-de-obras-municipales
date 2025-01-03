import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Item } from 'src/schema_public/item/entities/item.entity'; //relacion con item
@Entity('computo')
export class Computo {
    @PrimaryGeneratedColumn()
    id_computo: number;

    @Column()
    id_item: number;

    @Column({ type: 'varchar' })
    tramo: string;

    @Column({ type: 'varchar' })
    descripcion: string;

    @Column()
    numero: number;

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

    @Column()
    id_tipo_computo: number;

    @Column({ type: 'varchar' })
    justificacion: string;

    ///campos de tabla generales

    @Column()
    id_usuario_registro: number;

    @CreateDateColumn({ type: 'timestamp' })
    fecha_registro: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    fecha_modificacion: Date;

    @Column()
    id_estado: number;









}




