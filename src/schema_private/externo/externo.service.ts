import { Injectable } from '@nestjs/common';
import { CreateExternoDto } from './dto/create-externo.dto';
import { UpdateExternoDto } from './dto/update-externo.dto';
import { LoginExternoDto } from './dto/login-externo.dtos';
import { ResponseService } from 'src/response.service';


@Injectable()
export class ExternoService {
  create(createExternoDto: CreateExternoDto) {
    return 'This action adds a new externo';
  }

  findAll() {
    return `This action returns all externo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} externo`;
  }

  update(id: number, updateExternoDto: UpdateExternoDto) {
    return `This action updates a #${id} externo`;
  }

  remove(id: number) {
    return `This action removes a #${id} externo`;
  }



  //http://192.168.8.4:3007/api/v1/servicio/login
  async logeo(loginDto:LoginExternoDto) {
    try {
            
      const url = 'http://192.168.8.4:3007/api/v1/servicio/login';//GUALBERTO PRUEBAS
    //  const url =  process.env.URL_SEGURIDAD_PRUEBAS;
      
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "usuario": loginDto.usuario,
          "clave": loginDto.clave,
          "sistema": "SGEO"
        })
      };
      //console.log('este es el console', url, options);
      const response = await fetch(url, options);
      const resultado = await response.json();
      if (resultado) {
        return resultado;
      }
    } catch (error) {
      return {
      //  mensaje: error.message,
        estado: false,
        data: null,
      };
    }
  }  
}
