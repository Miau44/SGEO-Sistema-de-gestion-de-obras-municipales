import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
@Entity()
export class Informe {

    @PrimaryGeneratedColumn()
    id_informe: number;

    @Column()
    id_designacion: number;

    @Column()
    id_tipo_informe: number;

    @Column({nullable:true})
    obs_general: string;

    @Column({nullable:true})
    conslusion: string;

    @Column({nullable:true})
    recomendacion: string;

    @Column("json", { 
        nullable: true 
    })
    informe_inicial: string;


    

    @Column()
    usuario_registro: number;

    @Column({ })
    id_estado: number;
  
    @CreateDateColumn({ type: 'timestamp without time zone', default: 'NOW()' , nullable:true})
    fecha_registro: Date

    @UpdateDateColumn({ type: 'timestamp without time zone', onUpdate: 'NOW()', nullable:true})
    fecha_modificacion: Date        
}
