import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TipoDocumento } from 'src/schema_public/tipo_documento/entities/tipo_documento.entity';
import { Obra } from 'src/schema_public/obra/entities/obra.entity';
import { Documento } from 'src/schema_public/documento/entities/documento.entity';
import { Parametrica } from 'src/schema_public/parametrica/entities/parametrica.entity';

@Entity()
export class GarantiaSeguro {
  
  @PrimaryGeneratedColumn()
  id_garantia_seguro: number;

  @Column()
  id_obra: number;

  @Column({ type: 'varchar', nullable: false })
  tipo_accion: string;

  @Column({nullable:true})
  id_tipo_doc_garantia: number;

  @Column({nullable:true})
  id_tipo_garantia: number;

  @Column({nullable:true})
  id_tipo_seguro: number;

  @Column({ type: 'varchar', nullable: false })
  entidad_emisora: string;

  @Column({ type: 'timestamp', nullable: false })
  inicio_vigencia: Date;

  @Column({ type: 'timestamp', nullable: false })
  fin_vigencia: Date;

  @Column({ type: 'numeric', nullable: false })
  monto: number;

  @Column({ nullable: true })
  id_documento: number;

  @Column({ nullable: false })
  id_estado: number;

  @CreateDateColumn({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  fecha_registro: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: false, onUpdate: 'CURRENT_TIMESTAMP' })
  fecha_modificacion: Date;

  @Column({ nullable: false })
  id_usuario: number;

  // Relaciones con otras entidades
  @ManyToOne(() => Obra, (obra) => obra.garantiaSeguro)
  @JoinColumn({ name: 'id_obra' })
  obras: Obra;

  @ManyToOne(() => Documento, (doc) => doc.garantiaSeguro )
  @JoinColumn({ name: 'id_documento' })
  documento: Documento

}
