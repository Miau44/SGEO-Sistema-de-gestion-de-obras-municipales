//import { CorrelativoMemo } from "src/schema_public/correlativo_memo/entities/correlativo_memo.entity";
import { Correlativo } from "src/schema_public/correlativo/entities/correlativo.entity";
import { Obra } from "src/schema_public/obra/entities/obra.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";

@Entity()
export class Memorandum {

    @PrimaryGeneratedColumn()
    id_memo: number;

    @Column()
    id_obra:number;

    @Column()
    id_tipo_memo:number;    

    @Column({nullable:true})
    id_correlativo:number;

    @Column({type: 'timestamp without time zone', nullable:true})
    //@Column({type: 'date', nullable:true,})
    fecha_memo: Date | null;  


    @Column({ type: 'varchar'})
    nombre_destinatario:string;  

    @Column({ type: 'varchar'})
    referencia:string;

    @Column({ type: 'varchar', nullable:true})
    descripcion:string;   

    @Column({ type: 'varchar'})
    nombre_remitente:string;

    @Column({ type: 'varchar'})
    cargo_remitente:string;   


    @Column({nullable: true})
    id_solicitud: number;
        

    @Column({ default : 1})
    id_estado:number;

    @CreateDateColumn({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    fecha_registro:Date;   

    @UpdateDateColumn({ type: 'timestamp', nullable: false, onUpdate: 'CURRENT_TIMESTAMP' })
    fecha_modificacion:Date;

    @Column()
    id_usuario:number;   

  
    @ManyToOne(() => Obra, (obra) => obra.memorandum1)
    @JoinColumn({ name: 'id_obra' })
    memorandum1: Obra;

    @ManyToOne(() => Correlativo, (correlativo) => correlativo.correla)
    @JoinColumn({ name: 'id_correlativo' })
    correlativ: Correlativo;

}
