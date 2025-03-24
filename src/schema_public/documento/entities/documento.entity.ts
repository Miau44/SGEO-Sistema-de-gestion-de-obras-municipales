import { GarantiaSeguro } from 'src/schema_public/garantia_seguro/entities/garantia_seguro.entity';
import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
@Entity()
export class Documento {
    @PrimaryGeneratedColumn()
    id_documento: number;

    @Column()
    id_obra: number;    

    @Column()
    id_tipo_documento: number;

    @Column({default:false})
    cumple: boolean;   

    @Column()
    ruta_documento: string;   

    @Column({nullable:true})
    observacion: string;

    @Column({nullable:true})
    nombre_documento: string;    

    @Column()
    usuario_registro: number;

    @Column({ default: 1 })
    id_estado: number;

    @Column({nullable:true})
    nombre_documento: string;
  
    @CreateDateColumn({ type: 'timestamp without time zone', default: 'NOW()' })
    fecha_registro: Date

    @UpdateDateColumn({ type: 'timestamp without time zone', onUpdate: 'NOW()' })
    fecha_modificacion: Date    
    
    @OneToOne(type => GarantiaSeguro, ganrantiaSeg => ganrantiaSeg.documento)
    garantiaSeguro: GarantiaSeguro[];   

}
