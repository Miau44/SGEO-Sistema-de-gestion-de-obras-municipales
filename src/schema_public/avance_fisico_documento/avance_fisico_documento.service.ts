import { Injectable} from '@nestjs/common';
import { CreateAvanceFisicoDocumentoDto } from './dto/create-avance_fisico_documento.dto';
import { UpdateAvanceFisicoDocumentoDto } from './dto/update-avance_fisico_documento.dto';

@Injectable()
export class AvanceFisicoDocumentoService {
  create(createAvanceFisicoDocumentoDto: CreateAvanceFisicoDocumentoDto) {
    return 'This action adds a new avanceFisicoDocumento';
  }

  findAll() {
    return `This action returns all avanceFisicoDocumento`;
  }

  findOne(id: number) {
    return `This action returns a #${id} avanceFisicoDocumento`;
  }

  update(id: number, updateAvanceFisicoDocumentoDto: UpdateAvanceFisicoDocumentoDto) {
    return `This action updates a #${id} avanceFisicoDocumento`;
  }

  remove(id: number) {
    return `This action removes a #${id} avanceFisicoDocumento`;
  }



}
