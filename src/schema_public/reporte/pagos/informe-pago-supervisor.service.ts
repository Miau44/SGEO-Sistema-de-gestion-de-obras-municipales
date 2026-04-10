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
    console.log(`Archivo de fuente ${style}datosDes encontrado en ${path}`);
  }
});

@Injectable()
export class InformePagoSupervisor {
    datosEnvio: any = [];
    datosInfSup: any = [];
    datosModAp: any = [];
    datosDes: any = [];
    datosCA: any = [];
    datosAdj: any = [];

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

  // Datos generales obra - contrato - pago
  async datosGeneralesObraModif(id_modif_pago: number) {
    const query = `
        SELECT * 
        FROM public."vista_reporte_pago_gral" WHERE id_modificacion_pago = ${id_modif_pago}`;
    const resultado = await this.sequelize.query(query);
    return resultado[0];
  }

    // Datos informe - Pago Supervisor
  async datosInformePagoSupervisor(solicitud: number) {
    const query = `
        SELECT * 
        FROM public."vista_reporte_Informe_PagoSup" WHERE id_solicitud = ${solicitud}`;
    const resultado = await this.sequelize.query(query);
    return resultado[0];
  }

    // Resumen de Modificaciones Aprobadas por obra 
   async modificacionesAprobadas(obra: number) {
    const query3 = `
        SELECT * 
        FROM public."vista_reporte_modif_aprobadas" WHERE fecha_memo_minuta IS NOT NULL AND id_obra = ${obra}`;
    const resultado3 = await this.sequelize.query(query3);
    return resultado3[0];
   }

    // Datos Descuentos
    async datosDescuentos(obra: number, id_modif_pago: number) {
      const query4 = `
          SELECT * 
          FROM public.f_reporte_resumen_descuentos(${obra},${id_modif_pago})`;
      const resultado4 = await this.sequelize.query(query4);
      return resultado4[0];
   }

   // Datos Total Certificados Anteriores
    async datosCertificadoAnt(obra: number, id_modif_pago: number) {
      const query5 = `
          SELECT * 
          FROM public.f_reporte_resumen_total_certificado(${obra},${id_modif_pago})`;
      const resultado5 = await this.sequelize.query(query5);
      return resultado5[0];
   }

   // Datos lista Adjuntos - Inf. Pago
   async AdjuntosPago(obra: number) {
    const query6 = `
        SELECT * 
        FROM public."vista_reporte_adjuntos_InfPago" WHERE id_obra = ${obra}`;
    const resultado6 = await this.sequelize.query(query6);
    return resultado6[0];
   }

  // REPORTE - INFORME PAGO SUPERVISOR

async generateInformePagoSupervisor(id_modif_pago: number): Promise<Buffer> {

    const datosGenerales = await this.datosGeneralesObraModif(id_modif_pago);
    if ((!datosGenerales || (Array.isArray(datosGenerales) && datosGenerales.length === 0) || (typeof datosGenerales === 'object' && Object.keys(datosGenerales).length === 0))){
      throw new Error('No se encontraron datos para el ID de la obra proporcionada');
    }
    this.datosEnvio = datosGenerales;

    const res3 = await this.datosInformePagoSupervisor(this.datosEnvio[0].id_solicitud);
    if (!res3 || (Array.isArray(res3) && res3.length === 0) || (typeof res3 === 'object' && Object.keys(res3).length === 0)) {
        throw new Error('No se encontraron datos del informe de Supervisor');
    }
    this.datosInfSup = res3; 

    const res4 = await this.modificacionesAprobadas(this.datosEnvio[0].id_obra);
    this.datosModAp = res4;

    const res5 = await this.datosDescuentos(this.datosEnvio[0].id_obra, id_modif_pago);
    if (!res5 || (Array.isArray(res5) && res5.length === 0) || (typeof res5 === 'object' && Object.keys(res5).length === 0)) {
        throw new Error('No se encontraron datos de los descuentos');
    }
    this.datosDes = res5;

    const res6 = await this.datosCertificadoAnt(this.datosEnvio[0].id_obra, id_modif_pago);
    this.datosCA = res6;

    const res7 = await this.AdjuntosPago(this.datosEnvio[0].id_obra);
    if (!res7 || (Array.isArray(res7) && res7.length === 0) || (typeof res7 === 'object' && Object.keys(res7).length === 0)) {
        throw new Error('No se encontraron los datos de Adjuntos');
    }
    this.datosAdj = res7;
    
    const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
    const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');
    //const imgPath = 'assets/images/membretado_oficio.png';
    const codigoCarpeta = this.datosEnvio[0].cod_carpeta;
    const imgPath = this.reportService.obtenerMembretePorGestion(codigoCarpeta);
    const marcaAgua = this.datosEnvio[0].fecha_aprobacion_pago;
    let gestionObra = parseInt(codigoCarpeta.split('-').pop());
    let margenesDinamicos;
    if (gestionObra >= 2026) {
      margenesDinamicos = [70, 130, 50, 140]; 
    } else {
      margenesDinamicos = [70, 170, 50, 140]; 
    }

    
    let porc_presente = 0;
    const montoContrato = Number(this.datosEnvio[0].monto_contrato);
    const total_autorizado = Number(this.datosEnvio[0].monto_presente);
    porc_presente = Number(total_autorizado / montoContrato) * 100;

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

    const formatoNumerico2 = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
    });
 
   console.log('DATOS MODIFICACION',this.datosModAp);
   
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
        text: 'INFORME DE PAGO',
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
        widths: ['15%', '85%'],
        body: [
            [
              { text: 'A:', style: 'textTitulo', margin: [0, 5, 0, 5], alignment:'right' },
              { text: [
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
              { text: 'REF.:', style: 'textTitulo', alignment:'right' },
              { text: this.datosInfSup[0].referencia, style: 'textDato' }
            ],
            [
              { text: 'PERIODO:', style: 'textTitulo', alignment:'right' },
              { text: this.formatearFecha(this.datosEnvio[0].fecha_inicio_periodo) + ' al ' + this.formatearFecha(this.datosEnvio[0].fecha_fin_periodo), style: 'textDato' }
            ],
            [
              { text: 'FECHA:', style: 'textTitulo', alignment:'right' },
              { text: this.fechaString(this.datosEnvio[0].fecha_supervisor), style: 'textDato' }
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
        text: 'El presente informe corresponde al ' + 'CERTIFICADO DE PAGO ' + this.datosEnvio[0].detalle + ' Nro.' + this.datosEnvio[0].numero_pago + 
        ' en favor de la Empresa Contratista ' + this.datosEnvio[0].proponente_razon_social + ' por ítems ejecutados, medidos y aprobados.',
        style: 'textDato', alignment:'justify', margin: [10, 0, 0, 5]
      },
      {
        text: '1.   DATOS DE LA OBRA',
        style: 'textTitulo', margin: [0, 0, 0, 5]
      },
      {
        text: 'CONTRATO INICIAL',
        style: 'textTitulo', margin: [10, 0, 0, 5]
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
              { text: 'MONTO CONTRATO INICIAL (Bs):', style: 'textTitulo', alignment: 'right', fillColor: '#dddddd' },
              { text: this.formatIfNumber(this.datosEnvio[0].monto_contrato,formatoNumerico2), style: 'textDato', fillColor: '#dddddd' }
            ],
            [
              { text: 'PLAZO DE EJECUCIÓN, CONTRATO INICIAL:', style: 'textTitulo', alignment: 'right' },
              { text: this.datosEnvio[0].plazo_contrato + ' d.c.', style: 'textDato', margin: [0, 5, 0, 0] }
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
      ...(
         this.buildModAprobadas(this.datosModAp,formatoNumerico).length > 1 
         ?[
            {
              text: 'MODIFICACIONES',
              style: 'textTitulo', margin: [10, 0, 0, 5]
            },
            {
              table: {
                widths: ['6%','31%','17%','16%','16%','16%','16%'], 
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
              }, margin: [10, 0, 0, 7]
            }
         ]
         :[]
      ),
      //Fecha de conclusion REAL solo si existe
      ...( this.datosEnvio[0].fe_ap_acta!= null && this.datosEnvio[0].fe_ap_acta !== '' 
        ?[
          {
            table: {
              widths: ['*', 300],
              body: [ 
                [
                  { text: 'FECHA CONCLUSIÓN REAL:', style: 'textTituloT', alignment: 'right', fillColor: '#dddddd' },
                  { text: this.formatearFecha(this.datosEnvio[0].fecha_acta), style: 'textDatoT', fillColor: '#dddddd' }
                ]
              ]
            }, margin: [10, 0, 0, 7]
          },
        ]
        :[]
      ),
      
      ...( this.datosEnvio[0].numero_pago > 1  //Mostrar si es número pago > 1
        ?[
            {
              text: '2.   ANTECEDENTES',
              style: 'textTitulo', margin: [0, 0, 0, 5] 
            },
            {
              table: {
                  widths: ['40%','60%'], 
                  body: [
                    [ { text: 'MONTO CERTIFICADOS ANTERIORES ', style: 'textTituloT' },
                      { text: 'Bs' + this.formatIfNumber(this.datosCA[0].total_certificado_anterior,formatoNumerico2), style: 'textTituloT' }
                    ],
                    [
                      { text: 'DEDUCCIONES ANTERIORES ', style: 'textTituloT'},
                      { text: 'Bs' + this.formatIfNumber(this.datosDes[0].deduccion_anterior,formatoNumerico2), style: 'textTituloT'}
                    ],
                    [
                      { text: 'RETENCIONES ANTERIORES ', style: 'textTituloT' },
                      { text: 'Bs' + this.formatIfNumber(this.datosDes[0].retencion_anterior,formatoNumerico2), style: 'textTituloT'}
                    ],
                    [
                      { text: 'MULTAS ANTERIORES ', style: 'textTituloT'},
                      { text: 'Bs' + this.formatIfNumber(this.datosDes[0].multa_anterior,formatoNumerico2), style: 'textTituloT'}
                    ],
                    ...(this.datosDes[0].penalidad_anterior === 0
                      ?[
                        [
                          { text: 'OTRAS RETENCIONES ANTERIORES ', style: 'textTituloT'},
                          { text: 'Bs' + this.formatIfNumber(this.datosDes[0].penalidad_anterior,formatoNumerico2), style: 'textTituloT'}
                        ]
                      ]
                      :[]
                    ),
                  ]
                }, margin: [60, 0, 60, 7] 
            },
            {
              text: '3.   DESARROLLO\n',
              style: 'textTitulo', margin: [0, 0, 0, 5]
            },
            {
              text: 'El presente CERTIFICADO DE PAGO ' + this.datosEnvio[0].detalle + ' Nro.' + this.datosEnvio[0].numero_pago + ' correspondiente al periodo del ' + 
                  this.formatearFecha(this.datosEnvio[0].fecha_inicio_periodo) + ' al ' + this.formatearFecha(this.datosEnvio[0].fecha_fin_periodo) +  
                  ', de conformidad a los ítems ejecutados, a los precios unitarios establecidos y especificaciones técnicas, de acuerdo a la medición efectuada ' + 
                  'en forma conjunta por el supervisor y el contratista, el mismo que se detalla a continuación:',
              style: 'textDato', alignment:'justify', margin: [10, 0, 0, 5] 
            },
            {
              table: {
                  widths: ['40%','60%'], 
                  body: [
                    [ { text: 'IMPORTE DEL PRESENTE CERTIFICADO ', style: 'textTituloT' },
                      { text: 'Bs' + this.formatIfNumber(this.datosEnvio[0].monto_presente,formatoNumerico2), style: 'textTituloT' }
                    ],
                    [
                      { text: 'DEDUCCIONES ', style: 'textTituloT'},
                      { text: 'Bs(-)' + this.formatIfNumber(this.datosDes[0].deduccion_presente,formatoNumerico2), style: 'textTituloT'},
                    ],
                    [
                      { text: 'RETENCIONES ', style: 'textTituloT' },
                      { text: 'Bs(-)' + this.formatIfNumber(this.datosDes[0].retencion_presente,formatoNumerico2), style: 'textTituloT'},
                    ],
                    [
                      { text: 'MULTAS ', style: 'textTituloT'},
                      { text: 'Bs(-)' + this.formatIfNumber(this.datosDes[0].multa_presente,formatoNumerico2), style: 'textTituloT'},
                    ],
                    ...(this.datosDes[0].penalidad_anterior > 0
                      ?[
                        [
                            { text: 'OTRAS RETENCIONES ANTERIORES ', style: 'textTituloT'},
                            { text: 'Bs(-)' + this.formatIfNumber(this.datosDes[0].penalidad_anterior,formatoNumerico2), style: 'textTituloT'},
                        ]
                      ]
                      :[]
                    ),
                    [
                      { text: 'IMPORTE NETO A PAGAR ', style: 'textTituloT'},
                      { text: 'Bs' + this.formatIfNumber(this.datosEnvio[0].importe_por_pagar,formatoNumerico2) + '\n(' +
                      this.convertToWords(this.formatIfNumber(this.datosEnvio[0].importe_por_pagar,formatoNumerico2), 'Bs.') + ')', style: 'textTituloT'},
                    ]
                  ]
              }, margin: [60, 0, 60, 7]
            },
            {
              text: '4.   CONCLUSIÓN',
              style: 'textTitulo', margin: [0, 0, 0, 5]
            },
            {
              ul: 
              [
                { text: [
                      { text: 'Mediante el presente informe, ésta supervisión certifica que las cantidades que se reflejan en las planilla de cómputos y ' + 
                          'la planilla de detalle de certificado fueron ejecutas y medidas en cumplimiento a las especificaciones técnicas de la obra, situación ' + 
                          'que corresponde a los certificados de calidad y planos de detalle adjunto al presente.', style: 'textDato' },
                      ], margin: [0, 0, 0, 5]
                },
                {
                  text: [
                      { text: 'Las cantidades de obra son aprobados mediante el presente informe, por lo que el CERTIFICADO DE PAGO ' + this.datosEnvio[0].detalle + 
                          ' Nro.' + this.datosEnvio[0].numero_pago + ' asciende a la suma total de Bs' + this.formatIfNumber(this.datosEnvio[0].monto_presente,formatoNumerico2) + 
                          ' (' + this.convertToWords(this.formatIfNumber(this.datosEnvio[0].monto_presente,formatoNumerico2), 'Bs.') + ').'
                      }
                      ], margin: [0, 0, 0, 5]
                },
                {
                  text: [
                      { text: 'El importe neto a pagar es de: Bs' + this.formatIfNumber(this.datosEnvio[0].importe_por_pagar,formatoNumerico2) + ' (' +
                          this.convertToWords(this.formatIfNumber(this.datosEnvio[0].importe_por_pagar,formatoNumerico2), 'Bs.') + ').'
                      }
                      ], margin: [0, 0, 0, 5]
                },
                {
                  text: [
                      { text: 'El avance comprendido en el presente certificado alcanza al: ' + this.formatIfNumber(porc_presente,formatoNumerico2) + 
                        '% según monto del contrato inicial, por lo que a la fecha el porcentaje acumulado es de: ' + this.formatIfNumber(this.datosEnvio[0].porcentaje_acumulado,formatoNumerico2) + '%.'
                      }
                      ], margin: [0, 0, 0, 5]
                },
                {
                  text: [
                      { text: this.datosInfSup[0].conclusion }
                      ]
                }
              ],
              style: 'textDato', alignment:'justify', margin: [10, 0, 0, 7]
            },
            {
              text: '5.   RECOMENDACIONES',
              style: 'textTitulo', margin: [0, 0, 0, 5]
            },
            {
              text: 'La supervisión de obra recomienda el pago del presente certificado de pago de acuerdo a lo expuesto.',
              style: 'textDato', margin: [10, 0, 0, 5]
            },
            {
              text: '6.   ANEXOS\n',
              style: 'textTitulo', margin: [0, 0, 0, 5]
            },
            {
              text: [
                {text: 'Resúmen del certificado de pago ' + '(' + this.datosEnvio[0].detalle + ' Nro.' + this.datosEnvio[0].numero_pago + ')' }, 
                {text: '\nDetalle del Certificado - Certificado de pago ' + '(' + this.datosEnvio[0].detalle + ' Nro.' + this.datosEnvio[0].numero_pago + ')' },
                {text: '\nPlanilla cómputo métrico certificado de pago ' + '(' + this.datosEnvio[0].detalle + ' Nro.' + this.datosEnvio[0].numero_pago + ')' },
              ], style: 'textDato', margin: [10, 0, 0, 5]
            },
            {
              text: (
                      Array.isArray(this.datosAdj)
                      ? this.datosAdj
                          .filter(a => a && a.desc_tipo_documento)
                          .map(a => a.desc_tipo_documento)
                          .join('\n')  // salto de linea 
                      : ''
                  ) + '\n',
                  style: 'textDato', alignment: 'left', margin: [10, 0, 0, 5]   
            },
         ]
        :[ //Si es Pago UNICO o es el PRIMERO
            {
              text: '2.   DESARROLLO\n',
              style: 'textTitulo', margin: [0, 0, 0, 5]
            },
            {
              text: 'El presente CERTIFICADO DE PAGO ' + this.datosEnvio[0].detalle + ' Nro.' + this.datosEnvio[0].numero_pago + ' correspondiente al periodo del ' + 
                  this.formatearFecha(this.datosEnvio[0].fecha_inicio_periodo) + ' al ' + this.formatearFecha(this.datosEnvio[0].fecha_fin_periodo) +  
                  ', de conformidad a los ítems ejecutados, a los precios unitarios establecidos y especificaciones técnicas, de acuerdo a la medición efectuada ' + 
                  'en forma conjunta por el supervisor y el contratista, el mismo que se detalla a continuación:',
              style: 'textDato', alignment:'justify', margin: [10, 0, 0, 5] 
            },
            {
              table: {
                  widths: ['40%','60%'], 
                  body: [
                    [ { text: 'IMPORTE DEL PRESENTE CERTIFICADO ', style: 'textTituloT' },
                      { text: 'Bs' + this.formatIfNumber(this.datosEnvio[0].monto_presente,formatoNumerico2), style: 'textTituloT' }
                    ],
                    [
                      { text: 'DEDUCCIONES ', style: 'textTituloT'},
                      { text: 'Bs(-)' + this.formatIfNumber(this.datosDes[0].deduccion_presente,formatoNumerico2), style: 'textTituloT'},
                    ],
                    ...(this.datosDes[0]?.justificacion_retencion
                      ? [
                        [
                          { text: 'RETENCIONES (*)', style: 'textTituloT' },
                          { text: 'Bs(-)' + this.formatIfNumber(this.datosDes[0].retencion_presente, formatoNumerico2), style: 'textTituloT'},
                        ]
                      ]
                      : []
                    ),
                    [
                      { text: 'MULTAS ', style: 'textTituloT'},
                      { text: 'Bs(-)' + this.formatIfNumber(this.datosDes[0].multa_presente,formatoNumerico2), style: 'textTituloT'},
                    ],
                    ...(this.datosDes[0].penalidad_anterior > 0
                      ?[
                        [
                            { text: 'OTRAS RETENCIONES ANTERIORES ', style: 'textTituloT'},
                            { text: 'Bs(-)' + this.formatIfNumber(this.datosDes[0].penalidad_anterior,formatoNumerico2), style: 'textTituloT'},
                        ]
                      ]
                      :[]
                    ),
                    [
                      { text: 'IMPORTE NETO A PAGAR ', style: 'textTituloT'},
                      { text: 'Bs' + this.formatIfNumber(this.datosEnvio[0].importe_por_pagar,formatoNumerico2) + '\n(' +
                      this.convertToWords(this.formatIfNumber(this.datosEnvio[0].importe_por_pagar,formatoNumerico2), 'Bs.') + ')', style: 'textTituloT'},
                    ]
                  ]
              }, margin: [60, 0, 60, 7]
            },
            ...(this.datosDes[0]?.justificacion_retencion
              ? [
                  [
                    {
                      text: [
                        { text: '(*) Justificación: ', style: 'textTitulo', bold: true }, 
                        { text: this.datosDes[0].justificacion_retencion, style: 'textDato' } 
                      ],
                      alignment: 'justify', 
                      margin: [60, 0, 60, 10] 
                    }
                  ]
                ]
              : []
            ),
            {
              text: '3.   CONCLUSIÓN',
              style: 'textTitulo', margin: [0, 0, 0, 5]
            },
            {
              ul: 
              [
                { text: [
                      { text: 'Mediante el presente informe, ésta supervisión certifica que las cantidades que se reflejan en las planilla de cómputos y ' + 
                          'la planilla de detalle de certificado fueron ejecutas y medidas en cumplimiento a las especificaciones técnicas de la obra, situación ' + 
                          'que corresponde a los certificados de calidad y planos de detalle adjunto al presente.', style: 'textDato' },
                      ], margin: [0, 0, 0, 5]
                },
                {
                  text: [
                      { text: 'Las cantidades de obra son aprobados mediante el presente informe, por lo que el CERTIFICADO DE PAGO ' + this.datosEnvio[0].detalle + 
                          ' Nro.' + this.datosEnvio[0].numero_pago + ' asciende a la suma total de Bs' + this.formatIfNumber(this.datosEnvio[0].monto_presente,formatoNumerico2) + 
                          ' (' + this.convertToWords(this.formatIfNumber(this.datosEnvio[0].monto_presente,formatoNumerico2), 'Bs.') + ').'
                      }
                      ], margin: [0, 0, 0, 5]
                },
                {
                  text: [
                      { text: 'El importe neto a pagar es de: Bs' + this.formatIfNumber(this.datosEnvio[0].importe_por_pagar,formatoNumerico2) + ' (' +
                          this.convertToWords(this.formatIfNumber(this.datosEnvio[0].importe_por_pagar,formatoNumerico2), 'Bs.') + ').'
                      }
                      ], margin: [0, 0, 0, 5]
                },
                {
                  text: [
                      { text: 'El avance comprendido en el presente certificado alcanza al: ' + this.formatIfNumber(porc_presente,formatoNumerico2) + 
                        '% según monto del contrato inicial, por lo que a la fecha el porcentaje acumulado es de: ' + this.formatIfNumber(this.datosEnvio[0].porcentaje_acumulado,formatoNumerico2) + '%.'
                      }
                      ], margin: [0, 0, 0, 5]
                },
                {
                  text: [
                      { text: this.datosInfSup[0].conclusion }
                      ]
                }
              ],
              style: 'textDato', alignment:'justify', margin: [10, 0, 0, 7]
            },
            {
              text: '4.   RECOMENDACIONES',
              style: 'textTitulo', margin: [0, 0, 0, 5]
            },
            {
              text: 'La supervisión de obra recomienda el pago del presente certificado de pago de acuerdo a lo expuesto.',
              style: 'textDato', margin: [10, 0, 0, 5]
            },
            {
              text: '5.   ANEXOS\n',
              style: 'textTitulo', margin: [0, 0, 0, 5]
            },
            {
              text: [
                {text: 'Resúmen del certificado de pago ' + '(' + this.datosEnvio[0].detalle + ' Nro.' + this.datosEnvio[0].numero_pago + ')' }, 
                {text: '\nDetalle del Certificado - Certificado de pago ' + '(' + this.datosEnvio[0].detalle + ' Nro.' + this.datosEnvio[0].numero_pago + ')' },
                {text: '\nPlanilla cómputo métrico certificado de pago ' + '(' + this.datosEnvio[0].detalle + ' Nro.' + this.datosEnvio[0].numero_pago + ')' },
              ], style: 'textDato', margin: [10, 0, 0, 5]
            },
            {
              text: (
                      Array.isArray(this.datosAdj)
                      ? this.datosAdj
                          .filter(a => a && a.desc_tipo_documento)
                          .map(a => a.desc_tipo_documento)
                          .join('\n')  // salto de linea 
                      : ''
                  ) + '\n',
                  style: 'textDato', alignment: 'left', margin: [10, 0, 0, 5]   
            },
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
        opacity: 0.8,
        bold: true,
      },
      textDatoT: {
        fontSize: 7,
        bold: false,
        opacity: 0.8,
      },
    },
    pageMargins: margenesDinamicos as any, // Márgenes: izquierda, arriba, derecha, abajo

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
          text: 'TOTAL',
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