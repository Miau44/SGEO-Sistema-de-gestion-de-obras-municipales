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
import { styleText } from 'util';

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
export class fichaInspeccion {

    datosEnvio: any = [];
    datosAvance: any = [];
    datosSup: any = [];
    datosFis: any = [];

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
            FROM public."f_reporte_resumen_obra" (${id_obra})`;
        const resultado1 = await this.sequelize.query(query1);
        return resultado1[0];
    }

    // Datos avance 
    async datosAvanceFisico(id_avance: number) {
        const query2 = `
            SELECT * 
            FROM public."vista_reporte_avance_fisico" WHERE id_avance_fisico = ${id_avance}`;
        const resultado2 = await this.sequelize.query(query2);
        return resultado2[0];
    }

    //--Datos Aprobador SUPERVISOR
    async datosAprobadorSup(obra: number) {
      const query3 = `
          SELECT * 
          FROM public."vista_reporte_aprobador_supervisor_obra" WHERE id_obra = ${obra}`;
      const resultado3 = await this.sequelize.query(query3);
      return resultado3[0];
    }

    //--Datos Aprobador FISCAL
    async datosAprobadorFis(obra: number) {
      const query4 = `
          SELECT * 
          FROM public."vista_reporte_aprobador_fiscal_obra" WHERE id_obra = ${obra}`;
      const resultado4 = await this.sequelize.query(query4);
      return resultado4[0];
    }

    // REPORTE - RECEPCION DEFINITIVA

    async generatefichaInspeccion(id_obra: number, id_avance: number): Promise<Buffer> {

        const datosGenerales = await this.datosGeneralesObra(id_obra);
        if ((!datosGenerales || (Array.isArray(datosGenerales) && datosGenerales.length === 0) || (typeof datosGenerales === 'object' && Object.keys(datosGenerales).length === 0))){
        throw new Error('No se encontraron datos para el ID de la obra proporcionada');
        }
        this.datosEnvio = datosGenerales;

        const res1 = await this.datosAvanceFisico(id_avance);
        if (!res1 || (Array.isArray(res1) && res1.length === 0) || (typeof res1 === 'object' && Object.keys(res1).length === 0)) {
            throw new Error('No se encontraron datos del avance físico');
        }
        this.datosAvance = res1;

        const res2 = await this.datosAprobadorFis(id_obra);
        if (!res2 || (Array.isArray(res2) && res2.length === 0) || (typeof res2 === 'object' && Object.keys(res2).length === 0)) {
        throw new Error('No se encontraron del Aprobador de Fiscal');
        }
        this.datosFis = res2;

        const res3 = await this.datosAprobadorSup(id_obra);
        if (!res3 || (Array.isArray(res3) && res3.length === 0) || (typeof res3 === 'object' && Object.keys(res3).length === 0)) {
        throw new Error('No se encontraron del Aprobador de Supervisor');
        }
        this.datosSup = res3;

        const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
        const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
        const imgLogo = 'assets/images/logoSGEO.png'
        //const marcaAgua = this.datosInf[0].fecha_aprobacion;

        //console.log('DATOS AVANCE', this.datosAvance);
        
        // Extraer la imagen
        const urlImagen  = this.datosAvance[0].ruta_documento;
        const response = await fetch(urlImagen);
        const arrayBuffer  = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Convertir a base64
        const base64 = `data:image/jpeg;base64,${buffer.toString("base64")}`;
        
        

        const documentDefinition = {
        pageSize: 'LETTER' as any,
    
    // ...(this.datosInf[0].fecha_aprobacion !== null
    // ? (
    //     this.datosProv[0].monto_certificado === '0'
    //       ? { watermark: { text: 'PAGO PENDIENTE', color: 'red', opacity: 0.2, bold: true } }
    //       : {}
    //   )
    // : { watermark: { text: 'PRELIMINAR', color: 'red', opacity: 0.2, bold: true } }
    // ),
        
        header: {
        columns: [{ 
                    image: imgLogo, width: 130, margin: [5,5,0,0]
                }],
                
        } as any,

        content: [
            {
                text:[
                    { text: 'PLANILLA DE INSPECCIÓN DE OBRAS ' + '\n', style: 'subheader', alignment: 'center' },
                    { text: 'GOBIERNO AUTÓNOMO MUNICIPAL DE LA PAZ - ' +  
                        (this.datosAvance[0].rol_avance === 's' ? this.datosSup[0].nombre_ue 
                            : this.datosFis[0].nombre_ue)
                        + '\n\n' , style: 'textTitulo', alignment: 'center' }
                ],
            },
            {
                table: {
                    widths: ['50%', '50%'],
                    heights: [5, 5, 50, 5, 50, 20, 5, '*',150, 80],
                    body: [
                    [
                        { text: this.datosEnvio[0].desc_carpeta, style: 'textDato', colSpan: 2, alignment: 'center' },
                        { }
                    ],
                    [
                        { text: 'DATOS GENERALES', style: 'textTituloT', alignment: 'center', fillColor: '#a2e9f2' },
                        { text: 'DATOS DE INSPECCIÓN', style: 'textTituloT', alignment: 'center', fillColor: '#a2e9f2' }
                    ],
                    [
                        {
                        stack: [
                            {
                            table: {
                                widths: ['20%', '30%', '20%', '30%'],
                                body: [
                                [
                                    { text: 'Código: ', style: 'textTituloT' },
                                    { text: this.datosEnvio[0].cod_carpeta, style: 'textDato' },
                                    { text: 'Contrato: ', style: 'textTituloT' },
                                    { text: this.datosEnvio[0].numero_contrato, style: 'textDato' }
                                ],
                                [
                                    { text: 'U.E.: ', style: 'textTituloT' },
                                    { text: this.datosEnvio[0].nombre_ue, colSpan: 3, style: 'textDato', alignment: 'left' },
                                    { },
                                    { }
                                ],
                                [
                                    { text: 'Contratista: ', style: 'textTituloT' },
                                    { text: this.datosEnvio[0].proponente_razon_social, colSpan: 3, style: 'textDato', alignment: 'left' },
                                    { },
                                    { }
                                ],
                                [
                                    { text: 'Distrito: ', style: 'textTituloT' },
                                    { text: this.datosEnvio[0].desc_distrito_carpeta, style: 'textDato' },
                                    { text: 'Zona:', style: 'textTituloT' },
                                    { text: this.datosEnvio[0].desc_zona_carpeta, style: 'textDato' }
                                ]
                                ]
                            },
                            layout: 'noBorders'
                            }
                        ]
                        },
                        {
                        table: {
                            widths: ['25%', '25%', '25%', '25%'],
                            body: [
                            [
                                { text: 'Hora de inicio: ', style: 'textTituloT' },
                                { text: this.datosAvance[0].hora_inicio.substring(0, 5), style: 'textDato' },
                                { text: 'Hora fin: ', style: 'textTituloT' },
                                { text: this.datosAvance[0].hora_final.substring(0, 5), style: 'textDato' }
                            ],
                            [
                                { text: 'Fiscal: ', style: 'textTituloT' },
                                { text: this.datosEnvio[0].fiscales, colSpan: 3, style: 'textDato' },
                                { },
                                { }
                            ],
                            [
                                { text: 'Supervisor: ', style: 'textTituloT' },
                                { text: this.datosEnvio[0].supervisores, colSpan: 3, style: 'textDato' },
                                {},
                                {}
                            ],
                            [
                                { text: 'Fecha: ', style: 'textTituloT' },
                                { text: this.formatearFecha(this.datosAvance[0].fecha_inspeccion), style: 'textDato' },
                                { text: 'Avance físico:', style: 'textTituloT' },
                                { text: this.datosAvance[0].porcentaje_obra + '%', style: 'textDato' }
                            ]
                            ]
                        },
                        layout: 'noBorders'
                        }
                    ],
                    [
                        { text: 'FICHA TÉCNICA DEL CONTRATO', style: 'textTituloT', alignment: 'center', colSpan: 2, fillColor: '#a2e9f2' },
                        {}
                    ],
                    [
                        {
                            table: {
                            widths: ['60%', '40%'],
                            body: [
                                [
                                    { text: 'CONTRATO INICIAL', style: 'textTituloT', colSpan: 2, alignment: 'center', fillColor: '#dddddd' },
                                    { }
                                ],
                                [
                                    { text: 'Orden de Proceder:', style: 'textTituloT', alignment: 'left' },
                                    { text: this.formatearFecha(this.datosEnvio[0].fecha_inicio_ejecucion), style: 'textDato', alignment: 'right' }
                                ],
                                [
                                    { text: 'Plazo contractual:', style: 'textTituloT', alignment: 'left' },
                                    { text: this.datosEnvio[0].plazo_contrato + ' d.c.', style: 'textDato', alignment: 'right' }
                                ],
                                [
                                    { text: 'Fecha conclusión programada:', style: 'textTituloT', alignment: 'left' },
                                    { text: this.formatearFecha(this.datosEnvio[0].fecha_recep_provisional), style: 'textDato', alignment: 'right' }
                                ],
                                [
                                    { text: 'Monto contrato inicial:', style: 'textTituloT', alignment: 'left' },
                                    { text: 'Bs' + this.datosEnvio[0].monto_contrato, style: 'textDato', alignment: 'right' }
                                ]
                            ]
                            }, layout: 'noBorders',
                        },
                        {
                            table: {
                                widths: ['60%', '40%'],
                                body: [
                                    [
                                        { text: 'ÚLTIMA MODIFICACIÓN APROBADA ' + this.datosEnvio[0].tipo_modificacion_texto, style: 'textTituloT', colSpan: 2, alignment: 'center', fillColor: '#dddddd' },
                                        {}
                                    ],
                                    [
                                        { text: 'Modificación plazo:', style: 'textTituloT', alignment: 'left' },
                                        { text: this.datosEnvio[0].dias_variacion + ' d.c.', style: 'textDato', alignment: 'right' }
                                    ],
                                    [
                                        { text: 'Plazo total modificación:', style: 'textTituloT', alignment: 'left' },
                                        { text: this.datosEnvio[0].total_dias_variacion + ' d.c.', style: 'textDato', alignment: 'right' }
                                    ],
                                    [
                                        { text: 'Fecha conclusión según modificación:', style: 'textTituloT', alignment: 'left' },
                                        { text: this.formatearFecha(this.datosEnvio[0].nueva_fecha_provisional), style: 'textDato', alignment: 'right' }
                                    ],
                                    [
                                        { text: 'Monto total autorizado:', style: 'textTituloT', alignment: 'left' },
                                        { text: 'Bs' + this.datosEnvio[0].monto_total, style: 'textDato', alignment: 'right' }
                                    ]
                                ]
                            }, layout: 'noBorders'
                            // layout: {
                            //     hLineWidth: function (i: number, node: any) {
                            //         return (i === 0 || i === node.table.body.length) ? 0 : 0.5;
                            //     },
                            //     vLineWidth: function (i: number, node: any) {
                            //         return (i === 0 || i === node.table.widths.length) ? 0 : 0.5;
                            //     },
                            //     hLineColor: function (i: number, node: any) {
                            //         return '#999999';
                            //     },
                            //     vLineColor: function (i: number, node: any) {
                            //         return '#999999';
                            //     },
                            //     hLineStyle: function (i: number, node: any) {
                            //         if (i === 0 || i === node.table.body.length) {
                            //             return null;
                            //         }
                            //         return { dash: { length: 4, space: 4 } };
                            //     },
                            //     vLineStyle: function (i: number, node: any) {
                            //         if (i === 0 || i === node.table.widths.length) {
                            //             return null;
                            //         }
                            //         return { dash: { length: 4 } };
                            //     }
                            // }
                        }
                    ],
                    [
                        { 
                            table: {
                            widths: ['50%', '50%'],
                            body: [
                                [
                                    { text: 'Plazo total autorizado:', style: 'textTituloT', alignment: 'left' },
                                    { text: this.datosEnvio[0].total_plazo_autorizado + ' d.c.', style: 'textDato', alignment: 'right' }
                                ],
                                [
                                    { text: 'Plazo real ejecución:', style: 'textTituloT', alignment: 'left' },
                                    { text: this.datosEnvio[0].plazo_real + ' d.c.', style: 'textDato', alignment: 'right' }
                                ],
                                [
                                    { text: 'Fecha recepción provisional:', style: 'textTituloT', alignment: 'left' },
                                    { text: this.formatearFecha(this.datosEnvio[0].nueva_fecha_provisional), style: 'textDato', alignment: 'right' }
                                ],
                                [
                                    { text: 'Periodo de corrección de defectos:', style: 'textTituloT', alignment: 'left' },
                                    { text: this.datosEnvio[0].periodo_correccion + ' d.c.', style: 'textDato', alignment: 'right' }
                                ],
                                [
                                    { text: 'Fecha recepción definitiva:', style: 'textTituloT', alignment: 'left' },
                                    { text: this.formatearFecha(this.datosEnvio[0].fecha_definitiva), style: 'textDato', alignment: 'right' }
                                ],
                                [
                                    { text: 'Monto total ejecutado:', style: 'textTituloT', alignment: 'left' },
                                    { text: 'Bs' + this.datosEnvio[0].tota_ejecutado, style: 'textDato', alignment: 'right' }
                                ]
                            ]
                            }, colSpan: 2, 
                              layout: {
                                hLineWidth: function (i: number, node: any) {
                                    return (i === 0 || i === node.table.body.length) ? 0 : 0.5;
                                },
                                vLineWidth: function (i: number, node: any) {
                                    return (i === 0 || i === node.table.widths.length) ? 0 : 0;
                                },
                                hLineColor: function (i: number, node: any) {
                                    return '#999999';
                                },
                                vLineColor: function (i: number, node: any) {
                                    return '#999999';
                                },
                                hLineStyle: function (i: number, node: any) {
                                    if (i === 0 || i === node.table.body.length) {
                                        return null;
                                    }
                                    return { dash: { length: 4, space: 4 } };
                                },
                                vLineStyle: function (i: number, node: any) {
                                    if (i === 0 || i === node.table.widths.length) {
                                        return null;
                                    }
                                    return { dash: { length: 4 } };
                                }
                            }
                        },
                        { }
                    ],
                    // [
                    //     { text: '', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
                    //     { text: '', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' }
                    // ],
                    [
                        { 
                            image: base64,
                            width: 200,
                            height: 200,
                            alignment: 'center'
                        },
                        {
                            table: {
                                widths: ['*'],
                                body: [
                                    [
                                        { text: 'OBSERVACIONES', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' }
                                    ],
                                    [
                                        { text: this.datosAvance[0].observaciones, style: 'textDato', alignment:'justify', margin: [5,5,5,5] }
                                    ],
                                    [
                                        { text: 'RECOMENDACIONES', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' }
                                    ],
                                    [
                                        { text: this.datosAvance[0].recomendaciones, style: 'textDato', alignment:'justify', margin: [5,5,5,5] }
                                    ]
                                ]
                            }, layout: 'noBorders'
                        }
                        
                    ],
                    // [
                    //     { 
                    //         table: {
                    //         widths: ['*', '*', '*'],
                    //         body: [
                    //             [
                    //                 { text: 'FIRMA FISCAL', style: 'textTituloT', alignment: 'center' },
                    //                 { text: 'FIRMA SUPERVISOR', style: 'textTituloT', alignment: 'center' },
                    //                 { text: 'FIRMA CONTRATISTA/VECINO', style: 'textTituloT', alignment: 'center' }
                    //             ]
                    //         ]
                    //         }, layout: 'noBorders', colSpan: 2, margin: [0,70,0,0] 
                    //     },
                    //     { }
                    // ]
                    ]
                }, margin: [0,5,0,0],
                // 🔹 Aquí definimos el layout personalizado
                layout: {
                    hLineWidth: function (i: number, node: any) {
                    // Dibuja línea debajo de cada fila (excepto la última si quieres)
                    return (i === 0) ? 1 : 1; // sin línea arriba, pero sí debajo de cada fila
                    },
                    vLineWidth: function () {
                    return 1; // sin líneas verticales
                    },
                    vLineColor: function () {
                    return '#999999'; // color de las líneas
                    },
                    hLineColor: function () {
                    return '#999999'; // color de las líneas
                    },
                    paddingTop: function () { return 3; },
                    paddingBottom: function () { return 3; }
                }
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
            fontSize: 10,
            bold: true,
            //opacity: 0.8,
        },
        textTituloT: {
            fontSize: 8,
            bold: true,
            //opacity: 0.8,
        },
        footerText: {
            fontSize: 6,
            //bold: false,          
        },
        textDato: {
            fontSize: 8,
            bold: false,
            opacity: 0.8,
        },
        textDatoT: {
            fontSize: 7,
            opacity: 0.8,
        },
      },
        pageMargins: [50, 50, 30, 30] as any, // Márgenes: izquierda, arriba, derecha, abajo

    };

    // Generar el PDF en memoria
    const pdfDoc = this.printer.createPdfKitDocument(documentDefinition);
    //let chunks: Buffer[] = []; RARO, NO ENTIENDO POR QUE DEJO DE FUNCIONAR
    const chunks: Uint8Array[] = [];

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

    // Convertir imagen
    async getBase64ImageFromURL(url: string) {
    const res = await fetch(url);
    const blob = await res.blob();

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
    });
}
}