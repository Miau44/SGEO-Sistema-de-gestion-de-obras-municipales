import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

import { PersonaPermiso } from "src/schema_public/persona_permiso/entities/persona_permiso.entity";
@Entity()

export class PersonapermisoUe {
    @PrimaryGeneratedColumn()
    id_personapermiso_ue: number;

    @Column()
    id_persona_permiso:number;  
    
    @Column({nullable:true})
    gestion:number;        

    @Column()
    desc_cod_ue:number;        

    @Column()
    usuario_registro: number;

    @Column({ default: 1 })
    id_estado: number;
  
    @CreateDateColumn({ type: 'timestamp without time zone', default: 'NOW()' })
    fecha_registro: Date

    @UpdateDateColumn({ type: 'timestamp without time zone', onUpdate: 'NOW()' })
    fecha_modificacion: Date  
    
    @ManyToOne(() => PersonaPermiso, (pp) => pp.id_persona_permiso)
    @JoinColumn({ name: 'id_persona_permiso' })
    pp:PersonaPermiso;    


}
