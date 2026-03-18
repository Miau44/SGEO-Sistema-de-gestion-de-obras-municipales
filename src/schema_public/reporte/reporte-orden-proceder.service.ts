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
export class ReporteOrdenProcederService {

    datos: any = [];
    datosEnvio: any = [];
    datosDoc: any = [];
    datosPreguntaInforme: any = [];
    datosPreguntaInformeRestante: any = [];
    datosSup: any = [];
    datosJU: any = [];
    datosInfIni: any = [];
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
  // Datos generales obra - contrato - OP
  async datosGeneralesReporteOP(obra: number) {
    const query1 = `
        SELECT * 
        FROM public.vista_datos_op WHERE id_obra = ${obra}`;
    const resultado = await this.sequelize.query(query1);
    return resultado[0];
  }

   // SUPERVISORES designados por obra - OP
   async supervisorDesignado(obra: number) {
    const query1 = `
        SELECT * 
        FROM public.vista_supervisores_obra WHERE id_obra = ${obra}`;
    const resultado = await this.sequelize.query(query1);
    return resultado[0];
   }

    // JEFE UNIDAD por obra 
   async jefeUnidad(obra: number) {
    const query4 = `
        SELECT * 
        FROM public."vista_reporte_jefeUnidad_Obra" WHERE id_obra = ${obra}`;
    const resultado4 = await this.sequelize.query(query4);
    return resultado4[0];
   }

   // Datos Informe Inicial
  async datosInformeInicial(obra: number) {
    const query3 = `
        SELECT * 
        FROM public."vista_reporte_informe_inicial" WHERE id_obra = ${obra}`;
    const resultado3 = await this.sequelize.query(query3);
    return resultado3[0];
  }
  // //Datos tabla documentos SGEO
  // async datosReporteEnvio(obra: number) {
  //   const query1 = `SELECT distinct *, td.id_tipo_documento  
  //   FROM  tipo_documento as td
  //   INNER JOIN (SELECT id_subtipo, desc_subtipo FROM parametrica WHERE id_tipo=11 ) sub ON td.id_subtipo_documento = sub.id_subtipo
  //   LEFT OUTER JOIN documento as d ON td.id_tipo_documento=d.id_tipo_documento
  //   INNER JOIN obra  as o ON  d.id_obra = o.id_obra
  //   INNER JOIN ficha as f ON o.id_ficha= f.id_ficha  
  //   WHERE  d.id_obra = ${obra} AND id_etapa_documento =1 AND id_subtipo_documento =108 ORDER BY td.id_tipo_documento ASC;	`;
  //   const values = [obra]
  //   const resultado = await this.sequelize.query(query1);
  //   return resultado[0];
  // }

  //**Datos tablas documentos Contrato - Garantia */
  async datosTablasDocumentos(obra: number, tipo: number) {
    const query1 = `SELECT DISTINCT desc_tipo_documento, cumple, observacion,  td.id_tipo_documento    
    FROM  tipo_documento as td
    INNER JOIN (SELECT id_subtipo, desc_subtipo FROM parametrica WHERE id_tipo=11 ) sub ON td.id_subtipo_documento = sub.id_subtipo
    LEFT OUTER JOIN documento as d ON td.id_tipo_documento=d.id_tipo_documento 
    WHERE  d.id_obra = ${obra} AND id_etapa_documento =2 AND d.id_estado = 1 AND id_subtipo_documento = ${tipo} ORDER BY td.id_tipo_documento ASC;`;
    const values = [obra]
    const resultado = await this.sequelize.query(query1);
    return resultado[0];
  }

  private obtenerMembretadoCartaPorGestion(gestion: number | string): string {
    const gestionNum = Number(gestion);

    if (gestionNum === 2025) {
      return 'assets/images/membretado_carta.png';
    }
    return 'assets/images/membretado_carta_nuevo.png';
  }

  private obtenerMembretadoOficioPorGestion(gestion: number | string): string {
    const gestionNum = Number(gestion);

    if (gestionNum === 2025) {
      return 'assets/images/membretado_oficio.png';
    }
    return 'assets/images/membretado_oficio_nuevo.png';
  }

  
  // FORMULARIO DOCUMENTOS ETAPA II
  async generateDocumentoContrato(obra: number): Promise<Buffer> {

    //Recupera datos
    const res = await this.datosGeneralesReporteOP(obra);
    const resdoc1 = await this.datosTablasDocumentos(obra, 145);
    const resdoc2 = await this.datosTablasDocumentos(obra, 164);

    if ((!res || (Array.isArray(res) && res.length === 0) || (typeof res === 'object' && Object.keys(res).length === 0)) && (!resdoc1 || (Array.isArray(resdoc1) && resdoc1.length === 0) || (typeof resdoc1 === 'object' && Object.keys(resdoc1).length === 0)) ){
      throw new Error('No se encontraron datos para la obra seleccionada');
    }

    this.datosEnvio = res;
    this.datosDoc= resdoc1;
    this.datos = resdoc2;
    
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
      //ME watermark: { text: 'SGEO', color: 'blue', opacity: 0.1, bold: true, italics: false },

      header: {
        columns: [
          //ME { image: imgPath, width: 120 },

          // { image: `data:image/png;base64,${this.getImageBase64(headerImage)}`, width: 100 },
          //{ text: 'Título en Rojo', style: 'coloredText', alignment: 'left' }
          //ME { text: 'Secretaría Municipal de Infraestructura Pública', style: 'coloredText', alignment: 'left' },
          // { text: '\nInfraestructura Pública', style: 'coloredTextgray', alignment: 'left' }          
        ],
      } as any,
      content: [
        {
          text: '\n\n\n\n\n\n\nFORMULARIO DE ENVÍO DE DOCUMENTACIÓN\n DEL CONTRATO\n\n',
          style: 'header', alignment: 'center'
        } as any,
        {
          text: 'DATOS DEL PROYECTO: \n',
          style: 'subheader',
        },
        {
          table: { 
            widths: ['*', 400],
            body: [
              [
                { text: 'CÓDIGO:', style: 'textTitulo', fillColor: '#dddddd' },
                { text: this.datosEnvio[0].cod_carpeta, style: 'textDato', fillColor: '#dddddd' }
              ],
              [
                { text: 'OBRA:\n', style: 'textTitulo' },
                { text: this.datosEnvio[0].desc_carpeta + '\n', style: 'textDato' }
              ],
              [
                { text: 'ZONA:\n', style: 'textTitulo', fillColor: '#dddddd' },
                { text: this.datosEnvio[0].desc_zona_carpeta + '\n', style: 'textDato', fillColor: '#dddddd' }
              ],
              [
                { text: 'MONTO DE PROYECTO:\n', style: 'textTitulo' },
                { text: this.datosEnvio[0].total_carpeta + '\n', style: 'textDato' }
              ],
              [
                { text: 'FECHA DE VALIDACIÓN DEL PROYECTO:\n', style: 'textTitulo', fillColor: '#dddddd' },
                { text: this.fechaString(this.datosEnvio[0].fecha_validacion_carpeta) + '\n\n', style: 'textDato', fillColor: '#dddddd' }
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
          text: '\nSupervisión de Obra: \n\En cumplimiento al Reglamento de Supervisión y Fiscalización de Obras, toda vez que la obra cuenta con la supervisión designada, se remite el detalle de la documentación del proyecto para su revisión. \n\n',
          style: 'textDato', alignment: 'justify',
        },
        {
          table: {
            widths: [30, '*', 50, 100],
            body: [
              [
                { text: [{ text: 'Nº', style: 'textTitulo', alignment: 'center', },], fillColor: '#dddddd' },
                { text: [{ text: 'DOCUMENTO', style: 'textTitulo' },], fillColor: '#dddddd' },
                { text: [{ text: 'ADJUNTO', style: 'textTitulo', alignment: 'center', },], fillColor: '#dddddd' },
                { text: [{ text: 'OBSERVACIONES', style: 'textTitulo' },], fillColor: '#dddddd' },

              ],
              ...this.buildDocumentos(this.datosDoc)
            ]
          },
        },
        ['\n'],
        {
          table: {
            widths: [30, '*', 50, 100],
            body: [
              [
                { text: [{ text: 'Nº', style: 'textTitulo', alignment: 'center', },], fillColor: '#dddddd' },
                { text: [{ text: 'DOCUMENTO', style: 'textTitulo' },], fillColor: '#dddddd' },
                { text: [{ text: 'ADJUNTO', style: 'textTitulo', alignment: 'center', },], fillColor: '#dddddd' },
                { text: [{ text: 'OBSERVACIONES', style: 'textTitulo' },], fillColor: '#dddddd' },

              ],
              ...this.buildDocumentos(this.datos)
            ]
          },
        },
        {
          text: ['\n'],
        },
        {
          text: '* El presente formulario será considerado una declaración jurada, cuya validez y contenido son de entera responsabilidad del funcionario municipal que suscribe la presente, bajo sanción de las determinaciones establecidas en el Reglamento Interno de Personal del GAMLP, en caso de encontrarse incumplimientos e inconsistencias.\n'
            + '\n** Se remite una copia a la Fiscalización de Obra. \n\n',
          style: 'textDato', alignment:'justify'
        },
        {
          style: 'textDato',
          text: 'Fecha de Envío: '+ this.fechaString(this.datosEnvio[0].fecha_envio) + '\n\n',
        },
        {
          text: '\n\n\n'
        },
        {
          text: [
            { text: this.datosEnvio[0].a_nombre + '\n', style: 'textDato', alignment:'center'},
            { text: this.datosEnvio[0].a_cargo, style: 'subheader', alignment: 'center', bold:true},
            {}
          ]
        },
        {
          text: [
            '\n\n\n\n\ncc:Arch:',
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



// NOTA INSTRUCCION ORDEN DE PROCEDER
async generateInstruccionOrdenProceder(obra: number): Promise<Buffer> {

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

  const res3 = await this.datosInformeInicial(obra);
  if (!res3 || (Array.isArray(res3) && res3.length === 0) || (typeof res3 === 'object' && Object.keys(res3).length === 0)) {
      throw new Error('No se encontraron datos del Informe Inicial');
  }
  this.datosInfIni = res3;

  const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
  const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
  const imgPath = this.obtenerMembretadoCartaPorGestion(this.datosEnvio[0].gestion_carpeta);
  console.log('imgPath:',this.obtenerMembretadoCartaPorGestion(this.datosEnvio[0].gestion_carpeta));
 
    const documentDefinition = {
    pageSize: 'LETTER' as any,
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
              { text: 'La Paz, ' + this.fechaString(this.datosEnvio[0].fecha_instruccion_op) + '\n', style: 'textDato', alignment:'right' },
              { text: this.datosEnvio[0].cod_carpeta + '-RPC/RPA-1', style: 'textDato', bold:true,  alignment:'right'}
        ],
      },
      {
        text: '\n\n\n',
      },
      {
        text: [
                { text: this.datosInfIni[0].de_nombre + '\n', style: 'textDato'},
                { text: this.datosInfIni[0].de_cargo, style: 'textDato', bold: 'true'}
              ] 
      },
      {
        text: 'Presente.-',
        style: 'textDato', decoration: 'underline'
      },
      {
        text: '\nREF.: EMISION DE ORDEN DE PROCEDER', 
        style: 'titulo', alignment: 'center', decoration: 'underline'
      },
      {
        table: {
          widths: ['38%', '65%'],
          body: [
            [
              { text: 'OBRA:', style: 'textDato', alignment: 'right' },
              { text: this.datosEnvio[0].desc_carpeta, style: 'textDato', decoration: 'underline', bold: true }
            ],
            [
              { text: 'CODIGO:', style: 'textDato', alignment: 'right' },
              { text: this.datosEnvio[0].cod_carpeta, style: 'textDato', decoration: 'underline', bold: true }
            ],
            
          ]
        },
        layout: {
          defaultBorder: false,
        }
      },
      {
        text: '\n',
      },
      {
        text: [
          { text: 'De mi consideración:\n\n', style: 'textDato' },
          {
            text: 'En atención al informe de Supervisión ' + this.datosInfIni[0].cite + ' con referencia "INFORME INICIAL DE REVISIÓN DEL PROYECTO" ' + 
            'y el informe de Fiscalización ' + this.datosEnvio[0].cod_carpeta  + '-IFIS-1 con referencia "INFORME DE FISCALIZACIÓN PREVIO AL INICIO DE OBRA" correspondiente a la obra ' 
            + this.datosEnvio[0].cod_carpeta + ' ' + this.datosEnvio[0].desc_carpeta + ', en los que se establece que la obra cuenta con la documentación necesaria y no se requieren actividades previas al inicio de la obra.\n\n' ,
            style: 'textDato', alignment: 'justify', lineHeight: 1,
          },
          {
            text: 'En tal sentido, se instruye la emisión de la Orden de Proceder de la obra de referencia dentro de los plazos establecidos en la normativa vigente.\n\n',
            style: 'textDato', alignment: 'justify', lineHeight: 1,
          },
          {
            text: 'Sin otro particular, saludo a usted(es) con las consideraciones más distinguidas.\n\n',
            style: 'textDato', alignment: 'justify', lineHeight: 1,
          },
          {
            text: 'Atentamente,\n\n\n', 
            style: 'textDato', 
          },
        ],
        margin: [0, 0, 0, 20],
      },
      {
        text: '\n\n\n\n'
      },
      {
        text:
        [
          {
            text: '\n',
            style: 'textDato', alignment: 'center'
          },
          {
            text: 'RPC/RPA\n',
            style: 'textDato', bold:true, alignment: 'center'
          },
          {
            text: this.datosEnvio[0].nombre_da,
            style: 'textDato', bold:true, alignment: 'center'
          }
        ]
      },
      {
        text: ['\n\n\n\n\n\n\nCc. Arch.' ],
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
        opacity: 0.8,
      },
      footerText: {
        fontSize: 6,
        bold: false,          
      },
      textDato: {
        fontSize: 9,
        bold: false,
        //color: 'gray', 
        opacity: 0.8,
      },
    },
    pageMargins: [70, 130, 50, 40] as any, // Márgenes: izquierda, arriba, derecha, abajo

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


  
// INFORME SOLICITUD DE ANTICIPO
  async generateInformeSoliAnticipio(obra: number): Promise<Buffer> {

    const res = await this.datosGeneralesReporteOP(obra);
    if (!res || (Array.isArray(res) && res.length === 0) || (typeof res === 'object' && Object.keys(res).length === 0)) {
      throw new Error('No se encontraron datos para la obra proporcionada');
    }
    
    this.datosEnvio = res;
    const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
    const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
    const imgPath = 'assets/images/membretado_oficio.png';

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
      //watermark: { text: 'SGEO', color: 'blue', opacity: 0.1, bold: true, italics: false },

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
          text: 'INFORME\n',
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
                    { text: this.datosEnvio[0].cod_carpeta, style: 'textDato' },
                    { text: '\nJEFE DE SECCIÓN ADMINISTRATIVA FINANCIERA', style: 'textTitulo' }
                  ],
                  margin: [0, 5, 0, 5]
                },
              ],
              [ 
                { text: 'DE:', style: 'textTitulo', margin: [0, 5, 0, 5], alignment:'right' },
                { 
                  text: [
                    {text: this.datosEnvio[0].desc_carpeta, style: 'textDato'},
                    {text: '\nSUPERVISOR(ES) DE OBRA', style: 'textTitulo' }
                  ],
                  margin: [0, 5, 0, 5] 
                },
              ],
              [
                { text: 'REF.:', style: 'textTitulo', margin: [0, 5, 0, 5], alignment:'right' },
                { 
                  text: 'INFORME DE SOLICITUD DE PAGO DE ANTICIPO', 
                  style: 'textTitulo', margin: [0, 5, 0, 5] 
                },
              ],
              [
                { text: 'FECHA:', style: 'textTitulo', margin: [0, 5, 0, 5], alignment:'right' },
                { 
                  text: this.datosEnvio[0].fecha_modificacion, 
                  style: 'textDato', margin: [0, 5, 0, 5] 
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
          text: 'De mi consideración:\nEn el marco del contrato ' + this.datosEnvio[0].numero_contrato + '+ se emite el presente informe de solicitud de pago de anticipo a favor de la empresa ' +
                this.datosEnvio[0].proponente_razon_social + '.\n',
          style: 'textDato', alignment: 'justify'
        },
        {
          text: '\n 1. DATOS DE LA OBRA\n\n',
          style: 'subheader',
        },
        {
          table: {
            widths: [100, '*'],
            body: [
              [
                { text: [{ text: 'CÓDIGO:', style: 'textTitulo', alignment: 'right' },], fillColor: '#dddddd' },
                { text: [{ text: this.datosEnvio[0].cod_carpeta, style: 'textDato' }], fillColor: '#dddddd' }
              ],

              [
                { text: [{ text: 'OBRA:\n', style: 'textTitulo', alignment: 'right' },] },
                { text: [{ text: this.datosEnvio[0].desc_carpeta + '\n', style: 'textDato' }] }
              ],

              [
                { text: [{ text: 'ZONA:\n', style: 'textTitulo', alignment: 'right' },], fillColor: '#dddddd' },
                { text: [{ text: this.datosEnvio[0].desc_zona_carpeta + '\n', style: 'textDato' }], fillColor: '#dddddd' }
              ],

              [
                { text: [{ text: 'UNIDAD EJECUTORA:\n', style: 'textTitulo', alignment: 'right' },] },
                { text: [{ text: this.datosEnvio[0].nombre_ue + '\n', style: 'textDato' }] }
              ],

              [
                { text: [{ text: 'MONTO DE PROYECTO:\n', style: 'textTitulo', alignment: 'right' },], fillColor: '#dddddd' },
                { text: [{ text: this.datosEnvio[0].total_carpeta + '\n', style: 'textDato' }], fillColor: '#dddddd' }
              ],

              [
                { text: [{ text: 'FECHA DE VALIDACIÓN DEL PROYECTO:\n', style: 'textTitulo', alignment: 'right' },] },
                { text: [{ text: this.fechaString(this.datosEnvio[0].fecha_validacion_carpeta) + '\n\n', style: 'textDato' }] }
              ]
            ]
          },
          //layout: 'noBorders'
        },
        {
          text: '\n 2. ANTECEDENTES\n\n',
          style: 'subheader',
        },
        {
          table: {
            widths: [130, '*'],
            body: [
              [
                { text: [{ text: 'Número de Contrato:', style: 'textTitulo', alignment: 'right' },] },
                { text: [{ text: this.datosEnvio[0].numero_contrato, style: 'textDato' }] }
              ],

              [
                { text: [{ text: 'Monto de Contrato:\n', style: 'textTitulo', alignment: 'right' },] },
                { text: [{ text: this.datosEnvio[0].monto_contrato + '\n', style: 'textDato' }] }
              ],

              [
                { text: [{ text: 'Garantía Presentada:\n', style: 'textTitulo', alignment: 'right' },] },
                { text: [{ text: this.datosEnvio[0].desc_zona_carpeta + '\n', style: 'textDato' }] }
              ],

              [
                { text: [{ text: 'Monto de Cobertura de Garantía:\n', style: 'textTitulo', alignment: 'right' },] },
                { text: [{ text: this.datosEnvio[0].total_carpeta + '\n', style: 'textDato' }] }
              ],

              [
                { text: [{ text: 'Fecha fin vigencia de Garantía:\n', style: 'textTitulo', alignment: 'right' },] },
                { text: [{ text: this.fechaString(this.datosEnvio[0].fecha_validacion_carpeta) + '\n\n', style: 'textDato' }] }
              ]
            ]
          },
          layout: 'noBorders'
        },

        {
          text: '\n 3. ANÁLISIS\n',
          style: 'subheader',
        },
        {
          text: '\nDe acuerdo a la garantía presentada por la empresa ' + this.datosEnvio[0].proponente_razon_social + ', para la obra ' + this.datosEnvio[0].desc_carpeta + 
                ', la misma cumple las condicionantes requeridas en el contrato de obra por lo que corresponde el desembolso del anticipo por el monto ' +
                'de Bs.' + this.datosEnvio[0].monto_contrato + '(SETECIENTOS SESENTA MIL CIENTO CINCUENTA Y CINCO 26/100 BOLIVIANOS). \n',
          style: 'textDato', alignment: 'justify'
        },

        {
          text: '\n\n 4. CONCLUSIÓN\n',
          style: 'subheader',
        },
        {
          text: '\n- La garantía presentada por la empresa "' + this.datosEnvio[0].proponente_razon_social + '”, cumple con los requisitos establecidos en el contrato ' +
                this.datosEnvio[0].numero_contrato + ' referido al anticipo de la obra de referencia.\n'
            + '\n- El monto a desembolsar asciende a la suma de Bs.' + this.datosEnvio[0].total_carpeta + ' (SETECIENTOS SESENTA MIL CIENTO CINCUENTA Y CINCO 26/100 BOLIVIANOS).\n',
          style: 'textDato', alignment: 'justify'
        },
        {
          text: '\n 5. RECOMENDACÍON\n',
          style: 'subheader',
        },
        {
          text: '\nLa supervisión de obra recomienda la prosecución del presente trámite de acuerdo a lo expuesto.\n\n',
          style: 'textDato', alignment: 'justify'
        },
        {
          table: {
            widths: ['*', '*'], // Distribución equitativa entre las dos columnas
            body: [
              [
                {
                  text: 'ARQ. PAOLA ELFRIDE MUÑOZ ALMANZA\nSUPERVISOR',
                  style: 'textDato', alignment: 'center', bold: true, 
                  margin: [0, 25, 0, 0], // Márgenes internos
                },
                {
                  text: '(Firma y Sello)',
                  style: 'textDato', alignment: 'center',
                  margin: [0, 35, 0, 0],
                },
              ],
              [
                {
                  text: 'ING. WILFREDO LUIS ARI MERCADO\nSUPERVISOR',
                  style: 'textDato', alignment: 'center', bold: true,
                  margin: [0, 25, 0, 0],
                },
                {
                  text: '(Firma y Sello)',
                  style: 'textDato', alignment: 'center',
                  margin: [0, 35, 0, 0],
                },
              ],
            ],
          },
          layout: {
            hLineWidth: (i: number, node: any) => 1, // Grosor de las líneas horizontales
            vLineWidth: (i: number, node: any) => 1, // Grosor de las líneas verticales
            hLineColor: () => '#000000', // Color negro para las líneas
            vLineColor: () => '#000000',
            paddingLeft: () => 5, // Espaciado interno izquierdo
            paddingRight: () => 5, // Espaciado interno derecho
            paddingTop: () => 5, // Espaciado interno superior
            paddingBottom: () => 5, // Espaciado interno inferior
          },
        },

        {
          text: [
            '\n\n\n\n\nDOC. ADJUNTOS \nPlanilla de Pago de Anticipo \nGarantía de Anticipo\n',
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


      },
      pageMargins: [70, 180, 50, 140] as any, // Márgenes: izquierda, arriba, derecha, abajo

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

  

// MEMORANDUM ORDEN DE PROCEDER
  async generateOrdenProceder(obra: number): Promise<Buffer> {

    const res = await this.datosGeneralesReporteOP(obra);
    if (!res || (Array.isArray(res) && res.length === 0) || (typeof res === 'object' && Object.keys(res).length === 0)) {
      throw new Error('No se encontraron datos para la obra proporcionada');
    }
    this.datosEnvio = res;

    const resSup = await this.supervisorDesignado(obra);
    if (!resSup || (Array.isArray(resSup) && resSup.length === 0) || (typeof resSup === 'object' && Object.keys(resSup).length === 0)) {
      throw new Error('No se encontraron datos para la obra proporcionada');
    }
    this.datosSup = resSup;
   
    //console.log("DATOS, ", res);

    const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
    const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
    const imgPath = 'assets/images/membretado_carta.png';

    const documentDefinition = {
      pageSize: 'LETTER' as any,
      background: function (currentPage: any, pageSize: any) {
        return {
          image: imgPath,
          width: pageSize.width,
          height: pageSize.height,
          absolutePosition: { x: 0, y: 0 }
        }
      },
      //watermark: { text: 'SGEO', color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: {
        columns: [
          
          // { image: `data:image/png;base64,${this.getImageBase64(headerImage)}`, width: 100 },
          //{ text: 'Título en Rojo', style: 'coloredText', alignment: 'left' }
          //{ text: 'Secretaría Municipal de Infraestructura Pública', style: 'coloredText', alignment: 'left' },
          // { text: '\nInfraestructura Pública', style: 'coloredTextgray', alignment: 'left' }          
        ],

      } as any,
      content: [
        //TITULO MEMORANDUM
        {
          text: '\n\n\n\nMEMORANDUM',
          style: 'header', alignment: 'center',
        } as any,
       {
          text: this.datosEnvio[0].cod_carpeta + '-' + this.datosEnvio[0].cite_memo + '-' + '1',
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
                  text: 'La Paz, ' + this.fechaString(this.datosEnvio[0].fecha_memo), 
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
      // Referencia
        {
          text: '\n'
        } as any,
        {
          text: 'REF.: ORDEN DE PROCEDER', 
          style: 'coloredText', alignment: 'center', decoration: 'underline' 
        },
        {
          text: '\n'
        } as any,
        // Tabla resumen de obra
        {
          table: {
            widths: ['*', 350],
            body: [
              [
                { text: 'OBRA:\n', style: 'textTitulo', alignment: 'right', fillColor: '#dddddd' },
                { text: this.datosEnvio[0].desc_carpeta, style: 'textDato', fillColor: '#dddddd' }
              ],

              [
                { text: 'CÓDIGO:\n', style: 'textTitulo', alignment: 'right' },
                { text: this.datosEnvio[0].cod_carpeta + '\n', style: 'textDato', alignment: 'left-justify' }
              ],

              [
                { text: 'ZONA:\n', style: 'textTitulo', alignment: 'right', fillColor: '#dddddd' },
                { text: this.datosEnvio[0].desc_zona_carpeta + '', style: 'textDato', alignment: 'left-justify', fillColor: '#dddddd' }
              ],

              [
                { text: 'UNIDAD EJECUTORA:\n', style: 'textTitulo', alignment: 'right' },
                { text: this.datosEnvio[0].nombre_ue + '', style: 'textDato', alignment: 'left-justify' }
              ]
            ]
          },
          layout: 'noBorders'
        } as any,
        {
          text: '\n'
        },
        {
          text: [
            { text: 'Señor(es): \n', style: 'textDato' },
            {
              text: 'Habiéndose suscrito el contrato de obra ' + this.datosEnvio[0].desc_carpeta + ' , le comunicamos que a partir del día ' + 
              this.fechaString(this.datosEnvio[0].fecha_inicio_ejecucion) + ', se contabilizará el plazo de ejecución de ' + this.datosEnvio[0].plazo_ejecucion + ' días calendario establecidos ' +
              ' en el contrato ' + this.datosEnvio[0].numero_contrato+'.\n\n',
              style: 'textDato',  alignment: 'justify'
            },
            {
              text: 'En tal sentido, la obra deberá ser ejecutada en estricto cumplimiento del contrato de obra, especificaciones técnicas, tiempo de ' + 
              'ejecución, los plazos establecidos y documentos que forman parte del contrato.\n\n',
              style: 'textDato', alignment: 'justify', lineHeight: 1
            },
            {
              text: 'Atentamente,\n\n\n', 
              style: 'textDato', alignment: 'left'
            },
          ],
        },
        {
          text: '\n\n'
        },
        //FIRMA
        {
          text: [
            { text: this.datosEnvio[0].de_nombre2 + '\n', style: 'textDato', alignment: 'center' },
            { text: this.datosEnvio[0].de_cargo, style: 'textTitulo', alignment: 'center' }
          ]
        },
        {
          text: '\n'
        },
        {
          text: 'NOTIFICACIÓN AL CONTRATISTA\n',
          style: 'textTitulo', alignment: 'center'
        },
        {
          text: '\n\n\n'
        },
        //TABLA DE NOTIFICACION AL CONTRATISTA
        {
          table: {
            widths: ['30%', '70%'],
            body: [
              [
                { text: 'Firma: ', alignment: 'right', bold: true, fontSize: 8 },
                { text: '____________________________________________________________', alignment: 'left', fontSize: 8 }
              ],
              [
                { text: 'Nombre y apellido: ', alignment: 'right', bold: true, fontSize: 8 },
                { text: '____________________________________________________________', alignment: 'left', fontSize: 8 }
              ],
              [
                { text: 'Lugar: ', alignment: 'right', bold: true, fontSize: 8 },
                { text: '______________________________', alignment: 'left', fontSize: 8 }
              ],
              [
                { text: 'Fecha: ', alignment: 'right', bold: true, fontSize: 8 },
                { text: '___/___/_____' , alignment: 'left', fontSize: 8 }
              ]
            ]
          },
          layout: {
            defaultBorder: false,
          }
        } as any,
        { text: '\nCc. Arch.', style: 'footerText', alignment: 'left' },
      
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
      pageMargins: [60, 30, 40, 30] as any, // Márgenes: izquierda, arriba, derecha, abajo


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



// INFORME DE PREVISION DE PAGOS
  async generateInformePrevPagos(obra: number): Promise<Buffer> {
    try{
      //console.log("DATOS, ", obra);
    const res = await this.datosGeneralesReporteOP(obra);
    if (!res || (Array.isArray(res) && res.length === 0) || (typeof res === 'object' && Object.keys(res).length === 0)) {
      throw new Error('No se encontraron datos para el ID de obra proporcionado');
    }
    this.datosEnvio = res;

    const res1 = await this.supervisorDesignado(obra);
    if (!res1 || (Array.isArray(res1) && res1.length === 0) || (typeof res1 === 'object' && Object.keys(res1).length === 0)) {
      throw new Error('No se encontraron datos del supervisor designado');
    }
    this.datosSup = res1;
    console.log("datosSup", this.datosSup);

    const res2 = await this.jefeUnidad(obra);
    if (!res2 || (Array.isArray(res2) && res2.length === 0) || (typeof res2 === 'object' && Object.keys(res2).length === 0)) {
        throw new Error('No se encontraron datos del jefe de unidad');
    }
    this.datosJU = res2;
    

    } catch (error) {
      console.error('Error al generar el informe de previsión de pagos:', error);
      throw new Error('Error al generar el informe de previsión de pagos: ' + error);
    }

    const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
    const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
    //const imgPath = 'assets/images/membretado_oficio.png';
    const codigoCarpeta = this.datosEnvio[0].cod_carpeta;
    const imgPath = this.reportService.obtenerMembretePorGestion(codigoCarpeta);

    const documentDefinition = {
      pageSize: 'LEGAL' as any,
      background: function(currentPage: any, pageSize: any) { 
        return {
            image: imgPath, 
            width: pageSize.width, 
            height: pageSize.height,
            absolutePosition: {x: 0, y: 0}
              } },
      //watermark: { text: 'SGEO', color: 'blue', opacity: 0.1, bold: true, italics: false },

      header: {
        columns: [
          // Columna del texto centrado
          {
            
          },
        ],
      } as any,
      
      content: [
        {
          text: 'INFORME\n', style: 'header', alignment: 'center'
        },
        {
          text: this.datosEnvio[0].cod_carpeta + '-' + this.datosEnvio[0].cite_inf + '-' + this.datosEnvio[0].corr_inf,
          style: 'subheader', alignment: 'center'
        },
        {
          text: '\n'
        },
        {
          table: {
            widths: ['20%', '80%'],
            body: [
              [
                { text: 'A:', style: 'textTitulo', margin: [0, 6, 0, 0], alignment: 'right' },
                { text: [
                  { text: this.datosEnvio?.[0]?.a_nombre 
                    ? this.datosEnvio[0].a_nombre + '\n'
                    : '', style: 'textDato', alignment: 'left' },
                  { text: this.datosEnvio?.[0]?.a_cargo
                    ? this.datosEnvio[0].a_cargo
                    : '', style: 'textTitulo' }
                ] 
              }
              ],
              [
                { text: 'DE:', style: 'textTitulo', margin: [0, 6, 0, 0], alignment: 'right' },
                { 
                  text: [
                      { text: this.datosEnvio?.[0]?.de_nombre
                        ? this.datosEnvio[0].de_nombre + '\n'
                        : '', style: 'textDato', alignment: 'left' },
                      { text: this.datosEnvio?.[0]?.de_cargo
                        ? this.datosEnvio[0].de_cargo
                        : '', style: 'textTitulo', alignment: 'left' },
                    ]
                },
              ],
              [
                { text: 'REF.:', style: 'textTitulo', alignment: 'right' },
                { text: 'INFORME DE PREVISIÓN DE PAGOS', style: 'textTitulo' },
              ],
              [
                { text: 'FECHA:', style: 'textTitulo', alignment: 'right' },
                { text: this.fechaString(this.datosEnvio[0].fecha_memo), style: 'textDato' },
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
          }
        },
        {
          text: '\n'
        },
        {
          text: 'Habiendo sido designado como Supervisor de la obra ' + this.datosEnvio[0].cod_carpeta + ' y habiendo emitido el memorándum de Orden de Proceder, se informa lo siguiente:',
          style: 'textDato', alignment: 'justify', margin: [0, 0, 0, 5]
        },
        {
          text: ' 1. DATOS DE LA OBRA',
          style: 'textTitulo', margin: [0, 0, 0, 5]
        },
        {
          table: {
            widths: ['*', 350],
            body: [
              [
                { text: 'CÓDIGO:', style: 'textTitulo', alignment: 'right', fillColor: '#dddddd' },
                { text: this.datosEnvio[0].cod_carpeta, style: 'textDato', fillColor: '#f0f0f0' }
              ],
              [
                { text: 'OBRA:\n', style: 'textTitulo', alignment: 'right' },
                { text: this.datosEnvio[0].desc_carpeta + '\n', style: 'textDato' }
              ],
              [
                { text: 'ZONA:\n', style: 'textTitulo', alignment: 'right', fillColor: '#dddddd' },
                { text: this.datosEnvio[0].desc_zona_carpeta + '\n', style: 'textDato', fillColor: '#dddddd' }
              ],
              [
                { text: 'UNIDAD EJECUTORA:\n', style: 'textTitulo', alignment: 'right' },
                { text: this.datosEnvio[0].nombre_ue + '\n', style: 'textDato' }
              ],
              [
                { text: 'MONTO DE PROYECTO:\n', style: 'textTitulo', alignment: 'right', fillColor: '#dddddd' },
                { text: 'Bs' + this.datosEnvio[0].total_carpeta + '\n', style: 'textDato', fillColor: '#dddddd' }
              ],
              [
                { text: 'MONTO DE CONTRATO:\n', style: 'textTitulo', alignment: 'right' },
                { text: 'Bs' + this.datosEnvio[0].monto_contrato + '\n', style: 'textDato' }
              ],
              [
                { text: 'FECHA DE VALIDACIÓN DEL PROYECTO:\n', style: 'textTitulo', alignment: 'right', fillColor: '#dddddd'  },
                { text: this.fechaString(this.datosEnvio[0].fecha_validacion_carpeta)  + '\n\n', style: 'textDato', fillColor: '#dddddd' }
              ]
            ]
          }, margin: [0, 0, 0, 7]
          //layout: 'noBorders'
        },
        {
          text: ' 2. ANÁLISIS',
          style: 'textTitulo', margin: [0, 0, 0, 5]
        },
        {
          text: 'En función al plazo de ejecución de la obra y realizado el análisis de los aspectos administrativos relativos al pago de planillas y fechas previstas de cierre financiero de la obra, se tiene el siguiente detalle de los puntos evaluados:\n\n',
          style: 'textDato', alignment: 'justify'
        },
        {
          text: [
            { text: '- Certificado(s) de pago consignados en Contrato de Obra: ', style: 'textDato' },
            { text: this.datosEnvio[0].tipo_pago + '\n', style: 'textDato', bold: true },
        
            { text: '\n- Número estimado de certificados: ', style: 'textDato' },
            { text: this.datosEnvio[0].numero_pago + '\n', style: 'textDato', bold: true },
        
            { text: '\n- Fecha de Orden de Proceder: ', style: 'textDato' },
            { text: this.formatearFecha(this.datosEnvio[0].fecha_inicio_ejecucion) + '\n', style: 'textDato', bold: true },
        
            { text: '\n- Fecha estimada de Recepción Provisional: ', style: 'textDato' },
            { text: this.formatearFecha(this.datosEnvio[0].fecha_recep_provisional) + '\n', style: 'textDato', bold: true },
        
            { text: '\n- Plazo mínimo entre la Recepción Provisional y Definitiva (conforme a normativa vigente): ', style: 'textDato' },
            { text: this.datosEnvio[0].plazo_prov_definitiva + ' d.c.\n', style: 'textDato', bold: true },
        
            { text: '\n- Fecha estimada de Recepción Definitiva: ', style: 'textDato' },
            { text: this.formatearFecha(this.datosEnvio[0].fecha_recep_definitiva) + '\n', style: 'textDato', bold: true }
          ], margin: [20, 0, 0, 7]
        },
        {
          text: '3. CONCLUSIONES',
          style: 'textTitulo', margin: [0, 0, 0, 5]
        },
        {
          text: 'En base a lo anterior, se concluye que:\n\nSe tiene previsto ' + this.datosEnvio[0].numero_pago + ' certificado(s) de pago para la Obra ' + this.datosEnvio[0].cod_carpeta + ' - ' + this.datosEnvio[0].desc_carpeta + '.',
          style: 'textDato', alignment: 'justify', margin: [0, 0, 0, 5]
        },
        {
          text: '4. RECOMENDACÍON',
          style: 'textTitulo', margin: [0, 0, 0, 5]
        },
        {
          text: 'En base a lo descrito, se recomienda remitir el presente informe a la Unidad Ejecutora. \n\nEs cuanto se informa para los fines consiguientes.\n\n',
          style: 'textDato', alignment: 'justify'
        },
        {
          table: {
            widths: ['50%', '50%'],
            body: (
            this.datosEnvio?.[0]?.de_nombre
              ? this.datosEnvio[0].de_nombre.split('\n')
              : ['']
          ).map((nombre: string) => [
              { 
                text: [
                  { text: nombre, style: 'textDato' },
                  { text: '\nSUPERVISOR DE OBRA', style: 'textDato', bold: true }
                ], 
                margin: [0, 35, 0, 0], 
                alignment: 'center'
              },
              { text: '(Firma y Sello)', 
                style: 'textDato', alignment: 'center', margin: [0, 45, 0, 0] 
              }
            ])
          },
          margin: [20, 0, 20, 0],
          layout: {
            hLineColor: () => '#444444',
            vLineColor: () => '#444444',
            hLineWidth: () => 0.7,
            vLineWidth: () => 0.7
          }
        },
        {
          text: [
            '\n\nCc. Arch.',
          ],
          style: 'footerText'
        } as any,
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
      pageMargins: [70, 170, 50, 140] as any, // Márgenes: izquierda, arriba, derecha, abajo

    }
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


  //FUNCIONES PARA CONSTRUIR 
 
 //funcion para generar la fecha en formato dd/mm/aaa
  formatearFecha(iso: string) {
    const fecha = new Date(iso);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Enero = 0
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
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
  //funcion para generar de manera escrita el monto del dinero
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
    const [integerPart, decimalPart] = value.replace(/[^\d,]/g, '').split(',');
  
    const integerNumber = parseInt(integerPart.replace(/\./g, ''), 10);
    const decimalNumber = parseInt(decimalPart || '0', 10);
  
    const integerWords = this.numberToWords(integerNumber).trim();
    const decimalWords = decimalNumber > 0 ? `${decimalNumber}/100` : '00/100';
    const currencyWords = this.getCurrencyWord(currency);
  
    return `${integerWords} ${decimalWords} ${currencyWords}`;
  } 
  private numberToWords(value: number): string {
    if (value === 0) return 'CERO';
    if (value < 10) return this.unidades[value];
    if (value < 20) return this.especiales[value - 11];
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
      if (centena === 1 && resto === 0) return 'CIEN';
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
        return 'BOLIVIANOS';
      case '$':
        return 'DÓLARES';
      case '€':
        return 'EUROS';
      default:
        throw new Error(`Moneda no soportada: ${currency}`);
    }
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


}
