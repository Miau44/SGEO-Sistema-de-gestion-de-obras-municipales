import { Injectable, Inject } from '@nestjs/common';
//import * as PdfPrinter from 'pdfmake/src/printer';
import PdfPrinter from 'pdfmake';
import * as path from 'path';
import * as fs from 'fs';
import { ResponseService } from 'src/response.service';
import { Sequelize } from 'sequelize-typescript';
import { log } from 'console';



const fonts = {
  Roboto: {
    normal: path.join(__dirname, '..', 'assets', 'fonts', 'Roboto-Regular.ttf'),
    bold: path.join(__dirname, '..', 'assets', 'fonts', 'Roboto-Medium.ttf'),
    italics: path.join(__dirname, '..', 'assets', 'fonts', 'Roboto-Italic.ttf'),
    bolditalics: path.join(__dirname, '..', 'assets', 'fonts', 'Roboto-MediumItalic.ttf'),
  },
};


@Injectable()
export class ReportService {
  datos: any = [];
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


  async generatePdf(gestion:number, id:number): Promise<Buffer> {
    const res = await this.datosGeneralesReporte(gestion, id);

    this.datos = res;
    console.log("Generar, ", res);
    console.log("Generar, ", this.datos);
    console.log("Generar, ", this.datos.codcarpeta);
    console.log("Generarcodcarpeta, ", this.datos[0].codcarpeta);
    console.log("Generar, ", this.datos.zonacarpeta);

    // this.datos_documento = res;
    // console.log(this.datos_documento)
    //log(respuesta)
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

    // Puedes incluir la hora en el string si es necesario
    // formattedDate += ` ${horas}:${minutos}`;
  }

  return formattedDate;
}


}
