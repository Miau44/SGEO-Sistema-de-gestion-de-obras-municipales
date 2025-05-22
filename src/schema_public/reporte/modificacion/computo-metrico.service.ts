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

// Datos generales obra - contrato - OP
  async datosGeneralesReporteOP(obra: number) {
    const query1 = `
        SELECT * 
        FROM public.vista_datos_op WHERE id_obra = ${obra}`;
    const resultado = await this.sequelize.query(query1);
    return resultado[0];
  }

     // SUPERVISORES designados por obra 
   async supervisorDesignado(obra: number) {
    const query1 = `
        SELECT * 
        FROM public.vista_supervisores_obra WHERE id_obra = ${obra}`;
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

    //Cargar tabla de fiscales - con recuadro
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
                { text: nombreCompleto + '\n', style: 'textDato' },
                { text: 'FISCAL DE OBRA', bold: true, style: 'textDato' }
                  ],
                alignment: 'center', margin: [0, 25, 0, 0]},
          { text: '(Firma y Sello)', style: 'textDato', alignment: 'center', margin: [0, 35, 0, 0] }
        ];
        arrayData.push(rowData);
      }
      return arrayData;
    }

// REPORTE - COMPUTO METRICO
async generateComputoMetrico(obra: number): Promise<Buffer> {

  const datosGenerales = await this.datosGeneralesReporteOP(obra);
  if ((!datosGenerales || (Array.isArray(datosGenerales) && datosGenerales.length === 0) || (typeof datosGenerales === 'object' && Object.keys(datosGenerales).length === 0))){
    throw new Error('No se encontraron datos para la ID de la obra proporcionada');
  }
  this.datosEnvio = datosGenerales;

  const res1 = await this.supervisorDesignado(obra);
  if (!res1 || (Array.isArray(res1) && res1.length === 0) || (typeof res1 === 'object' && Object.keys(res1).length === 0)) {
      throw new Error('No se encontraron datos del supervisor designado');
  }
  this.datosSup = res1;

  const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
  const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
   const imgPath = 'assets/images/membretado_oficio.png';
 
    const documentDefinition = {
    pageSize: 'LEGAL' as any,
    background: function(currentPage: any, pageSize: any) { 
      return {
        image: imgPath, 
        width: pageSize.width, 
        height: pageSize.height,
        absolutePosition: {x: 0, y: 0}
            } },

    //watermark: { text: 'Pendiente', color: 'blue', opacity: 0.1, bold: true, italics: false },
    
    header: {
      columns: [{ 

      }],
      
    } as any,

    content: [ 
      
      {
        text:[
            { text: '\n\n\nPLANILLA COMPUTO METRICO ' + 'CONTRATO MODIFICATORIO ' + ' N°' + '1\n', style: 'subheader', alignment: 'center' },
            { text: this.datosEnvio[0].cod_carpeta , style: 'subheader', alignment: 'center' },
        ],
      },
      {
        text: '\n',
      },
      {
        text:[
            { text: 'NOMBRE DE LA OBRA: ', style: 'footerText', bold:true },
            { text: this.datosEnvio[0].desc_carpeta, style: 'footerText'}
            ], margin: [0,0,0,6],    
      },
      {
        table: {
          widths: [10, '*', 30, 30, 30, 30, 30, 30, 30, 30, 30], // 11 columnas
          body: [
            [
              { rowSpan: 2, text: 'Nº', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
              { rowSpan: 2, text: 'DESCRIPCIÓN', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
              { rowSpan: 2, text: 'UNIDAD', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
              { rowSpan: 2, text: 'Nº de Veces', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
              { colSpan: 5, text: 'MEDIDAS', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' }, {}, {}, {}, {},
              { rowSpan: 2, text: 'PARCIAL', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
              { rowSpan: 2, text: 'TOTAL', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
            ],
            [
              {}, {}, {}, {},
              { text: 'A\nLargo', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
              { text: 'B\nAncho', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
              { text: 'C\nAlto', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
              { text: 'D\nÁrea', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
              { text: 'E\nVolumen', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
              {}, // vacío para PARCIAL
              {}, // vacío para TOTAL
            ]
          ]
        }
      },
      {
        text: '\n',
      },
      {
          table: {
            widths: ['50%','50%'],
            body: [
              ...this.buildsupervisores(this.datosSup)
              ]
          }, margin: [20,0,20,0]
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
      footerText: {
        fontSize: 6,
        bold: false,          
      },
      textDato: {
        fontSize: 8,
        bold: false,
        //color: 'gray', 
        opacity: 0.8,
      },
    },
    pageMargins: [50, 0, 30, 30] as any, // Márgenes: izquierda, arriba, derecha, abajo

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