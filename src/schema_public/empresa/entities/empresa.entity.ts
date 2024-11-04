import { Estado } from "src/schema_public/estado/entities/estado.entity";
import { Obra } from "src/schema_public/obra/entities/obra.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Empresa {

  @PrimaryGeneratedColumn()
  id_empresa: number;

  @Column()
  id_obra: number;

  @Column({ type: 'varchar', nullable: false })
  razon_social: string;

  @Column({ type: 'varchar', nullable: true })
  nit: string;

  @Column({ type: 'varchar', nullable: false })
  direccion: string;

  @Column({ type: 'varchar', nullable: true })
  telefono: string;

  @Column({ type: 'varchar', nullable: false })
  representante_legal: string;

  @Column()
  id_estado: number;

  @CreateDateColumn({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  fecha_registro: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: false, onUpdate: 'CURRENT_TIMESTAMP' })
  fecha_modificacion: Date;

  @Column({ nullable: false })
  id_usuario: number;

  // Relaciones con otras entidades
  @ManyToOne(() => Obra, (obra) => obra.empresa)
  @JoinColumn({ name: 'id_obra' })
  obraa: Obra;

  @ManyToOne(() => Estado, (estad) => estad.empresas)
  @JoinColumn({ name: 'id_estado' })
  estado: Estado;

}
