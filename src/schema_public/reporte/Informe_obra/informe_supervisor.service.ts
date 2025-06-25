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
export class InformeObraSupervisor {
datosEnvio: any = [];
datosSup: any = [];
datosInf: any = [];
datosJU: any = [];
   
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

     // JEFE UNIDAD por obra 
   async jefeUnidad(obra: number) {
    const query4 = `
        SELECT * 
        FROM public."vista_reporte_jefeUnidad_Obra" WHERE id_obra = ${obra}`;
    const resultado4 = await this.sequelize.query(query4);
    return resultado4[0];
   }

 
// REPORTE - INFORME DE OBRA - SUPERVISOR

async generateInformeObraSupervisor(id_obra: number, id_informe: number): Promise<Buffer> {

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
      throw new Error('No se encontraron datos del supervisor designado');
  }
  this.datosSup = res1;

  const res2 = await this.jefeUnidad(id_obra);
  if (!res2 || (Array.isArray(res2) && res2.length === 0) || (typeof res2 === 'object' && Object.keys(res2).length === 0)) {
      throw new Error('No se encontraron datos del supervisor designado');
  }
  this.datosJU = res2;

  const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
  const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
  const imgPath = 'assets/images/membretado_oficio.png';
  const marcaAgua = this.datosInf[0].fecha_aprobacion;

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
        text: 'INFORME\n',
        style: 'header', alignment: 'center'
      } as any,
      {
        text: this.datosEnvio[0].cod_carpeta + '-' + this.datosInf[0].cite_informe + '-' + this.datosInf[0].correlativo,
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
                { text: 'A:', style: 'textTitulo', margin: [0, 5, 0, 5], alignment:'right' },
                { 
                  text: [
                      { text: this.datosJU[0].nom_jefe + '\n', style: 'textDato', alignment: 'left' },
                      { text: 'JEFE DE UNIDAD', style: 'textTitulo', alignment: 'left' }
                    ]
                },
              ],
              [
                { text: 'DE:', style: 'textTitulo', margin: [0, 6, 0, 0], alignment: 'right' },
                { 
                  text: [
                      {
                        text: (
                          Array.isArray(this.datosSup)
                            ? this.datosSup
                                .filter(s => s && s.supervisor)
                                .map(s => s.supervisor)
                                .join('\n')  // salto de linea 
                            : ''
                        ) + '\n',
                        style: 'textDato', alignment: 'left'
                      },
                      {
                        text: 'SUPERVISOR(ES) DE OBRA', style: 'textTitulo', alignment: 'left'
                      },
                    ]
                },       
              ],
              [
                { text: 'REF.:', style: 'textTitulo', alignment:'right' },
                { text: this.datosInf[0].referencia, style: 'textDato' },
              ],
              [
                { text: 'FECHA:', style: 'textTitulo', alignment:'right' },
                { text: this.fechaString(this.datosInf[0].fecha_aprobacion), style: 'textDato' },
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
          margin: [10, 0, 10, 10], // Márgenes de la tabla
      },
      {
        text: 'Respecto al estado de la obra ' + this.datosEnvio[0].desc_carpeta + ' con código ' + this.datosEnvio[0].cod_carpeta + ' se informa lo siguiente:',
        style: 'textDato', alignment:'justify'
      },
      {
        text: '\n',
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
              { text: [{ text: 'NÚMERO DE CONTRATO INICIAL:\n', style: 'textTitulo', alignment: 'right' },] },
              ...(
                this.datosEnvio[0].numero_contrato 
                ? [ { text: [ { text: this.datosEnvio[0].numero_contrato, style: 'textDato' } ] } ]
                : [ { text: [ { text: 'Sin contrato', style: 'textTitulo' } ] } ]
              )
            ],
            [
              { text: [{ text: 'FECHA CONTRATO INICIAL:\n', style: 'textTitulo', alignment: 'right' },], fillColor: '#dddddd' },
              ...(
                this.datosEnvio[0].fecha_numeracion 
                ? [ { text: [ { text: this.formatearFecha(this.datosEnvio[0].fecha_numeracion), style: 'textDato' } ], fillColor: '#dddddd' } ]
                : [ { text: [ { text: 'Sin contrato', style: 'textTitulo' } ], fillColor: '#dddddd' } ]
              )
            ],
            [
              { text: [{ text: 'EMPRESA CONTRATISTA:\n', style: 'textTitulo', alignment: 'right' },] },
              ...(
                this.datosEnvio[0].proponente_razon_social 
                ? [ { text: [ { text: this.datosEnvio[0].proponente_razon_social, style: 'textDato' } ] } ]
                : [ { text: [ { text: 'Sin contrato', style: 'textTitulo' } ] } ]
              )
            ],
            [
              { text: [{ text: 'MONTO CONTRATO INICIAL (Bs):\n', style: 'textTitulo', alignment: 'right' },], fillColor: '#dddddd' },
              ...(
                this.datosEnvio[0].monto_contrato 
                ? [ { text: [ { text: this.formatIfNumber(this.datosEnvio[0].monto_contrato,formatoNumerico2), style: 'textDato' } ], fillColor: '#dddddd' } ]
                : [ { text: [ { text: 'Sin contrato', style: 'textTitulo' } ], fillColor: '#dddddd' } ]
              )
            ],
            [
              { text: [{ text: 'FECHA ORDEN DE PROCEDER:', style: 'textTitulo', alignment: 'right' },] },
              ...(
                this.datosEnvio[0].fecha_inicio_ejecucion 
                ? [ { text: [ { text: this.formatearFecha(this.datosEnvio[0].fecha_inicio_ejecucion), style: 'textDato' } ] } ]
                : [ { text: [ { text: 'Sin emisión de Orden de Proceder', style: 'textTitulo' } ] } ]
              )
            ],
            // [
            //   { text: [{ text: 'FECHA CONCLUSIÓN PROGRAMADA:', style: 'textTitulo', alignment: 'right' },], fillColor: '#dddddd' },
            //   { text: [{ text: this.formatearFecha(this.datosEnvio[0].fecha_recep_provisional), style: 'textDato' }], fillColor: '#dddddd' }
            // ],
          ]
        }, margin: [10, 0, 0, 7] 
        //layout: 'noBorders'
      },
      {
        text: '\n2.   ANTECEDENTES',
        style: 'textTitulo', margin: [0, 0, 0, 5] 
      },
      {
          text: this.datosInf[0].antecedentes,
          style: 'textDato', alignment:'justify', margin: [10, 0, 0, 0]
      },
      {
        text: '\n3.   ANÁLISIS',
        style: 'textTitulo', margin: [0, 0, 0, 5] 
      },
      {
          text: this.datosInf[0].analisis,
          style: 'textDato', alignment:'justify', margin: [10, 0, 0, 0]
      }, 
      {
        text: '\n'
      },
      {
        text: '4.   CONCLUSIONES\n',
        style: 'textTitulo', margin: [0, 0, 0, 5]
      },
      {
        text: this.datosInf[0].conclusion,
        style: 'textDato', alignment:'justify', margin: [10, 0, 0, 0] 
      },
      {
        text: ['\n'],
      }, 
      {
        text: '5.   RECOMENDACIONES\n',
        style: 'textTitulo', margin: [0, 0, 0, 5]
      },
      {
        text: this.datosInf[0].recomendacion,
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
              ...this.buildSupervisores(this.datosSup)
              ]
          }, margin: [20,0,20,0],
          layout: {
          hLineColor: () => '#444444', // color gris opaco para líneas horizontales
          vLineColor: () => '#444444', // color gris opaco para líneas verticales
          hLineWidth: () => 0.7,       // grosor más fino
          vLineWidth: () => 0.7
          }
        },
      {
        text: [
        { text: '\n\n\nCc.Arch.'},
        ...(
            this.datosInf[0].id_documento 
            ? [ { text: [ { text: '\nDocumentación adjunta' } ] } ]
            : [ { text: [ { text: '', style: 'textDato' } ] } ]
            )
        ],
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
  if (!iso) return undefined;

  if (typeof iso !== 'string') {
    // Si no es string, lo convertimos a string (opcional) o devolvemos undefined
    iso = String(iso);
  }

  // Intentamos detectar el formato YYYY-MM-DD
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, anio, mes, dia] = match;
    return `${dia}/${mes}/${anio}`;
  }

  // Si no coincide, probamos con Date
  const fecha = new Date(iso);
  if (isNaN(fecha.getTime())) {
    return undefined;  // Fecha inválida
  }

  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
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

   //Cargar tabla de SUPERVISORES - CON RECUADRO
    buildSupervisores(data: any[]) {
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

   
  // FORMATO DE NUMEROS
  private formatIfNumber(value: any, formatter: Intl.NumberFormat): string {
    if (value === null || value === undefined || value === '') return '';
    
    const num = Number(value);
    if (isNaN(num)) return '';

    return formatter.format(num);
}

}