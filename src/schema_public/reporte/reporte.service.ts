import { Injectable, Inject, Header } from '@nestjs/common';
//import * as PdfPrinter from 'pdfmake/src/printer';
import PdfPrinter from 'pdfmake';
import * as path from 'path';
import * as fs from 'fs';
import { ResponseService } from 'src/response.service';
import { Sequelize } from 'sequelize-typescript';
import { log } from 'console';
import { existsSync } from 'fs'
import { join } from 'path';
import { text } from 'stream/consumers';
import { Any } from 'typeorm';



const rootPath = process.cwd();
const fontsPath = join(process.cwd(), 'assets', 'fonts');

const fonts = {
  Roboto: {
    normal: join(fontsPath, 'Roboto-Regular.ttf'),
    bold: join(fontsPath, 'Roboto-Medium.ttf'),
    italics: join(fontsPath, 'Roboto-Italic.ttf'),
    bolditalics: join(fontsPath, 'Roboto-MediumItalic.ttf'),
  },

  Muller_Regular: {

  }
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
  datosPreguntaInformeConclusion: any = [];
  datosListaSupervisores: any = [];
  constructor(
    private readonly responseService: ResponseService,
    @Inject(Sequelize) private sequelize: Sequelize, // Inyecta Sequelize correctamente
  ) { this.printer = new PdfPrinter(fonts); }

  private readonly printer = new PdfPrinter(fonts);

  private getImageBase64(imagePath: string): string {
    const image = fs.readFileSync(imagePath);
    //-----const image2 = fs.readFileSync(imagePath2);
    return image.toString('base64');
  }

  async datosGeneralesReporte(id: number) {
    //const query1 = ` SELECT * FROM sp_reporte_memorandum2(${gestion},${id})`;
    const query1 = ` SELECT * FROM public.vista_reporte_designacion_memorandum WHERE id_designacion = ${id}`;
    //const response = await sequelize.query(query);
    const resultado = await this.sequelize.query(query1);
    return resultado[0];
  }

//SOLICITUD DE DESIGNACION 
  async generatePdf(id: number): Promise<Buffer> {
    const res = await this.datosGeneralesReporte(id);
    if (!res || (Array.isArray(res) && res.length === 0) || (typeof res === 'object' && Object.keys(res).length === 0)) {
      throw new Error('No se encontraron datos para el ID proporcionado');
    }
    this.datos = res;
    console.log("Generar1, ", res);
    console.log("Generar2, ", this.datos);
    console.log("Generarcodcarpeta, ", this.datos[0].codcarpeta);


    const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
    const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
    //const imgUrl = 'http://localhost:3009/images/logo.png';  // Cambia la URL según tu configuración
    const imgPath = 'assets/images/membretado_carta.png';
    try {
      const documentDefinition = {
        pageSize: 'LETTER' as any,
        //pageMargins: [0, 0, 0, 0], // Elimina los márgenes para que la imagen cubra toda la hoja
        background: function (currentPage: any, pageSize: any) {
          return {
            image: imgPath,
            width: pageSize.width,
            height: pageSize.height,
            absolutePosition: { x: 0, y: 0 }
          }
        },
        //ME watermark: { text: 'SGEO', color: 'blue', opacity: 0.1, bold: true, italics: false },

        header: {
          columns: [
            //{ image: imgPath, width: 180 },  // Uso de la ruta de imagen directamente          
            //   { image: `data:image/png;base64,${this.getImageBase64(headerImage)}`, width: 100 },
            //{ text: 'Título en Rojo', style: 'coloredText', alignment: 'left' }
            //ME { text: 'Secretaría Municipal de Infraestructura Pública', style: 'coloredText', alignment: 'left' },
            // { text: '\nInfraestructura Pública', style: 'coloredTextgray', alignment: 'left' }

          ],
          //ME margin: [40, 10, 20, 10] // [left, top, right, bottom]
        } as any,
               
      content: [

        {
          text: '\n\n\n\n\n\nFORMULARIO SOLICITUD DE ' + this.datos[0].permisos + '\n',
          style: 'header', alignment: 'center'
        } as any,
        {
          text: this.datos[0].cod_carpeta + '-' + this.datos[0].cite_solicitud + '-' + this.datos[0].correlativo_solicitud + '\n\n\n',
          style: 'subheader', alignment: 'center'
        },
        {
          text: 'DATOS DE PROYECTO \n',
          style: 'textTitulo',
        },
        {
          table: {
            widths: ['*', 350],
            body: [
              [
                { text: [{ text: 'CÓDIGO:', style: 'textTitulo' },], fillColor: '#dddddd', border: [false, true, false, false] },
                { text: [{ text: this.datos[0].cod_carpeta, style: 'textDato' }], fillColor: '#dddddd', border: [false, true, false, false] }
              ],

              [
                { text: [{ text: 'OBRA:', style: 'textTitulo' },] },
                { text: [{ text: this.datos[0].desc_carpeta, style: 'textDato' }] }
              ],
              [
                { text: [{ text: 'ZONA:', style: 'textTitulo' },], fillColor: '#dddddd' },
                { text: [{ text: this.datos[0].desc_zona_carpeta, style: 'textDato' }], fillColor: '#dddddd' }
              ],
              [
                { text: [{ text: 'MONTO DEL PROYECTO:\n', style: 'textTitulo' },] },
                { text: [{ text: 'Bs.' + this.datos[0].total_carpeta + '\n', style: 'textDato' }] }
              ],
              [
                { text: [{ text: 'FECHA VALIDACIÓN PROYECTO:\n', style: 'textTitulo' },], fillColor: '#dddddd' },
                { text: [{ text: this.fechaString(this.datos[0].fecha_validacion_carpeta) + '\n', style: 'textDato', alignment: 'middle' }], fillColor: '#dddddd' }
              ],
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
            widths: ['*', 400],
            body: [
              [
                { text: [{ text: 'Personal propuesto:', style: 'textDato' },] },
                { text: [{ text: '\n\n', style: 'textDato' }], }
              ], 
              [
                { text: [{ text: '\n\n', style: 'textTitulo' },] },
                { text: [{ text: this.datos[0].profesion_detalle + this.datos[0].nombre + ' ' +this.datos[0].primer_apellido + ' '+ this.datos[0].segundo_apellido, style: 'textDato' }] },
              ],
            ]
          },
          layout: 'noBorders'

        },
        {
          text: [
            '\n\n\n\n\n\n\n\n\n\n\n' ],
        },

        {
          text: '\n',
          style: 'textDato', alignment: 'center'
        },
        {
          text: 'JEFE DE UNIDAD\n' + this.datos[0].nombre_da,
          style: 'textDato', alignment: 'center', bold: true
        },
        {
          text: '\n\n\n\n\n\n\n\n\n\n\n\n\ncc:Arch:',
          style: 'footerText'
        } as any,

        ],

        footer: function (currentPage: { toString: () => string; }, pageCount: string) { //return currentPage.toString() + ' of ' + pageCount; 
          return {
            columns: [
              { text: currentPage.toString() + ' de ' + pageCount, alignment: 'right', style: 'footerText', margin: [0, 0, 30, 0] }
            ]
          }
        } as any,

        styles: {
          header: {
            fontSize: 16,
            bold: true,
          },
          subheader: {
            fontSize: 12,
            bold: true,
          },
          coloredText: {
            fontSize: 10,
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
        },
        pageMargins: [60, 30, 40, 30] as any, // Márgenes: izquierda, arriba, derecha, abajo

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

    } catch (error) {
      console.error('Error al generar el PDF:', error);
      throw new Error('Error al generar el PDF: ' + error);
    }
  }



  //GENERAR MEMORANDUM SOLICITUD
  async generateMemo(id: number): Promise<Buffer> {
    const res = await this.datosGeneralesReporte(id);
    if (!res || (Array.isArray(res) && res.length === 0) || (typeof res === 'object' && Object.keys(res).length === 0)) {
      throw new Error('No se encontraron datos para el ID proporcionado');
    }

    this.datos = res;

    const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
    const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
    const imgPath = 'assets/images/membretado_carta.png';

    const documentDefinition = {
      pageSize: 'LETTER' as any,
      background: function (currentPage: any, pageSize: any) {
        return {
          image: imgPath,
          width: pageSize.width,
          height: pageSize.height,
          absolutePosition: { x: 0, y: 0 }
        }
      },
      //watermark: { text: 'SGEO', color: 'blue', opacity: 0.1, bold: true, italics: false },

      header: {
        columns: [
          //{ image: `data:image/png;base64,${this.getImageBase64(headerImage)}`, width: 100 },
          //ME { image: imgPath, width: 180 },  // Uso de la ruta de imagen directamente          

          //{ text: 'Título en Rojo', style: 'coloredText', alignment: 'left' }
          // ME { text: 'Secretaría Municipal de Infraestructura Pública', style: 'coloredText', alignment: 'left' },
          // { text: '\nInfraestructura Pública', style: 'coloredTextgray', alignment: 'left' }          
        ],

      } as any,
      content: [

        {
          text: '\n\n\n\nM E M O R Á N D U M',
          style: 'header', alignment: 'center'
        } as any,
        {
          text: this.datos[0].cod_carpeta + '-' + this.datos[0].cite_memo + '-' + this.datos[0].correlativo + '\n\n',
          style: 'subheader', alignment: 'center'
        },
        {
          table: {
            widths: ['*', '*'],
            body: [
              [
                {
                  border: [false, false, true, true],
                  text: 'GOBIERNO AUTÓNOMO MUNICIPAL DE LA PAZ\n La Paz, ' + this.fechaString(this.datos[0].fecha_modificacion),
                  style: 'textTitulo', alignment: 'center'

                },
                {
                  border: [true, false, false, true],
                  text: 'Señor(a):\n' + this.datos[0].profesion_detalle + ' ' + this.datos[0].nombre + ' ' + this.datos[0].primer_apellido + ' ' + this.datos[0].segundo_apellido + '\nPresente.- ',
                  style: 'textTitulo', alignment: 'left'
                },
              ],
            ]
          },

        },
        {
          text: '\nREF.: DESIGNACIÓN DE ' + this.datos[0].permisos + ' DE OBRA \n\n',
          style: 'textTitulo', alignment: 'center'
        },

        //TEXTO

        {
          table: {
            widths: ['*', 350],
            body: [
              [
                { text: [{ text: 'OBRA:', style: 'textTitulo', alignment: 'right' },], fillColor: '#dddddd' },
                { text: [{ text: this.datos[0].desc_carpeta, style: 'textDato', alignment: 'left' }], fillColor: '#dddddd' }
              ],

              [
                { text: [{ text: 'CÓDIGO:\n', style: 'textTitulo', alignment: 'right' },] },
                { text: [{ text: this.datos[0].cod_carpeta + '\n', style: 'textDato' }] }
              ],
              [
                { text: [{ text: 'ZONA:\n', style: 'textTitulo', alignment: 'right' },], fillColor: '#dddddd' },
                { text: [{ text: this.datos[0].desc_zona_carpeta + '', style: 'textDato' }], fillColor: '#dddddd' }
              ],
              [
                { text: [{ text: 'MONTO DE PROYECTO:\n', style: 'textTitulo', alignment: 'right' },] },
                { text: [{ text: 'Bs.' + this.datos[0].total_carpeta + '', style: 'textDato' }] }
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
                { text: [{ text: '', style: 'textTitulo' },] },
                { text: [{ text: '', style: 'textDato' }], }
              ], [
                { text: [{ text: '\n', style: 'textTitulo' },] },
                { text: [{ text: '\n', style: 'textDato' }], }
              ],
            ]
          },
          layout: 'lightHorizontalLines'
        },

        {
          text: 'Señor(a):\n\nEn atención a la solicitud de la Unidad Ejecutora, se comunica a usted que la ' + 
          (
            this.datos[0].cod_da_ap >= 37 && this.datos[0].cod_da_ap <= 45
              ? this.datos[0].nombre_da_ap
              : this.datos[0].nombre_ue_ap
          ) + 
          ' ha dispuesto designarle ' + this.datos[0].permisos + ' de la obra ' + this.datos[0].desc_carpeta + 
          '.\n\nPara el efecto, a partir de la fecha deberá cumplir con las funciones y responsabilidades definidas en el Reglamento de Supervisión y Fiscalización de Obras del GAMLP, Código de Ética y Reglamento Interno de Personal del GAMLP.\n\n Seguro de que su capacidad y alto espíritu de trabajo sean puestos a favor de nuestro Municipio, aprovecho la oportunidad para desearle éxitos en el desempeño de sus funciones.',
          style: 'textDato', alignment: 'justify'
        },

        {
          text: '\n\n\n\n\n\n\n\n' + this.datos[0].aprobador,
          style: 'textDato', alignment: 'center'
        },
        {
          text: this.datos[0].cod_da_ap >= 37 && this.datos[0].cod_da_ap <= 45
          ? this.datos[0].nombre_da_ap
          : this.datos[0].nombre_ue_ap,
          style: 'textTitulo', alignment: 'center'
        },

        {
          text: '\n\n\n\n\n\n\ncc:Arch:',
          style: 'footerText'
        },

      ],

      footer: function (currentPage: { toString: () => string; }, pageCount: string) { //return currentPage.toString() + ' of ' + pageCount; 
        return {
          columns: [
            { text: currentPage.toString() + ' de ' + pageCount, alignment: 'right', style: 'footerText', margin: [0, 0, 30, 0] }
          ]
        }
      } as any,

      styles: {
        header: {
          fontSize: 25,
          bold: true,
        },
        subheader: {
          fontSize: 12,
          bold: true,
        },
        coloredText: {
          fontSize: 10,
          bold: true,
          //color: 'gray', // Cambiar el color del texto a 'blue'
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
          fontSize: 9,
          bold: false,
          //color: 'gray', 
          opacity: 0.8,
        },
      },
      pageMargins: [60, 30, 40, 30] as any, // Márgenes: izquierda, arriba, derecha, abajo

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



  //SOLICITUD DE REEMPLAZO
  async generateSolReemplazo(id: number): Promise<Buffer> {
    const res = await this.datosGeneralesReporte(id);
    if (!res || (Array.isArray(res) && res.length === 0) || (typeof res === 'object' && Object.keys(res).length === 0)) {
      throw new Error('No se encontraron datos para la gestión y el ID proporcionados.');
    }
    this.datos = res;

    //const imgUrl = 'http://localhost:3009/images/logo.png';  // Cambia la URL según tu configuración
    //ME const imgPath = 'assets/images/logo_gamlp.png';
    const imgPath = 'assets/images/membretado_carta.png';

    const documentDefinition = {
      pageSize: 'LETTER' as any,
      background: function (currentPage: any, pageSize: any) {
        return {
          image: imgPath,
          width: pageSize.width,
          height: pageSize.height,
          absolutePosition: { x: 0, y: 0 }
        }
      },
      //ME watermark: { text: 'SGEO', color: 'blue', opacity: 0.1, bold: true, italics: false },

      header: {
        columns: [
          //ME { image: imgPath, width: 180, alignment: 'left' },  // Uso de la ruta de imagen directamente          
          //   { image: `data:image/png;base64,${this.getImageBase64(headerImage)}`, width: 100 },
          //{ text: 'Título en Rojo', style: 'coloredText', alignment: 'left' }
          //ME { text: 'Secretaría Municipal de Infraestructura Pública', style: 'coloredText', alignment: 'left' },
          // { text: '\nInfraestructura Pública', style: 'coloredTextgray', alignment: 'left' }
        ],

      } as any,
      content: [

        {
          text: '\n\n\n\n\n\n\FORMULARIO SOLICITUD DE REEMPLAZO ' + this.datos[0].permisos + '\n',
          style: 'header', alignment: 'center'
        } as any,
        {
          text: this.datos[0].cod_carpeta + '-' + this.datos[0].cite_solicitud + '-' + this.datos[0].correlativo_solicitud + '\n\n\n',
          style: 'subheader', alignment: 'center'
        },
        {
          text: 'DATOS DE PROYECTO\n',
          style: 'textTitulo',
        },
        {
          table: {
            widths: ['*', 350],
            body: [
              [
                { text: [{ text: 'CÓDIGO:', style: 'textTitulo' },], fillColor: '#dddddd', border: [false, true, false, false] },
                { text: [{ text: this.datos[0].cod_carpeta, style: 'textDato' }], fillColor: '#dddddd', border: [false, true, false, false] }
              ],

              [
                { text: [{ text: 'OBRA:', style: 'textTitulo' },] },
                { text: [{ text: this.datos[0].desc_carpeta, style: 'textDato' }] }
              ],
              [
                { text: [{ text: 'ZONA:', style: 'textTitulo' },], fillColor: '#dddddd' },
                { text: [{ text: this.datos[0].desc_zona_carpeta, style: 'textDato' }], fillColor: '#dddddd' }
              ],
              [
                { text: [{ text: 'MONTO DEL PROYECTO:\n', style: 'textTitulo' },] },
                { text: [{ text: 'Bs.' + this.datos[0].total_carpeta + '\n', style: 'textDato' }] }
              ],
              [
                { text: [{ text: 'FECHA VALIDACIÓN PROYECTO:\n', style: 'textTitulo' },], fillColor: '#dddddd' },
                { text: [{ text: this.fechaString(this.datos[0].fecha_validacion_carpeta) + '\n', style: 'textDato' }], fillColor: '#dddddd' }
              ],
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
          text: 'Solicito la designación del (la) ' + this.datos[0].profesion_detalle + this.datos[0].nombre + ' ' +this.datos[0].primer_apellido + ' ' + this.datos[0].segundo_apellido +' como ' + this.datos[0].permisos + ', en reemplazo del (la) ' + this.datos[0].persona_a_reemplazar + '.',
          style: 'textDato', alignment: 'justify'
        },
        {
          text: [
            '\n\n\n\n\n\n\n\n\n\n\n\n\n\n'],
        },

        {
          text: '\n',
          style: 'textDato', alignment: 'center'
        },
        {
          text: 'JEFE DE UNIDAD\n' + this.datos[0].nombre_da,
          style: 'textDato', alignment: 'center', bold: true
        },
        {
          text: '\n\n\n\n\n\n\n\n\n\n\n\n\ncc:Arch:',
          style: 'footerText'
        },

      ],

      footer: function (currentPage: { toString: () => string; }, pageCount: string) { //return currentPage.toString() + ' of ' + pageCount; 
        return {
          columns: [
            { text: currentPage.toString() + ' de ' + pageCount, alignment: 'right', style: 'footerText', margin: [0, 0, 30, 0] }
          ]
        }
      } as any,

      styles: {
        header: {
          fontSize: 16,
          bold: true,
        },
        subheader: {
          fontSize: 12,
          bold: true,
        },
        coloredText: {
          fontSize: 10,
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
      },
      pageMargins: [60, 30, 40, 30] as any, // Márgenes: izquierda, arriba, derecha, abajo

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




  //GENERAR MEMORANDUM DE REEMPLAZO
  async generateMemoReemplazo(id: number): Promise<Buffer> {
    const res = await this.datosGeneralesReporte(id);

    if (!res || (Array.isArray(res) && res.length === 0) || (typeof res === 'object' && Object.keys(res).length === 0)) {
      throw new Error('No se encontraron datos para el ID proporcionado');
    }
    this.datos = res;

    const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
    const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
    const imgPath = 'assets/images/membretado_carta.png';

    const documentDefinition = {
      pageSize: 'LETTER' as any,
      background: function (currentPage: any, pageSize: any) {
        return {
          image: imgPath,
          width: pageSize.width,
          height: pageSize.height,
          absolutePosition: { x: 0, y: 0 }
        }
      },
      //ME watermark: { text: 'SGEO', color: 'blue', opacity: 0.1, bold: true, italics: false },

      header: {
        columns: [
          //ME{ image: `data:image/png;base64,${this.getImageBase64(headerImage)}`, width: 100 },
          //ME { image: imgPath, width: 180 },
          //{ text: 'Título en Rojo', style: 'coloredText', alignment: 'left' }
          // ME { text: 'Secretaría Municipal de Infraestructura Pública', style: 'coloredText', alignment: 'left' },
          // { text: '\nInfraestructura Pública', style: 'coloredTextgray', alignment: 'left' }          
        ],

      } as any,
      content: [

        {
          text: '\n\n\n\nM E M O R Á N D U M',
          style: 'header', alignment: 'center'
        } as any,
        {
          text: this.datos[0].cod_carpeta + '-' + this.datos[0].cite_memo + '-' + this.datos[0].correlativo + '\n\n',
          style: 'subheader', alignment: 'center'
        },
        {
          table: {
            widths: ['*', '*'],
            body: [
              [
                {
                  border: [false, false, true, true],
                  text: 'GOBIERNO AUTÓNOMO MUNICIPAL DE LA PAZ\n La Paz, ' + this.fechaString(this.datos[0].fecha_modificacion),
                  style: 'textTitulo', alignment: 'center'

                },
                {
                  border: [true, false, false, true],
                  text: 'Señor(a):\n' + this.datos[0].profesion_detalle + ' ' + this.datos[0].nombre + ' ' + this.datos[0].primer_apellido + ' ' + this.datos[0].segundo_apellido + '\nPresente.- ',
                  style: 'textTitulo', alignment: 'left'
                },
              ],
            ]
          },

        },
        {
          text: '\nREF.: DESIGNACIÓN DE ' + this.datos[0].permisos + ' DE OBRA \n\n',
          style: 'textTitulo', alignment: 'center'
        },

        //TEXTO

        {
          table: {
            widths: ['*', 350],
            body: [
              [
                { text: [{ text: 'OBRA:', style: 'textTitulo', alignment: 'right' },], fillColor: '#dddddd' },
                { text: [{ text: this.datos[0].desc_carpeta, style: 'textDato', alignment: 'left' }], fillColor: '#dddddd' }
              ],

              [
                { text: [{ text: 'CÓDIGO:\n', style: 'textTitulo', alignment: 'right' },] },
                { text: [{ text: this.datos[0].cod_carpeta + '\n', style: 'textDato' }] }
              ],
              [
                { text: [{ text: 'ZONA:\n', style: 'textTitulo', alignment: 'right' },], fillColor: '#dddddd' },
                { text: [{ text: this.datos[0].desc_zona_carpeta + '', style: 'textDato' }], fillColor: '#dddddd' }
              ],
              [
                { text: [{ text: 'MONTO DE PROYECTO:\n', style: 'textTitulo', alignment: 'right' },] },
                { text: [{ text: 'Bs.' + this.datos[0].total_carpeta + '', style: 'textDato' }] }
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
                { text: [{ text: '', style: 'textTitulo' },] },
                { text: [{ text: '', style: 'textDato' }], }
              ], [
                { text: [{ text: '\n', style: 'textTitulo' },] },
                { text: [{ text: '\n', style: 'textDato' }], }
              ],
            ]
          },
          layout: 'lightHorizontalLines'
        },

        {
          text: 'Señor(a):\n\nMediante la presente se comunica a usted que la ' + 
          (
            this.datos[0].cod_da_ap >= 37 && this.datos[0].cod_da_ap <= 45
              ? this.datos[0].nombre_da_ap
              : this.datos[0].nombre_ue_ap
          ) + 
          ' ha dispuesto designarle a partir de la fecha ' + this.datos[0].permisos + ' de la obra ' + this.datos[0].desc_carpeta + ', en reemplazo de (él/la) profesional ' + this.datos[0].persona_a_reemplazar + ', medida asumida con el fin de dar continuidad a los trabajos de la obra.\n\nPara el efecto, a partir de la fecha deberá cumplir con las funciones y responsabilidades definidas en el Reglamento de Supervisión y Fiscalización de Obras del GAMLP, Código de Ética y Reglamento Interno de Personal del GAMLP.\n\n Seguro de que su capacidad y alto espíritu de trabajo sean puestos a favor de nuestro Municipio, aprovecho la oportunidad para desearle éxitos en el desempeño de sus funciones.',
          style: 'textDato', alignment: 'justify'
        },

        {
          text: '\n\n\n\n\n\n\n\n' + this.datos[0].aprobador,
          style: 'textDato', alignment: 'center'
        },
        {
          text: this.datos[0].cod_da_ap >= 37 && this.datos[0].cod_da_ap <= 45
          ? this.datos[0].nombre_da_ap
          : this.datos[0].nombre_ue_ap,
          style: 'textTitulo', alignment: 'center'
        },

        {
          text: '\n\n\n\n\n\ncc:Arch:',
          style: 'footerText'
        },

      ],

      footer: function (currentPage: { toString: () => string; }, pageCount: string) { //return currentPage.toString() + ' of ' + pageCount; 
        return {
          columns: [
            { text: currentPage.toString() + ' de ' + pageCount, alignment: 'right', style: 'footerText', margin: [0, 0, 30, 0] }
          ]
        }
      } as any,

      styles: {
        header: {
          fontSize: 25,
          bold: true,
        },
        subheader: {
          fontSize: 12,
          bold: true,
        },
        coloredText: {
          fontSize: 10,
          bold: true,
          //color: 'gray', // Cambiar el color del texto a 'blue'
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
          fontSize: 9,
          bold: false,
          //color: 'gray', 
          opacity: 0.8,
        },
      },
      pageMargins: [60, 30, 40, 30] as any, // Márgenes: izquierda, arriba, derecha, abajo

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



  //SOLICITUD DE BAJA

  async generateSolicitudBaja(id: number): Promise<Buffer> {

    const res = await this.datosGeneralesReporte(id);
    if (!res || (Array.isArray(res) && res.length === 0) || (typeof res === 'object' && Object.keys(res).length === 0)) {
      throw new Error('No se encontraron datos para el ID proporcionado');
    }

    this.datos = res;
    const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
    const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
    const imgPath = 'assets/images/membretado_carta.png';

    const documentDefinition = {
      pageSize: 'LETTER' as any,
      background: function (currentPage: any, pageSize: any) {
        return {
          image: imgPath,
          width: pageSize.width,
          height: pageSize.height,
          absolutePosition: { x: 0, y: 0 }
        }
      },

      header: {
        columns: [
          // Columna del texto centrado

        ],

      } as any,

      content: [
        {
          stack: [
            {
              text: '\n\n\n\n\n\nFORMULARIO SOLICITUD DE BAJA ' + this.datos[0].permisos + '\n',
              style: 'header', alignment: 'center'
            },
          ] as any,

        } as any,
        {
          text: this.datos[0].cod_carpeta + '-' + this.datos[0].permisodetalle + '\n\n\n',
          style: 'subheader', alignment: 'center'
        },
        {
          text: 'DATOS DE PROYECTO\n',
          style: 'textTitulo',
        },

        {
          table: {
            widths: ['*', 350],
            body: [
              [
                { text: [{ text: 'CÓDIGO:', style: 'textTitulo' },], fillColor: '#dddddd', border: [false, true, false, false] },
                { text: [{ text: this.datos[0].cod_carpeta, style: 'textDato' }], fillColor: '#dddddd', border: [false, true, false, false] }
              ],

              [
                { text: [{ text: 'OBRA:\n', style: 'textTitulo' },] },
                { text: [{ text: this.datos[0].desc_carpeta + '\n', style: 'textDato' }] }
              ],

              [
                { text: [{ text: 'ZONA:\n', style: 'textTitulo' },], fillColor: '#dddddd' },
                { text: [{ text: this.datos[0].desc_zona_carpeta + '\n', style: 'textDato' }], fillColor: '#dddddd' }
              ],
              [
                { text: [{ text: 'MONTO DEL PROYECTO:\n', style: 'textTitulo' },] },
                { text: [{ text: 'Bs.' + this.datos[0].total_carpeta + '\n', style: 'textDato' }] }
              ],
              [
                { text: [{ text: 'FECHA VALIDACIÓN PROYECTO:\n', style: 'textTitulo' },], fillColor: '#dddddd' },
                { text: [{ text: this.fechaString(this.datos[0].fecha_validacion_carpeta) + '\n', style: 'textDato', alignment: 'middle' }], fillColor: '#dddddd' }
              ],
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
          text: 'Señor(a):\n',
          style: 'textDato',
        },
        {
          text: [this.datos[0].aprobador + '\n\n'],
          style: 'textDato'
        },
        {
          text: 'Mediante la presente se solicita el baja en la obra señalada del siguiente profesional:\n\n',
          style: 'textDato',
        },

        {
          table: {
            widths: ['*', '*', '*'], // Distribuir columnas uniformemente
            body: [
              // Encabezados de la tabla
              [
                { text: 'PROFESIÓN', style: 'textTitulo', fillColor: '#d9eaf7' },
                { text: 'NOMBRES', style: 'textTitulo', fillColor: '#d9eaf7' },
                { text: 'ROL DE USUARIO', style: 'textTitulo', fillColor: '#d9eaf7' },
              ],
              // Fila de datos
              [
                { text: 'INGENIERO(A)/ARQUITECTO(A)', style: 'textDato' },
                { text: 'JOSUE MIGUEL', style: 'textDato' },
                { text: 'FISCAL/SUPERVISOR', style: 'textDato' },
              ],
            ],
          },
          layout: {
            fillColor: (rowIndex: number, node: any, columnIndex: number): string | null => {
              return rowIndex === 0 ? '#d9eaf7' : null; // Colorear el encabezado
            },
            /* ME hLineWidth: (i: number, node: any): number => {
              return i === 0 || i === node.table.body.length ? 2 : 1; // Línea superior e inferior gruesas
            }, */
            vLineWidth: (i: number, node: any): number => {
              return 1; // Líneas verticales delgadas
            },
            hLineColor: (i: number, node: any): string => {
              return '#000000'; // Líneas horizontales negras
            },
            vLineColor: (i: number, node: any): string => {
              return '#000000'; // Líneas verticales negras
            },
          },
        },
        {
          text: '\n\JUSTIFICACION\n',
          style: 'textTitulo',
        },
        {
          text: this.datos[0].justificacion_baja,
          style: 'textDato', alignment: 'justify'
        },
        {
          text: [
            { text: '\n\nFecha de solicitud: ', style: 'textTitulo' },
            { text: this.fechaString(this.datos[0].fecha_baja), style: 'textDato' },
            { text: '\nFecha de baja efectiva: ', style: 'textTitulo' },
            { text: this.fechaString(this.datos[0].fecha_efectiva), style: 'textDato' }
          ]
        },
        {
          text: [
            '\n\n\n\n\n\n'],
        },

        {
          text: '\n',
          style: 'textDato', alignment: 'center'
        },
        {
          text: 'JEFE DE UNIDAD\n' + this.datos[0].nombre_da,
          style: 'textDato', alignment: 'center', bold:true
        },


        {
          text: [
            '\n\n\n\n\n\n\n\ncc:Arch:',
          ],
          style: 'footerText'
        },

      ],

      footer: function (currentPage: { toString: () => string; }, pageCount: string) { //return currentPage.toString() + ' of ' + pageCount; 
        return {
          columns: [
            { text: currentPage.toString() + ' de ' + pageCount, alignment: 'right', style: 'footerText', margin: [0, 0, 30, 0] }
          ]
        }
      } as any,

      styles: {
        header: {
          fontSize: 16,
          bold: true,
        },
        subheader: {
          fontSize: 12,
          bold: true,
        },
        coloredText: {
          fontSize: 10,
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
      },
      pageMargins: [60, 30, 40, 30] as any, // Márgenes: izquierda, arriba, derecha, abajo

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


  async datosReporteInformeInicial(usuario:number, obra: number) {
    const query1 = `SELECT * FROM public.vista_reporte_informe_inicial  WHERE idusuario = ${usuario}  AND id_obra = ${obra};	`;
    const values = [usuario, obra]
    const resultado = await this.sequelize.query(query1);
    return resultado[0];
  }

  async datosReporteInformeInicialSupervisores(obra: number, permiso:number) {
    const query1 = `SELECT * FROM public.vista_fiscal_supervisor_designacion WHERE id_obra = ${obra} AND id_permiso = 84;	`;
    const values = [ obra, permiso]
    const resultado = await this.sequelize.query(query1);
    return resultado[0];
  }





  //CONSULTASSS
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

  async preguntasInformeConclusion(obra: number, tipo_informe: number, subtipo: number) {
    const query1 = `
    SELECT * FROM public."vista_reporte_informe_inicial_conclusion"  
    WHERE id_obra = ${obra}`;
    const values = [obra, tipo_informe]
    const resultado = await this.sequelize.query(query1);
    return resultado[0];
    console.log('preguntasInforme', resultado[0]);

  }

//PAOLA
//10042025
  //INFORME INICIAL SUPERVISOR 
  async generateInformeInicial(usuario: number, obra: number): Promise<Buffer> {
    //  async generateInformeInicial(usuario:number): Promise<Buffer> {

    const res = await this.datosReporteInformeInicial(usuario, obra);
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

    const res4 = await this.preguntasInformeConclusion(obra, 235, 174);
    if (!res4 || (Array.isArray(res4) && res4.length === 0) || (typeof res4 === 'object' && Object.keys(res4).length === 0)) {
      throw new Error('No se encontraron datos para la obra y el ID proporcionados.');
    }   
    
    const res5 = await this.datosReporteInformeInicialSupervisores(obra, 84);
    if (!res5 || (Array.isArray(res5) && res5.length === 0) || (typeof res5 === 'object' && Object.keys(res5).length === 0)) {
      throw new Error('No se encontraron datos para la obra y el ID proporcionados.');
    }
  
    this.datosPreguntaInforme = res2;    
    this.datosPreguntaInformeRestante = res3;
    this.datosPreguntaInformeConclusion = res4;    
    this.datosEnvio = res;
    this.datosListaSupervisores = res5;   
    console.log("datosListaSupervisores", this.datosListaSupervisores);


    const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
    const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
  //  const imgPath = 'assets/images/logo_gamlp.png';
    const imgPathLeft = 'assets/images/logo_smip.png';
    const imgPath = 'assets/images/membretado_carta.png';

    const documentDefinition = {
      pageSize: 'LEGAL' as any,

      background: function(currentPage: any, pageSize: any) { 
        return {
          image: imgPath,
          width: pageSize.width,
          height: pageSize.height,
          absolutePosition: { x: 0, y: 0 },
          opacity: 0.9
        }
      },


      header: {
        table: {
          widths: ['70%', '30%'], // Proporciones de columnas
          body: [
            // Primera fila: Imagen a la derecha
            [
            /*  { text: '', border: [false, false, false, false] }, // Celda vacía para ajuste
              {
                image: imgPath,
                width: 70, // Ajusta el tamaño de la imagen (estático)
                height: 70, // También define la altura para evitar desbordes
                alignment: 'right',
                margin: [0, 0, 0, 0], // Márgenes internos de la celda
              }*/
            ],
            // Segunda fila: Línea + Título
           
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
          text: 'INFORME.\n ' + this.datosEnvio[0].cite + '\n\n',
          style: 'headerTitle', alignment: 'center'
        } as any,

        {
          table: {
            widths: [100, '*'],
            body: [
              [
                { text: [{ text: 'A:', style: 'textTitulo', alignment: 'left' },] },
                { text: [{ text: this.datosEnvio[0].a, style: 'textDato'}, { text: '\nJEFE UNIDAD EJECUTORA\n\n', style: 'textTitulo' }] }
              ],

              [
                { text: [{ text: 'DE:\n', style: 'textTitulo', alignment: 'left' },] },
                { text: [{ text: this.datosEnvio[0].de + '\n', style: 'textDato' }, { text: 'SUPERVISOR DE OBRA\n\n', style: 'textTitulo' },] }
              ],

              [
                { text: [{ text: 'REF:\n', style: 'textTitulo', alignment: 'left' },] },
                { text: [{ text: 'INFORME INICIAL DE REVISIÓN DEL PROYECTO\n\n', style: 'textTitulo' }] }
              ],

              [
                { text: [{ text: 'FECHA:\n', style: 'textTitulo', alignment: 'left' },] },
                { text: [{ text: this.fechaString( this.datosEnvio[0].fecha_informe) + '\n', style: 'textDato' }] }
              ],
            ]
          },
          layout: 'noBorders',
        },
        {
          text: [
            '\n\n\nHabiendo sido designado (s) como Supervisor (es) de la obra ' + '"'+ this.datosEnvio[0].desc_carpeta + '"'
           +' mediante Memorándum(s) '+ this.datosEnvio[0].cite_designacion  +', de fecha '+  this.datosEnvio[0].fecha_aprobacion  +' correspondientemente, y tras haber revisado el proyecto, se informa lo siguiente:',
          ],
       
          style: 'textDato', alignment: 'justify'           
        },
        {
          text: '\n\n1.  DATOS DE PROYECTO. \n\n',
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
          text: '\n\n2.  ANÁLISIS. \n ',
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
          text: [
            ' Resultado del análisis de los tres aspectos se tienen las siguientes observaciones Generales:\n\n'
          ],
          style: 'textDato', alignment: 'justify'
        },


        {
          text: [this.datosEnvio[0].obs_general
          ],
          style: 'textDato', alignment: 'justify'
        },

        {
          text: '\n4. CONCLUSIONES \n\n',
          style: 'subheader',
        },

        {
          table: {
            widths: [460],
            body: [
              [
                
                { text: [{ text: this.datosPreguntaInformeConclusion[0].desc_subtipo, style: 'textDato' }], fillColor: '#f0f0f0' }
              ],            
            ]
          },
          //layout: 'noBorders'
        },
        {
          text: ['\n' +this.datosEnvio[0].conclusion
          ],
          style: 'textDato', alignment: 'justify'
        },

        {
          text: '\n5. RECOMENDACIONES \n\n',
          style: 'subheader',
        },

        [
          {
            table: {
              widths: ['*', 50],
              body: [

                ...this.buildPreguntas(this.datosPreguntaInformeRestante)
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
              widths: ['*', 50],
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
          table: {
            widths: ['*'],
            body: [
              [
                {
                  //text: '\n\n\n' + this.datosEnvio[0].de + '\nSUPERVISOR DE OBRAS.\n\n\n',
                  text: '\n\n\n\n\n\n',
                  style: 'subheader',
                  alignment: 'center'
                }
              ],
              ...this.datosListaSupervisores.map((item: any) => [
                {
                  text: [{ text: item.nombre, style: 'textDato' }],
                  alignment: 'center'
                }
              ]),

              [
                {
                  text: '\nSUPERVISOR DE OBRAS.\n\n',
                 
                  style: 'subheader',
                  alignment: 'center'
                }
              ],
            ]
          },
          layout: 'noBorders',
          alignment: 'center'
        },
        
      



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
      //pageMargins: [70, 120, 60, 60] as any, // Márgenes: izquierda, arriba, derecha, abajo  
      pageMargins: [70, 180, 70, 180] as any, // Márgenes: izquierda, arriba, derecha, abajo            

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



  //FUNCIONES PARA CONSTRUIR 

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

// FECHA EN FORMATO dd/mm/aa
fechaFormato(iso: string): string {
  let fecha: Date;
  let isoProcesado = iso;
  
  if (iso === 'hoy') {
    fecha = new Date(); // Usar fecha y hora actual
  } else if (iso) {
    fecha = new Date(iso); 
  } else {
      return 'Sin fecha';
  }

 if (!(fecha instanceof Date) || isNaN(fecha.getTime())) {
    console.error("La cadena proporcionada no resultó en una fecha válida:", iso);
    return ''; 
  }

  // 3. Extraer día, mes y año
  const day = fecha.getDate() + 1; 
  const month = fecha.getMonth() + 1; // getMonth() devuelve 0-11, sumar 1
  const year = fecha.getFullYear();

  // 4. Formatear día y mes con ceros a la izquierda si es necesario (dd, mm)
  const formattedDay = String(day).padStart(2, '0');
  const formattedMonth = String(month).padStart(2, '0');

  // 5. Construir y devolver la cadena final en formato dd/mm/aaaa
  return `${formattedDay}/${formattedMonth}/${year}`;
}


  //form-documentos 1
  buildDocumentosSIM(data: any) {
    let datosResp = data;
    let arrayData = [];

    var c = 0;
    for (let i = 0; i < datosResp.length; i++) {
      c = c + 1;
      let rowData = [
        { text: [{ text: c, style: 'textDato', alignment: 'center', }] },
        { text: [{ text: datosResp[i].desc_tipo_documento, style: 'textDato' }] },
        { text: [{ text: datosResp[i].cumple ? 'SI' : 'SI', style: 'textDato', alignment: 'center', }] },
        { text: [{ text: datosResp[i].observacion, style: 'textDato' }] },
      ];
      arrayData.push(rowData);

    }
    return arrayData;
  }


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
                {
                  text:
                    [{ text: padre + ': \n', style: 'textTitulo', alignment: 'center', margin: [0, 5, 0, 5] },
                    { text: desc_padre + ':\n', style: 'textDato', margin: [0, 5, 0, 5] }], fillColor: '#f0f0f0',
                },
              ],
              // Segunda fila: Tabla de preguntas agrupadas por `padre`
              [
                {
                  table: {
                    widths: [400, 50],
                    body: [
                      [
                        { text: 'Pregunta:', style: 'textDato', fillColor: '#dddddd' },
                        { text: 'Opción:', style: 'textDato', alignment: 'center', fillColor: '#dddddd' },
                      ],
                      // Preguntas agrupadas
                      ...preguntas.map((pregunta: any) => [
                        { text: pregunta.desc_subtipo, style: 'textDato' },
                        { text: pregunta.opcion, style: 'textDato', alignment: 'center' },
                      ]),
                    ],
                  },
                 // layout: 'noBorders',
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
