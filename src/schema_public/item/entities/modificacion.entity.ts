import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinColumn } from 'typeorm';
import { Obra } from '../../obra/entities/obra.entity'; // Relación con Obra
import { Computo } from 'src/schema_public/computo_planilla/entities/computo.entity';
import { Planilla } from 'src/schema_public/planilla/entities/planilla.entity';
import { Correlativo } from 'src/schema_public/correlativo/entities/correlativo.entity';
@Entity()
export class Modificacion {
    @PrimaryGeneratedColumn()
    id_modificacion: number;

    @Column()
    id_obra: number;

    @Column()
    id_solicitud: number;
        
    @Column()
    id_tipo_modificacion: number;

    @Column({nullable:true})
    id_correlativo: number;


    @Column({nullable:true})
    id_correlativo_general: number;    

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
  

    //relacion uno a muchos con la entidad computo
    @OneToMany(() => Computo, (computomo) => computomo.modificacion, { cascade: true })
    computomo: Computo[];
    
    //relacion uno a muchos con la entidad computo
    @OneToMany(() => Planilla, (planimo) => planimo.modificacion, { cascade: true })
    planimo: Planilla[];

    // Relación muchos a uno con la entidad correltivo
    @ManyToMany(() => Correlativo, (correlativomo) => correlativomo.modificacion)
    @JoinColumn({ name: 'id_correlativo' }) // Indica el nombre de la columna FK
    correlativomo: Correlativo;


}




