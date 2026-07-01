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
import { ReportService } from 'src/schema_public/reporte/reporte.service';

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
    datosInfSup: any = [];
    datosModAp: any = [];
    datosMod: any = [];
    datosIncremento: any = [];
    datosDecremento: any = [];
    datosAdicion: any = [];
    datosINuevos: any = [];
    datosMA: any = [];
    datosAdj: any = [];

    //let solicitud: Number;

    constructor(
      private readonly responseService: ResponseService,
      @Inject(Sequelize) private sequelize: Sequelize, // Inyecta Sequelize correctamente
      private readonly reportService: ReportService,
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

    // Resumen de Modificaciones Aprobadas por obra 
   async modificacionesAprobadas(obra: number, id_solicitud: number) {
    const query3 = `
        SELECT * 
        FROM public."vista_reporte_modif_aprobadas" WHERE id_obra = ${obra} AND id_solicitud <= ${id_solicitud}`;
    const resultado3 = await this.sequelize.query(query3);
    return resultado3[0];
   }

    // Resumen de Modificacion Actual 
   async modificacionActual(solicitud: number) {
    const query31 = `
        SELECT * 
        FROM public."vista_reporte_modif_aprobadas" WHERE id_modificacion_pago = ${solicitud}`;
    const resultado31 = await this.sequelize.query(query31);
    return resultado31[0];
   }

 // Tabla ITEM - INCREMENTO - DECREMENTO - ADICION
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

      // Datos ultima Modificación Aprobada
   async datosUltimaMod(obra: number, id_modif_pago: number) {
      const query6 = `
          SELECT * 
          FROM public."f_reporte_ultima_modif_InfModif"(${obra},${id_modif_pago})`;
      const resultado6 = await this.sequelize.query(query6);
      return resultado6[0];
   }

      // Datos lista Adjuntos - Inf. Modificacion
    async AdjuntosModificacion(obra: number) {
      const query7 = `
          SELECT * 
          FROM public."vista_reporte_adjuntos_InfModificacion" WHERE id_obra = ${obra}`;
      const resultado7 = await this.sequelize.query(query7);
      return resultado7[0];
    }

    //margenes para  el membretado por fecha del 13 de mayo 
    /*private obtenerMargenesporfecha(
      fecha: string | Date,
    ): [number, number, number, number] {

      const fechaDocumento = new Date(fecha);

      //margen para la  fecha desde 13 de mayo de 2026
      if (fechaDocumento >= new Date('2026-05-13')) {
        return [70, 145, 50, 70];
      }

      //segundo margen 
      if (fechaDocumento >= new Date('2026-01-01')) {
        return [70, 130, 50, 140];
      }

      //antiguo margen del logo de  200
      return [70, 170, 50, 140];
    }*/

// REPORTE - INFORME MODIFICACION SUPERVISOR

async generateInformeModificacionSupervisor(id_modif_pago: number): Promise<Buffer> {

    const datosGenerales = await this.datosGeneralesObraModif(id_modif_pago);
    if ((!datosGenerales || (Array.isArray(datosGenerales) && datosGenerales.length === 0) || (typeof datosGenerales === 'object' && Object.keys(datosGenerales).length === 0))){
      throw new Error('No se encontraron datos para el ID de la obra proporcionada');
    }
    this.datosEnvio = datosGenerales;

    const res3 = await this.datosInformeModifSupervisor(this.datosEnvio[0].id_solicitud);
    if (!res3 || (Array.isArray(res3) && res3.length === 0) || (typeof res3 === 'object' && Object.keys(res3).length === 0)) {
        throw new Error('No se encontraron datos del informe de Supervisor');
    }
    this.datosInfSup = res3; 

    const res4 = await this.modificacionesAprobadas(this.datosEnvio[0].id_obra, this.datosEnvio[0].id_solicitud);
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
    this.datosIncremento = res6;

    const res7 = await this.itemsModificacion(id_modif_pago, 'D');
    this.datosDecremento = res7;

    const res8 = await this.itemsModificacion(id_modif_pago, 'N');
    this.datosAdicion = res8;

    const res9 = await this.itemsNuevos(id_modif_pago);
    this.datosINuevos = res9;

    const res10 = await this.datosUltimaMod(this.datosEnvio[0].id_obra, id_modif_pago);
    this.datosMA = res10;

    const res11 = await this.AdjuntosModificacion(this.datosEnvio[0].id_obra);
    this.datosAdj = res11;

    const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
    const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
    //const imgPath = 'assets/images/membretado_oficio.png';
    //membrete por gestion
    //const codigoCarpeta = this.datosEnvio[0].cod_carpeta;
    //const imgPath = this.reportService.obtenerMembretePorGestion(codigoCarpeta);

    //membrete por fecha de 13 de  mayo de  2026
    const fechaDocumento = this.datosEnvio[0].fecha_supervisor;
    const imgPath =this.reportService.obtenerMembretePorFechaOficio(fechaDocumento);
    //const marcaAgua = this.datosEnvio[0].fecha_aprobacion;
    const marcaAgua = this.datosEnvio[0].fecha_supervisor;

    //margenes por gestion
    /*let gestionObra = parseInt(codigoCarpeta.split('-').pop());
    let margenesDinamicos;
    if (gestionObra >= 2026) {
      margenesDinamicos = [70, 130, 50, 140]; 
    } else {
      margenesDinamicos = [70, 170, 50, 140]; 
    }*/

    //margenes  por  fecha del 13 de mayo de  2026 GENERAL
    const margenesDinamicos =this.reportService.obtenerMargenesporfechaoficio(fechaDocumento);

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


    const formatoNumerico2 = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
    });

    //fecha  corte para agregar las  dos fechas FECHA ELABORACIOM: FECHA APROBACION
    const fechaCorte = new Date('2026-05-15');

    // si no existe fecha_aprobacion usar today
    const fechaComparacion = this.datosEnvio[0].fecha_aprobacion
      ? new Date(this.datosEnvio[0].fecha_aprobacion)
      : new Date();

    /*const esNuevoFormato = fechaComparacion >= fechaCorte;
    const fechaSupervisor = this.fechaString(this.datosEnvio[0].fecha_supervisor);*/

    //console.log('DATOS MODIFICACION',this.datosEnvio);

    // Fecha de corte para el cambio de texto "nuevo monto autorizado"
    const fechaCorteMonto = new Date('2026-06-23');

    const fechaComparacionMonto = this.datosEnvio[0].fecha_supervisor
      ? new Date(this.datosEnvio[0].fecha_supervisor)
      : new Date();

    const usarNuevoTextoMonto = fechaComparacionMonto >= fechaCorteMonto;

    /*consola para ver de que  tipo es monto_variacion y del porque no me estaba funcionando
    console.log('fechaSupervisor:', this.datosEnvio[0].fecha_supervisor);
    console.log('usarNuevoTextoMonto:', usarNuevoTextoMonto);
    console.log('monto_variacion:', this.datosEnvio[0].monto_variacion);
    console.log('Number:', Number(this.datosEnvio[0].monto_variacion));
    console.log('typeof:', typeof this.datosEnvio[0].monto_variacion);
    console.log(this.datosEnvio[0].monto_variacion);*/
    
    //ajuste para  monto variacion en el texto parte 6.
    const montoVariacion = parseFloat(String(this.datosEnvio[0].monto_variacion).replace(',', '.'));
    //const montoVariacion = Number(this.datosEnvio[0].monto_variacion);

    const verboMonto = usarNuevoTextoMonto ? (montoVariacion === 0 ? 'mantiene' : 'modifica') : 'modifica';
    //console.log('verboMonto:', verboMonto);
      
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
        text: 'INFORME DE ' + this.datosEnvio[0].desc_subtipo,
        style: 'header', alignment: 'center'
      } as any,
      {
        text: this.datosEnvio[0].cod_carpeta + '-' + this.datosInfSup[0].cite_informe + '-' + this.datosInfSup[0].correlativo,
        style: 'subheader', alignment: 'center'
      },
      {
        text: '\n',
      },
      {
        table: {
          widths: ['20%', '80%'],
          body: [
            [
              { text: 'A:', style: 'textTitulo', margin: [0, 5, 0, 5], alignment:'right' },
              { 
                text: [
                    { text: this.datosInfSup[0].a_nombre + '\n', style: 'textDato', alignment: 'left' },
                    { text: this.datosInfSup[0].a_cargo, style: 'textTitulo', alignment: 'left'}
                  ]
              },
            ],
            [
              { text: 'DE:', style: 'textTitulo', margin: [0, 6, 0, 0], alignment: 'right' },
              { text: [
                    { text: this.datosInfSup[0].de_nombre + '\n', style: 'textDato', alignment: 'left' },
                    { text: this.datosInfSup[0].de_cargo, style: 'textTitulo', alignment: 'left' },
                  ]
              },       
            ],
            [
              { text: 'REF.:', style: 'textTitulo', margin: [0, 5, 0, 5], alignment:'right' },
              { text: [
                  { text: this.datosEnvio[0].desc_subtipo + ' Nro.' + this.datosEnvio[0].numero_modificacion + '\n', style: 'textTitulo', margin: [0, 5, 0, 5] },
                  { text: this.datosInfSup[0].referencia, style: 'textDato', margin: [0, 5, 0, 5] }
                      ]
              },
            ],

            //fecha supervisor
            [
              { text: 'FECHA:', style: 'textTitulo', alignment:'right' },
              { text: this.fechaString(this.datosEnvio[0].fecha_supervisor), style: 'textDato' },
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
        margin: [0, 0, 0, 10], // Márgenes de la tabla
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
              { text: 'CÓDIGO:', style: 'textTitulo', alignment: 'right', fillColor: '#dddddd' },
              { text: this.datosEnvio[0].cod_carpeta, style: 'textDato', bold:true, fillColor: '#dddddd' }
            ],
            [
              { text: 'OBRA:', style: 'textTitulo', alignment: 'right' },
              { text: this.datosEnvio[0].desc_carpeta, style: 'textDato' }
            ],
            [
              { text: 'ZONA:', style: 'textTitulo', alignment: 'right', fillColor: '#dddddd' },
              { text: this.datosEnvio[0].desc_zona_carpeta, style: 'textDato', fillColor: '#dddddd' }
            ],
            [
              { text: 'EMPRESA CONTRATISTA:', style: 'textTitulo', alignment: 'right' },
              { text: this.datosEnvio[0].proponente_razon_social, style: 'textDato' }
            ],
            [
              { text: 'MONTO CONTRATO INICIAL:', style: 'textTitulo', alignment: 'right', fillColor: '#dddddd' },
              { text: 'Bs' + this.formatIfNumber(this.datosEnvio[0].monto_contrato,formatoNumerico2), style: 'textDato', fillColor: '#dddddd' }
            ],
            [
              { text: 'PLAZO DE EJECUCIÓN, CONTRATO INICIAL:', style: 'textTitulo', alignment: 'right' },
              { text: this.datosEnvio[0].plazo_contrato + ' d.c.', style: 'textDato', margin: [0,5,0,0] }
            ],
            [
              { text: 'FECHA INICIO DE OBRA:', style: 'textTitulo', alignment: 'right', fillColor: '#dddddd' },
              { text: this.formatearFecha(this.datosEnvio[0].fecha_inicio_ejecucion), style: 'textDato', fillColor: '#dddddd' }
            ],
            [
              { text: 'FECHA CONCLUSIÓN PROGRAMADA:', style: 'textTitulo', alignment: 'right' },
              { text: this.formatearFecha(this.datosEnvio[0].fecha_recep_provisional), style: 'textDato' }
            ],
          ]
        }, margin: [10, 0, 0, 7] 
        //layout: 'noBorders'
      },
      {
        text: 'MODIFICACIONES',
        style: 'textTitulo', margin: [10, 0, 0, 5] 
      },
      {
          table: {
            widths: ['6%','32%','16%','16%','16%','16%','16%'], 
            body: [
              [
                { text: 'Nro.', style: 'textTituloT', alignment: 'center', margin:[0,5,0,0], fillColor: '#dddddd' },
                { text: 'TIPO MODIFICACIÓN', style: 'textTituloT', alignment: 'center', margin:[0,5,0,0], fillColor: '#dddddd' },
                { text: 'MODIFICACIÓN DEL MONTO(Bs)', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
                { text: 'MONTO PROPUESTO (Bs)', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
                { text: 'MODIFICACIÓN PLAZO (d.c.)', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
                { text: 'NUEVA FECHA CONCLUSIÓN', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
              ],
              ...this.buildModAprobadas(this.datosModAp, formatoNumerico)
            ]
          }, margin: [10, 0, 0, 7], 
      },
      {
        text: '\n2.   ANTECEDENTES',
        style: 'textTitulo', margin: [0, 0, 0, 5] 
      },
      // ...(
      // this.buildModAprobadas(this.datosModAp).length > 0 
      // ?[
        {
          
        },
      // ]
      //   :[]
      // ),
      
      {
          text: this.datosInfSup[0].antecedentes,
          style: 'textDato', alignment:'justify', margin: [10, 0, 0, 7] 
      }, 
      {
        text: '3.   JUSTIFICACION TÉCNICA GENERAL\n',
        style: 'textTitulo', margin: [0, 0, 0, 5]
      },
      {
        text: this.datosInfSup[0].analisis,
        style: 'textDato', alignment:'justify', margin: [10, 0, 0, 5] 
      },
      {
        text: '4.   REORDENAMIENTO DE CANTIDADES\n',
        style: 'textTitulo', margin: [0, 0, 0, 5]
      },
      {
        text: '4.1. ÍTEMS CON CANTIDADES EN INCREMENTO\n',
        style: 'textTitulo', margin: [10, 0, 0, 5]
      },
      {
        table: {
          headerRows: 2, //REPITAN LAS CABECERAS 
          widths: [18, '*', 28, 45, 45, 45, 45, 55], // 8 columnas
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
              { text: 'ITEM', style: 'textTituloT', alignment: 'center', margin: [0, 5, 0, 0], fillColor: '#dddddd' },
              { text: 'DESCRIPCIÓN', style: 'textTituloT', alignment: 'center', margin: [0, 5, 0, 0], fillColor: '#dddddd' },
              { text: 'UNIDAD', style: 'textTituloT', alignment: 'center', margin: [0, 5, 0, 0], fillColor: '#dddddd' },
              { text: 'PRECIO UNITARIO', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
              { text: 'CANTIDAD VIGENTE', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
              { text: 'MONTO VIGENTE(Bs)', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
              { text: 'CANTIDAD PROPUESTA', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
              { text: 'MONTO PROPUESTO(Bs)', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' }
            ],
            ...this.buildItemsIncremento(this.datosIncremento, formatoNumerico)
          ]
        }, margin: [10, 0, 0, 5] 
        
      },
      {
        text: '(*)En caso de existir una diferencia de los montos totales del informe con respecto al monto total de la planilla de ' + 
              'reordenamiento, prevalece el monto total de la suma vertical de dicha planilla.', 
        style: 'footerText', margin: [10, 0, 0, 5], alignment:'justify', opacity: 0.8
      },
      {
        text: '4.1.1. JUSTIFICACIÓN DE ÍTEMS CON CANTIDADES EN INCREMENTO\n',
        style: 'textTitulo', margin: [10, 0, 0, 5]
      },
      {
       ul: Array.isArray(this.datosIncremento)
        ? this.datosIncremento
            .filter(f => f && f.justificacion_supervisor)
            .map(f => ({
              text: [
                    { text: 'Item ' + f.orden_sim + ' - ' + f.desc_item + '.- ', style: 'textDato2' },
                    { text: f.justificacion_supervisor, style: 'textDato', }
            ]
          }))
        : [],
        alignment:'justify', margin: [20, 0, 0, 5]
      },
      {
        text: '4.2. ÍTEMS CON CANTIDADES EN DECREMENTO\n',
        style: 'textTitulo', margin: [10, 0, 0, 5]
      },
      {
        table: {
          headerRows: 2, //REPITAN LAS CABECERAS 
          widths: [18, '*', 28, 45, 45, 45, 45, 55], // 8 columnas
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
              { text: 'ÍTEM', style: 'textTituloT', alignment: 'center', margin: [0, 5, 0, 0], fillColor: '#dddddd' },
              { text: 'DESCRIPCIÓN', style: 'textTituloT', alignment: 'center', margin: [0, 5, 0, 0], fillColor: '#dddddd' },
              { text: 'UNIDAD', style: 'textTituloT', alignment: 'center', margin: [0, 5, 0, 0], fillColor: '#dddddd' },
              { text: 'PRECIO UNITARIO(Bs)', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
              { text: 'CANTIDAD VIGENTE', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
              { text: 'MONTO VIGENTE(Bs)', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
              { text: 'CANTIDAD PROPUESTA', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
              { text: 'MONTO PROPUESTO(Bs)', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' }
            ],
            ...this.buildItemsDecremento(this.datosDecremento, formatoNumerico)
          ]
        }, margin: [10, 0, 0, 5] 
        
      },
      {
        text: '(*)En caso de existir una diferencia de los montos totales del informe con respecto al monto total de la planilla de ' + 
              'reordenamiento, prevalece el monto total de la suma vertical de dicha planilla.', 
        style: 'footerText', margin: [10, 0, 0, 5], alignment:'justify', opacity: 0.8
      },
      {
        text: '4.2.1. JUSTIFICACIÓN DE ÍTEMS CON CANTIDADES EN DECREMENTO\n',
        style: 'textTitulo', margin: [10, 0, 0, 5]
      },
      {
       ul: Array.isArray(this.datosDecremento)
        ? this.datosDecremento
            .filter(f => f && f.justificacion_supervisor)
            .map(f => ({
              text: [
                    { text: 'Item ' + f.orden_sim + ' - ' + f.desc_item + '.- ', style: 'textDato2' },
                    { text: f.justificacion_supervisor, style: 'textDato', }
            ]
          }))
        : [],
         alignment:'justify', margin: [20, 0, 0, 5]
      },
      // OCULTAR DATOS DE ITEMS ADICIONALES === 1
      ...(
      this.datosEnvio[0].id_tipo_mod_pago === 1
      ?[
      {
        text: '4.3. ÍTEMS A ADICIONAR\n',
        style: 'textTitulo', margin: [10, 0, 0, 5]
      },
      {
        table: {
          headerRows: 2, //REPITAN LAS CABECERAS 
          widths: [18, '*', 28, 45, 45, 45, 45, 55],
          body: [
            [
              {
                colSpan: 6,
                text: ' ', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd'
              }, {}, {}, {}, {}, {}, // 5 celdas vacías, colSpan de 6
              {
                colSpan: 2,
                text: 'ÍTEMS A ADICIONAR',
                style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' }, 
              {} // 1 celda vacía para completar colSpan de 2
            ],
            [
              { text: 'ÍTEM', style: 'textTituloT', alignment: 'center', margin: [0, 5, 0, 0], fillColor: '#dddddd' },
              { text: 'DESCRIPCIÓN', style: 'textTituloT', alignment: 'center', margin: [0, 5, 0, 0], fillColor: '#dddddd' },
              { text: 'UNIDAD', style: 'textTituloT', alignment: 'center', margin: [0, 5, 0, 0], fillColor: '#dddddd' },
              { text: 'PRECIO UNITARIO(Bs)', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
              { text: 'CANTIDAD VIGENTE', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
              { text: 'MONTO VIGENTE(Bs)', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
              { text: 'CANTIDAD PROPUESTA', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
              { text: 'MONTO PROPUESTO(Bs)', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' }
            ],
            ...this.buildItemsAdicion(this.datosAdicion, formatoNumerico)
          ]
        }, margin: [10, 0, 0, 5] 
        
      },
      {
        text: '4.3.1. JUSTIFICACIÓN DE ÍTEMS NUEVOS\n',
        style: 'textTitulo', margin: [10, 0, 0, 5]
      },
      {
       ul: Array.isArray(this.datosAdicion)
        ? this.datosAdicion
            .filter(f => f && f.justificacion_supervisor)
            .map(f => ({
              text: [
                    { text: 'Item ' + f.orden_sim + ' - ' + f.desc_item + '.- ', style: 'textDato2' },
                    { text: f.justificacion_supervisor, style: 'textDato' }
            ]
          }))
        : [],
         alignment:'justify', margin: [20, 0, 0, 5]
      },
      {
        text: '4.3.2. TABLA DE PRECIOS UNITARIOS NUEVOS\n',
        style: 'textTitulo', margin: [10, 0, 0, 5]
      },
      {
        table: {
          widths: [20, '*', 30, 70, 70, 70], // 6 columnas
          body: [
            [
              { text: 'ÍTEM', style: 'textTituloT', alignment: 'center', margin: [0, 5, 0, 0], fillColor: '#dddddd' },
              { text: 'DESCRIPCIÓN', style: 'textTituloT', alignment: 'center', margin: [0, 5, 0, 0], fillColor: '#dddddd' },
              { text: 'UNIDAD', style: 'textTituloT', alignment: 'center', margin: [0, 5, 0, 0], fillColor: '#dddddd' },
              { text: 'PRECIO CONTRATISTA (Bs)', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
              { text: 'PRECIO GMLP (Bs)', style: 'textTituloT', alignment: 'center', margin: [0, 5, 0, 0], fillColor: '#dddddd' },
              { text: 'PRECIO CONSENSUADO (Bs)', style: 'textTituloT', alignment: 'center', fillColor: '#dddddd' },
            ],
            ...this.buildItemsNuevos(this.datosINuevos, formatoNumerico)
          ]
        }, margin: [10, 0, 0, 7] 
      },
      ]
      :[]
      ),
      {
        text: '5.   MODIFICACIÓN AL PLAZO CONTRACTUAL\n',
        style: 'textTitulo', margin: [0, 0, 0, 5]
      },
      {
        text: this.datosInfSup[0].obs_general,
        style: 'textDato', alignment:'justify', margin: [10, 0, 0, 5]
      },
      {
        text: '6.   MODIFICACIÓN AL MONTO CONTRACTUAL\n',
        style: 'textTitulo', margin: [0, 0, 0, 5]
      },
      {
        text: [
          { text: this.datosEnvio[0].id_tipo_mod_pago == 1 
            ? 'El '
            : 'La '},
          { text: 'presente ' + this.datosEnvio[0].desc_subtipo + ' Nro.' + this.datosEnvio[0].numero_modificacion + ' ' + verboMonto +' el monto ' }, 
          { text: this.datosEnvio[0].modificacion_gral == 1 
            ? 'vigente de Bs' + this.formatIfNumber(this.datosEnvio[0].monto_contrato,formatoNumerico2)
            : 'de la última modificación autorizada (' + (this.datosEnvio[0].modificacion_gral - 1) + ') de Bs' + this.formatIfNumber(this.datosMA[0].monto_total,formatoNumerico2)
          }, 
          { text: ', en ' + this.datosEnvio[0].monto_variacion + ' (' + this.convertToWords(this.datosEnvio[0].monto_variacion, 'Bs.') + ').\n' },
        ], style: 'textDato', alignment:'justify', margin: [10, 0, 0, 5]
      },
      /*{
        text: 'Por lo que el nuevo monto autorizado será de Bs.' + this.datosEnvio[0].monto_total + ' (' + this.convertToWords(this.datosEnvio[0].monto_total, 'Bs') + ')'  + ' totalizando un valor porcentual de modificaciones ' + 
        '(incluyendo la presente) de ' + this.datosEnvio[0].porcentaje_total + '% respecto al contrato inicial.', 
        style: 'textDato', alignment:'justify', margin: [10, 0, 0, 5]
      },*/
      {
        text:
          (usarNuevoTextoMonto
            ? 'Por lo que el monto autorizado será de Bs.'
            : 'Por lo que el nuevo monto autorizado será de Bs.') +
          this.datosEnvio[0].monto_total +
          ' (' +
          this.convertToWords(this.datosEnvio[0].monto_total, 'Bs') +
          ')' +
          ' totalizando un valor porcentual de modificaciones ' + '(incluyendo la presente) de ' +
          this.datosEnvio[0].porcentaje_total + '% respecto al contrato inicial.',
        style: 'textDato', alignment: 'justify', margin: [10, 0, 0, 5]
      },

      {
        text: '7.   CONCLUSIÓN\n',
        style: 'textTitulo', margin: [0, 0, 0, 5]
      },
      {
        text: 'Habiendo descrito los antecedentes, justificaciones y otros inherentes a la pertinencia del presente ' + this.datosEnvio[0].desc_subtipo + ' y contando con la conformidad ' + 
        'del contratista ' + this.datosEnvio[0].proponente_razon_social + ' es que cómo Supervisor(es) de Obra, se recomienda la aprobación del presente ' + this.datosEnvio[0].desc_subtipo + 
        ' Nro' + this.datosEnvio[0].numero_modificacion + ', por ' + this.datosInfSup[0].referencia + ', de acuerdo al siguiente detalle:\n',
        style: 'textDato', alignment:'justify', margin: [10, 0, 0, 5]
      },
      {
        table: {
          widths: ['*', 60, 60, 60, 60, 60], // 6 columnas
          body: [
            [
              { text: 'TIPO MODIFICACIÓN', style: 'textTituloT', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
              { text: 'VARIACIÓN DEL MONTO(Bs)', style: 'textTituloT', alignment: 'center', margin: [0, 5, 0, 0], fillColor: '#dddddd' },
              { text: 'MONTO(Bs)', style: 'textTituloT', alignment: 'center', margin: [0, 9, 0, 0], fillColor: '#dddddd' },
              { text: 'MODIFICACIÓN DEL PLAZO(d.c.)', style: 'textTituloT', alignment: 'center', margin: [0, 5, 0, 0], fillColor: '#dddddd' },
              { text: 'PLAZO TOTAL(d.c.)', style: 'textTituloT', alignment: 'center', margin: [0, 5, 0, 0], fillColor: '#dddddd' },
              { text: 'NUEVA FECHA CONCLUSIÓN', style: 'textTituloT', alignment: 'center',  margin: [0, 5, 0, 0], fillColor: '#dddddd' },
            ],
             ...this.buildModActual(this.datosMod,formatoNumerico)
          ]
        }, margin: [10, 0, 0, 5] 
      },
      {
        text: '\n'
      },
      {
        //anexo
        text: '8.   ANEXOS\n',
        style: 'textTitulo', margin: [0, 0, 0, 5]
      },
      ...(Array.isArray(this.datosAdj) && this.datosAdj.length > 0
      ? [
          {
            text: this.datosAdj
              .filter(a => a && a.desc_tipo_documento)
              .map(a => '- ' + a.desc_tipo_documento)
              .join('\n') + '\n',
            style: 'textDato', alignment: 'left', margin: [10, 0, 0, 5]
          }
        ]
      : [
          { 
            text: this.datosInfSup[0].anexos + '\n',
            style: 'textDato', margin: [10, 0, 0, 5]
          }
        ]
      ),      
      {
        text: ['\n'],
      }, 
      {
        text: 'Es cuánto se informa para los fines consiguientes.',
        style: 'textDato', alignment:'justify'
      },
      {
        text: ['\n'],
      },
      {
        table: {
          widths: ['50%', '50%'],
          body: (
            this.datosInfSup?.[0]?.de_nombre
              ? this.datosInfSup[0].de_nombre.split('\n')
              : ['']
          ).map((nombre: string) => [
            { text: [
                { text: nombre + '\n', style: 'textDato' },
                { text: 'SUPERVISOR DE OBRA', style: 'textDato', bold: true }
              ], 
              margin: [0, 35, 0, 0], 
              alignment: 'center'
            },
            { text: '(Firma y Sello)', 
              style: 'textDato', alignment: 'center', margin: [0, 45, 0, 0] 
            }
          ])
        },
        margin: [20, 0, 20, 0],
        layout: {
          hLineColor: () => '#444444',
          vLineColor: () => '#444444',
          hLineWidth: () => 0.7,
          vLineWidth: () => 0.7
        }
      },
      {
        text: ['\n\n\nCc.Arch.Supervisor' ],
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
        fontSize: 12,
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
      textDato2: {
        fontSize: 9,
        bold: true,
      },
      textDatoT: {
        fontSize: 7,
        bold: false,
        opacity: 0.8,
      },
    },
    //margenes dinamicos para membrete nuevo 
    pageMargins: margenesDinamicos as any, // Márgenes: izquierda, arriba, derecha, abajo

  };
  //console.log('fecha_aprobacion:', this.datosEnvio[0].fecha_aprobacion);
  //console.log('mostrar marca agua:', !this.datosEnvio[0].fecha_aprobacion);
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

 // Función para poblar la tabla de MODIFICACIONES APROBADAS
    buildModAprobadas(data: any,formatoNumerico: Intl.NumberFormat) {
    const formatoNumerico2 = new Intl.NumberFormat('de-DE', {
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
        { text: [{ text: this.formatIfNumber(datosResp[i].monto_variacion,formatoNumerico2), alignment: 'right', style: 'textDatoT' }] },
        { text: [{ text: this.formatIfNumber(datosResp[i].monto_total,formatoNumerico2), style: 'textDatoT', alignment: 'right' }] },
        { text: [{ text: datosResp[i].dias_variacion, style: 'textDatoT', alignment: 'center' }] },
        { text: [{ text: this.formatearFecha(datosResp[i].nueva_conclusion), style: 'textDatoT', alignment: 'center' }] },
      ];
      arrayData.push(rowData);
    }
    // Fila final con total
      const totalRow = [
        {
          colSpan: 2,
          text: 'TOTAL (Bs):',
          style: 'textTituloT', alignment: 'center',
        },
        {}, 
        { text: this.formatIfNumber(totalvariacion, formatoNumerico2),
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
    buildModActual(data: any, formatoNumerico: Intl.NumberFormat) {
    const formatoNumerico2 = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
    });

    let datosResp = data;
    let arrayData = [];

    for (let i = 0; i < datosResp.length; i++) {
      let rowData = [
        { text: [{ text: datosResp[i].tipo_mod, style: 'textDatoT' }] },
        { text: [{ text: this.formatIfNumber(datosResp[i].monto_variacion,formatoNumerico2), alignment: 'right', style: 'textDatoT' }] },
        { text: [{ text: this.formatIfNumber(datosResp[i].monto_total,formatoNumerico2), style: 'textDatoT', alignment: 'right' }] },
        { text: [{ text: datosResp[i].dias_variacion, style: 'textDatoT', alignment: 'center' }] },
        { text: [{ text: datosResp[i].total_plazo_autorizado, style: 'textDatoT', alignment: 'center', }] },
        { text: [{ text: this.formatearFecha(datosResp[i].nueva_conclusion), style: 'textDatoT', alignment: 'center' }] },
      ];
      arrayData.push(rowData);

    }
    return arrayData;
  }

// Función para cargar las tablas de modificaciones INCREMENTO
  buildItemsIncremento(data: any, formatoNumerico: Intl.NumberFormat) {
    const formatoNumerico2 = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
    });
  
  let datosResp = data;
  let arrayData = [];
  //YOlet totalReordenamientoSum = 0;
  //YOlet porc_modif = 0;

  for (let i = 0; i < datosResp.length; i++) {
    // Convertir a número por si viene como string
    //YOconst totalReordenamiento = Number(datosResp[i].total_incremento) || 0;
    //YOtotalReordenamientoSum += totalReordenamiento;

    let rowData = [
      { text: [{ text: datosResp[i].orden_sim, style: 'textDatoT', alignment: 'center' }] },
      { text: [{ text: datosResp[i].desc_item, alignment: 'left', style: 'textDatoT' }] },
      { text: [{ text: datosResp[i].unidad_medida_sim, style: 'textDatoT', alignment: 'center' }] },
      { text: [{ text: this.formatIfNumber(datosResp[i].p_unitario_adjudicado, formatoNumerico), style: 'textDatoT', alignment: 'right' }] },
      { text: [{ text: this.formatIfNumber(datosResp[i].cantidad_sim, formatoNumerico), style: 'textDatoT', alignment: 'right' }] },
      { text: [{ text: this.formatIfNumber(datosResp[i].total_adjudicado, formatoNumerico), style: 'textDatoT', alignment: 'right' }] },
      { text: [{ text: this.formatIfNumber(datosResp[i].cant_incremento, formatoNumerico), style: 'textDatoT', alignment: 'right' }] },
      { text: [{ text: this.formatIfNumber(datosResp[i].total_incremento, formatoNumerico), style: 'textDatoT', alignment: 'right' }] },
    ];
    arrayData.push(rowData);
  }

  // Fila final con total
  const totalRow = [
    {
      colSpan: 7,
      text: 'TOTAL (Bs)(*):',
      style: 'textTituloT', alignment: 'right', border: [false, true, false, true],
    },
    {}, {}, {}, {}, {}, {}, // estos serán ignorados por el colSpan
    {
      text: this.formatIfNumber(this.datosEnvio[0].total_incremento, formatoNumerico2),
      style: 'textTituloT', alignment: 'right', border: [false, true, false, true],
    },
  ];

  // Porcentaje adicional 
  //YO const montoContrato = Number(this.datosEnvio[0].monto_contrato);

    // YO if (!isNaN(montoContrato) && montoContrato !== 0) {
    //   //YOporc_modif = (totalReordenamientoSum * 100) / montoContrato;
    //   porc_modif = this.formatIfNumber(this.datosEnvio[0].porcentaje_incremento,formatoNumerico2);
    // } 

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
      text: this.formatIfNumber(this.datosEnvio[0].porcentaje_incremento,formatoNumerico2) + '%',
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
  buildItemsDecremento(data: any, formatoNumerico: Intl.NumberFormat) {
    const formatoNumerico2 = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
    });
  
  let datosResp = data;
  let arrayData = [];
  //YOlet totalReordenamientoSum = 0;
  //YOlet porc_modif = 0;

  for (let i = 0; i < datosResp.length; i++) {
    // Convertir a número por si viene como string
    //YO const totalReordenamiento = Number(datosResp[i].total_decremento) || 0;
    //YO otalReordenamientoSum += totalReordenamiento;

    let rowData = [
      { text: [{ text: datosResp[i].orden_sim, style: 'textDatoT', alignment: 'center' }] },
      { text: [{ text: datosResp[i].desc_item, alignment: 'left', style: 'textDatoT' }] },
      { text: [{ text: datosResp[i].unidad_medida_sim, style: 'textDatoT', alignment: 'center' }] },
      { text: [{ text: this.formatIfNumber(datosResp[i].p_unitario_adjudicado, formatoNumerico), style: 'textDatoT', alignment: 'right' }] },
      { text: [{ text: this.formatIfNumber(datosResp[i].cantidad_sim, formatoNumerico), style: 'textDatoT', alignment: 'right' }] },
      { text: [{ text: this.formatIfNumber(datosResp[i].total_adjudicado, formatoNumerico), style: 'textDatoT', alignment: 'right' }] },
      { text: [{ text: this.formatIfNumber(datosResp[i].cant_decremento, formatoNumerico), style: 'textDatoT', alignment: 'right' }] },
      { text: [{ text: this.formatIfNumber(datosResp[i].total_decremento, formatoNumerico), style: 'textDatoT', alignment: 'right' }] },
    ];
    arrayData.push(rowData);
  }

  // Fila final con total
  const totalRow = [
    {
      colSpan: 7,
      text: 'TOTAL (Bs)(*):',
      style: 'textTituloT', alignment: 'right', border: [false, true, false, true],
    },
    {}, {}, {}, {}, {}, {}, // estos serán ignorados por el colSpan
    {
      text: this.formatIfNumber(this.datosEnvio[0].total_decremento,formatoNumerico2),
      style: 'textTituloT', alignment: 'right', border: [false, true, false, true],
    },
  ];

  // Porcentaje adicional 
  //YOconst montoContrato = Number(this.datosEnvio[0].monto_contrato);
  //YO const montoContrato = Number(this.datosEnvio[0].monto_contrato);

    //YO if (!isNaN(montoContrato) && montoContrato !== 0) {
    //   porc_modif = (totalReordenamientoSum * 100) / montoContrato;
      
    // } 

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
      text: this.formatIfNumber(this.datosEnvio[0].porcentaje_decremento,formatoNumerico2) + '%',
      style: 'textTituloT',
      alignment: 'right',
      border: [false, true, false, true],
    },
  ];

  arrayData.push(totalRow);
  arrayData.push(porcentajeRow);

  return arrayData;
}

// Función para cargar las tablas de modificaciones ADICION
  buildItemsAdicion(data: any, formatoNumerico: Intl.NumberFormat) {
    const formatoNumerico2 = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
    });
  
  let datosResp = data;
  let arrayData = [];
  //YOlet totalReordenamientoSum = 0;
  //YOlet porc_modif = 0;

  for (let i = 0; i < datosResp.length; i++) {
    // Convertir a número por si viene como string
    //YOconst totalReordenamiento = Number(datosResp[i].total_incremento) || 0;
    //YOtotalReordenamientoSum += totalReordenamiento;

    let rowData = [
      { text: [{ text: datosResp[i].orden_sim, style: 'textDatoT', alignment: 'center' }] },
      { text: [{ text: datosResp[i].desc_item, alignment: 'left', style: 'textDatoT' }] },
      { text: [{ text: datosResp[i].unidad_medida_sim, style: 'textDatoT', alignment: 'center' }] },
      { text: [{ text: this.formatIfNumber(datosResp[i].p_unitario_adjudicado, formatoNumerico), style: 'textDatoT', alignment: 'right' }] },
      { text: [{ text: this.formatIfNumber(datosResp[i].cantidad_autorizada, formatoNumerico), style: 'textDatoT', alignment: 'right' }] },
      { text: [{ text: this.formatIfNumber(datosResp[i].total_adjudicado, formatoNumerico), style: 'textDatoT', alignment: 'right' }] },
      { text: [{ text: this.formatIfNumber(datosResp[i].cant_incremento, formatoNumerico), style: 'textDatoT', alignment: 'right' }] },
      { text: [{ text: this.formatIfNumber(datosResp[i].total_incremento, formatoNumerico), style: 'textDatoT', alignment: 'right' }] },
    ];
    arrayData.push(rowData);
  }

  // Fila final con total
  const totalRow = [
    {
      colSpan: 7,
      text: 'TOTAL (Bs):',
      style: 'textTituloT', alignment: 'right', border: [false, true, false, true],
    },
    {}, {}, {}, {}, {}, {}, // estos serán ignorados por el colSpan
    {
      text: this.formatIfNumber(this.datosEnvio[0].total_item_nuevo, formatoNumerico2),
      style: 'textTituloT', alignment: 'right', border: [false, true, false, true],
    },
  ];

  // Porcentaje adicional 
  //YOconst montoContrato = Number(this.datosEnvio[0].monto_contrato);
  //YOconst montoContrato = Number(this.datosEnvio[0].monto_contrato);

    //YO if (!isNaN(montoContrato) && montoContrato !== 0) {
    //   porc_modif = (totalReordenamientoSum * 100) / montoContrato;
      
    // } 

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
      text: this.formatIfNumber(this.datosEnvio[0].pocentaje_item_nuevo,formatoNumerico2) + '%',
      style: 'textTituloT',
      alignment: 'right',
      border: [false, true, false, true],
    },
  ];

  arrayData.push(totalRow);
  arrayData.push(porcentajeRow);

  return arrayData;
}

// Función para poblar la tabla de Items NUEVOS
    buildItemsNuevos(data: any, formatoNumerico: Intl.NumberFormat) {
    let datosResp = data;
    let arrayData = [];

    for (let i = 0; i < datosResp.length; i++) {
      let rowData = [
        { text: [{ text: datosResp[i].orden_sim, style: 'textDatoT', alignment: 'center' }] },
        { text: [{ text: datosResp[i].desc_item, style: 'textDatoT' }] },
        { text: [{ text: datosResp[i].unidad_medida_sim, style: 'textDatoT', alignment: 'center' }] },
        { text: [{ text: this.formatIfNumber(datosResp[i].p_unitario_adjudicado, formatoNumerico), style: 'textDatoT', alignment: 'right' }] },
        { text: [{ text: this.formatIfNumber(datosResp[i].p_unitario_sim, formatoNumerico), style: 'textDatoT', alignment: 'right', }] },
        { text: [{ text: this.formatIfNumber(datosResp[i].p_unitario_adjudicado, formatoNumerico), style: 'textDatoT', alignment: 'right' }] },
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
  return resto === 0
    ? this.centenas[centena]
    : `${this.centenas[centena]} ${this.numberToWords(resto)}`.trim();
  }
  if (value < 1_000_000) {
  const miles = Math.floor(value / 1000);
  const resto = value % 1000;
  const milesWord = miles === 1 ? 'MIL' : `${this.numberToWords(miles)} MIL`;
  return resto === 0
    ? milesWord
    : `${milesWord} ${this.numberToWords(resto)}`.trim();
  }
  if (value < 1_000_000_000) {
  const millones = Math.floor(value / 1_000_000);
  const resto = value % 1_000_000;
  const millonesWord = millones === 1 ? 'UN MILLÓN' : `${this.numberToWords(millones)} MILLONES`;
  return resto === 0
    ? millonesWord
    : `${millonesWord} ${this.numberToWords(resto)}`.trim();
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