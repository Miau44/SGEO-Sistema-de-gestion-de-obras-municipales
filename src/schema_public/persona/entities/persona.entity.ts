import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PersonapermisoUe } from "src/schema_public/personapermiso_ue/entities/personapermiso_ue.entity";
import { Designacion } from "src/schema_public/designacion/entities/designacion.entity";
import { PersonaPermiso } from "src/schema_public/persona_permiso/entities/persona_permiso.entity";
@Entity()
export class Persona {
    @PrimaryGeneratedColumn()
    id_persona: number;

    @Column()
    id_usuario:number;

    @Column()
    usuario:string;

    @Column()
    nombre: string;

    @Column()
    primer_apellido: string;

    @Column()
    segundo_apellido: string;

    @Column()
    cargo: string;
//paola
//no necesariamente nos pasan el puesto desde el sistema de seguridad
    @Column({nullable:true})
    puesto: string;
    
    @Column()
    id_profesion: number;

    @Column()
    registro_profesional: string;

    @Column()
    desc_cod_ue:number;    

   /* @Column()
    desc_cod_da:number;    */

    @Column()
    desc_cod_da_comision:number;    

 /*   @Column({nullable: true})
    nombre_da_comision:string;   */ 

    @Column({type: 'date', nullable:true})
    fecha_aprobacion: Date;

    @Column({type: 'date',  nullable: true})
    fecha_conclusion: Date;
    
    @Column({type: 'date', nullable: true})
    fecha_vacacion_inicio: Date;
    
    @Column({type: 'date',  nullable: true})
    fecha_vacacion_fin: Date;   
        
   
    //para campos json
    /*@Column("json", { 
        nullable: true 
    })
    permiso: string;*/

    @Column({nullable:true})
    id_permiso: string;    

    @Column({default:0})
    gestion: number;    

    @Column()
    usuario_registro: number;

    @Column({ 
        default: 1 
    })
    id_estado: number;
  
    @CreateDateColumn({ type: 'timestamp without time zone', nullable: true })  
    fecha_registro: Date

    @UpdateDateColumn({ type: 'timestamp without time zone', onUpdate: 'NOW()' })
    fecha_modificacion: Date
    
    @OneToMany(type => PersonaPermiso, personapermiso => personapermiso.persona)
    itemspp: PersonaPermiso[];   


    @OneToMany(type => Designacion, sol => sol.persona)
    items: Designacion[];   

}
