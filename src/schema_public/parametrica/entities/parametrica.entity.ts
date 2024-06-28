import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
@Entity()
export class Parametrica {

    @PrimaryGeneratedColumn()
    id!: number;    


    @Column()
    id_tipo!: number;

    @Column()
    desc_tipo!:string;  
    
    @Column()
    id_subtipo!: number;

    @Column()
    desc_subtipo!: string;   

    @Column()
    detalle!: string;      

    @Column()
    id_padre!: number;

    @Column()
    usuario_registro!: number;

    @Column()
    id_estado!: number;
  
    @CreateDateColumn({ type: 'timestamp without time zone', default: 'NOW()' })
    fecha_registro!: Date

    @UpdateDateColumn({ type: 'timestamp without time zone', onUpdate: 'NOW()' })
    fecha_modificacion!: Date

}
