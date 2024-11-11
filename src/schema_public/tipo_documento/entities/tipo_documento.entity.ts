import { GarantiaSeguro } from 'src/schema_public/garantia_seguro/entities/garantia_seguro.entity';
import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';

@Entity()

export class TipoDocumento {
    @PrimaryGeneratedColumn()
    id_tipo_documento: number;

    @Column({
        length: 300
    })
    desc_tipo_documento: string;

    @Column()
    id_subtipo_documento: number;    

    @Column({
        length: 150
    })
    id_modalidad: string;

    @Column()
    id_etapa_documento: number;

    @Column({nullable: true})
    idtipo_documento: number;

    @Column()
    orden_tipo_documento: number;
 
    @Column()
    usuario_registro: number;

    @Column({ default: 1 })
    id_estado: number;
  
    @CreateDateColumn({ type: 'timestamp without time zone', default: 'NOW()' })
    fecha_registro: Date

    @UpdateDateColumn({ type: 'timestamp without time zone', onUpdate: 'NOW()' })
    fecha_modificacion: Date        

    /*@OneToOne(type => GarantiaSeguro, ganrantiaSeg => ganrantiaSeg.tipoDocumen)
    garantiaSeguro: GarantiaSeguro[];  */
}
