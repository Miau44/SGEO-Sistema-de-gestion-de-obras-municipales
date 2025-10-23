import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('protocolo')
export class Protocolo {
      @PrimaryGeneratedColumn()
      id_protocolo: number;

      @Column({ nullable: true })
      referencia_tabla_historico: string;

      @Column({ nullable: true })
      id_tabla_historico: number;
        
      @Column({nullable:true})
      id_obra: number;

      @Column({nullable:true})
      id_referencia_modulo: number;

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
