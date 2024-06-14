import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
@Entity()
export class Parametrica {

    @PrimaryGeneratedColumn()
    id_parametrica!: number;

    @Column()
    id_tipo!:number;

    @Column()
    id_subtipo!:number;

    @Column()
    descripcion!: string;
    
    @Column()
    id_padre!:number;
    
    @Column()
    usuario_registro!: number;

    @Column({ 
        default: 1 
    })
    id_estado!: number;
  
    @CreateDateColumn({ type: 'timestamp without time zone', default: 'NOW()' })
    fecha_registro!: Date

    @UpdateDateColumn({ type: 'timestamp without time zone', onUpdate: 'NOW()' })
    fecha_modificacion!: Date

}
