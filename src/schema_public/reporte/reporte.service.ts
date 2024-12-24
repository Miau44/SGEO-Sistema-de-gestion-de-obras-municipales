import { Injectable, Inject } from '@nestjs/common';
//import * as PdfPrinter from 'pdfmake/src/printer';
import PdfPrinter from 'pdfmake';
import * as path from 'path';
import * as fs from 'fs';
import { ResponseService } from 'src/response.service';
import { Sequelize } from 'sequelize-typescript';
import { log } from 'console';
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
export class ReportService {
  datos: any = [];
  datosEnvio: any = [];
  datosSIM: any = [];
  datosPreguntaInforme: any = [];
  datosPreguntaInformeRestante: any = [];
  constructor(
    private readonly responseService: ResponseService,
    @Inject(Sequelize) private sequelize: Sequelize, // Inyecta Sequelize correctamente
  ) { this.printer = new PdfPrinter(fonts); }

  private readonly printer = new PdfPrinter(fonts);
  private getImageBase64(imagePath: string): string {
    const image = fs.readFileSync(imagePath);
    return image.toString('base64');
  }


  async datosGeneralesReporte(gestion: number, id: number) {
    const query1 = ` SELECT * FROM sp_reporte_memorandum(${gestion},${id})`;
    //const response = await sequelize.query(query);
    const resultado = await this.sequelize.query(query1);
    return resultado[0];
  }

  //SOLICITUD DE DESIGNACION 
  async generatePdf(gestion: number, id: number): Promise<Buffer> {
    const res = await this.datosGeneralesReporte(gestion, id);
    if (!res || (Array.isArray(res) && res.length === 0) || (typeof res === 'object' && Object.keys(res).length === 0)) {
      throw new Error('No se encontraron datos para la gestión y el ID proporcionados.');
    }
    this.datos = res;
    console.log("Generar, ", res);
    console.log("Generar, ", this.datos);
    console.log("Generar, ", this.datos.codcarpeta);
    console.log("Generarcodcarpeta, ", this.datos[0].codcarpeta);
    console.log("Generar, ", this.datos.zonacarpeta);

    const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
    const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
    //const imgUrl = 'http://localhost:3009/images/logo.png';  // Cambia la URL según tu configuración
    const imgPath = 'assets/images/logo_gamlp.png';
    // const imgPath = 'assets/images/logo_gamlp.png';

    const documentDefinition = {
      pageSize: 'LETTER' as any,
      watermark: { text: 'SGEO', color: 'blue', opacity: 0.1, bold: true, italics: false },


      header: {
        columns: [
          { image: imgPath, width: 120 },  // Uso de la ruta de imagen directamente          
          //   { image: `data:image/png;base64,${this.getImageBase64(headerImage)}`, width: 100 },
          //{ text: 'Título en Rojo', style: 'coloredText', alignment: 'left' }
          { text: 'Secretaría Municipal de Infraestructura Pública', style: 'coloredText', alignment: 'left' },
          // { text: '\nInfraestructura Pública', style: 'coloredTextgray', alignment: 'left' }


        ],
        margin: [40, 10]
      } as any,
      content: [

        {
          text: '\n\n\n\n\FORMULARIO DE SOLICITUD DE ' + this.datos[0].descpermiso + '.\n',
          style: 'header', alignment: 'center'
        } as any,
        {
          text: this.datos[0].codcarpeta + '-' + this.datos[0].descpermisodetalle + '-' + this.datos[0].correlativomemo + '\n\n\n\n',
          style: 'subheader', alignment: 'center'
        },
        {
          text: 'DATOS DE PROYECTO. \n\n',
          style: 'subheader',
        },
        {
          table: {
            widths: ['*', 400],
            body: [
              [
                { text: [{ text: 'CÓDIGO:', style: 'textTitulo' },], fillColor: '#dddddd', border: [false, true, false, false] },
                { text: [{ text: this.datos[0].codcarpeta, style: 'textDato' }], fillColor: '#dddddd', border: [false, true, false, false] }
              ],

              [
                { text: [{ text: 'OBRA:', style: 'textTitulo' },] },
                { text: [{ text: this.datos[0].desccarpeta, style: 'textDato' }] }
              ],
              [
                { text: [{ text: 'ZONA:', style: 'textTitulo' },], fillColor: '#dddddd' },
                { text: [{ text: this.datos[0].zonacarpeta, style: 'textDato' }], fillColor: '#dddddd' }
              ],
              [
                { text: [{ text: 'MONTO DEL PROYECTO:\n', style: 'textTitulo' },] },
                { text: [{ text: this.datos[0].totalcarpeta + '\n', style: 'textDato' }] }
              ],

            ]
          },
          // fontSize: 9, bold: true,
          layout: 'noBorders'
        },
        {
          table: {
            widths: ['*', 300],
            body: [
              [
                { text: [{ text: 'MODALIDAD DE CONTRATACIÓN:', style: 'textTitulo' },], fillColor: '#dddddd' },
                { text: [{ text: this.datos[0].modalidads, style: 'textDato' }], fillColor: '#dddddd' }
              ],

              [
                { text: [{ text: 'FECHA DE VALIDADCIÓN DE CARPETA:\n\n\n\n', style: 'textTitulo' },] },
                { text: [{ text: this.fechaString(this.datos[0].fechavalcarpeta) + '\n\n\n\n', style: 'textDato' }] }
              ]

            ]
          },
          layout: 'noBorders'
        },

        {
          table: {
            widths: ['*', 330],
            body: [
              [
                { text: [{ text: '\n', style: 'textTitulo' },] },
                { text: [{ text: '\n', style: 'textDato' }], }
              ], [
                { text: [{ text: '\n', style: 'textTitulo' },] },
                { text: [{ text: '\n', style: 'textDato' }], }
              ],


            ]
          },
          layout: 'lightHorizontalLines'
        },

        {
          table: {
            widths: ['*', '*', '*'],
            body: [
              [
                { text: [{ text: 'CUANTIA:', style: 'textTitulo' },], fillColor: '#dddddd' },
                { text: [{ text: 'TIPO DE OBRA', style: 'textTitulo' }], fillColor: '#dddddd' },
                { text: [{ text: 'FECHA DE SOLICITUD:', style: 'textTitulo' },], fillColor: '#dddddd' },

              ],

              [
                { text: [{ text: this.datos[0].totalcarpeta + '\n\n', style: 'textDato' }] },
                { text: [{ text: this.datos[0].tipoobra + ':\n\n', style: 'textDato' },] },
                { text: [{ text: this.fechaString(this.datos[0].fecharegistro) + '\n\n', style: 'textDato' }] }
              ],
              [
                { text: [{ text: this.datos[0].descpermiso + ' SUGERIDO:', style: 'textTitulo' },], fillColor: '#dddddd' },
                { text: [{ text: 'UNIDAD EJECUTORA', style: 'textTitulo' }], colSpan: 2, fillColor: '#dddddd' },


              ],

              [
                { text: [{ text: this.datos[0].nombre + ' ' + this.datos[0].primerapellido + ' ' + this.datos[0].segundoapellido + '\n', style: 'textDato' }] },
                { text: [{ text: this.datos[0].nombreda + ':\n', style: 'textDato' },], colSpan: 2 },

              ]

            ]
          },
          layout: 'noBorders'
        },


        {
          text: [
            '\n\n\n\n\n\n\nSolicitante:Jose Perez:' + '\n' + 'RPC/RPA',
          ],
          style: 'subheader', alignment: 'center'
        },


        {
          text: [
            '\n\n\n\n\n\n\ncc:Arch:',
          ],
          style: 'footerText'
        },

      ],

      /*  footer: {
          columns: [
        //    { qr: 'Texto o URL para el QR', fit: 100, alignment: 'center' }, // QR Code en el pie de página
            { image: `data:image/png;base64,${this.getImageBase64(footerImage)}`, width: 100, alignment: 'right' }
          ],
          margin: [40, 10]
        } as any,*/

      styles: {
        header: {
          fontSize: 14,
          bold: true,
        },
        subheader: {
          fontSize: 12,
          bold: true,
        },
        coloredText: {
          fontSize: 11,
          bold: true,
          color: 'gray', // Cambiar el color del texto a 'blue'
        },
        coloredTextgray: {
          fontSize: 14,
          bold: true,
          color: 'gray', // Cambiar el color del texto a 'blue'
        },        
        footerText: {
          fontSize: 6,
          bold: false,
        },
        textTitulo: {
          fontSize: 10,
          bold: true,
        },
        textDato: {
          fontSize: 10,
          bold: false,
          //color: 'gray', 
          opacity: 0.8,
        },


      },

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

  //GENERAR MEMORANDUM 
  async generateMemo(gestion: number, id: number): Promise<Buffer> {
    const res = await this.datosGeneralesReporte(gestion, id);
    if (!res || (Array.isArray(res) && res.length === 0) || (typeof res === 'object' && Object.keys(res).length === 0)) {
      throw new Error('No se encontraron datos para la gestión y el ID proporcionados.');
    }

    this.datos = res;

    const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
    const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
    const imgPath = 'assets/images/logo.png';
    const documentDefinition = {
      pageSize: 'LETTER' as any,
      watermark: { text: 'SGEO', color: 'blue', opacity: 0.1, bold: true, italics: false },

      header: {
        columns: [
          //{ image: `data:image/png;base64,${this.getImageBase64(headerImage)}`, width: 100 },
          { image: imgPath, width: 150 },  // Uso de la ruta de imagen directamente          

          //{ text: 'Título en Rojo', style: 'coloredText', alignment: 'left' }
          { text: 'Secretaría Municipal de Infraestructura Pública', style: 'coloredText', alignment: 'left' },
          // { text: '\nInfraestructura Pública', style: 'coloredTextgray', alignment: 'left' }          
        ],
        margin: [40, 10]
      } as any,
      content: [

        {
          text: '\n\n\n\n\M E M O R Á N D U M.\n',
          style: 'header0', alignment: 'center'
        } as any,
        {
          text: this.datos[0].codcarpeta + '-' + this.datos[0].descpermisodetalle + '-' + this.datos[0].correlativomemo + '\n\n\n\n',
          style: 'subheader11', alignment: 'center'
        },
        {
          alignment: 'center',
          columns: [
            {
              text: 'GOBIERNO AUTÓNOMO MUNICIPAL DE LA PAZ\n La Paz, ' + this.fechaString(this.datos[0].fechamodificacion), style: 'subheader11'
            },
            {
              text: 'Señor(a).\n' + this.datos[0].profesiondetalle + ' ' + this.datos[0].nombre + ' ' + this.datos[0].primerapellido + ' ' + this.datos[0].segundoapellido + '\nPresente.- ', style: 'subheader11'
            }
          ]
        },

        {
          table: {
            widths: ['*', 330],
            body: [
              [
                { text: [{ text: '\n', style: 'textTitulo' },] },
                { text: [{ text: '\n', style: 'textDato' }], }
              ], [
                { text: [{ text: '\n', style: 'textTitulo' },] },
                { text: [{ text: '\n', style: 'textDato' }], }
              ],


            ]
          },
          layout: 'lightHorizontalLines'
        },
        {
          text: 'REF: DESIGNACIÓN DE ' + this.datos[0].descpermiso + ' DE OBRA. \n\n',
          style: 'subheader', alignment: 'center'
        },

        //TEXTO

        {
          table: {
            widths: ['*', 400],
            body: [
              [
                { text: [{ text: 'OBRA:', style: 'textTitulo', alignment: 'right' },], fillColor: '#dddddd' },
                { text: [{ text: this.datos[0].desccarpeta, style: 'textDato', alignment: 'left' }], fillColor: '#dddddd' }
              ],

              [
                { text: [{ text: 'CÓDIGO:\n', style: 'textTitulo', alignment: 'right' },] },
                { text: [{ text: this.datos[0].codcarpeta + '\n', style: 'textDato' }] }
              ],
              [
                { text: [{ text: 'ZONA:\n', style: 'textTitulo', alignment: 'right' },], fillColor: '#dddddd' },
                { text: [{ text: this.datos[0].zonacarpeta + '', style: 'textDato' }], fillColor: '#dddddd' }
              ]
            ]
          },
          layout: 'noBorders'
        },


        {
          text: '\n\n\nSeñor(a):\n En atención a la solicitud de la Unidad Ejecutora, se comunica a usted que la ' + this.datos[0].nombreue + ' ha dispuesto designarlo(a) ' + this.datos[0].descpermiso + ' (a) de la obra ' + this.datos[0].desccarpeta + '.\n\nPara el efecto, a partir de la fecha deberá cumplir con las funciones y responsabilidades definidas en el Reglamento de Supervisión y Fiscalización de Obras del GAMLP, Código de Ética y Reglamento Interno de Personal del GAMLP.\n\n Seguro de que su capacidad y alto espíritu de trabajo sean puestos a favor de nuestro Municipio, aprovecho la oportunidad para desearle éxitos en el desempeño de sus funciones.',
          style: 'textDato', alignment: 'justify'
        },

        {
          text:
            '\n\n\n\n\nDIRECTOR(A) ' + this.datos[0].aprobador,
          style: 'textDato', alignment: 'center'
        },
        {
          text:
            this.datos[0].nombreue,
          style: 'textTitulo', alignment: 'center'
        },


        {
          text: [
            '\n\n\n\n\n\n\ncc:Arch:',
          ],
          style: 'footerText'
        },

      ],

      /*  footer: {
          columns: [
        //    { qr: 'Texto o URL para el QR', fit: 100, alignment: 'center' }, // QR Code en el pie de página
            { image: `data:image/png;base64,${this.getImageBase64(footerImage)}`, width: 100, alignment: 'right' }
          ],
          margin: [40, 10]
        } as any,*/

      styles: {
        header0: {
          fontSize: 16,
          bold: true,
        },
        header: {
          fontSize: 14,
          bold: true,
        },
        subheader: {
          fontSize: 12,
          bold: true,
        },
        subheader11: {
          fontSize: 11,
          bold: true,
        },
        coloredText: {
          fontSize: 11,
          bold: true,
          color: 'gray', // Cambiar el color del texto a 'blue'
        },
        coloredTextgray: {
          fontSize: 14,
          bold: true,
          color: 'gray', // Cambiar el color del texto a 'blue'
        },
        footerText: {
          fontSize: 6,
          bold: false,
        },
        textTitulo: {
          fontSize: 10,
          bold: true,
        },
        textDato: {
          fontSize: 10,
          bold: false,
          //color: 'gray', 
          opacity: 0.8,
        },

        textDato12: {
          fontSize: 12,
          bold: false,
          //color: 'gray', 
          opacity: 0.8,
        },


        textDatoNormal11: {
          fontSize: 11,
          bold: false,
        },

      },
      pageMargins: [70, 60, 50, 30] as any, // Márgenes: izquierda, arriba, derecha, abajo


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


  async generateMemoReemplazo(gestion: number, id: number): Promise<Buffer> {
    const res = await this.datosGeneralesReporte(gestion, id);

    if (!res || (Array.isArray(res) && res.length === 0) || (typeof res === 'object' && Object.keys(res).length === 0)) {
      throw new Error('No se encontraron datos para la gestión y el ID proporcionados.');
    }
    this.datos = res;

    const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
    const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');

    const documentDefinition = {
      pageSize: 'LETTER' as any,
      watermark: { text: 'SGEO', color: 'blue', opacity: 0.1, bold: true, italics: false },

      header: {
        columns: [
          { image: `data:image/png;base64,${this.getImageBase64(headerImage)}`, width: 100 },
          //{ text: 'Título en Rojo', style: 'coloredText', alignment: 'left' }
          { text: 'Secretaría Municipal de Infraestructura Pública', style: 'coloredText', alignment: 'left' },
          // { text: '\nInfraestructura Pública', style: 'coloredTextgray', alignment: 'left' }          
        ],
        margin: [40, 10]
      } as any,
      content: [

        {
          text: '\n\n\n\n\M E M O R Á N D U M.\n',
          style: 'header0', alignment: 'center'
        } as any,
        {
          text: this.datos[0].codcarpeta + '-' + this.datos[0].descpermisodetalle + '-' + this.datos[0].correlativomemo + '\n\n\n\n',
          style: 'subheader11', alignment: 'center'
        },
        {
          alignment: 'center',
          columns: [
            {
              text: 'GOBIERNO AUTÓNOMO MUNICIPAL DE LA PAZ\nFECHA: La Paz, ' + this.fechaString(this.datos[0].fechamodificacion), style: 'subheader11'
            },
            {
              text: 'Señor(a).\n' + this.datos[0].profesiondetalle + ' ' + this.datos[0].nombre + ' ' + this.datos[0].primerapellido + ' ' + this.datos[0].segundoapellido + '\nPresente.- ', style: 'subheader11'
            }
          ]
        },

        {
          table: {
            widths: ['*', 330],
            body: [
              [
                { text: [{ text: '\n', style: 'textTitulo' },] },
                { text: [{ text: '\n', style: 'textDato' }], }
              ], [
                { text: [{ text: '\n', style: 'textTitulo' },] },
                { text: [{ text: '\n', style: 'textDato' }], }
              ],


            ]
          },
          layout: 'lightHorizontalLines'
        },
        {
          text: 'REF: DESIGNACIÓN DE ' + this.datos[0].descpermiso + ' DE OBRA. \n\n',
          style: 'subheader', alignment: 'center'
        },

        //TEXTO

        {
          table: {
            widths: ['*', 400],
            body: [
              [
                { text: [{ text: 'OBRA:', style: 'textTitulo', alignment: 'right' },], fillColor: '#dddddd' },
                { text: [{ text: this.datos[0].desccarpeta, style: 'textDato', alignment: 'left' }], fillColor: '#dddddd' }
              ],

              [
                { text: [{ text: 'CÓDIGO:\n', style: 'textTitulo', alignment: 'right' },] },
                { text: [{ text: this.datos[0].codcarpeta + '\n', style: 'textDato' }] }
              ],
              [
                { text: [{ text: 'ZONA:\n', style: 'textTitulo', alignment: 'right' },], fillColor: '#dddddd' },
                { text: [{ text: this.datos[0].zonacarpeta + '', style: 'textDato' }], fillColor: '#dddddd' }
              ]
            ]
          },
          layout: 'noBorders'
        },


        {
          text: '\n\n\nSeñor(a):\n Mediante la presente se comunica a usted que la Dirección de Ejecución y Supervisión de Infraestructuras Especiales/' + this.datos[0].nombreda + ' ha dispuesto designarlo(a) a partir de la fecha ' + this.datos[0].descpermiso + ' (a) de la obra ' + this.datos[0].desccarpeta + '.\n\n En reemplazo de (él/la) profesional ' + this.datos[0].personaareemplazar + ', medida asumida con el fin de dar continuidad a los trabajos de la obra. Para el efecto, a partir de la fecha deberá cumplir con las funciones y responsabilidades definidas en el Reglamento de Supervisión y Fiscalización de Obras del GAMLP, Código de Ética y Reglamento Interno de Personal del GAMLP.\n\n Seguro de que su capacidad y alto espíritu de trabajo sean puestos a favor de nuestro Municipio, aprovecho la oportunidad para desearle éxitos en el desempeño de sus funciones.',
          style: 'textDato', alignment: 'justify'
        },

        {
          text: [
            '\n\n\n\n\nDIRECTOR DE SUPERVISIÓN DE OBRAS' + '\n' + 'UNIDAD EJECUTORA',
          ],
          style: 'subheader', alignment: 'center'
        },


        {
          text: [
            '\n\n\n\n\n\n\ncc:Arch:',
          ],
          style: 'footerText'
        },

      ],

      /*  footer: {
          columns: [
        //    { qr: 'Texto o URL para el QR', fit: 100, alignment: 'center' }, // QR Code en el pie de página
            { image: `data:image/png;base64,${this.getImageBase64(footerImage)}`, width: 100, alignment: 'right' }
          ],
          margin: [40, 10]
        } as any,*/

      styles: {
        header0: {
          fontSize: 16,
          bold: true,
        },
        header: {
          fontSize: 14,
          bold: true,
        },
        subheader: {
          fontSize: 12,
          bold: true,
        },
        subheader11: {
          fontSize: 11,
          bold: true,
        },
        coloredText: {
          fontSize: 11,
          bold: true,
          color: 'gray', // Cambiar el color del texto a 'blue'
        },
        coloredTextgray: {
          fontSize: 14,
          bold: true,
          color: 'gray', // Cambiar el color del texto a 'blue'
        },
        footerText: {
          fontSize: 6,
          bold: false,
        },
        textTitulo: {
          fontSize: 10,
          bold: true,
        },
        textDato: {
          fontSize: 10,
          bold: false,
          //color: 'gray', 
          opacity: 0.8,
        },

        textDato12: {
          fontSize: 12,
          bold: false,
          //color: 'gray', 
          opacity: 0.8,
        },


        textDatoNormal11: {
          fontSize: 11,
          bold: false,
        },

      },
      pageMargins: [70, 60, 50, 30] as any, // Márgenes: izquierda, arriba, derecha, abajo


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

//FORMULARIO DE ENVIO DE DOCUMENTACION 

async datosReporteEnvio(obra: number) {
  const query1 = `SELECT distinct *, td.id_tipo_documento  
  FROM  tipo_documento as td
  INNER JOIN (SELECT id_subtipo, desc_subtipo FROM parametrica WHERE id_tipo=11 ) sub ON td.id_subtipo_documento = sub.id_subtipo
LEFT OUTER JOIN documento as d ON td.id_tipo_documento=d.id_tipo_documento
INNER JOIN obra  as o ON  d.id_obra = o.id_obra
INNER JOIN ficha as f ON o.id_ficha= f.id_ficha  
WHERE  d.id_obra = ${obra} AND id_etapa_documento =1 AND id_subtipo_documento =108 ORDER BY td.id_tipo_documento ASC;	`;
  const values = [obra]
  const resultado = await this.sequelize.query(query1);
  return resultado[0];
}


async datosAdjuntoSim(obra: number) {
const query1 = `SELECT *  
  FROM  tipo_documento as td
WHERE  id_subtipo_documento =107 ORDER BY td.id_tipo_documento ASC;	`;
const values = [obra]
const resultado = await this.sequelize.query(query1);
return resultado[0];
}



  async preguntasInforme(obra: number, tipo_informe: number) {
    const query1 = `
    SELECT * FROM public."vista_informe-inicial"  
    WHERE id_obra = ${obra} `;
    const values = [obra, tipo_informe]
    const resultado = await this.sequelize.query(query1);
    return resultado[0];
    console.log('preguntasInforme', resultado[0]);
  }
  async preguntasInformeRestante(obra: number, tipo_informe: number, subtipo: number) {
    const query1 = `
    SELECT * FROM public."vista_informe_inicial_restante"  
    WHERE id_obra = ${obra} AND id_tipo_informe =${tipo_informe} AND id_subtipo=${subtipo}`;
    const values = [obra, tipo_informe]
    const resultado = await this.sequelize.query(query1);
    return resultado[0];
    console.log('preguntasInforme', resultado[0]);

  }  

  async generateEnvioDoc(obra: number): Promise<Buffer> {

    const res = await this.datosReporteEnvio(obra);
    if (!res || (Array.isArray(res) && res.length === 0) || (typeof res === 'object' && Object.keys(res).length === 0)) {
      throw new Error('No se encontraron datos para la obra y el ID proporcionados.');
    }
    const ressim = await this.datosAdjuntoSim(obra);

  this.datosSIM = ressim;
  this.datosEnvio = res;
  const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
  const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
  const imgPath = 'assets/images/logo_gamlp.png';

  const documentDefinition = {
    pageSize: 'LETTER' as any,
    watermark: { text: 'SGEO', color: 'blue', opacity: 0.1, bold: true, italics: false },

    header: {
      columns: [
        { image: imgPath, width: 120 },            

       // { image: `data:image/png;base64,${this.getImageBase64(headerImage)}`, width: 100 },
        //{ text: 'Título en Rojo', style: 'coloredText', alignment: 'left' }
             { text: 'Secretaría Municipal de Infraestructura Pública', style: 'coloredText', alignment: 'left' },
       // { text: '\nInfraestructura Pública', style: 'coloredTextgray', alignment: 'left' }          
      ],
      margin: [40, 10]
    } as any,
    content: [

      {
        text: '\n\nFORMULARIO DE ENVÍO DE DOCUMENTACIÓN\n DEL PROYECTO.\n\n',
        style: 'header', alignment: 'center'
      } as any,
     
      {
        text: 'DATOS DE PROYECTO. \n',
        style: 'subheader',
      },

      {
        table: {
          widths: ['*', 400],
          body: [
            [
              { text: [{ text: 'CÓDIGO:', style: 'textTitulo' },], fillColor: '#dddddd' },
              { text: [{ text: this.datosEnvio[0].cod_carpeta, style: 'textDato' }], fillColor: '#dddddd' }
            ],

            [
              { text: [{ text: 'OBRA:\n', style: 'textTitulo' },] },
              { text: [{ text:this.datosEnvio[0].desc_carpeta + '\n', style: 'textDato' }] }
            ],

            [
              { text: [{ text: 'ZONA:\n', style: 'textTitulo' },], fillColor: '#dddddd' },
              { text: [{ text: this.datosEnvio[0].desc_zona_carpeta + '\n', style: 'textDato' }], fillColor: '#dddddd' }
            ],

            [
              { text: [{ text: 'MONTO DE PROYECTO:\n', style: 'textTitulo' },] },
              { text: [{ text: this.datosEnvio[0].total_carpeta + '\n', style: 'textDato' }] }
            ],

            [
              { text: [{ text: 'FECHA DE VALIDACIÓN DEL PROYECTO:\n', style: 'textTitulo' },]  },
              { text: [{ text: this.fechaString(this.datosEnvio[0].fecha_validacion_carpeta) + '\n\n', style: 'textDato' }] }
            ]



          ]
        },
        layout: 'noBorders'
      },

        {
          table: {
            widths: [100, '*'],
            body: [
              [
                { text: [{ text: 'CÓDIGO:', style: 'textTitulo', alignment: 'right' },], fillColor: '#f0f0f0' },
                { text: [{ text: this.datosEnvio[0].cod_carpeta, style: 'textDato' }], fillColor: '#f0f0f0' }
              ],

              [
                { text: [{ text: 'OBRA:\n', style: 'textTitulo', alignment: 'right' },] },
                { text: [{ text: this.datosEnvio[0].desc_carpeta + '\n', style: 'textDato' }] }
              ],

              [
                { text: [{ text: 'ZONA:\n', style: 'textTitulo', alignment: 'right' },], fillColor: '#f0f0f0' },
                { text: [{ text: this.datosEnvio[0].desc_zona_carpeta + '\n', style: 'textDato' }], fillColor: '#f0f0f0' }
              ],

              [
                { text: [{ text: 'MONTO DE PROYECTO:\n', style: 'textTitulo', alignment: 'right' },] },
                { text: [{ text: this.datosEnvio[0].total_carpeta + '\n', style: 'textDato' }] }
              ],

              [
                { text: [{ text: 'FECHA DE VALIDACIÓN DEL PROYECTO:\n', style: 'textTitulo', alignment: 'right' },], fillColor: '#f0f0f0' },
                { text: [{ text: this.fechaString(this.datosEnvio[0].fecha_validacion_carpeta) + '\n\n', style: 'textDato' }], fillColor: '#f0f0f0' }
              ]
            ]
          },
          //layout: 'noBorders'
        },

      {
        text: '\nSupervisión de Obra: \n\En cumplimiento al Reglamento de Supervisión y Fiscalización de Obras, toda vez que la obra cuenta con la supervisión designada, se remite el detalle de la documentación del proyecto para su revisión. \n\n',
        style: 'textDato',
      },

        {
          table: {
            widths: [30, '*', 50, 100],
            body: [
              [
                { text: [{ text: 'Nº:', style: 'textTitulo', alignment: 'center', },], fillColor: '#dddddd' },
                { text: [{ text: 'DOCUMENTO:', style: 'textTitulo' },], fillColor: '#dddddd' },
                { text: [{ text: 'ADJUNTO:', style: 'textTitulo', alignment: 'center', },], fillColor: '#dddddd' },
                { text: [{ text: 'OBS:', style: 'textTitulo' },], fillColor: '#dddddd' },

              ],
              ...this.buildDocumentosSIM(this.datosSIM)
            ]
          },
        },

        {
          text: '\nDocumentación Complementaría. \n',
          style: 'textTitulo',
        },



        {
          table: {
            widths: [30, '*', 50, 100],
            body: [
              [
                { text: [{ text: 'Nº:', style: 'textTitulo', alignment: 'center', },], fillColor: '#dddddd' },
                { text: [{ text: 'DOCUMENTO:', style: 'textTitulo' },], fillColor: '#dddddd' },
                { text: [{ text: 'ADJUNTO:', style: 'textTitulo', alignment: 'center', },], fillColor: '#dddddd' },
                { text: [{ text: 'OBS:', style: 'textTitulo' },], fillColor: '#dddddd' },

              ],
              ...this.buildDocumentos(this.datosEnvio)
            ]
          },
        },

        {
          text: '\n\n* El presente formulario será considerado una declaración jurada, cuya validez y contenido son de entera responsabilidad del funcionario municipal que suscribe la presente, bajo sanción de las determinaciones establecidas en el Reglamento Interno de Personal del GAMLP, en caso de encontrarse incumplimientos e inconsistencias.\n'
            + '\n** Se remite una copia a la Fiscalización de Obra. \n\n',
          style: 'textDato',
        },


        {
          text: '\n Fecha de Envío: 03/12/2024  ',
          style: 'textDato',
        },


        {
          text: [
            '\nIng. Jefe Sub:' + '\n' + 'Jefe de Unidad Solicitante',
          ],
          style: 'subheader', alignment: 'center'
        },

        {
          text: [
            '\ncc:Arch:',
          ],
          style: 'footerText'
        },

      ],


      styles: {
        header: {
          fontSize: 12,
          bold: true,
        },
        subheader: {
          fontSize: 10,
          bold: true,
        },
        coloredText: {
          fontSize: 11,
          bold: true,
          color: 'gray', // Cambiar el color del texto a 'blue'
        },
        coloredTextgray: {
          fontSize: 14,
          bold: true,
          color: 'gray', // Cambiar el color del texto a 'blue'
        },
        footerText: {
          fontSize: 6,
          bold: false,
        },
        textTitulo: {
          fontSize: 8,
          bold: true,
        },
        textDato: {
          fontSize: 8,
          bold: false,
          //color: 'gray', 
          opacity: 0.8,
        },


      },
      pageMargins: [70, 60, 50, 30] as any, // Márgenes: izquierda, arriba, derecha, abajo


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
























  //INFORME INICIAL SUPERVISOR 
  async generateInformeInicial(obra: number): Promise<Buffer> {

    const res = await this.datosReporteEnvio(obra);
    if (!res || (Array.isArray(res) && res.length === 0) || (typeof res === 'object' && Object.keys(res).length === 0)) {
      throw new Error('No se encontraron datos para la obra y el ID proporcionados.');
    }

    const res2 = await this.preguntasInforme(obra, 235);
    if (!res2 || (Array.isArray(res2) && res2.length === 0) || (typeof res2 === 'object' && Object.keys(res2).length === 0)) {
      throw new Error('No se encontraron datos para la obra y el ID proporcionados.');
    }
    
    const res3 = await this.preguntasInformeRestante(obra, 235, 174);
    if (!res3 || (Array.isArray(res3) && res3.length === 0) || (typeof res3 === 'object' && Object.keys(res3).length === 0)) {
      throw new Error('No se encontraron datos para la obra y el ID proporcionados.');
    }

    const res4 = await this.preguntasInformeRestante(obra, 235, 174);
    if (!res4 || (Array.isArray(res4) && res4.length === 0) || (typeof res4 === 'object' && Object.keys(res4).length === 0)) {
      throw new Error('No se encontraron datos para la obra y el ID proporcionados.');
    }    
  
    this.datosPreguntaInforme = res2;    
    this.datosPreguntaInformeRestante = res3;
    this.datosEnvio = res;

    const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
    const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
    const imgPath = 'assets/images/logo_gamlp.png';
    const imgPathLeft = 'assets/images/logo_smip.png';

    const documentDefinition = {
      pageSize: 'LETTER' as any,
      watermark: { text: 'SGEO', color: 'blue', opacity: 0.1, bold: true, italics: false },

      /*   header: {
           columns: [
             { image: imgPath, width: 120 },
             { text: 'Secretaría Municipal de Infraestructura Pública', style: 'coloredText', alignment: 'left' },
           ],
           margin: [40, 10]
         } as any,*/
      /*    header: {
            table: {
              widths: ['70%', '0%', '30%'], // Proporciones de las columnas
              body: [
                [
                  { image: imgPath, width: 120 }, // Imagen derecha
                 // { text: '', style: 'headerText', alignment: 'center' }, // Título centrado            
                 //{ text: 'SECRETARÍA MUNICIPAL DE INFRAESTRUCTURA PÚBLICA', style: 'coloredText', alignment: 'center' }, // Título centrado
                 { text: '', style: 'coloredText', alignment: 'center' }, // Título centrado
                 { image: imgPathLeft, width: 130 } // Imagen izquierda
    
                ]
              ]
            },
            layout: 'noBorders', // Sin bordes en la tabla
            margin: [40, 10] // Márgenes del encabezado
    
          } as any,*/

  /*    header: {
        table: {
          widths: ['70%', '30%'], // Proporciones de las columnas
          body: [
            // Primera fila: Imagen a la izquierda
            [
              {
                image: imgPath,
                width: 60,
                alignment: 'right',
                margin: [0, 10, 0, 0] // Asegura que la imagen no esté pegada al borde superior
              },
              { text: '', border: [false, false, false, false] } // Celda vacía para ajuste
            ],
            // Segunda fila: Línea + Texto de título
            [
              {
                colSpan: 2, // Combina las dos columnas
                fillColor: '#dddddd', // Fondo gris claro
                margin: [0, 5, 0, 10], // Ajusta los márgenes alrededor de la línea y el texto
                stack: [
                  {
                    canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.1 }] // Línea horizontal
                  },
                  {
                    text: 'Título del Informe',
                    style: 'headerTitle',
                    alignment: 'center',
                    margin: [0, 5, 0, 0] // Espaciado debajo de la línea
                  }
                ]
              },
              {} // Celda vacía requerida por colSpan
            ]
          ]
        },
        layout: 'noBorders', // Sin bordes en la tabla
        margin: [0, 0, 0, 10] // Márgenes generales del encabezado
      } as any,*/

      header: {
        table: {
          widths: ['70%', '30%'], // Proporciones de columnas
          body: [
            // Primera fila: Imagen a la derecha
            [
              { text: '', border: [false, false, false, false] }, // Celda vacía para ajuste
              {
                image: imgPath,
                width: 70, // Ajusta el tamaño de la imagen (estático)
                height: 70, // También define la altura para evitar desbordes
                alignment: 'right',
                margin: [0, 0, 0, 0], // Márgenes internos de la celda
              }
            ],
            // Segunda fila: Línea + Título
            [
              {
                colSpan: 2, // Combina ambas columnas
                stack: [
                  // Línea horizontal
                  {
                    canvas: [
                      { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, color: '#555555' }
                    ]
                  },
                  // Texto del título
                  {
                    text: 'Título del Informe',
                    style: 'headerTitle',
                    alignment: 'center',
                    margin: [0, 10, 0, 0], // Espaciado adicional debajo de la línea
                  }
                ],
                margin: [0, 5, 0, 10], // Espaciado general para el contenido
                fillColor: '#f5f5f5', // Fondo del área combinada
              },
              {} // Celda vacía requerida por colSpan
            ]
          ]
        },
        layout: {
          defaultBorder: false, // Sin bordes en la tabla
          paddingTop: () => 0,
          paddingBottom: () => 0,
          paddingLeft: () => 0,
          paddingRight: () => 0,
        },
        margin: [0, 0, 0, 10] // Márgenes externos de la cabecera
      } as any,
  
      content: [
        {
          text: '\n\n\nINFORME.\n\n\n',
          style: 'header', alignment: 'center'
        } as any,

        {
          table: {
            widths: [100, '*'],
            body: [
              [
                { text: [{ text: 'A:', style: 'textTitulo', alignment: 'left' },] },
                { text: [{ text: this.datosEnvio[0].cod_carpeta, style: 'left' }, { text: '\nJEFE UNIDAD EJECUTORA\n', style: 'textTitulo' }] }
              ],

              [
                { text: [{ text: 'DE:\n', style: 'textTitulo', alignment: 'left' },] },
                { text: [{ text: this.datosEnvio[0].desc_carpeta + '\n', style: 'textDato' }, { text: 'SUPERVISOR DE OBRA\n', style: 'textTitulo' },] }
              ],

              [
                { text: [{ text: 'REF:\n', style: 'textTitulo', alignment: 'left' },] },
                { text: [{ text: 'INFORME INICIAL DE REVISIÓN DEL PROYECTO\n', style: 'textTitulo' }] }
              ],

              [
                { text: [{ text: 'FECHA:\n', style: 'textTitulo', alignment: 'left' },] },
                { text: [{ text: this.datosEnvio[0].total_carpeta + '\n', style: 'textDato' }] }
              ],
            ]
          },
          layout: 'noBorders',
        },
        {
          text: [
            '\nHabiendo sido designado (s) como Supervisor (es) de la obra ' + this.datosEnvio[0].desc_carpeta+ ' mediante Memorándum(s) XXX y YYY, de fecha DD/MM/AA/ y DD/MM/AA correspondientemente, y tras haber revisado el proyecto, se informa lo siguiente:',
          ],
          style: 'textDato'
        },
        {
          text: '\n1.  DATOS DE PROYECTO. \n\n',
          style: 'subheader',
        },
        {
          table: {
            widths: [100, '*'],
            body: [
              [
                { text: [{ text: 'CÓDIGO:', style: 'textTitulo', alignment: 'right' },], fillColor: '#f0f0f0' },
                { text: [{ text: this.datosEnvio[0].cod_carpeta, style: 'textDato' }], fillColor: '#f0f0f0' }
              ],

              [
                { text: [{ text: 'OBRA:\n', style: 'textTitulo', alignment: 'right' },] },
                { text: [{ text: this.datosEnvio[0].desc_carpeta + '\n', style: 'textDato' }] }
              ],

              [
                { text: [{ text: 'ZONA:\n', style: 'textTitulo', alignment: 'right' },], fillColor: '#f0f0f0' },
                { text: [{ text: this.datosEnvio[0].desc_zona_carpeta + '\n', style: 'textDato' }], fillColor: '#f0f0f0' }
              ],

              [
                { text: [{ text: 'MONTO DE PROYECTO:\n', style: 'textTitulo', alignment: 'right' },] },
                { text: [{ text: this.datosEnvio[0].total_carpeta + '\n', style: 'textDato' }] }
              ],

              [
                { text: [{ text: 'FECHA DE VALIDACIÓN DEL PROYECTO:\n', style: 'textTitulo', alignment: 'right' },], fillColor: '#f0f0f0' },
                { text: [{ text: this.fechaString(this.datosEnvio[0].fecha_validacion_carpeta) + '\n\n', style: 'textDato' }], fillColor: '#f0f0f0' }
              ]
            ]
          },
          //layout: 'noBorders'
        },

        {
          text: '\n2.  ANÁLISIS. \n\n',
          style: 'subheader',
        },
        {
          table: {
            widths: ['*', 50],
            body: [
              ...this.buildPreguntaPadre(this.datosPreguntaInforme),              
            ]
          },
          layout: 'noBorders'
        },
        {
          text: '\n3. OBSERVACIONES GENERALES. \n\n',
          style: 'subheader',
        },


        {
          text: '\n4. CONCLUSIONES \n\n',
          style: 'subheader',
        },
        {
          table: {
            widths: [30, '*', 50, 100],
            body: [
              [
                { text: [{ text: 'Nº:', style: 'textTitulo', alignment: 'center', },], fillColor: '#dddddd' },
                { text: [{ text: 'DOCUMENTO:', style: 'textTitulo' },], fillColor: '#dddddd' },
                { text: [{ text: 'ADJUNTO:', style: 'textTitulo', alignment: 'center', },], fillColor: '#dddddd' },
                { text: [{ text: 'OBS:', style: 'textTitulo' },], fillColor: '#dddddd' },

              ],
              ...this.buildDocumentosSIM(this.datosSIM)
            ]
          },
        },        
        {
          text: '\n5. RECOMENDACIONES \n\n',
          style: 'subheader',
        },
     
        [
          {
            table: {
              widths: [435, 50],
              body: [
             
                ...this.buildPreguntas (this.datosPreguntaInformeRestante)                
              ],
            },
          
          },
        ], 
        
        {
          text: '\n\n'
        },

        [
          {
            table: {
              widths: [435, 50],
              body: [
                [
                  { text: '*** POR LO QUE UNA COPIA DE ESTE INFORME DEBE SER REMITIDO A: A la Fiscalización de la Obra para su remisión a las Unidades Organizacionales requeridas (en caso corresponda).', style: 'textDato', fillColor: '#dddddd' },
                  { text: '', style: 'textDato', alignment: 'center', fillColor: '#f0f0f0' },
                ],
                
                [
                  { text: 'La Dirección de Fiscalización de Obras para solicitar su coordinación con SIREMU en la ejecución del proyecto.', style: 'textDato', fillColor: '#dddddd' },
                  { text: '', style: 'textDato', alignment: 'center', fillColor: '#f0f0f0' },
                ],

              ],
            },
          
          },
        ],

      {
        text: [
          '\n\n\n\n\n\n\ncc:Arch:', 
        ],
        style: 'footerText'
      },

    ],


      styles: {
        header: {
          fontSize: 12,
          bold: true,
        },
        subheader: {
          fontSize: 10,
          bold: true,
        },
        coloredText: {
          fontSize: 11,
          bold: true,
          color: 'gray', // Cambiar el color del texto a 'blue'
        },
        coloredTextgray: {
          fontSize: 14,
          bold: true,
          color: 'gray', // Cambiar el color del texto a 'blue'
        },
        footerText: {
          fontSize: 6,
          bold: false,
        },
        textTitulo: {
          fontSize: 9,
          bold: true,
        },
        textDato: {
          fontSize: 9,
          bold: false,
          //color: 'gray', 
          opacity: 0.8,
        },

        headerText: {
          fontSize: 12,
          bold: true,
          color: '#333333',
        },
        headerTitle: {
          fontSize: 13,
          bold: true,
          color: '#333333'
        }



      },
      pageMargins: [70, 60, 50, 30] as any, // Márgenes: izquierda, arriba, derecha, abajo    

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


//INFORME INICIAL SUPERVISOR 
async generateInformeActividades(obra:number): Promise<Buffer> {
    
  const res = await this.datosReporteEnvio(obra);
  if (!res || (Array.isArray(res) && res.length === 0) || (typeof res === 'object' && Object.keys(res).length === 0)) {
    throw new Error('No se encontraron datos para la obra y el ID proporcionados.');
  } 
  this.datosEnvio = res;
  const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
  const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
  const imgPath = 'assets/images/logo_gamlp.png';

  const documentDefinition = {
    pageSize: 'LETTER' as any,
    watermark: { text: 'SGEO', color: 'blue', opacity: 0.1, bold: true, italics: false },

  /*  header: {
      columns: [
        { image: imgPath, width: 120 },            

       // { image: `data:image/png;base64,${this.getImageBase64(headerImage)}`, width: 100 },
        //{ text: 'Título en Rojo', style: 'coloredText', alignment: 'left' }
        //     { text: 'Secretaría Municipal de Infraestructura Pública', style: 'coloredText', alignment: 'left' },
       // { text: '\nInfraestructura Pública', style: 'coloredTextgray', alignment: 'left' }          
      ],
      margin: [40, 10]
    } as any,*/
    content: [

      {
        text: '\n\n\n\n\INFORME DE ACTIVIDADES PREVIAS.\n\n\n\n',
        style: 'header', alignment: 'center'
      } as any,
     
     /* {
        text: 'DATOS DE PROYECTO. \n\n',
        style: 'subheader',
      },

  
      {
        text: [
          '\n\n\n\n\n\n\nSolicitante:Jose Perez:' + '\n' + 'RPC/RPA',
        ],
        style: 'subheader', alignment: 'center'
      },*/


      {
        text: [
          '\n\n\n\n\n\n\ncc:Arch:', 
        ],
        style: 'footerText'
      },

    ],


    styles: {
      header: {
        fontSize: 14,
        bold: true,
      },
      subheader: {
        fontSize: 12,
        bold: true,
      },
      coloredText: {
        fontSize: 11,
        bold: true,
        color: 'gray', // Cambiar el color del texto a 'blue'
      },
      coloredTextgray: {
        fontSize: 14,
        bold: true,
        color: 'gray', // Cambiar el color del texto a 'blue'
      },        
      footerText: {
        fontSize: 6,
        bold: false,
      },
      textTitulo: {
        fontSize: 10,
        bold: true,
      },
      textDato: {
        fontSize: 10,
        bold: false,
        //color: 'gray', 
        opacity: 0.8,
      },


    },

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


buildDocumentos(data: any) {
  let datosResp = data; 
  let arrayData = [];

  var c =0;
  for (let i = 0; i < datosResp.length; i++) {
   c= c+1;
    let rowData = [
      { text: [{ text: c, style: 'textDato', alignment: 'center', }]},
      { text: [{ text: datosResp[i].desc_tipo_documento, style: 'textDato' }]  },
      { text: [{ text: datosResp[i].cumple  ?'SI':'NO'  , style: 'textDato', alignment: 'center', }]  },
      { text: [{ text: datosResp[i].observacion, style: 'textDato' }]  },
    ];
    arrayData.push(rowData);

  }
  return arrayData;
}

buildDocumentosSIM(data: any) {
  let datosResp = data; 
  let arrayData = [];

  var c =0;
  for (let i = 0; i < datosResp.length; i++) {
   c= c+1;
    let rowData = [
      { text: [{ text: c, style: 'textDato', alignment: 'center', }]},
      { text: [{ text: datosResp[i].desc_tipo_documento, style: 'textDato' }]  },
      { text: [{ text: datosResp[i].cumple  ?'SI':'SI'  , style: 'textDato', alignment: 'center', }]  },
      { text: [{ text: datosResp[i].observacion, style: 'textDato' }]  },
    ];
    arrayData.push(rowData);

  }
  return arrayData;
}

  /* buildPreguntas(data: any) {
     let datosResp = data;
 
     console.log('datosRespdatosResp', datosResp);
 
     let arrayData = [];
    for (let i = 0; i < datosResp.length; i++) {
       let rowData = [
         { text: [{ text: datosResp[i].desc_subtipo, style: 'textDato' }] },
         { text: [{ text: datosResp[i].opcion, style: 'textDato', alignment: 'center', }] },
         { text: [{ text: datosResp[i].observaciones, style: 'textDato', alignment: 'center', }] },
       ]    
       arrayData.push(rowData);
     }
     return arrayData;
   }*/

  buildPreguntaPadre(data: any) {
    let groupedData = data.reduce((acc: any, item: any) => {
      if (!acc[item.padre]) {
        acc[item.padre] = {
          desc_padre: item.desc_padre, 
          items: [],
        };
      }
      acc[item.padre].items.push(item); 
      return acc;
    }, {});

    // Construir la tabla para cada `padre`
    let arrayData = [];

    for (let padre in groupedData) {
      const { desc_padre, items: preguntas } = groupedData[padre]; // Extraer desc_padre y preguntas
      let rowData = [
        {
          table: {
            body: [
              [
                { text:
                   [{ text: padre+': \n', style: 'textTitulo',  alignment: 'center',  margin: [0, 5, 0, 5]},
                    { text: desc_padre +':\n', style: 'textDato',  margin: [0, 5, 0, 5]}], fillColor: '#f0f0f0',},   
              ],                    
              // Segunda fila: Tabla de preguntas agrupadas por `padre`
              [
                {
                  table: {
                    widths: [435, 50],
                    body: [
                      [
                        { text: 'Pregunta:', style: 'textDato', fillColor: '#dddddd' },
                        { text: 'Opción:', style: 'textDato', alignment: 'center', fillColor: '#dddddd' },
                      ],
                      // Preguntas agrupadas
                      ...preguntas.map((pregunta: any) => [
                        { text: pregunta.desc_subtipo, style: 'textDato' },
                        { text: pregunta.opcion , style: 'textDato', alignment: 'center' },
                      ]),
                    ],
                  },
                  layout: 'noBorders',
                },
              ],
            ],
          },
          layout: 'noBorders', // Quitar bordes de la tabla principal
        },
      ];
      arrayData.push(rowData);
    }

    return arrayData;
  }


  buildPreguntas(data: any) {
    let datosResp = data;
    let arrayData = [];
    var c = 0;
    for (let i = 0; i < datosResp.length; i++) {
      let rowData =
        [
          { text: [{ text: datosResp[i].desc_subtipo, style: 'textDato' }] },
          { text: [{ text: datosResp[i].opcion, style: 'textDato', alignment: 'center', }] },
        ];
      arrayData.push(rowData);
    }
    return arrayData;
  }


  /* {
 
        text:  [ 
        //resultado,
        {text:'• '+'CÓDIGO DE CONTRATACIÓN: ', style:'textTitulo'}, { text:'\n', style:'textDato'  },                   
        {text:'• '+'OBJETO DE CONTRATACIÓN: ', style:'textTitulo'}, {text: '\n', style:'textDato'},
        {text:'• '+'MODALIDAD DE CONTRATACIÓN:  ' ,  style:'textTitulo'}, {text:'\n', style:'textDato' },
        {text:'• '+'CAUSAL APLICADA: ',  style:'textTitulo'}, {text:'\n', style:'textDato'},
        {text:'• '+'NÚMERO DE CONVOCATORIA: ',  style:'textTitulo'}, {text:'\n', style:'textDato'},
        {text:'• '+ 'PRECIO REFERENCIAL (Bs): ',  style:'textTitulo'}, {text:'\n', style:'textDato'},
        {text:'• '+ 'PRECIOS UNITARIOS(Bs.)\n:',  style:'textTitulo' }, { text:' Se detallan en el anexo adjunto a la presente.\n\n', style:'textDato' } 
             
        ]
       }, */

}
