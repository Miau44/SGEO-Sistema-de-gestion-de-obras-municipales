import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
@Entity()

export class EstadoGeneral {

    @PrimaryGeneratedColumn()
    id_estado_general:number

    @Column()
    desc_estado_gral:string;

   
    @Column({nullable:true})
    desc_subestado:string;

    @Column({nullable:true})
    desc_estado_reporte:string;

    @Column({nullable:true})
    url_formulario:string;    

    @Column({nullable:true})
    desc_modulo: string;

    @Column()
    usuario_registro: number;

    @Column({default:1})
    id_estado: number;    
  
    @CreateDateColumn({ type: 'timestamp without time zone', nullable: true })  
    fecha_registro: Date

    @UpdateDateColumn({ type: 'timestamp without time zone', onUpdate: 'NOW()' })
    fecha_modificacion: Date


}
