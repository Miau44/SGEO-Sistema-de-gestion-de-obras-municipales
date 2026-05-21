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

   /** Separa por coma/espacio/; , recorta, minúscula */
  private tokenize(input?: string[] | string): string[] {
    if (!input) return [];
    const arr = Array.isArray(input) ? input : [input];
    return arr
      .flatMap(v => String(v).split(/[,\s;|]+/))
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
    const dbName = String(process.env.DATABASE_NAME || '').trim() .toUpperCase();
    const PHP_CC_MULTIPLE = String(process.env.PHP_CC_MULTIPLE ?? 'false').toLowerCase() === 'true';

    // remitente SOLO para el PHP
    const remitentePhp = 'sistema@miapp.com';

    // ---------------- Selección de datos por entorno ----------------
    let para: string[];
    let autor: string[];
    let codigoObra: string;
    let nombreObra: string;
    let actividad: string;
    let proveido: string;

    if (dbName === 'Bkp_produccion_Nov_Sgeo') {
      // MODO PRUEBAS: ignora lo que mande el front (hardcode)
      para = this.normalizeEmails(['ibrahim.aruni']);
      //autor = this.normalizeEmails(['angel.laura', 'jorge.torrez']); 
      autor = this.normalizeEmails(['ins_93@outlook.es | igustavo.acandia@gmail.com | jorge.torrez ']);
      codigoObra = dto.codigoObra;
      nombreObra = dto.nombreObra;
      actividad = dto.actividad;
      proveido = (dto.proveido ?? '') + ' (Correo de pruebas)';
      console.log('⚠️ Enviando con datos HARDCODE (modo PRUEBAS)');
    } else {
      // MOD PRODUCCIÓN
      para = this.normalizeEmails(dto.para);
      autor = this.normalizeEmails(dto.autor ?? []);
      codigoObra = dto.codigoObra;
      nombreObra = dto.nombreObra;

      actividad = dto.actividad;
      proveido = dto.proveido;
      console.log('✅ Enviando con datos del FRONT (modo PRUEBAS)');
    }

    // CC obligatorio SOLO en producción
    if (dbName === 'SGEO_PROD') {
      const CC_OBLIGATORIO = 'josue.torrez@lapaz.bo | cesar.peraltav@lapaz.bo';
      //const CC_OBLIGATORIO = 'jorge.torrez@lapaz.bo';
      if (!autor.includes(CC_OBLIGATORIO)) autor.push(CC_OBLIGATORIO);
    }

    if (!para.length) {
      throw new HttpException('La lista "para" está vacía o inválida.', HttpStatus.BAD_REQUEST);
    }

    // Quitar duplicados entre TO y CC
    const toSet = new Set(para);
    const toList = [...toSet];
    const ccList = autor.filter(e => !toSet.has(e));

    const asuntoBase = `NUEVA TAREA: ${actividad} - ${codigoObra}`;
    const cuerpoHtml = `
      De nuestra consideración:<br><br>
      Se ha registrado un nuevo trámite en su nodo, con los siguientes detalles:<br><br>
      <ul>
        <li><strong>OBRA:</strong> ${codigoObra} - ${nombreObra}</li>
        <li><strong>ACTIVIDAD:</strong> ${actividad}</li>
        <li><strong>PROVEÍDO:</strong> ${proveido}</li>
      </ul>
      <br>
    `.trim();

    // ---------------- LOG CONSOLIDADO (UN SOLO REGISTRO) ----------------
    const logMaster = this.correoRepo.create({
      remitente: toList.join(','),     // los TO (usuarios principales)
      destinatario: ccList.join(','),  // los CC (copias)
      asunto: asuntoBase,
      cuerpo: cuerpoHtml,
      fecha_envio: new Date(),
      fecha_registro: new Date(),
      id_estado: 0,
      msg_error: '',
    });
    await this.correoRepo.save(logMaster);

    // ---------------- Envío ----------------
    const errores: string[] = [];
    let okPrincipal = false;

    try {
      if (PHP_CC_MULTIPLE) {
        // Un solo request: si el PHP acepta CSV en 'autor'
        const params = new URLSearchParams({
          asunto: asuntoBase,
          cuerpo: cuerpoHtml,
          para: toList.join(','), // TO CSV
          remitente: remitentePhp,
        });
        if (ccList.length) params.append('autor', ccList.join(',')); // CC CSV
        const url = `${this.urlBase}?${params.toString()}`;

        console.log('[MAIL] URL única:', url);
        await axios.get(url, { timeout: 15000 });
        okPrincipal = true;
      } else {
        // Múltiples requests: principal + copias
        // principal: TO + primer CC (limitación PHP)
        const primerCC = ccList[0];
        const paramsPrincipal = new URLSearchParams({
          asunto: asuntoBase,
          cuerpo: cuerpoHtml,
          para: toList.join(','), // CSV
          remitente: remitentePhp,
        });
        if (primerCC) paramsPrincipal.append('autor', primerCC);

        const urlPrincipal = `${this.urlBase}?${paramsPrincipal.toString()}`;
        console.log('[MAIL] TO:', toList);
        console.log('[MAIL] CC(1):', primerCC ?? '(sin CC)');
        await axios.get(urlPrincipal, { timeout: 15000 });
        okPrincipal = true;

        // copias restantes (como correos individuales)
        const copias = ccList.slice(1);
        for (const cc of copias) {
          try {
            const paramsCopia = new URLSearchParams({
              asunto: `[CC] ${asuntoBase}`,
              cuerpo: cuerpoHtml,
              para: cc,
              remitente: remitentePhp,
            });
            const urlCopia = `${this.urlBase}?${paramsCopia.toString()}`;
            console.log('[MAIL] COPY TO:', cc);
            await axios.get(urlCopia, { timeout: 15000 });
          } catch (e: any) {
            const reason = e?.response
              ? `HTTP_${e.response.status} ${JSON.stringify(e.response.data)}`
              : String(e?.message || e);
            errores.push(`CC ${cc}: ${reason}`);
          }
        }
      }
    } catch (e: any) {
      const reason = e?.response
        ? `HTTP_${e.response.status} ${JSON.stringify(e.response.data)}`
        : String(e?.message || e);
      errores.push(`principal: ${reason}`);
    }

    // ---------------- Actualizar el ÚNICO registro ----------------
    logMaster.id_estado = okPrincipal && errores.length === 0 ? 1 : 0;
    logMaster.msg_error = errores.join(' | ');
    await this.correoRepo.save(logMaster);

    const resumen = errores.length
      ? `📧 Principal ${okPrincipal ? 'OK' : 'ERROR'}. Errores: ${errores.length}.`
      : `📧 Envío OK. TO: ${toList.join(', ')} | CC: ${ccList.join(', ')}`;

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
