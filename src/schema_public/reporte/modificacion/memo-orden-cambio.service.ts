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
export class MemoOrdenCambio {

    datosEnvio: any = [];
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
  // Datos generales obra - contrato - OP
  async datosGeneralesReporteOP(obra: number) {
    const query1 = `
        SELECT * 
        FROM public.vista_datos_op WHERE id_obra = ${obra}`;
    const resultado = await this.sequelize.query(query1);
    return resultado[0];
  }

     // FISCALES designados por obra 
   async fiscalDesignado(obra: number) {
    const query1 = `
        SELECT * 
        FROM public.vista_fiscales_obra WHERE id_obra = ${obra}`;
    const resultado = await this.sequelize.query(query1);
    return resultado[0];
   }

      //funcion para generar la fecha de manera escrita
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

// REPORTE - MEMORANDUM ORDEN DE CAMBIO
  async generateOrdenCambio(obra: number): Promise<Buffer> {

    const res = await this.datosGeneralesReporteOP(obra);
    if (!res || (Array.isArray(res) && res.length === 0) || (typeof res === 'object' && Object.keys(res).length === 0)) {
      throw new Error('No se encontraron datos para la obra proporcionada');
    }
    this.datosEnvio = res;

    const resSup = await this.fiscalDesignado(obra);
    if (!resSup || (Array.isArray(resSup) && resSup.length === 0) || (typeof resSup === 'object' && Object.keys(resSup).length === 0)) {
      throw new Error('No se encontraron datos del fiscal designado');
    }
    this.datosFis = resSup;
   
    //console.log("DATOS, ", res);

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
          
          // { image: `data:image/png;base64,${this.getImageBase64(headerImage)}`, width: 100 },
          //{ text: 'Título en Rojo', style: 'coloredText', alignment: 'left' }
          //{ text: 'Secretaría Municipal de Infraestructura Pública', style: 'coloredText', alignment: 'left' },
          // { text: '\nInfraestructura Pública', style: 'coloredTextgray', alignment: 'left' }          
        ],

      } as any,
      content: [
        {
          text: '\n\n\n\nMEMORANDUM',
          style: 'header', alignment: 'center',
        } as any,
       {
          text: this.datosEnvio[0].cod_carpeta + '-' + this.datosEnvio[0].cite_memo + '-' + '1',
          style: 'subheader', alignment: 'center'
        },
        {
          text: '\n'
        } as any,
        {
          table: {
            widths: ['*', '*'],
            body: [
              [
                {
                  border: [false, false, true, false],
                  text: '', alignment: 'center', fontSize: 10
                },
                {
                  border: [true, false, false, false],
                  text: 'Señor(es):', fontSize: 10
                }
              ],
              [
                {
                  border: [false, false, true, false],
                  text: 'GOBIERNO AUTÓNOMO MUNICIPAL DE LA PAZ', 
                  style: 'textTitulo', alignment: 'center'
                },
                {
                  border: [true, false, false, false],
                  text: this.datosEnvio[0].proponente_razon_social, 
                  style: 'textTitulo'
                }
              ],
              [
                {
                  border: [false, false, true, true],
                  text: 'La Paz, ' + this.fechaString(this.datosEnvio[0].fecha_memo), 
                  style: 'textDato', alignment: 'center'
                },
                {
                  border: [true, false, false, true],
                  text: 'Presente.-', 
                  style: 'textDato'
                }
              ]
            ]
          },
          layout: {
            defaultBorder: false
          }
        } as any,
      // Referencia
        {
          text: '\n'
        } as any,
        {
          text: 'REF.: ORDEN DE CAMBIO N°', 
          style: 'coloredText', alignment: 'center', decoration: 'underline' 
        },
        {
          text: '\n'
        } as any,
        // Tabla resumen de obra
        {
          table: {
            widths: ['*', 350],
            body: [
              [
                { text: [{ text: 'OBRA:\n', style: 'textTitulo', alignment: 'right' },], fillColor: '#dddddd' },
                { text: [{ text: this.datosEnvio[0].desc_carpeta, style: 'textDato', }], fillColor: '#dddddd' }
              ],
              [
                { text: [{ text: 'CÓDIGO:\n', style: 'textTitulo', alignment: 'right' },] },
                { text: [{ text: this.datosEnvio[0].cod_carpeta + '\n', style: 'textDato', alignment: 'left-justify' }] }
              ],
              [
                { text: [{ text: 'ZONA:\n', style: 'textTitulo', alignment: 'right' },], fillColor: '#dddddd' },
                { text: [{ text: this.datosEnvio[0].desc_zona_carpeta + '', style: 'textDato', alignment: 'left-justify' }], fillColor: '#dddddd' }
              ],
              [
                { text: [{ text: 'UNIDAD EJECUTORA:\n', style: 'textTitulo', alignment: 'right' },] },
                { text: [{ text: this.datosEnvio[0].nombre_ue + '', style: 'textDato', alignment: 'left-justify' }] }
              ],
              [
                { text: [{ text: 'CONTRATO N°:\n', style: 'textTitulo', alignment: 'right' },] },
                { text: [{ text: this.datosEnvio[0].nombre_ue + '', style: 'textDato', alignment: 'left-justify' }] }
              ]

            ]
          },
          layout: 'noBorders'
        } as any,
        // Cuerpo de la carta
        {
          text: '\n'
        },
        {
          text: [
            { text: 'Señor(es): \n', style: 'textDato' },
            {
              text: 'De acuerdo al informe Orden de Cambio ' + this.datosEnvio[0].cod_carpeta + ' , de fecha ' + this.fechaString(this.datosEnvio[0].fecha_inicio_ejecucion) + 
              ' emitido por la supervisión de obra, aprobado mediante informe Orden de Cambio ' + this.datosEnvio[0].cod_carpeta + 'de fecha ' + 
              this.fechaString(this.datosEnvio[0].fecha_inicio_ejecucion) + ' por la fiscalización de obra, se aprueba la presente ORDEN DE CAMBIO N° XX' + 
              ' por ' + ' INSERTAR REFERENCIA' + ', VARIABLE DE SI EL TIEMPO VARIA en ' + this.datosEnvio[0].plazo_ejecucion + '.\n\n',
              style: 'textDato',  alignment: 'justify'
            },
            {
              text: 'Asimismo, ' + 'DECREMENTA EL MONTO DE LA MODIFICACIÓN Nro XX de Bs. XXXXXX' + ', en ' + '-27.45 ' + ' (VEINTISIETE 45/100 BOLIVIANOS)' + 
              '.\n\n',
              style: 'textDato', alignment: 'justify', lineHeight: 1
            },
            {
              text: 'Por lo que el monto autorizado será de Bs.' + '97.645,83 ' + ' (NOVENTA Y SIENTE MIL SEICIENTOS CUARENTA Y CINCO 83/100 BOLIVIANOS)' + 
              'totalizando un valor porcentual de modificaciones a la fecha respecto al contrato inicial, de ' + 'XXXX%',
              style: 'textDato', alignment: 'justify', lineHeight: 1
            },
            {
              text: '\n\nAtentamente,\n\n\n', 
              style: 'textDato', alignment: 'left'
            },
          ],
        },
        {
          text: '\n\n\n\n'
        },
        {
          text:
          [
            { text: 
                  (Array.isArray(this.datosFis)
                    ? this.datosFis
                        .filter(f => f && f.fiscal)
                        .map(f => f.fiscal)
                        .join(' | ')
                    : ''
                  ) + '\n', style: 'textDato', alignment: 'center' },
            { text: 'FISCAL(ES) DE OBRA\n', style: 'textTitulo', alignment: 'center' }
          ]
        },
        {
          text: '\n\n\n'
        },
        //TABLA DE NOTIFICACION AL CONTRATISTA
        {
          // table: {
          //   widths: ['30%', '70%'],
          //   body: [
          //     [
          //       { text: 'Firma: ', alignment: 'right', bold: true, fontSize: 8 },
          //       { text: '____________________________________________________________', alignment: 'left', fontSize: 8 }
          //     ],
          //     [
          //       { text: 'Nombre y apellido: ', alignment: 'right', bold: true, fontSize: 8 },
          //       { text: '____________________________________________________________', alignment: 'left', fontSize: 8 }
          //     ],
          //     [
          //       { text: 'Lugar: ', alignment: 'right', bold: true, fontSize: 8 },
          //       { text: '______________________________', alignment: 'left', fontSize: 8 }
          //     ],
          //     [
          //       { text: 'Fecha: ', alignment: 'right', bold: true, fontSize: 8 },
          //       { text: '___/___/_____' , alignment: 'left', fontSize: 8 }
          //     ]
          //   ]
          // },
          // layout: {
          //   defaultBorder: false,
          // }
        } as any,
        { text: '\nC.c. DLC' + '\nC.c. Unidad Ejecutora.' + '\nC.c. Arch.', style: 'footerText', alignment: 'left' },
      
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
          //color: 'gray',
        },
        textTitulo: {
          fontSize: 9,
          bold: true,
        },
        textDato: {
          fontSize: 9,
          bold: false,
        },
        footerText: {
          fontSize: 6,
          bold: false,
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



}