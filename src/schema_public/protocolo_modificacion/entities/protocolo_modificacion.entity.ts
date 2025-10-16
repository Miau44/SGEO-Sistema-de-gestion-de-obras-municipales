import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Modificacion } from '../../modificacion_pago/entities/modificacion.entity'

@Entity('protocolo_modificacion')
@Index('uniq_actual_por_mod', ['id_modificacion'], { 
  unique: true, where: '"id_estado_protocolo" = 1' 
})

export class ProtocoloModificacion {
  @PrimaryGeneratedColumn()
  id_protocolo_modificacion: number;

  @Column()
  id_modificacion: number;

  @ManyToOne(() => Modificacion)
  @JoinColumn({ name: 'id_modificacion' })
  modificacion: Modificacion;

  @Column({nullable:true})
  id_obra: number;

  @Column({default: 1})
  id_estado_protocolo : number;

  @Column({ type: 'timestamp without time zone', nullable: true })
  fecha_supervisor: Date | null;

  @Column({ type: 'timestamp without time zone', nullable: true })
  fecha_fiscal: Date | null;

  @Column({ type: 'timestamp without time zone', nullable: true })
  fecha_memo_minuta: Date | null;

  @Column({ nullable: true })
  justificacion: string;

  @Column()
  id_usuario: number;

  @Column({ default: 1 })
  id_estado: number;

  @CreateDateColumn({ type: 'timestamp without time zone', default: () => 'CURRENT_TIMESTAMP' })
  fecha_registro: Date;

  @UpdateDateColumn({ type: 'timestamp without time zone', nullable: true })
  fecha_modificacion: Date | null;
}
