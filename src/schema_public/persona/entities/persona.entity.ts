import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { RolPermiso } from "src/schema_public/rol_permiso/entities/rol_permiso.entity";
import { SolicitudDesignacion } from "src/schema_public/solicitud_designacion/entities/solicitud_designacion.entity";
@Entity()
export class Persona {
    @PrimaryGeneratedColumn()
    id_persona: number;

    @Column()
    id_usuario:number;

    @Column()
    usuario:string;

    @Column()
    nombre: string;

    @Column()
    primer_apellido: string;

    @Column()
    segundo_apellido: string;

    @Column()
    cargo: string;

    @Column()
    puesto: string;
    
    @Column()
    id_profesion: number;

    @Column()
    registro_profesional: string;

    @Column()
    desc_cod_ue:number;    

   /* @Column()
    desc_cod_da:number;    */

    @Column()
    desc_cod_da_comision:number;    

 /*   @Column({nullable: true})
    nombre_da_comision:string;   */ 

    @Column({type: 'date'})
    fecha_aprobacion: Date;

    @Column({type: 'date',  nullable: true})
    fecha_conclusion: Date;
    
    @Column({type: 'date', nullable: true})
    fecha_vacacion_inicio: Date;
    
    @Column({type: 'date',  nullable: true})
    fecha_vacacion_fin: Date;   
        
   /* @ManyToOne(() => RolPermiso, (rol) => rol.id_rol)
    @JoinColumn({ name: 'id_rol' })
    rol: RolPermiso;*/
    
    
    

    @Column({nullable:true})
    id_permiso: string;    

    @Column({default:0})
    gestion: number;    

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

    @OneToMany(type => SolicitudDesignacion, sol => sol.persona)
    items: SolicitudDesignacion[];   

}
