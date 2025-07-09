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

  // REPORTE - INFORME PAGO SUPERVISOR

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
 
   console.log('DATOS MODIFICACION',this.datosEnvio);
   
    const documentDefinition = {
    pageSize: 'LEGAL' as any,
    // background: function(currentPage: any, pageSize: any) { 
    //   return {
    //     image: imgPath, 
    //     width: pageSize.width, 
    //     height: pageSize.height,
    //     absolutePosition: {x: 0, y: 0}
    //         } },
    
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
        text: 'RESUMEN DEL CERTIFICADO DE PAGO',
        style: 'subheader', alignment: 'center'
      } as any,
      {
        text: '\n',
      },
      {
        table: {
          widths: ['15%', '35%', '25%', '25%'],
          body: [
            [
              { text: [{ text: 'CONTRATISTA:', style: 'textTitulo', alignment: 'left' },], fillColor: '#dddddd' },
              { text: [{ text: this.datosEnvio[0].proponente_razon_social, style: 'textDato', bold:true }], fillColor: '#dddddd' },
              { text: [{ text: 'CERTIFICADO Nro.:', style: 'textTitulo', alignment: 'left' }], fillColor: '#dddddd' },
              { text: [{ text: '', style: 'textDato', bold:true }], fillColor: '#dddddd' }
            ],
            [
              { text: [{ text: 'REPRESENTANTE:', style: 'textTitulo', alignment: 'left' },] },
              { text: [{ text: '', style: 'textDato' }] },
              { text: [{ text: 'PARTIDA:', style: 'textTitulo', alignment: 'left' },] },
              { text: [{ text: '', style: 'textDato' }] }
            ],
            [
              { text: [{ text: 'CÓDIGO:', style: 'textTitulo', alignment: 'left' }], fillColor: '#dddddd' },
              { text: [{ text: this.datosEnvio[0].cod_carpeta, style: 'textDato' }], fillColor: '#dddddd' },
              { text: [{ text: 'Nro. CONTRATO:', style: 'textTitulo', alignment: 'left' },], fillColor: '#dddddd' },
              { text: [{ text: '', style: 'textDato', fillColor: '#dddddd' }], fillColor: '#dddddd' }
            ],
            [
              { text: [{ text: 'OBRA:', style: 'textTitulo', alignment: 'left' },] },
              { text: [{ text: this.datosEnvio[0].desc_carpeta, style: 'textDato' }] },
              { text: [{ text: 'FECHA CONTRATO:', style: 'textTitulo', alignment: 'left' },] },
              { text: [{ text: this.formatearFecha(this.datosEnvio[0].fecha_recep_provisional), style: 'textDato' }] }
            ],
            [
              { text: [{ text: 'DISTRITO:', style: 'textTitulo', alignment: 'left' }], fillColor: '#dddddd' },
              { text: [{ text: this.datosEnvio[0].desc_zona_carpeta, style: 'textDato' }], fillColor: '#dddddd' },
              { text: [{ text: 'FECHA PRESENTACIÓN:', style: 'textTitulo', alignment: 'left', fillColor: '#dddddd' }], fillColor: '#dddddd' },
              { text: [{ text: this.formatearFecha(this.datosEnvio[0].fecha_recep_provisional), style: 'textDato', fillColor: '#dddddd' }], fillColor: '#dddddd' }
            ],           
          ]
        }, layout: 'noBorders'
      },
      {
        table: {
          widths: ['*'],
          body: [
            []
          ]
        }, layout: 'noBorders'
      },
      {
        table: { // Tabla principal de 2 columnas
          widths: ['50%', '50%'],
          body: [
            [ 
              [ //Columna izquierda 
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
                    withs: ['50%','50%'],
                    body: [
                            [{ text: 'Fecha orden de proceder:', style: 'textTitulo', alignment: 'left'},
                            { text: '', style: 'textTitulo', alignment: 'left'}
                            ],
                            [{ text: 'Plazo contrato inicial:', style: 'textTitulo', alignment: 'left'},
                            { text: '', style: 'textTitulo', alignment: 'left'}
                            ],
                            [{ text: 'Conclusión programada según contrato inicial:', style: 'textTitulo', alignment: 'left'},
                            { text: '', style: 'textTitulo', alignment: 'left'}
                            ],
                            [{ text: 'Periodo certificado:', style: 'textTitulo', alignment: 'left'},
                            { text: '', style: 'textTitulo', alignment: 'left'}
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
                    withs: ['50%','50%'],
                    body: [
                            [{ text: 'Anticipo:', style: 'textTitulo', alignment: 'left'},
                            { text: '', style: 'textTitulo', alignment: 'left'}
                            ],
                            [{ text: 'Deducción certificados anteriores:', style: 'textTitulo', alignment: 'left'},
                            { text: '', style: 'textTitulo', alignment: 'left'}
                            ],
                            [{ text: 'Deducción presente certificado:', style: 'textTitulo', alignment: 'left'},
                            { text: '', style: 'textTitulo', alignment: 'left'}
                            ],
                            [{ text: 'Total amortizado:', style: 'textTitulo', alignment: 'left'},
                            { text: '', style: 'textTitulo', alignment: 'left'}
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
                    withs: ['50%','50%'],
                    body: [
                            [{ text: 'Retención certificados anteriores:', style: 'textTitulo', alignment: 'left'},
                            { text: '', style: 'textTitulo', alignment: 'left'}
                            ],
                            [{ text: 'Retención presente certificado:', style: 'textTitulo', alignment: 'left'},
                            { text: '', style: 'textTitulo', alignment: 'left'}
                            ],
                            [{ text: 'Total retenciones:', style: 'textTitulo', alignment: 'left'},
                            { text: '', style: 'textTitulo', alignment: 'left'}
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
                }
              ],
              [  //Columna derecha 
                {
                  table: {
                    widths: ['*'],
                    body: [
                      [
                        { text: ' ', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd'} 
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
                    withs: ['50%','50%'],
                    body: [
                            [{ text: 'Monto contrato inicial:', style: 'textTitulo', alignment: 'left'},
                            { text: '', style: 'textTitulo', alignment: 'left'}
                            ],
                            [{ text: 'Total autorizado:', style: 'textTitulo', alignment: 'left'},
                            { text: '', style: 'textTitulo', alignment: 'left'}
                            ],
                            [{ text: 'Importe certificados anteriores:', style: 'textTitulo', alignment: 'left'},
                            { text: '', style: 'textTitulo', alignment: 'left'}
                            ],
                            [{ text: 'Importe presente certificado:', style: 'textTitulo', alignment: 'left'},
                            { text: '', style: 'textTitulo', alignment: 'left'}
                            ],
                            [{ text: 'Total certificados a la fecha:', style: 'textTitulo', alignment: 'left'},
                            { text: '', style: 'textTitulo', alignment: 'left'}
                            ],
                            [{ text: 'Deducciones:', style: 'textTitulo', alignment: 'left'},
                            { text: '', style: 'textTitulo', alignment: 'left'}
                            ],
                            [{ text: 'Retenciones:', style: 'textTitulo', alignment: 'left'},
                            { text: '', style: 'textTitulo', alignment: 'left'}
                            ],
                            [{ text: 'Multas:', style: 'textTitulo', alignment: 'left'},
                            { text: '', style: 'textTitulo', alignment: 'left'}
                            ],
                            [{ text: 'Importe por pagar (Bs):', style: 'textTitulo', alignment: 'left'},
                            { text: '', style: 'textTitulo', alignment: 'left'}
                            ]
                    ]
                  }, layout: 'noBorders'
                },
                {
                  table: {
                    widths: ['*'],
                    body: [
                      [
                        [{ text: 'LITERAL DEL IMPORTE POR PAGAR', style: 'textTitulo', alignment: 'left', fillColor: '#dddddd' }, {}],
                      ],
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
                    withs: ['50%','50%'],
                    body: [
                            [{ text: 'Saldo:', style: 'textTitulo', alignment: 'left'},
                            { text: '', style: 'textTitulo', alignment: 'left'}
                            ],
                            [{ text: '% A pagar**:', style: 'textTitulo', alignment: 'left'},
                            { text: '', style: 'textTitulo', alignment: 'left'}
                            ],
                            [{ text: '% Acumulado**:', style: 'textTitulo', alignment: 'left'},
                            { text: '', style: 'textTitulo', alignment: 'left'}
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
            hLineWidth: (i: number, node: any) => (i === node.table.body.length ? 1 : 0), // Línea horizontal al final
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
                { text: 'EMPRESA CONTRATISTA', style: 'textDato', alignment: 'center'}
              ],
              { text: '\n\n\n\n\n\n' + 'FIRMA Y SELLO', style: 'textDato', alignment: 'center' }
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
                { text: 'DIRECCIÓN DE FISCALIZACIÓN DE OBRAS', style: 'textDato', alignment: 'center'}
              ],
              { text: '\n\n\n\n\n\n' + 'FIRMA Y SELLO', style: 'textDato', alignment: 'center' }
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
  if (!iso) return undefined; // No hace nada si iso es null, undefined o ''
  
  const fecha = new Date(iso);
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Enero = 0
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
                { text: 'SUPERVISOR DE OBRA', bold: true, style: 'textDato' }
                  ],
                alignment: 'center', margin: [0, 35, 0, 0]},
          { text: 'FIRMA Y SELLO', style: 'textDato', alignment: 'center', margin: [0, 45, 0, 0] }
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
                { text: 'FISCAL DE OBRA', bold: true, style: 'textDato' }
                  ],
                alignment: 'center', margin: [0, 35, 0, 0]},
          { text: 'FIRMA Y SELLO', style: 'textDato', alignment: 'center', margin: [0, 45, 0, 0] }
        ];
        arrayData.push(rowData);
      }
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