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
export class InformeModificacionFiscal {
  datosEnvio: any = [];
    datosFis: any = [];
    datosModAp: any = [];
    datosMod: any = [];
    datosInf: any = [];
    datosAF: any = [];
    datosSaf: any = [];
    datosSec: any = [];

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

  // Datos generales obra - contrato - modificacion
  async datosGeneralesObraModif(id_modif_pago: number) {
    const query1 = `
        SELECT * 
        FROM public.vista_reporte_modificacion_gral WHERE id_modificacion_pago = ${id_modif_pago}`;
    const resultado = await this.sequelize.query(query1);
    return resultado[0];
  }

     // FISCALES designados por obra 
   async fiscalDesignado(obra: number) {
    const query1 = `
        SELECT * 
        FROM public.vista_fiscales_obra WHERE id_obra = ${obra}`;
    const resultado = await this.sequelize.query(query1);
    return resultado[0];
   }

    // Resumen de Modificaciones Aprobadas por obra 
   async modificacionesAprobadas(obra: number) {
    const query3 = `
        SELECT * 
        FROM public."vista_reporte_modif_aprobadas" WHERE id_obra = ${obra}`;
    const resultado3 = await this.sequelize.query(query3);
    return resultado3[0];
   }

   // Resumen de Modificacion Actual 
   async modificacionActual(solicitud: number) {
    const query3 = `
        SELECT * 
        FROM public."vista_reporte_modif_aprobadas" WHERE id_obra = ${solicitud}`;
    const resultado3 = await this.sequelize.query(query3);
    return resultado3[0];
   }

   // Datos informes de Supervisor y Fiscal
  async datosInformesSF(id_modif_pago: number) {
    const query2 = `
        SELECT * 
        FROM public."vista_reporte_memoOC" WHERE id_modificacion_pago = ${id_modif_pago}`;
    const resultado2 = await this.sequelize.query(query2);
    return resultado2[0];
  }

  //--Datos Aprobador Fiscal
    async datosAprobadorFiscal(obra: number) {
      const query3 = `
          SELECT * 
          FROM public."vista_reporte_aprobador_fiscal_obra" WHERE id_obra = ${obra}`;
      const resultado3 = await this.sequelize.query(query3);
      return resultado3[0];
  }

  //--Datos SAF DA
    async datosSafes(obra: number) {
      const query4 = `
          SELECT * 
          FROM public."vista_reporte_saf" WHERE id_obra = ${obra}`;
      const resultado4 = await this.sequelize.query(query4);
      return resultado4[0];
  }

  //--Datos MAE - SMIP
    async datosSecretario(obra: number) {
      const query5 = `
          SELECT * 
          FROM public."vista_reporte_mae_SMIP"`;
      const resultado5 = await this.sequelize.query(query5);
      return resultado5[0];
  }

// REPORTE - INFORME MODIFICACION FISCAL

async generateInformeModificacionFiscal(id_modif_pago: number): Promise<Buffer> {

  const datosGenerales = await this.datosGeneralesObraModif(id_modif_pago);
  if ((!datosGenerales || (Array.isArray(datosGenerales) && datosGenerales.length === 0) || (typeof datosGenerales === 'object' && Object.keys(datosGenerales).length === 0))){
    throw new Error('No se encontraron datos para el ID de la obra proporcionada');
  }
  this.datosEnvio = datosGenerales;

  const res1 = await this.fiscalDesignado(this.datosEnvio[0].id_obra);
  if (!res1 || (Array.isArray(res1) && res1.length === 0) || (typeof res1 === 'object' && Object.keys(res1).length === 0)) {
      throw new Error('No se encontraron datos del fiscal designado');
  }
  this.datosFis = res1;

    const res2 = await this.modificacionesAprobadas(this.datosEnvio[0].id_obra);
  // if (!res2 || (Array.isArray(res2) && res2.length === 0) || (typeof res2 === 'object' && Object.keys(res2).length === 0)) {
  //     throw new Error('No se encontraron datos de las modificaciones de la obra');
  // }
  this.datosModAp = res2;

    const res3 = await this.modificacionActual(this.datosEnvio[0].id_obra);
  if (!res3 || (Array.isArray(res3) && res3.length === 0) || (typeof res3 === 'object' && Object.keys(res3).length === 0)) {
      throw new Error('No se encontraron datos de las modificación');
  }
  this.datosMod = res3;

  const res4 = await this.datosInformesSF(id_modif_pago);
    if (!res4 || (Array.isArray(res4) && res4.length === 0) || (typeof res4 === 'object' && Object.keys(res4).length === 0)) {
      throw new Error('No se encontraron datos de los informes de Sup/Fis');
    }
    this.datosInf = res4;

  const res5 = await this.datosAprobadorFiscal(this.datosEnvio[0].id_obra);
    if (!res5 || (Array.isArray(res5) && res5.length === 0) || (typeof res5 === 'object' && Object.keys(res5).length === 0)) {
      throw new Error('No se encontraron del Aprobador');
    }
    this.datosAF = res5;

  const res6 = await this.datosSafes(this.datosEnvio[0].id_obra);
    if (!res6 || (Array.isArray(res6) && res6.length === 0) || (typeof res6 === 'object' && Object.keys(res6).length === 0)) {
      throw new Error('No se encontraron del SAF-RPA');
    }
    this.datosSaf = res6;

  const res7 = await this.datosSecretario(this.datosEnvio[0].id_obra);
    if (!res7 || (Array.isArray(res7) && res7.length === 0) || (typeof res7 === 'object' && Object.keys(res7).length === 0)) {
      throw new Error('No se encontraron del Secretario de la SMIP');
    }
    this.datosSec = res7;

  const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
  const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
  const imgPath = 'assets/images/membretado_oficio.png';
  const marcaAgua = this.datosEnvio[0].fecha_aprobacion;

  const formatoNumerico2 = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
    });

    //console.log('DATOS MODIFICACION',this.datosAF);
 
    const documentDefinition = {
    pageSize: 'LEGAL' as any,
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
        text: 'INFORME\n',
        style: 'header', alignment: 'center'
      } as any,
      {
        text: this.datosEnvio[0].cod_carpeta + '-' + this.datosInf[0].cite_fis + '-' + this.datosInf[0].correlativofis,
        style: 'subheader', alignment: 'center'
      },
      {
        text: '\n',
      },
      {
          table: {
            widths: ['15%', '85%'],
            body: [
              [
                { text: 'A:', style: 'textTitulo', margin: [0, 5, 0, 5], alignment: 'right' },
                {
                  text: (() => {
                    const da = this.datosAF[0].desc_cod_da;
                    const monto = this.datosEnvio[0].monto_contrato;
                    const nombreDA = this.datosSaf[0].nombre_da;
                    const nombreSAF = this.datosSaf[0].nombre_saf;
                    const aprobador = this.datosAF[0].aprobador;

                    if (da >= 37 && da <= 45) {
                      if (monto > 500000) {
                        return [
                          { text: aprobador + '\n', style: 'textDato' },
                          { text: nombreDA, style: 'textTitulo' }
                        ];
                      } else {
                        return [
                          { text: nombreSAF + '\n', style: 'textDato' },
                          { text: nombreDA, style: 'textTitulo' }
                        ];
                      }
                    } else {
                      console.log('DATOS MODIFICACION',this.datosAF);
                      if (monto > 500000) {
                        return [
                          { text: this.datosSec[0].nombre_sec + '\n', style: 'textDato' },
                          { text: this.datosSec[0].nombre_da, style: 'textTitulo' }
                        ];
                      } else {
                        return [
                          { text: nombreSAF + '\n', style: 'textDato' },
                          { text: nombreDA, style: 'textTitulo' }
                        ];
                      }
                    }
                  })(),
                  style: ''
                }   
                  
              ],
              //Fila VIA: solo si la condición NO se cumple
              ...(
                this.datosAF[0].desc_cod_da >= 37 && this.datosAF[0].desc_cod_da <= 45
                   // No incluir la fila
                  ? []
                  : [[
                      { text: 'VIA:', style: 'textTitulo', margin: [0, 5, 0, 5], alignment:'right' },
                      {
                        text: [
                          { text: this.datosAF[0].aprobador + '\n', style: 'textDato' },
                          { text: 'DIRECTOR DE FISCALIZACIÓN DE OBRAS', style: 'textTitulo' }
                        ],
                        margin: [0, 5, 0, 5]
                      }
                    ]]
              ),
              [
                { text: 'DE:', style: 'textTitulo', margin: [0, 6, 0, 0], alignment: 'right' },
                { 
                  text: [
                      {
                        text: (
                          Array.isArray(this.datosFis)
                            ? this.datosFis
                                .filter(f => f && f.fiscal)
                                .map(f => f.fiscal)
                                .join('\n')  // salto de linea 
                            : ''
                        ) + '\n',
                        style: 'textDato', alignment: 'left'
                      },
                      { text: 'FISCAL(ES) DE OBRA', style: 'textTitulo', alignment: 'left'}
                    ]
                },            
              ],
              [
                { text: 'REF.:', style: 'textTitulo', margin: [0, 5, 0, 5], alignment:'right' },
                { text: [
                    { text: this.datosEnvio[0].desc_subtipo + ' N°' + this.datosEnvio[0].numero_modificacion + '\n', style: 'textTitulo', margin: [0, 5, 0, 5] },
                    { text: this.datosInf[0].referencia, style: 'textDato', margin: [0, 5, 0, 5] }
                        ]
                }
              ],
              [
                { text: 'FECHA:', style: 'textTitulo', margin: [0, 5, 0, 5], alignment:'right' },
                { text: this.fechaString(this.datosEnvio[0].fecha_fiscal), style: 'textDato', margin: [0, 5, 0, 5] },
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
        text: '1.   DATOS DE LA OBRA',
        style: 'textTitulo', margin: [0, 0, 0, 5]
      },
      {
        table: {
          widths: ['*', 300],
          body: [
            [
              { text: [{ text: 'CÓDIGO:', style: 'textTitulo', alignment: 'right' },], fillColor: '#dddddd' },
              { text: [{ text: this.datosEnvio[0].cod_carpeta, style: 'textDato', bold:true }], fillColor: '#dddddd' }
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
              { text: [{ text: 'EMPRESA CONTRATISTA:\n', style: 'textTitulo', alignment: 'right' },] },
              { text: [{ text: this.datosEnvio[0].proponente_razon_social, style: 'textDato' }] }
            ],
            [
              { text: [{ text: 'MONTO CONTRATO INICIAL:\n', style: 'textTitulo', alignment: 'right' },], fillColor: '#dddddd' },
              { text: [{ text: 'Bs.' + this.formatIfNumber(this.datosEnvio[0].monto_contrato,formatoNumerico2), style: 'textDato' }], fillColor: '#dddddd' }
            ],
            [
              { text: [{ text: 'PLAZO DE EJECUCIÓN, CONTRATO INICIAL:', style: 'textTitulo', alignment: 'right' },] },
              { text: [{ text: this.datosEnvio[0].plazo_contrato + ' d.c.', style: 'textDato' }], margin: [0,5,0,0] }
            ],
            [
              { text: [{ text: 'FECHA INICIO DE OBRA:', style: 'textTitulo', alignment: 'right' },], fillColor: '#dddddd' },
              { text: [{ text: this.formatearFecha(this.datosEnvio[0].fecha_inicio_ejecucion), style: 'textDato' }], fillColor: '#dddddd' }
            ],
            [
              { text: [{ text: 'FECHA CONCLUSIÓN PROGRAMADA:', style: 'textTitulo', alignment: 'right' },] },
              { text: [{ text: this.formatearFecha(this.datosEnvio[0].fecha_recep_provisional), style: 'textDato' }] }
            ],
            [
              { text: [{ text: 'TOTAL AMPLIACIÓN DE PLAZO:', style: 'textTitulo', alignment: 'right' },], fillColor: '#dddddd' },
              { text: [{ text: this.datosEnvio[0].dias_variacion, style: 'textDato' }], fillColor: '#dddddd' }
            ],
            [
              { text: [{ text: 'NUEVA FECHA DE CONCLUSIÓN:', style: 'textTitulo', alignment: 'right' },] },
              { text: [{ text: this.formatearFecha(this.datosMod[0].nueva_conclusion), style: 'textDato' }] }
            ],
          ]
        }, margin: [10, 0, 0, 5] 
        //layout: 'noBorders'
      },
      {
        text: '\n2.   ANTECEDENTES',
        style: 'textTitulo', margin: [0, 0, 0, 5] 
      },
    //   ...(
    // this.buildModAprobadas(this.datosModAp).length > 0 
    // ?[
      {
        
        table: {
          widths: [20, '*', 60, 60, 60, 60, 60],
          body: [
            [
              { text: 'N°', style: 'textTituloT', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
              { text: 'TIPO MODIFICACIÓN', style: 'textTituloT', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
              { text: 'FECHA MODIFICACIÓN', style: 'textTituloT', alignment: 'center', margin: [0, 5, 0, 0], fillColor: '#dddddd' },
              { text: 'VARIACIÓN DEL MONTO(Bs.)', style: 'textTituloT', alignment: 'center', margin: [0, 5, 0, 0], fillColor: '#dddddd' },
              { text: 'MONTO (Bs.)', style: 'textTituloT', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
              { text: 'MODIF. DEL PLAZO(d.c.)', style: 'textTituloT', alignment: 'center', margin: [0, 5, 0, 0], fillColor: '#dddddd' },
              { text: 'FECHA CONCLUSIÓN PROGRAMADA', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
            ],
            ...this.buildModAprobadas(this.datosModAp)
          ]
        }, margin: [10, 0, 0, 0] 
    //   },]
    //   :[]
    // ),
      },
      {
        text: '\n'
      },
      {
          text: 'En atención al informe de la supervisión ' + this.datosEnvio[0].cod_carpeta + '-' + this.datosInf[0].cite_sup + '-' + this.datosInf[0].correlativosup + 
          ' de fecha ' + this.fechaString(this.datosEnvio[0].fecha_supervisor) + ' emitido por la supervisión de obra, que establece los sustentos necesarios para la presente ' + 
          'modificación referida a: ' + this.datosInf[0].referencia + ' se emite el presente informe.',
          style: 'textDato', alignment:'justify', margin: [10, 0, 0, 0]
      }, 
      {
        text: '\n'
      },
      {
        text: '3.   CONCLUSIONES\n',
        style: 'textTitulo', margin: [0, 0, 0, 5]
      },
      {
        text: 'Habiendo la fiscalización designada revisado y analizado el informe de Supervisión ' + this.datosEnvio[0].cod_carpeta + '-' + this.datosInf[0].cite_sup + 
              '-' + this.datosInf[0].correlativosup + ' de fecha ' + this.fechaString(this.datosEnvio[0].fecha_supervisor) + ' emitido por la supervisión ' + 
              'de obra y en atención a que evidentemente se requiere la modificación a ser introducida a través de ' + this.datosEnvio[0].desc_subtipo + ' N°' + 
              this.datosEnvio[0].numero_modificacion + ', a fin de garantizar la conclusión de la obra, así como su utilidad, ésta Fiscalización aprueba el ' + 
              'Informe de Supervisor y recomienda la elaboración y suscripción del ' + this.datosEnvio[0].desc_subtipo + ' N°' + this.datosEnvio[0].numero_modificacion + 
              ' por ' + this.datosInf[0].referencia + '. Se adjunta toda la documentación enviada al efecto por la Supervisión de Obra.',
        style: 'textDato', alignment:'justify', margin: [10, 0, 0, 0]
      },
      {
        text: ['\n'],
      }, 
      {
        text: 'Es cuánto se informa para los fines consiguientes.',
        style: 'textDato', alignment:'justify', margin: [10, 0, 0, 0]
      },
      {
        text: ['\n'],
      },
      {
          table: {
            widths: ['50%','50%'],
            body: [
              ...this.buildFiscales(this.datosFis)
              ]
          }, margin: [20,0,20,0]
        },
      {
        text: ['\n\n\ncc:Arch:' ],
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
        fontSize: 16,
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
    pageMargins: [70, 170, 50, 140] as any, // Márgenes: izquierda, arriba, derecha, abajo

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

//------------------FUNCIONES ------------------------
//funcion para generar la fecha en formato dd/mm/aaa
    formatearFecha(iso: string | null | undefined): string | undefined {
    if (!iso) return undefined; // No hace nada si iso es null, undefined o ''
    
    const fecha = new Date(iso);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Enero = 0
    const anio = fecha.getFullYear();
    
    return `${dia}/${mes}/${anio}`;
   }

   //Funcion para generar la fecha de manera escrita
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

    //Cargar tabla de fiscales
    buildFiscales2(data: any) {
      let datosFiscal = data;
      let arrayData = [];
  
      for (let i = 0; i < datosFiscal.length; i++) {
        let rowData = [
          { text: [{ text: datosFiscal[i].fiscal, style: 'textDato' }] },
        ];
        arrayData.push(rowData);
      }
      return arrayData;
    }

    //Cargar tabla de fiscales - con recuadro
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
                { text: 'FISCAL DE OBRA', bold: true, style: 'textDato' }
                  ],
                alignment: 'center', margin: [0, 35, 0, 0]},
          { text: '(Firma y Sello)', style: 'textDato', alignment: 'center', margin: [0, 45, 0, 0] }
        ];
        arrayData.push(rowData);
      }
      return arrayData;
    }

    // Función para poblar la tabla de modificaciones aprobadas
     buildModAprobadas(data: any) {
    const formatoNumerico5 = new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 5,
    maximumFractionDigits: 5
    });
    const formatoNumerico2 = new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
    });

    let datosResp = data;
    let arrayData = [];
    let totalvariacion = 0;
    let totalplazo = 0;

    var c = 0;
    for (let i = 0; i < datosResp.length; i++) {
      const totalmodif = Number(datosResp[i].monto_variacion) || 0;
      totalvariacion += totalmodif;

      const plazo = Number(datosResp[i].dias_variacion) || 0;
      totalplazo += plazo;

      c = c + 1;
      let rowData = [
        { text: [{ text: c, style: 'textDatoT', alignment: 'center' }] },
        { text: [{ text: datosResp[i].tipo_mod, style: 'textDatoT' }] },
        { text: [{ text: this.formatearFecha(datosResp[i].fecha_memo_minuta), style: 'textDatoT', alignment: 'center', }] },
        { text: [{ text: this.formatIfNumber(datosResp[i].monto_variacion,formatoNumerico5), alignment: 'right', style: 'textDatoT' }] },
        { text: [{ text: this.formatIfNumber(datosResp[i].monto_total,formatoNumerico5), style: 'textDatoT', alignment: 'right' }] },
        { text: [{ text: datosResp[i].dias_variacion, style: 'textDatoT', alignment: 'center' }] },
        { text: [{ text: this.formatearFecha(datosResp[i].nueva_conclusion), style: 'textDatoT', alignment: 'center' }] },
      ];
      arrayData.push(rowData);
    }
    // Fila final con total
      const totalRow = [
        {
          colSpan: 2,
          text: 'TOTAL:',
          style: 'textTituloT', alignment: 'center',
        },
        {}, {}, 
        { text: this.formatIfNumber(totalvariacion, formatoNumerico5),
          style: 'textTituloT', alignment: 'right' }, 
        {}, 
        { text: totalplazo,
          style: 'textTituloT', alignment: 'center' },
        { text: ' ',
          style: 'textTituloT', alignment: 'center', },
      ];

    arrayData.push(totalRow);
    return arrayData;
  }

  // FORMATO DE NUMEROS
  private formatIfNumber(value: any, formatter: Intl.NumberFormat): string {
    if (value === null || value === undefined || value === '') return '';
    
    const num = Number(value);
    if (isNaN(num)) return '';

    return formatter.format(num);
}

}