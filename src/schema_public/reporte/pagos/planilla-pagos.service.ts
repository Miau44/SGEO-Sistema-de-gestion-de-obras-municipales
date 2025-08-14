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
import { TDocumentDefinitions } from 'pdfmake/interfaces'; 

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
export class PlanillaPago {

    datosEnvio: any = [];
    datosSup: any = [];
    datosFis: any = [];
    datosPlanilla: any = [];
    datosPlanillaR: any = [];
    num_modif: any = [];
    datosNuevos: any = [];

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

  // Datos generales obra - contrato - pago
  async datosGeneralesObraModif(id_modif_pago: number) {
    const query = `
        SELECT * 
        FROM public."vista_reporte_pago_gral" WHERE id_modificacion_pago = ${id_modif_pago}`;
    const resultado = await this.sequelize.query(query);
    return resultado[0];
  }

   // SUPERVISORES designados por obra 
   async supervisorDesignado(obra: number) {
    const query1 = `
        SELECT * 
        FROM public."vista_supervisores_obra" WHERE id_obra = ${obra}`;
    const resultado = await this.sequelize.query(query1);
    return resultado[0];
   }

   // FISCALES designados por obra 
   async fiscalDesignado(obra: number) {
    const query1 = `
        SELECT * 
        FROM public."vista_fiscales_obra" WHERE id_obra = ${obra}`;
    const resultado = await this.sequelize.query(query1);
    return resultado[0];
   }

   // Tabla Planilla PAGO
   async planillaReordenamiento(obra: number, npago:number, solicitud: number) {
    const query3 = `
        SELECT * 
        FROM public.f_reporte_planilla_pago(${obra},${npago},${solicitud});`;
    const resultado3 = await this.sequelize.query(query3);
    return resultado3[0];
   }

   // Tabla Planilla Reordenamiento ITEMS ADICIONALES
   async planillaItemsNuevos(obra: number, npago:number, solicitud: number) {
    const query6 = `
        SELECT * 
        FROM public.f_reporte_planilla_pago_adicion(${obra},${npago},${solicitud});`;
    const resultado6 = await this.sequelize.query(query6);
    return resultado6[0];
   }

   // Tabla Planilla RESUMEN
   async planillaResumen(obra: number, solicitud: number) {
    const query4 = `
        SELECT * 
        FROM public.f_reporte_planilla_resumen_pago(${obra},${solicitud});`;
    const resultado4 = await this.sequelize.query(query4);
    return resultado4[0];
   }

   // Resumen de Modificaciones Aprobadas por obra 
   async modificacionesAprobadas(obra: number) {
    const query5 = `
        SELECT count (finalizado) AS num_modif 
        FROM public."vista_reporte_modif_aprobadas" WHERE id_obra = ${obra} AND fecha_memo_minuta IS NOT NULL`;
    const resultado5 = await this.sequelize.query(query5);
    return resultado5[0];
   }
   

// REPORTE - PLANILLA DE REORDENAMIENTO
async generatePlanillaPago(obra: number, id_modificacion_pago: number): Promise<Buffer> {

  const datosGenerales = await this.datosGeneralesObraModif(id_modificacion_pago);
  if ((!datosGenerales || (Array.isArray(datosGenerales) && datosGenerales.length === 0) || (typeof datosGenerales === 'object' && Object.keys(datosGenerales).length === 0))){
    throw new Error('No se encontraron datos para la ID de la obra proporcionada');
  }
  this.datosEnvio = datosGenerales;

  const res1 = await this.supervisorDesignado(obra);
  if (!res1 || (Array.isArray(res1) && res1.length === 0) || (typeof res1 === 'object' && Object.keys(res1).length === 0)) {
      throw new Error('No se encontraron datos del supervisor designado');
  }
  this.datosSup = res1;

  const res2 = await this.fiscalDesignado(obra);
  if (!res2 || (Array.isArray(res2) && res2.length === 0) || (typeof res2 === 'object' && Object.keys(res2).length === 0)) {
      throw new Error('No se encontraron datos del supervisor designado');
  }
  this.datosFis = res2;

  const res3 = await this.planillaReordenamiento(obra, this.datosEnvio[0].numero_pago ,id_modificacion_pago);
  if (!res3 || (Array.isArray(res3) && res3.length === 0) || (typeof res3 === 'object' && Object.keys(res3).length === 0)) {
      throw new Error('No se encontraron datos de la planilla');
  }
  this.datosPlanilla = res3;

  const res4 = await this.planillaResumen(obra, id_modificacion_pago);
  this.datosPlanillaR = res4;

  const res5 = await this.planillaItemsNuevos(obra, this.datosEnvio[0].numero_pago ,id_modificacion_pago);
  this.datosNuevos = res5;

  console.log('DATOS PAGO', this.datosEnvio);
  
    const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logoSGEO.png');
    const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
    //const imgPath = 'assets/images/membretado_oficio.png';
    const imgLogo = 'assets/images/logoSGEO.png'
    const marcaAgua = this.datosEnvio[0].fecha_aprobacion_pago;

    let formatoNumerico: Intl.NumberFormat; //variable para controlar el número de decimales

    if (this.datosEnvio[0].modalidad === 'CONTRATACION DIRECTA') {
      formatoNumerico = new Intl.NumberFormat('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    } else {
      formatoNumerico = new Intl.NumberFormat('de-DE', {
        minimumFractionDigits: 5,
        maximumFractionDigits: 5
      });
    }

  const documentDefinition: TDocumentDefinitions = {
  pageSize: 'LEGAL', 
  pageOrientation: 'landscape', 

  ...(!marcaAgua && {
        watermark: { text: 'PRELIMINAR', color: 'red', opacity: 0.2, bold: true },
      }
      ),
    
    header: {
      columns: [
              { image: imgLogo, width: 130, margin: [5,5,0,0] },
      ],
      
    } as any,

    content: [ 
      {
        text: 'DETALLE DEL CERTIFICADO', 
        style: 'subheader', alignment: 'center'
      },
      {
        text: 'CERTIFICADO DE PAGO ' + this.datosEnvio[0].detalle + ' Nro.' + this.datosEnvio[0].numero_pago, 
        style: 'subheader', alignment: 'center'
      },
      {
        text: '\n',
      },
      {
        text:[
            { text: 'CONTRATISTA: ', style: 'textTitulo2', bold:true },
            { text: this.datosEnvio[0].proponente_razon_social, style: 'textDato'}
            ], margin: [0,0,0,3],    
      },
      {
        text:[
            { text: 'NOMBRE DE LA OBRA: ', style: 'textTitulo2', bold:true },
            { text: this.datosEnvio[0].cod_carpeta + '-' + this.datosEnvio[0].desc_carpeta, style: 'textDato'}
            ], margin: [0,0,0,3],    
      },
      {
        text:[
            { text: 'U.E.: ', style: 'textTitulo2', bold:true },
            { text: this.datosEnvio[0].nombre_ue, style: 'textDato'}
            ], margin: [0,0,0,3],    
      },
      ...(
      this.datosEnvio[0].bandera_modif > 0 
      ?[ //Existen modificaciones
        ...(
        this.datosEnvio[0].bandera_pago > 0 
        ?[ //Hay pago anterior
          {
            table: {
              headerRows: 2, //para que el encabezado se repita en todas las hojas (2=doble fila de encabezado)
              widths: [15, 60, '*', 30, 45, 50, 50, 50, 50, 50, 50,50,50,50,50], // 15 columnas
              body: [
                [
                  { rowSpan: 2, text: 'Nro.', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
                  { rowSpan: 2, text: 'CÓDIGO', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
                  { rowSpan: 2, text: 'DESCRIPCIÓN', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
                  { rowSpan: 2, text: 'UNIDAD', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
                  { colSpan: 3, text: 'CONTRATO INICIAL', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' }, {}, {},
                  { colSpan: 2, text: 'MODIFICACIÓN', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' }, {},
                  { colSpan: 4, text: 'DETALLE CERTIFICADO', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' }, {}, {}, {},
                  { colSpan: 2, text: 'TOTAL ACUMULADO', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },{},
                  
                ],
                [
                  {}, {}, {}, {},//
                  { text: 'CANTIDAD', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                  { text: 'P.U.', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                  { text: 'MONTO (Bs)', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                  { text: 'CANTIDAD APROBADO', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                  { text: 'MONTO APROBADO (Bs)', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                  { text: 'CANTIDAD ANTERIOR', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                  { text: 'MONTO ANTERIOR (Bs)', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                  { text: 'CANTIDAD PRESENTE', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                  { text: 'MONTO PRESENTE (Bs)', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                  { text: 'CANTIDAD', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                  { text: 'MONTO (Bs)', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                  
                ],
               ...this.buildContenidoPlanilla1(this.datosPlanilla, formatoNumerico),
               ...this.buildContPlanillaAd1(this.datosNuevos, formatoNumerico), 
               ...this.buildResumenPlanilla1(this.datosPlanillaR) 
              ]
            }
          }
         ]
        :[ //No hay pagos anteriores
          {
            table: {
              headerRows: 2,
              widths: [15, 60, '*', 35, 45, 60, 60, 60, 60, 60, 60, 60, 60], // 13 columnas
              body: [
                [
                  { rowSpan: 2, text: 'Nro.', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
                  { rowSpan: 2, text: 'CÓDIGO', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
                  { rowSpan: 2, text: 'DESCRIPCIÓN', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
                  { rowSpan: 2, text: 'UNIDAD', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
                  { colSpan: 3, text: 'CONTRATO INICIAL', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' }, {}, {},
                  { colSpan: 2, text: 'MODIFICACIÓN', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' }, {},
                  { colSpan: 2, text: 'DETALLE CERTIFICADO', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },{},
                  { colSpan: 2, text: 'TOTAL ACUMULADO', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },{},
                ],
                [
                  {}, {}, {}, {},//
                  { text: 'CANTIDAD', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                  { text: 'P.U.', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                  { text: 'MONTO (Bs)', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                  { text: 'CANTIDAD APROBADO', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                  { text: 'MONTO APROBADO (Bs)', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                  { text: 'CANTIDAD PRESENTE', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                  { text: 'MONTO PRESENTE (Bs)', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                  { text: 'CANTIDAD', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                  { text: 'MONTO (Bs)', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                  
                ],
               ...this.buildContenidoPlanilla2(this.datosPlanilla, formatoNumerico), 
               ...this.buildContPlanillaAd2(this.datosNuevos, formatoNumerico),
               ...this.buildResumenPlanilla2(this.datosPlanillaR)
              ]
            }
          }
         ]
        ),
       ]
      :[ //No existen modificaciones
        ...(
        this.datosEnvio[0].bandera_pago > 0 
        ?[ //Hay pago anterior
          {
            table: {
              headerRows: 2,
              widths: [15, 60, '*', 35, 45, 60, 60, 60, 60, 60, 60, 60, 60], // 13 columnas
              body: [
                [
                  { rowSpan: 2, text: 'Nro.', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
                  { rowSpan: 2, text: 'CÓDIGO', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
                  { rowSpan: 2, text: 'DESCRIPCIÓN', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
                  { rowSpan: 2, text: 'UNIDAD', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
                  { colSpan: 3, text: 'CONTRATO INICIAL', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' }, {}, {},
                  { colSpan: 4, text: 'DETALLE CERTIFICADO', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },{}, {}, {},
                  { colSpan: 2, text: 'TOTAL ACUMULADO', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },{},
                ],
                [
                  {}, {}, {}, {},//
                  { text: 'CANTIDAD', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                  { text: 'P.U.', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                  { text: 'MONTO (Bs)', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                  { text: 'CANTIDAD ANTERIOR', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                  { text: 'MONTO ANTERIOR (Bs)', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                  { text: 'CANTIDAD PRESENTE', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                  { text: 'MONTO PRESENTE (Bs)', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                  { text: 'CANTIDAD', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                  { text: 'MONTO (Bs)', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                  
                ],
               ...this.buildContenidoPlanilla3(this.datosPlanilla, formatoNumerico),
               ...this.buildContPlanillaAd3(this.datosNuevos, formatoNumerico), 
               ...this.buildResumenPlanilla3(this.datosPlanillaR)
              ]
            }
          }
        ]
        :[ //No hay pago anterior
          {
            table: {
              headerRows: 2,
              widths: [15, 60, '*', 40, 70, 70, 70, 70, 70, 70, 70,], // 11 columnas
              body: [
                [
                  { rowSpan: 2, text: 'Nro.', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
                  { rowSpan: 2, text: 'CÓDIGO', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
                  { rowSpan: 2, text: 'DESCRIPCIÓN', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
                  { rowSpan: 2, text: 'UNIDAD', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
                  { colSpan: 3, text: 'CONTRATO INICIAL', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' }, {}, {},
                  { colSpan: 2, text: 'DETALLE CERTIFICADO', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },{}, 
                  { colSpan: 2, text: 'TOTAL ACUMULADO', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },{},
                ],
                [
                  {}, {}, {}, {},//
                  { text: 'CANTIDAD', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                  { text: 'P.U.', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                  { text: 'MONTO (Bs)', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                  { text: 'CANTIDAD PRESENTE', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                  { text: 'MONTO PRESENTE (Bs)', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                  { text: 'CANTIDAD', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                  { text: 'MONTO (Bs)', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                  
                ],
               ...this.buildContenidoPlanilla4(this.datosPlanilla, formatoNumerico), 
               ...this.buildContPlanillaAd4(this.datosNuevos, formatoNumerico),
               ...this.buildResumenPlanilla4(this.datosPlanillaR)
              ]
            }
          }
        ]
        ),
        ]
      ),
      {
        text: '\n'
      },
      ...(this.datosEnvio[0].numero_pago > 1
        ?[
            { text: '* El monto total es el resultado de la suma de los montos parciales', style: 'textDato' }
        ]
        :[]
      ),
      {
        text: '\n\n\n\n\n',
      },
      {
          table: {
            widths: ['*', '*', '*'],
            body: [
              [
                { text: [
                          { text: this.datosEnvio[0].proponente_razon_social + '\n', style: 'textDato', alignment: 'center'},
                          { text: 'EMPRESA CONTRATISTA', style: 'textTitulo', alignment: 'center'}
                ]
                },
                { text:
                      [
                        { text: 
                              (Array.isArray(this.datosSup)
                                ? this.datosSup
                                    .filter(f => f && f.supervisor)
                                    .map(f => f.supervisor)
                                    .join(' | ')
                                : ''
                              ) + '\n', style: 'textDato', alignment: 'center' },
                        { text: 'SUPERVISOR(ES) DE OBRA', style: 'textTitulo', alignment: 'center' }
                      ]
                },
                { text:
                      [
                        { text: 
                              (Array.isArray(this.datosFis)
                                ? this.datosFis
                                    .filter(f => f && f.fiscal)
                                    .map(f => f.fiscal)
                                    .join(' | ')
                                : ''
                              ) + '\n', style: 'textDato', alignment: 'center' },
                        { text: 'FISCAL(ES) DE OBRA', style: 'textTitulo', alignment: 'center' }
                      ]
                }
              ]
            ]
          }, layout: 'noBorders'
      },
      {
        
      } as any,
    ],

    footer: function(currentPage: { toString: () => string; }, pageCount: string) 
          { //return currentPage.toString() + ' of ' + pageCount; 
            return {
              columns:[
                  { text: currentPage.toString() + ' de ' + pageCount , alignment: 'right', style: 'footerText', margin: [0,0,20,0]} 
                      ]
              }            
          } as any,
    
    styles: {
      header: {
        fontSize: 18,
        bold: true,
      },
      subheader: {
        fontSize: 11,
        bold: true,
      },
      textTitulo: {
        fontSize: 6,
        bold: true,
        //opacity: 0.8,
      },
      textTitulo2: {
        fontSize: 7,
        bold: true,
        //opacity: 0.8,
      },
      footerText: {
        fontSize: 6,
        bold: false,          
      },
      textDato: {
        fontSize: 7,
        bold: false,
        //color: 'gray', 
        opacity: 0.8,
      },
    },
    pageMargins: [20, 55, 20, 25] as any, // Márgenes: izquierda, arriba, derecha, abajo

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

   //Cargar tabla de PLANILLA - EXISTE MODIFICACIONES Y EXISTE PAGO ANTERIOR
buildContenidoPlanilla1(data: any[], formatoNumerico: Intl.NumberFormat) {

  const formatoNumerico2 = new Intl.NumberFormat('de-DE', {
     minimumFractionDigits: 2,
     maximumFractionDigits: 2
   });
  let datosPl = data;
  let arrayData = [];

  for (let i = 0; i < datosPl.length; i++) {
    
    let rowData = [
      { text: datosPl[i].orden_sim ?? '', style: 'textDato', alignment: 'center' },
      { text: datosPl[i].codigo_item ?? '', style: 'footerText' },
      { text: datosPl[i].desc_item ?? '', style: 'textDato' },
      { text: datosPl[i].unidad_medida_sim ?? '', style: 'textDato', alignment: 'center' },
      { text: this.formatIfNumber(datosPl[i].cantidad_sim, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].p_unitario_adjudicado, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].total_adjudicado, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].cantidad_modif, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: datosPl[i].total_modif, style: 'textDato', alignment: 'right' },
      { text: datosPl[i].cantidad_anterior, style: 'textDato', alignment: 'right' },
      { text: datosPl[i].total_anterior, style: 'textDato', alignment: 'right' },
      { text: datosPl[i].cantidad_actual, style: 'textDato', alignment: 'right' },
      { text: datosPl[i].total_actual, style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].cantidad_acumulado, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].total_acumulado, formatoNumerico), style: 'textDato', alignment: 'right' }
    ];
    arrayData.push(rowData);
  }
   //TEXTO para items ADICIONALES
    if (this.datosNuevos && this.datosNuevos.length > 0) {
        const textonuevo = [
        {colSpan:3, text: 'ITEMS CONTRATO MODIFICATORIO', style: 'textTitulo2', alignment: 'center' }, {}, {},
        {}, {}, {}, {}, {}, {}, {}, {}, {}, {},{},{}
      ];
      arrayData.push(textonuevo);
    } else {
    }

    return arrayData;
  }

   //Cargar tabla de PLANILLA - EXISTE MODIFICACIONES Y ES PRIMER PAGO
buildContenidoPlanilla2(data: any[], formatoNumerico: Intl.NumberFormat) {

  const formatoNumerico2 = new Intl.NumberFormat('de-DE', {
     minimumFractionDigits: 2,
     maximumFractionDigits: 2
   });
  let datosPl = data;
  let arrayData = [];

  for (let i = 0; i < datosPl.length; i++) {
    let rowData = [
      { text: datosPl[i].orden_sim ?? '', style: 'textDato', alignment: 'center' },
      { text: datosPl[i].codigo_item ?? '', style: 'footerText' },
      { text: datosPl[i].desc_item ?? '', style: 'textDato' },
      { text: datosPl[i].unidad_medida_sim ?? '', style: 'textDato', alignment: 'center' },
      { text: this.formatIfNumber(datosPl[i].cantidad_sim, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].p_unitario_adjudicado, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].total_adjudicado, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].cantidad_modif, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].total_modif, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].cantidad_actual, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].total_actual, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].cantidad_acumulado, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].total_acumulado, formatoNumerico), style: 'textDato', alignment: 'right' }
    ];
    arrayData.push(rowData);
  }
   //TEXTO para items ADICIONALES
    if (this.datosNuevos && this.datosNuevos.length > 0) {
      const textonuevo = [
      {colSpan:3, text: 'ITEMS CONTRATO MODIFICATORIO', style: 'textTitulo2', alignment: 'center' }, {}, {},
      {}, {}, {}, {}, {}, {}, {}, {}, {}, {}
    ];
    arrayData.push(textonuevo);
    } else {
    }

    return arrayData;
  }

   //Cargar tabla de PLANILLA - NO EXISTE MODIFICACIONES Y EXISTE PAGO ANTERIOR
buildContenidoPlanilla3(data: any[], formatoNumerico: Intl.NumberFormat) {

   const formatoNumerico2 = new Intl.NumberFormat('de-DE', {
     minimumFractionDigits: 2,
     maximumFractionDigits: 2
   });
  let datosPl = data;
  let arrayData = [];

  for (let i = 0; i < datosPl.length; i++) {
    
    let rowData = [
      { text: datosPl[i].orden_sim ?? '', style: 'textDato', alignment: 'center' },
      { text: datosPl[i].codigo_item ?? '', style: 'footerText' },
      { text: datosPl[i].desc_item ?? '', style: 'textDato' },
      { text: datosPl[i].unidad_medida_sim ?? '', style: 'textDato', alignment: 'center' },
      { text: this.formatIfNumber(datosPl[i].cantidad_sim, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].p_unitario_adjudicado, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].total_adjudicado, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].cantidad_anterior, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].total_anterior, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].cantidad_actual, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].total_actual, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].cantidad_acumulado, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].total_acumulado, formatoNumerico), style: 'textDato', alignment: 'right' }
    ];
    arrayData.push(rowData);
  }
    //TEXTO para items ADICIONALES
    if (this.datosNuevos && this.datosNuevos.length > 0) {
      const textonuevo = [
      {colSpan:3, text: 'ITEMS CONTRATO MODIFICATORIO', style: 'textTitulo2', alignment: 'center' }, {}, {},
      {}, {}, {}, {}, {}, {}, {}, {}, {}, {}
    ];
    arrayData.push(textonuevo);
    } else {
    }

    return arrayData;
  }

   //Cargar tabla de PLANILLA - NO EXISTE MODIFICACIONES Y ES PRIMER PAGO
buildContenidoPlanilla4(data: any[], formatoNumerico: Intl.NumberFormat) {

  const formatoNumerico2 = new Intl.NumberFormat('de-DE', {
     minimumFractionDigits: 2,
     maximumFractionDigits: 2
   });
  let datosPl = data;
  let arrayData = [];

  for (let i = 0; i < datosPl.length; i++) {
    let rowData = [
      { text: datosPl[i].orden_sim ?? '', style: 'textDato', alignment: 'center' },
      { text: datosPl[i].codigo_item ?? '', style: 'footerText' },
      { text: datosPl[i].desc_item ?? '', style: 'textDato' },
      { text: datosPl[i].unidad_medida_sim ?? '', style: 'textDato', alignment: 'center' },
      { text: this.formatIfNumber(datosPl[i].cantidad_sim, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].p_unitario_adjudicado, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].total_adjudicado, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].cantidad_actual, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].total_actual, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].cantidad_acumulado, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].total_acumulado, formatoNumerico), style: 'textDato', alignment: 'right' }
    ];
    arrayData.push(rowData);
  }
    //TEXTO para items ADICIONALES
      if (this.datosNuevos && this.datosNuevos.length > 0) {
        const textonuevo = [
        {colSpan:3, text: 'ITEMS CONTRATO MODIFICATORIO', style: 'textTitulo2', alignment: 'center' }, {}, {},
        {}, {}, {}, {}, {}, {}, {}, {}
        ];
      arrayData.push(textonuevo);
      } else {
      }

    return arrayData;
  }

   //TABLA PLANILLA CON ITEM NUEVOS 1 - EXISTE MODIFICACIONES Y EXISTE PAGO ANTERIOR
buildContPlanillaAd1(data: any[], formatoNumerico: Intl.NumberFormat) {
  const formatoNumerico2 = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  let datosPl = data;
  let arrayData = [];
  let totalReordenSum= 0;
  let totalContratoSum = 0;
  let totalModifApSum = 0;
  let totalIncrementoSum = 0;
  let totalDecrementoSum = 0;
  
  for (let i = 0; i < datosPl.length; i++) {
    const totalReorden = Number(datosPl[i].total_reordenamiento) || 0;
    totalReordenSum += totalReorden;

    const totalContrato = Number(datosPl[i].total_adjudicado) || 0;
    totalContratoSum += totalContrato;

    const totalModAp = Number(datosPl[i].total_autorizado) || 0;
    totalModifApSum += totalModAp;

    const totalIncremento = Number(datosPl[i].total_incremento) || 0;
    totalIncrementoSum += totalIncremento;

    const totalDecremento = Number(datosPl[i].total_decremento) || 0;
    totalDecrementoSum += totalDecremento;

    let rowData = [
      { text: datosPl[i].orden_sim ?? '', style: 'textDato', alignment: 'center' },
      { text: datosPl[i].codigo_item ?? '', style: 'footerText' },
      { text: datosPl[i].desc_item ?? '', style: 'textDato' },
      { text: datosPl[i].unidad_medida_sim ?? '', style: 'textDato', alignment: 'center' },
      { text: this.formatIfNumber(datosPl[i].cantidad_sim, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].p_unitario_adjudicado, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].total_adjudicado, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].cantidad_modif, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: datosPl[i].total_modif, style: 'textDato', alignment: 'right' },
      { text: datosPl[i].cantidad_anterior, style: 'textDato', alignment: 'right' },
      { text: datosPl[i].total_anterior, style: 'textDato', alignment: 'right' },
      { text: datosPl[i].cantidad_actual, style: 'textDato', alignment: 'right' },
      { text: datosPl[i].total_actual, style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].cantidad_acumulado, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].total_acumulado, formatoNumerico), style: 'textDato', alignment: 'right' }
    ];
    arrayData.push(rowData);
  }
    return arrayData;
  }

   //TABLA PLANILLA CON ITEM NUEVOS 2 - EXISTE MODIFICACIONES Y ES PRIMER PAGO
buildContPlanillaAd2(data: any[], formatoNumerico: Intl.NumberFormat) {
  const formatoNumerico2 = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  let datosPl = data;
  let arrayData = [];
  let totalReordenSum= 0;
  let totalContratoSum = 0;
  let totalModifApSum = 0;
  let totalIncrementoSum = 0;
  let totalDecrementoSum = 0;
  
  for (let i = 0; i < datosPl.length; i++) {
    const totalReorden = Number(datosPl[i].total_reordenamiento) || 0;
    totalReordenSum += totalReorden;

    const totalContrato = Number(datosPl[i].total_adjudicado) || 0;
    totalContratoSum += totalContrato;

    const totalModAp = Number(datosPl[i].total_autorizado) || 0;
    totalModifApSum += totalModAp;

    const totalIncremento = Number(datosPl[i].total_incremento) || 0;
    totalIncrementoSum += totalIncremento;

    const totalDecremento = Number(datosPl[i].total_decremento) || 0;
    totalDecrementoSum += totalDecremento;

    let rowData = [
      { text: datosPl[i].orden_sim ?? '', style: 'textDato', alignment: 'center' },
      { text: datosPl[i].codigo_item ?? '', style: 'footerText' },
      { text: datosPl[i].desc_item ?? '', style: 'textDato' },
      { text: datosPl[i].unidad_medida_sim ?? '', style: 'textDato', alignment: 'center' },
      { text: this.formatIfNumber(datosPl[i].cantidad_sim, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].p_unitario_adjudicado, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].total_adjudicado, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].cantidad_modif, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].total_modif, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].cantidad_actual, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].total_actual, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].cantidad_acumulado, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].total_acumulado, formatoNumerico), style: 'textDato', alignment: 'right' }
    ];
    arrayData.push(rowData);
  }
    return arrayData;
  }

   //TABLA PLANILLA CON ITEM NUEVOS 3 - NO EXISTE MODIFICACIONES Y EXISTE PAGO ANTERIOR
buildContPlanillaAd3(data: any[], formatoNumerico: Intl.NumberFormat) {
  const formatoNumerico2 = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  let datosPl = data;
  let arrayData = [];
  let totalReordenSum= 0;
  let totalContratoSum = 0;
  let totalModifApSum = 0;
  let totalIncrementoSum = 0;
  let totalDecrementoSum = 0;
  
  for (let i = 0; i < datosPl.length; i++) {
    const totalReorden = Number(datosPl[i].total_reordenamiento) || 0;
    totalReordenSum += totalReorden;

    const totalContrato = Number(datosPl[i].total_adjudicado) || 0;
    totalContratoSum += totalContrato;

    const totalModAp = Number(datosPl[i].total_autorizado) || 0;
    totalModifApSum += totalModAp;

    const totalIncremento = Number(datosPl[i].total_incremento) || 0;
    totalIncrementoSum += totalIncremento;

    const totalDecremento = Number(datosPl[i].total_decremento) || 0;
    totalDecrementoSum += totalDecremento;

    let rowData = [
      { text: datosPl[i].orden_sim ?? '', style: 'textDato', alignment: 'center' },
      { text: datosPl[i].codigo_item ?? '', style: 'footerText' },
      { text: datosPl[i].desc_item ?? '', style: 'textDato' },
      { text: datosPl[i].unidad_medida_sim ?? '', style: 'textDato', alignment: 'center' },
      { text: this.formatIfNumber(datosPl[i].cantidad_sim, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].p_unitario_adjudicado, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].total_adjudicado, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].cantidad_anterior, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].total_anterior, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].cantidad_actual, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].total_actual, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].cantidad_acumulado, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].total_acumulado, formatoNumerico), style: 'textDato', alignment: 'right' }
    ];
    arrayData.push(rowData);
  }
    return arrayData;
  }

   //TABLA PLANILLA CON ITEM NUEVOS 4 - NO EXISTE MODIFICACIONES Y EXISTE PAGO ANTERIOR
buildContPlanillaAd4(data: any[], formatoNumerico: Intl.NumberFormat) {
  const formatoNumerico2 = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  let datosPl = data;
  let arrayData = [];
  
  for (let i = 0; i < datosPl.length; i++) {
    let rowData = [
      { text: datosPl[i].orden_sim ?? '', style: 'textDato', alignment: 'center' },
      { text: datosPl[i].codigo_item ?? '', style: 'footerText' },
      { text: datosPl[i].desc_item ?? '', style: 'textDato' },
      { text: datosPl[i].unidad_medida_sim ?? '', style: 'textDato', alignment: 'center' },
      { text: this.formatIfNumber(datosPl[i].cantidad_sim, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].p_unitario_adjudicado, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].total_adjudicado, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].cantidad_actual, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].total_actual, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].cantidad_acumulado, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].total_acumulado, formatoNumerico), style: 'textDato', alignment: 'right' }
    ];
    arrayData.push(rowData);
  }
    return arrayData;
  }

   //RESUMEN PLANILLA 1 - 15 columnas
  buildResumenPlanilla1(data: any[]) {

   const formatoNumerico5 = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 5,
    maximumFractionDigits: 5
  });

  const formatoNumerico2 = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  let porc_modif = 0;
  let porc_anterior = 0;
  let arrayData = [];
  
  // Fila final con totales
    const totalRow = [
      {colSpan: 3, text:'TOTALES (Bs):', style: 'textTitulo2', alignment: 'right' }, {}, {}, 
      {}, {}, {}, // celdas vacias
      { text: this.formatIfNumber(this.datosPlanillaR[0].total_adjudicado,formatoNumerico2),
        style: 'textTitulo2', alignment: 'right' }, 
      {}, // celdas vacias
      { text: this.formatIfNumber(this.datosPlanillaR[0].total_modif,formatoNumerico2),  
        style: 'textTitulo2', alignment: 'right' }, 
      {}, 
      {
        text: this.formatIfNumber(this.datosPlanillaR[0].total_pagado,formatoNumerico2),  
        style: 'textTitulo2', alignment: 'right' },
      {},
      { text: this.formatIfNumber(this.datosPlanillaR[0].monto_presente,formatoNumerico2),
        style: 'textTitulo2', alignment: 'right' }, 
      {},
      {
        text: this.formatIfNumber(this.datosPlanillaR[0].monto_acumulado,formatoNumerico2),
        style: 'textTitulo2', alignment: 'right', border: [true, true, true, true],
      },
    ];

//    const montoVarRow = [
//      { colSpan: 15}
//    ];

   // Fila final con porcentajes
   const montoContrato = Number(this.datosEnvio[0].monto_contrato);
   const total_autorizado = Number(this.datosPlanillaR[0].total_modif);
   const total_pagado = Number(this.datosPlanillaR[0].total_pagado);
   console.log('PORCENTAJE', total_autorizado);
    if (!isNaN(montoContrato) && montoContrato !== 0) {
      porc_modif = (total_autorizado * 100) / montoContrato;
      porc_anterior = (total_pagado * 100) / montoContrato;
    }
    const porctotalRow = [
      {colSpan: 3, text: 'PORCENTAJE:', style: 'textTitulo2', alignment: 'right' }, {}, {}, 
      {}, {}, {}, 
      {text: this.formatIfNumber(100,formatoNumerico2) + '%',
        style: 'textTitulo2', alignment: 'right'}, 
      {}, 
      {text: this.formatIfNumber(porc_modif,formatoNumerico2) + '%',
        style: 'textTitulo2', alignment: 'right'}, 
      {}, 
      {
        text: this.formatIfNumber(porc_anterior,formatoNumerico2) + '%',
        style: 'textTitulo2', alignment: 'right'},
      {},
      {text: this.formatIfNumber(this.datosPlanillaR[0].porcentaje_presente,formatoNumerico2) + '%',
        style: 'textTitulo2', alignment: 'right'}, 
      {}, 
      { text: this.formatIfNumber(this.datosPlanillaR[0].porcentaje_acumulado, formatoNumerico2) + '%', 
        style: 'textTitulo2', alignment: 'right'}
    ];
  
   arrayData.push(totalRow);
   //arrayData.push(montoVarRow);
   arrayData.push(porctotalRow);

    return arrayData;
  }

   //RESUMEN PLANILLA 2 - 13 columnas
  buildResumenPlanilla2(data: any[]) {

   const formatoNumerico5 = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 5,
    maximumFractionDigits: 5
  });
  const formatoNumerico2 = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  let porc_modif = 0;
  let arrayData = [];
  
  // Fila final con totales
    const totalRow = [
      {colSpan: 3, text:'TOTALES (Bs):', style: 'textTitulo2', alignment: 'right' }, {}, {}, 
      {}, {}, {}, // celdas vacias
      { text: this.formatIfNumber(this.datosPlanillaR[0].total_adjudicado,formatoNumerico2),
        style: 'textTitulo2', alignment: 'right' }, 
      {}, // celdas vacias
      { text: this.formatIfNumber(this.datosPlanillaR[0].total_modif,formatoNumerico2),  
        style: 'textTitulo2', alignment: 'right' }, 
      {}, 
      { text: this.formatIfNumber(this.datosPlanillaR[0].monto_presente,formatoNumerico2),
        style: 'textTitulo2', alignment: 'right' }, 
      {},
      {
        text: this.formatIfNumber(this.datosPlanillaR[0].monto_acumulado,formatoNumerico2),
        style: 'textTitulo2', alignment: 'right', border: [true, true, true, true],
      },
    ];

//    const montoVarRow = [
//      { colSpan: 13}
//    ];

  
   // Fila final con porcentajes
   const montoContrato = Number(this.datosEnvio[0].monto_contrato);
   const total_autorizado = Number(this.datosPlanillaR[0].total_modif);
   console.log('PORCENTAJE', total_autorizado);
    if (!isNaN(montoContrato) && montoContrato !== 0) {
      porc_modif = (total_autorizado * 100) / montoContrato;
    }
    const porctotalRow = [
      {colSpan: 3, text: 'PORCENTAJE:', style: 'textTitulo2', alignment: 'right' }, {}, {}, 
      {}, {}, {}, 
      {text: this.formatIfNumber(100,formatoNumerico2) + '%',
        style: 'textTitulo2', alignment: 'right'}, 
      {}, 
      {text: this.formatIfNumber(this.datosPlanillaR[0].porcentaje_modif,formatoNumerico2) + '%',
        style: 'textTitulo2', alignment: 'right'}, 
      {}, 
      {text: this.formatIfNumber(this.datosPlanillaR[0].porcentaje_presente,formatoNumerico2) + '%',
        style: 'textTitulo2', alignment: 'right'}, 
      {}, 
      { text: this.formatIfNumber(this.datosPlanillaR[0].porcentaje_acumulado, formatoNumerico2) + '%', 
        style: 'textTitulo2', alignment: 'right'}
    ];
  
   arrayData.push(totalRow);
   //arrayData.push(montoVarRow);
   arrayData.push(porctotalRow);
    return arrayData;
  }

   //RESUMEN PLANILLA 3 - 13 columnas
  buildResumenPlanilla3(data: any[]) {

   const formatoNumerico5 = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 5,
    maximumFractionDigits: 5
  });
  const formatoNumerico2 = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  let porc_anterior = 0;
  let arrayData = [];
  
  // Fila final con totales
    const totalRow = [
      {colSpan: 3, text:'TOTALES (Bs):', style: 'textTitulo2', alignment: 'right' }, {}, {}, 
      {}, {}, {}, // celdas vacias
      { text: this.formatIfNumber(this.datosPlanillaR[0].total_adjudicado,formatoNumerico2),
        style: 'textTitulo2', alignment: 'right' }, 
      {}, // celdas vacias
      { text: this.formatIfNumber(this.datosPlanillaR[0].total_pagado,formatoNumerico2), //Ultimo Pago 
        style: 'textTitulo2', alignment: 'right' }, 
      {}, 
      { text: this.formatIfNumber(this.datosPlanillaR[0].monto_presente,formatoNumerico2),
        style: 'textTitulo2', alignment: 'right' }, 
      {},
      {
        text: this.formatIfNumber(this.datosPlanillaR[0].monto_acumulado,formatoNumerico2),
        style: 'textTitulo2', alignment: 'right', border: [true, true, true, true],
      },
    ];

//    const montoVarRow = [
//      { colSpan: 13}
//    ];

  // Fila final con porcentajes
    const montoContrato = Number(this.datosEnvio[0].monto_contrato);
    const total_pagado = Number(this.datosPlanillaR[0].total_pagado);
    //console.log('PORCENTAJE', total_autorizado);
      if (!isNaN(montoContrato) && montoContrato !== 0) {
        porc_anterior = (total_pagado * 100) / montoContrato;
        
      }
    const porctotalRow = [
      {colSpan: 3, text: 'PORCENTAJE:', style: 'textTitulo2', alignment: 'right' }, {}, {}, 
      {}, {}, {}, 
      {text: this.formatIfNumber(100,formatoNumerico2) + '%',
        style: 'textTitulo2', alignment: 'right'}, 
      {}, 
      {text: this.formatIfNumber(porc_anterior,formatoNumerico2) + '%',
        style: 'textTitulo2', alignment: 'right'}, 
      {}, 
      {text: this.formatIfNumber(this.datosPlanillaR[0].porcentaje_presente,formatoNumerico2) + '%',
        style: 'textTitulo2', alignment: 'right'}, 
      {}, 
      { text: this.formatIfNumber(this.datosPlanillaR[0].porcentaje_acumulado, formatoNumerico2) + '%', 
        style: 'textTitulo2', alignment: 'right'}
    ];
  
   arrayData.push(totalRow);
   //arrayData.push(montoVarRow);
   arrayData.push(porctotalRow);
    return arrayData;
  }

   //RESUMEN PLANILLA 4 - 11 columnas
  buildResumenPlanilla4(data: any[]) {

   const formatoNumerico5 = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 5,
    maximumFractionDigits: 5
  });
  const formatoNumerico2 = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  let arrayData = [];
  
  // Fila final con totales
    const totalRow = [
      {colSpan: 3, text:'TOTALES (Bs):', style: 'textTitulo2', alignment: 'right' }, {}, {}, 
      {}, {}, {}, // celdas vacias
      { text: this.formatIfNumber(this.datosPlanillaR[0].total_adjudicado,formatoNumerico2),
        style: 'textTitulo2', alignment: 'right' }, 
      {}, // celdas vacias
      { text: this.formatIfNumber(this.datosPlanillaR[0].monto_presente,formatoNumerico2),
        style: 'textTitulo2', alignment: 'right' }, 
      {},
      {
        text: this.formatIfNumber(this.datosPlanillaR[0].monto_acumulado,formatoNumerico2),
        style: 'textTitulo2', alignment: 'right', border: [true, true, true, true],
      },
    ];

//    const montoVarRow = [
//      { colSpan: 13}
//    ];

  // Fila final con porcentajes
    const porctotalRow = [
      {colSpan: 3, text: 'PORCENTAJE:', style: 'textTitulo2', alignment: 'right' }, {}, {}, 
      {}, {}, {}, 
      {text: this.formatIfNumber(100,formatoNumerico2) + '%',
        style: 'textTitulo2', alignment: 'right'}, 
      {}, 
      {text: this.formatIfNumber(this.datosPlanillaR[0].porcentaje_presente,formatoNumerico2) + '%',
        style: 'textTitulo2', alignment: 'right'}, 
      {}, 
      { text: this.formatIfNumber(this.datosPlanillaR[0].porcentaje_acumulado, formatoNumerico2) + '%', 
        style: 'textTitulo2', alignment: 'right'}
    ];
  
   arrayData.push(totalRow);
   //arrayData.push(montoVarRow);
   arrayData.push(porctotalRow);
    return arrayData;
  }

   //Formatear Números
  private formatIfNumber(value: any, formatter: Intl.NumberFormat): string {
    if (value === null || value === undefined || value === '') return '';
    
    const num = Number(value);
    if (isNaN(num)) return '';

    return formatter.format(num);
 }

 private formatNumero(value: any, decimales: number = 2): string {
    if (value === null || value === undefined || value === '') return '';

    const num = Number(value);
    if (isNaN(num)) return '';

    // 1. Fija el número de decimales y convierte a string
    const fixedNumStr = num.toFixed(decimales);

    const [integerPart, decimalPart] = fixedNumStr.split('.');

    // 2. Agrega puntos como separadores de miles a la parte entera
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    // 3. Retorna con la cantidad de decimales especificada (si decimales > 0)
    if (decimales > 0 && decimalPart) {
      return `${formattedInteger},${decimalPart}`;
    }

    return formattedInteger;
 }

}