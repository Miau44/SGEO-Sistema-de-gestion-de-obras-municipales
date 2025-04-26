import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { EnviarCorreoDto } from './dto/enviar-correo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Correo } from './entities/correo.entity';


@Injectable()
export class CorreoService {

  private readonly urlBase:string;

  constructor(
    @InjectRepository(Correo)
    private correoRepo: Repository<Correo>,
  ){
    this.urlBase = String(process.env.URL_SERVICIO_CORREO);
  }

  async enviarCorreo(dto: EnviarCorreoDto): Promise<string> {
    const { para, asunto, cuerpo } = dto;

    try {
      const url = `${this.urlBase}?para=${encodeURIComponent(para)}&cuerpo=${encodeURIComponent(cuerpo)}&asunto=${encodeURIComponent(asunto)}`;
      const response = await axios.get(url);

      await this.correoRepo.save({
        destinatario: para,
        asunto,
        cuerpo,
        msg_error: '',
        id_estado: 1,
        remitente: 'sistema@miapp.com',
      });

      
      return `Correo enviado con éxito a ${para}`;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);

      await this.correoRepo.save({
        destinatario: para,
        asunto,
        cuerpo,
        msg_error: errorMsg,
        id_estado: 0,
        remitente: 'sistema@miapp.com',
      });

      throw new HttpException(`Error al enviar correo: ${errorMsg}`, HttpStatus.BAD_GATEWAY);
    }
  }

  findAll() {
    return `This action returns all correo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} correo`;
  }

  remove(id: number) {
    return `This action removes a #${id} correo`;
  }
}
