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
export class ComputoMetrico {

    datosEnvio: any = [];
    datosComputo: any = [];
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

  // Datos generales obra - contrato - modificación
  async datosGeneralesObraModif(id_modif_pago: number) {
    const query = `
        SELECT * 
        FROM public."vista_reporte_modificacion_gral" WHERE id_modificacion_pago = ${id_modif_pago}`;
    const resultado = await this.sequelize.query(query);
    return resultado[0];
  }

     // Datos informe - modificación Supervisor
   async datosInformeModifSupervisor(solicitud: number) {
    const query2 = `
        SELECT * 
        FROM public."vista_reporte_InfMod_Supervisor" WHERE id_solicitud = ${solicitud}`;
    const resultado2 = await this.sequelize.query(query2);
    return resultado2[0];
   }

       // Tabla Computo Metrico 
   async computoMetrico(obra: number, solicitud: number) {
    const query1 = `
        SELECT * 
        FROM public.f_reporte_computo(${obra},${solicitud});`;
    const resultado = await this.sequelize.query(query1);
    return resultado[0];
   }

  
  // REPORTE - COMPUTO METRICO
async generateComputoMetrico(obra: number, id_modificacion_pago: number): Promise<Buffer> {

  const datosGenerales = await this.datosGeneralesObraModif(id_modificacion_pago);
  if ((!datosGenerales || (Array.isArray(datosGenerales) && datosGenerales.length === 0) || (typeof datosGenerales === 'object' && Object.keys(datosGenerales).length === 0))){
    throw new Error('No se encontraron datos para la ID de la obra proporcionada');
  }
  this.datosEnvio = datosGenerales;

  const res2 = await this.computoMetrico(obra, id_modificacion_pago);
  if (!res2 || (Array.isArray(res2) && res2.length === 0) || (typeof res2 === 'object' && Object.keys(res2).length === 0)) {
      throw new Error('No se encontraron datos del cómputo métrico');
  }
  this.datosComputo = res2;

  const res3 = await this.datosInformeModifSupervisor(this.datosEnvio[0].id_solicitud);
  this.datosInfSup = res3;

  console.log('DATOS COMPUTO',this.datosInfSup);

  const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logoSGEO.png');
  const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
  //const imgPath = 'assets/images/membretado_oficio.png';
  const imgLogo = 'assets/images/logo_sgeo.png';
  const marcaAgua = this.datosEnvio[0].fecha_aprobacion;
  let formatoNumerico: Intl.NumberFormat; //variable para controlar el número de decimales

    if (this.datosEnvio[0].num_decimales === '2') {
      formatoNumerico = new Intl.NumberFormat('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    } else {
        if (this.datosEnvio[0].num_decimales === '5') {
          formatoNumerico = new Intl.NumberFormat('de-DE', {
          minimumFractionDigits: 5,
          maximumFractionDigits: 5
        });
        } else {
          formatoNumerico = new Intl.NumberFormat('de-DE', {
          minimumFractionDigits: this.datosEnvio[0].num_decimales,
          maximumFractionDigits: this.datosEnvio[0].num_decimales
        });
        }
    }

    //console.log('NUMERO DECIMALES', formatoNumerico);
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
        text:[
            { text: 'PLANILLA COMPUTO METRICO ' + this.datosEnvio[0].desc_subtipo + ' Nro.' + this.datosEnvio[0].numero_modificacion + '\n', style: 'subheader', alignment: 'center' },
            { text: this.datosEnvio[0].cod_carpeta , style: 'subheader', alignment: 'center' },
        ],
      },
      {
        text: '\n',
      },
      {
        text:[
            { text: 'NOMBRE DE LA OBRA: ', style: 'textTitulo2', bold:true },
            { text: this.datosEnvio[0].desc_carpeta, style: 'textDato2'}
            ], margin: [0,0,0,6],    
      },
      {
        table: {
          headerRows: 2,
          widths: [15, '*', 25, 30, 30, 30, 30, 30, 30, 40, 40], // 11 columnas
          body: [
            [
              { rowSpan: 2, text: 'Nro', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
              { rowSpan: 2, text: 'DESCRIPCIÓN', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
              { rowSpan: 2, text: 'UNIDAD', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
              { rowSpan: 2, text: 'Nro de Veces', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
              { colSpan: 5, text: 'MEDIDAS', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' }, {}, {}, {}, {},
              { rowSpan: 2, text: 'PARCIAL', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
              { rowSpan: 2, text: 'TOTAL', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
            ],
            [
              {}, {}, {}, {}, //
              { text: 'A\nLargo', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
              { text: 'B\nAncho', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
              { text: 'C\nAlto', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
              { text: 'D\nÁrea', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
              { text: 'E\nVolumen', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
              {}, // vacío para PARCIAL
              {}, // vacío para TOTAL
            ],
           ...this.buildContenidoComputo(this.datosComputo, formatoNumerico) 

          ]
        }
      },
      {
        text: '\n\n',
      },
      {
        table: {
          widths: ['50%', '50%'],
          body: (
            this.datosInfSup?.[0]?.de_nombre
              ? this.datosInfSup[0].de_nombre.split('\n')
              : ['']
          ).map((nombre: string) => [
            {
              text: [
                { text: nombre + '\n', style: 'textDato' }, // salto después del nombre
                { text: 'SUPERVISOR DE OBRA', style: 'textDato', bold: true }
              ],
              margin: [0, 35, 0, 0], alignment: 'center'
            },
            {
              text: '(Firma y Sello)', style: 'textDato', alignment: 'center', margin: [0, 45, 0, 0]
            }
          ])
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
        fontSize: 18,
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
        bold: false,
        //color: 'gray', 
        opacity: 0.8,
      },
    },
    pageMargins: [50, 55, 20, 30] as any, // Márgenes: izquierda, arriba, derecha, abajo

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

//////FUNCIONES 
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

    //Cargar tabla de supervisores - con recuadro
    buildsupervisores(data: any[]) {
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
                { text: nombreCompleto + '\n', style: 'textDato2' },
                { text: 'SUPERVISOR(ES) DE OBRA', bold: true, style: 'textDato2' }
                  ],
                alignment: 'center', margin: [0, 35, 0, 0]},
          { text: '(Firma y Sello)', style: 'textDato2', alignment: 'center', margin: [0, 45, 0, 0] }
        ];
        arrayData.push(rowData);
      }
      return arrayData;
    }

  //Cargar tabla de computos metricos
buildContenidoComputo(data: any[], formatoNumerico: Intl.NumberFormat) {

  let datosCM = data;
  let arrayData = [];

  for (let i = 0; i < datosCM.length; i++) {
    let rowData = [
      { text: datosCM[i].orden_sim ?? '', style: 'textDato', alignment: 'center' },
      { text: datosCM[i].desc_item ?? '', style: 'textDato' },
      { text: datosCM[i].unidad_medida_sim ?? '', style: 'textDato', alignment: 'center' },
      { text: this.formatIfNumber(datosCM[i].numero_veces, formatoNumerico) ?? '', style: 'textDato', alignment: 'center' },
      { text: this.formatIfNumber(datosCM[i].largo, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosCM[i].ancho, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosCM[i].alto, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosCM[i].area, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosCM[i].volumen, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosCM[i].parcial, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosCM[i].cantidad_reordenamiento, formatoNumerico), style: 'textDato', alignment: 'right' }
    ];
    arrayData.push(rowData);
  }

  return arrayData;
}

//formatIfNumber(value: any, formatter: Intl.NumberFormat): string {
//  const num = Number(value);
//  if (isNaN(num)) return '';
//  if (num === 0) return '';
//  return formatter.format(num);
//}

formatIfNumber(value: any, formatter: Intl.NumberFormat): string {
  if (value === null || value === undefined || value === '') return '';

  const num = Number(value);
  if (isNaN(num)) return '';

  return formatter.format(num); // incluye el 0 --por fin
}

}