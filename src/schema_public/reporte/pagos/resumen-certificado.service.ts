import { Injectable, Inject, Body } from '@nestjs/common';
//import * as PdfPrinter from 'pdfmake/src/printer';
import PdfPrinter from 'pdfmake';
import * as path from 'path';
import * as fs from 'fs';
import { ResponseService } from 'src/response.service';
import { Sequelize } from 'sequelize-typescript';
import { Console, log, table } from 'console';
import { existsSync } from 'fs'
import { join } from 'path';
import { text } from 'stream/consumers';

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
export class ResumenCertificado {
    datosEnvio: any = [];
    datosSup: any = [];
    datosFis: any = [];
    datosMV: any = [];
    datosUM: any = [];
    datosDes: any = [];
    datosCA: any = [];
    datosMultas: any = [];

    constructor(
      private readonly responseService: ResponseService,
      @Inject(Sequelize) private sequelize: Sequelize, // Inyecta Sequelize correctamente
    ) { this.printer = new PdfPrinter(fonts); }
  
    private readonly printer = new PdfPrinter(fonts);
    private getImageBase64(imagePath: string): string {
      const image = fs.readFileSync(imagePath);
      return image.toString('base64');
    }
  
  //CONSULTAS

    // Datos generales obra - contrato - pago
    async datosGeneralesObraModif(id_modif_pago: number) {
      const query = `
          SELECT * 
          FROM public."vista_reporte_pago_gral" WHERE id_modificacion_pago = ${id_modif_pago}`;
      const resultado = await this.sequelize.query(query);
      return resultado[0];
   }

    
     // SUPERVISORES designados por obra 
    async supervisorDesignado(obra: number) {
      const query1 = `
          SELECT * 
          FROM public."vista_supervisores_obra" WHERE id_obra = ${obra}`;
      const resultado1 = await this.sequelize.query(query1);
      return resultado1[0];
   }

      // FISCALES designados por obra 
    async fiscalDesignado(obra: number) {
      const query2 = `
          SELECT * 
          FROM public."vista_fiscales_obra" WHERE id_obra = ${obra}`;
      const resultado2 = await this.sequelize.query(query2);
      return resultado2[0];
   }

      // Datos listado de modificaciones aprobadas
    async datosModifVariacion(obra: number) {
      const query3 = `
          SELECT * 
          FROM public."vista_reporte_resumen_modif" WHERE id_obra = ${obra}`;
      const resultado3 = await this.sequelize.query(query3);
      return resultado3[0];
   }

     // Datos ultima modificacion aprobada
    async datosUltimaModif(obra: number) {
      const query4 = `
          SELECT * 
          FROM public.f_reporte_ultima_modificacion(${obra})`;
      const resultado4 = await this.sequelize.query(query4);
      return resultado4[0];
   }

    // Datos Descuentos
    async datosDescuentos(obra: number, id_modif_pago: number) {
      const query5 = `
          SELECT * 
          FROM public.f_reporte_resumen_descuentos(${obra},${id_modif_pago})`;
      const resultado5 = await this.sequelize.query(query5);
      return resultado5[0];
   }

   // Datos Total Certificados Anteriores
    async datosCertificadoAnt(obra: number, id_modif_pago: number) {
      const query6 = `
          SELECT * 
          FROM public.f_reporte_resumen_total_certificado(${obra},${id_modif_pago})`;
      const resultado6 = await this.sequelize.query(query6);
      return resultado6[0];
   }

   // Datos Lista Multas
    async datosListaMultas(obra: number) {
      const query7 = `
          SELECT * 
          FROM public."vista_reporte_resumen_multas" WHERE id_obra = (${obra})`;
      const resultado7 = await this.sequelize.query(query7);
      return resultado7[0];
   }

  // REPORTE - RESUMEN DE CERTIFICADO DE PAGO

async generateResumenCertificado(id_modif_pago: number): Promise<Buffer> {

    const datosGenerales = await this.datosGeneralesObraModif(id_modif_pago);
    if ((!datosGenerales || (Array.isArray(datosGenerales) && datosGenerales.length === 0) || (typeof datosGenerales === 'object' && Object.keys(datosGenerales).length === 0))){
      throw new Error('No se encontraron datos para el ID de la obra proporcionada');
    }
    this.datosEnvio = datosGenerales;

    const res1 = await this.supervisorDesignado(this.datosEnvio[0].id_obra);
    if (!res1 || (Array.isArray(res1) && res1.length === 0) || (typeof res1 === 'object' && Object.keys(res1).length === 0)) {
        throw new Error('No se encontraron datos del supervisor designado');
    }
    this.datosSup = res1;

    const res2 = await this.fiscalDesignado(this.datosEnvio[0].id_obra);
    if (!res2 || (Array.isArray(res2) && res2.length === 0) || (typeof res2 === 'object' && Object.keys(res2).length === 0)) {
        throw new Error('No se encontraron datos del fiscal designado');
    }
    this.datosFis = res2;

    const res3 = await this.datosModifVariacion(this.datosEnvio[0].id_obra);
    this.datosMV = res3;

    const res4 = await this.datosUltimaModif(this.datosEnvio[0].id_obra);
    this.datosUM = res4;

    const res5 = await this.datosDescuentos(this.datosEnvio[0].id_obra, id_modif_pago);
    if (!res5 || (Array.isArray(res5) && res5.length === 0) || (typeof res5 === 'object' && Object.keys(res5).length === 0)) {
        throw new Error('No se encontraron datos de los descuentos');
    }
    this.datosDes = res5;

    const res6 = await this.datosCertificadoAnt(this.datosEnvio[0].id_obra, id_modif_pago);
    this.datosCA = res6;
    
    const res7 = await this.datosListaMultas(this.datosEnvio[0].id_obra);
    this.datosMultas = res7;

    const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
    const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
    //const imgPath = 'assets/images/membretado_oficio.png';
    const imgLogo = 'assets/images/logoSGEO.png';
    const marcaAgua = this.datosEnvio[0].fecha_aprobacion;

    let formatoNumerico: Intl.NumberFormat; //variable para controlar el número de decimales

    if (this.datosEnvio[0].modalidad === 'CONTRATACION DIRECTA') {
      formatoNumerico = new Intl.NumberFormat('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    } else {
      formatoNumerico = new Intl.NumberFormat('de-DE', {
        minimumFractionDigits: 5,
        maximumFractionDigits: 5
      });
    }

    const formatoNumerico2 = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
    });
 
   //console.log('DATOS MODIFICACION',this.datosMV);
   //console.log('DATOS 2',this.datosDes[0].deduccion_total);

    const totalamortizado = Number(this.datosEnvio[0].monto_anticipo) + Number(this.datosDes[0].deduccion_total);
    const totalcertificado = Number(this.datosEnvio[0].monto_presente || 0) + Number(this.datosCA[0].total_certificado_anterior || 0);
    const saldo = Number(this.datosUM[0].monto_total || 0) - Number(this.datosEnvio[0].importe_por_pagar || 0);
    
    const documentDefinition = {
    pageSize: 'LEGAL' as any,
    
    ...(!marcaAgua && {
        watermark: { text: 'PRELIMINAR', color: 'red', opacity: 0.2, bold: true },
      }
      ),

    header: {
      columns: [
              { image: imgLogo, width: 130, margin: [5,5,0,0] },
      ],
      
    } as any,

    content: [ 
      {
        text: 'GOBIERNO AUTÓNOMO MUNICIPAL DE LA PAZ\n' + 'RESUMEN DEL CERTIFICADO DE PAGO ' + this.datosEnvio[0].detalle + ' Nro.' + this.datosEnvio[0].numero_pago,
        style: 'subheader', alignment: 'center'
      } as any,
      {
        text: '\n',
      },
      {
        //Tabla encabezado
        table: {
          widths: ['12%', '38%', '20%', '30%'],
          body: [
            [
              { text: 'CONTRATISTA:', style: 'textTitulo', alignment: 'left', fillColor: '#dddddd' },
              { text: this.datosEnvio[0].proponente_razon_social, style: 'textDato', fillColor: '#dddddd' },
              { text: 'CERTIFICADO Nro.:', style: 'textTitulo', alignment: 'left', fillColor: '#dddddd' },
              { text: this.datosEnvio[0].numero_pago, style: 'textDato', fillColor: '#dddddd' }
            ],
            [
              { text: 'REPRESENTANTE:', style: 'textTitulo', alignment: 'left'},
              { text: this.datosEnvio[0].proponente_representante, style: 'textDato'},
              { text: 'PARTIDA:', style: 'textTitulo', alignment: 'left'},
              { text: this.datosEnvio[0].partidas_sim2, style: 'textDato'}
            ],
            [
              { text: 'CÓDIGO:', style: 'textTitulo', alignment: 'left', fillColor: '#dddddd' },
              { text: this.datosEnvio[0].cod_carpeta, style: 'textDato', fillColor: '#dddddd' },
              { text: 'Nro. CONTRATO:', style: 'textTitulo', alignment: 'left', fillColor: '#dddddd' },
              { text: this.datosEnvio[0].numero_contrato, style: 'textDato', fillColor: '#dddddd' }
            ],
            [
              { text: 'OBRA:', style: 'textTitulo', alignment: 'left', margin:[0, 4, 0, 0] },
              { text: this.datosEnvio[0].desc_carpeta, style: 'textDato' },
              { text: 'FECHA CONTRATO:', style: 'textTitulo', alignment: 'left', margin:[0, 4, 0, 0] },
              { text: this.formatearFecha(this.datosEnvio[0].fecha_numeracion), style: 'textDato', margin:[0, 4, 0, 0] }
            ],
            [
              { text: 'DISTRITO:', style: 'textTitulo', alignment: 'left', fillColor: '#dddddd' },
              { text: this.datosEnvio[0].desc_distrito_carpeta, style: 'textDato', fillColor: '#dddddd' },
              { text: 'FECHA PRESENTACIÓN:', style: 'textTitulo', alignment: 'left', fillColor: '#dddddd' },
              { text: this.formatearFecha(this.datosEnvio[0].fecha_aprobacion_pago), style: 'textDato', fillColor: '#dddddd' }
            ],           
          ]
        }, layout: 'noBorders'
      },
      {
        //Tabla vacia - Espacio
        table: {
          widths: ['*'],
          body: [
            []
          ]
        }, layout: 'noBorders'
      },
      {
        // Tabla de contenido central de 2 columnas
        table: {
          widths: ['50%', '50%'],
          body: [
            [ 
              [ //COLUMNA IZQUIERDA 
                {
                  table: {
                    widths: ['*'],
                    body: [
                      [
                        { text: 'PLAZOS DE EJECUCIÓN', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd'} 
                      ]
                    ]
                  }, layout: {
                      //hLineColor: () => '#121111', // color gris opaco para líneas horizontales
                      //vLineColor: () => '#121111', // color gris opaco para líneas verticales
                      hLineWidth: () => 0.7,       // grosor más fino
                      vLineWidth: () => 0
                      }
                },
                { table: {
                    widths: ['50%','50%'],
                    body: [
                            [{ text: 'Fecha orden de proceder:', style: 'textTitulo', alignment: 'left'},
                             { text: this.formatearFecha(this.datosEnvio[0].fecha_inicio_ejecucion), style: 'textDato', alignment: 'left'}
                            ],
                            [{ text: 'Plazo contrato inicial:', style: 'textTitulo', alignment: 'left'},
                             { text: this.datosEnvio[0].plazo_contrato + ' d.c.', style: 'textDato', alignment: 'left'}
                            ],
                            [{ text: 'Conclusión programada según contrato inicial:', style: 'textTitulo', alignment: 'left'},
                             { text: this.formatearFecha(this.datosEnvio[0].fecha_recep_provisional), style: 'textDato', alignment: 'left'}
                            ],
                            ...this.buildModificacionesPlazo(this.datosMV),
                            ...(this.datosUM.length > 0
                                  ? [
                                      [
                                        { text: 'Conclusión programada:', style: 'textTitulo', alignment: 'left' },
                                        { text: this.formatearFecha(this.datosUM[0].nueva_fecha_provisional), style: 'textDato', alignment: 'left' }
                                      ]
                                    ]
                                  : []
                                ),
                            [{ text: 'Fecha conclusión real:', style: 'textTitulo', alignment: 'left'},
                             { text: this.formatearFecha(this.datosEnvio[0].fecha_acta), style: 'textDato', alignment: 'left'}
                            ],
                            [{ text: 'Periodo certificado:', style: 'textTitulo', alignment: 'left'},
                             { text: 'Del ' + this.formatearFecha(this.datosEnvio[0].fecha_inicio_periodo) + ' al ' + this.formatearFecha(this.datosEnvio[0].fecha_fin_periodo), style: 'textDato', alignment: 'left'}
                            ]
                    ]
                  }, layout: 'noBorders' 
                },
                {
                  table: {
                    widths: ['*'],
                    body: [
                      [
                        { text: 'DEDUCCIONES', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd'} 
                      ]
                    ]
                  }, layout: {
                      //hLineColor: () => '#121111', // color gris opaco para líneas horizontales
                      //vLineColor: () => '#121111', // color gris opaco para líneas verticales
                      hLineWidth: () => 0.7,       // grosor más fino
                      vLineWidth: () => 0
                      }
                },
                {
                  table: {
                    widths: ['50%','50%'],
                    body: [
                            [{ text: 'Anticipo:', style: 'textTitulo', alignment: 'left'},
                             { text: this.formatIfNumber(this.datosEnvio[0].monto_anticipo,formatoNumerico2) + ' Bs.', style: 'textDato', alignment: 'right', margin: [0, 0, 10, 0]}
                            ],
                            [{ text: 'Deducción certificados anteriores:', style: 'textTitulo', alignment: 'left'},
                             { text: this.formatIfNumber(this.datosDes[0].deduccion_anterior,formatoNumerico2) + ' Bs.', style: 'textDato', alignment: 'right', margin: [0, 0, 10, 0]}
                            ],
                            [{ text: 'Deducción presente certificado:', style: 'textTitulo', alignment: 'left'},
                             { text: this.formatIfNumber(this.datosDes[0].deduccion_presente,formatoNumerico2) + ' Bs.', style: 'textDato', alignment: 'right', margin: [0, 0, 10, 0]}
                            ],
                            [{ text: 'Total amortizado:', style: 'textTitulo', alignment: 'left'},
                             { text: this.formatIfNumber(totalamortizado,formatoNumerico2) + ' Bs.', style: 'textTitulo', alignment: 'right', margin: [0, 0, 10, 0]}
                            ]
                            
                    ]
                  }, layout: 'noBorders' 
                  
                },
                {
                  table: {
                    widths: ['*'],
                    body: [
                      [
                        { text: 'RETENCIONES', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' }
                      ]
                    ]
                  }, layout: {
                      //hLineColor: () => '#121111', // color gris opaco para líneas horizontales
                      //vLineColor: () => '#121111', // color gris opaco para líneas verticales
                      hLineWidth: () => 0.7,       // grosor más fino
                      vLineWidth: () => 0
                      }
                },
                {
                  table: {
                    widths: ['50%','50%'],
                    body: [
                            [{ text: 'Retención certificados anteriores:', style: 'textTitulo', alignment: 'left'},
                            { text: this.formatIfNumber(this.datosDes[0].retencion_anterior,formatoNumerico2) + ' Bs.', style: 'textDato', alignment: 'right', margin: [0, 0, 10, 0]}
                            ],
                            [{ text: 'Retención presente certificado:', style: 'textTitulo', alignment: 'left'},
                            { text: this.formatIfNumber(this.datosDes[0].retencion_presente,formatoNumerico2) + ' Bs.', style: 'textDato', alignment: 'right', margin: [0, 0, 10, 0]}
                            ],
                            [{ text: 'Total retenciones:', style: 'textTitulo', alignment: 'left'},
                            { text: this.formatIfNumber(this.datosDes[0].retencion_total,formatoNumerico2) + ' Bs.', style: 'textTitulo', alignment: 'right', margin: [0, 0, 10, 0]}
                            ]
                    ]
                  }, layout: 'noBorders' 
                },
                {
                  table: {
                    widths: ['*'],
                    body: [
                      [
                        { text: 'MULTAS', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' }
                      ]
                    ]
                  }, layout: {
                      //hLineColor: () => '#121111', // color gris opaco para líneas horizontales
                      //vLineColor: () => '#121111', // color gris opaco para líneas verticales
                      hLineWidth: () => 0.7,       // grosor más fino
                      vLineWidth: () => 0
                      }
                },
                {
                  table: {
                    widths: ['15%','*','45%'],
                    body: [
                      [
                        {text: 'Nº', style: 'textTitulo', alignment: 'left' },
                        {text: 'DETALLE', style: 'textTitulo', alignment: 'left' },
                        {text: 'MONTO', style: 'textTitulo', alignment: 'right', margin: [0, 0, 20, 0] },
                      ],
                      ...this.buildListaMultas(this.datosMultas)
                    ]
                  }, layout: 'noBorders'
                  
                } 
              ],
              [  //COLUMNA DERECHA 
                {
                  table: {
                    widths: ['*'],
                    body: [
                      [
                        { text: 'DETALLE DE MONTOS ', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd'} 
                      ]
                    ]
                  }, layout: {
                      //hLineColor: () => '#121111', // color gris opaco para líneas horizontales
                      //vLineColor: () => '#121111', // color gris opaco para líneas verticales
                      hLineWidth: () => 0.7,       // grosor más fino
                      vLineWidth: () => 0
                      }
                },
                { 
                  table: {
                    widths: ['50%','50%'],
                    body: [
                            [{ text: 'Monto contrato inicial:', style: 'textTitulo', alignment: 'left'},
                            { text: this.formatIfNumber(this.datosEnvio[0].monto_contrato,formatoNumerico2) + ' Bs.', style: 'textTitulo', alignment: 'right', margin: [0, 0, 30, 0]}
                            ],
                            ...this.buildModificacionesVariacion(this.datosMV),
                            ...(this.datosUM.length > 0
                                  ? [
                                      [
                                        { text: 'Total autorizado:', style: 'textTitulo', alignment: 'left' },
                                        { text: this.formatIfNumber(this.datosUM[0].monto_total,formatoNumerico2) + ' Bs.', style: 'textTitulo', alignment: 'right', margin: [0, 0, 30, 0] }
                                      ]
                                  ]
                                  : [
                                      [
                                        { text: 'Total autorizado:', style: 'textTitulo', alignment: 'left'},
                                        { text: this.formatIfNumber(this.datosEnvio[0].monto_contrato,formatoNumerico2) + ' Bs.', style: 'textTitulo', alignment: 'right', margin: [0, 0, 30, 0]}
                                      ]
                                  ]
                                ),
                            ...(this.datosEnvio[0].numero_pago > 1 //Si es el primer pago NO se muestra Importes anteriores
                            ?[
                                { text: 'Importe certificados anteriores:', style: 'textTitulo', alignment: 'left'},
                                { text: this.formatIfNumber(this.datosCA[0].total_certificado_anterior,formatoNumerico2) + ' Bs.', 
                                  style: 'textDato', alignment: 'right', margin: [0, 0, 30, 0]}
                            ]
                            :[]
                            ),
                            [{ text: 'Importe presente certificado:', style: 'textTitulo', alignment: 'left'},
                             { text: this.formatIfNumber(this.datosEnvio[0].monto_presente,formatoNumerico2) + ' Bs.', 
                                style: 'textDato', alignment: 'right', margin: [0, 0, 30, 0]}
                            ],
                            [{ text: 'Total certificados a la fecha:', style: 'textTitulo', alignment: 'left'},
                             { text: this.formatIfNumber(totalcertificado,formatoNumerico2) + ' Bs.', 
                              style: 'textDato', alignment: 'right', margin: [0, 0, 30, 0]}
                            ],
                            [{ text: 'Importe presente certificado:', style: 'textTitulo', alignment: 'left'},
                             { text: this.formatIfNumber(this.datosEnvio[0].monto_presente,formatoNumerico2) + ' Bs.', 
                                style: 'textTitulo', alignment: 'right', margin: [0, 0, 30, 0]}
                            ],
                            [{ text: 'Deducciones:', style: 'textTitulo', alignment: 'left'},
                             { text: '(-)' + this.formatIfNumber(this.datosDes[0].deduccion_presente,formatoNumerico2) + ' Bs.', 
                                style: 'textDato', alignment: 'right', margin: [0, 0, 30, 0]}
                            ],
                            [{ text: 'Retenciones:', style: 'textTitulo', alignment: 'left'},
                             { text: '(-)' + this.formatIfNumber(this.datosDes[0].retencion_presente,formatoNumerico2) + ' Bs.', 
                                style: 'textDato', alignment: 'right', margin: [0, 0, 30, 0]}
                            ],
                            [{ text: 'Multas:', style: 'textTitulo', alignment: 'left'},
                             { text: '(-)' + this.formatIfNumber(this.datosDes[0].multa_presente,formatoNumerico2) + ' Bs.', 
                                style: 'textDato', alignment: 'right', margin: [0, 0, 30, 0]}
                            ],
                            [{ text: 'Importe por pagar (Bs):', style: 'textTitulo', alignment: 'left'},
                             { text: this.formatIfNumber(this.datosEnvio[0].importe_por_pagar,formatoNumerico2) + ' Bs.', 
                                style: 'textTitulo', alignment: 'right', margin: [0, 0, 30, 5]}
                            ]
                    ]
                  }, layout: 'noBorders'
                },
                {
                  table: {
                    widths: ['*'],
                    body: [
                      [
                        { text: this.convertToWords(this.formatIfNumber(this.datosEnvio[0].importe_por_pagar,formatoNumerico2), 'Bs.'), style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                      ],
                    ]
                  }, layout: 'noBorders' //{
                      //hLineColor: () => '#121111', // color gris opaco para líneas horizontales
                      //vLineColor: () => '#121111', // color gris opaco para líneas verticales
                      //hLineWidth: () => 0.7,       // grosor más fino
                      //vLineWidth: () => 0
                      //}
                },
                {
                  table: {
                    widths: ['50%','50%'],
                    body: [
                            [{ text: 'Saldo:', style: 'textTitulo', alignment: 'left'},
                             { text: this.formatIfNumber(saldo,formatoNumerico2) + ' Bs.', 
                                style: 'textDato', alignment: 'right', margin: [0, 0, 30, 0]}
                            ],
                            [{ text: '% A pagar**:', style: 'textTitulo', alignment: 'left'},
                             { text: this.formatIfNumber(this.datosEnvio[0].porcentaje_presente,formatoNumerico2) + ' % ', 
                                style: 'textDato', alignment: 'right', margin: [0, 0, 30, 0]}
                            ],
                            [{ text: '% Acumulado**:', style: 'textTitulo', alignment: 'left'},
                             { text: this.formatIfNumber(this.datosEnvio[0].porcentaje_acumulado,formatoNumerico2) + ' % ', 
                                style: 'textDato', alignment: 'right', margin: [0, 0, 30, 0]}
                            ]
                    ]
                  }, layout: 'noBorders' 
                },
                {
                  text: '\n'
                },
                {
                  table: {
                    widths: ['*'],
                    body: [
                      [
                        [{ text: '**Porcentaje respecto al monto de contrato inicial.', style: 'textDato', colSpan: 2, alignment: 'left', fillColor: '#dddddd' }, {}],
                      ],
                    ]
                  }, layout:'noBorders'
                }
              ]
              
            ],        
          ]
        }, layout: {
            hLineWidth: (i: number, node: any) => (i === node.table.body.length ? 0.7 : 0), // Línea horizontal al final
            vLineWidth: () => 0, // Sin líneas verticales
            hLineColor: () => 'black', // Color de la línea horizontal
            paddingLeft: () => 5, // Espaciado interno izquierdo
            paddingRight: () => 5, // Espaciado interno derecho
            paddingTop: () => 2, // Espaciado interno superior
            paddingBottom: () => 2, // Espaciado interno inferior
            }
      },
      {
        text: '\n',
      },
      {
        table: {
          widths: ['50%', '50%'],
          body: [
            [
              [ { text: '\n\n\n\n\n' + this.datosEnvio[0].proponente_razon_social, style: 'textDato', alignment: 'center' },
                { text: 'EMPRESA CONTRATISTA', style: 'textTitulo', alignment: 'center'}
              ],
              { text: '\n\n\n\n\n\n' + 'FIRMA Y SELLO', style: 'textTitulo', alignment: 'center' }
            ]
          ]
        }, margin: [20,0,20,0], 
           layout: {
            hLineColor: () => '#444444', // color gris opaco para líneas horizontales
            vLineColor: () => '#444444', // color gris opaco para líneas verticales
            hLineWidth: () => 0.7,       // grosor más fino
            vLineWidth: () => 0.7
            }
      },
      {
          table: {
            widths: ['50%','50%'],
            body: [
              ...this.buildSupervisores(this.datosSup)
              ]
          }, margin: [20,0,20,0], 
            layout: {
            hLineColor: () => '#444444', // color gris opaco para líneas horizontales
            vLineColor: () => '#444444', // color gris opaco para líneas verticales
            hLineWidth: () => 0.7,       // grosor más fino
            vLineWidth: () => 0.7
            } 
      },
      {
          table: {
            widths: ['50%','50%'],
            body: [
              ...this.buildFiscales(this.datosFis)
              ]
          }, margin: [20,0,20,0], 
            layout: {
            hLineColor: () => '#444444', // color gris opaco para líneas horizontales
            vLineColor: () => '#444444', // color gris opaco para líneas verticales
            hLineWidth: () => 0.7,       // grosor más fino
            vLineWidth: () => 0.7
            } 
      },
      {
        table: {
          widths: ['50%', '50%'],
          body: [
            [
              [ { text: '\n\n\n\n\n\n', style: 'textDato', alignment: 'center' },
                { text: 'DIRECCIÓN DE FISCALIZACIÓN DE OBRAS', style: 'textTitulo', alignment: 'center'}
              ],
              { text: '\n\n\n\n\n\n' + 'FIRMA Y SELLO', style: 'textTitulo', alignment: 'center' }
            ]
          ]
        }, margin: [20,0,20,0], 
           layout: {
            hLineColor: () => '#444444', // color gris opaco para líneas horizontales
            vLineColor: () => '#444444', // color gris opaco para líneas verticales
            hLineWidth: () => 0.7,       // grosor más fino
            vLineWidth: () => 0.7
            }
      },
      {
        text: ['\n\n\nCc.Arch.Supervisor' ],
        style: 'footerText'
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
        fontSize: 11,
        bold: true,
      },
      textTitulo: {
        fontSize: 6,
        bold: true,
        //opacity: 0.8,
      },
      textTitulo2: {
        fontSize: 7,
        bold: true,
        //opacity: 0.8,
      },
      footerText: {
        fontSize: 6,
        bold: false,          
      },
      textDato: {
        fontSize: 6,
        bold: false,
        //color: 'gray', 
        opacity: 0.8,
      },
      textDato2: {
        fontSize: 7,
        //bold: false,
        //color: 'gray', 
        opacity: 0.8,
      },
    },
    pageMargins: [50, 55, 30, 30] as any, // Márgenes: izquierda, arriba, derecha, abajo

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

//-------------- FUNCIONES ------------------------------------
 //funcion para generar la fecha en formato dd/mm/aaa
formatearFecha(iso: string | null | undefined): string | undefined {
  if (!iso) return undefined;

  if (typeof iso !== 'string') {
    // Si no es string, lo convertimos a string (opcional) o devolvemos undefined
    iso = String(iso);
  }

  // Intentamos detectar el formato YYYY-MM-DD
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, anio, mes, dia] = match;
    return `${dia}/${mes}/${anio}`;
  }

  // Si no coincide, probamos con Date
  const fecha = new Date(iso);
  if (isNaN(fecha.getTime())) {
    return undefined;  // Fecha inválida
  }

  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = fecha.getFullYear();

  return `${dia}/${mes}/${anio}`;
}

  //Función para generar la fecha de manera escrita
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

  //Cargar tabla de SUPERVISORES - CON RECUADRO
    buildSupervisores(data: any[]) {
      const arrayData = [];
  
      for (const persona of data) {
        const nombreCompleto = [
          persona.profesion,
          persona.nombre,
          persona.primer_apellido,
          persona.segundo_apellido
        ]
        .filter(Boolean) // elimina null, undefined, o strings vacíos
        .join(' ');
  
        const rowData = [
          { text: [
                { text: nombreCompleto + '\n', style: 'textDato' },
                { text: 'SUPERVISOR DE OBRA', bold: true, style: 'textTitulo' }
                  ],
                alignment: 'center', margin: [0, 35, 0, 0]},
          { text: 'FIRMA Y SELLO', style: 'textTitulo', alignment: 'center', margin: [0, 45, 0, 0] }
        ];
        arrayData.push(rowData);
      }
      return arrayData;
    }

  //Cargar tabla de FISCALES - CON RECUADRO
    buildFiscales(data: any[]) {
      const arrayData = [];
  
      for (const persona of data) {
        const nombreCompleto = [
          persona.profesion,
          persona.nombre,
          persona.primer_apellido,
          persona.segundo_apellido
        ]
        .filter(Boolean) // elimina null, undefined, o strings vacíos
        .join(' ');
  
        const rowData = [
          { text: [
                { text: nombreCompleto + '\n', style: 'textDato' },
                { text: 'FISCAL DE OBRA', bold: true, style: 'textTitulo' }
                  ],
                alignment: 'center', margin: [0, 35, 0, 0]},
          { text: 'FIRMA Y SELLO', style: 'textTitulo', alignment: 'center', margin: [0, 45, 0, 0] }
        ];
        arrayData.push(rowData);
      }
      return arrayData;
    }

    //RESUMEN datos monto variacion - modificaciones aprobadas
  buildModificacionesVariacion(data: any[]) {
    const formatoNumerico2 = new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    let datosPl = data;
    let arrayData = [];
    
    for (let i = 0; i < datosPl.length; i++) {
      let rowData = [
        { text: datosPl[i].texto_monto_variacion?? '', style: 'textDato', alignment: 'left', margin: [0, 0, 30, 0] },
        { text: this.formatIfNumber(datosPl[i].monto_variacion, formatoNumerico2) + ' Bs.', style: 'textDato', alignment: 'right', margin: [0, 0, 30, 0] },
      ];
      arrayData.push(rowData);
    }
      return arrayData;
  }

    //RESUMEN datos plazo variacion - modificaciones aprobadas
  buildModificacionesPlazo(data: any[]) {
    const formatoNumerico2 = new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    let datosPl = data;
    let arrayData = [];
    
    for (let i = 0; i < datosPl.length; i++) {
      let rowData = [
        { text: datosPl[i].texto_dias_variacion?? '', style: 'textDato', alignment: 'left', margin: [0, 0, 30, 0] },
        { text: datosPl[i].dias_variacion + ' d.c.', style: 'textDato', alignment: 'left', margin: [0, 0, 30, 0] },
      ];
      arrayData.push(rowData);
    }
      return arrayData;
  }

    //Lista multas por obra
  buildListaMultas(data: any[]) {
    const formatoNumerico2 = new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    let datosPl = data;
    let arrayData = [];
    var c = 0;
    for (let i = 0; i < datosPl.length; i++) {
      c = c + 1;
      let rowData = [
        { text: c, style: 'textDato', alignment: 'left' },
        { text: datosPl[i].detalle?? '', style: 'textDato', alignment: 'left' },
        { text: '(-)' + this.formatIfNumber(datosPl[i].monto,formatoNumerico2) + ' Bs.', style: 'textDato', alignment: 'right', margin: [0, 0, 10, 0] },
      ];
      arrayData.push(rowData);
    }

    // Fila final con total
    const totalRow = [
      { colSpan: 2,
        text: 'Total multas:', style: 'textTitulo', alignment: 'left'}, {}, 
      {
        text: this.formatIfNumber(this.datosDes[0].multa_total,formatoNumerico2) + ' Bs.',
        style: 'textTitulo', alignment: 'right', margin: [0, 0, 10, 0] },
    ];

      arrayData.push(totalRow);
      return arrayData;
  }

  //Función para generar de manera escrita el monto del dinero
  private unidades = [
  '', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE',
  ];

  private decenas = [
    '', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA',
  ];

  private especiales = [
    'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE',
  ];

  private centenas = [
    '', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS',
    'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS',
  ];

  convertToWords(value: string, currency: string): string {
    // Eliminar espacios y símbolos excepto dígitos, punto y coma
    const cleanValue = value.replace(/[^\d.,]/g, '');

    // Reemplazar el punto (.) por vacío solo si es separador de miles
    const normalized = cleanValue.replace(/\./g, '').replace(',', '.');

    const number = parseFloat(normalized);

    if (isNaN(number)) throw new Error('Valor inválido');

    const integerNumber = Math.floor(number);
    const decimalNumber = Math.round((number - integerNumber) * 100);

    const integerWords = this.numberToWords(integerNumber).trim();
    const decimalWords = `${decimalNumber.toString().padStart(2, '0')}/100`;
    const currencyWords = this.getCurrencyWord(currency);

    return `${integerWords} ${decimalWords} ${currencyWords}`;
  }

  private numberToWords(value: number): string {
    if (value === 0) return 'CERO';
    if (value < 10) return this.unidades[value];
    if (value === 10) return 'DIEZ';
    if (value > 10 && value < 20) return this.especiales[value - 11];
    if (value < 100) {
      const decena = Math.floor(value / 10);
      const unidad = value % 10;
      return unidad > 0
        ? `${this.decenas[decena]} Y ${this.unidades[unidad]}`
        : this.decenas[decena];
    }
    if (value < 1000) {
      const centena = Math.floor(value / 100);
      const resto = value % 100;
      if (value === 100) return 'CIEN';
      return `${this.centenas[centena]} ${this.numberToWords(resto)}`.trim();
    }
    if (value < 1_000_000) {
      const miles = Math.floor(value / 1000);
      const resto = value % 1000;
      const milesWord = miles === 1 ? 'MIL' : `${this.numberToWords(miles)} MIL`;
      return `${milesWord} ${this.numberToWords(resto)}`.trim();
    }
    if (value < 1_000_000_000) {
      const millones = Math.floor(value / 1_000_000);
      const resto = value % 1_000_000;
      const millonesWord = millones === 1 ? 'UN MILLÓN' : `${this.numberToWords(millones)} MILLONES`;
      return `${millonesWord} ${this.numberToWords(resto)}`.trim();
    }
    throw new Error('Valor fuera de rango');
  }

  private getCurrencyWord(currency: string): string {
    switch (currency) {
      case 'Bs.':
      case 'Bs':
        return 'BOLIVIANOS';
      case '$':
      case 'USD':
        return 'DÓLARES';
      case '€':
      case 'EUR':
        return 'EUROS';
      default:
        throw new Error(`Moneda no soportada: ${currency}`);
    }
  }

  // FORMATO DE NUMEROS
  private formatIfNumber(value: any, formatter: Intl.NumberFormat): string {
    if (value === null || value === undefined || value === '') return '';
    
    const num = Number(value);
    if (isNaN(num)) return '';

    return formatter.format(num);
  }
  

}