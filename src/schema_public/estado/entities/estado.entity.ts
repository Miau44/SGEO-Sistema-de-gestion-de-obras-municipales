import { Empresa } from "src/schema_public/empresa/entities/empresa.entity";
import { GarantiaSeguro } from "src/schema_public/garantia_seguro/entities/garantia_seguro.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
@Entity()

export class Estado {


    @PrimaryGeneratedColumn()
    id_estado: number;

    @Column()
    descripcion_estado:number;

    @Column()
    usuario_registro: number;

    @Column({ default: 1 })
    estado: number;
  
    @CreateDateColumn({ type: 'timestamp without time zone', default: 'NOW()' })
    fecha_registro: Date

    @UpdateDateColumn({ type: 'timestamp without time zone', onUpdate: 'NOW()' })
    fecha_modificacion: Date  
    
    @OneToOne(type => GarantiaSeguro, ganrantiaSeg => ganrantiaSeg.estado)
    garantiaSeguro: GarantiaSeguro[]; 

    @OneToOne(type => Empresa, empresa => empresa.estado)
    empresas: Empresa[]; 
}
