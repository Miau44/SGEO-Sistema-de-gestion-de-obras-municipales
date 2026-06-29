import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Item } from './item.entity'; // Ajusta la ruta según tu proyecto

@Entity('item_avance') // Asegúrate de que tenga el nombre exacto de la tabla
export class ItemAvance {
  @PrimaryGeneratedColumn()
  id_item_avance: number;

  @Column()
  id_item: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  porcentaje_avance: number;

  @Column()
  id_usuario_registro: number;

  @CreateDateColumn({ type: 'timestamp' })
  fecha_registro: Date;

  @UpdateDateColumn({ nullable: true })
  fecha_modificacion: Date;

  @Column()
  id_estado: number;

  // CORRECCIÓN AQUÍ: Muchos avances pertenecen a UN item
  @ManyToOne(() => Item, (item) => item.avances)
  @JoinColumn({ name: 'id_item' }) // Enlaza con la columna física id_item
  item: Item;
}