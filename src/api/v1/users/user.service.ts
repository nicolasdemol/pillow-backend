import * as bcrypt from 'bcrypt';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Trouve un utilisateur par email.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  /**
   * Trouve un utilisateur par ID.
   */
  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé.');
    }
    return user;
  }

  /**
   * Met à jour un utilisateur.
   */
  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  /**
   * Récupère tous les utilisateurs (optionnel, utile pour les admins).
   */
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  /**
   * Créer un utilisateur.
   */
  async createUser(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }
  
  /**
   * Méthodes pour enregistrer, valider ou révoquer le Refresh Token.
   */
  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    
    // 🔥 Définition de la date d'expiration (7 jours à partir de maintenant)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
  
    await this.userRepository.update(userId, {
      refreshTokenHash: hashedToken,
      refreshTokenExpiresAt: expiresAt,
    });
  }

  async removeRefreshToken(userId: number) {
    await this.userRepository.update(userId, {
      refreshTokenHash: null,
      refreshTokenExpiresAt: null,
    });
  }
}
