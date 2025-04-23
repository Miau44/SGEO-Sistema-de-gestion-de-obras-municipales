
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Log {

  @PrimaryGeneratedColumn()
  id_log: number;

  @CreateDateColumn({ type: 'timestamp',  default: 'NOW()', nullable:true })
  fecha_registro: Date;

  @Column({nullable: true })
  id_usuario: number;

  @Column({length: 2000, nullable: true })
  parametro: string;

  @Column({type: 'text', nullable: true })
  mensaje: string;

  @Column({nullable: true })
  funcionalidad: string;

  @Column({nullable: true })
  respuesta: string;
}
