import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Obra } from './../../obra/entities/obra.entity'; // Relación con Obra
@Entity('computo')
export class Computo {
    @PrimaryGeneratedColumn()
    id_computo: number;

    @Column()
    id_item: number;

    @Column({ type: 'varchar' })
    tramo: string;
    
    @Column({ type: 'varchar' })
    descripcion: string;

    @Column({ type: 'varchar' })
    numero: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    alto: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    largo: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    ancho: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    area: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    area_total: number;    

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    volumen: number;    
      
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    volumen_total: number;  
      
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    parcial: number;    

    @Column()
    id_tipo_computo: number;

    @Column({ type: 'varchar' })
    justificacion: string;

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




