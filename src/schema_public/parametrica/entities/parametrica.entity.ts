import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Parametrica {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  id_tipo!: number;

  @Column()
  desc_tipo!: string;

  @Column()
  id_subtipo!: number;

  @Column()
  desc_subtipo: string;

  @Column({ nullable: true })
  detalle?: string;

  @Column()
  id_padre: number;

  @Column({ default: () => '0' })
  id_protegido: number;

  @Column()
  usuario_registro: number;

  @Column({ default: () => '1' })
  id_estado: number;

  @CreateDateColumn({ type: 'timestamp without time zone', default: 'NOW()' })
  fecha_registro: Date;

  @UpdateDateColumn({ type: 'timestamp without time zone', onUpdate: 'NOW()' })
  fecha_modificacion: Date;
}