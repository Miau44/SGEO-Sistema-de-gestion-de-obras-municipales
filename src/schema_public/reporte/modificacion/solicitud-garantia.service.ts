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
import { ReportService } from 'src/schema_public/reporte/reporte.service';

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
export class SolicitudGarantia {

    datosEnvio: any = [];
    datosSup: any = [];
    datosSolGa: any = [];

    constructor(
      private readonly responseService: ResponseService,
      @Inject(Sequelize) private sequelize: Sequelize, // Inyecta Sequelize correctamente
      private readonly reportService: ReportService,
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

    // SUPERVISORES designados por obra 
   async supervisorDesignado(obra: number) {
    const query1 = `
        SELECT * 
        FROM public."vista_supervisores_obra" WHERE id_obra = ${obra}`;
    const resultado1 = await this.sequelize.query(query1);
    return resultado1[0];
   }

     // Datos Solicitud Garantia
  async datosSolGarantia(id_modif_pago: number) {
    const query = `
        SELECT * 
        FROM public."vista_reporte_Sol_Garantia" WHERE id_modificacion_pago = ${id_modif_pago}`;
    const resultado = await this.sequelize.query(query);
    return resultado[0];
  }

  //MEMBRETADO SOLICITUD DE GARANTIA CARTA POR FECHA 13 DE MAYO DE 2026

  obtenerMembretePorFecha(fecha: string | Date): string {
    const fechaDocumento = new Date(fecha);
    // tercer membretado nuevo por fecha del 13 de mayo 2026
    if (fechaDocumento >= new Date('2026-05-13')) {
      return 'assets/images/carta.png';
    }
    // segundo membretado por fecha 
    if (fechaDocumento >= new Date('2026-01-01')) {
      return 'assets/images/membretado_carta_nuevo.png';
    }
    // primer membretado con el logo 200
    return 'assets/images/membretado_carta.png';
  }

  //margenes por fecha para el nuevo membrete 
  private obtenerMargenesPorFecha(
    fecha: string | Date,
  ): [number, number, number, number] {

    const fechaDocumento = new Date(fecha);

    // margenes por fecha para el tercer membretado 
    if (fechaDocumento >= new Date('2026-05-13')) {
      return [50, 140, 50, 70];
    }

    // margenes por fecha para el segundo membretado
    if (fechaDocumento >= new Date('2025-01-01')) {
      return [70, 130, 50, 40];
    }

    // margenes por fecha para el primer membretado con logo200
    return [70, 170, 50, 40];
  }
    

// REPORTE - SOLICITUD DE GARANTIA
async generateSolicitudGarantia(id_modif_pago: number): Promise<Buffer> {

  const datosGenerales = await this.datosGeneralesObraModif(id_modif_pago);
  if ((!datosGenerales || (Array.isArray(datosGenerales) && datosGenerales.length === 0) || (typeof datosGenerales === 'object' && Object.keys(datosGenerales).length === 0))){
    throw new Error('No se encontraron datos para la ID de la obra proporcionada');
  }
  this.datosEnvio = datosGenerales;

  const res1 = await this.supervisorDesignado(this.datosEnvio[0].id_obra);
  if (!res1 || (Array.isArray(res1) && res1.length === 0) || (typeof res1 === 'object' && Object.keys(res1).length === 0)) {
      throw new Error('No se encontraron datos del supervisor designado');
  }
  this.datosSup = res1;

  const res2 = await this.datosSolGarantia(id_modif_pago);
  if (!res2 || (Array.isArray(res2) && res2.length === 0) || (typeof res2 === 'object' && Object.keys(res2).length === 0)) {
    this.datosSolGa = [{
      cite_nota: '',
      correlativo: ''
    }];
  } else {
    this.datosSolGa = res2;
  }
  

  //console.log('DATOS NULOS', 'HOLA');
  const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
  const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
  //const imgPath = 'assets/images/membretado_carta.png';
  //memebretado por  gestion
  //const codigoCarpeta = this.datosEnvio[0].cod_carpeta;
  //const imgPath = this.reportService.obtenerMembretePorGestion(codigoCarpeta);

  //membretado por fecha  del 13 de mayo 2023
  const fechaDocumento = this.datosEnvio[0].fecha_supervisor;
  const imgPath = this.obtenerMembretePorFecha(fechaDocumento);

  const marcaAgua = this.datosEnvio[0].fecha_aprobacion;

  //margenes por  gestion
  /*let gestionObra = parseInt(codigoCarpeta.split('-').pop());
  let margenesDinamicos;

  if (gestionObra >= 2026) {
    margenesDinamicos = [70, 130, 50, 40]; 
  } else {
    margenesDinamicos = [70, 170, 50, 40]; 
  }*/

  //margenes por fecha para el membretado nuevo 
  const margenesDinamicos = this.obtenerMargenesPorFecha(fechaDocumento);

    const documentDefinition = {
    pageSize: 'LETTER' as any,
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
        text:[
              { text: 'La Paz, ' + this.fechaString(this.datosEnvio[0].fecha_supervisor) + '\n', style: 'textDato', alignment:'right' }, 
            ],
      },
      {
        text:[
            { text: '\n\nNOTA DE SOLICITUD DE GARANTÍA', style: 'titulo', alignment: 'center' },
            { text: '\nCITE:' + this.datosEnvio[0].cod_carpeta + '-'+ this.datosSolGa[0].cite_nota + '-' + this.datosSolGa[0].correlativo, style: 'titulo', alignment: 'center' },
        ],
      },
      {
        text: '\n\n',
      },
      {
        text: 'Señor(a):',
        style: 'textDato'
      },
      {
        text: [
          { text: this.datosEnvio[0].proponente_representante + '\n', style: 'textDato'},
          { text: this.datosEnvio[0].proponente_razon_social, style: 'textDato', bold:true}
        ]
      },
      {
        text: 'Presente.-',
        style: 'textDato', decoration: 'underline'
      },
      {
        text: '\nREF.:SOLICITUD DE GARANTÍA ' + this.datosEnvio[0].desc_subtipo + ' Nro.' + this.datosEnvio[0].numero_modificacion + ' - ' + this.datosEnvio[0].cod_carpeta + ' ' + this.datosEnvio[0].desc_carpeta , 
        style: 'titulo', alignment: 'right', decoration: 'underline', margin: [80,0,0,0]
      },
      {
        text: '\n',
      },
      {
        text: [
          { text: 'De mi consideración:\n\n', style: 'textDato' },
          {
            text: 'Cómo es de su conocimiento, a la fecha se está tramitando la modificación del Contrato Administrativo Municipal de la Obra Nro. ' + this.datosEnvio[0].numero_contrato + 
            ' emergente del proceso de contratación bajo la modalidad: ' + this.datosEnvio[0].modalidad + 
            ' incrementándose el monto en Bs' + this.datosEnvio[0].monto_variacion + ' (' + this.convertToWords(this.datosEnvio[0].monto_variacion, 'Bs.') + ').\n\n', 
            style: 'textDato', alignment: 'justify', lineHeight: 1,
          },
          {
            text: 'Por lo señalado anteriormente, y a fin de formalizar  la modificación del contrato mediante ' + this.datosEnvio[0].desc_subtipo + ' Nro.' +  this.datosEnvio[0].numero_modificacion + 
            ' en el plazo de 5 días hábiles, computables a partir de la recepción de la presente nota, deberá presentar ante la ' + this.datosEnvio[0].nombre_da +
            ', la Garantía de cumplimiento de contrato (de igual o mayor solvencia a la presentada ' + 
            'en el proceso de contratación) equivalente al siete porciento (7%) del monto incrementado.\n\n',
            style: 'textDato', alignment: 'justify', lineHeight: 1,
          },
          {
            text: 'Toda vez que la modificación del contrato está destinado al cumplimiento del objeto de la contratación, la falta de atención a la presente ' + 
            'podrá ser considerado cómo incumplimiento de contrato y sancionado conforme a las claúsulas del mismo.\n\n',
            style: 'textDato', alignment: 'justify', lineHeight: 1,
          },
          {
            text: 'Sin otro particular, saludo a usted con las consideraciones más distinguidas.\n\n\n',
            style: 'textDato', alignment: 'justify', lineHeight: 1,
          },
          
        ]
      },
      {
        table: {
          widths: ['50%', '50%'],
          body: (
            this.datosSolGa?.[0]?.de_nombre
              ? this.datosSolGa[0].de_nombre.split('\n')
              : ['']
          ).map((nombre: string) => [
            {
              text: [
                { text: nombre + '\n', style: 'textDato' }, // salto después del nombre
                { text: 'SUPERVISOR DE OBRA', style: 'textDato', bold: true }
              ],
              margin: [0, 35, 0, 0],
              alignment: 'center'
            },
            {
              text: '(Firma y Sello)', style: 'textDato', alignment: 'center', margin: [0, 45, 0, 0]
            }
          ])
        }
      },
      {
        text: ['\n\n\n\n\n\n\n\n\ncc:Arch:' ],
        style: 'footerText'
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
        fontSize: 18,
        bold: true,
      },
      subheader: {
        fontSize: 12,
        bold: true,
      },
      titulo: {
        fontSize: 10,
        bold: true,
        //opacity: 0.8,
      },
      footerText: {
        fontSize: 6,
        bold: false,          
      },
      textDato: {
        fontSize: 9,
        //bold: false,
        //color: 'gray', 
        opacity: 0.8,
      },
    },
    //pageMargins: [70, 130, 50, 40] as any, // Márgenes: izquierda, arriba, derecha, abajo
    pageMargins: margenesDinamicos as any, // Márgenes:izquierda, arriba, derecha,abajo margenes dinamico  

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

// FUNCIONES VARIOS

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

    //Cargar tabla de Supervisores - con recuadro
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


}