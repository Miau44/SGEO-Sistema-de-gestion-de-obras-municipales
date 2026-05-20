import { Injectable, Inject } from '@nestjs/common';
import PdfPrinter from 'pdfmake';
import * as path from 'path';
import * as fs from 'fs';
import { ResponseService } from 'src/response.service';
import { Sequelize } from 'sequelize-typescript';
import { log } from 'console';
import { existsSync } from 'fs'
import { join } from 'path';
import { text } from 'stream/consumers';
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
export class ReporteActPreviasService {

    datos: any = [];
    datosEnvio: any = [];
    datosSGEO: any = [];
    datosPreguntaInforme: any = [];
    datosPreguntaInformeRestante: any = [];
    datosFis: any = [];
    datosII: any = [];
    datosPAP: any = [];
    datosPAP2: any = [];
    datosPII2: any = [];
    datosPII4: any = [];
    datosIAP: any = [];
    datosAF: any = [];
  
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

    // funcion de membretados y margenes por gestion
    private obtenerMembretadoCartaPorGestion(gestion: number | string): string {
      const gestionNum = Number(gestion);

      if (gestionNum === 2025) {
        return 'assets/images/membretado_carta.png';
      }

      return 'assets/images/membretado_carta_nuevo.png';
    }
    private obtenerMargenesCartaPorGestion(
      gestion: number | string,
    ): [number, number, number, number] {
      const gestionNum = Number(gestion);

      if (gestionNum === 2025) {
        return [60, 30, 40, 30];
      }
      return [60, 30, 40, 30];
    }

    private obtenerMembretadoOficioPorGestion(gestion: number | string): string {
      const gestionNum = Number(gestion);

      if (gestionNum === 2025) {
        return 'assets/images/membretado_oficio.png';
      }

      return 'assets/images/membretado_oficio_nuevo.png';
    }

    private obtenerMargenesOficioPorGestion(
      gestion: number | string,
    ): [number, number, number, number] {
      const gestionNum = Number(gestion);

      if (gestionNum === 2025) {
        return [70, 170, 50, 140];
      }
        return [70, 115, 70, 125];
    }


    //--Datos Aprobador Fiscal
    async datosAprobadorFiscal(obra: number) {
      const query1 = `
          SELECT * 
          FROM public."vista_reporte_aprobador_fiscal_obra" WHERE id_obra = ${obra}`;
      const resultado = await this.sequelize.query(query1);
      return resultado[0];
  }

     //--Datos JEFE UNIDAD DFO
    async datosJefeUnidadDFO(unidad: number) {
      const query0 = `
          SELECT * 
          FROM public."vista_reporte_jefeDFO" WHERE id_subtipo = ${unidad}`;
      const resultado = await this.sequelize.query(query0);
      return resultado[0];
  }

    //--Datos generales Obra
    async datosGeneralesReporte(obra: number) {
      const query1 = `
          SELECT * 
          FROM public.f_reporte_datos_obra(${obra});
      `;
      const resultado = await this.sequelize.query(query1);
      return resultado[0];
  }

    //--Lista Fiscales designados por Obra
    async fiscalDesignado(obra: number) {
      const query1 = `
          SELECT * 
          FROM public."vista_fiscales_obra" WHERE id_obra = ${obra}`;
      const resultado = await this.sequelize.query(query1);
      return resultado[0];
     }

     //--Datos generales Informe Inicial para Informe de AP
    async datosGeneralesInfIni(obra: number) {
      const query2 = `SELECT *
                      FROM public."vista_reporte_datos_InfInicial" WHERE id_obra = ${obra}`;
      const resultado2 = await this.sequelize.query(query2);
      return resultado2[0];
     }

      //--Preguntas Informe AP
    async preguntasInfAP(obra: number, sbt: number) {
      const query3 = `SELECT * FROM public."vista_reporte_preguntas_AP" 
                      WHERE id_obra = ${obra} AND titulo = ${sbt}`;
      const resultado3 = await this.sequelize.query(query3);
      return resultado3[0];
     }

     //--Preguntas Informe AP
    async preguntasInfInicial(obra: number, sbt: number) {
      const query4 = `SELECT * FROM public."vista_reporte_preguntas_II" 
                      WHERE id_obra = ${obra} AND titulo = ${sbt}`;
      const resultado4 = await this.sequelize.query(query4);
      return resultado4[0];
     }

     //--Datos Informe Actividades Previas
    async datosInfActPrevias(obra: number) {
      const query5 = `SELECT * FROM public."vista_reporte_ActPrevias" 
                      WHERE id_obra = ${obra} `;
      const resultado5 = await this.sequelize.query(query5);
      return resultado5[0];
     }

//--Datos Documentos ETAPA I
    async datosDocumentosSGEO(obra: number) {
      const query1 = `SELECT
    td.*, 
    sub.*, 
    d.* 
    FROM tipo_documento as td INNER JOIN
    (SELECT id_subtipo, desc_subtipo FROM parametrica WHERE id_tipo=11 ) sub
    ON td.id_subtipo_documento = sub.id_subtipo
    INNER JOIN documento as d ON td.id_tipo_documento=d.id_tipo_documento
    INNER JOIN ( SELECT d_inner.id_tipo_documento,
          MIN(d_inner.id_documento) AS min_id_documento 
      FROM documento as d_inner WHERE d_inner.id_obra = ${obra}
      GROUP BY d_inner.id_tipo_documento ) AS selector_unico
    ON d.id_documento = selector_unico.min_id_documento WHERE d.id_obra = ${obra} 
    AND td.id_etapa_documento = 1 AND td.id_subtipo_documento = 108 ORDER BY td.id_tipo_documento ASC;	`;
      const values = [obra]
      const resultado = await this.sequelize.query(query1);
      return resultado[0];
    }

    // async datosReporteEnvio(obra: number) {
    //   const query1 = `SELECT distinct *, td.id_tipo_documento  
    // FROM  tipo_documento as td
    // INNER JOIN (SELECT id_subtipo, desc_subtipo FROM parametrica WHERE id_tipo=11 ) sub ON td.id_subtipo_documento = sub.id_subtipo
    // LEFT OUTER JOIN documento as d ON td.id_tipo_documento=d.id_tipo_documento
    // INNER JOIN obra  as o ON  d.id_obra = o.id_obra
    // INNER JOIN ficha as f ON o.id_ficha= f.id_ficha  
    // WHERE  d.id_obra = ${obra} AND id_etapa_documento =1 AND id_subtipo_documento =108 ORDER BY td.id_tipo_documento ASC;	`;
    //   const values = [obra]
    //   const resultado = await this.sequelize.query(query1);
    //   return resultado[0];
    // }
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

   //--Cargar preguntas Informe Inicial
    buildPregInfInicial2(data: any) {
      let datosPreg = data;
      let arrayData = [];
    
      for (let i = 0; i < datosPreg.length; i++) {
        const item = datosPreg[i];

        let rowData = [
          { text: [{ text: item.respuesta || '', style: 'textDato', italics:true }] },
          { text: [{ text: item.sino || '', style: 'textDato', italics: true, alignment: 'left' }] }
        ];
        arrayData.push(rowData);        
      }
    
      return arrayData;
    }

// FORMULARIO DE ENVIO DE DOCUMENTOS

async generateEnvioDoc(obra: number): Promise<Buffer> {

  const res = await this.datosDocumentosSGEO(obra);
  if (!res || (Array.isArray(res) && res.length === 0) || (typeof res === 'object' && Object.keys(res).length === 0)) {
    throw new Error('No se encontraron datos para la obra proporcionada');
  }
  this.datosSGEO = res;

  const res1 = await this.datosGeneralesReporte(obra);
  if (!res1 || (Array.isArray(res1) && res1.length === 0) || (typeof res1 === 'object' && Object.keys(res1).length === 0)) {
    throw new Error('No se encontraron datos para la obra proporcionada');
  }
  this.datosEnvio = res1;
  console.log("DATOS_OBRA", this.datosEnvio);

  //ME const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
  //ME const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
  //const imgPath = 'assets/images/membretado_carta.png';
  const gestion = this.datosEnvio[0].gestion_carpeta;
  const imgPath = this.obtenerMembretadoCartaPorGestion(gestion);
  const pageMargins = this.obtenerMargenesCartaPorGestion(gestion);

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
              { text: 'CÓDIGO:', style: 'textTitulo', fillColor: '#dddddd' },
              { text: [{ text: this.datosEnvio[0].cod_carpeta, style: 'textDato' }], fillColor: '#dddddd' }
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
              { text: 'Bs.' + this.datosEnvio[0].total_carpeta + '\n', style: 'textDato' }
            ],
            [
              { text: 'FECHA DE VALIDACIÓN DEL PROYECTO:\n', style: 'textTitulo', fillColor: 'dddddd' },
              { text: this.fechaString(this.datosEnvio[0].fecha_validacion_carpeta) + '\n\n', style: 'textDato', fillColor: 'dddddd' }
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
            ...this.buildDocumentos(this.datosSGEO)
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
        text: 'Fecha de Envío: ',
        style: 'textDato',
      },
      {
        text: ['\n\n\n'],
      },
      {
        text: this.datosEnvio[0].profesion + this.datosEnvio[0].nombre_sol + ' ' + this.datosEnvio[0].paterno_sol + ' ' + this.datosEnvio[0].materno_sol,
        style: 'textDato', alignment:'center'
      },
      {
        text: 'JEFE DE UNIDAD\n' + this.datosEnvio[0].nombre_da,
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
    //pageMargins: [60, 30, 40, 30] as any, // Márgenes: izquierda, arriba, derecha, abajo
    pageMargins: pageMargins as any,
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

obtenerMembretePorFecha(fecha: string | Date): string {
    const fechaDocumento = new Date(fecha);
    // tercer membretado
    if (fechaDocumento >= new Date('2026-03-13')) {
      return 'assets/images/oficio.png';
    }
    // segundo membretado
    if (fechaDocumento >= new Date('2026-01-01')) {
      return 'assets/images/membretado_oficio_nuevo.png';
    }
    // primer membretado
    return 'assets/images/membretado_oficio.png';
  }

private obtenerMargenesInformeFiscal(
    fecha: string | Date,
  ): [number, number, number, number] {

    const fechaDocumento = new Date(fecha);

    // tercer membretado
    if (fechaDocumento >= new Date('2026-03-13')) {
      return [50, 140, 50, 70];
    }

    // segundo membretado
    if (fechaDocumento >= new Date('2025-01-01')) {
      return [70, 115, 70, 125];
    }

    // primer membretado
    return [70, 170, 50, 140]; 
  }


// INFORME ACTIVIDADES PREVIAS FISCAL
async generateInformeFISCAL(obra: number): Promise<Buffer> {
    
    const res = await this.datosGeneralesReporte(obra);
    if (!res || (Array.isArray(res) && res.length === 0) || (typeof res === 'object' && Object.keys(res).length === 0)) {
      throw new Error('No se encontraron datos para la obra.');
    }
    this.datosEnvio = res;

    const res0 = await this.datosAprobadorFiscal(obra);
    if (!res0 || (Array.isArray(res0) && res0.length === 0) || (typeof res0 === 'object' && Object.keys(res0).length === 0)) {
      throw new Error('No se encontraron del Aprobador.');
    }
    this.datosAF = res0;

    const res1 = await this.fiscalDesignado(obra);
    if (!res1 || (Array.isArray(res1) && res1.length === 0) || (typeof res1 === 'object' && Object.keys(res1).length === 0)) {
      throw new Error('No se encontraron datos del Fiscal');
    }
    this.datosFis = res1;

    const res2 = await this.datosGeneralesInfIni(obra);
    if (!res2 || (Array.isArray(res2) && res2.length === 0) || (typeof res2 === 'object' && Object.keys(res2).length === 0)) {
      throw new Error('No se encontraron datos del Informe Inicial');
    }
    this.datosII = res2;

    const res3 = await this.preguntasInfAP(obra, 227);
    if (!res3 || (Array.isArray(res3) && res3.length === 0) || (typeof res3 === 'object' && Object.keys(res3).length === 0)) {
      throw new Error('No se encontraron la preguntas del informe de AP');
    }
    this.datosPAP = res3;

    const res4 = await this.preguntasInfAP(obra, 228);
    if (!res4 || (Array.isArray(res4) && res4.length === 0) || (typeof res4 === 'object' && Object.keys(res4).length === 0)) {
      throw new Error('No se encontraron la preguntas del informe de AP');
    }
    this.datosPAP2 = res4;

    const res6 = await this.preguntasInfInicial(obra, 170);
    if (!res6 || (Array.isArray(res6) && res6.length === 0) || (typeof res6 === 'object' && Object.keys(res6).length === 0)) {
      throw new Error('No se encontraron la preguntas B del Inf.Inicial');
    }
    this.datosPII2 = res6;

    const res8 = await this.preguntasInfInicial(obra, 173);
    if (!res8 || (Array.isArray(res8) && res8.length === 0) || (typeof res8 === 'object' && Object.keys(res8).length === 0)) {
      throw new Error('No se encontraron las observaciones grales. del Inf.Inicial');
    }
    this.datosPII4 = res8;

    const res9 = await this.datosInfActPrevias(obra);
    if (!res9 || (Array.isArray(res9) && res9.length === 0) || (typeof res9 === 'object' && Object.keys(res9).length === 0)) {
      throw new Error('No se encontraron datos del Informe de Actividades Previas');
    }
    this.datosIAP = res9;

    const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
    const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
    //const imgPath = 'assets/images/membretado_oficio.png';
    //membretado por gestion
    //const gestion = this.datosEnvio[0].gestion_carpeta;
    //const imgPath = this.obtenerMembretadoOficioPorGestion(gestion);
    //const pageMargins = this.obtenerMargenesOficioPorGestion(gestion);

    //membretado por fecha 
    const fechaDocumento = this.datosIAP[0].fecha_aprobacion;
    const imgPath = this.obtenerMembretePorFecha(fechaDocumento);

    //margenes por fecha
    const margenesDinamicos = this.obtenerMargenesInformeFiscal(fechaDocumento);

    //console.log('DATOS IAP',this.datosEnvio);
    //console.log('DATOS:',this.datosIAP);
    const bodyTabla = [];

    const documentDefinition = {
      pageSize: 'LEGAL' as any,
      background: function(currentPage: any, pageSize: any) { 
        return {
            image: imgPath, 
            width: pageSize.width, 
            height: pageSize.height,
            absolutePosition: {x: 0, y: 0}
              } },
      defaultStyle: {
            font: 'Roboto'
                    },
      
      header: {
        columns: [      
        ],
      } as any,
      content: [
        {
          text: 'INFORME\n',
          style: 'header', alignment: 'center'
        } as any,
        {
          text: this.datosEnvio[0].cod_carpeta + '-' + this.datosIAP[0].cite_inf + '\n\n',
          style: 'subheader', alignment: 'center'
        },
        {
          table: {
            widths: ['20%', '80%'],
            body: [
              [
                { text: 'A:', style: 'textTitulo', alignment:'right' },
                { text: [
                    { text: this.datosIAP[0].a_nombre + '\n', style: 'textDato' },
                    { text: this.datosIAP[0].a_cargo , style: 'textTitulo' }
                  ] 
                },
              ],
              // Fila VIA: solo si la condición NO se cumple
              ...(
                this.datosAF[0].desc_cod_da >= 37 && this.datosAF[0].desc_cod_da <= 45
                  ? [] // No incluir la fila
                  : [[
                      { text: 'VIA:', style: 'textTitulo', alignment:'right' },
                      { text: [
                            { text: (this.datosIAP[0].via_nombre || '') + '\n', style: 'textDato' },
                            { text: (this.datosIAP[0].via_cargo || ''), style: 'textTitulo' }
                        ]                                             
                      }
                    ]]
              ),
              [
                { text: 'DE:', style: 'textTitulo', alignment: 'right' },
                { text: [
                  { text: this.datosIAP[0].de_nombre + '\n', style: 'textDato'},
                  { text: this.datosIAP[0].de_cargo, style: 'textTitulo'}
                  ] 
                },                
              ],
              [
                { text: 'REF.:', style: 'textTitulo', alignment:'right' },
                { text: 'INFORME DE FISCALIZACIÓN PREVIO AL INICIO DE OBRA', style: 'textTitulo' },
              ],
              [
                { text: 'FECHA:', style: 'textTitulo', alignment:'right' },
                { text: this.fechaString(this.datosIAP[0].fecha_aprobacion), style: 'textDato' },
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
          text: '\n',
        },
        {
          text: 'En atención a informe ' + this.datosEnvio[0].cod_carpeta + '-' + this.datosII[0].cite + '-1' +
          ', con referencia: "INFORME INICIAL DE REVISIÓN DEL PROYECTO", se emite el presente informe.\n\n',
          style: 'textDato', alignment: 'justify'
        },
        {
          text: '1.   ANTECEDENTES\n\n',
          style: 'subheader',
        },
        {
          ul: [
                {
                  text: 'Mediante memorándum ' + this.datosIAP[0].cites_de + ', se designó a mi (nuestra) persona como Fiscal(es) de la obra: "' +
                  this.datosEnvio?.[0]?.desc_carpeta + '".',
                  margin: [0, 0, 0, 5], style: 'textDato'
                },
                {
                  text: 'En fecha ' + this.fechaString(this.datosII[0].fecha_aprobacion) + ', el Supervisor de Obra remite el Informe Inicial de Revisión ' + 
                        'del Proyecto ' + this.datosEnvio[0].cod_carpeta + '-' + this.datosII[0].cite + '-1'
                }
              ], style: 'textDato', alignment: 'justify', margin: [20, 0, 0, 0]
        },
        {
          text: '\n',
        },
        {
          text: 'a) DATOS DE LA OBRA:',
          style: 'textDato', bold: true, margin: [20, 0, 0, 0]
        },
        {
          text: '\n'
        },
        {
          table: {
            widths: ['*', 350],
            body: [
              [
                { text: 'CÓDIGO:', style: 'textTitulo', alignment: 'right', fillColor: '#dddddd' },
                { text: this.datosEnvio[0].cod_carpeta, style: 'textDato', fillColor: '#dddddd' }
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
                { text: 'Bs.' + this.datosEnvio[0].total_carpeta + '\n', style: 'textDato', fillColor: '#dddddd' }
              ],
              [
                { text: 'FECHA VALIDACIÓN DEL PROYECTO:\n', style: 'textTitulo', alignment: 'right' },
                { text: this.fechaString(this.datosEnvio[0].fecha_validacion_carpeta) + '\n\n', style: 'textDato' }
              ]
            ]
          }, margin: [20, 0, 0, 0]
          //layout: 'noBorders'
        },
        {
          text: '\n2.   FUNDAMENTO NORMATIVO\n',
          style: 'subheader', margin: [0, 0, 0, 5] 
        },
        {
            text: 'El Decreto Municipal N°18/2023 que aprueba el Reglamento de Supervisión y Fiscalización de Obras, señala:',
            style: 'textDato', alignment:'justify', margin: [0, 0, 0, 5] 
        }, 
        {
          ul: [
            {
              text: [
                  { text: 'Artículo 21.- (ACTIVIDADES DE LA FISCALIZACIÓN PREVIAS AL INICIO DE OBRA EN LAS MODALIDADES DE LICITACIÓN PÚBLICA, ' + 
                          'APOYO NACIONAL A LA PRODUCCIÓN Y EMPLEO,  DIRECTA, POR EXCEPCIÓN Y CON FINANCIAMIENTO EXTERNO O DONACIÓN).- ',
                    style: 'textDato', alignment:'justify', bold:true },
                  { text: 'La Fiscalización coordinará con la Unidad Ejecutora y con las empresas de servicios, si corresponde, a través del Sistema ' + 
                          'de Regulación Municipal (SIREMU) o la Unidad Organizacional correspondiente, las actividades necesarias para el desarrollo ' + 
                          ' de los trabajos, conforme la evaluación del Informe Inicial de Revisión del Proyecto remitido por la Supervisión de forma física.',
                    style: 'textDato', alignment:'justify', italics: true }
                  
                    ], margin: [0, 0, 0, 5] 
            }, 
            {
              text: [
                  { text: 'Artículo 28.- (RESPONSABILIDADES DEL FISCAL DE OBRAS).- inciso a) ', 
                    style: 'textDato', alignment:'justify', bold:true },
                  { text: 'Controlar a través del Supervisor de Obra, el cumplimiento del contrato, emitiendo informes al Director de Fiscalización de Obras ' + 
                      'en caso de existir observaciones a los trabajos, para envío a la Unidad Ejecutora.', 
                    style: 'textDato', alignment:'justify', italics: true }
                    ], margin: [0, 0, 0, 5] 
            },
           {
            text: [
                  { text: 'Artículo 29.- (ORDEN DE PROCEDER).- ', 
                    style: 'textDato', alignment:'justify', bold:true },
                  { text: 'Para la emisión de la Orden de Proceder, una vez se cumpla lo establecido en el artículo 21 y desembolsado el anticipo ' + 
                          '(si corresponde), se seguirán las siguientes actividades: inciso a) El RPC o RPA en un plazo de hasta 3 ' + 
                          '(tres) días hábiles instruirá a la Supervisión la emisión de la Orden de Proceder con copia a la Fiscalización.', 
                    style: 'textDato', alignment:'justify', italics:true }
                  ], margin: [0, 0, 0, 5] 
           }
          ], margin: [20, 0, 0, 0]
        },
        {
          text: '\n3.   ANÁLISIS\n',
          style: 'subheader', margin: [0, 0, 0, 5] 
        },
        {
          text: [
            { text: 'El informe Inicial de Revisión del Proyecto ' + this.datosEnvio[0].cod_carpeta + '-' + this.datosII[0].cite + '-1 concluye: ', 
              style: 'textDato', alignment:'justify' },
            { text: '"' + this.datosII[0].conclusion + '".', 
              style: 'textDato', alignment:'justify', italics:true }
          ]     
        },
        {
          text: '\nAdicionalmente, de acuerdo a lo señalado por el Supervisor de Obra en el Informe Inicial de Revisión del Proyecto, ' + 
          'en relación a la necesidad de realizar actividades previas con Empresas de Servicios recomienda:',
          style: 'textDato', alignment:'justify' 
        },
        {
          text: '\n'
        },
        {
          table: {
            widths: ['*', 90],
            body: [
              ...this.buildPregInfInicial2(this.datosPII2),              
            ]
          }, margin: [20, 0, 0, 0],  //margin: [15, 0, 30, 0],
          layout: 'noBorders'
        },
        
        {
          text:'\nEn tal sentido:',
          style: 'textDato', alignment:'justify', margin: [0, 0, 0, 5] 
        },   
        {
          text: [
            '-  La obra ',
            { text: this.datosPAP[0].sino, bold: true }, 
            ' cuenta con óbice para proseguir con los procesos correspondientes.',
          ],
          style: 'textDato', alignment: 'justify',  margin: [20, 0, 0, 0] 
        },
        {
          text: this.datosPAP[0].sino == 'Si'
            ? this.datosPAP[0].observaciones
            : ' ',
          style: 'textDato',
          margin: [30, 0, 0, 0], alignment: 'justify'
        },
        {
          text: [
            '-  La obra ',
            { text: this.datosPAP[1].sino, bold: true }, 
            ' requiere coordinación con la Unidad Ejecutora.\n',
          ],
          style: 'textDato', alignment: 'justify', margin: [20, 0, 0, 0] 
        }, 
        {
          text: this.datosPAP[1].sino == 'Si'
            ? this.datosPAP[1].observaciones
            : ' ',
          style: 'textDato', margin: [30, 0, 0, 0], alignment: 'justify'
        },
        {
          text: [
            '-  La obra ',
            { text: this.datosPAP[2].sino, bold: true }, 
            ' requiere coordinación con el Sistema de Regulación Municipal (SIREMU).\n'
          ],
          style: 'textDato', alignment: 'justify', margin: [20, 0, 0, 0] 
        },
        {
          text: this.datosPAP[2].sino == 'Si'
            ? this.datosPAP[2].observaciones
            : '',
          style: 'textDato',
          margin: [30, 0, 0, 0], alignment: 'justify'
        },
        {
          text:' ',
        },
        {
          text: '3.   CONCLUSIONES\n\n',
          style: 'subheader',
        },
        {
          text: 'En cumplimiento al Artículo 21 del Reglamento de Supervisión y Fiscalización de Obras, se han verificado las condiciones previas para proceder con la ejecución de la obra y se concluye:\n\n',
          style: 'textDato', alignment:'justify'
        },
        {
          text: this.datosPAP2[0].respuesta + '.\n',
          style: 'textDato', alignment:'justify', margin: [20, 0, 0, 0] 
        },
        {
          text: '\n 4.   RECOMENDACIÓN\n\n',
          style: 'subheader', 
        },
        {
          text: [
            { text: this.datosPAP2[0].id_subtipo === '253' //Si la respuesta es NO
              ? 'Se recomienda la remisión del presente informe a la Unidad Ejecutora para que dicha instancia considere la instrucción a la Supervisión para la emisión de la Orden de Proceder con copia a la Fiscalización en función al Artículo 29 del Reglamento de Supervisión y Fiscalización de Obras.\n\n'
              :'' },
            { text: this.datosPAP2[0].id_subtipo === '232' //Si la respuesta es SI
              ? 'Se recomienda la remisión del presente informe a la Unidad Ejecutora para que dicha instancia considere la instrucción a la Supervisión para la emisión de la Orden de Proceder con copia a la Fiscalización en función al Artículo 29 del Reglamento de Supervisión y Fiscalización de Obras .\n\n'
              :'' },
            { text: 'Es cuanto informo para los fines consiguientes.'}
          ],
          style: 'textDato', alignment:'justify'
        },
        {
          text: ['\n'],
        }, 
        {
          table: {
            widths: ['50%', '50%'],
            body: (this.datosIAP[0].de_nombre ? this.datosIAP[0].de_nombre.split('\n') : []).map((nombre: string) => [
              { text: [
                  { text: nombre, style: 'textDato' },
                  { text: '\nFISCAL DE OBRA', style: 'textDato', bold: true }
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
            '\n\n\nCc. Archivo \nCc./Arch. Personal \n',
          ], style: 'footerText'
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
          color: 'gray', 
        },
        coloredTextgray: {
          fontSize: 14,
          bold: true,
          color: 'gray', 
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
        textDato2: {
          fontSize: 9,
          bold: false,
          italic: true, 
          opacity: 0.8,
        },
        bold: {
            bold: true,
            fontSize: 10, // Ajusta el tamaño según sea necesario
        },

      },
      //pageMargins: [70, 170, 50, 140] as any, // Márgenes: izquierda, arriba, derecha, abajo
      //pageMargins: pageMargins as any,
      pageMargins: margenesDinamicos as any,

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

// Fecha en formato dd/mm/aa

fechaFormato(iso: string): string {
  let fecha: Date;

  if (iso === 'hoy') {
    fecha = new Date(); // Usar fecha y hora actual
  } else if (iso) {
    fecha = new Date(iso); 
  } else {
      return 'Sin fecha';
  }

 if (!(fecha instanceof Date) || isNaN(fecha.getTime())) {
    console.error("La cadena proporcionada no resultó en una fecha válida:", iso);
    return ''; 
  }

  // 3. Extraer día, mes y año
  const day = fecha.getDate();
  const month = fecha.getMonth() + 1; // getMonth() devuelve 0-11, sumar 1
  const year = fecha.getFullYear();

  // 4. Formatear día y mes con ceros a la izquierda si es necesario (dd, mm)
  const formattedDay = String(day).padStart(2, '0');
  const formattedMonth = String(month).padStart(2, '0');

  // 5. Construir y devolver la cadena final en formato dd/mm/aaaa
  return `${formattedDay}/${formattedMonth}/${year}`;
}

}
