import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinColumn, PrimaryColumn } from 'typeorm';
import { Obra } from '../../obra/entities/obra.entity'; // Relación con Obra
import { Computo } from 'src/schema_public/computo/entities/computo.entity';
import { Planilla } from 'src/schema_public/planilla/entities/planilla.entity';
import { Correlativo } from 'src/schema_public/correlativo/entities/correlativo.entity';
@Entity()
export class TipoModificacionPago {

    @PrimaryColumn()
    id_tipo_mod_pago: number;

    @Column()
    id_tipo: number;

    @Column()
    desc_tipo: string;

    @Column()
    id_subtipo: number;

    @Column()
    desc_subtipo: string;   

    @Column({nullable:true  })
    detalle: string;       
    
    @Column({nullable:true})
    id_correlativo_subtipo:number    

   ///campos de tabla generales
   @Column()
   id_usuario_registro: number;

   @CreateDateColumn({ type: 'timestamp' })
   fecha_registro: Date;

   @UpdateDateColumn({ type: 'timestamp' })
   fecha_modificacion: Date;

   @Column()
   id_estado: number;


}