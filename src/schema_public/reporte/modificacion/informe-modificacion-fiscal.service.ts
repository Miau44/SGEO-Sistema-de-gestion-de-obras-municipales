import { Injectable, Inject, Body } from '@nestjs/common';
//import * as PdfPrinter from 'pdfmake/src/printer';
import PdfPrinter from 'pdfmake';
import * as path from 'path';
import * as fs from 'fs';
import { ResponseService } from 'src/response.service';
import { Sequelize } from 'sequelize-typescript';
import { log, table } from 'console';
import { existsSync } from 'fs'
import { join } from 'path';
import { ReportService } from 'src/schema_public/reporte/reporte.service';
//import { QueryTypes } from 'sequelize';

const rootPath = process.cwd();
const fontsPath = join(process.cwd(), 'assets', 'fonts');

const fonts = {
  Roboto: {
    normal: join(fontsPath, 'Roboto-Regular.ttf'),
    bold: join(fontsPath, 'Roboto-Medium.ttf'),
    italics: join(fontsPath, 'Roboto-Italic.ttf'),
    bolditalics: join(fontsPath, 'Roboto-MediumItalic.ttf'),
  },
};

Object.entries(fonts.Roboto).forEach(([style, path]) => {
  if (!existsSync(path)) {
    console.error(`Archivo de fuente ${style} no encontrado en ${path}`);
  } else {
    console.log(`Archivo de fuente ${style} encontrado en ${path}`);
  }
});

@Injectable()
export class InformeModificacionFiscal {
  datosEnvio: any = [];
    datosModAp: any = [];
    datosMod: any = [];
    datosInf: any = [];

    constructor(
      private readonly responseService: ResponseService,
      @Inject(Sequelize) private sequelize: Sequelize, // Inyecta Sequelize correctamente
      private readonly reportService: ReportService,
    ) { this.printer = new PdfPrinter(fonts); }
  
    private readonly printer = new PdfPrinter(fonts);
    private getImageBase64(imagePath: string): string {
      const image = fs.readFileSync(imagePath);
      return image.toString('base64');
    }
  
  //CONSULTAS

  // Datos generales obra - contrato - modificacion
  async datosGeneralesObraModif(id_modif_pago: number) {
    const query1 = `
        SELECT * 
        FROM public.vista_reporte_modificacion_gral WHERE id_modificacion_pago = ${id_modif_pago}`;
    const resultado = await this.sequelize.query(query1);
    return resultado[0];
  }

    // Resumen de Modificaciones Aprobadas por obra 
   async modificacionesAprobadas(obra: number, id_solicitud: number) {
    const query3 = `
        SELECT * 
        FROM public."vista_reporte_modif_aprobadas" WHERE id_obra = ${obra} AND id_solicitud <= ${id_solicitud}`;
    const resultado3 = await this.sequelize.query(query3);
    return resultado3[0];
   }

   // Resumen de Modificacion Actual 
   async modificacionActual(solicitud: number) {
    const query3 = `
        SELECT * 
        FROM public."vista_reporte_modif_aprobadas" WHERE id_obra = ${solicitud}`;
    const resultado3 = await this.sequelize.query(query3);
    return resultado3[0];
   }

   // Datos informes de Supervisor y Fiscal revisando 
  async datosInformesSF(id_modif_pago: number) {
    const query2 = `
        SELECT * 
        FROM public."vista_reporte_memoOC" WHERE id_modificacion_pago = ${id_modif_pago}`;
    const resultado2 = await this.sequelize.query(query2);
    return resultado2[0];
  }

  ///persona vigente
 async obtenerPersonaVigente(idPersona: number) {
  const [resultado]: any = await this.sequelize.query(`
    SELECT
      idpersona,
      usuario,
      puesto,
      pp_id_estado,
      desccodue,
      idpermiso
    FROM vista_encabezado_documento
    WHERE idpersona = :idPersona
    LIMIT 1
  `, {
    replacements: { idPersona }
  });

  if (!resultado.length) {
    return null;
  }
  const persona = resultado[0];
  // Si sigue vigente
  if (persona.pp_id_estado === 1) {
    return {
      id_persona: persona.idpersona,
      nombre: persona.usuario,
      cargo: persona.puesto,
    };
  }
  // Buscar reemplazo
  const [reemplazo]: any = await this.sequelize.query(`
     SELECT
      f.*,
      v.puesto
    FROM sp_encabezado_usuario(
      :desccodue,
      :idpermiso
    ) f
    LEFT JOIN vista_encabezado_documento v
      ON v.idpersona = f.id_persona_reemplazo    
  `, {
    replacements: {
      desccodue: persona.desccodue,
      idpermiso: persona.idpermiso,
    }
  });
  if (!reemplazo.length) {
    return {
      id_persona: persona.idpersona,
      nombre: persona.usuario,
    };
  }

  return {
    id_persona: reemplazo[0].id_persona_reemplazo,
    nombre: reemplazo[0].usuario_reemplazo,
    cargo: reemplazo[0].puesto,
  };
}

///
async actualizarEncabezadoCompleto(datos: any) {
  const [resultado]: any = await this.sequelize.query(`
    SELECT
      a_nombre,
      via_nombre,
      de_nombre
    FROM informe
    WHERE id_informe = :idInforme
  `, {
    replacements: {
      idInforme: datos.idinffis,
    }
  });
  if (!resultado.length) {
    return datos;
  }
  const encabezado = resultado[0];
  console.log('ENCABEZADO', JSON.stringify(encabezado, null, 2)
  );
  const actualizar = async (lista: any[]) => {
    if (!Array.isArray(lista)) {
      //return '';
      return {
        nombres: '',
        cargo: '',
      };
    }
    const nombres = [];
    let cargo = '';
    for (const persona of lista) {
      const vigente =
        await this.obtenerPersonaVigente(
          persona.id_persona,
        );
      nombres.push(
        vigente?.nombre || persona.nombre
      );
      if (vigente?.cargo) {
        cargo = vigente.cargo;
      }
    }
    return {
      nombres: nombres.join('\n'),
      cargo,
    };
    //return nombres.join('\n');
  };
  const a = await actualizar(encabezado.a_nombre);
  const via = await actualizar(encabezado.via_nombre);
  const de = await actualizar(encabezado.de_nombre);

  return {
    ...datos,
    a_nombre: a?.nombres || datos.a_nombre,
    a_cargo: a?.cargo || datos.a_cargo,
    via_nombre: via?.nombres || datos.via_nombre,
    via_cargo: via?.cargo || datos.via_cargo,
    de_nombre: de?.nombres || datos.de_nombre,
    de_cargo: de?.cargo || datos.de_cargo,
  };
}

  //margen para membrete por fecha a apartir del 13 de  mayo de  2026
  /*private obtenerMargenesporfecha(
    fecha: string | Date,
  ): [number, number, number, number] {

    const fechaDocumento = new Date(fecha);

    //margen por fecha del 13 de mayo de 2026
    if (fechaDocumento >= new Date('2026-05-13')) {
      return [70, 140, 50, 70];
    }

    //antiguo membrete del logo 200
    if (fechaDocumento >= new Date('2026-01-01')) {
      return [70, 130, 50, 140];
    }

    return [70, 170, 50, 140];  // Márgenes:izquierda, arriba, derecha,abajo
  }*/

// REPORTE - INFORME MODIFICACION FISCAL

async generateInformeModificacionFiscal(id_modif_pago: number): Promise<Buffer> {

  const datosGenerales = await this.datosGeneralesObraModif(id_modif_pago);
  if ((!datosGenerales || (Array.isArray(datosGenerales) && datosGenerales.length === 0) || (typeof datosGenerales === 'object' && Object.keys(datosGenerales).length === 0))){
    throw new Error('No se encontraron datos para el ID de la obra proporcionada');
  }
  this.datosEnvio = datosGenerales;

  const res2 = await this.modificacionesAprobadas(this.datosEnvio[0].id_obra, this.datosEnvio[0].id_solicitud);
  // if (!res2 || (Array.isArray(res2) && res2.length === 0) || (typeof res2 === 'object' && Object.keys(res2).length === 0)) {
  //     throw new Error('No se encontraron datos de las modificaciones de la obra');
  // }
  this.datosModAp = res2;

    const res3 = await this.modificacionActual(this.datosEnvio[0].id_obra);
  if (!res3 || (Array.isArray(res3) && res3.length === 0) || (typeof res3 === 'object' && Object.keys(res3).length === 0)) {
      throw new Error('No se encontraron datos de las modificación');
  }
  this.datosMod = res3;

  const res4 = await this.datosInformesSF(id_modif_pago);
    if (!res4 || (Array.isArray(res4) && res4.length === 0) || (typeof res4 === 'object' && Object.keys(res4).length === 0)) {
      throw new Error('No se encontraron datos de los informes de Sup/Fis');
    }
    this.datosInf = res4;

    ///actualizar el flujo 
    this.datosInf[0] = await this.actualizarEncabezadoCompleto(
        this.datosInf[0],
      );

  const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
  const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
  //const imgPath = 'assets/images/membretado_oficio.png';
  /// membrete por gestion
  //const codigoCarpeta = this.datosEnvio[0].cod_carpeta;
  //const imgPath = this.reportService.obtenerMembretePorGestion(codigoCarpeta);

  // membretado por fecha del 13 de mayo de  2026
  const fechaDocumento = this.datosEnvio[0].fecha_fiscal;
  const imgPath =this.reportService.obtenerMembretePorFechaOficio(fechaDocumento);

  
  const marcaAgua = this.datosEnvio[0].fecha_aprobacion;

  //margenes por fecha
  /*let gestionObra = parseInt(codigoCarpeta.split('-').pop());
    let margenesDinamicos;
    if (gestionObra >= 2026) {
      margenesDinamicos = [70, 130, 50, 140]; 
    } else {
      margenesDinamicos = [70, 170, 50, 140]; 
    }*/

  //margenes por fecha desde el 13 de mayo de  2026
  const margenesDinamicos = this.reportService.obtenerMargenesporfechaoficio(fechaDocumento);

  //console.log('DATOS MODIFICACION',this.datosEnvio);
  let formatoNumerico: Intl.NumberFormat; //variable para controlar el número de decimales

    if (this.datosEnvio[0].num_decimales === '2') {
      formatoNumerico = new Intl.NumberFormat('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    } else {
        if (this.datosEnvio[0].num_decimales === '5') {
          formatoNumerico = new Intl.NumberFormat('de-DE', {
          minimumFractionDigits: 5,
          maximumFractionDigits: 5
        });
        } else {
          formatoNumerico = new Intl.NumberFormat('de-DE', {
          minimumFractionDigits: this.datosEnvio[0].num_decimales,
          maximumFractionDigits: this.datosEnvio[0].num_decimales
        });
        }
    }


  const formatoNumerico2 = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
    });

    const documentDefinition = {
    pageSize: 'LEGAL' as any,
    background: function(currentPage: any, pageSize: any) { 
      return {
        image: imgPath, 
        width: pageSize.width, 
        height: pageSize.height,
        absolutePosition: {x: 0, y: 0}
            } },

    ...(!marcaAgua && {
        watermark: { text: 'PRELIMINAR', color: 'red', opacity: 0.2, bold: true },
      }
      ),
   
    header: {
      columns: [{ 

               }],
              
            } as any,

    content: [ 
      {
        text: 'INFORME DE ' + this.datosEnvio[0].desc_subtipo,
        style: 'header', alignment: 'center'
      } as any,
      {
        text: this.datosEnvio[0].cod_carpeta + '-' + this.datosInf[0].cite_fis + '-' + this.datosInf[0].correlativofis,
        style: 'subheader', alignment: 'center'
      },
      {
        text: '\n',
      },
      {
          table: {
            widths: ['15%', '85%'],
            body: [
              [
                { text: 'A:', style: 'textTitulo', margin: [0, 5, 0, 5], alignment: 'right' },
                {
                  text: [
                    { text: this.datosInf[0].a_nombre + '\n', style: 'textDato', alignment: 'left' },
                    { text: this.datosInf[0].a_cargo, style: 'textTitulo', alignment: 'left'}
                  ]
                }   
                  
              ],
              //Fila VIA: solo si la condición NO se cumple
              ...(
                //this.datosEnvio[0].desc_cod_da >= 37 && this.datosEnvio[0].desc_cod_da <= 45
                this.datosInf[0].via_nombre
                  ? [ 
                      [
                        { text: 'VIA:', style: 'textTitulo', margin: [0, 5, 0, 5], alignment:'right' },
                        {
                          text: [
                            { text: this.datosInf[0].via_nombre + '\n', style: 'textDato' },
                            { text: this.datosInf[0].via_cargo, style: 'textTitulo' }
                          ],
                          margin: [0, 5, 0, 5]
                        }
                      ]
                    ]
                  : []
              ),
              [
                { text: 'DE:', style: 'textTitulo', margin: [0, 6, 0, 0], alignment: 'right' },
                { 
                  text: [
                    { text: this.datosInf[0].de_nombre_fis + '\n', style: 'textDato', alignment: 'left' },
                    { text: this.datosInf[0].de_cargo_fis, style: 'textTitulo', alignment: 'left' },
                  ]
                },            
              ],
              [
                { text: 'REF.:', style: 'textTitulo', margin: [0, 5, 0, 5], alignment:'right' },
                { text: [
                    { text: this.datosEnvio[0].desc_subtipo + ' Nro.' + this.datosEnvio[0].numero_modificacion + '\n', style: 'textTitulo', margin: [0, 5, 0, 5] },
                    { text: this.datosInf[0].referencia, style: 'textDato', margin: [0, 5, 0, 5] }
                        ]
                }
              ],
              [
                { text: 'FECHA:', style: 'textTitulo', alignment:'right' },
                { text: this.fechaString(this.datosEnvio[0].fecha_fiscal), style: 'textDato' },
              ],
            ],
          },
          layout: {
            hLineWidth: (i: number, node: any) => (i === node.table.body.length ? 1 : 0), // Línea horizontal al final
            vLineWidth: () => 0, // Sin líneas verticales
            hLineColor: () => 'black', // Color de la línea horizontal
            paddingLeft: () => 5, // Espaciado interno izquierdo
            paddingRight: () => 5, // Espaciado interno derecho
            paddingTop: () => 2, // Espaciado interno superior
            paddingBottom: () => 2, // Espaciado interno inferior
          },
          margin: [20, 0, 20, 10], // Márgenes de la tabla
        },
      {
        text: '1.   DATOS DE LA OBRA',
        style: 'textTitulo', margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['*', 300],
          body: [
            [
              { text: 'CÓDIGO:', style: 'textTitulo', alignment: 'right', fillColor: '#dddddd' },
              { text: this.datosEnvio[0].cod_carpeta, style: 'textDato', bold:true, fillColor: '#dddddd' }
            ],
            [
              { text: 'OBRA:\n', style: 'textTitulo', alignment: 'right' },
              { text: this.datosEnvio[0].desc_carpeta + '\n', style: 'textDato' }
            ],
            [
              { text: 'ZONA:\n', style: 'textTitulo', alignment: 'right', fillColor: '#dddddd' },
              { text: this.datosEnvio[0].desc_zona_carpeta + '\n', style: 'textDato', fillColor: '#dddddd' }
            ],
            [
              { text: 'EMPRESA CONTRATISTA:\n', style: 'textTitulo', alignment: 'right' },
              { text: this.datosEnvio[0].proponente_razon_social, style: 'textDato' }
            ],
            [
              { text: 'MONTO CONTRATO INICIAL:\n', style: 'textTitulo', alignment: 'right', fillColor: '#dddddd' },
              { text: 'Bs' + this.formatIfNumber(this.datosEnvio[0].monto_contrato,formatoNumerico2), style: 'textDato', fillColor: '#dddddd' }
            ],
            [
              { text: 'PLAZO DE EJECUCIÓN, CONTRATO INICIAL:', style: 'textTitulo', alignment: 'right' },
              { text: this.datosEnvio[0].plazo_contrato + ' d.c.', style: 'textDato', margin: [0,5,0,0] }
            ],
            [
              { text: 'FECHA INICIO DE OBRA:', style: 'textTitulo', alignment: 'right', fillColor: '#dddddd' },
              { text: this.formatearFecha(this.datosEnvio[0].fecha_inicio_ejecucion), style: 'textDato', fillColor: '#dddddd' }
            ],
            [
              { text: 'FECHA CONCLUSIÓN PROGRAMADA:', style: 'textTitulo', alignment: 'right' },
              { text: this.formatearFecha(this.datosEnvio[0].fecha_recep_provisional), style: 'textDato' }
            ],
            [
              { text: 'TOTAL AMPLIACIÓN DE PLAZO:', style: 'textTitulo', alignment: 'right', fillColor: '#dddddd' },
              { text: this.datosEnvio[0].total_dia_ampliado, style: 'textDato', fillColor: '#dddddd' }
            ],
            [
              { text: 'NUEVA FECHA DE CONCLUSIÓN:', style: 'textTitulo', alignment: 'right' },
              { text: this.formatearFecha(this.datosEnvio[0].nueva_fecha_provisional), style: 'textDato' }
            ],
          ]
        }, margin: [10, 0, 0, 7] 
        //layout: 'noBorders'
      },
      {
        text: 'MODIFICACIONES',
        style: 'textTitulo', margin: [10, 0, 0, 5] 
      },
      {
        table: {
          widths: ['6%','32%','16%','16%','16%','16%','16%'],
          body: [
            [
              { text: 'Nro.', style: 'textTituloT', alignment: 'center', margin: [0, 5, 0, 0], fillColor: '#dddddd' },
              { text: 'TIPO MODIFICACIÓN', style: 'textTituloT', alignment: 'center', margin: [0, 5, 0, 0], fillColor: '#dddddd' },
              { text: 'MODIFICACIÓN DEL MONTO(Bs)', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
              { text: 'MONTO PROPUESTO (Bs)', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
              { text: 'MODIFICACIÓN PLAZO (d.c.)', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
              { text: 'NUEVA FECHA CONCLUSIÓN', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
            ],
            ...this.buildModAprobadas(this.datosModAp,formatoNumerico)
          ]
        }, margin: [10, 0, 0, 0] 
      },
      {
        text: '\n2.   ANTECEDENTES',
        style: 'textTitulo', margin: [0, 0, 0, 5] 
      },
      {
          text: 'En atención al informe de la supervisión ' + this.datosEnvio[0].cod_carpeta + '-' + this.datosInf[0].cite_sup + '-' + this.datosInf[0].correlativosup + 
          ' de fecha ' + this.fechaString(this.datosEnvio[0].fecha_supervisor) + ' emitido por la supervisión de obra, que establece los sustentos necesarios para la presente ' + 
          'modificación referida a: ' + this.datosInf[0].referencia + ' se emite el presente informe.',
          style: 'textDato', alignment:'justify', margin: [10, 0, 0, 0]
      }, 
      {
        text: '\n'
      },
      {
        text: '3.   CONCLUSIONES\n',
        style: 'textTitulo', margin: [0, 0, 0, 5]
      },
      {
        text: [
          { text: 'Habiendo la fiscalización designada revisado y analizado el informe de Supervisión ' + this.datosEnvio[0].cod_carpeta + '-' + this.datosInf[0].cite_sup + 
              '-' + this.datosInf[0].correlativosup + ' de fecha ' + this.fechaString(this.datosEnvio[0].fecha_supervisor) + ' emitido por la supervisión ' + 
              'de obra y en atención a que evidentemente se requiere la modificación a ser introducida a través ' 
          },
          { text: this.datosEnvio[0].id_tipo_mod_pago == 1 
            ? 'del '
            : 'de la '
          },
          { text: this.datosEnvio[0].desc_subtipo + ' Nro.' + 
              this.datosEnvio[0].numero_modificacion + ', a fin de garantizar la conclusión de la obra, así como su utilidad, ésta Fiscalización aprueba el ' + 
              'Informe de Supervisor y recomienda la elaboración y suscripción ' 
          },
          {
            text: this.datosEnvio[0].id_tipo_mod_pago == 1 
            ? 'del '
            : 'de la '
          },
          { text: this.datosEnvio[0].desc_subtipo + ' Nro.' + this.datosEnvio[0].numero_modificacion + 
              ' por ' + this.datosInf[0].referencia + '. Se adjunta toda la documentación enviada al efecto por la Supervisión de Obra.',}
        ], style: 'textDato', alignment:'justify', margin: [10, 0, 0, 0]
      },
      {
        text: ['\n'],
      }, 
      {
        text: 'Es cuánto se informa para los fines consiguientes.',
        style: 'textDato', alignment:'justify', margin: [10, 0, 0, 0]
      },
      {
        text: ['\n'],
      },
      {
        table: {
          widths: ['50%', '50%'],
          body: (
            this.datosInf?.[0]?.de_nombre_fis
              ? this.datosInf[0].de_nombre_fis.split('\n')
              : ['']
          ).map((nombre: string) => [
            { text: [
                { text: nombre + '\n', style: 'textDato' },
                { text: 'FISCAL DE OBRA', style: 'textDato', bold: true }
              ], 
              margin: [0, 35, 0, 0], 
              alignment: 'center'
            },
            { text: '(Firma y Sello)', 
              style: 'textDato', alignment: 'center', margin: [0, 45, 0, 0] 
            }
          ])
        },
        margin: [20, 0, 20, 0],
        layout: {
          hLineColor: () => '#444444',
          vLineColor: () => '#444444',
          hLineWidth: () => 0.7,
          vLineWidth: () => 0.7
        }
      },
      {
        text: ['\n\ncc:Arch:' ],
        style: 'footerText'
      },
      {
        
      } as any,
    ],

    footer: function(currentPage: { toString: () => string; }, pageCount: string) 
          { //return currentPage.toString() + ' of ' + pageCount; 
            return {
              columns:[
                  { text: currentPage.toString() + ' de ' + pageCount , alignment: 'right', style: 'footerText', margin: [0,0,30,0]} 
                      ]
              }            
          } as any,
    
    styles: {
      header: {
        fontSize: 14,
        bold: true,
      },
      subheader: {
        fontSize: 12,
        bold: true,
      },
      textTitulo: {
        fontSize: 9,
        bold: true,
        //opacity: 0.8,
      },
      textTituloT: {
        fontSize: 7,
        bold: true,
        //opacity: 0.8,
      },
      footerText: {
        fontSize: 6,
        bold: false,          
      },
      textDato: {
        fontSize: 9,
        bold: false,
        opacity: 0.8,
      },
      textDatoT: {
        fontSize: 7,
        bold: false,
        opacity: 0.8,
      },
    },
    //margenes dinamicos
    pageMargins: margenesDinamicos as any, // Márgenes: izquierda, arriba, derecha, abajo

  };
  // Generar el PDF en memoria
  const pdfDoc = this.printer.createPdfKitDocument(documentDefinition);
  let chunks: Buffer[] = [];

  return new Promise<Buffer>((resolve, reject) => {
    pdfDoc.on('data', (chunk) => {
      chunks.push(chunk);
    });
    pdfDoc.on('end', () => {
      const result = Buffer.concat(chunks);
      resolve(result);
    });
    pdfDoc.end();
  });
}

//------------------FUNCIONES ------------------------
//funcion para generar la fecha en formato dd/mm/aaa
    formatearFecha(iso: string | null | undefined): string | undefined {
    if (!iso) return undefined; // No hace nada si iso es null, undefined o ''
    
    const fecha = new Date(iso);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Enero = 0
    const anio = fecha.getFullYear();
    
    return `${dia}/${mes}/${anio}`;
   }

   //Funcion para generar la fecha de manera escrita
  fechaString(iso: string): string {
    let formattedDate = '';
    let fecha: Date;

    if (iso === 'hoy') {
      fecha = new Date();
    } else {
      fecha = new Date(iso);
    }

    if (iso) {
      const h = fecha.getHours();
      const m = fecha.getMinutes();
      const horas = h < 10 ? `0${h}` : `${h}`;
      const minutos = m < 10 ? `0${m}` : `${m}`;

      // Formatea la fecha
      formattedDate = fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
     }

    return formattedDate;
  }

    // Función para poblar la tabla de modificaciones aprobadas
     buildModAprobadas(data: any, formatoNumerico: Intl.NumberFormat) {

    const formatoNumerico2 = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
    });
    
    let datosResp = data;
    let arrayData = [];
    let totalvariacion = 0;
    let totalplazo = 0;

    var c = 0;
    for (let i = 0; i < datosResp.length; i++) {
      const totalmodif = Number(datosResp[i].monto_variacion) || 0;
      totalvariacion += totalmodif;

      const plazo = Number(datosResp[i].dias_variacion) || 0;
      totalplazo += plazo;

      c = c + 1;
      let rowData = [
        { text: [{ text: c, style: 'textDatoT', alignment: 'center' }] },
        { text: [{ text: datosResp[i].tipo_mod, style: 'textDatoT' }] },
        { text: [{ text: this.formatIfNumber(datosResp[i].monto_variacion,formatoNumerico2), alignment: 'right', style: 'textDatoT' }] },
        { text: [{ text: this.formatIfNumber(datosResp[i].monto_total,formatoNumerico2), style: 'textDatoT', alignment: 'right' }] },
        { text: [{ text: datosResp[i].dias_variacion, style: 'textDatoT', alignment: 'center' }] },
        { text: [{ text: this.formatearFecha(datosResp[i].nueva_conclusion), style: 'textDatoT', alignment: 'center' }] },
      ];
      arrayData.push(rowData);
    }
    // Fila final con total
      const totalRow = [
        {
          colSpan: 2,
          text: 'TOTAL:',
          style: 'textTituloT', alignment: 'center',
        },
        {},
        { text: this.formatIfNumber(totalvariacion, formatoNumerico2),
          style: 'textTituloT', alignment: 'right' }, 
        {}, 
        { text: totalplazo,
          style: 'textTituloT', alignment: 'center' },
        { text: ' ',
          style: 'textTituloT', alignment: 'center', },
      ];

    arrayData.push(totalRow);
    return arrayData;
  }

  // FORMATO DE NUMEROS
  private formatIfNumber(value: any, formatter: Intl.NumberFormat): string {
    if (value === null || value === undefined || value === '') return '';
    
    const num = Number(value);
    if (isNaN(num)) return '';

    return formatter.format(num);
}

}