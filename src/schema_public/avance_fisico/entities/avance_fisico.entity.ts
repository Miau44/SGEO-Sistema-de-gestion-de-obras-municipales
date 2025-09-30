import { AvanceFisicoDocumento } from "src/schema_public/avance_fisico_documento/entities/avance_fisico_documento.entity";
import { OneToMany, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn} from "typeorm";


@Entity()
export class AvanceFisico {

    @PrimaryGeneratedColumn()
    id_avance_fisico: number;

    @Column({default: 1})
    id_estado_avance: number;

    @Column("decimal", { precision: 5, scale: 2, nullable: true })
    porcentaje_obra: number;

    @Column({nullable:true})
    id_obra: number;

    @Column ()
    correlativo_carpeta: number;

    @Column({nullable:true})
    observaciones: string;

    @Column({nullable:true})
    recomendaciones: string;

    @Column({ type: 'time without time zone', nullable: true })
    hora_inicio: string;

    @Column({ type: 'time without time zone', nullable: true })
    hora_final: string;

    @Column({ type: 'char', length: 1, default: 'f', comment: `'f'=Fiscal, 's'=Supervisor`, nullable: true})
    rol_avance: 'f' | 's';

    @Column({default: 1})
    id_estado: number;

    @CreateDateColumn({ type: 'timestamp without time zone', default: 'NOW()'})
    fecha_registro: Date
    
    @Column({ type: 'timestamp without time zone', nullable: true })
    fecha_modificacion: Date  
 
    @OneToMany(() => AvanceFisicoDocumento, (rel) => rel.avanceFisico)
    documentos: AvanceFisicoDocumento[];
}
