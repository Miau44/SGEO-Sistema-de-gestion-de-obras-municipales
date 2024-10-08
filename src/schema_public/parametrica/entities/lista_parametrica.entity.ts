import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Timestamp,
  } from 'typeorm';
  
  @Entity()
  export class ListaParametrica {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({
      type: 'integer',
      nullable: false,
    })
    id_tipo: number;
  
    @Column({
      type: 'varchar',
      length: 100,
      nullable: false,
    })
    desc_tipo: string;
  
    @Column({
      type: 'integer',
      nullable: false,
      default: () => '1',
    })
    id_estado: number;

    @Column({
      type: 'integer',
      nullable: false,
    })
    usuario_registro: number;
  
    @CreateDateColumn({
      type: 'timestamp without time zone',
      default: 'NOW()',
    })
    fecha_registro: Timestamp;
  
    @UpdateDateColumn({
      type: 'timestamp without time zone',
      onUpdate: 'NOW()',
    })
    fecha_modificacion: Timestamp;
  }