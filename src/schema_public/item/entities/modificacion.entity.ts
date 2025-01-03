import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Obra } from '../../obra/entities/obra.entity'; // Relación con Obra
@Entity('modificacion')
export class Modificacion {
    @PrimaryGeneratedColumn()
    id_modificacion: number;

    @Column()
    id_obra: number;

    @Column()
    id_solicitud: number;
        
    @Column()
    id_tipo_modificacion: number;

    @Column()
    nro_modificacion: number;
    
    @Column()
    dias_variacion: number;

    @Column("decimal", { precision: 15, scale: 5, nullable: true })
    monto_variacion: number;

    @Column("decimal", { precision: 15, scale: 5, nullable: true })
    monto_total: number;   
    
    @Column()
    porcentaje_modificacion: number;

    @Column()
    porcentaje_total: number;

    @Column()
    num_contrato_modificatorio: number;

    @Column({ type: 'date', nullable: true })
    fecha_aprobacion_contrato:Date;   

   ///campos de tabla generales

   @Column()
   id_usuario_registro: number;
 
   @CreateDateColumn({ type: 'timestamp'})
   fecha_registro: Date;
 
   @UpdateDateColumn({ type: 'timestamp'})
   fecha_modificacion: Date;
 
   @Column()
   id_estado: number;   
  


  
  
  



}




