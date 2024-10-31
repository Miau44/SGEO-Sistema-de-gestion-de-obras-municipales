import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Obra } from './../../obra/entities/obra.entity'; // Relación con Obra
@Entity('item')
export class Item {
  @PrimaryGeneratedColumn()
  id_item: number;

  @Column()
  id_obra: number;

  @Column({ nullable: true })
  id_orden_item: number;

  @Column({ type: 'varchar' })
  codigo_item: string;

  @Column({ type: 'varchar' })
  item: string;

  @Column({ type: 'varchar' })
  unidad_medida: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cantidad_sim: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  p_unitario_sim: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_item_sim: number;

  @Column({ type: 'varchar' })
  fuente_financiamiento: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  p_unitario_adjudicado: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  total_adjudicado: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cantidad_modificacion: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  total_modificacion: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  p_unitario_modificacion: number;

  @Column({ type: 'varchar', nullable: true })
  tipo_modificacion: string;

  @Column({ nullable: true })
  numero_modificacion: number;

  @Column({ type: 'varchar', nullable: true })
  tipo_item: string;

  @Column({ type: 'varchar', nullable: true })
  partida: string;

  @Column()
  estado_item: number;

  @CreateDateColumn({ type: 'timestamp'})
  fecha_registro: Date;

  @UpdateDateColumn({ type: 'timestamp'})
  fecha_modificacion: Date;

  @Column()
  id_usuario: number;

  // Relación con la entidad Obra
  @ManyToOne(() => Obra, (obra) => obra.items)
  obra: Obra;
}