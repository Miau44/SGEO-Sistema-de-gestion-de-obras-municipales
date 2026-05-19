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
export class AnexoOC {

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

  //membrete nuevo
  private obtenerMembretadoPorfecha(fecha: string | Date): string {
    const fechaDocumento = new Date(fecha);

    // nuevo membretado desde MAYO 2026
    if (fechaDocumento >= new Date('2026-05-13')) {
      return 'assets/images/CARTA.png';
    }

    return 'assets/images/membretado_carta.png';
  }

  private obtenerMargenesporfecha(
    fecha: string | Date,
  ): [number, number, number, number] {

    const fechaDocumento = new Date(fecha);

    // Márgenes del nuevo membretado desde mayo 2026
    if (fechaDocumento >= new Date('2026-05-13')) {
      return [60, 140, 50, 70];
    }

    // Márgenes del membretado anterior
    return [70, 140, 50, 110];
  }

    // REPORTE - ANEXO ORDEN DE CAMBIO
  async generateAnexoOC(id_modif_pago: number): Promise<Buffer> {

  const datosGenerales = await this.datosGeneralesObraModif(id_modif_pago);
  if ((!datosGenerales || (Array.isArray(datosGenerales) && datosGenerales.length === 0) || (typeof datosGenerales === 'object' && Object.keys(datosGenerales).length === 0))){
    throw new Error('No se encontraron datos para el ID de la obra proporcionada');
  }
  this.datosEnvio = datosGenerales;

  const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
  const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
  //membretado anterior
  //const imgPath = 'assets/images/membretado_carta.png';
  //membretado nuevo desde  mayo 13
  const fechaDocumento = this.datosEnvio[0].fecha_supervisor;
  const imgPath = this.obtenerMembretadoPorfecha(fechaDocumento);
  const marcaAgua = this.datosEnvio[0].fecha_aprobacion;

  //margenes dinamicos
  const margenesDinamicos =this.obtenerMargenesporfecha(fechaDocumento);
   
     //console.log('DATOS ITEMS',this.datosIncremento);

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
        text: 'ANEXO 1\n ACTAS DE CONFORMIDAD\nORDEN DE CAMBIO Nro.' + this.datosEnvio[0].numero_modificacion,
        style: 'header', alignment: 'center'
      } as any,
      {
        text: this.datosEnvio[0].cod_carpeta,
        style: 'header', alignment: 'center'
      },
      {
        text: '\n',
      },
      {
        table: {
            widths: ['*'],
            body: [
                [
                    { text: 'CONFORMIDAD POR PARTE DEL CONTRATISTA', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd'}
                ],
                [
                    { text: ' ', margin: [0, 70, 0, 0] }
                ],
                [
                    { text: [
                        { text: 'EMPRESA CONTRATISTA\n', style: 'textTitulo', alignment: 'center'},
                        { text: 'Firmo dando conformidad a las modificaciones a ser introducidas a través de la Orden Cambio Nro.' + this.datosEnvio[0].numero_modificacion,
                      style: 'textDato', alignment: 'left'},
                    ] 
            }
                ]

              
              ]
          }, margin: [20,0,20,0]
      },
      {
        text: '\n\n'
      },
      {
        table: {
            widths: ['*'],
            body: [
                [
                    { text: 'CONFORMIDAD POR PARTE DEL(LOS) SUPERVISOR(ES)', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd'}
                ],
                [
                    { text: ' ', margin: [0, 70, 0, 0] }
                ],
                [
                    { text: [
                        { text: 'SUPERVISIÓN DE OBRA\n', style: 'textTitulo', alignment: 'center'},
                        { text: 'Firmo(amos) dando conformidad a las modificaciones a ser introducidas a través de la Orden Cambio Nro.' + this.datosEnvio[0].numero_modificacion,
                      style: 'textDato', alignment: 'left'},
                    ] 
            }
                ]

              
              ]
          }, margin: [20,0,20,0]
      },
      {
        text: '\n\n'
      },
      {
        table: {
            widths: ['*'],
            body: [
                [
                    { text: 'CONFORMIDAD POR PARTE DEL(LOS) FISCAL(ES)', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd'}
                ],
                [
                    { text: ' ', margin: [0, 70, 0, 0] }
                ],
                [
                    { text: [
                        { text: 'FISCALIZACIÓN DE OBRA\n', style: 'textTitulo', alignment: 'center'},
                        { text: 'Firmo(amos) dando conformidad a las modificaciones a ser introducidas a través de la Orden Cambio Nro.' + this.datosEnvio[0].numero_modificacion,
                      style: 'textDato', alignment: 'left'},
                    ] 
            }
                ]

              
              ]
          }, margin: [20,0,20,0]
      }
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
        fontSize: 10,
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
      textDatoT: {
        fontSize: 7,
        bold: false,
        opacity: 0.8,
      },
    },
    //pageMargins: [70, 140, 50, 110] as any, // Márgenes: izquierda, arriba, derecha, abajo
    //pageMargins: this.obtenerMargenePorFecha( this.datosEnvio[0].fecha_supervisor) as any,
    pageMargins: margenesDinamicos as any

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