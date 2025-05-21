import { Documento } from 'src/schema_public/documento/entities/documento.entity';
import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';

@Entity()
export class DocumentoSistema {

        @PrimaryGeneratedColumn()
        id_documento_sistema: number;

        @Column()
        id_documento: number;  

        @ManyToOne(() => Documento)
        @JoinColumn({ name: 'id_documento' })
        documento: Documento;

        @Column()
        id_obra: number;
        
        @Column()
        nombre_tabla_relacion: string;   
    
        @Column()
        id_tipo_relacion: number;

        @Column()
        ruta_documento: string;   

        @CreateDateColumn({ type: 'timestamp without time zone', default: 'NOW()' })
        fecha_registro: Date
    
        @Column({ type: 'timestamp without time zone', nullable: true })
        fecha_modificacion: Date    
        
        @Column({ default: 1 })
        id_estado: number;
}
