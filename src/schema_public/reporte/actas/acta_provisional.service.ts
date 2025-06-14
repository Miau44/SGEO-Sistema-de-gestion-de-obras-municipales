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
export class ActaProvisional {
datosEnvio: any = [];
datosSup: any = [];
datosFis: any = [];
datosInf: any = [];
   
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

  // Datos generales obra 
  async datosGeneralesObra(id_obra: number) {
    const query1 = `
        SELECT * 
        FROM public."vista_reporte_infobra_gral" WHERE id_obra = ${id_obra}`;
    const resultado = await this.sequelize.query(query1);
    return resultado[0];
  }

    // Datos generales Informe 
  async datosInformeObra(id_informe: number) {
    const query2 = `
        SELECT * 
        FROM public."vista_reporte_InformeObra" WHERE id_informe = ${id_informe}`;
    const resultado2 = await this.sequelize.query(query2);
    return resultado2[0];
  }

    // SUPERVISORES designados por obra 
   async supervisorDesignado(obra: number) {
    const query3 = `
        SELECT * 
        FROM public."vista_supervisores_obra" WHERE id_obra = ${obra}`;
    const resultado3 = await this.sequelize.query(query3);
    return resultado3[0];
   }

    // FISCALES designados por obra 
   async fiscalDesignado(obra: number) {
    const query4 = `
        SELECT * 
        FROM public.vista_fiscales_obra WHERE id_obra = ${obra}`;
    const resultado4 = await this.sequelize.query(query4);
    return resultado4[0];
   }

 
// REPORTE - RECEPCION PROVISIONAL

async generateActaProvisional(id_obra: number, id_informe: number): Promise<Buffer> {

  const datosGenerales = await this.datosGeneralesObra(id_obra);
  if ((!datosGenerales || (Array.isArray(datosGenerales) && datosGenerales.length === 0) || (typeof datosGenerales === 'object' && Object.keys(datosGenerales).length === 0))){
    throw new Error('No se encontraron datos para el ID de la obra proporcionada');
  }
  this.datosEnvio = datosGenerales;

  const datosInforme = await this.datosInformeObra(id_informe);
  if ((!datosInforme || (Array.isArray(datosInforme) && datosInforme.length === 0) || (typeof datosInforme === 'object' && Object.keys(datosInforme).length === 0))){
    throw new Error('No se encontraron datos para del informe de obra');
  }
  this.datosInf = datosInforme;

  const res1 = await this.supervisorDesignado(id_obra);
  if (!res1 || (Array.isArray(res1) && res1.length === 0) || (typeof res1 === 'object' && Object.keys(res1).length === 0)) {
      throw new Error('No se encontraron datos del Supervisor designado');
  }
  this.datosSup = res1;

  const res2 = await this.fiscalDesignado(id_obra);
  if (!res2 || (Array.isArray(res2) && res2.length === 0) || (typeof res2 === 'object' && Object.keys(res2).length === 0)) {
      throw new Error('No se encontraron datos del Fiscal designado');
  }
  this.datosFis = res2;

  const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
  const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
  const imgPath = 'assets/images/membretado_oficio.png';
  const marcaAgua = this.datosEnvio[0].fecha_aprobacion;

  const formatoNumerico2 = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
    });

    console.log('DATOS obra',this.datosEnvio);
 
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
        text: 'ACTA DE RECEPCIÓN PROVISIONAL DE OBRA\n',
        style: 'header', alignment: 'center'
      } as any,
      {
        text: this.datosEnvio[0].cod_carpeta + '-' + this.datosInf[0].cite_informe + '-1',
        style: 'subheader', alignment: 'center'
      },
      {
        text: '\n',
      },
      {
        text: 'En la ciudad de La Paz a Hrs. ' + this.datosInf[0].hora_registro + ' del día ' + this.fechaString(this.datosInf[0].fecha_registro) + 
              ', en presencia de las autoridades de la comisión de recepción de obras del GOBIERNO AUTÓNOMO MUNICIPAL DE LA PAZ ' + 
              ' y el contratista ' + this.datosEnvio[0].proponente_razon_social + ', se procedió a la recepción provisional de la siguiente obra:',
        style: 'textDato', alignment:'justify'
      },
      {
        text: '\n',
      },
      {
        text: 'DATOS GENERALES',
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
          ]
        }, margin: [10, 0, 10, 7] 
        //layout: 'noBorders'
      },
      {
        text: 'Realizada la inspección correspondiente por la comisión de recepción de obras, se constató que la obra fue ejecutada ' +
              'conforme a las especificaciones técnicas y económicas del contrato.',
        style: 'textDato', alignment:'justify'
      },
      {
        text: '\n',
      },
      {
        table: {
          widths: ['*', 300],
          body: [
            [
              { text: [{ text: 'Monto del contrato (Bs):', style: 'textTitulo', alignment: 'right' },], fillColor: '#dddddd' },
              { text: [{ text: this.formatIfNumber(this.datosEnvio[0].monto_contrato, formatoNumerico2), style: 'textDato' }], fillColor: '#dddddd' }
            ],
            [
              { text: [{ text: 'Monto con Orden de Cambio (Bs):\n', style: 'textTitulo', alignment: 'right' },] },
              { text: [{ text: ' ' + '\n', style: 'textDato' }] }
            ],
            [
              { text: [{ text: 'Plazo según contrato:\n', style: 'textTitulo', alignment: 'right' },], fillColor: '#dddddd' },
              { text: [{ text: this.datosEnvio[0].plazo_contrato + ' d.c.\n', style: 'textDato' }], fillColor: '#dddddd' }
            ],
            [
              { text: [{ text: 'Fecha de Orden de Proceder:', style: 'textTitulo', alignment: 'right' },], fillColor: '#dddddd' },
              { text: [{ text: this.formatearFecha(this.datosEnvio[0].fecha_inicio_ejecucion), style: 'textDato' }], fillColor: '#dddddd' }
            ],
            [
              { text: [{ text: 'Fecha conclusión programada según contrato:\n', style: 'textTitulo', alignment: 'right' },] },
              { text: [{ text: this.formatearFecha(this.datosEnvio[0].fecha_recep_provisional) + '\n', style: 'textDato' }], margin:[0,5,0,0] }
            ],
            [
              { text: [{ text: 'Ampliación de plazo:\n', style: 'textTitulo', alignment: 'right' },], fillColor: '#dddddd' },
              { text: [{ text: '' + '\n', style: 'textDato' }], fillColor: '#dddddd' }
            ],
            [
              { text: [{ text: 'Nueva fecha de conclusión:', style: 'textTitulo', alignment: 'right' },], fillColor: '#dddddd' },
              { text: [{ text: '', style: 'textDato', bold:true }], fillColor: '#dddddd' }
            ],
            [
              { text: [{ text: 'Fecha real de conclusión:\n', style: 'textTitulo', alignment: 'right' },] },
              { text: [{ text: '' + '\n', style: 'textDato' }] }
            ],
            [
              { text: [{ text: 'Plazo real de ejecución:\n', style: 'textTitulo', alignment: 'right' },], fillColor: '#dddddd' },
              { text: [{ text: '' + '\n', style: 'textDato' }], fillColor: '#dddddd' }
            ],
          ]
        }, margin: [10, 0, 10, 7] 
        //layout: 'noBorders'
      },
      {
        text: '\n'
      },
      {
        text: 'La obra se recibe con las siguientes observaciones a ser subsanadas durante el periodo de corrección de defectos, ' +
              'computables a partir de las fecha de Recepción Provisional:',
        style: 'textDato', alignment:'justify'
      },
      {
        text: '\n'
      },
      {
        text: this.datosInf[0].obs_general,
        style: 'textDato', alignment:'justify', margin: [10, 0, 0, 0]
      },
      {
        text: ['\n'],
      }, 
      {
        text: 'Se establece, en función al tipo de obra, un plazo de ' + this.datosEnvio[0].plazo_prov_definitiva + ' días calendario para la realización de la ' + 
              'Recepción Definitiva, plazo que correrá a partir de la fecha de RECEPCIÓN PROVISIONAL.\n\n' + 
              'En constancia por la Comisión de Recepción de Obras, firman:',
        style: 'textDato', alignment:'justify'
      },
      {
        text: ['\n\n\n\n'],
      },
      {
          table: {
            widths: ['*', '*'],
            body: [
              [
                {
                  text: '\nÁREA SOLICITANTE', style: 'textTitulo', alignment: 'center'
                },
                {
                  text:
                      [
                        { text: this.datosEnvio[0].proponente_razon_social + '\n', style: 'textDato', alignment: 'center' },
                        { text: 'EMPRESA CONTRATISTA', style: 'textTitulo', alignment: 'center' }
                      ]
                },
              ]
            ]
          }, layout: 'noBorders'
      },
      {
        text: ['\n\n\n\n\n'],
      },
      {
          table: {
            widths: ['*', '*'],
            body: [
              [
                {
                  text:
                      [
                        { text: (Array.isArray(this.datosSup)
                                ? this.datosSup
                                    .filter(s => s && s.supervisor)
                                    .map(s => s.supervisor)
                                    .join(' | ')
                                : ''
                              ) + '\n', style: 'textDato', alignment: 'center' },
                        { text: 'SUPERVISOR(ES) DE OBRA', style: 'textTitulo', alignment: 'center' }
                      ]
                },
                {
                  text:
                      [
                        { text: (Array.isArray(this.datosFis)
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
        text: ['\n\ncc.Arch.' ],
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
        fontSize: 14,
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

    //Cargar tabla de Supervisores
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
   
  // FORMATO DE NUMEROS
  private formatIfNumber(value: any, formatter: Intl.NumberFormat): string {
    if (value === null || value === undefined || value === '') return '';
    
    const num = Number(value);
    if (isNaN(num)) return '';

    return formatter.format(num);
}

}