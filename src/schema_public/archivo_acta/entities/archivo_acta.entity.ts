import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";

@Entity('archivo_acta')
export class ArchivoActa {

  @PrimaryGeneratedColumn()
  id_archivo_acta: number;

  @Column()
  id_obra: number;

  @Column()
  id_informe: number;

  @Column()
  id_tipo_recepcion: number;

  @Column({ type: 'int', nullable: true })
  id_documento?: number | null;

  @Column()
  nombre_encargado: string;

  @Column()
  hora_registro: string;

  @Column()
  numero_fojas: number;

  @Column ({nullable: true})
  hoja_ruta: string;

  @Column({ type: 'date', nullable: true })
  fecha_entrega_dfo: Date;

  @Column()
  nombre_responsable: string;

  @Column({type: 'boolean', nullable: true})
  aprobado:boolean;
  
  @Column()
  id_usuario: number;

  @Column({ default: 1 })
  id_estado: number;

  @CreateDateColumn({ type: 'timestamp without time zone' })
  fecha_registro: Date;

  @Column({ type: 'timestamp without time zone', nullable: true })
  fecha_modificacion: Date | null;

  @Column({ type: 'int', nullable: true })
  id_solicitud?: number | null;
}

