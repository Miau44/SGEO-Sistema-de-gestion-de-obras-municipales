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
    datosModAp: any = [];
    datosMod: any = [];
    datosIncremento: any = [];
    datosDecremento: any = [];
    datosAdicion: any = [];
    datosINuevos: any = [];
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
  async datosInformeModifSupervisor(solicitud: number) {
    const query = `
        SELECT * 
        FROM public."vista_reporte_InfMod_Supervisor" WHERE id_solicitud = ${solicitud}`;
    const resultado = await this.sequelize.query(query);
    return resultado[0];
  }

     // SUPERVISORES designados por obra 
   async supervisorDesignado(obra: number) {
    const query1 = `
        SELECT * 
        FROM public."vista_supervisores_obra" WHERE id_obra = ${obra}`;
    const resultado1 = await this.sequelize.query(query1);
    return resultado1[0];
   }

        // FISCALES designados por obra 
   async fiscalDesignado(obra: number) {
    const query2 = `
        SELECT * 
        FROM public."vista_fiscales_obra" WHERE id_obra = ${obra}`;
    const resultado2 = await this.sequelize.query(query2);
    return resultado2[0];
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
        FROM public."vista_reporte_modif_aprobadas" WHERE id_modificacion_pago = ${solicitud}`;
    const resultado3 = await this.sequelize.query(query3);
    return resultado3[0];
   }

 // Tabla ITEM - INCREMENTO - DECREMENTO
   async itemsModificacion(solicitud: number, tipo: string) {
    const query4 = `
        SELECT * 
        FROM public."vista_reporte_item_modificacion" 
        WHERE  id_modificacion_pago = ${solicitud} AND tipo_item_modificacion = '${tipo}' `;
    const resultado4 = await this.sequelize.query(query4);
    return resultado4[0];
   }

      // Resumen de Modificacion Actual 
   async itemsNuevos(solicitud: number) {
    const query5 = `
        SELECT * 
        FROM public."vista_reporte_item_nuevo" WHERE id_modificacion_pago = ${solicitud}`;
    const resultado5 = await this.sequelize.query(query5);
    return resultado5[0];
   }

// REPORTE - INFORME MODIFICACION SUPERVISOR

async generateInformeModificacionSupervisor(id_modif_pago: number): Promise<Buffer> {

    const datosGenerales = await this.datosGeneralesObraModif(id_modif_pago);
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

    const res3 = await this.datosInformeModifSupervisor(this.datosEnvio[0].id_solicitud);
    if (!res3 || (Array.isArray(res3) && res3.length === 0) || (typeof res3 === 'object' && Object.keys(res3).length === 0)) {
        throw new Error('No se encontraron datos del informe de Supervisor');
    }
    this.datosInfSup = res3; 

    const res4 = await this.modificacionesAprobadas(this.datosEnvio[0].id_obra);
    // if (!res4 || (Array.isArray(res4) && res4.length === 0) || (typeof res4 === 'object' && Object.keys(res4).length === 0)) {
    //     throw new Error('No se encontraron datos de las modificaciones de la obra');
    //}
    this.datosModAp = res4;

    const res5 = await this.modificacionActual(id_modif_pago);
    if (!res5 || (Array.isArray(res5) && res5.length === 0) || (typeof res5 === 'object' && Object.keys(res5).length === 0)) {
        throw new Error('No se encontraron datos de las modificación');
    }
    this.datosMod = res5;

    const res6 = await this.itemsModificacion(id_modif_pago, 'I');
    // if (!res6 || (Array.isArray(res6) && res6.length === 0) || (typeof res6 === 'object' && Object.keys(res6).length === 0)) {
    //     throw new Error('No se encontraron datos de las modificación');
    // }
    this.datosIncremento = res6;

    const res7 = await this.itemsModificacion(id_modif_pago, 'D');
    // if (!res7 || (Array.isArray(res7) && res7.length === 0) || (typeof res7 === 'object' && Object.keys(res7).length === 0)) {
    //     throw new Error('No se encontraron datos de las modificación');
    // }
    this.datosDecremento = res7;

    const res8 = await this.itemsModificacion(id_modif_pago, 'A');
    // if (!res8 || (Array.isArray(res8) && res7.length === 0) || (typeof res7 === 'object' && Object.keys(res7).length === 0)) {
    //     throw new Error('No se encontraron datos de las modificación');
    // }
    this.datosAdicion = res8;

    const res9 = await this.itemsNuevos(id_modif_pago);
    // if (!res8 || (Array.isArray(res8) && res7.length === 0) || (typeof res7 === 'object' && Object.keys(res7).length === 0)) {
    //     throw new Error('No se encontraron datos de las modificación');
    // }
    this.datosINuevos = res9;

    const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
    const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
    const imgPath = 'assets/images/membretado_oficio.png';
    const marcaAgua = this.datosEnvio[0].fecha_aprobacion;

    const formatoNumerico2 = new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
    });
 
   console.log('DATOS MODIFICACION',this.datosIncremento);
   
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
        text: this.datosEnvio[0].cod_carpeta + '-' + this.datosInfSup[0].cite_informe + '-' + '1',
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
                { text: [
                    { text: this.datosEnvio[0].desc_subtipo + ' N°' + this.datosEnvio[0].numero_modificacion + '\n', style: 'textTitulo', margin: [0, 5, 0, 5] },
                    { text: this.datosInfSup[0].referencia, style: 'textDato', margin: [0, 5, 0, 5] }
                        ]
                },
              ],
              [
                { text: 'FECHA:', style: 'textTitulo', margin: [0, 5, 0, 5], alignment:'right' },
                { text: this.fechaString(this.datosEnvio[0].fecha_supervisor), style: 'textDato', margin: [0, 5, 0, 5] },
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
              { text: [{ text: 'OBRA:', style: 'textTitulo', alignment: 'right' },] },
              { text: [{ text: this.datosEnvio[0].desc_carpeta, style: 'textDato' }] }
            ],
            [
              { text: [{ text: 'ZONA:', style: 'textTitulo', alignment: 'right' },], fillColor: '#dddddd' },
              { text: [{ text: this.datosEnvio[0].desc_zona_carpeta, style: 'textDato' }], fillColor: '#dddddd' }
            ],
            [
              { text: [{ text: 'EMPRESA CONTRATISTA:', style: 'textTitulo', alignment: 'right' },] },
              { text: [{ text: this.datosEnvio[0].proponente_razon_social, style: 'textDato' }] }
            ],
            [
              { text: [{ text: 'MONTO CONTRATO INICIAL:', style: 'textTitulo', alignment: 'right' },], fillColor: '#dddddd' },
              { text: [{ text: 'Bs' + this.formatIfNumber(this.datosEnvio[0].monto_contrato,formatoNumerico2), style: 'textDato' }], fillColor: '#dddddd' }
            ],
            [
              { text: [{ text: 'PLAZO DE EJECUCIÓN,CONTRATO INICIAL:', style: 'textTitulo', alignment: 'right' },] },
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
          ]
        }, margin: [10, 0, 0, 5] 
        //layout: 'noBorders'
      },
      {
        text: '\n2.   ANTECEDENTES',
        style: 'subheader', margin: [0, 0, 0, 5] 
      },
      // ...(
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
        },
      // ]
      //   :[]
      // ),
      {
        text: '\n'
      },
      {
          text: this.datosInfSup[0].antecedentes,
          style: 'textDato', alignment:'justify', margin: [10, 0, 0, 5] 
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
        style: 'textDato', alignment:'justify', margin: [10, 0, 0, 5] 
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
          widths: [18, '*', 28, 45, 45, 45, 45, 45], // 8 columnas
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
              { text: 'CANTIDAD PROPUESTO', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
              { text: 'MONTO PROPUESTO', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' }
            ],
            ...this.buildItemsIncremento(this.datosIncremento)
          ]
        }, margin: [10, 0, 0, 5] 
        
      },
      {
        text: '\n'
      },
      {
        text: '4.1.1. JUSTIFICACIÓN POR ÍTEMS CON CANTIDADES EN INCREMENTO\n',
        style: 'subheader', margin: [10, 0, 0, 5]
      },
      {
       ul: Array.isArray(this.datosIncremento)
        ? this.datosIncremento
            .filter(f => f && f.justificacion_supervisor)
            .map(f => ({
              text: [
                    { text: 'Item ' + f.orden_sim + ' - ' + f.desc_item + '.- ', bold: true },
                    { text: f.justificacion_supervisor }
            ]
          }))
        : [],
        style: 'textDato', alignment:'justify', margin: [20, 0, 0, 5]
      },
      {
        text: '4.2. ÍTEMS CON CANTIDADES EN DECREMENTO\n',
        style: 'subheader', margin: [10, 0, 0, 5]
      },
      {
        table: {
          widths: [18, '*', 28, 45, 45, 45, 45, 45], // 8 columnas
          body: [
            [
              {
                colSpan: 6,
                text: ' ', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd'
              }, {}, {}, {}, {}, {}, // 5 celdas vacías para completar el colSpan de 6
              {
                colSpan: 2,
                text: 'DECREMENTO',
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
            ],
            ...this.buildItemsDecremento(this.datosDecremento)
          ]
        }, margin: [10, 0, 0, 5] 
        
      },
      {
        text: '4.2.1. JUSTIFICACIÓN POR ÍTEMS CON CANTIDADES EN DECREMENTO\n',
        style: 'subheader', margin: [10, 0, 0, 5]
      },
      {
       ul: Array.isArray(this.datosDecremento)
        ? this.datosDecremento
            .filter(f => f && f.justificacion_supervisor)
            .map(f => ({
              text: [
                    { text: 'Item ' + f.orden_sim + ' - ' + f.desc_item + '.- ', bold: true },
                    { text: f.justificacion_supervisor }
            ]
          }))
        : [],
        style: 'textDato', alignment:'justify', margin: [20, 0, 0, 5]
      },
      // OCULTAR DATOS DE ITEMS ADICIONALES === 1
      ...(
      this.datosEnvio[0].id_tipo_mod_pago === 1
      ?[
      {
        text: '4.3. ÍTEMS A ADICIONAR\n',
        style: 'subheader', margin: [10, 0, 0, 5]
      },
      {
        table: {
          widths: [18, '*', 28, 45, 45, 45, 45, 45],
          body: [
            [
              {
                colSpan: 6,
                text: ' ', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd'
              }, {}, {}, {}, {}, {}, // 5 celdas vacías, colSpan de 6
              {
                colSpan: 2,
                text: 'ITEMS A ADICIONAR',
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
            ],
            //...this.buildItemsAdicion(this.datosAdicion)
          ]
        }, margin: [10, 0, 0, 5] 
        
      },
      {
        text: '4.3.1. JUSTIFICACIÓN DE ÍTEMS NUEVOS\n',
        style: 'subheader', margin: [10, 0, 0, 5]
      },
      {
       ul: Array.isArray(this.datosAdicion)
        ? this.datosAdicion
            .filter(f => f && f.justificacion_supervisor)
            .map(f => ({
              text: [
                    { text: 'Item ' + f.orden_sim + ' - ' + f.desc_item + '.- ', bold: true },
                    { text: f.justificacion_supervisor }
            ]
          }))
        : [],
        style: 'textDato', alignment:'justify', margin: [20, 0, 0, 5]
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
            ...this.buildItemsNuevos(this.datosINuevos)
          ]
        }, margin: [10, 0, 0, 5] 
      },
      {
        text: '\n\n'
      },
      ]
      :[]
      ),
      
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
        style: 'textDato', alignment:'justify', margin: [10, 0, 0, 5]
      },
      {
        text: '7.   MODIFICACIÓN AL MONTO CONTRACTUAL\n',
        style: 'subheader', margin: [0, 0, 0, 5]
      },
      {
        text: 'El presente ' + this.datosEnvio[0].desc_subtipo + ' N°' + this.datosEnvio[0].numero_modificacion + ' modifica' + ' el monto vigente de Bs.' +
        this.formatIfNumber(this.datosEnvio[0].monto_contrato,formatoNumerico2) + ', en ' + this.datosEnvio[0].monto_variacion + ' (' + this.convertToWords(this.datosEnvio[0].monto_variacion, 'Bs.') + ')' + ' equivalente a ' + this.datosEnvio[0].porcentaje_modificacion + '% referente a la última modificación aprobada.\n',
        style: 'textDato', alignment:'justify', margin: [10, 0, 0, 5]
      },
      {
        text: 'Por lo que el monto autorizado será de Bs.' + this.datosEnvio[0].monto_total + ' (' + this.convertToWords(this.datosEnvio[0].monto_total, 'Bs.') + ')'  + ' totalizando un valor porcentual de modificaciones a la fecha, ' + 
        'respecto al contrato principal, de ' + this.datosEnvio[0].porcentaje_total + '%.', 
        style: 'textDato', alignment:'justify', margin: [10, 0, 0, 5]
      },
      {
        text: '8.   CONCLUSIÓN\n',
        style: 'subheader', margin: [0, 0, 0, 5]
      },
      {
        text: 'Habiendo descrito los antecedentes, justificaciones y otros inherentes a la pertinencia del presente ' + this.datosEnvio[0].desc_subtipo + ' y contando con la conformidad ' + 
        'del contratista ' + this.datosEnvio[0].proponente_razon_social + ' es que cómo Supervisor(es) de Obra, se recomienda la aprobación del presente ' + this.datosEnvio[0].desc_subtipo + 
        ' N°' + this.datosEnvio[0].numero_modificacion + ', por ' + this.datosInfSup[0].referencia + ', de acuerdo al siguiente detalle:\n',
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
             ...this.buildModActual(this.datosMod)
          ]
        }, margin: [10, 0, 0, 5] 
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
        text: ['\n\n\ncc:Archivo Supervisor Carpeta' ],
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

//-------------- FUNCIONES ------------------------------------
 //funcion para generar la fecha en formato dd/mm/aaa
  formatearFecha(iso: string | null | undefined): string | undefined {
  if (!iso) return undefined; // No hace nada si iso es null, undefined o ''
  
  const fecha = new Date(iso);
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Enero = 0
  const anio = fecha.getFullYear();
  
  return `${dia}/${mes}/${anio}`;
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
                alignment: 'center', margin: [0, 35, 0, 0]},
          { text: '(Firma y Sello)', style: 'textDato', alignment: 'center', margin: [0, 45, 0, 0] }
        ];
        arrayData.push(rowData);
      }
      return arrayData;
    }

  // Función para poblar la tabla de MODIFICACIONES APROBADAS
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

  // Función para poblar la tabla de modificación Actual
    buildModActual(data: any) {
    const formatoNumerico5 = new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 5,
    maximumFractionDigits: 5
    });

    let datosResp = data;
    let arrayData = [];

    for (let i = 0; i < datosResp.length; i++) {
      let rowData = [
        { text: [{ text: datosResp[i].tipo_mod, style: 'textDatoT' }] },
        { text: [{ text: this.formatIfNumber(datosResp[i].monto_variacion,formatoNumerico5), alignment: 'right', style: 'textDatoT' }] },
        { text: [{ text: this.formatIfNumber(datosResp[i].monto_total,formatoNumerico5), style: 'textDatoT', alignment: 'right' }] },
        { text: [{ text: datosResp[i].dias_variacion, style: 'textDatoT', alignment: 'center' }] },
        { text: [{ text: datosResp[i].nuevo_plazo, style: 'textDatoT', alignment: 'center', }] },
        { text: [{ text: this.formatearFecha(datosResp[i].nueva_conclusion), style: 'textDatoT', alignment: 'center' }] },
      ];
      arrayData.push(rowData);

    }
    return arrayData;
  }

  // Función para poblar la tabla de modificación Actual
  //   buildItemsIncremento(data: any) {
  //   let datosResp = data;
  //   let arrayData = [];

  //   for (let i = 0; i < datosResp.length; i++) {
  //     let rowData = [
  //       { text: [{ text: datosResp[i].orden_sim, style: 'textDatoT' }] },
  //       { text: [{ text: datosResp[i].desc_item, alignment: 'right', style: 'textDatoT' }] },
  //       { text: [{ text: datosResp[i].unidad_medida_sim, style: 'textDatoT', alignment: 'right' }] },
  //       { text: [{ text: datosResp[i].p_unitario_adjudicado, style: 'textDatoT', alignment: 'center' }] },
  //       { text: [{ text: datosResp[i].cantidad_autorizada, style: 'textDatoT', alignment: 'center', }] },
  //       { text: [{ text: datosResp[i].total_adjudicado, style: 'textDatoT', alignment: 'center' }] },
  //       { text: [{ text: datosResp[i].cantidad_reordenamiento, style: 'textDatoT', alignment: 'center' }] },
  //       { text: [{ text: datosResp[i].total_reordenamiento, style: 'textDatoT', alignment: 'center' }] },
  //     ];
  //     arrayData.push(rowData);

  //   }
  //   return arrayData;
  // }

// Función para cargar las tablas de modificaciones INCREMENTO
  buildItemsIncremento(data: any) {
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
  let totalReordenamientoSum = 0;
  let porc_modif = 0;

  for (let i = 0; i < datosResp.length; i++) {
    // Convertir a número por si viene como string
    const totalReordenamiento = Number(datosResp[i].total_incremento) || 0;
    totalReordenamientoSum += totalReordenamiento;

    let rowData = [
      { text: [{ text: datosResp[i].orden_sim, style: 'textDatoT', alignment: 'center' }] },
      { text: [{ text: datosResp[i].desc_item, alignment: 'left', style: 'textDatoT' }] },
      { text: [{ text: datosResp[i].unidad_medida_sim, style: 'textDatoT', alignment: 'center' }] },
      { text: [{ text: datosResp[i].p_unitario_adjudicado, style: 'textDatoT', alignment: 'center' }] },
      { text: [{ text: datosResp[i].cantidad_autorizada, style: 'textDatoT', alignment: 'right' }] },
      { text: [{ text: datosResp[i].total_adjudicado, style: 'textDatoT', alignment: 'right' }] },
      { text: [{ text: datosResp[i].cant_incremento, style: 'textDatoT', alignment: 'right' }] },
      { text: [{ text: datosResp[i].total_incremento, style: 'textDatoT', alignment: 'right' }] },
    ];
    arrayData.push(rowData);
  }

  // Fila final con total
  const totalRow = [
    {
      colSpan: 7,
      text: 'TOTAL:',
      style: 'textTituloT', alignment: 'right', border: [false, true, false, true],
    },
    {}, {}, {}, {}, {}, {}, // estos serán ignorados por el colSpan
    {
      text: this.formatIfNumber(totalReordenamientoSum, formatoNumerico2),
      style: 'textTituloT', alignment: 'right', border: [false, true, false, true],
    },
  ];

  // Porcentaje adicional 
  //const montoContrato = Number(this.datosEnvio[0].monto_contrato);
  const montoContrato = Number(this.datosEnvio[0].monto_contrato);

    if (!isNaN(montoContrato) && montoContrato !== 0) {
      porc_modif = (totalReordenamientoSum * 100) / montoContrato;
      
    } 

  const porcentajeRow = [
    {
      colSpan: 7,
      text: 'PORCENTAJE:',
      style: 'textTituloT',
      alignment: 'right',
      border: [false, true, false, true],
    },
    {}, {}, {}, {}, {}, {}, // omitidos por colSpan
    {
      text: `${porc_modif.toFixed(2)}%`,
      style: 'textTituloT',
      alignment: 'right',
      border: [false, true, false, true],
    },
  ];

  arrayData.push(totalRow);
  arrayData.push(porcentajeRow);

  return arrayData;
}

// Función para cargar las tablas de modificaciones DECREMENTO
  buildItemsDecremento(data: any) {
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
  let totalReordenamientoSum = 0;
  let porc_modif = 0;

  for (let i = 0; i < datosResp.length; i++) {
    // Convertir a número por si viene como string
    const totalReordenamiento = Number(datosResp[i].total_decremento) || 0;
    totalReordenamientoSum += totalReordenamiento;

    let rowData = [
      { text: [{ text: datosResp[i].orden_sim, style: 'textDatoT', alignment: 'center' }] },
      { text: [{ text: datosResp[i].desc_item, alignment: 'left', style: 'textDatoT' }] },
      { text: [{ text: datosResp[i].unidad_medida_sim, style: 'textDatoT', alignment: 'center' }] },
      { text: [{ text: datosResp[i].p_unitario_adjudicado, style: 'textDatoT', alignment: 'center' }] },
      { text: [{ text: datosResp[i].cantidad_autorizada, style: 'textDatoT', alignment: 'right' }] },
      { text: [{ text: datosResp[i].total_adjudicado, style: 'textDatoT', alignment: 'right' }] },
      { text: [{ text: datosResp[i].cant_decremento, style: 'textDatoT', alignment: 'right' }] },
      { text: [{ text: datosResp[i].total_decremento, style: 'textDatoT', alignment: 'right' }] },
    ];
    arrayData.push(rowData);
  }

  // Fila final con total
  const totalRow = [
    {
      colSpan: 7,
      text: 'TOTAL:',
      style: 'textTituloT', alignment: 'right', border: [false, true, false, true],
    },
    {}, {}, {}, {}, {}, {}, // estos serán ignorados por el colSpan
    {
      text: this.formatIfNumber(totalReordenamientoSum, formatoNumerico2),
      style: 'textTituloT', alignment: 'right', border: [false, true, false, true],
    },
  ];

  // Porcentaje adicional 
  //const montoContrato = Number(this.datosEnvio[0].monto_contrato);
  const montoContrato = Number(this.datosEnvio[0].monto_contrato);

    if (!isNaN(montoContrato) && montoContrato !== 0) {
      porc_modif = (totalReordenamientoSum * 100) / montoContrato;
      
    } 

  const porcentajeRow = [
    {
      colSpan: 7,
      text: 'PORCENTAJE:',
      style: 'textTituloT',
      alignment: 'right',
      border: [false, true, false, true],
    },
    {}, {}, {}, {}, {}, {}, // omitidos por colSpan
    {
      text: `${porc_modif.toFixed(2)}%`,
      style: 'textTituloT',
      alignment: 'right',
      border: [false, true, false, true],
    },
  ];

  arrayData.push(totalRow);
  arrayData.push(porcentajeRow);

  return arrayData;
}

// Función para poblar la tabla de Items Nuevos
    buildItemsNuevos(data: any) {
    let datosResp = data;
    let arrayData = [];

    for (let i = 0; i < datosResp.length; i++) {
      let rowData = [
        { text: [{ text: datosResp[i].orden_sim, style: 'textDatoT', alignment: 'center' }] },
        { text: [{ text: datosResp[i].desc_item, style: 'textDatoT' }] },
        { text: [{ text: datosResp[i].unidad_medida_sim, style: 'textDatoT', alignment: 'center' }] },
        { text: [{ text: datosResp[i].p_unitario_adjudicado, style: 'textDatoT', alignment: 'right' }] },
        { text: [{ text: datosResp[i].p_unitario_sim, style: 'textDatoT', alignment: 'right', }] },
        { text: [{ text: datosResp[i].p_unitario_adjudicado, style: 'textDatoT', alignment: 'right' }] },
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

  return `${integerWords} CON ${decimalWords} ${currencyWords}`;
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

// FORMATO DE NUMEROS
private formatIfNumber(value: any, formatter: Intl.NumberFormat): string {
  if (value === null || value === undefined || value === '') return '';
  
  const num = Number(value);
  if (isNaN(num)) return '';

  return formatter.format(num);
}
  

}