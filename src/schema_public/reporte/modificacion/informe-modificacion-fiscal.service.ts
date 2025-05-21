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
  async datosGeneralesObraModif(obra: number) {
    const query1 = `
        SELECT * 
        FROM public.vista_reporte_modificacion_gral WHERE id_obra = ${obra}`;
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
                alignment: 'center', margin: [0, 25, 0, 0]},
          { text: '(Firma y Sello)', style: 'textDato', alignment: 'center', margin: [0, 35, 0, 0] }
        ];
        arrayData.push(rowData);
      }
      return arrayData;
    }

// REPORTE - INFORME MODIFICACION FISCAL

async generateInformeModificacionFiscal(obra: number): Promise<Buffer> {

  const datosGenerales = await this.datosGeneralesObraModif(obra);
  if ((!datosGenerales || (Array.isArray(datosGenerales) && datosGenerales.length === 0) || (typeof datosGenerales === 'object' && Object.keys(datosGenerales).length === 0))){
    throw new Error('No se encontraron datos para el ID de la obra proporcionada');
  }
  this.datosEnvio = datosGenerales;

  const res1 = await this.fiscalDesignado(obra);
  if (!res1 || (Array.isArray(res1) && res1.length === 0) || (typeof res1 === 'object' && Object.keys(res1).length === 0)) {
      throw new Error('No se encontraron datos del fiscal designado');
  }
  this.datosFis = res1;

  const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
  const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
   const imgPath = 'assets/images/membretado_oficio.png';
 
    const documentDefinition = {
    pageSize: 'LEGAL' as any,
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
        text: 'INFORME\n',
        style: 'header', alignment: 'center'
      } as any,
      {
        text: this.datosEnvio[0].cod_carpeta + '-' + 'FIS' + '-' + '1',
        style: 'subheader', alignment: 'center'
      },
      {
        text: '\n\n',
      },
      {
          table: {
            widths: ['15%', '85%'],
            body: [
              [
                { text: 'A:', style: 'textTitulo', margin: [0, 5, 0, 5], alignment:'right' },
                // { text: [
                //     { text: this.datosAF[0].aprobador + '\n', style: 'textDato' },
                //     { text: (
                //       this.datosAF[0].desc_cod_da >= 37 && this.datosAF[0].desc_cod_da <= 45
                //         ? this.datosAF[0].nombre_da
                //         : this.datosAF[0].nombre_ue
                //     ), style: 'textTitulo' }
                //   ],
                //   margin: [0, 5, 0, 5] 
                // },
                { text: ' ' }
              ],
              // Fila VIA: solo si la condición NO se cumple
              // ...(
              //   this.datosAF[0].desc_cod_da >= 37 && this.datosAF[0].desc_cod_da <= 45
              //     ? [] // No incluir la fila
              //     : [[
              //         { text: 'VIA:', style: 'textTitulo', margin: [0, 5, 0, 5], alignment:'right' },
              //         {
              //           text: [
              //             { text: this.datosJUFOT[0].nombre_jefe + '\n', style: 'textDato' },
              //             { text: this.datosJUFOT[0].cargo_jefe, style: 'textTitulo' }
              //           ],
              //           margin: [0, 5, 0, 5]
              //         }
              //       ]]
              // ),
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
                { text: this.datosEnvio[0].desc_subtipo + ' N°' + this.datosEnvio[0].numero_modificacion , style: 'textTitulo', margin: [0, 5, 0, 5] },
              ],
              [
                { text: 'FECHA:', style: 'textTitulo', margin: [0, 5, 0, 5], alignment:'right' },
                { text: '', style: 'textDato', margin: [0, 5, 0, 5] },
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
        text: '1.   DATOS DE LA OBRA\n\n',
        style: 'subheader', margin: [0, 0, 0, 5]
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
              { text: [{ text: this.datosEnvio[0].proponente_razon_social + '\n', style: 'textDato' }] }
            ],
            [
              { text: [{ text: 'MONTO CONTRATO INICIAL:\n', style: 'textTitulo', alignment: 'right' },], fillColor: '#dddddd' },
              { text: [{ text: 'Bs.' + this.datosEnvio[0].monto_contrato + '\n', style: 'textDato' }], fillColor: '#dddddd' }
            ],
            [
              { text: [{ text: 'PLAZO DE EJECUCIÓN,CONTRATO INICIAL:\n', style: 'textTitulo', alignment: 'right' },] },
              { text: [{ text: this.datosEnvio[0].plazo_contrato + '\n', style: 'textDato' }] }
            ],
            [
              { text: [{ text: 'FECHA INICIO DE OBRA:\n', style: 'textTitulo', alignment: 'right' },], fillColor: '#dddddd' },
              { text: [{ text: this.fechaString(this.datosEnvio[0].fecha_inicio_ejecucion) + '\n\n', style: 'textDato' }], fillColor: '#dddddd' }
            ],
            [
              { text: [{ text: 'FECHA CONCLUSIÓN PROGRAMADA:\n', style: 'textTitulo', alignment: 'right' },] },
              { text: [{ text: this.fechaString(this.datosEnvio[0].fecha_recep_definitiva) + '\n\n', style: 'textDato' }] }
            ],
            [
              { text: [{ text: 'TOTAL AMPLIACIÓN DE PLAZO:\n', style: 'textTitulo', alignment: 'right' },], fillColor: '#dddddd' },
              { text: [{ text: this.datosEnvio[0].dias_variacion + '\n', style: 'textDato' }], fillColor: '#dddddd' }
            ],
            [
              { text: [{ text: 'NUEVA FECHA DE CONCLUSIÓN:\n', style: 'textTitulo', alignment: 'right' },] },
              { text: [{ text: this.fechaString(this.datosEnvio[0].fecha_validacion_carpeta) + '\n\n', style: 'textDato' }] }
            ],
          ]
        }, margin: [20, 0, 0, 0]
        //layout: 'noBorders'
      },
      {
        text: '\n2.   ANTECEDENTES\n',
        style: 'subheader', margin: [0, 0, 0, 5] 
      },
      {
        table: {
          widths: ['*', 60, 60, 60, 60, 60], // 6 columnas
          body: [
            [
              { text: 'TIPO MODIFICACIÓN', style: 'textTituloT', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
              { text: 'FECHA MODIFICACIÓN', style: 'textTituloT', alignment: 'center', margin: [0, 5, 0, 0], fillColor: '#dddddd' },
              { text: 'VARIACIÓN DEL MONTO(Bs.)', style: 'textTituloT', alignment: 'center', margin: [0, 5, 0, 0], fillColor: '#dddddd' },
              { text: 'MONTO (Bs.)', style: 'textTituloT', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
              { text: 'MODIF. DEL PLAZO(d.c.)', style: 'textTituloT', alignment: 'center', margin: [0, 5, 0, 0], fillColor: '#dddddd' },
              { text: 'FECHA CONCLUSIÓN PROGRAMADA', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
            ],
          ]
        }
      },
      {
        text: '\n'
      },
      {
          text: 'En atención al informe de la supervisión ' + 'XXXXXX' + ' de fecha ' + 'XXXXXX' + 
          ' emitido por la supervisión de obra, que establece los sustentos necesarios para la presente modificación reerida a:' + 
          'REFERENCIA DEL INFORME INICIAL' + 'se emite el presente informe.',
          style: 'textDato', alignment:'justify', margin: [10, 0, 0, 5]
      }, 
      {
        text: '\n'
      },
      {
        text: '3.   CONCLUSIONES\n',
        style: 'subheader', margin: [0, 0, 0, 5]
      },
      {
        text: 'Habiendo la fiscalización designada revisado y analizado el informe de Supervisión XXXX ' + 'de fecha ' + 'XXXXX ' + 'emitido por la supervisión ' + 
              'de obra y en atención a que evidentemente se requiere la modificación a ser introducida a través de ' + this.datosEnvio[0].desc_subtipo + ' N°' + 
              this.datosEnvio[0].numero_modificacion + ', a fin de garantizar la ' + 'conclusión de la obra, así como su utilidad, ésta Fiscalización aprueba el ' + 
              'Informe de Supervisor y recomienda la elaboración y suscripción del ' + this.datosEnvio[0].desc_subtipo + ' N°' + this.datosEnvio[0].numero_modificacion + 
              ' por ' + 'REFERENCIA DEL INFORME DE SUPERVISOR' + '. Se adjunta toda la documentación enviada al efecto por la Supervisión de Obra.',
        style: 'textDato', alignment:'justify', margin: [10, 0, 0, 5]
      },
      {
        text: ['\n'],
      }, 
      {
        text: 'Es cuánto se informa para los fines consiguientes.',
        style: 'textDato', alignment:'justify', margin: [10, 0, 0, 5]
      },
      {
        text: ['\n\n'],
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
        //color: 'gray', 
        opacity: 0.8,
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
}

}