import { Entity, PrimaryGeneratedColumn, Column,JoinColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Obra } from './../../obra/entities/obra.entity'; // Relación con Obra
import { Computo } from 'src/schema_public/computo/entities/computo.entity';
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

  @Column({ type: 'varchar', nullable:true })
  fuente_financiamiento_sim: string;


//datos adjudicacion
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable:true })
  p_unitario_adjudicado: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable:true })
  total_adjudicado: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable:true})
  cantidad_modificacion: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable:true})
  total_modificacion: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 , nullable:true})
  p_unitario_modificacion: number;

  @Column({nullable: true })
  id_tipo_modificacion: number;

  @Column({ nullable: true })
  numero_modificacion: number;

  @Column({nullable: true })
  id_tipo_item: number;  

  //datos pago
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable:true})
  cantidad_pago_aprobado: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable:true})
  monto_pago_aprobado: number;

  @Column({ nullable: true })
  nro_pago: number;

  @Column({ nullable: true })
  tipo_pago: number;

  @Column({ nullable: true })
  estado_pago: number;

  @Column({ nullable:true })
  finalizado: boolean;

  ///campos de tabla generales
  @Column()
  id_usuario_registro: number;

  @CreateDateColumn({ type: 'timestamp'})
  fecha_registro: Date;

  @UpdateDateColumn({ type: 'timestamp'})
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

}