import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('contrato')
export class Contrato {
  @PrimaryGeneratedColumn()
  id_contrato: number;

  @Column({ type: 'int', nullable: true  })
  correlativo_carpeta: number;

  @Column({ nullable: true })
  cuse: string;


  @Column({ type: 'varchar', nullable: true })
  cod_carpeta: string;

  @Column({ type: 'int',default : 0 })
  id_obra: number;

  @Column({ type: 'int', nullable: true })
  id_proveedor: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  contrato_monto: number;

  @Column({ type: 'date', nullable: true })
  contrato_fecha: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nombre_rpa: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  apellido_p_rpa: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  apellido_m_rpa: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  pmc_cod_carp_sim: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  rpa: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  contrato_numero: string;

  @Column({ type: 'int', nullable: true})
  id_tipo_contrato: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  modalidad: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  proponente_razon_social: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  proponente_representante: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  proponente_nit: string;

  @Column({ type: 'date', nullable: true })
  fecha_numeracion: Date;

  @Column({ type: 'date', nullable: true })
  fecha_contrato: Date;
}
  