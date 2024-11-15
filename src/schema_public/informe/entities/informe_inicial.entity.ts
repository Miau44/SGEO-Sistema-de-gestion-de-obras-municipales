import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
@Entity()
export class InformeInicial {

    @PrimaryGeneratedColumn()
    id_informe_inicial: number;

    @Column()
    id_informe: number;

<<<<<<< HEAD
    @Column({nullable:true})
    id_obra: number;

    @Column()
    id_tipo_informe: number;

    @Column()
    antecedentes: string;
    
    @Column()
    analisis: string;

    @Column()
    obs_general: string;

    @Column({nullable:true})
    conclusion: string;

    @Column()
    recomendacion: string;
=======
    @Column()
    id_subtipo: number;   
     
   
    @Column("json", { 
        nullable: true 
    })
    descripcion: string;
>>>>>>> 68663226851fc2a0c90bf19fa076bd0e53b036ef

    @Column()
    usuario_registro: number;

    @Column({ default:1})
    id_estado: number;
  
    @CreateDateColumn({ type: 'timestamp without time zone', default: 'NOW()' , nullable:true})
    fecha_registro: Date

    @UpdateDateColumn({ type: 'timestamp without time zone', onUpdate: 'NOW()', nullable:true})
    fecha_modificacion: Date        
}
