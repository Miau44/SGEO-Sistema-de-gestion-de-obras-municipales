
import { Memorandum } from "src/schema_public/memorandum/entities/memorandum.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ModificacionPago } from "src/schema_public/modificacion_pago/entities/modificacion_pago.entity";
import { Informe } from "src/schema_public/informe/entities/informe.entity";
@Entity()
export class Correlativo {

    @PrimaryGeneratedColumn()
    id_correlativo: number;

    @Column()
    id_obra:number;    

    @Column({nullable:true})
    id_tipo_documento:number;

    @Column()
    correlativo: string;   
    
    @Column()
    usuario_registro: number;

    @Column({ default: 1 })
    id_estado: number;
  
   /* @CreateDateColumn({ type: 'timestamp without time zone', default: 'NOW()' })
    fecha_registro: Date*/

    @CreateDateColumn({ type: 'timestamp without time zone', default: () => 'CURRENT_TIMESTAMP' })
    fecha_registro: Date


    @UpdateDateColumn({ type: 'timestamp without time zone', onUpdate: 'NOW()' })
    fecha_modificacion: Date 
    
    @OneToMany(type => Memorandum, memoriand => memoriand.correlativ)
    correla: Memorandum[];  

    // Relación muchos a uno con la entidad modificacion
    @ManyToMany(() => ModificacionPago, (modificacion) => modificacion.correlativomo)
    @JoinColumn({ name: 'id_correlativo' }) // Indica el nombre de la columna FK
    modificacion: ModificacionPago;

// correlativo entity
@OneToOne(() => Informe, (informe) => informe.correlativo)
    informe: Informe;    
}
