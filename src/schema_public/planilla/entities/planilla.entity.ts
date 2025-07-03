import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ModificacionPago } from 'src/schema_public/modificacion_pago/entities/modificacion_pago.entity';

@Entity()
export class Planilla {
    
    @PrimaryGeneratedColumn()
    id_planilla: number;

    @Column()
    id_modificacion_pago: number;    

    @Column()
    id_item: number;  

    @Column({ type: 'decimal', precision: 20, scale: 5, nullable:true })
    cantidad_planilla: number;
    
    @Column({ type: 'decimal', precision: 20, scale: 5, nullable:true })
    monto_planilla: number;

    @Column({ type: 'varchar', nullable:true })
    tipo_item_modificacion: string;

    @Column({ type: 'decimal', precision: 20, scale: 5, nullable:true })
    cantidad_reordenamiento: number;    

    @Column({ type: 'decimal', precision: 20, scale: 5, nullable:true })
    total_reordenamiento: number;   


    @Column({ type: 'decimal', precision: 20, scale: 5, nullable:true })
    cantidad_incremento: number;    

    @Column({ type: 'decimal', precision: 20, scale: 5, nullable:true })
    total_incremento: number;   

    @Column({ type: 'decimal', precision: 20, scale: 5, nullable:true })
    cantidad_decremento: number;    

    @Column({ type: 'decimal', precision: 20, scale: 5, nullable:true })
    total_decremento: number;       
      

   /* @Column("json", {nullable:true })
    justificacion_supervisor: string;   
    
    @Column("json", { nullable:true })
    observacion_fiscal: string;   

    @Column({default:false})
    estado_observacion_fis: boolean;              
    ///campos de tabla generales*/


    @Column({ nullable: true })
    finalizado: boolean;
  

    @Column()
    id_usuario_registro: number;

    @CreateDateColumn({ type: 'timestamp' })
    fecha_registro: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    fecha_modificacion: Date;

    @Column()
    id_estado: number;
    
   // Relación muchos a uno con la entidad modificacion
    @ManyToOne(() => ModificacionPago, (modificacion) => modificacion.planimo)
    @JoinColumn({ name: 'id_modificacion_pago' }) // Indica el nombre de la columna FK
    modificacion: ModificacionPago;


}