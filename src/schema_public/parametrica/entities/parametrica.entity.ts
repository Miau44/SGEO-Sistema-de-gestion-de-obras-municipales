import { log } from "console";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn,
     UpdateDateColumn, getManager,BeforeInsert } from "typeorm";
@Entity()
export class Parametrica {

    @PrimaryGeneratedColumn()
    id!: number;    

    @Column()
    id_tipo!: number;

    @Column()
    desc_tipo!:string;  
    
/*///para secuencial id_subtipo
    @Column({ nullable: true, unique:true,  default: () => "nextval('id_subtipo_id_seq'::regclass)"})
    id_subtipo: number;

    @BeforeInsert()    
    async setSecondaryId() {
        this.id_subtipo = await getNextSequenceValue();}*/

    @Column()
    id_subtipo!: number;

    @Column()
    desc_subtipo: string;   

    @Column({ nullable: true })
    detalle?: string;      

    @Column()
    id_padre: number;

    @Column()
    usuario_registro: number;

    @Column()
    id_estado: number;
  
    @CreateDateColumn({ type: 'timestamp without time zone', default: 'NOW()' })
    fecha_registro: Date

    @UpdateDateColumn({ type: 'timestamp without time zone', onUpdate: 'NOW()' })
    fecha_modificacion: Date

}


/*async function getNextSequenceValue(): Promise<number> {
    const entityManager = getManager();
    const result = await entityManager.query(`SELECT nextval('id_subtipo_id_seq'::regclass) as nextval`);      
   return result[0].nextval;

  }*/