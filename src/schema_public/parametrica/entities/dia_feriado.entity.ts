import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class DiaFeriado  {
  
  @PrimaryColumn()
  id_lista_feriado: number;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'text' })
  descripcion: string;

  @CreateDateColumn({ type: 'timestamp', name: 'fecha_registro', default: 'NOW()'})
  fecha_registro: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'fecha_modificacion', default: 'NOW()' })
  fecha_modificacion: Date;

  @Column({nullable: false})
  id_estado: number;

  @Column({nullable: false})
  id_usuario: number;
}
