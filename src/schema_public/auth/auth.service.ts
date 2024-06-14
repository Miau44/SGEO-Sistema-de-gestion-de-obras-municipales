import { Injectable , UnauthorizedException} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { RegisterAuthDto } from './dto/registrer-auth.dto';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from '../users/entities/user.entity';
import { LoginAuthDto } from './dto/login-auth.dto';

@Injectable()
export class AuthService {
  constructor(    @InjectRepository(User)
private usersRepository: Repository<User>,
  private jwtService: JwtService
  ) {}

  /*register(userObjetc:RegisterAuthDto){
const {password} = userObjetc;
const plainToHash = await hash(password, 10)

userObjetc ={...userObjetc, password:plainToHash}
return this.userModel.create(userObjetc)
  }

  create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth';
  }*/

  async register(registerAuthDto: RegisterAuthDto): Promise<{ token: string }> {
    const { usuario,  password } = registerAuthDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersRepository.create({      
      usuario,
      password: hashedPassword,
    });
    await this.usersRepository.save(user);
    const token = this.jwtService.sign({ id: user.id });
    return { token };
  }

  async login(loginDto: LoginAuthDto): Promise<{ token: string }> {
    const { usuario, password } = loginDto;
    const user = await this.usersRepository.findOne({
      where: { usuario },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.jwtService.sign({ id: user.id });

    return { token };
  }


  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

 /* update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }*/

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
