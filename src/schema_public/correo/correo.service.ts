import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import {EnviarCorreoProcesoDto } from './dto/enviar-correo-proceso.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Correo } from './entities/correo.entity';
import { isEmail } from 'class-validator';
import { EnviarAlertaCronogramaDto } from './dto/enviar-alerta-cronograma.dto';


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
      console.log('Enviando con datos HARDCODE (modo PRUEBAS)');
    } else {
      // MOD PRODUCCIÓN
      para = this.normalizeEmails(dto.para);
      autor = this.normalizeEmails(dto.autor ?? []);
      codigoObra = dto.codigoObra;
      nombreObra = dto.nombreObra;

      actividad = dto.actividad;
      proveido = dto.proveido;
      console.log('Enviando con datos del FRONT (modo PRUEBAS)');
    }

    // CC obligatorio SOLO en producción
    if (dbName === 'SGEO_PROD') {
      const CC_OBLIGATORIO = 'josue.torrez@lapaz.bo';
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

  async enviarAlertaCronograma(dto: EnviarAlertaCronogramaDto): Promise<{ message: string }> {
    const dbName = String(process.env.DATABASE_NAME || '').trim();

    let para: string[] = [];
    let autor: string[] = [];

    if (dbName === 'SGEO_PROD') {
      // PRODUCCIÓN: destinatarios obtenidos desde la vista
      para = this.normalizeEmails(dto.usuario_supervisor ?? '');
      autor = this.normalizeEmails(dto.usuario_fiscal ?? '');

      console.log('Enviando alerta cronograma a supervisor y fiscal de la vista');
    } else {
      //PRUEBAS: destinatarios definidos
      para = this.normalizeEmails([
        'ibrahim.aruni'
      ]);
      autor = this.normalizeEmails([
        'igustavo.acandia@gmail.com',
        'josue.torrez',
      ]);

      console.log(`Enviando alerta cronograma con datos HARDCODE. Base actual: ${dbName || 'NO DEFINIDA'}`);
    }

    /*
     * En producción, si no existe supervisor pero sí fiscal,
     * el fiscal pasa a ser el destinatario principal.
     */
    if (!para.length && autor.length) {
      para = [...autor];
      autor = [];
    }

    if (!para.length) {
      throw new HttpException(
        dbName === 'SGEO_PROD'
          ? 'No existe correo válido para supervisor o fiscal.'
          : 'No existen correos de prueba válidos configurados.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Eliminar duplicados en destinatarios principales
    const toSet = new Set(para);
    const toList = [...toSet];

    // Eliminar de CC cualquier correo que ya esté en TO
    const ccList = autor.filter(email => !toSet.has(email));

    const plantilla = this.construirPlantillaAlertaCronograma(dto);
    const asuntoBase = plantilla.asunto;
    const cuerpoHtml = this.construirHtmlAlertaCronograma(dto, plantilla);

    return this.enviarYRegistrarCorreo(toList, ccList, asuntoBase, cuerpoHtml);
  }

  private construirPlantillaAlertaCronograma(dto: EnviarAlertaCronogramaDto) {
    const esDefinitiva = dto.etapa === 'RECEPCIÓN DEFINITIVA';

    const tipoEntrega = esDefinitiva
      ? 'DEFINITIVA'
      : 'PROVISIONAL';

    const fechaDescripcion = esDefinitiva
      ? 'Fecha de conclusión programada para la recepción definitiva'
      : 'Fecha de conclusión programada para la recepción provisional';

    let asunto = '';
    let titulo = '';
    let mensaje = '';

    if (dto.tipo_alerta === 'AMARILLO') {
      asunto = `ADVERTENCIA DE VENCIMIENTO DE PLAZO ${tipoEntrega} - ${dto.codigo}`;
      titulo = `PLAZO PRÓXIMO A VENCER - ENTREGA ${tipoEntrega}`;
      mensaje = `
      Mediante la presente, se efectúa la advertencia respecto al cumplimiento
      del plazo contractual de ejecución de la obra y/o del plazo de vigencia
      de las garantías correspondientes, considerando que restan
      ${dto.dias_restantes} día(s) calendario para el vencimiento del plazo establecido.
    `;
    }

    if (dto.tipo_alerta === 'NARANJA') {
      asunto = `VENCIMIENTO DE PLAZO HOY - ENTREGA ${tipoEntrega} - ${dto.codigo}`;
      titulo = `VENCIMIENTO HOY - ENTREGA ${tipoEntrega}`;
      mensaje = `
      Mediante la presente, se comunica que el plazo contractual establecido
      para la entrega ${tipoEntrega.toLowerCase()} vence en la fecha.
      Se solicita realizar el seguimiento y las acciones correspondientes.
    `;
    }

    if (dto.tipo_alerta === 'ROJO') {
      asunto = `PLAZO VENCIDO - ENTREGA ${tipoEntrega} - ${dto.codigo}`;
      titulo = `PLAZO VENCIDO - ENTREGA ${tipoEntrega}`;
      mensaje = `
      Mediante la presente, se comunica que el plazo contractual establecido
      para la entrega ${tipoEntrega.toLowerCase()} ha vencido, registrándose
      ${dto.dias_multa} día(s) calendario de retraso.
      Se solicita realizar el seguimiento inmediato y adoptar las acciones correspondientes.
    `;
    }

    return {
      asunto,
      titulo,
      mensaje,
      tipoEntrega,
      fechaDescripcion,
    };
  }

  private construirHtmlAlertaCronograma(
    dto: EnviarAlertaCronogramaDto,
    plantilla: any,
  ): string {
    return `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
      <p>De nuestra consideración:</p>

      <p>
        <strong>Obra:</strong>
        ${dto.codigo}; ${dto.nombre}
      </p>

      <p>
        <strong>${plantilla.fechaDescripcion}:</strong>
        ${dto.fecha_control}
      </p>

      <p>
        <strong>Proveído:</strong>
        ${plantilla.mensaje}
      </p>

      <p>
        Se solicita realizar el seguimiento correspondiente y adoptar
        las acciones necesarias dentro del plazo previsto.
      </p>

      <p>
        Atentamente,<br>
        <strong>Sistema SGEO</strong>
      </p>
    </div>
  `.trim();
  }

  private async enviarYRegistrarCorreo(
  toList: string[],
  ccList: string[],
  asuntoBase: string,
  cuerpoHtml: string,
): Promise<{ message: string }> {
  const PHP_CC_MULTIPLE = String(process.env.PHP_CC_MULTIPLE ?? 'false').toLowerCase() === 'true';
  const remitentePhp = 'sistema@miapp.com';

  const logMaster = this.correoRepo.create({
    remitente: toList.join(','),
    destinatario: ccList.join(','),
    asunto: asuntoBase,
    cuerpo: cuerpoHtml,
    fecha_envio: new Date(),
    fecha_registro: new Date(),
    id_estado: 0,
    msg_error: '',
  });

  await this.correoRepo.save(logMaster);

  const errores: string[] = [];
  let okPrincipal = false;

  try {
    if (PHP_CC_MULTIPLE) {
      const params = new URLSearchParams({
        asunto: asuntoBase,
        cuerpo: cuerpoHtml,
        para: toList.join(','),
        remitente: remitentePhp,
      });

      if (ccList.length) {
        params.append('autor', ccList.join(','));
      }

      const url = `${this.urlBase}?${params.toString()}`;
      console.log('[MAIL ALERTA] URL única:', url);

      await axios.get(url, { timeout: 15000 });
      okPrincipal = true;
    } else {
      const primerCC = ccList[0];

      const paramsPrincipal = new URLSearchParams({
        asunto: asuntoBase,
        cuerpo: cuerpoHtml,
        para: toList.join(','),
        remitente: remitentePhp,
      });

      if (primerCC) {
        paramsPrincipal.append('autor', primerCC);
      }

      const urlPrincipal = `${this.urlBase}?${paramsPrincipal.toString()}`;

      console.log('[MAIL ALERTA] TO:', toList);
      console.log('[MAIL ALERTA] CC(1):', primerCC ?? '(sin CC)');

      await axios.get(urlPrincipal, { timeout: 15000 });
      okPrincipal = true;

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
          console.log('[MAIL ALERTA] COPY TO:', cc);

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

  logMaster.id_estado = okPrincipal && errores.length === 0 ? 1 : 0;
  logMaster.msg_error = errores.join(' | ');

  await this.correoRepo.save(logMaster);

  const resumen = errores.length
    ? `📧 Principal ${okPrincipal ? 'OK' : 'ERROR'}. Errores: ${errores.length}.`
    : `📧 Envío OK. TO: ${toList.join(', ')} | CC: ${ccList.join(', ')}`;

  return { message: resumen };
}

  async obtenerAlertasCronograma(): Promise<EnviarAlertaCronogramaDto[]> {
    return this.correoRepo.query(`
    SELECT
      id_obra,
      codigo,
      nombre,
      unidad_ejecutora,
      estado_carpeta,
      numero_contrato,
      contratista,
      usuario_supervisor,
      supervisor,
      usuario_fiscal,
      fiscal,
      fecha_control,
      etapa,
      dias_restantes,
      dias_multa,
      tipo_alerta
    FROM vista_alertas_cronograma_obras
    ORDER BY
      CASE
        WHEN tipo_alerta = 'ROJO' THEN 3
        WHEN tipo_alerta = 'NARANJA' THEN 2
        WHEN tipo_alerta = 'AMARILLO' THEN 1
        ELSE 0
      END DESC,
      fecha_control ASC;
  `);
  }

  async procesarAlertasCronograma() {
    const alertas = await this.obtenerAlertasCronograma();

    let enviados = 0;
    let errores = 0;
    let omitidos = 0;

    const detalleErrores: string[] = [];

    console.log(
      `[ALERTAS CRONOGRAMA] Obras encontradas: ${alertas.length}`,
    );

    for (const obra of alertas) {
      try {
        if (!obra.usuario_supervisor && !obra.usuario_fiscal) {
          omitidos++;

          console.warn(
            `[ALERTAS CRONOGRAMA] Obra ${obra.codigo} sin supervisor ni fiscal.`,
          );

          continue;
        }

        await this.enviarAlertaCronograma(obra);

        enviados++;

        console.log(
          `[ALERTAS CRONOGRAMA] Enviada: ${obra.codigo} - ${obra.tipo_alerta}`,
        );
      } catch (error: any) {
        errores++;

        const mensaje = error?.message || String(error);

        detalleErrores.push(`${obra.codigo}: ${mensaje}`);

        console.error(
          `[ALERTAS CRONOGRAMA] Error obra ${obra.codigo}:`,
          mensaje,
        );
      }
    }

    return {
      total: alertas.length,
      enviados,
      omitidos,
      errores,
      detalleErrores,
    };
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
