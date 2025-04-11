import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
@Entity()

export class TipoInforme {
    @PrimaryGeneratedColumn()
    id_tipo_informe: number;

    @Column()
    titulo: string;

    @Column()
    subtitulo: string;

    @Column()
    numeracion: string;

    @Column()
    descripcion: string;

    @Column()
    usuario_registro: number;

    @Column({ })
    id_estado: number;
  
    @CreateDateColumn({ type: 'timestamp without time zone', default: 'NOW()' , nullable:true})
    fecha_registro: Date

    @UpdateDateColumn({ type: 'timestamp without time zone', onUpdate: 'NOW()', nullable:true})
    fecha_modificacion: Date    
}
