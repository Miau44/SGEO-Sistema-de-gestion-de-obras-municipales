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
    nro_minuta: number;
   
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




