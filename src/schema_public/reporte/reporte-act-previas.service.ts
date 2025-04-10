import { Injectable, Inject } from '@nestjs/common';
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
export class ReporteActPreviasService {

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
    async datosGeneralesReporte(idSolicitud: number) {
        const query1 = `
            SELECT * 
            FROM public.sp_reporte_datos_gral_obra(${idSolicitud});
        `;
        const resultado = await this.sequelize.query(query1);
        return resultado[0];
    }


//--Datos Documentos ETAPA I
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

    //--Cargar tabla de documentos
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


// FORMULARIO DE ENVIO DE DOCUMENTOS

async generateEnvioDoc(obra: number): Promise<Buffer> {

  const res = await this.datosReporteEnvio(obra);
  if (!res || (Array.isArray(res) && res.length === 0) || (typeof res === 'object' && Object.keys(res).length === 0)) {
    throw new Error('No se encontraron datos para la obra proporcionada');
  }

  this.datosEnvio = res;
  console.log("DATOS_DOCUMENTOS", this.datosEnvio);
  //ME const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
  //ME const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
  const imgPath = 'assets/images/membretado_carta.png';

  const documentDefinition = {
    pageSize: 'LETTER' as any,
    background: function(currentPage: any, pageSize: any) { 
      return {
          image: imgPath, 
          width: pageSize.width, 
          height: pageSize.height,
          absolutePosition: {x: 0, y: 0}
             } },
    //ME watermark: { text: 'SGEO', color: 'blue', opacity: 0.1, bold: true, italics: false },

    header: {
      columns: [
        //ME { image: imgPath, width: 180 },

        // { image: `data:image/png;base64,${this.getImageBase64(headerImage)}`, width: 100 },
        //{ text: 'Título en Rojo', style: 'coloredText', alignment: 'left' }
        //ME { text: 'Secretaría Municipal de Infraestructura Pública', style: 'coloredText', alignment: 'left' },
        // { text: '\nInfraestructura Pública', style: 'coloredTextgray', alignment: 'left' }          
      ],
    } as any,
    content: [
      {
        text: '\n\n\n\n\n\n\nFORMULARIO DE ENVÍO DE DOCUMENTACIÓN\n DEL PROYECTO\n\n',
        style: 'header', alignment: 'center'
      } as any,

      {
        text: 'DATOS DE PROYECTO \n',
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
              { text: [{ text: 'Bs.' + this.datosEnvio[0].total_carpeta + '\n', style: 'textDato' }] }
            ],
            [
              { text: [{ text: 'FECHA DE VALIDACIÓN DEL PROYECTO:\n', style: 'textTitulo' },], fillColor: 'dddddd' },
              { text: [{ text: this.fechaString(this.datosEnvio[0].fecha_validacion_carpeta) + '\n\n', style: 'textDato' }], fillColor: 'dddddd' }
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
              { text: [{ text: '', style: 'textTitulo' },] },
              { text: [{ text: '', style: 'textDato' }], }
            ],
          ]
        },
        layout: 'lightHorizontalLines'
      },
      {
        text: 'Supervisión de Obra: \n\En cumplimiento al Reglamento de Supervisión y Fiscalización de Obras, toda vez que la obra cuenta con la supervisión designada, se remite el detalle de la documentación del proyecto para su revisión. \n\n',
        style: 'textDato', alignment: 'justify',
      },

      /* ME {
        table: {
          widths: [30, '*', 50, 100],
          body: [
            [
              { text: [{ text: 'Nº:', style: 'textTitulo', alignment: 'center', },], fillColor: '#dddddd' },
              { text: [{ text: 'DOCUMENTO:', style: 'textTitulo' },], fillColor: '#dddddd' },
              { text: [{ text: 'ADJUNTO:', style: 'textTitulo', alignment: 'center', },], fillColor: '#dddddd' },
              { text: [{ text: 'OBS.:', style: 'textTitulo' },], fillColor: '#dddddd' },

            ],
            ...this.buildDocumentosSIM(this.datosSIM)
          ]
        },
      }, */

      {
        table: {
          widths: [30, '*', 50, 100],
          body: [
            [
              { text: [{ text: 'Nº', style: 'textTitulo', alignment: 'center', },], fillColor: '#dddddd' },
              { text: [{ text: 'DOCUMENTO', style: 'textTitulo' },], fillColor: '#dddddd' },
              { text: [{ text: 'ADJUNTO', style: 'textTitulo', alignment: 'center', },], fillColor: '#dddddd' },
              { text: [{ text: 'OBS.', style: 'textTitulo' },], fillColor: '#dddddd' },

            ],
            ...this.buildDocumentos(this.datosEnvio)
          ]
        },
      },
      {
        text: ['\n'],
      },
      {
        text: '* El presente formulario será considerado una declaración jurada, cuya validez y contenido son de entera responsabilidad del funcionario municipal que suscribe la presente, bajo sanción de las determinaciones establecidas en el Reglamento Interno de Personal del GAMLP, en caso de encontrarse incumplimientos e inconsistencias.\n'
          + '\n** Se remite una copia a la Fiscalización de Obra. \n\n',
        style: 'textDato', alignment: 'justify',
      },

      {
        text: 'Fecha de Envío: ' + this.datosEnvio[0].fecha_modificacion ,
        style: 'textDato',
      },

      {
        text: ['\n\n\n\n'],
      },
      {
        text: this.datosEnvio[0].aprobador,
        style: 'textDato', alignment:'center'
      },
      {
        text: 'JEFE DE UNIDAD\n' + this.datosEnvio[0].nombre_ue,
        style: 'subheader', alignment: 'center', bold:true
      },
        
      {
        text: [
          '\n\n\n\n\n\n\ncc:Arch:',
        ],
        style: 'footerText'
      },

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
        fontSize: 9,
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



// INFORME ACTIVIDADES PREVIAS FISCAL
async generateInformeFISCAL(obra: number): Promise<Buffer> {
    
    const res = await this.datosReporteEnvio(obra);
    if (!res || (Array.isArray(res) && res.length === 0) || (typeof res === 'object' && Object.keys(res).length === 0)) {
      throw new Error('No se encontraron datos para la obra.');
    }
  
    this.datosEnvio = res;
    const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
    const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
    const imgPath = 'assets/images/membretado_carta.png';

    const documentDefinition = {
      pageSize: 'LETTER' as any,
      background: function(currentPage: any, pageSize: any) { 
        return {
            image: imgPath, 
            width: pageSize.width, 
            height: pageSize.height,
            absolutePosition: {x: 0, y: 0}
              } },
      
      header: {
        columns: [      
        ],
      } as any,
      content: [
        {
          text: '\n\n\n\n\n\nINFORME\n',
          style: 'header', alignment: 'center'
        } as any,
        {
          text: this.datosEnvio[0].cod_carpeta + '-' + this.datosEnvio[0].descpermisodetalle + '-' + 'XX\n\n',
      style: 'subheader', alignment: 'center'
        },
        {
          table: {
            widths: ['15%', '85%'],
            body: [
              [
                { text: 'A:', style: 'textTitulo', margin: [0, 5, 0, 5], alignment:'right' },
                { 
                  text: [
                    { text: this.datosEnvio[0].cod_carpeta + '\n', style: 'textDato' },
                    { text: 'DIRECTOR DE FISCALIZACION DE OBRAS', style: 'textTitulo' }
                  ],
                  margin: [0, 5, 0, 5] 
                },
              ],
              [
                { text: 'VIA:', style: 'textTitulo', margin: [0, 5, 0, 5], alignment:'right' },
                { 
                  text:[
                    {text: this.datosEnvio[0].desc_carpeta + '\n', style: 'textDato' },
                    {text: 'JEFE DE UNIDAD', style: 'textTitulo', }
                  ],
                  margin: [0, 5, 0, 5] 
                },
              ],
              [
                { text: 'DE:', style: 'textTitulo', margin: [0, 5, 0, 5], alignment:'right' },
                { 
                  text:[
                    {text: this.datosEnvio[0].desc_carpeta + '\n', style: 'textDato' },
                    {text: 'FISCAL(ES) DE OBRA', style: 'textTitulo', }
                  ], 
                  margin: [0, 5, 0, 5] 
                },
              ],
              [
                { text: 'REF:', style: 'textTitulo', margin: [0, 5, 0, 5], alignment:'right' },
                { 
                  text: 'INFORME DE ACTIVIDADES PREVIAS', 
                  style: 'textTitulo', 
                  margin: [0, 5, 0, 5] 
                },
              ],
              [
                { text: 'FECHA:', style: 'textTitulo', margin: [0, 5, 0, 5], alignment:'right' },
                { 
                  text: `${this.datosEnvio[0].total_carpeta}`, 
                  style: 'textDato', 
                  margin: [0, 5, 0, 5] 
                },
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
          text: 'Señor Director:\n\n'+
          'En atención a INFORME DE SUPERVISIÓN OBN-649-2024-ISUP-1' + 
          ' con referencia: INFORME INICIAL DE REVISIÓN DEL PROYECTO, emitido por la supervisión y en cumplimiento del ARTICULO referido a “ACTIVIDADES DE LA FISCALIZACIÓN PREVIAS AL INICIO DE OBRA EN LAS MODALIDADES DE LICITACIÓN PUBLICA, APOYO NACIONAL A LA PRODUCCIÓN Y EMPLEO, DIRECTA, POR EXCEPCIÓN Y CON FINANCIAMIENTO EXTERNO DONACIÓN” del REGLAMENTO DE SUPERVISIÓN Y FISCALIZACIÓN DE OBRA (RSFO), se emite el presente informe: \n\n',
          style: 'textDato', alignment: 'justify'
        },
        {
          text: '1. DATOS DEL PROYECTO\n\n',
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
                { text: [{ text: 'Bs.' + this.datosEnvio[0].total_carpeta + '\n', style: 'textDato' }] }
              ],

              [
                { text: [{ text: 'FECHA VALIDACIÓN DEL PROYECTO:\n', style: 'textTitulo', alignment: 'right' },], fillColor: '#f0f0f0' },
                { text: [{ text: this.fechaString(this.datosEnvio[0].fecha_validacion_carpeta) + '\n\n', style: 'textDato' }], fillColor: '#f0f0f0' }
              ]
            ]
          },
          //layout: 'noBorders'
        },
        {
          text: '\n2. ANÁLISIS\n',
          style: 'subheader',
        },
        {
            text: '\nEl INFORME DE SUPERVISIÓN OBN-649-2024-ISUP-1'+
            ' con referencia: INFORME INICIAL DE REVISIÓN DEL PROYECTO, emitido por la supervisión,'+
            ' de fecha 25 de julio de 2024, establece:\n\n',
            style: 'textDato', alignment:'justify'
        }, 
        {
          text: 'I N F O R M E - S  U P E R V I S O R  ',
          style: 'textDato', alignment:'justify'
        },    
        {
            text: '\n- La obra ' + 'SI' + ' cuenta con óbice para proseguir con los procesos correspondientes.\n',
            style: 'textDato',
        },
        {
            text: 'TEXTO SI LA RESPUESTA ES POSITIVA',
            style: 'textDato', alignment:'justify'
        },
            
        {
            text: '\n- La obra ' + 'SI' + ' requiere coordinación con la Unidad Ejecutora\n',
            style: 'textDato',
        },
        {

            text: 'TEXTO SI LA RESPUESTA ES POSITIVA',
            style: 'textDato', alignment:'justify'
        },

        {
            text: '\n- La obra ' + 'SI ' + 'requiere coordinación con el Sistema de Regulación Municipal (SIREMU).\n',
            style: 'textDato',
        },
        {
            text: 'TEXTO SI LA RESPUESTA ES POSITIVA',
            style: 'textDato', alignment:'justify'
        },
        {
          text:'\n\n\n\n\n\n\n\n',
        },

        {
          text: '\n 3. CONCLUSIONES\n',
          style: 'subheader',
        },
        {
          text: '\nEn cumplimiento al Reglamento de Supervisión y Fiscalización de Obras y conforme a evaluación del Informe Inicial de Revisión del Proyecto emitido por la Supervisión se concluye'+ 
          'que SI/NO requiere trabajos previos para el inicio de la obra.\n',
          style: 'textDato', alignment:'justify'
        },

        {
          text: '\n 4. RECOMENDACIÓN\n',
          style: 'subheader', 
        },
        {
          text: '\nSe recomienda la remisión del presente informe a la Unidad Ejecutora para que dicha instancia tome las acciones que correspondan conforme el Reglamento de Supervisión y Fiscalización de Obras.\n'
            + '\nEs cuanto afirmo para los fines consiguientes.\n',
          style: 'textDato', alignment:'justify'
        },
        {
          text: ['\n\n'],
        }, 
        {
            table: {
              widths: ['*','*'], 
                 body: [
                    [
                      { text: '\n\n\n\nFISCAL', style: 'textDato', alignment: 'center', bold: true },
                      { text: '\n\n\n\nFirma y Sello', style: 'textDato', alignment: 'center' },
                    ],
                 ]
            }
        },
        {
          text: [
            '\n\n\n\n\nCc arch DFO \nCC PIUM \n',
          ],
          style: 'footerText'
        },

      ],

      footer: function(currentPage: { toString: () => string; }, pageCount: string) 
      { 
        return {
          columns:[
              { text: currentPage.toString() + ' de ' + pageCount , alignment: 'right', style: 'footerText', margin: [0,0,30,0]} 
                  ]
          }            
      } as any,

      styles: {
        header: {
          fontSize: 16,
          bold: true,
        },
        subheader: {
          fontSize: 10,
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
        bold: {
            bold: true,
            fontSize: 10, // Ajusta el tamaño según sea necesario
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
    

  //FUNCIONES PARA CONSTRUIR 
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

}
