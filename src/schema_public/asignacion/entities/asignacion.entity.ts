import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
@Entity()

export class Asignacion {

    @PrimaryGeneratedColumn()
    idAsignacion!: number;

    @Column()
    descripcion!: string;

    @Column()
    usuarioRegistro!: number;

    @Column({ 
        default: 1 
    })
    idEstado!: number;
  
    @CreateDateColumn({ type: 'timestamp without time zone', default: 'NOW()' })
    fechaRegistro!: Date

    @UpdateDateColumn({ type: 'timestamp without time zone', onUpdate: 'NOW()' })
    fechaModificacion!: Date
   
}
