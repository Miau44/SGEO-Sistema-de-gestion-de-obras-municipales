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

  //para borrar de ser necesario
  async preguntasInforme(obra: number, tipo_informe: number) {
    const query1 = `
    SELECT * FROM public."vista_informe-inicial"  
    WHERE id_obra = ${obra} `;
    const values = [obra, tipo_informe]
    const resultado = await this.sequelize.query(query1);
    return resultado[0];
    console.log('preguntasInforme', resultado[0]);
  }
  async preguntasInformeRestante(obra: number, tipo_informe: number, subtipo: number) {
    const query1 = `
    SELECT * FROM public."vista_informe_inicial_restante"  
    WHERE id_obra = ${obra} AND id_tipo_informe =${tipo_informe} AND id_subtipo=${subtipo}`;
    const values = [obra, tipo_informe]
    const resultado = await this.sequelize.query(query1);
    return resultado[0];
    console.log('preguntasInforme', resultado[0]);
  } 
  buildPreguntaPadre(data: any) {
    let groupedData = data.reduce((acc: any, item: any) => {
      if (!acc[item.padre]) {
        acc[item.padre] = {
          desc_padre: item.desc_padre, 
          items: [],
        };
      }
      acc[item.padre].items.push(item); 
      return acc;
    }, {});

    // Construir la tabla para cada `padre`
    let arrayData = [];

    for (let padre in groupedData) {
      const { desc_padre, items: preguntas } = groupedData[padre]; // Extraer desc_padre y preguntas
      let rowData = [
        {
          table: {
            body: [
              [
                { text:
                   [{ text: padre+': \n', style: 'textTitulo',  alignment: 'center',  margin: [0, 5, 0, 5]},
                    { text: desc_padre +':\n', style: 'textDato',  margin: [0, 5, 0, 5]}], fillColor: '#f0f0f0',},   
              ],                    
              // Segunda fila: Tabla de preguntas agrupadas por `padre`
              [
                {
                  table: {
                    widths: [435, 50],
                    body: [
                      [
                        { text: 'Pregunta:', style: 'textDato', fillColor: '#dddddd' },
                        { text: 'Opción:', style: 'textDato', alignment: 'center', fillColor: '#dddddd' },
                      ],
                      // Preguntas agrupadas
                      ...preguntas.map((pregunta: any) => [
                        { text: pregunta.desc_subtipo, style: 'textDato' },
                        { text: pregunta.opcion , style: 'textDato', alignment: 'center' },
                      ]),
                    ],
                  },
                  layout: 'noBorders',
                },
              ],
            ],
          },
          layout: 'noBorders', // Quitar bordes de la tabla principal
        },
      ];
      arrayData.push(rowData);
    }

    return arrayData;
  }
  buildPreguntas(data: any) {
    let datosResp = data;
    let arrayData = [];
    var c = 0;
    for (let i = 0; i < datosResp.length; i++) {
      let rowData =
        [
          { text: [{ text: datosResp[i].desc_subtipo, style: 'textDato' }] },
          { text: [{ text: datosResp[i].opcion, style: 'textDato', alignment: 'center', }] },
        ];
      arrayData.push(rowData);
    }
    return arrayData;
  }

  // 14_Form_documentosContrato2
  async generateDocumentoContrato2(obra: number): Promise<Buffer> {

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
    const imgLogoPath = 'assets/images/logoSGEO.png';

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
          text: 'DATOS DEL PROYECTO. \n\n',
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
          text: '\nDocumentación Complementaría. \n\n',
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

  //15_info_Sol_anticipo
  async generateInformeSoliAnticipio(obra: number): Promise<Buffer> {

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
      pageSize: 'LEGAL' as any,
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
          text: '\n\n\nINFORME.\n\n\n',
          style: 'header', alignment: 'center'
        } as any,
        {
          table: {
            widths: ['15%', '85%'],
            body: [
              [
                { text: 'A:', style: 'textTitulo', margin: [0, 5, 0, 5] },
                { 
                  text: `${this.datosEnvio[0].cod_carpeta}\nJEFE UNIDAD EJECUTORA`, 
                  style: 'textDato', 
                  margin: [0, 5, 0, 5] 
                },
              ],
              [
                { text: 'DE:', style: 'textTitulo', margin: [0, 5, 0, 5] },
                { 
                  text: `${this.datosEnvio[0].desc_carpeta}\nSUPERVISOR DE OBRA`, 
                  style: 'textDato', 
                  margin: [0, 5, 0, 5] 
                },
              ],
              [
                { text: 'REF:', style: 'textTitulo', margin: [0, 5, 0, 5] },
                { 
                  text: 'INFORME INICIAL DE REVISIÓN DEL PROYECTO', 
                  style: 'textDato', 
                  margin: [0, 5, 0, 5] 
                },
              ],
              [
                { text: 'FECHA:', style: 'textTitulo', margin: [0, 5, 0, 5] },
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
          text: 'De mi consideración:\nEn el marco del contrato GAMLP-XXX/2024 se emite el presente informe de solicitud de pago de anticipo a favor de la empresa ASOCIACIÓN ACCIDENTAL "ILLIMANI".\n',
          style: 'textDato',
        },
        {
          text: '\n 1.DATOS DE LA OBRA.\n\n',
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
          text: '\n 2.ANTECEDENTES.\n\n',
          style: 'subheader',
        },
        {
          table: {
            widths: [100, '*'],
            body: [
              [
                { text: [{ text: 'Número de Contrato:', style: 'textTitulo', alignment: 'right' },], fillColor: '#f0f0f0' },
                { text: [{ text: this.datosEnvio[0].cod_carpeta, style: 'textDato' }], fillColor: '#f0f0f0' }
              ],

              [
                { text: [{ text: 'Monto de Contrato:\n', style: 'textTitulo', alignment: 'right' },] },
                { text: [{ text: this.datosEnvio[0].desc_carpeta + '\n', style: 'textDato' }] }
              ],

              [
                { text: [{ text: 'Garantía Presentada:\n', style: 'textTitulo', alignment: 'right' },], fillColor: '#f0f0f0' },
                { text: [{ text: this.datosEnvio[0].desc_zona_carpeta + '\n', style: 'textDato' }], fillColor: '#f0f0f0' }
              ],

              [
                { text: [{ text: 'Monto de Cobertura de Garantía:\n', style: 'textTitulo', alignment: 'right' },] },
                { text: [{ text: this.datosEnvio[0].total_carpeta + '\n', style: 'textDato' }] }
              ],

              [
                { text: [{ text: 'Fecha fin de vigencia de Garantía:\n', style: 'textTitulo', alignment: 'right' },], fillColor: '#f0f0f0' },
                { text: [{ text: this.fechaString(this.datosEnvio[0].fecha_validacion_carpeta) + '\n\n', style: 'textDato' }], fillColor: '#f0f0f0' }
              ]
            ]
          },
          layout: 'noBorders'
        },

        {
          text: '\n 3.ANALISIS.\n',
          style: 'subheader',
        },
        {
          text: '\nDe acuerdo a la garantía presentada por la empresa ASOCIACIÓN ACCIDENTAL "ILLIMANI", para la obra OBRAS DE MEJORAMIENTO VIAL CALLE ABDON SAAVEDRA ENTRE AVENIDA LANDAETA Y CALLE MENDEZ ARCOS DISTRITO 3, la misma cumple las condicionantes requeridas en el contrato de obra por lo que corresponde el desembolso del anticipo por el monto de Bs.760.155,26 (SETECIENTOS SESENTA MIL CIENTO CINCUENTA Y CINCO 26/100 BOLIVIANOS). \n',
          style: 'textDato',
        },

        {
          text: '\n 4.CONCLUSION.\n',
          style: 'subheader',
        },
        {
          text: '\n- La garantía presentada por la empresa ASOCIACIÓN ACCIDENTAL "ILLIMANI”, cumple con los requisitos establecidos en el contrato GAMLP - 1930/2023 referido al anticipo de la obra de referencia.\n'
            + '\n- El monto a desembolsar asciende a la suma de Bs.760.155,26 (SETECIENTOS SESENTA MIL CIENTO CINCUENTA Y CINCO 26/100 BOLIVIANOS).\n',
          style: 'textDato',
        },
        {
          text: '\n 5.RECOMENDASÍON.\n',
          style: 'subheader',
        },
        {
          text: '\nLa supervisión de obra recomienda la prosecución del presente trámite de acuerdo a lo expuesto.\n\n',
          style: 'textDato',
        },
        {
          table: {
            widths: ['50%', '50%'], // Distribución equitativa entre las dos columnas
            body: [
              [
                {
                  text: 'ARQ. PAOLA ELFRIDE MUÑOZ ALMANZA\nSUPERVISOR',
                  alignment: 'center',
                  bold: true,
                  margin: [0, 25, 0, 0], // Márgenes internos
                  fontSize: 10,
                },
                {
                  text: '(Firma y Sello)',
                  alignment: 'center',
                  margin: [0, 35, 0, 0],
                  fontSize: 10,
                },
              ],
              [
                {
                  text: 'ING. WILFREDO LUIS ARI MERCADO\nSUPERVISOR',
                  alignment: 'center',
                  bold: true,
                  margin: [0, 25, 0, 0],
                  fontSize: 10,
                },
                {
                  text: '(Firma y Sello)',
                  alignment: 'center',
                  margin: [0, 35, 0, 0],
                  fontSize: 10,
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
            '\n\nDOC. ADJUNTOS \nPlanilla de Pago de Anticipo \nGarantía de Anticipo\n',
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

  //16_INSTRUCCION_OrdenProceder_rev01 
  async generatecartaInstruccionesOrdeProcedeRev(obra: number): Promise<Buffer> {


    const documentDefinition = {
      pageSize: 'LETTER' as any,
      pageMargins: [70, 60, 50, 30] as any,

      header: {

      } as any,
      content: [
       
        {
          text: 'La Paz, 08 de octubre de 2024',
          alignment: 'right',
          margin: [0, 0, 0, 20],
          style: 'fecha',
        }as any,

        {
          text: 'EMA-106-2024-RPC/RPA-1',
          alignment: 'right',
          margin: [0, 0, 0, 20],
          style: 'codigo',
        },
  
        // Destinatarios
        {
          text: 'Señor(es):',
          style: 'titulo',
          margin: [0, 0, 0, 10],
        },
        {
          text: [
            'ING. JOSE ANTONIO MIRANDA LOAYZA\n',
            'ING. JOSE ANTONIO MIRANDA LOAYZA\n',
            'SUPERVISOR(ES) DE OBRA\n', //negrita
            'Presente.-', //debe esta subrayado
          ],
          style: 'contenido',
          margin: [0, 0, 0, 20],
        },

        // Referencia
      {
        text: [
          { text: 'Ref.: ', style: 'titulo', alignment: 'right',decoration: 'underline' },
          { text: 'EMISIÓN DE ORDEN DE PROCEDER\n', style: 'contenido' ,alignment: 'right', bold: true, decoration: 'underline'},
          { text: 'Obra: Asfaltado Calle 6 entre Calles B y C Zona Alto Escobar Uría\n', style: 'contenido',alignment: 'right' ,bold: true, decoration: 'underline'},
          { text: 'Código: EMA-106-2024\n', style: 'contenido',alignment: 'right',bold: true,decoration: 'underline' },
        ],
        margin: [0, 0, 0, 20],
      },

      // Cuerpo de la carta
      {
        text: [
          { text: 'De mi consideración:\n\n', style: 'contenido' },
          {
            text: 'En atención al informe de Supervisión EMA-106-2024-ISUP-1 con referencia "Informe Inicial de revisión del Proyecto" y el informe de Fiscalización EMA-106-2024-IFI-5 con referencia "Informe de Actividades Previas" correspondientes a la obra EMA-106-2024 ASFALTADO CALLE 6 ENTRE CALLES B Y C ZONA ALTO ESCOBAR URÍA, en los que se establece que la obra cuenta con la documentación necesaria y no se requieren actividades previas al inicio de la obra.\n\n',
            style: 'contenido',
            lineHeight: 1,
          },
          {
            text: 'En tal sentido, se instruye la emisión de la Orden de Proceder de la obra de referencia dentro de los plazos establecidos en la normativa vigente.\n\n',
            style: 'contenido',
            lineHeight: 1,
          },
          {
            text: 'Sin otro particular, saludo a usted con las consideraciones más distinguidas.',
            style: 'contenido',
          },
        ],
        margin: [0, 0, 0, 20],
      },

        // Firma
        {
          text: 'Atentamente,\n\n\n',
          style: 'contenido',
          alignment: 'left',
        },
        {
          text: 'LIC. JUANITO PEREZ\nRPC/RPA',
          style: 'firma',
          alignment: 'center',
          margin: [0, 20, 0, 0],
        },

        {
          text: [
            '\n\nDOC. ADJUNTOS \nPlanilla de Pago de Anticipo \nGarantía de Anticipo\n', //eata parte tiene que ser dinamicos
          ],
          style: 'footerText'
        },
  
      ],


      styles: {
        fecha: {
          fontSize: 10,
          bold: false,
        },
        codigo: {
          fontSize: 10,
          bold: true,
        },
        titulo: {
          fontSize: 12,
          bold: true,
        },
        footerText: {
          fontSize: 6,
          bold: false,
        },
        contenido: {
          fontSize: 10,
          bold: false,
        },
        firma: {
          fontSize: 10,
          bold: true,
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

  //17_Orden_de_Proceder_REV01
  async generateOrdenProcederREV01(obra: number): Promise<Buffer> {

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
      pageSize: 'LEGAL' as any,
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
          text: 'MEMORANDUM\nOBN-95-2024-MI-1\n',
          style: 'header',
          alignment: 'center',
          margin: [0, 10],
        }as any,

        {
          columns: [
            [
              { text: 'GOBIERNO AUTÓNOMO MUNICIPAL DE LA PAZ', style: 'header', alignment: 'center' },
              { text: 'La Paz, 18 de abril de 2024', style: 'subheader', alignment: 'center' },
            ],
            // Línea vertical
            {
              canvas: [{ type: 'line', x1: 0, y1: 0, x2: 0, y2: 50, lineWidth: 1 }],
              width: 10,
            },
            [
              { text: 'Señor(a):', style: 'subheader', alignment: 'left' },
              { text: 'VM 3600 S.R.L.', style: 'normal', alignment: 'left' },
              { text: 'Presente.-', style: 'normal', alignment: 'left' },
            ],
          ],
          columnGap: 10,
        },
        // Línea divisoria
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 495, y2: 0, lineWidth: 1 }] },
        
        // Referencia
        { text: '\nREF. ORDEN DE PROCEDER\n', style: 'header', alignment: 'center', margin: [0, 10] },
  
        {
          table: {
            widths: [120, '*'],
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
                { text: [{ text: 'UNIDAD EJECUTORA:\n', style: 'textTitulo', alignment: 'right' },], fillColor: '#f0f0f0' },
                { text: [{ text: this.fechaString(this.datosEnvio[0].fecha_validacion_carpeta) + '\n\n', style: 'textDato' }], fillColor: '#f0f0f0' }
              ]
            ]
          },
          //layout: 'noBorders'
          margin: [0, 10],
        },

        {
          text: [
            { text: 'Señor(a):\n\n', style: 'contenido' },
            {
              text: 'Habiéndose suscrito el contrato de la obra CONSTRUCCION ENLOSETADO Y OBRAS COMPLEMENTARIAS CALLE 2 ENTRE CALLE 4 Y CALLE 5 ZONA ENTEL 24, comunicamos que a partir del día 22 de abril de 2024, se contabilizará el plazo de ejecución de 44 días calendario establecidos en el contrato GAMLP-XXX/2024.\n\n',
              style: 'contenido',
              lineHeight: 1,
            },
            {
              text: 'En tal sentido, la obra deberá ser ejecutada en estricto cumplimiento del contrato de obra, especificaciones técnicas, tiempo de ejecución, los plazos estableciendo y documentos que forman parte del contrato.\n\n',
              style: 'contenido',
              lineHeight: 1,
            },
            {
              text: 'Atentamente,',
              style: 'contenido',
            },
          ],
          margin: [0, 0, 0, 20],
        },

        {
          text: '\nSUPERVISOR(ES) DE OBRA\n',
          style: 'textDato',
          alignment: 'center',
          margin: [0, 30],
        },
        {
          text: 'NOTIFICACIÓN AL CONTRATISTA\n',
          style: 'textDato',
          alignment: 'center',
          margin: [0, 10],
        },
        {
          // Lugar y Fecha
          table: {
            widths: ['*'],
            body: [
              [
                { text: 'LUGAR: ...............................................................................................................', style: 'normal', },
              ],
              [
                { text: 'FECHA: ____/____/____', style: 'normal', },
              ],
            ],
          },
          layout: 'noBorders',
          margin: [0, 15],
        },
        {
          // Nombre, Apellido y Firma
          columns: [
            [
              { text: 'NOMBRE Y APELLIDO:', style: 'normal',},
              { text: '....................................................................................................................', style: 'normal', margin: [0, 13] },
            ],
            { text: 'FIRMA:', style: 'normal', margin: [3, 21] },
          ],
        },
        { text: '..............................................', alignment: 'left', margin: [0, -1]  },
        { text: 'c.c. Arch.', style: 'normal', alignment: 'left', margin: [0, 40] },
      
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
          color: 'gray',
        },
        textTitulo: {
          fontSize: 10,
          bold: true,
        },
        textDato: {
          fontSize: 10,
        },
        normal: {
          fontSize: 10,
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

  //18_inf_revisionPagos_REV
  async generateInformeRevisionPagos(obra: number): Promise<Buffer> {

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
    const imgLogoPath = 'assets/images/logoSGEO.png';

    const documentDefinition = {
      pageSize: 'LEGAL' as any,
      watermark: { text: 'SGEO', color: 'blue', opacity: 0.1, bold: true, italics: false },

      header: {
        columns: [
          // Columna del texto centrado
          {
            text: 'Secretaría Municipal de Infraestructura Pública',
            style: 'coloredText',
            alignment: 'center',
            margin: [0, 15, 0, 0]
          },
        ],
        margin: [40, 10]
      } as any,
      
      content: [
        {
          columns: [
            { image: imgPath, width: 120, margin: [0, 0, 5, 0] }, // Primera imagen
            { image: imgLogoPath, width: 120, margin: [5, 30, 0, 0] }, // Segunda imagen,
            {
              stack: [
                { text: '\n\nINFORME.\n', style: 'header', alignment: 'center', margin: [0, 10, 0, 0] },
                { text: 'OBN-476-2024-ISUP-4', style: 'subheader', alignment: 'center', margin: [0, 0, 0, 0] }
              ],
              width: 'auto',
              margin: [70, 0, 10, 0]
            }
          ],
          margin: [10, 0, 10, 0]
        } as any,
        
        {
          table: {
            widths: ['15%', '85%'],
            body: [
              [
                { text: 'A:', style: 'textTitulo', margin: [0, 6, 0, 0] },
                { 
                  text: `${this.datosEnvio[0].cod_carpeta}`, 
                  style: 'textDato', 
                  margin: [0, 5, 0, 5] 
                },
              ],
              [
                { text: 'DE:', style: 'textTitulo', margin: [0, 6, 0, 0] },
                { 
                  text: `${this.datosEnvio[0].desc_carpeta}\nSUPERVISOR DE OBRA`, 
                  style: 'textDato', 
                  margin: [0, 5, 0, 5] 
                },
              ],
              [
                { text: 'REF:', style: 'textTitulo', margin: [0, 6, 0, 0] },
                { 
                  text: 'INFORME INICIAL DE REVISIÓN DEL PROYECTO', 
                  style: 'textDato', 
                  margin: [0, 5, 0, 5] 
                },
              ],
              [
                { text: 'FECHA:', style: 'textTitulo', margin: [0, 6, 0, 0] },
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
          margin: [20, 10, 20, 10], // Márgenes de la tabla
        },
        
        {
          text: 'Habiendo sido designado como Supervisor de la obra OBN-476-2024 y habiendo emitido el memorándum de Orden de Proceder, se informa lo siguiente:\n',
          style: 'textDato',
        },
        {
          text: '\n 1.DATOS DE LA OBRA.\n\n',
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
          text: '\n 2. ANÁLISIS.\n\n',
          style: 'subheaderText',
        },
        {
          text: 'En función al plazo de ejecución de la obra y realizado el análisis de los aspectos administrativos relativos al pago de planillas y fechas previstas de cierre financiero de la obra, se tiene el siguiente detalle de los puntos evaluados:\n',
          style: 'normalText',
        },
        {
          text: [
            { text: '- Certificado(s) de pago consignados en Contrato de Obra: ', style: 'normalText' },
            { text: 'Pago Único/parciales – Liquidación final', style: 'highlight' },
        
            { text: '\n- Número estimado de certificados: ', style: 'normalText' },
            { text: '1/2/...', style: 'highlight' },
        
            { text: '\n- Fecha de Orden de Proceder: ', style: 'normalText' },
            { text: '31/05/2024', style: 'highlight' },
        
            { text: '\n- Fecha estimada de Recepción Provisional: ', style: 'normalText' },
            { text: '04/07/2024', style: 'highlight' },
        
            { text: '\n- Plazo mínimo entre la Recepción Provisional y Definitiva (conforme a normativa vigente): ', style: 'normalText' },
            { text: '30 dc.', style: 'highlight' },
        
            { text: '\n- Fecha estimada de Recepción Definitiva: ', style: 'normalText' },
            { text: '03/08/2024', style: 'highlight' }
          ],
          margin: [20, 0, 0, 0]
        },
        {
          text: '\n 3. CONCLUSIONES.\n\n',
          style: 'subheaderText',
        },
        {
          text: 'En base a lo anterior, se concluye que:\nSe tiene previsto XXX certificados de pago para la Obra OBN-476-2024 - CONSTRUCCION OBRAS DE ESTABILIZACION DE TALUD Y OBRAS COMPLEMENTARIAS CALLE S/N 1 ENTRE PASAJE PEATONAL 8 Y CALLE 7 ZONA CRISTO REY.',
          style: 'normalText',
        },

        {
          text: '\n 5.RECOMENDASÍON.\n',
          style: 'subheader',
        },
        {
          text: '\nEn base a lo descrito, se recomienda remitir el presente informe a la Unidad Ejecutora. \nEs cuanto se informa para los fines consiguientes.\n\n',
          style: 'textDato',
        },
        {
          table: {
            widths: ['50%', '50%'], // Distribución equitativa entre las dos columnas
            body: [
              [
                {
                  text: 'ARQ. PAOLA ELFRIDE MUÑOZ ALMANZA\nSUPERVISOR',
                  alignment: 'center',
                  bold: true,
                  margin: [0, 25, 0, 0], // Márgenes internos
                  fontSize: 10,
                },
                {
                  text: '(Firma y Sello)',
                  alignment: 'center',
                  margin: [0, 35, 0, 0],
                  fontSize: 10,
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
        
      ],
      styles: {
        coloredText: { fontSize: 12, bold: true, color: '#000000' },
        headerText: { fontSize: 16, bold: true },
        subheaderText: { fontSize: 10, bold: true },
        highlight: {
          fontSize: 9,
          bold: true,
        },
      }
    }
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
