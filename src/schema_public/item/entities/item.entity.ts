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

  @Column()
  cantidad_sim: number;

  @Column()
  p_unitario_sim: number;

  @Column()
  total_item_sim: number;

  @Column({ type: 'varchar', nullable: true })
  fuente_financiamiento: string;

  @Column({ nullable: true })
  p_unitario_adjudicado: number;

  @Column({ nullable: true })
  total_adjudicado: number;

  @Column({ nullable: true })
  cantidad_modificacion: number;

  @Column({ nullable: true })
  total_modificacion: number;

  @Column({ nullable: true })
  p_unitario_modificacion: number;

  @Column({ type: 'varchar', nullable: true })
  tipo_modificacion: string;

  @Column({ nullable: true })
  numero_modificacion: number;

  @Column({ type: 'varchar', nullable: true })
  tipo_item: string;

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