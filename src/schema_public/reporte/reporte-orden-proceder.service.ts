import { Injectable, Inject } from '@nestjs/common';
//import * as PdfPrinter from 'pdfmake/src/printer';
import PdfPrinter from 'pdfmake';
import * as path from 'path';
import * as fs from 'fs';
import { ResponseService } from 'src/response.service';
import { Sequelize } from 'sequelize-typescript';
import { log } from 'console';
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
export class ReporteOrdenProcederService {

    datos: any = [];
    datosEnvio: any = [];
    datosSIM: any = [];
    datosPreguntaInforme: any = [];
    datosPreguntaInformeRestante: any = [];
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
    async datosGeneralesReporte(gestion: number, id: number) {
      const query1 = ` SELECT * FROM sp_reporte_memorandum(${gestion},${id})`;
      //const response = await sequelize.query(query);
      const resultado = await this.sequelize.query(query1);
      return resultado[0];
    }


  async datosAdjuntoSim(obra: number) {
    const query1 = `SELECT *  
  FROM  tipo_documento as td
WHERE  id_subtipo_documento =107 ORDER BY td.id_tipo_documento ASC;	`;
    const values = [obra]
    const resultado = await this.sequelize.query(query1);
    return resultado[0];
  }

  
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


  //FORMULARIO DE ENVIO DE DOCUMENTACION 
  async generateEnvioDoc(obra: number): Promise<Buffer> {

    const res = await this.datosReporteEnvio(obra);
    if (!res || (Array.isArray(res) && res.length === 0) || (typeof res === 'object' && Object.keys(res).length === 0)) {
      throw new Error('No se encontraron datos para la obra y el ID proporcionados.');
    }
    const ressim = await this.datosAdjuntoSim(obra);

    this.datosSIM = ressim;
    this.datosEnvio = res;
    const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
    const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
    const imgPath = 'assets/images/logo_gamlp.png';

    const documentDefinition = {
      pageSize: 'LETTER' as any,
      watermark: { text: 'SGEO', color: 'blue', opacity: 0.1, bold: true, italics: false },

      header: {
        columns: [
          { image: imgPath, width: 120 },

          // { image: `data:image/png;base64,${this.getImageBase64(headerImage)}`, width: 100 },
          //{ text: 'Título en Rojo', style: 'coloredText', alignment: 'left' }
          { text: 'Secretaría Municipal de Infraestructura Pública', style: 'coloredText', alignment: 'left' },
          // { text: '\nInfraestructura Pública', style: 'coloredTextgray', alignment: 'left' }          
        ],
        margin: [40, 10]
      } as any,
      content: [
        {
          text: '\n\nFORMULARIO DE ENVÍO DE DOCUMENTACIÓN\n DEL PROYECTO.\n\n',
          style: 'header', alignment: 'center'
        } as any,

        {
          text: 'DATOS DE PROYECTO. \n',
          style: 'subheader',
        },

        {
          table: {
            widths: ['*', 400],
            body: [
              [
                { text: [{ text: 'CÓDIGO:', style: 'textTitulo' },], fillColor: '#dddddd' },
                { text: [{ text: this.datosEnvio[0].cod_carpeta, style: 'textDato' }], fillColor: '#dddddd' }
              ],

              [
                { text: [{ text: 'OBRA:\n', style: 'textTitulo' },] },
                { text: [{ text: this.datosEnvio[0].desc_carpeta + '\n', style: 'textDato' }] }
              ],

              [
                { text: [{ text: 'ZONA:\n', style: 'textTitulo' },], fillColor: '#dddddd' },
                { text: [{ text: this.datosEnvio[0].desc_zona_carpeta + '\n', style: 'textDato' }], fillColor: '#dddddd' }
              ],

              [
                { text: [{ text: 'MONTO DE PROYECTO:\n', style: 'textTitulo' },] },
                { text: [{ text: this.datosEnvio[0].total_carpeta + '\n', style: 'textDato' }] }
              ],

              [
                { text: [{ text: 'FECHA DE VALIDACIÓN DEL PROYECTO:\n', style: 'textTitulo' },] },
                { text: [{ text: this.fechaString(this.datosEnvio[0].fecha_validacion_carpeta) + '\n\n', style: 'textDato' }] }
              ]
            ]
          },
          layout: 'noBorders'
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
          text: '\nSupervisión de Obra: \n\En cumplimiento al Reglamento de Supervisión y Fiscalización de Obras, toda vez que la obra cuenta con la supervisión designada, se remite el detalle de la documentación del proyecto para su revisión. \n\n',
          style: 'textDato',
        },

        {
          table: {
            widths: [30, '*', 50, 100],
            body: [
              [
                { text: [{ text: 'Nº:', style: 'textTitulo', alignment: 'center', },], fillColor: '#dddddd' },
                { text: [{ text: 'DOCUMENTO:', style: 'textTitulo' },], fillColor: '#dddddd' },
                { text: [{ text: 'ADJUNTO:', style: 'textTitulo', alignment: 'center', },], fillColor: '#dddddd' },
                { text: [{ text: 'OBS:', style: 'textTitulo' },], fillColor: '#dddddd' },

              ],
              ...this.buildDocumentosSIM(this.datosSIM)
            ]
          },
        },

        {
          text: '\nDocumentación Complementaría. \n',
          style: 'textTitulo',
        },



        {
          table: {
            widths: [30, '*', 50, 100],
            body: [
              [
                { text: [{ text: 'Nº:', style: 'textTitulo', alignment: 'center', },], fillColor: '#dddddd' },
                { text: [{ text: 'DOCUMENTO:', style: 'textTitulo' },], fillColor: '#dddddd' },
                { text: [{ text: 'ADJUNTO:', style: 'textTitulo', alignment: 'center', },], fillColor: '#dddddd' },
                { text: [{ text: 'OBS:', style: 'textTitulo' },], fillColor: '#dddddd' },

              ],
              ...this.buildDocumentos(this.datosEnvio)
            ]
          },
        },

        {
          text: '\n\n* El presente formulario será considerado una declaración jurada, cuya validez y contenido son de entera responsabilidad del funcionario municipal que suscribe la presente, bajo sanción de las determinaciones establecidas en el Reglamento Interno de Personal del GAMLP, en caso de encontrarse incumplimientos e inconsistencias.\n'
            + '\n** Se remite una copia a la Fiscalización de Obra. \n\n',
          style: 'textDato',
        },


        {
          text: '\n Fecha de Envío: 03/12/2024  ',
          style: 'textDato',
        },


        {
          text: [
            '\nIng. Jefe Sub:' + '\n' + 'Jefe de Unidad Solicitante',
          ],
          style: 'subheader', alignment: 'center'
        },

        {
          text: [
            '\ncc:Arch:',
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
          fontSize: 8,
          bold: true,
        },
        textDato: {
          fontSize: 8,
          bold: false,
          //color: 'gray', 
          opacity: 0.8,
        },


      },
      pageMargins: [70, 60, 50, 30] as any, // Márgenes: izquierda, arriba, derecha, abajo


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


  buildDocumentos(data: any) {
    let datosResp = data;
    let arrayData = [];

    var c = 0;
    for (let i = 0; i < datosResp.length; i++) {
      c = c + 1;
      let rowData = [
        { text: [{ text: c, style: 'textDato', alignment: 'center', }] },
        { text: [{ text: datosResp[i].desc_tipo_documento, style: 'textDato' }] },
        { text: [{ text: datosResp[i].cumple ? 'SI' : 'NO', style: 'textDato', alignment: 'center', }] },
        { text: [{ text: datosResp[i].observacion, style: 'textDato' }] },
      ];
      arrayData.push(rowData);

    }
    return arrayData;
  }

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

}
