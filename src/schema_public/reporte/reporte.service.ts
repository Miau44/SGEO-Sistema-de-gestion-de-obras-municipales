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
export class ReportService {
  datos: any = [];
  datosEnvio: any = [];  
  constructor(
    private readonly responseService: ResponseService,
    @Inject(Sequelize) private sequelize: Sequelize, // Inyecta Sequelize correctamente
  ) { this.printer = new PdfPrinter(fonts); }

  private readonly printer = new PdfPrinter(fonts);
  private getImageBase64(imagePath: string): string {
    const image = fs.readFileSync(imagePath);
    return image.toString('base64');
  }


  async datosGeneralesReporte(gestion: number, id: number) {
    const query1 = ` SELECT * FROM sp_reporte_memorandum(${gestion},${id})`;
    //const response = await sequelize.query(query);
    const resultado = await this.sequelize.query(query1);
    return resultado[0];
  }


  async datosReporteEnvio(obra: number) {
    const query1 = ` SELECT *
    FROM  tipo_documento as td
    INNER JOIN (SELECT id_subtipo, desc_subtipo FROM parametrica WHERE id_tipo=11 ) sub ON td.id_subtipo_documento = sub.id_subtipo
	LEFT OUTER JOIN documento as d ON td.id_tipo_documento=d.id_tipo_documento
	INNER JOIN obra  as o ON  d.id_obra = o.id_obra
	INNER JOIN ficha as f ON o.id_ficha= f.id_ficha  
	WHERE  d.id_obra = ${obra} AND 
  id_etapa_documento =1 AND id_subtipo_documento =108
    ORDER BY td.id_tipo_documento ASC;	`;
    const values = [obra]

    const resultado = await this.sequelize.query(query1);
    return resultado[0];
  }
  	
//SOLICITUD DE DESIGNACION 
  async generatePdf(gestion:number, id:number): Promise<Buffer> {
    const res = await this.datosGeneralesReporte(gestion, id);
    if (!res || (Array.isArray(res) && res.length === 0) || (typeof res === 'object' && Object.keys(res).length === 0)) {
      throw new Error('No se encontraron datos para la gestión y el ID proporcionados.');
    } 
    this.datos = res;
    console.log("Generar, ", res);
    console.log("Generar, ", this.datos);
    console.log("Generar, ", this.datos.codcarpeta);
    console.log("Generarcodcarpeta, ", this.datos[0].codcarpeta);
    console.log("Generar, ", this.datos.zonacarpeta);

    const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
    const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
    //const imgUrl = 'http://localhost:3009/images/logo.png';  // Cambia la URL según tu configuración
    const imgPath = 'assets/images/logo_gamlp.png';
   // const imgPath = 'assets/images/logo_gamlp.png';

    const documentDefinition = {
      pageSize: 'LETTER' as any,
      watermark: { text: 'SGEO', color: 'blue', opacity: 0.1, bold: true, italics: false },
      
   
      header: {
        columns: [
          { image: imgPath, width: 120},  // Uso de la ruta de imagen directamente          
       //   { image: `data:image/png;base64,${this.getImageBase64(headerImage)}`, width: 100 },
          //{ text: 'Título en Rojo', style: 'coloredText', alignment: 'left' }
           { text: 'Secretaría Municipal de Infraestructura Pública', style: 'coloredText', alignment: 'left' },
         // { text: '\nInfraestructura Pública', style: 'coloredTextgray', alignment: 'left' }

          
        ],
        margin: [40, 10]
      } as any,
      content: [

        {
          text: '\n\n\n\n\FORMULARIO DE SOLICITUD DE ' + this.datos[0].descpermiso + '.\n',
          style: 'header', alignment: 'center'
        } as any,
        {
          text: this.datos[0].codcarpeta + '-' + this.datos[0].descpermisodetalle + '-' + this.datos[0].correlativomemo + '\n\n\n\n',
          style: 'subheader', alignment: 'center'
        },
        {
          text: 'DATOS DE PROYECTO. \n\n',
          style: 'subheader',
        },
        {
          table: {
            widths: ['*', 400],
            body: [
              [
                { text: [{ text: 'CÓDIGO:', style: 'textTitulo' },], fillColor: '#dddddd', border: [false, true, false, false] },
                { text: [{ text: this.datos[0].codcarpeta, style: 'textDato' }], fillColor: '#dddddd', border: [false, true, false, false] }
              ],

              [
                { text: [{ text: 'OBRA:', style: 'textTitulo' },] },
                { text: [{ text: this.datos[0].desccarpeta, style: 'textDato' }] }
              ],
              [
                { text: [{ text: 'ZONA:', style: 'textTitulo' },], fillColor: '#dddddd' },
                { text: [{ text: this.datos[0].zonacarpeta, style: 'textDato' }], fillColor: '#dddddd' }
              ],
              [
                { text: [{ text: 'MONTO DEL PROYECTO:\n', style: 'textTitulo' },] },
                { text: [{ text: this.datos[0].totalcarpeta + '\n', style: 'textDato' }] }
              ],

            ]
          },
          // fontSize: 9, bold: true,
          layout: 'noBorders'
        },
        {
          table: {
            widths: ['*', 300],
            body: [
              [
                { text: [{ text: 'MODALIDAD DE CONTRATACIÓN:', style: 'textTitulo' },], fillColor: '#dddddd' },
                { text: [{ text: this.datos[0].modalidads, style: 'textDato' }], fillColor: '#dddddd' }
              ],

              [
                { text: [{ text: 'FECHA DE VALIDADCIÓN DE CARPETA:\n\n\n\n', style: 'textTitulo' },] },
                { text: [{ text: this.fechaString(this.datos[0].fechavalcarpeta) + '\n\n\n\n', style: 'textDato' }] }
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
                { text: [{ text: '\n', style: 'textTitulo' },] },
                { text: [{ text: '\n', style: 'textDato' }], }
              ], [
                { text: [{ text: '\n', style: 'textTitulo' },] },
                { text: [{ text: '\n', style: 'textDato' }], }
              ],


            ]
          },
          layout: 'lightHorizontalLines'
        },

        {
          table: {
            widths: ['*', '*', '*'],
            body: [
              [
                { text: [{ text: 'CUANTIA:', style: 'textTitulo' },], fillColor: '#dddddd' },
                { text: [{ text: 'TIPO DE OBRA', style: 'textTitulo' }], fillColor: '#dddddd' },
                { text: [{ text: 'FECHA DE SOLICITUD:', style: 'textTitulo' },], fillColor: '#dddddd' },

              ],

              [
                { text: [{ text: this.datos[0].totalcarpeta + '\n\n', style: 'textDato' }] },
                { text: [{ text: this.datos[0].tipoobra + ':\n\n', style: 'textDato' },] },
                { text: [{ text: this.fechaString(this.datos[0].fecharegistro) + '\n\n', style: 'textDato' }] }
              ],
              [
                { text: [{ text: this.datos[0].descpermiso + ' SUGERIDO:', style: 'textTitulo' },], fillColor: '#dddddd' },
                { text: [{ text: 'UNIDAD EJECUTORA', style: 'textTitulo' }], colSpan: 2, fillColor: '#dddddd' },


              ],

              [
                { text: [{ text: this.datos[0].nombre + ' ' + this.datos[0].primerapellido + ' ' + this.datos[0].segundoapellido + '\n', style: 'textDato' }] },
                { text: [{ text: this.datos[0].nombreda + ':\n', style: 'textDato' },], colSpan: 2 },

              ]

            ]
          },
          layout: 'noBorders'
        },


        {
          text: [
            '\n\n\n\n\n\n\nSolicitante:Jose Perez:' + '\n' + 'RPC/RPA',
          ],
          style: 'subheader', alignment: 'center'
        },


        {
          text: [
            '\n\n\n\n\n\n\ncc:Arch:', 
          ],
          style: 'footerText'
        },

      ],

    /*  footer: {
        columns: [
      //    { qr: 'Texto o URL para el QR', fit: 100, alignment: 'center' }, // QR Code en el pie de página
          { image: `data:image/png;base64,${this.getImageBase64(footerImage)}`, width: 100, alignment: 'right' }
        ],
        margin: [40, 10]
      } as any,*/

      styles: {
        header: {
          fontSize: 14,
          bold: true,
        },
        subheader: {
          fontSize: 12,
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
          fontSize: 10,
          bold: true,
        },
        textDato: {
          fontSize: 10,
          bold: false,
          //color: 'gray', 
          opacity: 0.8,
        },


      },

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

//GENERAR MEMORANDUM 
 async generateMemo(gestion:number, id:number): Promise<Buffer> {
  const res = await this.datosGeneralesReporte(gestion, id);
  if (!res || (Array.isArray(res) && res.length === 0) || (typeof res === 'object' && Object.keys(res).length === 0)) {
    throw new Error('No se encontraron datos para la gestión y el ID proporcionados.');
  }   

  this.datos = res;

  const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
  const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
  const imgPath = 'assets/images/logo.png';
  const documentDefinition = {
    pageSize: 'LETTER' as any,
    watermark: { text: 'SGEO', color: 'blue', opacity: 0.1, bold: true, italics: false },

    header: {
      columns: [
        //{ image: `data:image/png;base64,${this.getImageBase64(headerImage)}`, width: 100 },
        { image: imgPath, width: 150 },  // Uso de la ruta de imagen directamente          

        //{ text: 'Título en Rojo', style: 'coloredText', alignment: 'left' }
             { text: 'Secretaría Municipal de Infraestructura Pública', style: 'coloredText', alignment: 'left' },
       // { text: '\nInfraestructura Pública', style: 'coloredTextgray', alignment: 'left' }          
      ],
      margin: [40, 10]
    } as any,
    content: [

      {
        text: '\n\n\n\n\M E M O R Á N D U M.\n',
        style: 'header0', alignment: 'center'
      } as any,
      {
        text: this.datos[0].codcarpeta + '-' + this.datos[0].descpermisodetalle + '-' + this.datos[0].correlativomemo + '\n\n\n\n',
        style: 'subheader11', alignment: 'center'
      },
      {
        alignment: 'center',
        columns: [
          {
            text: 'GOBIERNO AUTÓNOMO MUNICIPAL DE LA PAZ\n La Paz, ' + this.fechaString(this.datos[0].fechamodificacion), style: 'subheader11'
          },
          {
            text: 'Señor(a).\n' + this.datos[0].profesiondetalle +' '+ this.datos[0].nombre +' '+ this.datos[0].primerapellido +' '+ this.datos[0].segundoapellido+  '\nPresente.- ',  style: 'subheader11'
          }
        ]
      },   
      
      {
        table: {
          widths: ['*', 330],
          body: [
            [
              { text: [{ text: '\n', style: 'textTitulo' },] },
              { text: [{ text: '\n', style: 'textDato' }], }
            ], [
              { text: [{ text: '\n', style: 'textTitulo' },] },
              { text: [{ text: '\n', style: 'textDato' }], }
            ],


          ]
        },
        layout: 'lightHorizontalLines'
      },      
      {
        text: 'REF: DESIGNACIÓN DE ' + this.datos[0].descpermiso +' DE OBRA. \n\n',
        style: 'subheader', alignment:'center'
      },
     
//TEXTO
   
      {
        table: {
          widths: ['*', 400],
          body: [
            [
              { text: [{ text: 'OBRA:', style: 'textTitulo',alignment: 'right' },], fillColor: '#dddddd' },
              { text: [{ text: this.datos[0].desccarpeta, style: 'textDato', alignment: 'left' }], fillColor: '#dddddd' }
            ],

            [
              { text: [{ text: 'CÓDIGO:\n', style: 'textTitulo', alignment: 'right' },] },
              { text: [{ text: this.datos[0].codcarpeta +'\n', style: 'textDato' }] }
            ],
            [
              { text: [{ text: 'ZONA:\n', style: 'textTitulo', alignment: 'right' },], fillColor: '#dddddd'},
              { text: [{ text: this.datos[0].zonacarpeta+ '', style: 'textDato' }], fillColor: '#dddddd' }
            ]
          ]
        },
        layout: 'noBorders'
      },


      {
        text: '\n\n\nSeñor(a):\n En atención a la solicitud de la Unidad Ejecutora, se comunica a usted que la '+this.datos[0].nombreue + ' ha dispuesto designarlo(a) ' + this.datos[0].descpermiso +' (a) de la obra '+  this.datos[0].desccarpeta+'.\n\nPara el efecto, a partir de la fecha deberá cumplir con las funciones y responsabilidades definidas en el Reglamento de Supervisión y Fiscalización de Obras del GAMLP, Código de Ética y Reglamento Interno de Personal del GAMLP.\n\n Seguro de que su capacidad y alto espíritu de trabajo sean puestos a favor de nuestro Municipio, aprovecho la oportunidad para desearle éxitos en el desempeño de sus funciones.' ,
        style: 'textDato', alignment:'justify'
      },

      {
        text: 
          '\n\n\n\n\nDIRECTOR(A) ' + this.datos[0].aprobador ,        
        style: 'textDato', alignment: 'center'
      },
        {
        text: 
           this.datos[0].nombreue ,        
        style: 'textTitulo', alignment: 'center'
      },


      {
        text: [
          '\n\n\n\n\n\n\ncc:Arch:', 
        ],
        style: 'footerText'
      },

    ],

  /*  footer: {
      columns: [
    //    { qr: 'Texto o URL para el QR', fit: 100, alignment: 'center' }, // QR Code en el pie de página
        { image: `data:image/png;base64,${this.getImageBase64(footerImage)}`, width: 100, alignment: 'right' }
      ],
      margin: [40, 10]
    } as any,*/

    styles: {
      header0: {
        fontSize: 16,
        bold: true,
      },
      header: {
        fontSize: 14,
        bold: true,
      },
      subheader: {
        fontSize: 12,
        bold: true,
      },
      subheader11: {
        fontSize: 11,
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
        fontSize: 10,
        bold: true,
      },
      textDato: {
        fontSize: 10,
        bold: false,
        //color: 'gray', 
        opacity: 0.8,
      },

      textDato12: {
        fontSize: 12,
        bold: false,
        //color: 'gray', 
        opacity: 0.8,
      },

      
      textDatoNormal11: {
        fontSize: 11,
        bold: false,
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


async generateMemoReemplazo(gestion:number, id:number): Promise<Buffer> {
  const res = await this.datosGeneralesReporte(gestion, id);

  if (!res || (Array.isArray(res) && res.length === 0) || (typeof res === 'object' && Object.keys(res).length === 0)) {
    throw new Error('No se encontraron datos para la gestión y el ID proporcionados.');
  }  
  this.datos = res;

  const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
  const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');

  const documentDefinition = {
    pageSize: 'LETTER' as any,
    watermark: { text: 'SGEO', color: 'blue', opacity: 0.1, bold: true, italics: false },

    header: {
      columns: [
        { image: `data:image/png;base64,${this.getImageBase64(headerImage)}`, width: 100 },
        //{ text: 'Título en Rojo', style: 'coloredText', alignment: 'left' }
             { text: 'Secretaría Municipal de Infraestructura Pública', style: 'coloredText', alignment: 'left' },
       // { text: '\nInfraestructura Pública', style: 'coloredTextgray', alignment: 'left' }          
      ],
      margin: [40, 10]
    } as any,
    content: [

      {
        text: '\n\n\n\n\M E M O R Á N D U M.\n',
        style: 'header0', alignment: 'center'
      } as any,
      {
        text: this.datos[0].codcarpeta + '-' + this.datos[0].descpermisodetalle + '-' + this.datos[0].correlativomemo + '\n\n\n\n',
        style: 'subheader11', alignment: 'center'
      },
      {
        alignment: 'center',
        columns: [
          {
            text: 'GOBIERNO AUTÓNOMO MUNICIPAL DE LA PAZ\nFECHA: La Paz, ' + this.fechaString(this.datos[0].fechamodificacion), style: 'subheader11'
          },
          {
            text: 'Señor(a).\n' + this.datos[0].profesiondetalle +' '+ this.datos[0].nombre +' '+ this.datos[0].primerapellido +' '+ this.datos[0].segundoapellido+  '\nPresente.- ',  style: 'subheader11'
          }
        ]
      },   
      
      {
        table: {
          widths: ['*', 330],
          body: [
            [
              { text: [{ text: '\n', style: 'textTitulo' },] },
              { text: [{ text: '\n', style: 'textDato' }], }
            ], [
              { text: [{ text: '\n', style: 'textTitulo' },] },
              { text: [{ text: '\n', style: 'textDato' }], }
            ],


          ]
        },
        layout: 'lightHorizontalLines'
      },      
      {
        text: 'REF: DESIGNACIÓN DE ' + this.datos[0].descpermiso +' DE OBRA. \n\n',
        style: 'subheader', alignment:'center'
      },
     
//TEXTO
   
      {
        table: {
          widths: ['*', 400],
          body: [
            [
              { text: [{ text: 'OBRA:', style: 'textTitulo',alignment: 'right' },], fillColor: '#dddddd' },
              { text: [{ text: this.datos[0].desccarpeta, style: 'textDato', alignment: 'left' }], fillColor: '#dddddd' }
            ],

            [
              { text: [{ text: 'CÓDIGO:\n', style: 'textTitulo', alignment: 'right' },] },
              { text: [{ text: this.datos[0].codcarpeta +'\n', style: 'textDato' }] }
            ],
            [
              { text: [{ text: 'ZONA:\n', style: 'textTitulo', alignment: 'right' },], fillColor: '#dddddd'},
              { text: [{ text: this.datos[0].zonacarpeta+ '', style: 'textDato' }], fillColor: '#dddddd' }
            ]
          ]
        },
        layout: 'noBorders'
      },


      {
        text: '\n\n\nSeñor(a):\n Mediante la presente se comunica a usted que la Dirección de Ejecución y Supervisión de Infraestructuras Especiales/'+this.datos[0].nombreda + ' ha dispuesto designarlo(a) a partir de la fecha ' + this.datos[0].descpermiso +' (a) de la obra '+  this.datos[0].desccarpeta+'.\n\n En reemplazo de (él/la) profesional '+ this.datos[0].personaareemplazar+', medida asumida con el fin de dar continuidad a los trabajos de la obra. Para el efecto, a partir de la fecha deberá cumplir con las funciones y responsabilidades definidas en el Reglamento de Supervisión y Fiscalización de Obras del GAMLP, Código de Ética y Reglamento Interno de Personal del GAMLP.\n\n Seguro de que su capacidad y alto espíritu de trabajo sean puestos a favor de nuestro Municipio, aprovecho la oportunidad para desearle éxitos en el desempeño de sus funciones.' ,
        style: 'textDato', alignment:'justify'
      },

      {
        text: [
          '\n\n\n\n\nDIRECTOR DE SUPERVISIÓN DE OBRAS' + '\n' + 'UNIDAD EJECUTORA',
        ],
        style: 'subheader', alignment: 'center'
      },


      {
        text: [
          '\n\n\n\n\n\n\ncc:Arch:', 
        ],
        style: 'footerText'
      },

    ],

  /*  footer: {
      columns: [
    //    { qr: 'Texto o URL para el QR', fit: 100, alignment: 'center' }, // QR Code en el pie de página
        { image: `data:image/png;base64,${this.getImageBase64(footerImage)}`, width: 100, alignment: 'right' }
      ],
      margin: [40, 10]
    } as any,*/

    styles: {
      header0: {
        fontSize: 16,
        bold: true,
      },
      header: {
        fontSize: 14,
        bold: true,
      },
      subheader: {
        fontSize: 12,
        bold: true,
      },
      subheader11: {
        fontSize: 11,
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
        fontSize: 10,
        bold: true,
      },
      textDato: {
        fontSize: 10,
        bold: false,
        //color: 'gray', 
        opacity: 0.8,
      },

      textDato12: {
        fontSize: 12,
        bold: false,
        //color: 'gray', 
        opacity: 0.8,
      },

      
      textDatoNormal11: {
        fontSize: 11,
        bold: false,
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




//INFORME INICIAL SUPERVISOR 
async generateInformeInicial(obra:number): Promise<Buffer> {
    
  const res = await this.datosReporteEnvio(obra);
  if (!res || (Array.isArray(res) && res.length === 0) || (typeof res === 'object' && Object.keys(res).length === 0)) {
    throw new Error('No se encontraron datos para la obra y el ID proporcionados.');
  } 
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
        text: '\n\n\n\n\INFORME DE SUPERVISIÓN.\n\n\n\n',
        style: 'header', alignment: 'center'
      } as any,
     
      {
        text: 'DATOS DE PROYECTO. \n\n',
        style: 'subheader',
      },

  
      {
        text: [
          '\n\n\n\n\n\n\nSolicitante:Jose Perez:' + '\n' + 'RPC/RPA',
        ],
        style: 'subheader', alignment: 'center'
      },


      {
        text: [
          '\n\n\n\n\n\n\ncc:Arch:', 
        ],
        style: 'footerText'
      },

    ],


    styles: {
      header: {
        fontSize: 14,
        bold: true,
      },
      subheader: {
        fontSize: 12,
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
        fontSize: 10,
        bold: true,
      },
      textDato: {
        fontSize: 10,
        bold: false,
        //color: 'gray', 
        opacity: 0.8,
      },


    },

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

//FORMULARIO DE ENVIO DE DOCUMENTACION 
async generateEnvioDoc(obra:number): Promise<Buffer> {
    
  const res = await this.datosReporteEnvio(obra);
  if (!res || (Array.isArray(res) && res.length === 0) || (typeof res === 'object' && Object.keys(res).length === 0)) {
    throw new Error('No se encontraron datos para la obra y el ID proporcionados.');
  } 
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
        text: '\n\n\n\n\FORMULARIO DE ENVÍO DE DOCUMENTACIÓN\n DEL PROYECTO.\n\n\n\n',
        style: 'header', alignment: 'center'
      } as any,
     
      {
        text: 'DATOS DE PROYECTO. \n\n',
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
              { text: [{ text:this.datosEnvio[0].desc_carpeta + '\n', style: 'textDato' }] }
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
              { text: [{ text: 'FECHA DE VALIDACIÓN DEL PROYECTO:\n', style: 'textTitulo' },]  },
              { text: [{ text: this.fechaString(this.datosEnvio[0].fecha_validacion_carpeta) + '\n\n\n\n', style: 'textDato' }] }
            ]



          ]
        },
        layout: 'noBorders'
      },

      {
        table: {
          widths: [100,'*',100],
          body: [
            [
              { text: [{ text: 'Nº:', style: 'textTitulo' },], fillColor: '#dddddd'},
              { text: [{ text: 'DOCUMENTO:', style: 'textTitulo' },], fillColor: '#dddddd' },
              { text: [{ text: 'ADJUNTO:', style: 'textTitulo' },] , fillColor: '#dddddd'},

            ],
            ...this.buildItems(this.datosEnvio)            
          ]
        },
      },
   
      {
        text: [
          '\n\n\n\n\n\n\nSolicitante:Jose Perez:' + '\n' + 'RPC/RPA',
        ],
        style: 'subheader', alignment: 'center'
      },


      {
        text: [
          '\n\n\n\n\n\n\ncc:Arch:', 
        ],
        style: 'footerText'
      },

    ],


    styles: {
      header: {
        fontSize: 14,
        bold: true,
      },
      subheader: {
        fontSize: 12,
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
        fontSize: 10,
        bold: true,
      },
      textDato: {
        fontSize: 10,
        bold: false,
        //color: 'gray', 
        opacity: 0.8,
      },


    },

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


buildItems(data: any) {
  let datosResp = data; 
  let arrayData = [];

  var c =0;
  for (let i = 0; i < datosResp.length; i++) {
   c= c+1;
    let rowData = [
      { text: [{ text: c, style: 'textDato' }]},
      { text: [{ text: datosResp[i].desc_tipo_documento, style: 'textDato' }]  },
      { text: [{ text: datosResp[i].cumple  ?'SI':'NO'  , style: 'textDato' }]  },
    ];
    arrayData.push(rowData);

  }
  return arrayData;
}


}
