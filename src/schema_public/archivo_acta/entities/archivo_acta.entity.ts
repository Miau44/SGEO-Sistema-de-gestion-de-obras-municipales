import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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

  @Column()
  nombre_encargado: string;

  @Column()
  hora_registro: string;

  @Column()
  numero_fojas: number;

  @Column({ type: 'date' })
  fecha_entrega_dfo: Date;

  @Column()
  nombre_fiscal: string;

  @Column()
  id_usuario: number;

  @Column({ default: 1 })
  id_estado: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_registro: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_modificacion: Date;
}