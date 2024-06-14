
import {Column,Entity,PrimaryGeneratedColumn, } from 'typeorm';
  
  @Entity()

  class User {
    @PrimaryGeneratedColumn()
    id!: number;
  
    @Column()
    usuario!: string;
  
   
    @Column()
    password!: string;
  
  }
  
  export default User;
  


