import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Persona } from "src/schema_public/persona/entities/persona.entity";
import { PersonapermisoUe } from "src/schema_public/personapermiso_ue/entities/personapermiso_ue.entity";
@Entity()
export class PersonaPermiso {
    @PrimaryGeneratedColumn()
    id_persona_permiso: number;

    @Column()
    id_persona:number;

    @Column()
    id_permiso:number;

    @Column({default:null})
    id_rol:number;

    @Column({default:null})
    puesto:string;

    @Column({type: 'timestamp without time zone', nullable: true})
    fecha_inicio: Date;

    @Column({type: 'timestamp without time zone',  nullable: true})
    fecha_fin: Date;   
        
    @Column()
    usuario_registro: number;

    @Column({ default: 1 })
    id_estado: number;
  
    @CreateDateColumn({ type: 'timestamp without time zone', default: 'NOW()' })
    fecha_registro: Date

    @UpdateDateColumn({ type: 'timestamp without time zone', onUpdate: 'NOW()' })
    fecha_modificacion: Date   

    @ManyToOne(() => Persona, (persona) => persona.items)
    @JoinColumn({ name: 'id_persona' })
    persona:Persona;  
    
    @OneToMany(type => PersonapermisoUe, ppue => ppue.id_persona_permiso)
    items: PersonapermisoUe[];   


}
