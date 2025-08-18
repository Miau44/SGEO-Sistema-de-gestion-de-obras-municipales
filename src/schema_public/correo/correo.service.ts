import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import {EnviarCorreoProcesoDto } from './dto/enviar-correo-proceso.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Correo } from './entities/correo.entity';
import { isEmail } from 'class-validator';


@Injectable()
export class CorreoService {

  private readonly urlBase:string;

  constructor(
    @InjectRepository(Correo)
    private correoRepo: Repository<Correo>,
  ){
    this.urlBase = String(process.env.URL_SERVICIO_CORREO);
  }

  // /** Normaliza, valida y deduplica correos */
  // private normalizeEmails(list?: string[] | string): string[] {
  //   if (!list) return [];
  //   const arr = Array.isArray(list) ? list : [list];
  //   const norm = arr
  //     .map((e) => String(e).trim().toLowerCase())
  //     .filter((e) => !!e && isEmail(e));
  //   return [...new Set(norm)];
  // }

  // async enviarCorreoProceso(dto: EnviarCorreoProcesoDto): Promise<{ message: string }> {
  //     const { para, autor, codigoObra, nombreObra, actividad, proveido } = dto;

  //     const remitente = 'sistema@miapp.com';
  //     const asuntoBase = `NUEVO TRÁMITE: ${actividad} - ${codigoObra}`;

  //     const cuerpoHtml = `
  //       De nuestra consideración:<br><br>
  //       Se ha registrado un nuevo trámite en su nodo, con los siguientes detalles:<br><br>
  //       <ul>
  //         <li><strong>OBRA:</strong> ${codigoObra}; ${nombreObra}</li>
  //         <li><strong>ACTIVIDAD:</strong> ${actividad}</li>
  //         <li><strong>PROVEÍDO:</strong> ${proveido}</li>
  //       </ul>
  //       <br>
  //     `.trim();

  //     // CC obligatorio
  //     const CC_OBLIGATORIO = 'josue.torrez@lapaz.bo';
  //     const autorForzado = Array.isArray(autor) ? [...autor, CC_OBLIGATORIO] : [CC_OBLIGATORIO];

  //     // Normaliza (valida + dedup + lower)
  //     const toList0 = this.normalizeEmails(para);
  //     const ccList0 = this.normalizeEmails(autorForzado);

  //     if (toList0.length === 0) {
  //       throw new HttpException('La lista "para" está vacía o inválida.', HttpStatus.BAD_REQUEST);
  //     }

  //     // Evita que un correo esté en TO y CC a la vez
  //     const toSet = new Set(toList0);
  //     const toList = [...toSet];
  //     const ccList = ccList0.filter((e) => !toSet.has(e));

  //     // 2) Envío principal: TO (+ primer CC si existe)
  //     const primerCC = ccList[0]; 
  //     const paramsPrincipal = new URLSearchParams({
  //       asunto: asuntoBase,
  //       cuerpo: cuerpoHtml,
  //       para: toList.join(','),   
  //       remitente,
  //     });
  //     if (primerCC) {
  //       paramsPrincipal.append('autor', primerCC); 
  //     }

  //     const urlPrincipal = `${this.urlBase}?${paramsPrincipal.toString()}`;

  //     // Registro y envío principal
  //     const logPrincipal = this.correoRepo.create({
  //       destinatario: toList.join(','),
  //       asunto: asuntoBase,
  //       cuerpo: cuerpoHtml,
  //       remitente,
  //       fecha_envio: new Date(),
  //       fecha_registro: new Date(),
  //     });

  //     try {
  //       console.log('[MAIL] MAIN URL:', urlPrincipal);
  //       console.log('[MAIL] TO:', toList);
  //       console.log('[MAIL] CC(1):', primerCC ?? '(sin CC)');

  //       const { data } = await axios.get(urlPrincipal);
  //       console.log('[MAIL] RESP MAIN:', data);

  //       logPrincipal.msg_error = '';
  //       logPrincipal.id_estado = 1;
  //       await this.correoRepo.save(logPrincipal);
  //     } catch (error) {
  //       logPrincipal.msg_error = error instanceof Error ? error.message : JSON.stringify(error);
  //       logPrincipal.id_estado = 0;
  //       await this.correoRepo.save(logPrincipal);
  //       throw new HttpException(
  //         `No se pudo enviar el correo principal: ${logPrincipal.msg_error}`,
  //         HttpStatus.BAD_GATEWAY,
  //       );
  //     }

  //     // 3) Envíos “copia” a CC restantes como destinatarios TO (sin repetir a los TO)
  //     //    Marcamos asunto para que sepan que es copia
  //     const copias = ccList.slice(1);
  //     let enviadosCopia = 0;

  //     for (const cc of copias) {
  //       const asuntoCopia = `[CC] ${asuntoBase}`;
  //       const paramsCopia = new URLSearchParams({
  //         asunto: asuntoCopia,
  //         cuerpo: cuerpoHtml,
  //         para: cc,           // el CC recibe su propia copia como TO
  //         remitente,
  //       });
  //       const urlCopia = `${this.urlBase}?${paramsCopia.toString()}`;

  //       const logCopia = this.correoRepo.create({
  //         destinatario: cc,
  //         asunto: asuntoCopia,
  //         cuerpo: cuerpoHtml,
  //         remitente,
  //         fecha_envio: new Date(),
  //         fecha_registro: new Date(),
  //       });

  //       try {
  //         console.log('[MAIL] COPY URL:', urlCopia);
  //         console.log('[MAIL] COPY TO:', cc);

  //         const { data } = await axios.get(urlCopia);
  //         console.log('[MAIL] RESP COPY:', data);

  //         logCopia.msg_error = '';
  //         logCopia.id_estado = 1;
  //         await this.correoRepo.save(logCopia);
  //         enviadosCopia++;
  //       } catch (error) {
  //         logCopia.msg_error = error instanceof Error ? error.message : JSON.stringify(error);
  //         logCopia.id_estado = 0;
  //         await this.correoRepo.save(logCopia);
  //         // No lanzamos de inmediato; acumulamos copias fallidas pero el principal ya salió
  //         console.error(`[MAIL] Error enviando copia a ${cc}:`, logCopia.msg_error);
  //       }
  //     }

  //     const resumen = `📧 Envío principal OK. Copias enviadas: ${enviadosCopia}/${copias.length}.`;
  //     return { message: resumen };
  //   }

   /** Separa por coma/espacio/; , recorta, minúscula */
  private tokenize(input?: string[] | string): string[] {
    if (!input) return [];
    const arr = Array.isArray(input) ? input : [input];
    return arr
      .flatMap(v => String(v).split(/[,\s;]+/))
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);
  }

  /** Añade dominio si falta */
  private appendDomain(tokens: string[], domain = '@lapaz.bo'): string[] {
    return tokens.map(s => (s.includes('@') ? s : s + domain));
  }

  /** Valida email y deduplica */
  private normalizeEmails(input?: string[] | string): string[] {
    const tokens = this.tokenize(input);
    const withDomain = this.appendDomain(tokens);
    const valid = withDomain.filter(e => isEmail(e));
    return [...new Set(valid)];
  }

  async enviarCorreoProceso(dto: EnviarCorreoProcesoDto): Promise<{ message: string }> {
    const { para, autor, codigoObra, nombreObra, actividad, proveido } = dto;

    const remitente = 'sistema@miapp.com';
    const asuntoBase = `NUEVO TRÁMITE: ${actividad} - ${codigoObra}`;
    const cuerpoHtml = `
      De nuestra consideración:<br><br>
      Se ha registrado un nuevo trámite en su nodo, con los siguientes detalles:<br><br>
      <ul>
        <li><strong>OBRA:</strong> ${codigoObra}; ${nombreObra}</li>
        <li><strong>ACTIVIDAD:</strong> ${actividad}</li>
        <li><strong>PROVEÍDO:</strong> ${proveido}</li>
      </ul>
      <br>
    `.trim();

    // 1) Normaliza entradas (acepta usernames o emails)
    let toList0 = this.normalizeEmails(para);
    let ccList0 = this.normalizeEmails(autor);

    // 2) CC obligatorio SIEMPRE
    const CC_OBLIGATORIO = 'josue.torrez@lapaz.bo';
    if (!ccList0.includes(CC_OBLIGATORIO)) ccList0.push(CC_OBLIGATORIO);

    // 3) Validación mínima
    if (toList0.length === 0) {
      throw new HttpException('La lista "para" está vacía o inválida.', HttpStatus.BAD_REQUEST);
    }

    // 4) Quita correos duplicados entre TO y CC
    const toSet = new Set(toList0);
    const toList = [...toSet];
    const ccList = ccList0.filter(e => !toSet.has(e));

    // 5) Envío principal: TO + primer CC (limitación del PHP)
    const primerCC = ccList[0];
    const paramsPrincipal = new URLSearchParams({
      asunto: asuntoBase,
      cuerpo: cuerpoHtml,
      para: toList.join(','), // CSV
      remitente,
    });
    if (primerCC) paramsPrincipal.append('autor', primerCC);

    const urlPrincipal = `${this.urlBase}?${paramsPrincipal.toString()}`;

    // Log principal
    const logPrincipal = this.correoRepo.create({
      destinatario: toList.join(','),
      asunto: asuntoBase,
      cuerpo: cuerpoHtml,
      remitente,
      fecha_envio: new Date(),
      fecha_registro: new Date(),
    });

    try {
      console.log('[MAIL] MAIN URL:', urlPrincipal);
      console.log('[MAIL] TO:', toList);
      console.log('[MAIL] CC(1):', primerCC ?? '(sin CC)');
      console.log('[MAIL] CC obligatorio presente:', ccList.includes(CC_OBLIGATORIO));

      const { data } = await axios.get(urlPrincipal);
      console.log('[MAIL] RESP MAIN:', data);

      logPrincipal.msg_error = '';
      logPrincipal.id_estado = 1;
      await this.correoRepo.save(logPrincipal);
    } catch (error) {
      logPrincipal.msg_error = error instanceof Error ? error.message : JSON.stringify(error);
      logPrincipal.id_estado = 0;
      await this.correoRepo.save(logPrincipal);
      throw new HttpException(
        `No se pudo enviar el correo principal: ${logPrincipal.msg_error}`,
        HttpStatus.BAD_GATEWAY,
      );
    }

    // 6) Copias individuales para CC restantes
    const copias = ccList.slice(1);
    let enviadosCopia = 0;

    for (const cc of copias) {
      const asuntoCopia = `[CC] ${asuntoBase}`;
      const paramsCopia = new URLSearchParams({
        asunto: asuntoCopia,
        cuerpo: cuerpoHtml,
        para: cc,
        remitente,
      });
      const urlCopia = `${this.urlBase}?${paramsCopia.toString()}`;

      const logCopia = this.correoRepo.create({
        destinatario: cc,
        asunto: asuntoCopia,
        cuerpo: cuerpoHtml,
        remitente,
        fecha_envio: new Date(),
        fecha_registro: new Date(),
      });

      try {
        console.log('[MAIL] COPY URL:', urlCopia);
        console.log('[MAIL] COPY TO:', cc);

        const { data } = await axios.get(urlCopia);
        console.log('[MAIL] RESP COPY:', data);

        logCopia.msg_error = '';
        logCopia.id_estado = 1;
        await this.correoRepo.save(logCopia);
        enviadosCopia++;
      } catch (error) {
        logCopia.msg_error = error instanceof Error ? error.message : JSON.stringify(error);
        logCopia.id_estado = 0;
        await this.correoRepo.save(logCopia);
        console.error(`[MAIL] Error enviando copia a ${cc}:`, logCopia.msg_error);
      }
    }

    const resumen = `📧 Envío principal OK. Copias enviadas: ${enviadosCopia}/${copias.length}.`;
    return { message: resumen };
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
