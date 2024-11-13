import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
@Entity()
export class InformeInicial {

    @PrimaryGeneratedColumn()
    id_informe_inicial: number;

    @Column()
    id_informe: number;

    @Column()
    id_subtipo: number;   
     
   
    @Column("json", { 
        nullable: true 
    })
    descripcion: string;

    @Column()
    usuario_registro: number;

    @Column({ default:1})
    id_estado: number;
  
    @CreateDateColumn({ type: 'timestamp without time zone', default: 'NOW()' , nullable:true})
    fecha_registro: Date

    @UpdateDateColumn({ type: 'timestamp without time zone', onUpdate: 'NOW()', nullable:true})
    fecha_modificacion: Date        
}
