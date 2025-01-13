import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Planilla {
    
    @PrimaryGeneratedColumn()
    id_planilla: number;

    @Column()
    id_modificacion: number;    

    @Column()
    id_tipo_planilla: number;   
    
    @Column()
    id_item: number;  

    @Column({ type: 'decimal', precision: 15, scale: 5 })
    cantidad_planilla: number;
    
    @Column({ type: 'decimal', precision: 15, scale: 5 })
    monto_planilla: number;

    @Column({ type: 'varchar' })
    tipo_item_modificacion: string;

    @Column({ type: 'decimal', precision: 15, scale: 5 })
    cantidad_reordenamiento: number;    

    @Column({ type: 'decimal', precision: 15, scale: 5 })
    total_reordenamiento: number;   
    
    @Column({ type: 'varchar' })
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
    


}