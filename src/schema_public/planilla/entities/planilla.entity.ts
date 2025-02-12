import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Modificacion } from 'src/schema_public/item/entities/modificacion.entity';

@Entity()
export class Planilla {
    
    @PrimaryGeneratedColumn()
    id_planilla: number;

    @Column()
    id_modificacion: number;    

    @Column()
    id_item: number;  

    @Column({ type: 'decimal', precision: 15, scale: 5, nullable:true })
    cantidad_planilla: number;
    
    @Column({ type: 'decimal', precision: 15, scale: 5, nullable:true })
    monto_planilla: number;

    @Column({ type: 'varchar', nullable:true })
    tipo_item_modificacion: string;

    @Column({ type: 'decimal', precision: 15, scale: 5, nullable:true })
    cantidad_reordenamiento: number;    

    @Column({ type: 'decimal', precision: 15, scale: 5, nullable:true })
    total_reordenamiento: number;   
    
    @Column({ type: 'varchar', nullable:true })
    justificacion: string;   
    
    ///campos de tabla generales

    @Column()
    id_usuario_registro: number;

    @CreateDateColumn({ type: 'timestamp' })
    fecha_registro: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    fecha_modificacion: Date;

    @Column()
    id_estado: number;
    
    // Relación muchos a uno con la entidad modificacion
    @ManyToOne(() => Modificacion, (modificacion) => modificacion.planimo)
    @JoinColumn({ name: 'id_modificacion' }) // Indica el nombre de la columna FK
    modificacion: Modificacion;


}