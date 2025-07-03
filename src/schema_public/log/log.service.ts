import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from './entities/log.entity';
import { CreateLogDto } from './dto/create-log.dto';
import { UpdateLogDto } from './dto/update-log.dto';


@Injectable()
export class LogService {

  constructor(
    @InjectRepository(Log) private readonly  logRepository: Repository<Log>,
  ){}

  async create(createLogDto: CreateLogDto): Promise<Log> {
    const nuevoLog = this.logRepository.create(createLogDto);
    return await this.logRepository.save(nuevoLog);
  }

  findAll() {
    return `This action returns all log`;
  }

  findOne(id: number) {
    return `This action returns a #${id} log`;
  }

  update(id: number, updateLogDto: UpdateLogDto) {
    return `This action updates a #${id} log`;
  }

  remove(id: number) {
    return `This action removes a #${id} log`;
  }
}
