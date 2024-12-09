import { CorrelativoMemo } from "src/schema_public/correlativo_memo/entities/correlativo_memo.entity";
import { Obra } from "src/schema_public/obra/entities/obra.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";

@Entity()
export class Memorandum {

    @PrimaryGeneratedColumn()
    id_memo: number;

    @Column()
    id_obra:number;

    @Column({nullable: true})
    id_tipo_memo:number;    

    @Column()
    id_correlativo:number;

    @Column({ type: 'date', nullable: true })
    fecha_memo:Date;   

    @Column({nullable: true})
    nombre_destinatario:string;  

    @Column({nullable: true})
    referencia:string;

    @Column({nullable: true})
    descripcion:string;   

    @Column({nullable: true})
    nombre_remitente:string;

    @Column({nullable: true})
    cargo_remitente:string;   

    @Column({ default : 1})
    id_estado:number;

    @CreateDateColumn({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    fecha_registro:Date;   

    @UpdateDateColumn({ type: 'timestamp', nullable: false, onUpdate: 'CURRENT_TIMESTAMP' })
    fecha_modificacion:Date;

    @Column({nullable: true})
    id_usuario:number;   

    @ManyToOne(() => Obra, (obra) => obra.memorandum1)
    @JoinColumn({ name: 'id_obra' })
    memorandum1: Obra;

    @ManyToOne(() => CorrelativoMemo, (correlativo) => correlativo.correla)
    @JoinColumn({ name: 'id_correlativo' })
    correlativ: CorrelativoMemo;

}
