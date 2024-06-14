import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
@Entity()
export class Persona {
    @PrimaryGeneratedColumn()
    id_persona!: number;

    @Column()
    id_usuario!:number;

    @Column()
    usuario!:string;

    @Column()
    nombre!: string;

    @Column()
    primer_apellido!: string;

    @Column()
    segundo_apellido!: string;

    @Column()
    cargo!: string;

    @Column()
    puesto!: string;
    
    @Column()
    profesion!: string;

    @Column()
    abreviatura!: string;

    @Column({type: 'date'})
    fecha_aprobacion!: Date;

    @Column()
    usuario_registro!: string;


    @Column({ 
        default: 1 
    })
    id_estado!: number;
  
    @CreateDateColumn({ type: 'timestamp without time zone', default: 'NOW()' })
    fecha_registro!: Date

    @UpdateDateColumn({ type: 'timestamp without time zone', onUpdate: 'NOW()' })
    fecha_modificacion!: Date

}
