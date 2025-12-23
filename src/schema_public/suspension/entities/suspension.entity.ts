import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Obra } from "src/schema_public/obra/entities/obra.entity";
import { Reinicio } from "./reinicio.entity";
import { Memorandum } from "src/schema_public/memorandum/entities/memorandum.entity";

@Entity()
export class Suspension {
 @PrimaryGeneratedColumn()
    id_suspension: number;

    @Column()
    id_obra:number;

    @Column()
    id_tipo_suspension:number;

    @Column({nullable:true})
    id_motivo_suspension:number;    

    @Column({nullable:true})
    id_padre_suspension:number;       

    @Column()
    fecha_suspension:Date;

    @Column()
    justificacion:string;

    @Column()
    finalizado: boolean;

    @Column()
    id_usuario: number;

    @Column()
    id_memo: number;    

    @Column({  default: 1 })
    id_estado: number;
  
    @CreateDateColumn({ type: 'timestamp without time zone', nullable: true })
    fecha_registro: Date

    @UpdateDateColumn({ type: 'timestamp without time zone', onUpdate: 'NOW()' })
    fecha_modificacion: Date


    @ManyToOne(() => Obra, (obra) => obra.suspension)
    @JoinColumn({ name: 'id_obra' }) // Indica el nombre de la columna FK
    obra: Obra; 
    
    @OneToMany(() => Reinicio,(reinicio)=> reinicio.id_suspension, {cascade:true} )
    Reinicio:Reinicio;


// correlativo entity
    @OneToOne(() => Memorandum, (memorandum) => memorandum.id_memo)
    memorandum: Memorandum;    


}
