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
export class PlanillaReordenamiento {

    datosEnvio: any = [];
    datosPlanilla: any = [];
    datosPlanillaR: any = [];
    num_modif: any = [];
    datosNuevos: any = [];
    datosInfSup: any = [];

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

  // Datos generales obra - contrato - modificación
  async datosGeneralesObraModif(id_modif_pago: number) {
    const query = `
        SELECT * 
        FROM public."vista_reporte_modificacion_gral" WHERE id_modificacion_pago = ${id_modif_pago}`;
    const resultado = await this.sequelize.query(query);
    return resultado[0];
  }

   // Tabla Planilla Reordenamiento
   async planillaReordenamiento(solicitud: number) {
    const query3 = `
        SELECT * 
        FROM public."vista_reporte_planilla" WHERE id_modificacion_pago = ${solicitud}`;
    const resultado3 = await this.sequelize.query(query3);
    return resultado3[0];
   }

   // Tabla Planilla Resumen
   async planillaResumen(obra: number, solicitud: number) {
    const query4 = `
        SELECT * 
        FROM public.f_reporte_resumen_planilla(${obra},${solicitud});`;
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

   // Tabla Planilla Reordenamiento ITEMS ADICIONALES
   async planillaItemsNuevos(solicitud: number) {
    const query6 = `
        SELECT * 
        FROM public."vista_reporte_planilla_adicion" WHERE id_modificacion_pago = ${solicitud}`;
    const resultado6 = await this.sequelize.query(query6);
    return resultado6[0];
   }

   // Datos informe - modificación Supervisor - Fiscal
   async datosInformeModifSupervisor(solicitud: number) {
    const query7 = `
        SELECT * 
        FROM public."vista_reporte_memoOC" WHERE id_modificacion_pago = ${solicitud}`;
    const resultado7 = await this.sequelize.query(query7);
    return resultado7[0];
   }

// REPORTE - PLANILLA DE REORDENAMIENTO
async generatePlanillaReordenamiento(obra: number, id_modificacion_pago: number): Promise<Buffer> {

  const datosGenerales = await this.datosGeneralesObraModif(id_modificacion_pago);
  if ((!datosGenerales || (Array.isArray(datosGenerales) && datosGenerales.length === 0) || (typeof datosGenerales === 'object' && Object.keys(datosGenerales).length === 0))){
    throw new Error('No se encontraron datos para la ID de la obra proporcionada');
  }
  this.datosEnvio = datosGenerales;

  const res3 = await this.planillaReordenamiento(id_modificacion_pago);
  if (!res3 || (Array.isArray(res3) && res3.length === 0) || (typeof res3 === 'object' && Object.keys(res3).length === 0)) {
      throw new Error('No se encontraron datos de la planilla');
  }
  this.datosPlanilla = res3;

  const res4 = await this.planillaResumen(obra, id_modificacion_pago);
  if (!res4 || (Array.isArray(res4) && res4.length === 0) || (typeof res4 === 'object' && Object.keys(res4).length === 0)) {
      throw new Error('No se encontraron datos de la planilla');
  }
  this.datosPlanillaR = res4;

  const res5 = await this.planillaItemsNuevos(id_modificacion_pago);
  this.datosNuevos = res5;

  const res6 = await this.datosInformeModifSupervisor(id_modificacion_pago);
  this.datosInfSup = res6;

  //console.log('DATOS PLANILLA',this.num_modif);
  
    const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logoSGEO.png');
    const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
    //const imgPath = 'assets/images/membretado_oficio.png';
    const imgLogo = 'assets/images/logoSGEO.png'
    const marcaAgua = this.datosEnvio[0].fecha_aprobacion;

    let formatoNumerico: Intl.NumberFormat; //variable para controlar el número de decimales

    if (this.datosEnvio[0].num_decimales === '2') {
      formatoNumerico = new Intl.NumberFormat('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    } else {
        if (this.datosEnvio[0].num_decimales === '5') {
          formatoNumerico = new Intl.NumberFormat('de-DE', {
          minimumFractionDigits: 5,
          maximumFractionDigits: 5
        });
        } else {
          formatoNumerico = new Intl.NumberFormat('de-DE', {
          minimumFractionDigits: this.datosEnvio[0].num_decimales,
          maximumFractionDigits: this.datosEnvio[0].num_decimales
        });
        }
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
        text: 'PLANILLA DE ' + this.datosEnvio[0].desc_subtipo + ' Nro.' + this.datosEnvio[0].numero_modificacion, 
        style: 'subheader', alignment: 'center', 
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
      {
        text:[
            { text: 'ZONA: ', style: 'textTitulo2', bold:true },
            { text: this.datosEnvio[0].desc_zona_carpeta, style: 'textDato'}
            ], margin: [0,0,0,5],    
      },
      ...(
      this.datosEnvio[0].modificacion_gral != 1 
      ?[
        {
          table: {
            headerRows: 2,
            widths: [15, 60, '*', 30, 45, 50, 50, 50, 50, 50, 50,50,50,50,50], // 15 columnas
            body: [
              [
                { rowSpan: 2, text: 'Nro.', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
                { rowSpan: 2, text: 'CÓDIGO', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
                { rowSpan: 2, text: 'DESCRIPCIÓN', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
                { rowSpan: 2, text: 'UNIDAD', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
                { rowSpan: 2, text: 'PU', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
                { colSpan: 2, text: 'CONTRATO INICIAL', style: 'textTitulo', alignment: 'center', margin: [0, 5, 0, 0], fillColor: '#dddddd' }, {},
                { colSpan: 2, text: 'MODIFICACIÓN APROBADA', style: 'textTitulo', alignment: 'center', margin: [0, 5, 0, 0], fillColor: '#dddddd' },   {}, 
                { colSpan: 2, text: 'INCREMENTO', style: 'textTitulo', alignment: 'center', margin: [0, 5, 0, 0], fillColor: '#dddddd' },{},
                { colSpan: 2, text: 'DECREMENTO', style: 'textTitulo', alignment: 'center', margin: [0, 5, 0, 0], fillColor: '#dddddd' },{},
                { colSpan: 2, text: 'REORDENAMIENTO', style: 'textTitulo', alignment: 'center', margin: [0, 5, 0, 0], fillColor: '#dddddd' },{},
              ],
              [
                {}, {}, {}, {}, {},//
                { text: 'CANTIDAD', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                { text: 'MONTO (Bs)', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                { text: 'CANTIDAD', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                { text: 'MONTO (Bs)', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                { text: 'CANTIDAD', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                { text: 'MONTO (Bs)', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                { text: 'CANTIDAD', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                { text: 'MONTO (Bs)', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                { text: 'CANTIDAD', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                { text: 'MONTO (Bs)', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                
              ],
            ...this.buildContenidoPlanilla(this.datosPlanilla, formatoNumerico), 
            ...this.buildContenidoPlanilla1(this.datosNuevos, formatoNumerico),
            ...this.buildResumenPlanilla1(this.datosPlanillaR) 
            ]
          }
        } ]
      :[
        {
          table: {
            headerRows: 2,
            widths: [15, 60, '*', 30, 45, 60, 60, 60, 60, 60, 60, 60, 60], // 15 columnas
            body: [
              [
                { rowSpan: 2, text: 'Nro.', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
                { rowSpan: 2, text: 'CÓDIGO', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
                { rowSpan: 2, text: 'DESCRIPCIÓN', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
                { rowSpan: 2, text: 'UNIDAD', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
                { rowSpan: 2, text: 'PU', style: 'textTitulo', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
                { colSpan: 2, text: 'CONTRATO INICIAL', style: 'textTitulo', alignment: 'center', margin: [0, 5, 0, 0], fillColor: '#dddddd' }, {},
                { colSpan: 2, text: 'INCREMENTO', style: 'textTitulo', alignment: 'center', margin: [0, 5, 0, 0], fillColor: '#dddddd' },{},
                { colSpan: 2, text: 'DECREMENTO', style: 'textTitulo', alignment: 'center', margin: [0, 5, 0, 0], fillColor: '#dddddd' },{},
                { colSpan: 2, text: 'REORDENAMIENTO', style: 'textTitulo', alignment: 'center', margin: [0, 5, 0, 0], fillColor: '#dddddd' },{},
              ],
              [
                {}, {}, {}, {}, {},//
                { text: 'CANTIDAD', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                { text: 'MONTO (Bs)', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                { text: 'CANTIDAD', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                { text: 'MONTO (Bs)', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                { text: 'CANTIDAD', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                { text: 'MONTO (Bs)', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                { text: 'CANTIDAD', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                { text: 'MONTO (Bs)', style: 'textTitulo', alignment: 'center', fillColor: '#dddddd' },
                
              ],
            ...this.buildContenidoPlanilla2(this.datosPlanilla, formatoNumerico), 
            ...this.buildContenidoPlanilla22(this.datosNuevos, formatoNumerico),
            ...this.buildResumenPlanilla2(this.datosPlanillaR)
            ]
          }
        }]
      ),
      {
        text: '\n\n\n\n\n',
      },
      {
        table: {
          widths: ['*', '*', '*'],
          body: [
            [
              {
                text:
                    [
                      { text: this.datosInfSup[0].de_nombre_fis, style: 'textDato', alignment: 'center' },
                      { text: '\nFISCAL(ES) DE OBRA', style: 'textTitulo', alignment: 'center' }
                    ]
              },

              { text: [
                        { text: this.datosEnvio[0].proponente_razon_social + '\n', style: 'textDato', alignment: 'center'},
                        { text: 'EMPRESA CONTRATISTA', style: 'textTitulo', alignment: 'center'}
                      ]
              },
              {
                text:
                    [
                      { text: this.datosInfSup[0].de_nombre_sup, style: 'textDato', alignment: 'center' },
                      { text: '\nSUPERVISOR(ES) DE OBRA', style: 'textTitulo', alignment: 'center' }
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

//Cargar tabla de PLANILLA - EXISTE MODIFICACIONES
buildContenidoPlanilla(data: any[], formatoNumerico: Intl.NumberFormat) {

  let datosPl = data;
  let arrayData = [];

  for (let i = 0; i < datosPl.length; i++) {
    
    let rowData = [
      { text: datosPl[i].orden_sim ?? '', style: 'textDato', alignment: 'center' },
      { text: datosPl[i].codigo_item ?? '', style: 'footerText' },
      { text: datosPl[i].desc_item ?? '', style: 'textDato' },
      { text: datosPl[i].unidad_medida_sim ?? '', style: 'textDato', alignment: 'center' },
      { text: this.formatIfNumber(datosPl[i].p_unitario_adjudicado, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].cantidad_sim, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].total_adjudicado, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].cantidad_autorizada, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: datosPl[i].total_autorizado, style: 'textDato', alignment: 'right' },
      { text: datosPl[i].cant_incremento, style: 'textDato', alignment: 'right' },
      { text: datosPl[i].total_incremento, style: 'textDato', alignment: 'right' },
      { text: datosPl[i].cant_decremento, style: 'textDato', alignment: 'right' },
      { text: datosPl[i].total_decremento, style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].cantidad_reordenamiento, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].total_reordenamiento, formatoNumerico), style: 'textDato', alignment: 'right' }
    ];
    arrayData.push(rowData);
  }
  
  if (this.datosNuevos && this.datosNuevos.length > 0) {
    const textonuevo = [
    {colSpan:3, text: 'ITEMS CONTRATO MODIFICATORIO Nro.' + this.datosEnvio[0].numero_modificacion, style: 'textTitulo2', alignment: 'center' }, {}, {},
    {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}
    ];
  arrayData.push(textonuevo);
  } else {
  }
    return arrayData;
  }

//TABLA PLANILLA CON ITEM NUEVOS 1 - EXISTE MODIFICACIONES
buildContenidoPlanilla1(data: any[], formatoNumerico: Intl.NumberFormat) {

   const formatoNumerico5 = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 5,
    maximumFractionDigits: 5
  });

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
  //let porc_parcial = 0;
  let porc_total = 0;
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
      { text: this.formatIfNumber(datosPl[i].p_unitario_adjudicado, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].cantidad_sim, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].total_adjudicado, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].cantidad_autorizada, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: datosPl[i].total_autorizado, style: 'textDato', alignment: 'right' },
      { text: datosPl[i].cant_incremento, style: 'textDato', alignment: 'right' },
      { text: datosPl[i].total_incremento, style: 'textDato', alignment: 'right' },
      { text: datosPl[i].cant_decremento, style: 'textDato', alignment: 'right' },
      { text: datosPl[i].total_decremento, style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].cantidad_reordenamiento, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].total_reordenamiento, formatoNumerico), style: 'textDato', alignment: 'right' }
    ];
    arrayData.push(rowData);
  }
    return arrayData;
  }

  //Cargar tabla de PLANILLA - PRIMERA MODIFICACION
buildContenidoPlanilla2(data: any[], formatoNumerico: Intl.NumberFormat) {

  let datosPl = data;
  let arrayData = [];

  for (let i = 0; i < datosPl.length; i++) {
    
    let rowData = [
      { text: datosPl[i].orden_sim ?? '', style: 'textDato', alignment: 'center' },
      { text: datosPl[i].codigo_item ?? '', style: 'footerText' },
      { text: datosPl[i].desc_item ?? '', style: 'textDato' },
      { text: datosPl[i].unidad_medida_sim ?? '', style: 'textDato', alignment: 'center' },
      { text: this.formatIfNumber(datosPl[i].p_unitario_adjudicado, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].cantidad_sim, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].total_adjudicado, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].cant_incremento, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].total_incremento, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].cant_decremento, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].total_decremento, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].cantidad_reordenamiento, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].total_reordenamiento, formatoNumerico), style: 'textDato', alignment: 'right' }
    ];
    arrayData.push(rowData);
  }
    if (this.datosNuevos && this.datosNuevos.length > 0) {
      const textonuevo = [
      {colSpan:3, text: 'ITEMS CONTRATO MODIFICATORIO Nro.' + this.datosEnvio[0].numero_modificacion, style: 'textTitulo2', alignment: 'center' }, {}, {},
      {}, {}, {}, {}, {}, {}, {}, {}, {}, {}
    ];
    arrayData.push(textonuevo);
    } else {
    }
//    // Fila final con totales
//   const totalRow = [
//     {colSpan: 3, text:'TOTALES (Bs):', style: 'textTitulo2', alignment: 'right' }, {}, {}, 
//     {}, {}, {}, // celdas vacias
//     { text: this.formatIfNumber(totalContratoSum,formatoNumerico2),
//       style: 'textTitulo2', alignment: 'right', bold: true }, 
//     {}, // celdas vacias
//     { text: this.formatIfNumber(totalIncrementoSum,formatoNumerico2),
//       style: 'textTitulo2', alignment: 'right', bold: true }, 
//     {}, 
//     { text: this.formatIfNumber(totalDecrementoSum,formatoNumerico2),
//       style: 'textTitulo2', alignment: 'right', bold: true }, 
//     {},
//     {
//       text: this.formatIfNumber(totalReordenSum,formatoNumerico2),
//       style: 'textTitulo2', bold: true, alignment: 'right', border: [true, true, true, true],
//     },
//   ];

//   const montoVarRow = [
//     {colSpan: 3, text: 'MONTO DE VARIACIÓN RESPECTO AL CONTRATO INICIAL (Bs)', style: 'textDato', alignment: 'right' }, {}, {},
//     {}, {}, {}, {}, {}, {}, {}, {}, {}, 
//     { text: this.formatIfNumber(this.datosPlanillaR[0].monto_variacion, formatoNumerico2), style: 'textTitulo2', alignment: 'right', margin: [0,5,0,0]}
//   ];

//   const porcVarRow = [
//     {colSpan: 3, text: 'PORCENTAJE DE VARIACIÓN RESPECTO AL CONTRATO INICIAL', style: 'textDato', alignment: 'right' }, {}, {}, 
//     {}, {}, {}, {}, {}, {}, {}, {}, {}, 
//     { text: this.formatIfNumber(this.datosPlanillaR[0].porcentaje_modificacion, formatoNumerico5) + '%', style: 'textTitulo2', alignment: 'right', margin: [0,5,0,0]}
//   ];
// porc_total = (totalReordenSum * 100)/ totalContratoSum;
//   const porcTotalRow = [
//     {colSpan: 3, text: 'PORCENTAJE TOTAL RESPECTO AL CONTRATO INICIAL', style: 'textDato', alignment: 'right' }, {}, {}, 
//     {}, {}, {}, {}, {}, {}, {}, {}, {}, 
//     { text: this.formatIfNumber(porc_total, formatoNumerico5) + '%', style: 'textTitulo2', alignment: 'right', margin: [0,5,0,0]}
//   ];

  
  // arrayData.push(totalRow);
  // arrayData.push(montoVarRow);
  // arrayData.push(porcVarRow);
  // arrayData.push(porcTotalRow);

    return arrayData;
  }

  //TABLA PLANILLA CON ITEMS NUEVOS 2 - PRIMERA MODIFICACION
  buildContenidoPlanilla22(data: any[], formatoNumerico: Intl.NumberFormat) {

   const formatoNumerico5 = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 5,
    maximumFractionDigits: 5
  });

  const formatoNumerico2 = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  let datosPl = data;
  let arrayData = [];
  let totalReordenSum= 0;
  let totalContratoSum = 0;
  let totalIncrementoSum = 0;
  let totalDecrementoSum = 0;
  let porc_total = 0;

  for (let i = 0; i < datosPl.length; i++) {
    const totalReorden = Number(datosPl[i].total_reordenamiento) || 0;
    totalReordenSum += totalReorden;

    const totalContrato = Number(datosPl[i].total_adjudicado) || 0;
    totalContratoSum += totalContrato;

    const totalIncremento = Number(datosPl[i].total_incremento) || 0;
    totalIncrementoSum += totalIncremento;

    const totalDecremento = Number(datosPl[i].total_decremento) || 0;
    totalDecrementoSum += totalDecremento;

    let rowData = [
      { text: datosPl[i].orden_sim ?? '', style: 'textDato', alignment: 'center' },
      { text: datosPl[i].codigo_item ?? '', style: 'footerText' },
      { text: datosPl[i].desc_item ?? '', style: 'textDato' },
      { text: datosPl[i].unidad_medida_sim ?? '', style: 'textDato', alignment: 'center' },
      { text: this.formatIfNumber(datosPl[i].p_unitario_adjudicado, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].cantidad_sim, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].total_adjudicado, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].cant_incremento, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].total_incremento, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].cant_decremento, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].total_decremento, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].cantidad_reordenamiento, formatoNumerico), style: 'textDato', alignment: 'right' },
      { text: this.formatIfNumber(datosPl[i].total_reordenamiento, formatoNumerico), style: 'textDato', alignment: 'right' }
    ];
    arrayData.push(rowData);
  }

    return arrayData;
  }

  //RESUME PLANILLA 1
  buildResumenPlanilla1(data: any[]) {

   const formatoNumerico5 = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 5,
    maximumFractionDigits: 5
  });

  const formatoNumerico2 = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  let datosPl = data;
  let arrayData = [];
  let totalReordenSum= 0;
  let totalContratoSum = 0;
  let porc_total = 0;

  // Fila final con totales
   const totalRow = [
     {colSpan: 3, text:'TOTALES (Bs):', style: 'textTitulo2', alignment: 'right' }, {}, {}, 
     {}, {}, {}, // celdas vacias
     { text: this.formatIfNumber(datosPl[0].total_adjudicado,formatoNumerico2),
       style: 'textTitulo2', alignment: 'right', bold: true }, 
     {}, // celdas vacias
     { text: this.formatIfNumber(datosPl[0].total_modif_ap,formatoNumerico2), //Correjido
      style: 'textTitulo2', alignment: 'right', bold: true }, 
     {}, // celdas vacias
     { text: this.formatIfNumber(datosPl[0].total_inc,formatoNumerico2),
       style: 'textTitulo2', alignment: 'right', bold: true }, 
     {}, // celdas vacias
     { text: this.formatIfNumber(datosPl[0].total_dec,formatoNumerico2),
       style: 'textTitulo2', alignment: 'right', bold: true }, 
     {},// celdas vacias
     { text: this.formatIfNumber(datosPl[0].total_reo,formatoNumerico2),
       style: 'textTitulo2', bold: true, alignment: 'right', border: [true, true, true, true],
     },
   ];

   const montoVarRow = [
     {colSpan: 3, text: 'MONTO DE VARIACIÓN RESPECTO AL CONTRATO INICIAL (Bs)', style: 'textTitulo2', alignment: 'right', bold: 'true' }, {}, {},
     {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {},
     { text: this.formatIfNumber(this.datosPlanillaR[0].monto_variacion, formatoNumerico2), style: 'textTitulo2', alignment: 'right', margin: [0,5,0,0]}
   ];

   const porcVarRow = [
     {colSpan: 3, text: 'PORCENTAJE DE VARIACIÓN RESPECTO AL CONTRATO INICIAL', style: 'textTitulo2', alignment: 'right' }, {}, {}, 
     {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {},
     { text: this.formatIfNumber(this.datosPlanillaR[0].porcentaje_modificacion, formatoNumerico5) + '%', style: 'textTitulo2', alignment: 'right', margin: [0,5,0,0]}
   ];
  totalReordenSum = datosPl[0].total_reo;
  totalContratoSum = datosPl[0].total_adjudicado;
  porc_total = (totalReordenSum * 100)/ totalContratoSum;
   const porcTotalRow = [
     {colSpan: 3, text: 'PORCENTAJE TOTAL RESPECTO AL CONTRATO INICIAL', style: 'textTitulo2', alignment: 'right' }, {}, {}, 
     {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, 
     { text: this.formatIfNumber(porc_total, formatoNumerico5) + '%', style: 'textTitulo2', alignment: 'right', margin: [0,5,0,0]}
   ];
  
   arrayData.push(totalRow);
   arrayData.push(montoVarRow);
   arrayData.push(porcVarRow);
   arrayData.push(porcTotalRow);

    return arrayData;
  }

  //RESUME PLANILLA 2
  buildResumenPlanilla2(data: any[]) {

   const formatoNumerico5 = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 5,
    maximumFractionDigits: 5
  });

  const formatoNumerico2 = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  let datosPl = data;
  let arrayData = [];
  let totalReordenSum= 0;
  let totalContratoSum = 0;
  let porc_total = 0;

  // Fila final con totales
   const totalRow = [
     {colSpan: 3, text:'TOTALES (Bs):', style: 'textTitulo2', alignment: 'right' }, {}, {}, 
     {}, {}, {}, // celdas vacias
     { text: this.formatIfNumber(datosPl[0].total_adjudicado,formatoNumerico2),
       style: 'textTitulo2', alignment: 'right', bold: true }, 
     {}, // celdas vacias
     { text: this.formatIfNumber(datosPl[0].total_inc,formatoNumerico2),
       style: 'textTitulo2', alignment: 'right', bold: true }, 
     {}, 
     { text: this.formatIfNumber(datosPl[0].total_dec,formatoNumerico2),
       style: 'textTitulo2', alignment: 'right', bold: true }, 
     {},
     {
       text: this.formatIfNumber(datosPl[0].total_reo,formatoNumerico2),
       style: 'textTitulo2', bold: true, alignment: 'right', border: [true, true, true, true],
     },
   ];

   const montoVarRow = [
     {colSpan: 3, text: 'MONTO DE VARIACIÓN RESPECTO AL CONTRATO INICIAL (Bs)', style: 'textTitulo2', alignment: 'right' }, {}, {},
     {}, {}, {}, {}, {}, {}, {}, {}, {}, 
     { text: this.formatIfNumber(this.datosPlanillaR[0].monto_variacion, formatoNumerico2), style: 'textTitulo2', alignment: 'right', margin: [0,5,0,0]}
   ];

   const porcVarRow = [
     {colSpan: 3, text: 'PORCENTAJE DE VARIACIÓN RESPECTO AL CONTRATO INICIAL', style: 'textTitulo2', alignment: 'right' }, {}, {}, 
     {}, {}, {}, {}, {}, {}, {}, {}, {}, 
     { text: this.formatIfNumber(this.datosPlanillaR[0].porcentaje_modificacion, formatoNumerico5) + '%', style: 'textTitulo2', alignment: 'right', margin: [0,5,0,0]}
   ];
  totalReordenSum = datosPl[0].total_reo;
  totalContratoSum = datosPl[0].total_adjudicado;
  porc_total = (totalReordenSum * 100)/ totalContratoSum;
   const porcTotalRow = [
     {colSpan: 3, text: 'PORCENTAJE TOTAL RESPECTO AL CONTRATO INICIAL', style: 'textTitulo2', alignment: 'right' }, {}, {}, 
     {}, {}, {}, {}, {}, {}, {}, {}, {}, 
     { text: this.formatIfNumber(porc_total, formatoNumerico5) + '%', style: 'textTitulo2', alignment: 'right', margin: [0,5,0,0]}
   ];
  
   arrayData.push(totalRow);
   arrayData.push(montoVarRow);
   arrayData.push(porcVarRow);
   arrayData.push(porcTotalRow);

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