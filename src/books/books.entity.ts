/* eslint-disable prettier/prettier */
import { User } from 'src/user/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Books {
  @PrimaryGeneratedColumn()
  book_id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  desc: string;

  @Column({ type: 'decimal', nullable: true })
  price: number;

  @ManyToOne(() => User, user => user.books)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
