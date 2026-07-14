import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('comunicado')
export class Comunicado {
  @PrimaryGeneratedColumn()
  id_comunicado: number;

  @Column({ type: 'varchar', length: 255 })
  titulo: string;

  @Column({ type: 'text' })
  contenido: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  url: string;

  @Column({ type: 'timestamp', nullable: true })
  fecha_publicacion: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_expiracion: Date;

  @Column({ type: 'smallint' })
  id_estado: number;

  @CreateDateColumn({ type: 'timestamp' })
  fecha_creacion: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  fecha_actualizacion: Date;
}