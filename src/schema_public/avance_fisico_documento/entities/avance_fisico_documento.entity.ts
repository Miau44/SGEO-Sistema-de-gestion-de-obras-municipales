import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import { AvanceFisico } from "src/schema_public/avance_fisico/entities/avance_fisico.entity";
import { Documento } from 'src/schema_public/documento/entities/documento.entity';


@Entity()

@Index('ux_avance_doc_activo', ['avanceFisico', 'documento'], {
  unique: true,
  where: '"id_estado" = 1', // evita duplicados activos
})
export class AvanceFisicoDocumento {

  @PrimaryGeneratedColumn()
  id_avance_fisico_documento: number;

  @ManyToOne(() => AvanceFisico, (a) => a.documentos, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_avance_fisico' })
  avanceFisico: AvanceFisico;

  @ManyToOne(() => Documento, (d) => d.avances, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_documento' })
  documento: Documento;

  @Column({ default: 1 })
  id_estado: number;

  @CreateDateColumn({ type: 'timestamp without time zone', default: () => 'CURRENT_TIMESTAMP' })
  fecha_registro: Date;

  @UpdateDateColumn({ type: 'timestamp without time zone', nullable: true })
  fecha_modificacion: Date | null;

}
