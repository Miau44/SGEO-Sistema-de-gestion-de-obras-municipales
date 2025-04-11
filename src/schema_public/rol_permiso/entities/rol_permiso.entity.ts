import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
@Entity()
export class RolPermiso {
    @PrimaryGeneratedColumn()
    id_rol_permiso: number;

    @Column({nullable:true})    
    id_rolpermiso_real:number;    

    @Column()
    id_rol_seguridad:number;

    @Column()
    id_rol:number;

    @Column()
    descripcion_rol:string;

    @Column({nullable:true})
    descripcion_rol_sgeo:string;

    @Column({default:null})
    id_permiso:number;   
  
    @Column()
    usuario_registro: number;

    // @Column({nullable:true})
    // descripcion_rol_sgeo:string;

    @Column({ 
        default: 1 
    })
    id_estado: number;
  
    @CreateDateColumn({ type: 'timestamp without time zone', default: 'NOW()' })
    fecha_registro: Date

    @UpdateDateColumn({ type: 'timestamp without time zone', onUpdate: 'NOW()' })
    fecha_modificacion: Date


}
