import { Entity, PrimaryGeneratedColumn, Column,JoinColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Obra } from './../../obra/entities/obra.entity'; // Relación con Obra
import { Computo } from 'src/schema_public/computo/entities/computo.entity';
import { ItemAvance } from './avance_item.entity';
@Entity('item')
export class Item {
  @PrimaryGeneratedColumn()
  id_item: number;

  @Column()
  id_obra: number;

  @Column({ type: 'varchar' })
  codigo_item: string;  

  //datos sim
  @Column()
  partida_sim: number;

  @Column()
  orden_sim: number;

  @Column({nullable:true})
  id_item_sim: number;

  @Column({ type: 'varchar' })
  desc_item: string;

  @Column({ type: 'varchar' })
  unidad_medida_sim: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cantidad_sim: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  p_unitario_sim: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_item_sim: number;

  @Column({ type: 'varchar', nullable: true })
  fuente_financiamiento_sim: string;

  //nuevo o de ce¡
  @Column({ nullable: true })
  id_tipo_item: number;

  //datos adjudicacion
  @Column({ type: 'decimal', precision: 20, scale: 5, nullable: true })
  p_unitario_adjudicado: number;

  @Column({ type: 'decimal', precision: 20, scale: 5, nullable: true })
  total_adjudicado: number;

  //datos_modificacion
  @Column({ type: 'decimal', precision: 15, scale: 5, nullable: true })
  cantidad_autorizada: number;

  @Column({ type: 'decimal', precision: 20, scale: 5, nullable: true })
  total_autorizado: number;

  @Column({ nullable: true })
  id_modificacion_pago: number;

  //datos pago
  @Column({ type: 'decimal', precision: 20, scale: 5, nullable: true })
  cantidad_pago_aprobado: number;

  @Column({ type: 'decimal', precision: 20, scale: 5, nullable: true })
  monto_pago_aprobado: number;

  @Column({ nullable: true })
  id_planilla_pago: number;


  @Column({ nullable:true })
  finalizado: boolean;

  ///campos de tabla generales
  @Column()
  id_usuario_registro: number;

  @CreateDateColumn({ type: 'timestamp'})
  fecha_registro: Date;

  @UpdateDateColumn({nullable:true})
  fecha_modificacion: Date;

  @Column()
  id_estado: number;


  // Relación con la entidad Obra
  @ManyToOne(() => Obra, (obra) => obra.items)
  @JoinColumn({ name: 'id_obra' })
  obra: Obra;


//relacion de uno a muchos con computo
  @OneToMany(() => Computo, (computo) => computo.item, { cascade: true })
  computo: Computo[];

  // En tu archivo item.entity.ts
@OneToMany(() => ItemAvance, (itemAvance) => itemAvance.item)
avances: ItemAvance[];

}