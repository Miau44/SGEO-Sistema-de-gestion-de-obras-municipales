import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
@Entity()
export class Obra {
    @PrimaryGeneratedColumn()
    id_obra: number;

    @Column()
    cod_ue:number;

   

    @Column({nullable: true})
    nombre_ue:string;    


    @Column()
    cod_poa:number;

    @Column()
    correlativo_carpeta: number;

    @Column()
    desc_carpeta: string;

    @Column()
    cod_estado_carpeta: number;

    @Column({type:'timestamp without time zone'})
    fecha_validacion_carpeta: Date;    

    @Column("decimal",{ precision: 10, scale: 2 })
    total_carpeta: number;

    @Column()
    cod_carpeta: string;

    @Column()
    cod_prioridad_carpeta: number;

    @Column()
    gestion_carpeta: number;

    @Column()
    cod_carpeta_anterior: number;    

    @Column()
    continuidad: number;     

    @Column()
    desc_zona_carpeta: string;       

    @Column()
    desc_distrito_carpeta: string;       

    @Column()
    desc_macrodistrito_carpeta: string;   

    @Column()
    usuario_registro: number;

    @Column({ })
    id_estado: number;
  
    @CreateDateColumn({ type: 'timestamp without time zone', default: 'NOW()' })
    fecha_registro: Date

    @UpdateDateColumn({ type: 'timestamp without time zone', onUpdate: 'NOW()' })
    fecha_modificacion: Date

}
