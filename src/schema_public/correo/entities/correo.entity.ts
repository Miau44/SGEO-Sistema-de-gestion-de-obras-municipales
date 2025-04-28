import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Correo {
    
  @PrimaryGeneratedColumn()
  id_correo: number;

  @Column({nullable:true})
  remitente: string;

  @Column({nullable:true})
  destinatario: string;

  @Column({nullable:true})
  asunto: string;

  @Column({ type: 'text' })
  cuerpo: string;

  @CreateDateColumn({ type: 'timestamp without time zone', default: 'NOW()' })
  fecha_registro: Date;

  @CreateDateColumn({ type: 'timestamp without time zone', default: 'NOW()' })
  fecha_envio: Date;

  @Column({ type: 'text' })
  msg_error: string;
  
  @Column({ default: 1 })
  id_estado: number;
}
