import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
@Entity()
export class Tarea {
    @PrimaryGeneratedColumn()
    id_tarea: number;

    @Column()
    descripcion:string;

    @Column()
    id_flujo: string;    

    @Column()
    usuario_registro: number;

    @Column({ 
        default: 1 
    })
    id_estado: number;
  
    @CreateDateColumn({ type: 'timestamp without time zone', default: 'NOW()' })
    fecha_registro: Date

    @UpdateDateColumn({ type: 'timestamp without time zone', onUpdate: 'NOW()' })
    fecha_modificacion: Date

}
