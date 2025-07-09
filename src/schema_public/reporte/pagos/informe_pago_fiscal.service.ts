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
export class InformePagoFiscal {
    datosEnvio: any = [];
    datosSup: any = [];
    datosFis: any = [];
    datosInfSup: any = [];

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

    // Datos informe - modificación Supervisor
  async datosInformeModifSupervisor(solicitud: number) {
    const query = `
        SELECT * 
        FROM public."vista_reporte_InfMod_Supervisor" WHERE id_solicitud = ${solicitud}`;
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

async generateInformePagoFiscal(id_modif_pago: number): Promise<Buffer> {

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

    const res3 = await this.datosInformeModifSupervisor(this.datosEnvio[0].id_solicitud);
    if (!res3 || (Array.isArray(res3) && res3.length === 0) || (typeof res3 === 'object' && Object.keys(res3).length === 0)) {
        throw new Error('No se encontraron datos del informe de Supervisor');
    }
    this.datosInfSup = res3; 

    
    const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
    const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
    const imgPath = 'assets/images/membretado_oficio.png';
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
 
   console.log('DATOS MODIFICACION',this.datosInfSup);
   
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
        text: 'INFORME DE PAGO',
        style: 'header', alignment: 'center'
      } as any,
      {
        text: this.datosEnvio[0].cod_carpeta + '-' + this.datosInfSup[0].cite_informe + '-' + this.datosInfSup[0].correlativo,
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
                { text: 'A:', style: 'textTitulo', margin: [0, 5, 0, 5], alignment:'right' },
                { 
                    // text: [
                    //     {
                    //     text: (
                    //         Array.isArray(this.datosFis)
                    //         ? this.datosFis
                    //             .filter(f => f && f.fiscal)
                    //             .map(f => f.fiscal)
                    //             .join('\n')  // salto de linea 
                    //         : ''
                    //     ) + '\n',
                    //     style: 'textDato', alignment: 'left'
                    //     },
                    //     { text: 'FISCAL(ES) DE OBRA', style: 'textTitulo', alignment: 'left'}
                    // ]
                },
            ],
            [
                { text: 'DE:', style: 'textTitulo', margin: [0, 6, 0, 0], alignment: 'right' },
                { 
                    text: [
                        {
                        text: (
                            Array.isArray(this.datosFis)
                            ? this.datosFis
                                .filter(f => f && f.fiscal)
                                .map(f => f.fiscal)
                                .join('\n')  // salto de linea 
                            : ''
                        ) + '\n',
                        style: 'textDato', alignment: 'left'
                        },
                        { text: 'FISCAL(ES) DE OBRA', style: 'textTitulo', alignment: 'left'}
                    ]
                },       
            ],
            [
                { text: 'REF.:', style: 'textTitulo', alignment:'right' },
                { text: [{ text: this.datosInfSup[0].referencia, style: 'textDato' }] },
            ],
            [
                { text: 'PERIODO:', style: 'textTitulo', alignment:'right' },
                { text: [{ text: this.datosInfSup[0].referencia, style: 'textDato' }] },
            ],
            [
                { text: 'FECHA:', style: 'textTitulo', alignment:'right' },
                { text: this.fechaString(this.datosEnvio[0].fecha_supervisor), style: 'textDato' },
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
        text: 'En atención al informe de pago ' + 'OBN-XX-XXX-XXX' + ' de fecha' + 'XXXXXXXXX' + 
            ' de la supervisión de obra, se emite el presente informe.',
        style: 'textDato', alignment:'justify', margin: [10, 0, 0, 5]
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
              { text: [{ text: 'CÓDIGO:', style: 'textTitulo', alignment: 'right' },], fillColor: '#dddddd' },
              { text: [{ text: this.datosEnvio[0].cod_carpeta, style: 'textDato', bold:true }], fillColor: '#dddddd' }
            ],
            [
              { text: [{ text: 'OBRA:', style: 'textTitulo', alignment: 'right' },] },
              { text: [{ text: this.datosEnvio[0].desc_carpeta, style: 'textDato' }] }
            ],
            [
              { text: [{ text: 'ZONA:', style: 'textTitulo', alignment: 'right' },], fillColor: '#dddddd' },
              { text: [{ text: this.datosEnvio[0].desc_zona_carpeta, style: 'textDato' }], fillColor: '#dddddd' }
            ],
            [
              { text: [{ text: 'EMPRESA CONTRATISTA:', style: 'textTitulo', alignment: 'right' },] },
              { text: [{ text: this.datosEnvio[0].proponente_razon_social, style: 'textDato' }] }
            ],
            [
              { text: [{ text: 'FECHA ORDEN DE PROCEDER:', style: 'textTitulo', alignment: 'right' },], fillColor: '#dddddd' },
              { text: [{ text: this.formatearFecha(this.datosEnvio[0].fecha_inicio_ejecucion), style: 'textDato' }], fillColor: '#dddddd' }
            ],
            [
              { text: [{ text: 'PLAZO DE EJECUCIÓN VIGENTE:', style: 'textTitulo', alignment: 'right' },] },
              { text: [{ text: this.datosEnvio[0].plazo_contrato + ' d.c.', style: 'textDato' }] }
            ],
            [
              { text: [{ text: 'FECHA CONCLUSIÓN PROGRAMADA:', style: 'textTitulo', alignment: 'right' },] },
              { text: [{ text: this.formatearFecha(this.datosEnvio[0].fecha_recep_provisional), style: 'textDato' }] }
            ],
            [
              { text: [{ text: 'MONTO CONTRATO INICIAL (Bs):', style: 'textTitulo', alignment: 'right' },], fillColor: '#dddddd' },
              { text: [{ text: this.formatIfNumber(this.datosEnvio[0].monto_contrato,formatoNumerico2), style: 'textDato' }], fillColor: '#dddddd' }
            ],
            [
              { text: [{ text: 'MONTO CONTRATO VIGENTE (Bs):', style: 'textTitulo', alignment: 'right' },], fillColor: '#dddddd' },
              { text: [{ text: this.formatIfNumber(this.datosEnvio[0].monto_contrato,formatoNumerico2), style: 'textDato' }], fillColor: '#dddddd' }
            ],            
          ]
        }, margin: [10, 0, 0, 7] 
        //layout: 'noBorders'
      },
      {
        text: '2.   ANTECEDENTES',
        style: 'textTitulo', margin: [0, 0, 0, 5] 
      },
      {
        
      },
      {
        text: '3.   DESARROLLO\n',
        style: 'textTitulo', margin: [0, 0, 0, 5]
      },
      {
        text: 'Habiendo revisado el informe ' + 'OBN-XX-XXXXX' + 'de fecha ' + ' xxxx xxxxx' + 
            ' y los anexos adjuntos, en cumplimiento a las cláusulas contractuales de la obra de referencia, la presente fiscalización aprueba el ' + 
            'informe señalado, para la prosecución de pago, bajo el siguiente detalle:',
        style: 'textDato', alignment:'justify', margin: [10, 0, 0, 5] 
      },
      {
        text: [
            { text: '- Importe del presente certificado: ', style: 'textDato2' },
            { text: '\n- Deducciones: ', style: 'textDato2'},
            { text: '\n- Retenciones: ', style: 'textDato2'},
            { text: '\n- Multas: ', style: 'textDato2'},
            { text: '\n- Importe neto a pagar: ', style: 'textDato2'}
        ],
        margin: [30, 0, 0, 7] 
      },
      {
        text: '4.   CONCLUSIÓN',
        style: 'textTitulo', margin: [0, 0, 0, 5]
      },
      {
        ul: 
        [
          { text: [
                { text: 'De acuerdo al informe + ' + 'XXXXX' + ' de fecha ' + 'XXXX' +  ' emitido por la supervisión de obra, que certifica que las cantidades y ' + 
                    'los cómputos métricos fueron ejecutados de acuerdo a las especificaciones técnicas del GAMLP, la presente fiscalización APRUEBA el informe señalado y considera PROCEDENTE SU PAGO.' + 
                    'especificaciones técnicas de la obra, situación que corresponde a los certificados de calidad y planos de detalle adjunto al presente.'
                },
                 ], margin: [0, 0, 0, 5]
          },
          {
            text: [
                { text: 'El importe del precente certificado asciende a la suma de Bs' + 
                    'XXXXX' + ' (xxxxxxx 00/100)'
                }
                 ], margin: [0, 0, 0, 5]
          },
          {
            text: [
                { text: 'El avance comprendido en el presente certificado alcanza al:' + 'XXXXXX' + '% según monto de contrato inicial, por lo que el porcentaje ' + 
                    'acumulado es de: ' + 'xxxxx' + '%.'
                }
                 ]
          }
        ], style: 'textDato', alignment:'justify', margin: [10, 0, 0, 7]
      },
      {
        text: '5.   RECOMENDACIONES',
        style: 'textTitulo', margin: [0, 0, 0, 5]
      },
      {
        text: 'Dar prosecución al tramite de Pago a la instancia correspondiente.',
        style: 'textDato', margin: [10, 0, 0, 5]
      },
      {
        text: ['\n'],
      }, 
      {
        text: 'Es cuánto se informa para los fines consiguientes.',
        style: 'textDato', alignment:'justify'
      },
      {
        text: ['\n'],
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
      textDato2: {
        fontSize: 9,
        bold: true,
      },
      textDatoT: {
        fontSize: 7,
        bold: false,
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
          { text: '(Firma y Sello)', style: 'textDato', alignment: 'center', margin: [0, 45, 0, 0] }
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