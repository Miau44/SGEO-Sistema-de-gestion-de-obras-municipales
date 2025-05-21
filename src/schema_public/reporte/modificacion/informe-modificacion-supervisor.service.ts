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
export class InformeModificacionSupervisor {
  datosEnvio: any = [];
    datosSup: any = [];
    datosFis: any = [];
    datosInfSup: any = [];
    //let solicitud: Number;

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

    // Datos informe - modificación Supervisor
  async datosInformesModifSupervisor(solicitud: number) {
    const query = `
        SELECT * 
        FROM public."vista_reporte_infMod_supervisor" WHERE id_solicitud = ${solicitud}`;
    const resultado = await this.sequelize.query(query);
    return resultado[0];
  }

     // SUPERVISORES designados por obra 
   async supervisorDesignado(obra: number) {
    const query1 = `
        SELECT * 
        FROM public.vista_supervisores_obra WHERE id_obra = ${obra}`;
    const resultado1 = await this.sequelize.query(query1);
    return resultado1[0];
   }

        // FISCALES designados por obra 
   async fiscalDesignado(obra: number) {
    const query2 = `
        SELECT * 
        FROM public.vista_fiscales_obra WHERE id_obra = ${obra}`;
    const resultado2 = await this.sequelize.query(query2);
    return resultado2[0];
   }

      //Función para generar la fecha de manera escrita
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
                alignment: 'center', margin: [0, 25, 0, 0]},
          { text: '(Firma y Sello)', style: 'textDato', alignment: 'center', margin: [0, 35, 0, 0] }
        ];
        arrayData.push(rowData);
      }
      return arrayData;
    }

// REPORTE - INFORME MODIFICACION SUPERVISOR

async generateInformeModificacionSupervisor(obra: number): Promise<Buffer> {

  const datosGenerales = await this.datosGeneralesObraModif(obra);
  if ((!datosGenerales || (Array.isArray(datosGenerales) && datosGenerales.length === 0) || (typeof datosGenerales === 'object' && Object.keys(datosGenerales).length === 0))){
    throw new Error('No se encontraron datos para el ID de la obra proporcionada');
  }
  this.datosEnvio = datosGenerales;

  const res1 = await this.supervisorDesignado(this.datosEnvio[0].id_obra);
  if (!res1 || (Array.isArray(res1) && res1.length === 0) || (typeof res1 === 'object' && Object.keys(res1).length === 0)) {
      throw new Error('No se encontraron datos del supervisor designado');
  }
  this.datosSup = res1;

  const res2 = await this.fiscalDesignado(this.datosEnvio[0].id_obra);
  if (!res2 || (Array.isArray(res2) && res2.length === 0) || (typeof res2 === 'object' && Object.keys(res2).length === 0)) {
      throw new Error('No se encontraron datos del fiscal designado');
  }
  this.datosFis = res2;

  const res3 = await this.datosInformesModifSupervisor(this.datosEnvio[0].id_solicitud);
  if (!res3 || (Array.isArray(res3) && res3.length === 0) || (typeof res3 === 'object' && Object.keys(res3).length === 0)) {
      throw new Error('No se encontraron datos del informe de Supervisor');
  }
  this.datosInfSup = res3;  

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
        text: this.datosEnvio[0].cod_carpeta + '-' + 'SUP' + '-' + '1',
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
                { text: 'REF.:', style: 'textTitulo', margin: [0, 5, 0, 5], alignment:'right' },
                { text: this.datosEnvio[0].desc_subtipo + ' N°' + this.datosEnvio[0].numero_modificacion, style: 'textTitulo', margin: [0, 5, 0, 5] },
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
          text: this.datosInfSup[0].antecedentes,
          style: 'textDato', alignment:'justify'
      }, 
      {
        text: '\n'
      },
      {
        text: '3.   JUSTIFICACION TÉCNICA GENERAL\n',
        style: 'subheader', margin: [0, 0, 0, 5]
      },
      {
        text: this.datosInfSup[0].analisis,
        style: 'textDato', alignment:'justify'
      },
      {
        text: '4.   MODIFICACIÓN A LAS CANTIDADES DE ITEMS\n',
        style: 'subheader', margin: [0, 0, 0, 5]
      },
      {
        text: '4.1. ÍTEMS CON CANTIDADES EN INCREMENTO\n',
        style: 'subheader', margin: [10, 0, 0, 5]
      },
      {
        table: {
          widths: [20, '*', 30, 40, 40, 40, 40, 40], // 8 columnas
          body: [
            [
              {
                colSpan: 6,
                text: ' ', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd'
              }, {}, {}, {}, {}, {}, // 5 celdas vacías para completar el colSpan de 6
              {
                colSpan: 2,
                text: 'INCREMENTO',
                style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' }, 
              {} // 1 celda vacía para completar colSpan de 2
            ],
            [
              { text: 'ITEM', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
              { text: 'DESCRIPCIÓN', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
              { text: 'UNIDAD', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
              { text: 'PRECIO UNITARIO', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
              { text: 'CANTIDAD VIGENTE', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
              { text: 'MONTO VIGENTE', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
              { text: 'CANTIDAD PROPUESTA', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
              { text: 'MONTO PROPUESTO', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' }
            ]
          ]
        }
        
      },
      {
        text: '\n'
      },
      {
        text: '4.1.1. JUSTIFICACIÓN POR ÍTEMS CON CANTIDADES EN INCREMENTO\n',
        style: 'subheader', margin: [10, 0, 0, 5]
      },
      {
        text: 'JUSTIFICACION DE ITEMS INCREMENTADOS BD....',
        style: 'textDato', alignment:'justify'
      },
      {
        text: '4.2. ÍTEMS CON CANTIDADES EN DECREMENTO\n',
        style: 'subheader', margin: [10, 0, 0, 5]
      },
      {
        table: {
          widths: [20, '*', 30, 40, 40, 40, 40, 40], // 8 columnas
          body: [
            [
              {
                colSpan: 6,
                text: ' ', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd'
              }, {}, {}, {}, {}, {}, // 5 celdas vacías para completar el colSpan de 6
              {
                colSpan: 2,
                text: 'INCREMENTO',
                style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' }, 
              {} // 1 celda vacía para completar colSpan de 2
            ],
            [
              { text: 'ITEM', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
              { text: 'DESCRIPCIÓN', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
              { text: 'UNIDAD', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
              { text: 'PRECIO UNITARIO', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
              { text: 'CANTIDAD VIGENTE', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
              { text: 'MONTO VIGENTE', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
              { text: 'CANTIDAD PROPUESTA', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
              { text: 'MONTO PROPUESTO', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' }
            ]
          ]
        }
        
      },
      {
        text: '4.2.1. JUSTIFICACIÓN POR ÍTEMS CON CANTIDADES EN DECREMENTO\n',
        style: 'subheader', margin: [10, 0, 0, 5]
      },
      {
        text: 'JUSTIFICACION DE ITEMS DECREMENTADOS BD....',
        style: 'textDato', alignment:'justify'
      },
       {
        text: '4.3. ÍTEMS A ADICIONAR\n',
        style: 'subheader', margin: [10, 0, 0, 5]
      },
      {
        table: {
          widths: [20, '*', 30, 40, 40, 40, 40, 40], // 8 columnas
          body: [
            [
              {
                colSpan: 6,
                text: ' ', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd'
              }, {}, {}, {}, {}, {}, // 5 celdas vacías para completar el colSpan de 6
              {
                colSpan: 2,
                text: 'INCREMENTO',
                style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' }, 
              {} // 1 celda vacía para completar colSpan de 2
            ],
            [
              { text: 'ITEM', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
              { text: 'DESCRIPCIÓN', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
              { text: 'UNIDAD', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
              { text: 'PRECIO UNITARIO', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
              { text: 'CANTIDAD VIGENTE', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
              { text: 'MONTO VIGENTE', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
              { text: 'CANTIDAD PROPUESTA', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
              { text: 'MONTO PROPUESTO', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' }
            ]
          ]
        }
        
      },
      {
        text: '4.3.1. JUSTIFICACIÓN DE ÍTEMS NUEVOS\n',
        style: 'subheader', margin: [10, 0, 0, 5]
      },
      {
        text: 'JUSTIFICACION DE ITEMS NUEVOS BD....\n',
        style: 'textDato', alignment:'justify'
      },
      {
        text: '4.3.2. TABLA DE PRECIOS UNITARIOS NUEVOS\n',
        style: 'subheader', margin: [10, 0, 0, 5]
      },
      {
        table: {
          widths: [20, '*', 30, 60, 60, 60], // 6 columnas
          body: [
            [
              { text: 'ITEM', style: 'textTituloT', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
              { text: 'DESCRIPCIÓN', style: 'textTituloT', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
              { text: 'UNIDAD', style: 'textTituloT', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
              { text: 'PRECIO CONTRATISTA', style: 'textTituloT', alignment: 'center', margin: [0, 5, 0, 0], fillColor: '#dddddd' },
              { text: 'PRECIO GMLP', style: 'textTituloT', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
              { text: 'PRECIO CONSENSUADO', style: 'textTituloT', alignment: 'center',  margin: [0, 5, 0, 0], fillColor: '#dddddd' },
            ],
          ]
        }
      },
      {
        text: '\n\n'
      },
      {
        text: '5.   RESÚMEN DE CANTIDADES\n',
        style: 'subheader', margin: [0, 0, 0, 5]
      },
      {
        text: 'La planilla del ' + this.datosEnvio[0].desc_subtipo + ' N°' + this.datosEnvio[0].numero_modificacion + ' (Anexo) refleja el reordenamiento de las cantidades de los ítems nuevos.\n',
        style: 'textDato',  alignment:'justify', margin: [10, 0, 0, 5]
      },
      {
        text: '6.   MODIFICACIÓN AL PLAZO CONTRACTUAL\n',
        style: 'subheader', margin: [0, 0, 0, 5]
      },
      {
        text: this.datosInfSup[0].obs_general,
        style: 'textDato',  alignment:'justify', margin: [10, 0, 0, 5]
      },
      {
        text: '7.   MODIFICACIÓN AL MONTO CONTRACTUAL\n',
        style: 'subheader', margin: [0, 0, 0, 5]
      },
      {
        text: 'TEXTO XXXXXX \n',
        style: 'textDato', margin: [10, 0, 0, 5]
      },
      {
        text: '8.   CONCLUSIÓN\n',
        style: 'subheader', margin: [0, 0, 0, 5]
      },
      {
        text: 'Habiendo descrito los antecedentes, justificaciones y otros inherentes a la pertinencia del presente ' + this.datosEnvio[0].desc_subtipo + ' y contando con la conformidad ' + 
        'del contratista ' + this.datosEnvio[0].proponente_razon_social + ' es que cómo Supervisor(es) de Obra, se recomienda la aprobación del presente ' + this.datosEnvio[0].desc_subtipo + 
        ' N°' + this.datosEnvio[0].numero_modificacion + ', por' + 'REFERENCIA' + ', de acuerdo al siguiente detalle:\n',
        style: 'textDato', alignment:'justify', margin: [10, 0, 0, 5]
      },
      {
        table: {
          widths: ['*', 60, 60, 60, 60, 60], // 6 columnas
          body: [
            [
              { text: 'TIPO MODIFICACIÓN', style: 'textTituloT', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
              { text: 'VARIACIÓN DEL MONTO(Bs.)', style: 'textTituloT', alignment: 'center', margin: [0, 5, 0, 0], fillColor: '#dddddd' },
              { text: 'MONTO(Bs.)', style: 'textTituloT', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
              { text: 'MODIFICACIÓN DEL PLAZO(d.c.)', style: 'textTituloT', alignment: 'center', margin: [0, 5, 0, 0], fillColor: '#dddddd' },
              { text: 'PLAZO TOTAL(d.c.)', style: 'textTituloT', alignment: 'center', margin: [0, 5, 0, 0], fillColor: '#dddddd' },
              { text: 'NUEVA FECHA CONCLUSIÓN', style: 'textTituloT', alignment: 'center',  margin: [0, 5, 0, 0], fillColor: '#dddddd' },
            ],
          ]
        }
      },
      {
        text: '\n'
      },
      {
        text: '9.   ANEXOS\n',
        style: 'subheader', margin: [0, 0, 0, 5]
      },
      {
        text: this.datosInfSup[0].anexos + '\n',
        style: 'textDato', margin: [10, 0, 0, 5]
      },
      {
        text: ['\n'],
      }, 
      {
        text: 'Es cuánto se informa para los fines consiguientes.',
        style: 'textDato', alignment:'justify'
      },
      {
        text: ['\n\n'],
      },
      {
          table: {
            widths: ['50%','50%'],
            body: [
              ...this.buildSupervisores(this.datosSup)
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