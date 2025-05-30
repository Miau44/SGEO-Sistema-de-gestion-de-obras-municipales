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
import { TDocumentDefinitions } from 'pdfmake/interfaces'; 

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
export class PlanillaReordenamiento {

    datosEnvio: any = [];
    datosSup: any = [];
    datosComputo: any = [];

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

// REPORTE - PLANILLA DE REORDENAMIENTO
async generatePlanillaReordenamiento(obra: number, id_modificacion_pago: number): Promise<Buffer> {

  const datosGenerales = await this.datosGeneralesObraModif(id_modificacion_pago);
  if ((!datosGenerales || (Array.isArray(datosGenerales) && datosGenerales.length === 0) || (typeof datosGenerales === 'object' && Object.keys(datosGenerales).length === 0))){
    throw new Error('No se encontraron datos para la ID de la obra proporcionada');
  }
  this.datosEnvio = datosGenerales;

  console.log('DATOS COMPUTO',this.datosComputo);
  
    const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logoSGEO.png');
    const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
    //const imgPath = 'assets/images/membretado_oficio.png';
    const imgLogo = 'assets/images/logoSGEO.png'

  const documentDefinition: TDocumentDefinitions = {
  pageSize: 'LEGAL', // ✅ en minúsculas
  pageOrientation: 'landscape', // ✅ literal exacto
    
    header: {
      columns: [
              { image: imgLogo, width: 130, margin: [5,5,0,0] },
      ],
      
    } as any,

    content: [ 
      
      {
        text:[
            { text: 'PLANILLA DE ' + this.datosEnvio[0].desc_subtipo + ' N°' + this.datosEnvio[0].numero_modificacion + '\n', style: 'subheader', alignment: 'center' },
            { text: this.datosEnvio[0].cod_carpeta , style: 'subheader', alignment: 'center' },
        ],
      },
      {
        text: '\n',
      },
      {
        text:[
            { text: 'NOMBRE DE LA OBRA: ', style: 'textDato', bold:true },
            { text: this.datosEnvio[0].desc_carpeta, style: 'textDato'}
            ], margin: [0,0,0,6],    
      },
      {
        table: {
          headerRows: 2,
          widths: [10, 40, '*', 30, 30, 30, 30, 30, 30, 30, 30,30,30,30,30], // 15 columnas
          body: [
            [
              { rowSpan: 2, text: 'Nº', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
              { rowSpan: 2, text: 'CÓDIGO', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
              { rowSpan: 2, text: 'DESCRIPCIÓN', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
              { rowSpan: 2, text: 'UNIDAD', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
              { rowSpan: 2, text: 'PU', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
              { colSpan: 2, text: 'CONTRATO INICIAL', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
              { colSpan: 2, text: 'MODIFICACIÓN APROBADA', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' }, {}, {}, {}, {},
              { colSpan: 2, text: 'INCREMENTO', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
              { colSpan: 2, text: 'DECREMENTO', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
              { colSpan: 2, text: 'REORDENAMIENTO', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
            ],
            [
              {}, {}, {}, {}, {},//
              { text: 'CANTIDAD', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
              { text: 'MONTO', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
              { text: 'CANTIDAD', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
              { text: 'MONTO', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
              { text: 'CANTIDAD', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
              { text: 'MONTO', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
              { text: 'CANTIDAD', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
              { text: 'MONTO', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
              { text: 'CANTIDAD', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
              { text: 'MONTO', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
              
            ],
           //...this.buildContenidoComputo(this.datosComputo) 

          ]
        }

      },
      {
        text: '\n\n\n',
      },
      {
          
      },
      {
        
      } as any,
    ],

    footer: function(currentPage: { toString: () => string; }, pageCount: string) 
          { //return currentPage.toString() + ' of ' + pageCount; 
            return {
              columns:[
                  { text: currentPage.toString() + ' de ' + pageCount , alignment: 'right', style: 'footerText', margin: [0,0,20,0]} 
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
        fontSize: 7,
        bold: false,
        //color: 'gray', 
        opacity: 0.8,
      },
    },
    pageMargins: [30, 55, 30, 30] as any, // Márgenes: izquierda, arriba, derecha, abajo

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