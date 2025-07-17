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
export class ActaProvisional {
datosEnvio: any = [];
datosSup: any = [];
datosFis: any = [];
datosInf: any = [];
datosVariacion: any = [];
   
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

  // Datos generales obra 
  async datosGeneralesObra(id_obra: number) {
    const query1 = `
        SELECT * 
        FROM public."vista_reporte_infobra_gral" WHERE id_obra = ${id_obra}`;
    const resultado = await this.sequelize.query(query1);
    return resultado[0];
  }

    // Datos generales Acta 
  async datosActaObra(id_informe: number) {
    const query2 = `
        SELECT * 
        FROM public."vista_reporte_Actas" WHERE id_informe = ${id_informe}`;
    const resultado2 = await this.sequelize.query(query2);
    return resultado2[0];
  }

    // SUPERVISORES designados por obra 
   async supervisorDesignado(obra: number) {
    const query3 = `
        SELECT * 
        FROM public."vista_supervisores_obra" WHERE id_obra = ${obra}`;
    const resultado3 = await this.sequelize.query(query3);
    return resultado3[0];
   }

    // FISCALES designados por obra 
   async fiscalDesignado(obra: number) {
    const query4 = `
        SELECT * 
        FROM public.vista_fiscales_obra WHERE id_obra = ${obra}`;
    const resultado4 = await this.sequelize.query(query4);
    return resultado4[0];
   }

   // Datos datos de Variación de la Acta 
    async datosCuadroActa(obra: number) {
    const query5 = `
        SELECT * 
        FROM public."vista_reporte_variacion_Acta" WHERE id_obra = ${obra}`;
    const resultado5 = await this.sequelize.query(query5);
    return resultado5[0];
   }
 
// REPORTE - RECEPCION PROVISIONAL

async generateActaProvisional(id_obra: number, id_informe: number): Promise<Buffer> {

  const datosGenerales = await this.datosGeneralesObra(id_obra);
  if ((!datosGenerales || (Array.isArray(datosGenerales) && datosGenerales.length === 0) || (typeof datosGenerales === 'object' && Object.keys(datosGenerales).length === 0))){
    throw new Error('No se encontraron datos para el ID de la obra proporcionada');
  }
  this.datosEnvio = datosGenerales;

  const datosInforme = await this.datosActaObra(id_informe);
  if ((!datosInforme || (Array.isArray(datosInforme) && datosInforme.length === 0) || (typeof datosInforme === 'object' && Object.keys(datosInforme).length === 0))){
    throw new Error('No se encontraron datos del Acta');
  }
  this.datosInf = datosInforme;

  const res1 = await this.supervisorDesignado(id_obra);
  if (!res1 || (Array.isArray(res1) && res1.length === 0) || (typeof res1 === 'object' && Object.keys(res1).length === 0)) {
      throw new Error('No se encontraron datos del Supervisor designado');
  }
  this.datosSup = res1;

  const res2 = await this.fiscalDesignado(id_obra);
  if (!res2 || (Array.isArray(res2) && res2.length === 0) || (typeof res2 === 'object' && Object.keys(res2).length === 0)) {
      throw new Error('No se encontraron datos del Fiscal designado');
  }
  this.datosFis = res2;

   const res3 = await this.datosCuadroActa(id_obra);
  if ((!res3 || (Array.isArray(res3) && res3.length === 0) || (typeof res3 === 'object' && Object.keys(res3).length === 0))){
    throw new Error('No se encontraron datos de las modificaciones');
  }
  this.datosVariacion = res3;

  const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
  const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
  const imgPath = 'assets/images/membretado_oficio.png';
  const marcaAgua = this.datosInf[0].fecha_aprobacion;

  //Cálculo del plazo real
  const fechaInicio = new Date(this.datosEnvio[0].fecha_inicio_ejecucion);
  const fechaFin = new Date(this.datosInf[0].fecha_registro); //fecha acta provisional
  const diffMs = fechaFin.getTime() - fechaInicio.getTime();
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1; // suma 1 si el plazo incluye el primer día
  const plazo_real = diffDias;

  const formatoNumerico2 = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
    });

    console.log('DATOS obra',this.datosVariacion.conteo);
    console.log('DATOS VARIACION',this.datosVariacion);
 
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
        text: 'ACTA DE RECEPCIÓN PROVISIONAL DE OBRA\n',
        style: 'header', alignment: 'center'
      } as any,
      {
        text: this.datosEnvio[0].cod_carpeta + '-' + this.datosInf[0].cite_acta + '-1',
        style: 'subheader', alignment: 'center'
      },
      {
        text: '\n',
      },
      {
        text: 'En la ciudad de La Paz a hrs. ' + this.datosInf[0].hora_registro.substring(0, 5) + ' del día ' + this.fechaString(this.datosInf[0].fecha_registro) + 
              ', en presencia de las autoridades de la Comisión de Recepción de obras del Gobierno Autónomo Municipal de La Paz ' + 
              ' y la empresa contratista ' + this.datosEnvio[0].proponente_razon_social + ', se procedió a la recepción provisional de la siguiente obra:',
        style: 'textDato', alignment:'justify', margin: [0, 0, 0, 7]
      },
      {
        text: 'DATOS GENERALES',
        style: 'textTitulo', margin: [0, 0, 0, 5],
      },
      {
        table: {
          widths: ['20%', '80%'],
          body: [
            [
              { text: [{ text: 'CÓDIGO:', style: 'textTituloT', alignment: 'right' },], fillColor: '#dddddd' },
              { text: [{ text: this.datosEnvio[0].cod_carpeta, style: 'textDatoT', bold:true }], fillColor: '#dddddd' }
            ],
            [
              { text: [{ text: 'OBRA:\n', style: 'textTituloT', alignment: 'right' },] },
              { text: [{ text: this.datosEnvio[0].desc_carpeta + '\n', style: 'textDatoT' }] }
            ],
            [
              { text: [{ text: 'ZONA:\n', style: 'textTituloT', alignment: 'right' },], fillColor: '#dddddd' },
              { text: [{ text: this.datosEnvio[0].desc_zona_carpeta + '\n', style: 'textDatoT' }], fillColor: '#dddddd' }
            ],
          ]
        }, margin: [10, 0, 10, 7], 
           layout: 'noBorders'
      },
      {
        text: 'Realizada la inspección correspondiente por la Comisión de Recepción de Obras, se constató que la obra fue ejecutada ' +
              'conforme a las especificaciones técnicas del contrato.',
        style: 'textDato', alignment:'justify', margin: [0, 0, 0, 7]
      },
      // {
      //   table: {
      //     widths: ['*', 300],
      //     body: [
      //       [
      //         { text: [{ text: 'Fecha orden de proceder:', style: 'textTituloT', alignment: 'right' },], fillColor: '#dddddd' },
      //         { text: [{ text: this.formatearFecha(this.datosEnvio[0].fecha_inicio_ejecucion), style: 'textDatoT' }], fillColor: '#dddddd' }
      //       ],
      //       [
      //         { text: [{ text: 'Plazo contrato inicial (d.c.):\n', style: 'textTituloT', alignment: 'right' },] },
      //         { text: [{ text: this.datosEnvio[0].plazo_contrato + '\n', style: 'textDatoT' }] }
      //       ],
      //       [
      //         { text: [{ text: 'Fecha conclusión programada contrato inicial:', style: 'textTituloT', alignment: 'right' },], fillColor: '#dddddd' },
      //         { text: [{ text: this.formatearFecha(this.datosEnvio[0].fecha_recep_provisional), style: 'textDatoT' }], fillColor: '#dddddd' }
      //       ],
      //       ...(
      //         this.datosVariacion[0].conteo === '0'
      //           ? []
      //           : [[ // agrega la fila
      //               { text: [{ text: 'Variación de plazo (d.c.):', style: 'textTituloT', alignment: 'right' }], fillColor: '#dddddd' },
      //               { text: [{ text: this.datosVariacion[0].total_diasv, style: 'textDatoT' }], fillColor: '#dddddd' }
      //             ]]
      //       ),
      //       ...(
      //         this.datosVariacion[0].conteo === '0'
      //           ? []
      //           : [[ // agrega la fila
      //               { text: [{ text: 'Nueva fecha de conclusión programada:', style: 'textTituloT', alignment: 'right' },] },
      //               { text: [{ text: this.formatearFecha(this.datosVariacion[0].nueva_fecha_conc), style: 'textDatoT' }] }
      //             ]]
      //       ),
      //       [
      //         { text: [{ text: 'Fecha real de conclusión:\n', style: 'textTituloT', alignment: 'right' },], fillColor: '#dddddd' },
      //         { text: [{ text: this.formatearFecha(this.datosInf[0].fecha_registro), style: 'textDatoT' }], fillColor: '#dddddd' }
      //       ],
      //       ...(
      //         this.datosVariacion[0].conteo === '0'
      //           ? []
      //           : [[ // agrega la fila
      //               { text: [{ text: 'Plazo real de ejecución (d.c.):\n', style: 'textTituloT', alignment: 'right' },] },
      //               { text: [{ text: plazo_real, style: 'textDatoT' }] }
      //             ]]
      //       ),
      //       [
      //         { text: [{ text: 'Monto Contrato Inicial:', style: 'textTituloT', alignment: 'right' },], fillColor: '#dddddd' },
      //         { text: [{ text: 'Bs' + this.formatIfNumber(this.datosEnvio[0].monto_contrato, formatoNumerico2), style: 'textDatoT' }], fillColor: '#dddddd' }
      //       ],
      //       ...(
      //         this.datosVariacion[0].conteo === '0'
      //           ? []
      //           : [[ // agrega la fila
      //               { text: [{ text: 'Monto autorizado:\n', style: 'textTituloT', alignment: 'right' },] },
      //               { text: [{ text: 'Bs' + this.formatIfNumber(this.datosVariacion[0].monto_variacion, formatoNumerico2), style: 'textDatoT' }] }
      //             ]]
      //       ),
               
      //     ]
      //   }, margin: [10, 0, 10, 7] 
      //   //layout: 'noBorders'
      // },
      ...( this.datosVariacion[0].conteo === '0'
        ? [
          {
            table: {
              widths: ['50%', '50%'],
              body: [
                [
                  { text: 'CONTRATO INICIAL', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd', colSpan: 2 }, {}
                ],
                [ { text: 'Orden de Proceder:', style: 'textTituloT', alignment: 'right' },
                  { text: this.formatearFecha(this.datosEnvio[0].fecha_inicio_ejecucion), style: 'textDatoT' } 
                ],
                [
                  { text: 'Plazo:', style: 'textTituloT', alignment: 'right', fillColor: '#dddddd' },
                  { text: this.datosEnvio[0].plazo_contrato + ' d.c.', style: 'textDatoT', fillColor: '#dddddd' }
                ],
                [
                  { text: 'Fecha conclusión programada:', style: 'textTituloT', alignment: 'right' },
                  { text: this.formatearFecha(this.datosEnvio[0].fecha_recep_provisional), style: 'textDatoT' }
                ],
                [
                  { text: 'Fecha real de conclusión:', style: 'textTituloT', alignment: 'right', fillColor: '#dddddd' },
                  { text: this.formatearFecha(this.datosInf[0].fecha_registro), style: 'textDatoT', fillColor: '#dddddd' }
                ],
                [
                  { text: 'Monto Contrato Inicial:', style: 'textTituloT', alignment: 'right', fillColor: '#dddddd' },
                  { text: 'Bs' + this.formatIfNumber(this.datosEnvio[0].monto_contrato, formatoNumerico2), style: 'textDatoT', fillColor: '#dddddd' }
                ]
              ]
            }, margin: [120, 0, 120, 7], layout: 'noBorders'
          }
        ]
        : [
            {
              table: {
                widths: ['50%', '50%'],
                body: [ 
                  [
                    { // TABLA IZQUIERDA
                      table: {
                        widths: ['50%', '50%'],
                        body: [
                          [
                            { text: 'CONTRATO INICIAL', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd', colSpan: 2 }, {}
                          ],
                          [ { text: 'Orden de Proceder:', style: 'textTituloT', alignment: 'right' },
                            { text: this.formatearFecha(this.datosEnvio[0].fecha_inicio_ejecucion), style: 'textDatoT' } 
                          ],
                          [
                            { text: 'Plazo:', style: 'textTituloT', alignment: 'right', fillColor: '#dddddd' },
                            { text: this.datosEnvio[0].plazo_contrato + ' d.c.', style: 'textDatoT', fillColor: '#dddddd' }
                          ],
                          [
                            { text: 'Fecha conclusión programada:', style: 'textTituloT', alignment: 'right' },
                            { text: this.formatearFecha(this.datosEnvio[0].fecha_recep_provisional), style: 'textDatoT' }
                          ],
                          [
                            { text: 'Monto Contrato Inicial:', style: 'textTituloT', alignment: 'right', fillColor: '#dddddd' },
                            { text: 'Bs' + this.formatIfNumber(this.datosEnvio[0].monto_contrato, formatoNumerico2), style: 'textDatoT', fillColor: '#dddddd' }
                          ],
                        ]
                      }, layout: 'noBorders'
                      // layout: {
                      //               hLineWidth: function (i: number, node: any) {
                      //                 return (i === 0 || i === node.table.body.length) ? 0.7 : 0;
                      //               },
                      //               vLineWidth: function (i: number, node: any) {
                      //                 return (i === 0 || i === node.table.widths.length) ? 0.7 : 0;
                      //               },
                      //               hLineColor: function (i: number, node: any) {
                      //                 return '#000000';
                      //               },
                      //               vLineColor: function (i: number, node: any) {
                      //                 return '#000000';
                      //               }
                      //             }
                    },
                    {  //TABLA DERECHA
                      table: {
                        widths: ['50%', '50%'],
                        body: [
                          [
                            { text: 'ÚLTIMA MODIFICACIÓN APROBADA ' + this.datosVariacion[0].tipo_modificacion_texto + this.datosVariacion[0].correlativo, style: 'textTituloT', alignment: 'center', fillColor: '#dddddd', colSpan: 2 }, {}
                          ],
                          [
                            { text: 'Modificación plazo:', style: 'textTituloT', alignment: 'right' },
                            { text: this.datosVariacion[0].total_diasv + ' d.c.', style: 'textDatoT' }
                          ],
                          [
                            { text: 'Plazo real de ejecución:', style: 'textTituloT', alignment: 'right', fillColor: '#dddddd' },
                            { text: plazo_real + ' d.c.', style: 'textDatoT', fillColor: '#dddddd' }
                          ],
                          [
                            { text: 'Fecha conclusión programada:', style: 'textTituloT', alignment: 'right' },
                            { text: this.formatearFecha(this.datosVariacion[0].nueva_fecha_conc), style: 'textDatoT' }
                          ],
                          [
                            { text: 'Monto autorizado:\n', style: 'textTituloT', alignment: 'right', fillColor: '#dddddd' },
                            { text: 'Bs' + this.formatIfNumber(this.datosVariacion[0].monto_variacion, formatoNumerico2), style: 'textDatoT', fillColor: '#dddddd' }
                          ]
                        ]
                      }, layout: 'noBorders'
                      // layout: {
                      //               hLineWidth: function (i: number, node: any) {
                      //                 return (i === 0 || i === node.table.body.length) ? 0.7 : 0;
                      //               },
                      //               vLineWidth: function (i: number, node: any) {
                      //                 return (i === 0 || i === node.table.widths.length) ? 0.7 : 0;
                      //               },
                      //               hLineColor: function (i: number, node: any) {
                      //                 return '#000000';
                      //               },
                      //               vLineColor: function (i: number, node: any) {
                      //                 return '#000000';
                      //               }
                      //             }
                    }
                  ]
                ]
              }, margin: [10, 0, 10, 5], layout: 'noBorders'
            },
            {
              table: {
                widths: ['50%', '50%'],
                body: [ 
                  [
                    { text: 'Fecha de conclusión real:', style: 'textTituloT', alignment: 'right', fillColor: '#dddddd' },
                    { text: this.formatearFecha(this.datosInf[0].fecha_registro), style: 'textDatoT', fillColor: '#dddddd' }
                  ]
                ]
              }, layout: 'noBorders', margin: [10, 0, 10, 7]
            }
        ]
      ),
      
      {
        text: 'La obra se recibe con las siguientes observaciones a ser subsanadas durante el periodo de corrección de defectos: ',
        style: 'textDato', alignment:'justify', margin: [0, 0, 0, 7]
      },
      {
        text: this.datosInf[0].obs_general,
        style: 'textDato', alignment:'justify', margin: [10, 0, 0, 0]
      },
      {
        text: ['\n'],
      }, 
      {
        text: 'Se establece, en función al tipo de obra, un plazo de ' + this.datosInf[0].periodo_correccion + ' d.c. para la realización de la ' + 
              'Recepción Definitiva, plazo que correrá a partir de la fecha de RECEPCIÓN PROVISIONAL.\n\n' + 
              'En constancia por la Comisión de Recepción de Obras, firman:',
        style: 'textDato', alignment:'justify'
      },
      {
        text: ['\n'],
      },
      {
        table: {
          widths: ['*', '*'],
          body: [
            [
              { text: [
                { text: '\n\n\n\n\nREPRESENTANTE UNIDAD EJECUTORA', style: 'textTituloT', alignment: 'center' },
                { text: '\nSELLO Y FIRMA', style: 'footerText', bold: 'true', alignment: 'center' }
              ]},
              { text: [
                { text: '\n\n\n\n\nREPRESENTANTE ÁREA ADMINISTRATIVA', style: 'textTituloT', alignment: 'center' },
                { text: '\nSELLO Y FIRMA', style: 'footerText', bold: 'true', alignment: 'center' }
              ] }
            ],
          ]
        }, margin: [20,0,20,0], 
        layout: {
          hLineColor: () => '#444444', // color gris opaco para líneas horizontales
          vLineColor: () => '#444444', // color gris opaco para líneas verticales
          hLineWidth: () => 0.7,       // grosor más fino
          vLineWidth: () => 0.7
          } //layout: 'noBorders'
      },
      {
        text: ['\n'],
      },
      {
        table: {
          widths: ['*'],
          body: [
            [
              { text:
                    [
                      { text: '\n\n\n\n\n' + this.datosEnvio[0].proponente_razon_social, style: 'textDatoT', alignment: 'center' },
                      { text: '\nEMPRESA CONTRATISTA', style: 'textTituloT', alignment: 'center' },
                      { text: '\nSELLO Y FIRMA', style: 'footerText', bold: 'true', alignment: 'center'}
                    ], 
              },
            ],
          ]
        }, margin: [100,0,100,0],
        layout: {
          hLineColor: () => '#444444', // color gris opaco para líneas horizontales
          vLineColor: () => '#444444', // color gris opaco para líneas verticales
          hLineWidth: () => 0.7,       // grosor más fino
          vLineWidth: () => 0.7
          } //layout: 'noBorders'
      },
      {
        text: ['\n'],
      },
      {
          table: {
            widths: ['50%','50%'],
            body: [
              [ 
                { text: [
                  {
                    text: '\n\n\n\n\n' + (
                          Array.isArray(this.datosSup)
                            ? this.datosSup
                                .filter(s => s && s.supervisor)
                                .map(s => s.supervisor)
                                .join('\n')  // salto de linea 
                            : ''
                        ),
                        style: 'textDatoT', alignment: 'center'
                  },
                  { text: '\nSUPERVISOR(ES) DE OBRA', style: 'textTituloT', alignment: 'center' },
                  { text: '\nSELLO Y FIRMA', style: 'footerText', bold: 'true', alignment: 'center'}
                ]},
                {
                  text: [
                  {
                    text: '\n\n\n\n\n' + (
                          Array.isArray(this.datosFis)
                            ? this.datosFis
                                .filter(f => f && f.fiscal)
                                .map(f => f.fiscal)
                                .join('\n')  // salto de linea 
                            : ''
                        ),
                        style: 'textDatoT', alignment: 'center'
                  },
                  { text: '\nFISCAL(ES) DE OBRA', style: 'textTituloT', alignment: 'center' },
                  { text: '\nSELLO Y FIRMA', style: 'footerText', bold: 'true', alignment: 'center'}
                ]}
              ]
                //...this.buildSupervisores(this.datosSup),
              ]
          }, margin: [20,0,20,0],
          layout: {
          hLineColor: () => '#444444', // color gris opaco para líneas horizontales
          vLineColor: () => '#444444', // color gris opaco para líneas verticales
          hLineWidth: () => 0.7,       // grosor más fino
          vLineWidth: () => 0.7
          }
      },
      // {
      //     table: {
      //       widths: ['50%','50%'],
      //       body: [
      //         ...this.buildFiscales(this.datosFis)
      //         ]
      //     }, 
      // },
      {
        text: ['\n\nCc.Arch.' ],
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
        //bold: false,          
      },
      textDato: {
        fontSize: 9,
        bold: false,
        opacity: 0.8,
      },
      textDatoT: {
        fontSize: 7,
        opacity: 0.8,
      },
    },
    pageMargins: [70, 170, 50, 140] as any, // Márgenes: izquierda, arriba, derecha, abajo
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
                alignment: 'center', margin: [0, 20, 0, 0]},
          { text: 'SELLO Y FIRMA', style: 'textTituloT', alignment: 'center', margin: [0, 30, 0, 0] }
        ];
        arrayData.push(rowData);
      }
      return arrayData;
    }

     //Cargar tabla de FISCAL - CON RECUADRO
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
                alignment: 'center', margin: [0, 20, 0, 0]},
          { text: 'SELLO Y FIRMA', style: 'textTituloT', alignment: 'center', margin: [0, 30, 0, 0] }
        ];
        arrayData.push(rowData);
      }
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