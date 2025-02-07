import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn, 
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Role } from '../../auth/enums/role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  username: string;

  @Column()
  password: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({
    type: "enum",
    enum: Role,
    array: true,
    default: [Role.USER],
  })
  roles: Role[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => User)
  @JoinTable()
  followers: User[];

  @ManyToMany(() => User)
  @JoinTable()
  following: User[];
}
