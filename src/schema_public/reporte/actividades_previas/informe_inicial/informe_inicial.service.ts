

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
export class InformeInicialService {

  datos: any = [];
  datosEnvio: any = [];
  datosSIM: any = [];
  datosPreguntaInforme: any = [];
  datosPreguntaInformeRestante: any = [];
  datosPreguntaInformeConclusion: any = [];
  datosListaSupervisores: any = [];
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
 //CONSULTASSS

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
      return [70, 180, 70, 180];
    }

    return [70, 115, 70, 125];
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


  async datosReporteInformeInicial( obra: number) {
    const query1 = `SELECT * FROM public.vista_reporte_informe_inicial  WHERE  id_obra = ${obra};	`;
    const values = [ obra]
    const resultado = await this.sequelize.query(query1);
    return resultado[0];
  }

  async datosReporteInformeInicialSupervisores(obra: number, permiso:number) {
    const query1 = `SELECT * FROM public.vista_fiscal_supervisor_designacion WHERE id_obra = ${obra} AND id_permiso = 84;	`;
    const values = [ obra, permiso]
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


  async preguntasInforme(obra: number, tipo_informe: number) {
    const query1 = `
    SELECT * FROM public."vista_informe-inicial"  
    WHERE id_obra = ${obra} `;
    const values = [obra, tipo_informe]
    const resultado = await this.sequelize.query(query1);
    return resultado[0];
    //console.log('preguntasInforme', resultado[0]);
  }
  async preguntasInformeRestante(obra: number, tipo_informe: number, subtipo: number) {
    const query1 = `
    SELECT * FROM public."vista_informe_inicial_restante"  
    WHERE id_obra = ${obra} AND id_tipo_informe =${tipo_informe} AND id_subtipo=${subtipo}`;
    const values = [obra, tipo_informe]
    const resultado = await this.sequelize.query(query1);
    return resultado[0];
    //console.log('preguntasInforme', resultado[0]);

  }

  async preguntasInformeConclusion(obra: number, tipo_informe: number, subtipo: number) {
    const query1 = `
    SELECT * FROM public."vista_reporte_informe_inicial_conclusion"  
    WHERE id_obra = ${obra}`;
    const values = [obra, tipo_informe]
    const resultado = await this.sequelize.query(query1);
    return resultado[0];
    //console.log('preguntasInforme', resultado[0]);

  }

    

//PAOLA
//10042025
  //INFORME INICIAL SUPERVISOR 
  async generateInformeInicial(obra:number): Promise<Buffer> {
    //  async generateInformeInicial(usuario:number): Promise<Buffer> {

    const res = await this.datosReporteInformeInicial( obra);
    if (!res || (Array.isArray(res) && res.length === 0) || (typeof res === 'object' && Object.keys(res).length === 0)) {
      throw new Error('No se encontraron datos para la obra y el ID proporcionados.');
    }

    const res2 = await this.preguntasInforme(obra, 235);
    if (!res2 || (Array.isArray(res2) && res2.length === 0) || (typeof res2 === 'object' && Object.keys(res2).length === 0)) {
      throw new Error('No se encontraron datos para la obra y el ID proporcionados.');
    }
    
    const res3 = await this.preguntasInformeRestante(obra, 235, 174);
    if (!res3 || (Array.isArray(res3) && res3.length === 0) || (typeof res3 === 'object' && Object.keys(res3).length === 0)) {
      throw new Error('No se encontraron datos para la obra y el ID proporcionados.');
    }

    const res4 = await this.preguntasInformeConclusion(obra, 235, 174);
    if (!res4 || (Array.isArray(res4) && res4.length === 0) || (typeof res4 === 'object' && Object.keys(res4).length === 0)) {
      throw new Error('No se encontraron datos para la obra y el ID proporcionados.');
    }   
    
    const res5 = await this.datosReporteInformeInicialSupervisores(obra, 84);
    if (!res5 || (Array.isArray(res5) && res5.length === 0) || (typeof res5 === 'object' && Object.keys(res5).length === 0)) {
      throw new Error('No se encontraron datos para la obra y el ID proporcionados.');
    }
  
    this.datosPreguntaInforme = res2;    
    this.datosPreguntaInformeRestante = res3;
    this.datosPreguntaInformeConclusion = res4;    
    this.datosEnvio = res;
    this.datosListaSupervisores = res5;   
    //console.log("datosListaSupervisores", this.datosListaSupervisores);


    const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
    const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
  //  const imgPath = 'assets/images/logo_gamlp.png';
    const imgPathLeft = 'assets/images/logo_smip.png';
    //const imgPath = 'assets/images/membretado_oficio_nuevo.png';
    const gestion = this.datosEnvio[0].gestion_carpeta;
    const imgPath = this.obtenerMembretadoOficioPorGestion(gestion);
    const pageMargins = this.obtenerMargenesOficioPorGestion(gestion);
    const mostrarMarcaAgua = this.datosEnvio[0].informe_aprobado;

    const documentDefinition = {
      pageSize: 'LEGAL' as any,

      /*  background: function(currentPage: any, pageSize: any) { 
          return {
            image: imgPath,
            width: pageSize.width,
            height: pageSize.height,
            absolutePosition: { x: 0, y: 0 },
            opacity: 0.3
          }
        },*/

      background: function (currentPage: any, pageSize: any) {
        return {
          image: imgPath,
          width: pageSize.width,
          height: pageSize.height,
          absolutePosition: { x: 0, y: 0 },
          opacity: 0.9
        };
      },
      ...(!mostrarMarcaAgua && {
        watermark: {
          text: 'PRELIMINAR ',
          color: 'red',
          opacity: 0.3,
          bold: true,
          italics: false
        },
      }
      ),


      content: [
       /* {
          text: 'INFORME.\n ' + this.datosEnvio[0].cite + '\n\n',
          style: 'headerTitle', alignment: 'center'
        } as any,*/

       /* {
          text: 'INFORME.\n ' + this.datosEnvio[0].cite + '\n\n',
          style: 'headerTitle', alignment: 'center'
        } as any,*/        
        {
          text: 'INFORME',
          style: 'headerTitle', alignment: 'center'
        } as any,

        ...(this.datosEnvio[0].informe_aprobado
          ? [{
            text:  this.datosEnvio[0].cite + '\n\n',
            style: 'headerTitle',
            alignment: 'center'
          }]
          : []),

        {
          table: {
            widths: [100, '*'],
            body: [
              [
                { text: 'A:', style: 'textTitulo', alignment: 'left' },
                { text: [
                  { text: this.datosEnvio[0].a_nombre + '\n', style: 'textDato' }, 
                         { text: this.datosEnvio[0].a_cargo, style: 'textTitulo' }] 
                }
              ],
              //VIA se muestra solo si:
              ...( this.datosEnvio[0].via_nombre 
                  ? [ 
                      [
                        { text: 'VIA:', style: 'textTitulo', alignment:'left' },
                        { text: [
                              { text: (this.datosEnvio[0].via_nombre || '') + '\n', style: 'textDato' },
                              { text: (this.datosEnvio[0].via_cargo || ''), style: 'textTitulo' }
                          ]                                             
                        }
                      ]
                    ] 
                  : [] // No incluir la fila
              ),
              [
                { text: 'DE:', style: 'textTitulo', alignment: 'left' },
                { text: [
                      { text: this.datosEnvio[0].de_nombre + '\n', style: 'textDato', alignment: 'left' },
                      { text: this.datosEnvio[0].de_cargo, style: 'textTitulo', alignment: 'left' },
                    ]
                }
              // {
              //   stack: [
              //     {
              //       table: {
              //         widths: ['*'],
              //         body: [
              //           ...this.datosListaSupervisores.map((item: any) => [
              //             {
              //               text: item.nombre,
              //               style: 'textDato',
              //               alignment: 'left'
              //             }
              //           ])
              //         ]
              //       },
              //       layout: 'noBorders',
              //       alignment: 'center'
              //     },
              //     {
              //       text: 'SUPERVISOR DE OBRAS\n\n',
              //       style: 'textTitulo',
              //       alignment: 'left'
              //     }
              //   ]
              // }
              ],

              [
                { text: [{ text: 'REF:\n', style: 'textTitulo', alignment: 'left' },] },
                { text: [{ text: 'INFORME INICIAL DE REVISIÓN DEL PROYECTO\n', style: 'textTitulo' }] }
              ],

              /* [
                 { text: [{ text: 'FECHA:\n', style: 'textTitulo', alignment: 'left' },] },
                 { text: [{ text: this.fechaString( this.datosEnvio[0].fecha_informe) + '\n', style: 'textDato' }] }
               ],*/
              
        
               [
                { text: [{ text: 'FECHA:\n', style: 'textTitulo', alignment: 'left' },] },
                ...(this.datosEnvio[0].informe_aprobado  ? [    
                  { text: [{ text: this.fechaString( this.datosEnvio[0].fecha_informe) + '\n\n', style: 'textDato' }] }
                ]:[ { text: [{ text: '\n\n', style: 'textTitulo', alignment: 'left' },] }] ),
            
              ]
           /*   ...(this.datosEnvio[0].informe_aprobado
                ? [[
                  { text: [{ text: 'FECHA:\n', style: 'textTitulo' }] },
                  { text: [{ text: this.fechaString(this.datosEnvio[0].fecha_informe) + '\n', style: 'textDato' }] }
                ],]
                : []),*/

            ]
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
        },
        {
          text: [
            '\nHabiendo sido designado (s) como Supervisor (es) de la obra ' + '"'+ this.datosEnvio[0].desc_carpeta + '"'
           +' mediante Memorándum(s) '+ this.datosEnvio[0].cites_de  +', de fecha '+  this.datosEnvio[0].fechas_cites_de 
           +' correspondientemente, y tras haber revisado el proyecto, se informa lo siguiente:',
          ], style: 'textDato', alignment: 'justify'           
        },
        {
          text: '\n1.  DATOS DE PROYECTO \n\n',
          style: 'subheader',
        },
        {
          table: {
            widths: [100, '*'],
            body: [
              [
                { text: 'CÓDIGO:', style: 'textTitulo', alignment: 'right', fillColor: '#f0f0f0' },
                { text: this.datosEnvio[0].cod_carpeta, style: 'textDato', fillColor: '#f0f0f0' }
              ],

              [
                { text: 'OBRA:\n', style: 'textTitulo', alignment: 'right' },
                { text: this.datosEnvio[0].desc_carpeta + '\n', style: 'textDato' }
              ],

              [
                { text: 'ZONA:\n', style: 'textTitulo', alignment: 'right', fillColor: '#f0f0f0' },
                { text: this.datosEnvio[0].desc_zona_carpeta + '\n', style: 'textDato', fillColor: '#f0f0f0' }
              ],

              [
                { text: 'MONTO DE PROYECTO:\n', style: 'textTitulo', alignment: 'right' },
                { text: this.datosEnvio[0].total_carpeta + '\n', style: 'textDato' }
              ],

              [
                { text: 'FECHA DE VALIDACIÓN DEL PROYECTO:\n', style: 'textTitulo', alignment: 'right', fillColor: '#f0f0f0' },
                { text: this.fechaString(this.datosEnvio[0].fecha_validacion_carpeta) + '\n\n', style: 'textDato', fillColor: '#f0f0f0' }
              ]
            ]
          },
          //layout: 'noBorders'
        },

        {
          text: '\n2.  ANÁLISIS \n ',
          style: 'subheader',
        },
        {
          table: {
            widths: ['*', 50],
            body: [
              ...this.buildPreguntaPadre(this.datosPreguntaInforme),              
            ]
          },
          layout: 'noBorders'
        },
        {
          text: '\n3. OBSERVACIONES GENERALES \n\n',
          style: 'subheader',
        },
        {
          text: [
            ' Resultado del análisis de los tres aspectos se tienen las siguientes observaciones Generales:\n\n'
          ],
          style: 'textDato', alignment: 'justify'
        },


        {
          text: [this.datosEnvio[0].obs_general
          ],
          style: 'textDato', alignment: 'justify'
        },

        {
          text: '\n4. CONCLUSIONES \n\n',
          style: 'subheader',
        },

        {
          table: {
            widths: [460],
            body: [
              [
                
                { text: [{ text: this.datosPreguntaInformeConclusion[0].desc_subtipo, style: 'textDato' }], fillColor: '#f0f0f0' }
              ],            
            ]
          },
          //layout: 'noBorders'
        },
        {
          text: ['\n' +this.datosEnvio[0].conclusion
          ],
          style: 'textDato', alignment: 'justify'
        },

        {
          text: '\n5. RECOMENDACIONES \n\n',
          style: 'subheader',
        },

        [
          {
            table: {
              widths: ['*', 50],
              body: [

                ...this.buildPreguntas(this.datosPreguntaInformeRestante)
              ],
            },

          },
        ],

        {
          text: '\n\n'
        },

        [
          {
            table: {
              widths: ['*', 50],
              body: [
                [
                  { text: '*** POR LO QUE UNA COPIA DE ESTE INFORME DEBE SER REMITIDO A: A la Fiscalización de la Obra para su remisión a las Unidades Organizacionales requeridas (en caso corresponda).', style: 'textDato', fillColor: '#dddddd' },
                  { text: '', style: 'textDato', alignment: 'center', fillColor: '#f0f0f0' },
                ],

                [
                  { text: 'La Dirección de Fiscalización de Obras para solicitar su coordinación con SIREMU en la ejecución del proyecto.', style: 'textDato', fillColor: '#dddddd' },
                  { text: '', style: 'textDato', alignment: 'center', fillColor: '#f0f0f0' },
                ],

              ],
            },

          },
        ],
        {
          text: '\n\n\n\n\n\n\n\n',
        },
        {
          text: [
              { text: this.datosEnvio[0].de_nombre2 + '\n', style: 'textDato', alignment: 'center' },
              { text: this.datosEnvio[0].de_cargo, style: 'textTitulo', alignment: 'center' },
                ]
        },
        {
          text: [
            '\n\n\n\n\n\n\nCc.Arch.Supervisor',
          ], style: 'footerText'
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
          fontSize: 9,
          bold: true,
        },
        textDato: {
          fontSize: 9,
          bold: false,
          //color: 'gray', 
          opacity: 0.8,
        },

        headerText: {
          fontSize: 12,
          bold: true,
          color: '#333333',
        },
        headerTitle: {
          fontSize: 13,
          bold: true,
          color: '#333333'
        }


      },
      //pageMargins: [70, 120, 60, 60] as any, // Márgenes: izquierda, arriba, derecha, abajo  
      pageMargins: pageMargins as any // Márgenes: izquierda, arriba, derecha, abajo            

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
// FUNCIONES VARIOS

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

    //Cargar tabla de Supervisores - con recuadro
    buildFiscales(data: any[]) {
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
                { text: 'SUPERVISOR DE OBRA', bold: true, style: 'textDato' }
                  ],
                alignment: 'center', margin: [0, 35, 0, 0]},
          { text: '(Firma y Sello)', style: 'textDato', alignment: 'center', margin: [0, 45, 0, 0] }
        ];
        arrayData.push(rowData);
      }
      return arrayData;
    }


  //Función para generar de manera escrita el monto del dinero
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
  // Eliminar espacios y símbolos excepto dígitos, punto y coma
  const cleanValue = value.replace(/[^\d.,]/g, '');

  // Reemplazar el punto (.) por vacío solo si es separador de miles
  const normalized = cleanValue.replace(/\./g, '').replace(',', '.');

  const number = parseFloat(normalized);

  if (isNaN(number)) throw new Error('Valor inválido');

  const integerNumber = Math.floor(number);
  const decimalNumber = Math.round((number - integerNumber) * 100);

  const integerWords = this.numberToWords(integerNumber).trim();
  const decimalWords = `${decimalNumber.toString().padStart(2, '0')}/100`;
  const currencyWords = this.getCurrencyWord(currency);

  return `${integerWords} ${decimalWords} ${currencyWords}`;
}

private numberToWords(value: number): string {
  if (value === 0) return 'CERO';
  if (value < 10) return this.unidades[value];
  if (value === 10) return 'DIEZ';
  if (value > 10 && value < 20) return this.especiales[value - 11];
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
    if (value === 100) return 'CIEN';
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
    case 'Bs':
      return 'BOLIVIANOS';
    case '$':
    case 'USD':
      return 'DÓLARES';
    case '€':
    case 'EUR':
      return 'EUROS';
    default:
      throw new Error(`Moneda no soportada: ${currency}`);
  }
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
                {
                  text:
                    [{ text: padre + ': \n', style: 'textTitulo', alignment: 'center', margin: [0, 5, 0, 5] },
                    { text: desc_padre + ':\n', style: 'textDato', margin: [0, 5, 0, 5] }], fillColor: '#f0f0f0',
                },
              ],
              // Segunda fila: Tabla de preguntas agrupadas por `padre`
              [
                {
                  table: {
                    widths: [405, 50],
                    body: [
                      [
                        { text: 'Pregunta:', style: 'textDato', fillColor: '#dddddd' },
                        { text: 'Opción:', style: 'textDato', alignment: 'center', fillColor: '#dddddd' },
                       // { text: 'Observación:', style: 'textDato', alignment: 'center', fillColor: '#dddddd' },
                      ],
                      // Preguntas agrupadas
                      ...preguntas.map((pregunta: any) => [
                       // { text: pregunta.desc_subtipo + '\n'+ pregunta.observaciones , style: 'textDato' },                                                         
                       {
                        text: [
                          { text: pregunta.desc_subtipo + '\n', style: 'textTitulo' },
                          { text: pregunta.observaciones, italics: true, style: 'textDato' , alignment: 'justify'}
                        ]
                      },
                      
                        { text: pregunta.opcion, style: 'textTitulo', alignment: 'center' },
                       // { text: pregunta.observaciones, style: 'textDato', alignment: 'justify' },

                      
                      
                      ]),
                    ],
                  },
                 // layout: 'noBorders',
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

}
