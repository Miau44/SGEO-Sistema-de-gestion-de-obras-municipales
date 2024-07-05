import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class EstructuraOrganizacional { 
@PrimaryGeneratedColumn()
id_estructura: number;

@Column()
gestion: number;

@Column()
cod_da: number;

@Column()
desc_cod_da: number;

@Column({ length:350
})
nombre_da: string;

@Column({
    length: 350
})
sigla_da: string;

@Column()
cod_ue: number;

@Column()
desc_cod_ue: number;

@Column({
    length: 350
})
nombre_ue: string

@Column({ 
    length: 50
})
sigla_ue: string;


/*@Column({default: 9820 } )
usuario_registro: number;

@Column({ 
    default: 1 
})
id_estado: number;

@CreateDateColumn({ type: 'timestamp without time zone', default: 'NOW()' })
fecha_registro: Date

@UpdateDateColumn({ type: 'timestamp without time zone', onUpdate: 'NOW()' })
fecha_modificacion: Date*/


}

