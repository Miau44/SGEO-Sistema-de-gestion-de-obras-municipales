import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Obra } from 'src/schema_public/obra/entities/obra.entity';
import { Memorandum } from 'src/schema_public/memorandum/entities/memorandum.entity';

@Entity()
export class LlamadaAtencion {

        @PrimaryGeneratedColumn()
        id_llamada_atencion: number;

        @Column()
        id_obra: number;

        @Column()
        id_memo: number;

    
        @Column({ type: 'int' })
        id_subtipo_llamada: number;

        @Column({ type: 'varchar', nullable: true })
        referencia_otro: string | null;

        @Column({ type: 'date', nullable: true })
        fecha_instruccion: string;

        @Column({ type: 'date', nullable: true })
        fecha_cumplimiento_instruccion: string;

        @Column({ type: 'int', nullable: true })
        libro_ordenes_obra: number | null;

        @Column({ type: 'int', nullable: true })
        hoja_nro: number | null;

        @Column({ type: 'date', nullable: true })
        fecha_maxima_cumplimiento_memo: string;

        @CreateDateColumn({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
        fecha_registro:Date;   
    
        @UpdateDateColumn({ type: 'timestamp', nullable: false, onUpdate: 'CURRENT_TIMESTAMP' })
        fecha_modificacion:Date;
    
        @Column()
        id_usuario:number;  

        @Column({ default : 1})
        id_estado:number;

        @ManyToOne(() => Obra, (obra) => obra.llamadasAtencion)
        @JoinColumn({ name: 'id_obra' })
        obra: Obra;
  
        @ManyToOne(() => Memorandum)
        @JoinColumn({ name: 'id_memo' })
        memo: Memorandum ;
}
