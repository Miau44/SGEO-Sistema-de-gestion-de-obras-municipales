import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Item } from 'src/schema_public/item/entities/item.entity'; //relacion con item
@Entity('')
export class ComputoCriterio {
    
    @PrimaryGeneratedColumn()
    id_computo_criterio: number;

    @Column()
    dimension: number;

    @Column()
    unidad: string;

    @Column()
    alto: number;

    @Column()
    ancho: number;

    @Column()
    largo: number;

    @Column()
    area: number;

    @Column()
    volumen: number;    
}



