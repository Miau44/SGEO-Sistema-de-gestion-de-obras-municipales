import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Designacion } from "src/schema_public/designacion/entities/designacion.entity";
import { GarantiaSeguro } from "src/schema_public/garantia_seguro/entities/garantia_seguro.entity";
import { Empresa } from "src/schema_public/empresa/entities/empresa.entity";
import { Memorandum } from "src/schema_public/memorandum/entities/memorandum.entity";
import { Ficha } from "src/schema_public/ficha/entities/ficha.entity";

@Entity()
export class Obra {
    @PrimaryGeneratedColumn()
    id_obra: number;

    @Column()
    id_ficha:number;    

    @Column({nullable:true})
    id_tipo_obra:number;

    @Column({nullable:true})
    id_modalidad:number;

    @Column()
    id_estado_general: number;    
  
    @Column({default:false})
    anticipo:boolean;
   
    @Column({type: 'date', nullable:true,})
    fecha_orden_proceder: Date;    

    @Column({type: 'date', nullable:true})
    fecha_inicio_ejecucion: Date;    

    @Column({nullable:true})
    plazo_ejecucion: number;    

    @Column({nullable:true})
    numero_pago: number;    

    @Column({nullable:true})
    id_tipo_pago: number;    

    @Column({nullable:true})
    planilla_anticipo: number;    

    @Column({type: 'date',  nullable: true })
    fecha_recep_provisional: Date;

    @Column({type: 'date',  nullable: true})
    fecha_recep_definitiva: Date;    

    @Column({nullable:true})
    plazo_prov_definitiva: number;

    @Column({nullable:true})
    procede:number;

    @Column({type: 'date',  nullable: true })
    fecha_pago_anticipo: Date | null;

    @Column("decimal", { precision: 15, scale: 5, nullable: true })
    monto_anticipo: number;
    
    ///---------campos genericos-----//////

    @Column({nullable:true})
    usuario_registro: number;

    @Column({default:1})
    id_estado: number;    
  
    @CreateDateColumn({ type: 'timestamp without time zone', default: 'NOW()' })
    fecha_registro: Date

    @UpdateDateColumn({ type: 'timestamp without time zone', onUpdate: 'NOW()' })
    fecha_modificacion: Date    

    ///---------campos genericos-----//////
    @Column({nullable:true,default:1})
    id_estado_sicom:number;

    @OneToMany(type => Designacion, sol => sol.obra)
    items: Designacion[];   

    @OneToMany(type => GarantiaSeguro, ganrantiaSeg => ganrantiaSeg.obras)
    garantiaSeguro: GarantiaSeguro[];   

    @OneToMany(type => Empresa, empres => empres.obraa)
    empresa: GarantiaSeguro[];   

    @OneToMany(type => Memorandum, memo => memo.memorandum1)
    memorandum1: Memorandum[];   

    // Relación con la entidad Ficha
    @ManyToOne(() => Ficha, (ficha) => ficha.obras)
    ficha: Ficha;

      
}
