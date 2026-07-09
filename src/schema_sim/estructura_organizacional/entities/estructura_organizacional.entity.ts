import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';


@Entity('estructura_organizacional')
export class EstructuraOrganizacional { 
@PrimaryGeneratedColumn()
id_estructura: number;

@Column()
gestion: number;

@Column({nullable:true})
cod_da: number;

@Column()
desc_cod_da: number;

@Column({ length:350})
nombre_da: string;

@Column({length: 350,nullable:true})
sigla_da: string;

@Column({nullable:true})
cod_ue: number;

@Column()
desc_cod_ue: number;

@Column({length: 350})
nombre_ue: string

@Column({ length: 50,nullable:true})
sigla_ue: string;

@Column({ default: 1 })
id_estado: number;

@CreateDateColumn({default: 'NOW()' })
fecha_registro: Date;

@UpdateDateColumn({nullable:true})
fecha_modificacion: Date

@Column({default: 0 } )
usuario_registro: number;

}

