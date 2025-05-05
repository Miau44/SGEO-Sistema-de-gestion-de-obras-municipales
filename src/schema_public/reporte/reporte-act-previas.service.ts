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
    datosPII: any = [];
    datosPII2: any = [];
    datosPII3: any = [];
    datosPII4: any = [];
    datosIAP: any = [];
    datosAF: any = [];
  
    constructor(
      private readonly responseService: ResponseService,
      @Inject(Sequelize) private sequelize: Sequelize, // Inyecta Sequelize correctamente
    ) { this.printer = new PdfPrinter(fonts); }
  
    private readonly printer = new PdfPrinter(fonts);
    private getImageBase64(imagePath: string): string {
      const image = fs.readFileSync(imagePath);
      return image.toString('base64');
    }

    //--Datos Aprobador Fiscal
    async datosAprobadorFiscal(obra: number) {
      const query1 = `
          SELECT * 
          FROM public."vista_reporte_aprobador_fiscal_obra" WHERE id_obra = ${obra}`;
      const resultado = await this.sequelize.query(query1);
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
      const query2 = `SELECT i.id_informe, i.id_obra, i.id_correlativo, i.obs_general, i.conclusion, i.fecha_registro, i.fecha_modificacion, pc.detalle AS cite, c.correlativo from informe i 
                      JOIN correlativo c ON i.id_correlativo = c.id_correlativo
                      JOIN ( SELECT pa.id_subtipo, pa.desc_subtipo, pa.detalle
                            FROM parametrica pa
                            WHERE pa.id_tipo = 29 AND pa.id_estado = 1) pc ON c.id_tipo_documento = pc.id_subtipo
                      WHERE i.id_tipo_informe = 235 AND i.id_obra = ${obra}`;
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

    //Cargar tabla de fiscales
    buildFiscales(data: any) {
      let datosFiscal = data;
      let arrayData = [];
  
      for (let i = 0; i < datosFiscal.length; i++) {
        let rowData = [
          { text: [{ text: datosFiscal[i].profesion + ' ' +datosFiscal[i].nombre + ' ' + datosFiscal[i].primer_apellido + ' ' + datosFiscal[i].segundo_apellido, style: 'textDato' }] },
        ];
        arrayData.push(rowData);
      }
      return arrayData;
    }

    //Cargar tabla de fiscales 2 - con recuadro
    buildFiscales2(data: any[]) {
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
                { text: 'FISCAL', bold: true, style: 'textDato' }
                  ],
                alignment: 'center', margin: [0, 25, 0, 0]},
          { text: '(Firma y Sello)', style: 'textDato', alignment: 'center', margin: [0, 35, 0, 0] }
        ];
        arrayData.push(rowData);
      }
      return arrayData;
    }

    //--Cargar preguntas Informe Inicial + Obervacion si la respuesta es NO
    buildPregInfInicial(data: any) {
      let datosPreg = data;
      let arrayData = [];
    
      for (let i = 0; i < datosPreg.length; i++) {
        const item = datosPreg[i];

        let rowData = [
          { text: [{ text: item.respuesta || '', style: 'textDato' }] },
          { text: [{ text: item.sino || '', style: 'textDato', alignment: 'center' }] }
        ];
        arrayData.push(rowData);
    
        // Si es NO, agregar fila adicional con observación
        if (item.opcion  === '217') {
          const observacionTexto = item.observaciones 
            ? `${item.observaciones}` 
            : ' ';
    
          arrayData.push([
            {
              text: observacionTexto,
              colSpan: 2,
              style: 'textDato',
              //color: 'red',
              //margin: [12, 2, 0, 5]
            },
            {} // Segunda celda vacía por el colSpan
          ]);
        }
      }
    
      return arrayData;
    }

    //--Cargar preguntas Informe Inicial + Obervacion si la respuesta es SI o NO
    buildPregInfInicial2(data: any) {
      let datosPreg = data;
      let arrayData = [];
    
      for (let i = 0; i < datosPreg.length; i++) {
        const item = datosPreg[i];

        let rowData = [
          { text: [{ text: item.respuesta || '', style: 'textDato' }] },
          { text: [{ text: item.sino || '', style: 'textDato', alignment: 'center' }] }
        ];
        arrayData.push(rowData);
    
        // Si es NO, agregar fila adicional con observación
        if (item.opcion != 218) {
          const observacionTexto = item.observaciones 
            ? `${item.observaciones}` 
            : ' ';
    
          arrayData.push([
            {
              text: observacionTexto,
              colSpan: 2,
              style: 'textDato',
              //color: 'red',
              //margin: [12, 2, 0, 5]
            },
            {} // Segunda celda vacía por el colSpan
          ]);
        }
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
    try {
      
    
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
      throw new Error('No se encontraron la preguntas del informe Inicial');
    }
    this.datosPAP2 = res4;

    const res5 = await this.preguntasInfInicial(obra, 169);
    if (!res5 || (Array.isArray(res5) && res5.length === 0) || (typeof res5 === 'object' && Object.keys(res5).length === 0)) {
      throw new Error('No se encontraron la preguntas A del Inf.Inicial');
    }
    this.datosPII = res5;

    const res6 = await this.preguntasInfInicial(obra, 170);
    if (!res6 || (Array.isArray(res6) && res6.length === 0) || (typeof res6 === 'object' && Object.keys(res6).length === 0)) {
      throw new Error('No se encontraron la preguntas B del Inf.Inicial');
    }
    this.datosPII2 = res6;

    const res7 = await this.preguntasInfInicial(obra, 171);
    if (!res7 || (Array.isArray(res7) && res7.length === 0) || (typeof res7 === 'object' && Object.keys(res7).length === 0)) {
      throw new Error('No se encontraron la preguntas C del Inf.Inicial');
    }
    this.datosPII3 = res7;

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
    const imgPath = 'assets/images/membretado_oficio.png';

    console.log('DATOS IAP',this.datosIAP);
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
          text: this.datosEnvio[0].cod_carpeta + '-' + 'IFIS' + '-' + '1\n\n',
          style: 'subheader', alignment: 'center'
        },
        {
          table: {
            widths: ['15%', '85%'],
            body: [
              [
                { text: 'A:', style: 'textTitulo', margin: [0, 5, 0, 5], alignment:'right' },
                { text: [
                    { text: this.datosAF[0].aprobador + '\n', style: 'textDato' },
                    { text: (
                      this.datosAF[0].desc_cod_da >= 37 && this.datosAF[0].desc_cod_da <= 45
                        ? this.datosAF[0].nombre_da
                        : this.datosAF[0].nombre_ue
                    ), style: 'textTitulo' }
                  ],
                  margin: [0, 5, 0, 5] 
                },
              ],
              // Fila VIA: solo si la condición NO se cumple
              ...(
                this.datosAF[0].desc_cod_da >= 37 && this.datosAF[0].desc_cod_da <= 45
                  ? [] // No incluir la fila
                  : [[
                      { text: 'VIA:', style: 'textTitulo', margin: [0, 5, 0, 5], alignment:'right' },
                      {
                        text: [
                          { text: '\n', style: 'textDato' },
                          { text: 'JEFE DE UNIDAD - DIRECCIÓN DE FISCALIZACIÓN DE OBRAS', style: 'textTitulo' }
                        ],
                        margin: [0, 5, 0, 5]
                      }
                    ]]
              ),
              [
                { text: 'DE:', style: 'textTitulo', margin: [0, 6, 0, 0], alignment: 'right' },
                { 
                  table: {
                    widths: ['*'],
                    body: [
                      ...this.buildFiscales(this.datosFis)
                    ]
                  },
                  style: 'textDato', layout: 'noBorders', margin: [0, 5, 0, 5] 
                },                
              ],
              [
                { text: ' ' },
                { text: 'FISCAL(ES) DE OBRA', style: 'textTitulo' },
              ],
              [
                { text: 'REF.:', style: 'textTitulo', margin: [0, 5, 0, 5], alignment:'right' },
                { text: 'INFORME DE ACTIVIDADES PREVIAS', style: 'textTitulo', margin: [0, 5, 0, 5] },
              ],
              [
                { text: 'FECHA:', style: 'textTitulo', margin: [0, 5, 0, 5], alignment:'right' },
                { text: this.fechaString(this.datosIAP[0].fecha_modificacion), style: 'textDato', margin: [0, 5, 0, 5] },
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
          'En atención a INFORME DE SUPERVISIÓN ' + this.datosEnvio[0].cod_carpeta + '-' + this.datosII[0].cite + '-' + this.datosII[0].correlativo +
          ' con referencia: INFORME INICIAL DE REVISIÓN DEL PROYECTO, emitido por la supervisión y en cumplimiento del ARTICULO referido a ' + 
          '“ACTIVIDADES DE LA FISCALIZACIÓN PREVIAS AL INICIO DE OBRA EN LAS MODALIDADES DE LICITACIÓN PUBLICA, APOYO NACIONAL A LA PRODUCCIÓN ' + 
          'Y EMPLEO, DIRECTA, POR EXCEPCIÓN Y CON FINANCIAMIENTO EXTERNO DONACIÓN” del REGLAMENTO DE SUPERVISIÓN Y FISCALIZACIÓN DE OBRA (RSFO), se emite el presente informe: \n\n',
          style: 'textDato', alignment: 'justify'
        },
        {
          text: '1. DATOS DEL PROYECTO\n\n',
          style: 'subheader',
        },
        {
          table: {
            widths: ['*', 350],
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
                { text: [{ text: 'Bs.' + this.datosEnvio[0].total_carpeta + '\n', style: 'textDato' }], fillColor: '#dddddd' }
              ],

              [
                { text: [{ text: 'FECHA VALIDACIÓN DEL PROYECTO:\n', style: 'textTitulo', alignment: 'right' },] },
                { text: [{ text: this.fechaString(this.datosEnvio[0].fecha_validacion_carpeta) + '\n\n', style: 'textDato' }] }
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
            text: '\nEl INFORME DE SUPERVISIÓN ' + this.datosEnvio[0].cod_carpeta + '-' + this.datosII[0].cite + '-' + this.datosII[0].correlativo +
            ' con referencia: INFORME INICIAL DE REVISIÓN DEL PROYECTO, emitido por la supervisión,'+
            ' de fecha ' + this.fechaString(this.datosII[0].fecha_modificacion) + ', establece:\n\n',
            style: 'textDato', alignment:'justify'
        }, 
        {
          text: 'Realizado el análisis de los aspectos técnicos se tiene el siguiente detalle de los puntos evaluados:\n',
          style: 'textDato', alignment:'justify'
        },
        {
          text: '\nCon relación al análisis de los aspectos técnicos se detalla lo siguiente:',
          style: 'textDato2', alignment:'justify', bold:true
        },
        {
          table: {
            widths: ['*', 50],
            body: [
              ...this.buildPregInfInicial(this.datosPII),              
            ]
          }, //margin: [15, 0, 30, 0],
          //layout: 'noBorders'
        },
        {
          text: '\nCon relación al análisis de los aspectos inter institucionales se detalla lo siguiente:',
          style: 'textDato2', alignment:'justify', bold: true
        }, 
        {
          table: {
            widths: ['*', 50],
            body: [
              ...this.buildPregInfInicial2(this.datosPII2),              
            ]
          }, //margin: [15, 0, 30, 0],
          //layout: 'noBorders'
        },
        {
          text: '\nPara el análisis de los aspectos técnicos y legales se consideraron los siguientes puntos:',
          style: 'textDato', alignment:'justify', bold:true
        },
        {
          table: {
            widths: ['*', 50],
            body: [
              ...this.buildPregInfInicial(this.datosPII3),              
            ]
          }, //margin: [15, 0, 30, 0],
          //layout: 'noBorders'
        },
        {
          text:'\nResultado del análisis de los tres aspectos se tiene las siguientes observaciones generales:',
          style: 'textDato', alignment:'justify', bold: true
        },
        {
          text: this.datosII[0].obs_general,
          style: 'textDato', alignment: 'justify'
        },
        {
          text: '\nAsi mismo, en el punto 4. CONCLUSIONES, indica:',
          style: 'textDato', alignment:'justify'
        },
        {
          text: this.datosII[0].conclusion,
          style: 'textDato', alignment: 'justify', //margin: [15, 0, 20, 0]
        },
        {
          table: {
            widths: ['*', 50],
            body: [
              ...this.buildPregInfInicial(this.datosPII4),              
            ]
          }, //margin: [15, 0, 20, 0],
          layout: 'noBorders'
        },
        {
          text: '\nSiendo que la supervisión de obra, mediante INFORME DE SUPERVISION ' + this.datosEnvio[0].cod_carpeta + '-' + this.datosII[0].cite + 
                '-' + this.datosII[0].correlativo + ', INFORME INICIAL DE REVISIÓN DE PROYECTO, establece claramente que:\n\n',
          style: 'textDato', alignment:'justify'
        },   
        {
          text: [
            '-  La obra ',
            { text: this.datosPAP[0].sino, bold: true }, 
            ' cuenta con óbice para proseguir con los procesos correspondientes.',
          ],
          style: 'textDato', alignment: 'justify'
        },
        {
          text: this.datosPAP[0].sino == 'Si'
            ? this.datosPAP[0].observaciones
            : ' ',
          style: 'textDato',
          margin: [10, 0, 0, 0], alignment: 'justify'
        },
        {
          text: [
            '-  La obra ',
            { text: this.datosPAP[1].sino, bold: true }, 
            ' requiere coordinación con la Unidad Ejecutora.\n',
          ],
          style: 'textDato', alignment: 'justify'
        }, 
        {
          text: this.datosPAP[1].sino == 'Si'
            ? this.datosPAP[1].observaciones
            : ' ',
          style: 'textDato', margin: [10, 0, 0, 0], alignment: 'justify'
        },
        {
          text: [
            '-  La obra ',
            { text: this.datosPAP[2].sino, bold: true }, 
            ' requiere coordinación con el Sistema de Regulación Municipal (SIREMU).\n'
          ],
          style: 'textDato', alignment: 'justify'
        },
        {
          text: this.datosPAP[2].sino == 'Si'
            ? this.datosPAP[2].observaciones
            : '',
          style: 'textDato',
          margin: [10, 0, 0, 0], alignment: 'justify'
        },
        {
          text:' ',
        },

        {
          text: '3. CONCLUSIONES\n\n',
          style: 'subheader',
        },
        {
          text: this.datosPAP2[0].respuesta + '.\n',
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
            widths: ['50%','50%'],
            body: [
              ...this.buildFiscales2(this.datosFis)
              ]
          },
        },
        {
          text: [
            '\n\n\nCC arch DFO \nCC PIUM \n',
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
      pageMargins: [70, 170, 50, 150] as any, // Márgenes: izquierda, arriba, derecha, abajo

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

  } catch (error) {
    console.error('Error al generar el informe:', error);
    throw new Error('Error al generar el informe: ' + error);   
  }
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
