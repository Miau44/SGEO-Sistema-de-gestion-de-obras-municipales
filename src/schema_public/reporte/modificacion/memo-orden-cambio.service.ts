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
    datosInf: any = [];
    datosSup: any = [];

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
  // Datos generales obra - contrato - modificación
  async datosGeneralesObraModif(id_modif_pago: number) {
    const query = `
        SELECT * 
        FROM public."vista_reporte_modificacion_gral" WHERE id_modificacion_pago = ${id_modif_pago}`;
    const resultado = await this.sequelize.query(query);
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

  // Datos informes de Supervisor y Fiscal
  async datosInformesSF(id_modif_pago: number) {
    const query2 = `
        SELECT * 
        FROM public."vista_reporte_memoOC" WHERE id_modificacion_pago = ${id_modif_pago}`;
    const resultado2 = await this.sequelize.query(query2);
    return resultado2[0];
  }

   // SUPERVISORES designados por obra 
   async supervisorDesignado(obra: number) {
    const query3 = `
        SELECT * 
        FROM public.vista_supervisores_obra WHERE id_obra = ${obra}`;
    const resultado3 = await this.sequelize.query(query3);
    return resultado3[0];
   }
  
// REPORTE - MEMORANDUM ORDEN DE CAMBIO
  async generateOrdenCambio(id_modif_pago: number): Promise<Buffer> {

    const res = await this.datosGeneralesObraModif(id_modif_pago);
    if (!res || (Array.isArray(res) && res.length === 0) || (typeof res === 'object' && Object.keys(res).length === 0)) {
      throw new Error('No se encontraron datos para la obra proporcionada');
    }
    this.datosEnvio = res;

    const resFis = await this.fiscalDesignado(this.datosEnvio[0].id_obra);
    if (!resFis || (Array.isArray(resFis) && resFis.length === 0) || (typeof resFis === 'object' && Object.keys(resFis).length === 0)) {
      throw new Error('No se encontraron datos del fiscal designado');
    }
    this.datosFis = resFis;

    const res1 = await this.datosInformesSF(id_modif_pago);
    if (!res1 || (Array.isArray(res1) && res1.length === 0) || (typeof res1 === 'object' && Object.keys(res1).length === 0)) {
      throw new Error('No se encontraron datos de los informes de Sup/Fis');
    }
    this.datosInf = res1;

      const res2 = await this.supervisorDesignado(this.datosEnvio[0].id_obra);
    if (!res2 || (Array.isArray(res2) && res2.length === 0) || (typeof res2 === 'object' && Object.keys(res2).length === 0)) {
      throw new Error('No se encontraron datos del supervisor designado');
    }
    this.datosSup = res2;
   
    //console.log("DATOS, ", res);

    const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
    const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
    const imgPath = 'assets/images/membretado_oficio.png';
    const marcaAgua = this.datosEnvio[0].fecha_aprobacion;

    const documentDefinition = {
      pageSize: 'LEGAL' as any,
      background: function (currentPage: any, pageSize: any) {
        return {
          image: imgPath,
          width: pageSize.width,
          height: pageSize.height,
          absolutePosition: { x: 0, y: 0 }
        }
      },

      ...(!marcaAgua && {
        watermark: { text: 'PRELIMINAR', color: 'red', opacity: 0.2, bold: true },
      }
      ),
      
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
          text: 'MEMORANDUM',
          style: 'header', alignment: 'center',
        } as any,
       {
          text: this.datosEnvio[0].cod_carpeta + '-' + 'MOC-' + this.datosEnvio[0].numero_modificacion,
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
                  text: 'La Paz, ' + this.fechaString(this.datosEnvio[0].fecha_memo_minuta), 
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
        {
          text: '\n'
        } as any,
        {
          text: 'REF.: ORDEN DE CAMBIO N°' + this.datosEnvio[0].numero_modificacion, 
          style: 'coloredText', alignment: 'center', decoration: 'underline' 
        },
        {
          text: '\n'
        },
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
                { text: [{ text: 'CONTRATO N°:\n', style: 'textTitulo', alignment: 'right',fillColor: '#dddddd' },] },
                { text: [{ text: this.datosEnvio[0].numero_contrato + '', style: 'textDato', alignment: 'left-justify', fillColor: '#dddddd' }] }
              ]

            ]
          },
          layout: 'noBorders'
        },
        {
          text: '\n'
        },
        {
          text: [
            { text: 'Señor(es): \n', style: 'textDato' },
            {
              text: 'De acuerdo al informe Orden de Cambio ' + this.datosEnvio[0].cod_carpeta + '-' + this.datosInf[0].cite_sup + '-' + this.datosInf[0].correlativosup + ' , de fecha ' + this.fechaString(this.datosEnvio[0].fecha_supervisor) + 
              ' emitido por la supervisión de obra, aprobado mediante informe Orden de Cambio ' + this.datosEnvio[0].cod_carpeta + '-' + this.datosInf[0].cite_fis + '-' + this.datosInf[0].correlativofis + ' de fecha ' + 
              this.fechaString(this.datosEnvio[0].fecha_fiscal) + ' por la fiscalización de obra, se aprueba la presente ORDEN DE CAMBIO N°' + this.datosEnvio[0].numero_modificacion + 
              ' por ' + this.datosInf[0].referencia + ', con una variación de ' + this.datosEnvio[0].dias_variacion + ' d.c.' + ' con fecha de conclusión; ' + this.fechaString(this.datosEnvio[0].fecha_recep_provisional) + '.\n\n',
              style: 'textDato',  alignment: 'justify'
            },
            {
              text: 'Asimismo, el monto de la modificación N°' + this.datosEnvio[0].numero_modificacion + ' es de Bs.' + this.datosEnvio[0].monto_contrato + '(' + this.convertToWords(this.datosEnvio[0].monto_contrato, 'Bs.') + ')' + 
              ', tiene una variación de ' + this.datosEnvio[0].monto_variacion + ' (' + this.convertToWords(this.datosEnvio[0].monto_variacion, 'Bs.') + ')' + '.\n\n',
              style: 'textDato', alignment: 'justify', lineHeight: 1
            },
            {
              text: 'Por lo que el monto autorizado será de Bs.' + this.datosEnvio[0].monto_total + ' (' + this.convertToWords(this.datosEnvio[0].monto_total, 'Bs.') +  
              ') totalizando un valor porcentual de modificaciones a la fecha respecto al contrato inicial, de ' + this.datosEnvio[0].porcentaje_total + '%.',
              style: 'textDato', alignment: 'justify', lineHeight: 1
            },
            {
              text: '\n\nAtentamente,', 
              style: 'textDato', alignment: 'left'
            },
          ],
        },
        {
          text: '\n\n\n\n\n'
        },
        {
          table: {
            widths: ['*', '*'],
            body: [
              [
                {
                  text: 'CONTRATANTE', style: 'textTitulo', alignment: 'center'
                },
                {
                  text:
                      [
                        { text: this.datosEnvio[0].proponente_razon_social + '\n', style: 'textDato', alignment: 'center' },
                        { text: 'EMPRESA CONTRATISTA', style: 'textTitulo', alignment: 'center' }
                      ]
                }
              ]
            ]
          }, layout: 'noBorders'

        },
        {
          text: '\n\n\n\n\n\n'
        },
        {
          table: {
            widths: ['*', '*'],
            body: [
              [
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
                        { text: 'FISCAL(ES) DE OBRA', style: 'textTitulo', alignment: 'center' }
                      ]
                },
                {
                  text:
                      [
                        { text: 
                              (Array.isArray(this.datosSup)
                                ? this.datosSup
                                    .filter(f => f && f.supervisor)
                                    .map(f => f.supervisor)
                                    .join(' | ')
                                : ''
                              ) + '\n', style: 'textDato', alignment: 'center' },
                        { text: 'SUPERVISOR(ES) DE OBRA', style: 'textTitulo', alignment: 'center' }
                      ]
                }
              ]
            ]
          }, layout: 'noBorders'
        },
        {
          text: '\n\n\n'
        },
        { 
          text: '\nC.c. DLC' + '\nC.c. Unidad Ejecutora.' + '\nC.c. Arch.', style: 'footerText', alignment: 'left' 
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
      pageMargins: [70, 170, 50, 30] as any, // Márgenes: izquierda, arriba, derecha, abajo


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

  //// FUNCIONES VARIOS
  
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

  return `${integerWords} CON ${decimalWords} ${currencyWords}`;
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


}