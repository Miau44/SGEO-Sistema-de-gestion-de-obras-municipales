import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Ficha } from "src/schema_public/ficha/entities/ficha.entity";
import { Persona } from "src/schema_public/persona/entities/persona.entity";
@Entity()
export class Designacion {

    @PrimaryGeneratedColumn()
    id_designacion: number;

    @Column()
    id_tipo_solicitud:number;

    @Column()
    id_persona: number;   

    @Column()
    id_ficha: number;    
    
    @Column()
    correlativo: number;     
        
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

    @ManyToOne(() => Ficha, (ficha) => ficha.items)
    @JoinColumn({ name: 'id_ficha' })
    ficha:Ficha;    
}
