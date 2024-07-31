import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
//import { Ficha } from "src/schema_public/ficha/entities/ficha.entity";
import { Persona } from "src/schema_public/persona/entities/persona.entity";
import { Obra } from "src/schema_public/obra/entities/obra.entity";
@Entity()

export class Designacion {
    @PrimaryGeneratedColumn()
    id_designacion: number;

    @Column()
    id_tipo_solicitud:number;

    @Column()
    id_persona: number;   

    @Column()
    id_obra: number;     

    @Column()
    id_correlativo_memo: number;   
        
    @Column({nullable:true})
    fecha_baja: Date;  
    
    @Column({nullable:true})
    fecha_efectiva: Date;  

    @Column({nullable:true})
    justificacion_baja: string;   
    
    @Column()
    estado_designacion: number;       
        
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

    @ManyToOne(() => Obra, (obra) => obra.items)
    @JoinColumn({ name: 'id_obra' })
    obra:Obra;

}
