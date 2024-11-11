import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('contrato_modificatorio')
export class ContratoModificatorio {
  @PrimaryGeneratedColumn()
  id_contrato_modificatorio: number;

  @Column({ type: 'int', nullable: true })
  idCarpeta: number;

  @Column({ type: 'int', nullable: true })
  idProveedor: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  contratoMonto: number;

  @Column({ type: 'date', nullable: true })
  contratoFecha: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  tipoPlazo: string;

  @Column({ type: 'int', nullable: true })
  contratoPlazo: number;

  @Column({ type: 'int', nullable: true })
  gestion: number;

  @Column({ type: 'int', nullable: true })
  id: number;

  @Column({ type: 'date', nullable: true })
  fechaNumeracion: Date;

  @Column({ type: 'varchar', length: 20, nullable: true })
  proponenteNIT: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  proponenteRazonSocial: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  proponenteRepresentante: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  modalidad: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nombreRPA: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  apellidoPRPA: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  apellidoMRPA: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  pmcCodCarpSIM: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  rpa: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  subModalidad: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  contratoNumero: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  contraEstado: string;
}