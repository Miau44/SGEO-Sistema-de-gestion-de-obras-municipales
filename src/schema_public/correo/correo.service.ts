import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import {EnviarCorreoProcesoDto } from './dto/enviar-correo-proceso.dto';
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

// async enviarCorreoProceso(dto: EnviarCorreoProcesoDto): Promise<{ message: string }> {
//   const { para, codigoObra, nombreObra, actividad, proveido } = dto;
//   const remitente = 'sistema@pruebasgeo.com';

//   const asunto = `NUEVO TRÁMITE: ${actividad} - ${codigoObra}`;

//   const cuerpoHtml = `
//     <p>De nuestra consideración:</p>
//     <p>Se ha registrado un nuevo trámite en su nodo, con los siguientes detalles:</p>
//     <ul>
//       <li><strong>OBRA:</strong> ${codigoObra}; ${nombreObra}</li>
//       <li><strong>ACTIVIDAD:</strong> ${actividad}</li>
//       <li><strong>PROVEÍDO:</strong> ${proveido}</li>
//     </ul>
//     <p>
//       Si tiene alguna duda o requiere asistencia adicional, contáctese con el administrador del SGEO +,<br>
//       llamando al teléfono IP <strong>1420</strong>.
//     </p>
//     <p>
//       Atentamente,<br>
//       <strong>SISTEMA DE GESTIÓN DE EJECUCIÓN DE OBRAS - SGEO +</strong><br>
//       DIRECCIÓN DE FISCALIZACIÓN DE OBRAS<br>
//       EDIFICIO TOBIA – 4to PISO
//     </p>
//   `.trim();
  

//   const correoEntity = this.correoRepo.create({
//     destinatario: para,
//     asunto,
//     cuerpo: cuerpoHtml,
//     remitente,
//     fecha_envio: new Date(),
//     fecha_registro: new Date(),
//   });

//   try {
//     const url = `${this.urlBase}?para=${encodeURIComponent(para)}&cuerpo=${encodeURIComponent(cuerpoHtml)}&asunto=${encodeURIComponent(asunto)}`;
//     await axios.get(url);

//     correoEntity.msg_error = '';
//     correoEntity.id_estado = 1;
//     await this.correoRepo.save(correoEntity);

//     return { message: `📧 Correo enviado con éxito a ${para}` };
//   } catch (error) {
//     correoEntity.msg_error = error instanceof Error ? error.message : JSON.stringify(error);
//     correoEntity.id_estado = 0;
//     await this.correoRepo.save(correoEntity);

//     throw new HttpException(`❌ Error al enviar correo: ${correoEntity.msg_error}`, HttpStatus.BAD_GATEWAY);
//   }
// }

  async enviarCorreoProceso(dto: EnviarCorreoProcesoDto): Promise<{ message: string }> {
    const { para, codigoObra, nombreObra, actividad, proveido } = dto;
    const remitente = 'sistema@miapp.com';
    const asunto = `NUEVO TRÁMITE: ${actividad} - ${codigoObra}`;

    const cuerpoHtml = `
      De nuestra consideración:<br><br>
      Se ha registrado un nuevo trámite en su nodo, con los siguientes detalles:<br><br>
      <ul>
        <li><strong>OBRA:</strong> ${codigoObra}; ${nombreObra}</li>
        <li><strong>ACTIVIDAD:</strong> ${actividad}</li>
        <li><strong>PROVEÍDO:</strong> ${proveido}</li>
      </ul>
      <br>
      Si tiene alguna duda o requiere asistencia adicional, contáctese con el administrador del SGEO +, llamando al teléfono IP 1420.<br><br>
      Atentamente,<br>
      SISTEMA DE GESTIÓN DE EJECUCIÓN DE OBRAS - SGEO +<br>
      DIRECCIÓN DE FISCALIZACIÓN DE OBRAS<br>
      EDIFICIO TOBIA – 4to PISO
    `.trim();

    // Enviar uno por uno
    const destinatarios = Array.isArray(para) ? para : [para];

    const errores: string[] = [];

    for (const destinatario of destinatarios) {
      const correoEntity = this.correoRepo.create({
        destinatario,
        asunto,
        cuerpo: cuerpoHtml,
        remitente,
        fecha_envio: new Date(),
        fecha_registro: new Date(),
      });

      try {
        const url = `${this.urlBase}?para=${encodeURIComponent(destinatario)}&cuerpo=${encodeURIComponent(cuerpoHtml)}&asunto=${encodeURIComponent(asunto)}`;
        await axios.get(url);

        correoEntity.msg_error = '';
        correoEntity.id_estado = 1;
        await this.correoRepo.save(correoEntity);
      } catch (error) {
        correoEntity.msg_error = error instanceof Error ? error.message : JSON.stringify(error);
        correoEntity.id_estado = 0;
        await this.correoRepo.save(correoEntity);
        errores.push(`❌ Error con ${destinatario}: ${correoEntity.msg_error}`);
      }
    }

    if (errores.length) {
      throw new HttpException(`Algunos correos no se enviaron:\n${errores.join('\n')}`, HttpStatus.BAD_GATEWAY);
    }

    return { message: `📧 Correos enviados con éxito a todos los destinatarios.` };
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
