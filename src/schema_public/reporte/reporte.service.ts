import { Injectable, Inject, Header } from '@nestjs/common';
//import * as PdfPrinter from 'pdfmake/src/printer';
import PdfPrinter from 'pdfmake';
import * as path from 'path';
import * as fs from 'fs';
import { ResponseService } from 'src/response.service';
import { Sequelize } from 'sequelize-typescript';
import { log } from 'console';
import { existsSync } from 'fs'
import { join } from 'path';
import { text } from 'stream/consumers';
import { Any } from 'typeorm';

const rootPath = process.cwd();
const fontsPath = join(process.cwd(), 'assets', 'fonts');

const fonts = {
  Roboto: {
    normal: join(fontsPath, 'Roboto-Regular.ttf'),
    bold: join(fontsPath, 'Roboto-Medium.ttf'),
    italics: join(fontsPath, 'Roboto-Italic.ttf'),
    bolditalics: join(fontsPath, 'Roboto-MediumItalic.ttf'),
  },

  Muller_Regular: {

  }
};

Object.entries(fonts.Roboto).forEach(([style, path]) => {
  if (!existsSync(path)) {
    console.error(`Archivo de fuente ${style} no encontrado en ${path}`);
  } else {
    console.log(`Archivo de fuente ${style} encontrado en ${path}`);
  }
});

@Injectable()
export class ReportService {
  datos: any = [];
  datosEnvio: any = [];
  datosSIM: any = [];
  datosPreguntaInforme: any = [];
  datosPreguntaInformeRestante: any = [];
  datosPreguntaInformeConclusion: any = [];

  constructor(
    private readonly responseService: ResponseService,
    @Inject(Sequelize) private sequelize: Sequelize, // Inyecta Sequelize correctamente
  ) {
    this.printer = new PdfPrinter(fonts);
  }

  private readonly printer = new PdfPrinter(fonts);

  private getImageBase64(imagePath: string): string {
    const image = fs.readFileSync(imagePath);
    //-----const image2 = fs.readFileSync(imagePath2);
    return image.toString('base64');
  }

  //funcion para poner membretado de la gestion que correspende a la obra y al pdf
  obtenerMembretePorGestionMemorandums(codigoCarpeta: string): string {
    if (!codigoCarpeta) {
      return 'assets/images/membretado_oficio.png'; 
    }
    const gestionObra = parseInt(codigoCarpeta.split('-').pop() || '');
    if (gestionObra >= 2026) {
      return 'assets/images/membretado_oficio_nuevo.png';
    } else {
      return 'assets/images/membretado_oficio.png';
    }
  }


  private obtenerMembretadoPorGestion(gestion: number | string): string {
    const gestionNum = Number(gestion);

    if (gestionNum === 2025) {
      return 'assets/images/membretado_carta.png';
    }

    return 'assets/images/membretado_carta_nuevo.png';
  }

  async datosGeneralesReporte(id: number) {
    //const query1 = ` SELECT * FROM sp_reporte_memorandum2(${gestion},${id})`;
    const query1 = ` SELECT * FROM public.vista_reporte_designacion_memorandum WHERE id_designacion = ${id}`;
    //const response = await sequelize.query(query);
    const resultado = await this.sequelize.query(query1);
    return resultado[0];
  }

  //SOLICITUD DE DESIGNACION
  async generatePdf(id: number): Promise<Buffer> {
    const res = await this.datosGeneralesReporte(id);
    if (
      !res ||
      (Array.isArray(res) && res.length === 0) ||
      (typeof res === 'object' && Object.keys(res).length === 0)
    ) {
      throw new Error('No se encontraron datos para el ID proporcionado');
    }
    this.datos = res;
    // console.log("Generar1, ", res);
    // console.log("Generar2, ", this.datos);
    // console.log("Generarcodcarpeta, ", this.datos[0].codcarpeta);

    const headerImage = path.join(
      __dirname,
      '..',
      'assets',
      'images',
      'logo_gamlp.png',
    );
    const footerImage = path.join(
      __dirname,
      '..',
      'assets',
      'images',
      'footer.png',
    );
    //const imgUrl = 'http://localhost:3009/images/logo.png';  // Cambia la URL según tu configuración
       const imgPath = this.obtenerMembretadoPorGestion(
      this.datos[0].gestion_carpeta,
    );
    //console.log('imgPath seleccionado:', imgPath);
   
    try {
      const documentDefinition = {
        pageSize: 'LETTER' as any,
        //pageMargins: [0, 0, 0, 0], // Elimina los márgenes para que la imagen cubra toda la hoja
        background: function (currentPage: any, pageSize: any) {
          return {
            image: imgPath,
            width: pageSize.width,
            height: pageSize.height,
            absolutePosition: { x: 0, y: 0 },
          };
        },

        header: {
          columns: [
            //{ image: imgPath, width: 180 },  // Uso de la ruta de imagen directamente
            //   { image: `data:image/png;base64,${this.getImageBase64(headerImage)}`, width: 100 },
            //{ text: 'Título en Rojo', style: 'coloredText', alignment: 'left' }
            //ME { text: 'Secretaría Municipal de Infraestructura Pública', style: 'coloredText', alignment: 'left' },
            // { text: '\nInfraestructura Pública', style: 'coloredTextgray', alignment: 'left' }
          ],
        } as any,

        content: [
          {
            text:
              '\n\n\n\n\n\nFORMULARIO SOLICITUD DE ' +
              this.datos[0].permisos +
              '\n',
            style: 'header',
            alignment: 'center',
          } as any,
          {
            text:
              this.datos[0].cod_carpeta +
              '-' +
              this.datos[0].cite_solicitud +
              '-' +
              this.datos[0].correlativo_solicitud +
              '\n\n\n',
            style: 'subheader',
            alignment: 'center',
          },
          {
            text: 'DATOS DE PROYECTO \n',
            style: 'textTitulo',
          },
          {
            table: {
              widths: ['*', 350],
              body: [
                [
                  {
                    text: 'CÓDIGO:',
                    style: 'textTitulo',
                    fillColor: '#dddddd',
                    border: [false, true, false, false],
                  },
                  {
                    text: this.datos[0].cod_carpeta,
                    style: 'textDato',
                    fillColor: '#dddddd',
                    border: [false, true, false, false],
                  },
                ],

                [
                  { text: 'OBRA:', style: 'textTitulo' },
                  { text: this.datos[0].desc_carpeta, style: 'textDato' },
                ],
                [
                  { text: 'ZONA:', style: 'textTitulo', fillColor: '#dddddd' },
                  {
                    text: this.datos[0].desc_zona_carpeta,
                    style: 'textDato',
                    fillColor: '#dddddd',
                  },
                ],
                [
                  { text: 'MONTO DEL PROYECTO:\n', style: 'textTitulo' },
                  {
                    text: 'Bs.' + this.datos[0].total_carpeta + '\n',
                    style: 'textDato',
                  },
                ],
                [
                  {
                    text: 'FECHA VALIDACIÓN PROYECTO:\n',
                    style: 'textTitulo',
                    fillColor: '#dddddd',
                  },
                  {
                    text:
                      this.fechaString(this.datos[0].fecha_validacion_carpeta) +
                      '\n',
                    style: 'textDato',
                    alignment: 'middle',
                    fillColor: '#dddddd',
                  },
                ],
              ],
            },
            layout: 'noBorders',
          },
          {
            table: {
              widths: ['*', 330],
              body: [
                [
                  { text: '\n', style: 'textTitulo' },
                  { text: '\n', style: 'textDato' },
                ],
                [
                  { text: '\n', style: 'textTitulo' },
                  { text: '\n', style: 'textDato' },
                ],
              ],
            },
            layout: 'lightHorizontalLines',
          },

          {
            table: {
              widths: ['*', 400],
              body: [
                [
                  { text: 'Personal propuesto:', style: 'textDato' },
                  { text: '\n\n', style: 'textDato' },
                ],
                [
                  { text: '\n\n', style: 'textTitulo' },
                  {
                    text:
                      this.datos[0].profesion_detalle +
                      this.datos[0].nombre +
                      ' ' +
                      this.datos[0].primer_apellido +
                      ' ' +
                      this.datos[0].segundo_apellido,
                    style: 'textDato',
                  },
                ],
              ],
            },
            layout: 'noBorders',
          },
          {
            text: ['\n\n\n\n\n\n\n\n\n\n\n'],
          },
          {
            text: '\n',
            style: 'textDato',
            alignment: 'center',
          },
          {
            text: 'JEFE DE UNIDAD\n' + this.datos[0].nombre_da,
            style: 'textDato',
            alignment: 'center',
            bold: true,
          },
          {
            text: '\n\n\n\n\n\n\n\n\n\n\n\n\ncc:Arch:',
            style: 'footerText',
          } as any,
        ],

        footer: function (
          currentPage: { toString: () => string },
          pageCount: string,
        ) {
          //return currentPage.toString() + ' of ' + pageCount;
          return {
            columns: [
              {
                text: currentPage.toString() + ' de ' + pageCount,
                alignment: 'right',
                style: 'footerText',
                margin: [0, 0, 30, 0],
              },
            ],
          };
        } as any,

        styles: {
          header: {
            fontSize: 16,
            bold: true,
          },
          subheader: {
            fontSize: 12,
            bold: true,
          },
          coloredText: {
            fontSize: 10,
            bold: true,
            color: 'gray', // Cambiar el color del texto a 'blue'
          },
          coloredTextgray: {
            fontSize: 14,
            bold: true,
            color: 'gray', // Cambiar el color del texto a 'blue'
          },
          footerText: {
            fontSize: 6,
            bold: false,
          },
          textTitulo: {
            fontSize: 9,
            bold: true,
          },
          textDato: {
            fontSize: 9,
            bold: false,
            //color: 'gray',
            opacity: 0.8,
          },
        },
        pageMargins: [60, 30, 40, 30] as any, // Márgenes: izquierda, arriba, derecha, abajo
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
    } catch (error) {
      //console.error('Error al generar el PDF:', error);
      throw new Error('Error al generar el PDF: ' + error);
    }
  }

  //GENERAR MEMORANDUM SOLICITUD
  async generateMemo(id: number): Promise<Buffer> {
    const res = await this.datosGeneralesReporte(id);
    if (
      !res ||
      (Array.isArray(res) && res.length === 0) ||
      (typeof res === 'object' && Object.keys(res).length === 0)
    ) {
      throw new Error('No se encontraron datos para el ID proporcionado');
    }

    this.datos = res;

    const headerImage = path.join(
      __dirname,
      '..',
      'assets',
      'images',
      'logo_gamlp.png',
    );
    const footerImage = path.join(
      __dirname,
      '..',
      'assets',
      'images',
      'footer.png',
    );
      
    const imgPath = this.obtenerMembretadoPorGestion(
      this.datos[0].gestion_carpeta,
    );
    //console.log('imgPath seleccionado:', imgPath);

    const documentDefinition = {
      pageSize: 'LETTER' as any,
      background: function (currentPage: any, pageSize: any) {
        return {
          image: imgPath,
          width: pageSize.width,
          height: pageSize.height,
          absolutePosition: { x: 0, y: 0 },
        };
      },
      //watermark: { text: 'SGEO', color: 'blue', opacity: 0.1, bold: true, italics: false },

      header: {
        columns: [
          //{ image: `data:image/png;base64,${this.getImageBase64(headerImage)}`, width: 100 },
          //ME { image: imgPath, width: 180 },  // Uso de la ruta de imagen directamente
          //{ text: 'Título en Rojo', style: 'coloredText', alignment: 'left' }
          // ME { text: 'Secretaría Municipal de Infraestructura Pública', style: 'coloredText', alignment: 'left' },
          // { text: '\nInfraestructura Pública', style: 'coloredTextgray', alignment: 'left' }
        ],
      } as any,
      content: [
        {
          text: '\n\n\n\nM E M O R Á N D U M',
          style: 'header',
          alignment: 'center',
        } as any,
        {
          text:
            this.datos[0].cod_carpeta +
            '-' +
            this.datos[0].cite_memo +
            '-' +
            this.datos[0].correlativo +
            '\n\n',
          style: 'subheader',
          alignment: 'center',
        },
        {
          table: {
            widths: ['*', '*'],
            body: [
              [
                {
                  border: [false, false, true, true],
                  text:
                    'GOBIERNO AUTÓNOMO MUNICIPAL DE LA PAZ\n La Paz, ' +
                    this.fechaString(this.datos[0].fecha_aprobacion),
                  style: 'textTitulo',
                  alignment: 'center',
                },
                {
                  border: [true, false, false, true],
                  text:
                    'Señor(a):\n' +
                    this.datos[0].profesion_detalle +
                    ' ' +
                    this.datos[0].nombre +
                    ' ' +
                    this.datos[0].primer_apellido +
                    ' ' +
                    this.datos[0].segundo_apellido +
                    '\nPresente.- ',
                  style: 'textTitulo',
                  alignment: 'left',
                },
              ],
            ],
          },
        },
        {
          text:
            '\nREF.: DESIGNACIÓN DE ' +
            this.datos[0].permisos +
            ' DE OBRA \n\n',
          style: 'textTitulo',
          alignment: 'center',
        },
        //TEXTO
        {
          table: {
            widths: ['*', 350],
            body: [
              [
                {
                  text: 'OBRA:',
                  style: 'textTitulo',
                  alignment: 'right',
                  fillColor: '#dddddd',
                },
                {
                  text: this.datos[0].desc_carpeta,
                  style: 'textDato',
                  alignment: 'left',
                  fillColor: '#dddddd',
                },
              ],
              [
                { text: 'CÓDIGO:\n', style: 'textTitulo', alignment: 'right' },
                { text: this.datos[0].cod_carpeta + '\n', style: 'textDato' },
              ],
              [
                {
                  text: 'ZONA:\n',
                  style: 'textTitulo',
                  alignment: 'right',
                  fillColor: '#dddddd',
                },
                {
                  text: this.datos[0].desc_zona_carpeta + '',
                  style: 'textDato',
                  fillColor: '#dddddd',
                },
              ],
              [
                {
                  text: 'MONTO DE PROYECTO:\n',
                  style: 'textTitulo',
                  alignment: 'right',
                },
                {
                  text: 'Bs' + this.datos[0].total_carpeta + '',
                  style: 'textDato',
                },
              ],
            ],
          },
          layout: 'noBorders',
        },
        {
          table: {
            widths: ['*', 330],
            body: [
              [
                { text: '', style: 'textTitulo' },
                { text: '', style: 'textDato' },
              ],
              [
                { text: '\n', style: 'textTitulo' },
                { text: '\n', style: 'textDato' },
              ],
            ],
          },
          layout: 'lightHorizontalLines',
        },
        {
          text:
            'Señor(a):\n\nEn atención a la solicitud de la Unidad Ejecutora, se comunica a usted que la ' +
            (this.datos[0].cod_da_ap >= 37 && this.datos[0].cod_da_ap <= 45
              ? this.datos[0].nombre_da_ap
              : this.datos[0].nombre_ue_ap) +
            ' ha dispuesto designarle ' +
            this.datos[0].permisos +
            ' de la obra ' +
            this.datos[0].desc_carpeta +
            '.\n\nPara el efecto, a partir de la fecha deberá cumplir con las funciones y responsabilidades definidas en el Reglamento de Supervisión y Fiscalización de Obras del GAMLP, Código de Ética y Reglamento Interno de Personal del GAMLP.\n\n Seguro de que su capacidad y alto espíritu de trabajo sean puestos a favor de nuestro Municipio, aprovecho la oportunidad para desearle éxitos en el desempeño de sus funciones.',
          style: 'textDato',
          alignment: 'justify',
        },

        {
          text: '\n\n\n\n\n\n\n\n' + this.datos[0].aprobador,
          style: 'textDato',
          alignment: 'center',
        },
        {
          text:
            this.datos[0].cod_da_ap >= 37 && this.datos[0].cod_da_ap <= 45
              ? this.datos[0].nombre_da_ap
              : this.datos[0].nombre_ue_ap,
          style: 'textTitulo',
          alignment: 'center',
        },

        {
          text: '\n\n\n\n\n\n\ncc:Arch:',
          style: 'footerText',
        },
      ],

      footer: function (
        currentPage: { toString: () => string },
        pageCount: string,
      ) {
        //return currentPage.toString() + ' of ' + pageCount;
        return {
          columns: [
            {
              text: currentPage.toString() + ' de ' + pageCount,
              alignment: 'right',
              style: 'footerText',
              margin: [0, 0, 30, 0],
            },
          ],
        };
      } as any,

      styles: {
        header: {
          fontSize: 25,
          bold: true,
        },
        subheader: {
          fontSize: 12,
          bold: true,
        },
        coloredText: {
          fontSize: 10,
          bold: true,
          //color: 'gray', // Cambiar el color del texto a 'blue'
        },
        coloredTextgray: {
          fontSize: 14,
          bold: true,
          color: 'gray', // Cambiar el color del texto a 'blue'
        },
        footerText: {
          fontSize: 6,
          bold: false,
        },
        textTitulo: {
          fontSize: 10,
          bold: true,
        },
        textDato: {
          fontSize: 9,
          bold: false,
          //color: 'gray',
          opacity: 0.8,
        },
      },
      pageMargins: [60, 30, 40, 30] as any, // Márgenes: izquierda, arriba, derecha, abajo
    };
    // Generar el PDF en memoria
    const pdfDoc = this.printer.createPdfKitDocument(documentDefinition);
    // let chunks: Buffer[] = []; RARO, NO ENTIENDO POR QUE DEJO DE FUNCIONAR
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

  //SOLICITUD DE REEMPLAZO
  async generateSolReemplazo(id: number): Promise<Buffer> {
    const res = await this.datosGeneralesReporte(id);
    if (
      !res ||
      (Array.isArray(res) && res.length === 0) ||
      (typeof res === 'object' && Object.keys(res).length === 0)
    ) {
      throw new Error(
        'No se encontraron datos para la gestión y el ID proporcionados.',
      );
    }
    this.datos = res;

    //const imgUrl = 'http://localhost:3009/images/logo.png';  // Cambia la URL según tu configuración
    //ME const imgPath = 'assets/images/logo_gamlp.png';
  
    const imgPath = this.obtenerMembretadoPorGestion(
      this.datos[0].gestion_carpeta,
    );
    //console.log('imgPath seleccionado:', imgPath);

    const documentDefinition = {
      pageSize: 'LETTER' as any,
      background: function (currentPage: any, pageSize: any) {
        return {
          image: imgPath,
          width: pageSize.width,
          height: pageSize.height,
          absolutePosition: { x: 0, y: 0 },
        };
      },
      //ME watermark: { text: 'SGEO', color: 'blue', opacity: 0.1, bold: true, italics: false },

      header: {
        columns: [
          //ME { image: imgPath, width: 180, alignment: 'left' },  // Uso de la ruta de imagen directamente
          //   { image: `data:image/png;base64,${this.getImageBase64(headerImage)}`, width: 100 },
          //{ text: 'Título en Rojo', style: 'coloredText', alignment: 'left' }
          //ME { text: 'Secretaría Municipal de Infraestructura Pública', style: 'coloredText', alignment: 'left' },
          // { text: '\nInfraestructura Pública', style: 'coloredTextgray', alignment: 'left' }
        ],
      } as any,
      content: [
        {
          text:
            '\n\n\n\n\n\n\FORMULARIO SOLICITUD DE REEMPLAZO ' +
            this.datos[0].permisos +
            '\n',
          style: 'header',
          alignment: 'center',
        } as any,
        {
          text:
            this.datos[0].cod_carpeta +
            '-' +
            this.datos[0].cite_solicitud +
            '-' +
            this.datos[0].correlativo_solicitud +
            '\n\n\n',
          style: 'subheader',
          alignment: 'center',
        },
        {
          text: 'DATOS DE PROYECTO\n',
          style: 'textTitulo',
        },
        {
          table: {
            widths: ['*', 350],
            body: [
              [
                {
                  text: 'CÓDIGO:',
                  style: 'textTitulo',
                  fillColor: '#dddddd',
                  border: [false, true, false, false],
                },
                {
                  text: this.datos[0].cod_carpeta,
                  style: 'textDato',
                  fillColor: '#dddddd',
                  border: [false, true, false, false],
                },
              ],
              [
                { text: 'OBRA:', style: 'textTitulo' },
                { text: this.datos[0].desc_carpeta, style: 'textDato' },
              ],
              [
                { text: 'ZONA:', style: 'textTitulo', fillColor: '#dddddd' },
                {
                  text: this.datos[0].desc_zona_carpeta,
                  style: 'textDato',
                  fillColor: '#dddddd',
                },
              ],
              [
                { text: 'MONTO DEL PROYECTO:\n', style: 'textTitulo' },
                {
                  text: 'Bs.' + this.datos[0].total_carpeta,
                  style: 'textDato',
                },
              ],
              [
                {
                  text: 'FECHA VALIDACIÓN PROYECTO:\n',
                  style: 'textTitulo',
                  fillColor: '#dddddd',
                },
                {
                  text: this.fechaString(
                    this.datos[0].fecha_validacion_carpeta,
                  ),
                  style: 'textDato',
                  fillColor: '#dddddd',
                },
              ],
            ],
          },
          layout: 'noBorders',
        },
        {
          table: {
            widths: ['*', 330],
            body: [
              [
                { text: '\n', style: 'textTitulo' },
                { text: '\n', style: 'textDato' },
              ],
              [
                { text: '\n', style: 'textTitulo' },
                { text: '\n', style: 'textDato' },
              ],
            ],
          },
          layout: 'lightHorizontalLines',
        },
        {
          text:
            'Solicito la designación del (la) ' +
            this.datos[0].profesion_detalle +
            this.datos[0].nombre +
            ' ' +
            this.datos[0].primer_apellido +
            ' ' +
            this.datos[0].segundo_apellido +
            ' como ' +
            this.datos[0].permisos +
            ', en reemplazo del (la) ' +
            this.datos[0].persona_a_reemplazar +
            '.',
          style: 'textDato',
          alignment: 'justify',
        },
        {
          text: ['\n\n\n\n\n\n\n\n\n\n\n\n\n\n'],
        },
        {
          text: '\n',
          style: 'textDato',
          alignment: 'center',
        },
        {
          text: 'JEFE DE UNIDAD\n' + this.datos[0].nombre_da,
          style: 'textDato',
          alignment: 'center',
          bold: true,
        },
        {
          text: '\n\n\n\n\n\n\n\n\n\n\n\n\ncc:Arch.',
          style: 'footerText',
        },
      ],

      footer: function (
        currentPage: { toString: () => string },
        pageCount: string,
      ) {
        //return currentPage.toString() + ' of ' + pageCount;
        return {
          columns: [
            {
              text: currentPage.toString() + ' de ' + pageCount,
              alignment: 'right',
              style: 'footerText',
              margin: [0, 0, 30, 0],
            },
          ],
        };
      } as any,

      styles: {
        header: {
          fontSize: 16,
          bold: true,
        },
        subheader: {
          fontSize: 12,
          bold: true,
        },
        coloredText: {
          fontSize: 10,
          bold: true,
          color: 'gray', // Cambiar el color del texto a 'blue'
        },
        coloredTextgray: {
          fontSize: 14,
          bold: true,
          color: 'gray', // Cambiar el color del texto a 'blue'
        },
        footerText: {
          fontSize: 6,
          bold: false,
        },
        textTitulo: {
          fontSize: 9,
          bold: true,
        },
        textDato: {
          fontSize: 9,
          bold: false,
          //color: 'gray',
          opacity: 0.8,
        },
      },
      pageMargins: [60, 30, 40, 30] as any, // Márgenes: izquierda, arriba, derecha, abajo
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

  //GENERAR MEMORANDUM DE REEMPLAZO
  async generateMemoReemplazo(id: number): Promise<Buffer> {
    const res = await this.datosGeneralesReporte(id);

    if (
      !res ||
      (Array.isArray(res) && res.length === 0) ||
      (typeof res === 'object' && Object.keys(res).length === 0)
    ) {
      throw new Error('No se encontraron datos para el ID proporcionado');
    }
    this.datos = res;

    const headerImage = path.join(
      __dirname,
      '..',
      'assets',
      'images',
      'logo_gamlp.png',
    );
    const footerImage = path.join(
      __dirname,
      '..',
      'assets',
      'images',
      'footer.png',
    );

    const imgPath = this.obtenerMembretadoPorGestion(
      this.datos[0].gestion_carpeta,
    );
    //console.log('imgPath seleccionado:', imgPath);

    const documentDefinition = {
      pageSize: 'LETTER' as any,
      background: function (currentPage: any, pageSize: any) {
        return {
          image: imgPath,
          width: pageSize.width,
          height: pageSize.height,
          absolutePosition: { x: 0, y: 0 },
        };
      },

      header: {
        columns: [
          //ME{ image: `data:image/png;base64,${this.getImageBase64(headerImage)}`, width: 100 },
          //ME { image: imgPath, width: 180 },
          //{ text: 'Título en Rojo', style: 'coloredText', alignment: 'left' }
          // ME { text: 'Secretaría Municipal de Infraestructura Pública', style: 'coloredText', alignment: 'left' },
          // { text: '\nInfraestructura Pública', style: 'coloredTextgray', alignment: 'left' }
        ],
      } as any,
      content: [
        {
          text: '\n\n\n\nM E M O R Á N D U M',
          style: 'header',
          alignment: 'center',
        } as any,
        {
          text:
            this.datos[0].cod_carpeta +
            '-' +
            this.datos[0].cite_memo +
            '-' +
            this.datos[0].correlativo +
            '\n\n',
          style: 'subheader',
          alignment: 'center',
        },
        {
          table: {
            widths: ['*', '*'],
            body: [
              [
                {
                  border: [false, false, true, true],
                  text:
                    'GOBIERNO AUTÓNOMO MUNICIPAL DE LA PAZ\n La Paz, ' +
                    this.fechaString(this.datos[0].fecha_aprobacion),
                  style: 'textTitulo',
                  alignment: 'center',
                },
                {
                  border: [true, false, false, true],
                  text:
                    'Señor(a):\n' +
                    this.datos[0].profesion_detalle +
                    ' ' +
                    this.datos[0].nombre +
                    ' ' +
                    this.datos[0].primer_apellido +
                    ' ' +
                    this.datos[0].segundo_apellido +
                    '\nPresente.- ',
                  style: 'textTitulo',
                  alignment: 'left',
                },
              ],
            ],
          },
        },
        {
          text:
            '\nREF.: DESIGNACIÓN DE ' +
            this.datos[0].permisos +
            ' DE OBRA \n\n',
          style: 'textTitulo',
          alignment: 'center',
        },
        //TEXTO
        {
          table: {
            widths: ['*', 350],
            body: [
              [
                {
                  text: 'OBRA:',
                  style: 'textTitulo',
                  alignment: 'right',
                  fillColor: '#dddddd',
                },
                {
                  text: this.datos[0].desc_carpeta,
                  style: 'textDato',
                  alignment: 'left',
                  fillColor: '#dddddd',
                },
              ],
              [
                { text: 'CÓDIGO:\n', style: 'textTitulo', alignment: 'right' },
                { text: this.datos[0].cod_carpeta + '\n', style: 'textDato' },
              ],
              [
                {
                  text: 'ZONA:\n',
                  style: 'textTitulo',
                  alignment: 'right',
                  fillColor: '#dddddd',
                },
                {
                  text: this.datos[0].desc_zona_carpeta + '',
                  style: 'textDato',
                  fillColor: '#dddddd',
                },
              ],
              [
                {
                  text: 'MONTO DE PROYECTO:\n',
                  style: 'textTitulo',
                  alignment: 'right',
                },
                {
                  text: 'Bs' + this.datos[0].total_carpeta + '',
                  style: 'textDato',
                },
              ],
            ],
          },
          layout: 'noBorders',
        },
        {
          table: {
            widths: ['*', 330],
            body: [
              [
                { text: '', style: 'textTitulo' },
                { text: '', style: 'textDato' },
              ],
              [
                { text: '\n', style: 'textTitulo' },
                { text: '\n', style: 'textDato' },
              ],
            ],
          },
          layout: 'lightHorizontalLines',
        },
        {
          text:
            'Señor(a):\n\nMediante la presente se comunica a usted que la ' +
            (this.datos[0].cod_da_ap >= 37 && this.datos[0].cod_da_ap <= 45
              ? this.datos[0].nombre_da_ap
              : this.datos[0].nombre_ue_ap) +
            ' ha dispuesto designarle a partir de la fecha ' +
            this.datos[0].permisos +
            ' de la obra ' +
            this.datos[0].desc_carpeta +
            ', en reemplazo de (él/la) profesional ' +
            this.datos[0].persona_a_reemplazar +
            ', medida asumida con el fin de dar continuidad a los trabajos de la obra.\n\nPara el efecto, a partir de la fecha deberá ' +
            'cumplir con las funciones y responsabilidades definidas en el Reglamento de Supervisión y Fiscalización de Obras del GAMLP, Código de Ética y Reglamento Interno ' +
            'de Personal del GAMLP.\n\n Seguro de que su capacidad y alto espíritu de trabajo sean puestos a favor de nuestro Municipio, aprovecho la oportunidad para desearle éxitos en el desempeño de sus funciones.',
          style: 'textDato',
          alignment: 'justify',
        },
        {
          text: '\n\n\n\n\n\n\n\n' + this.datos[0].aprobador,
          style: 'textDato',
          alignment: 'center',
        },
        {
          text:
            this.datos[0].cod_da_ap >= 37 && this.datos[0].cod_da_ap <= 45
              ? this.datos[0].nombre_da_ap
              : this.datos[0].nombre_ue_ap,
          style: 'textTitulo',
          alignment: 'center',
        },
        {
          text: '\n\n\n\n\n\ncc:Arch.',
          style: 'footerText',
        },
      ],

      footer: function (
        currentPage: { toString: () => string },
        pageCount: string,
      ) {
        //return currentPage.toString() + ' of ' + pageCount;
        return {
          columns: [
            {
              text: currentPage.toString() + ' de ' + pageCount,
              alignment: 'right',
              style: 'footerText',
              margin: [0, 0, 30, 0],
            },
          ],
        };
      } as any,

      styles: {
        header: {
          fontSize: 25,
          bold: true,
        },
        subheader: {
          fontSize: 12,
          bold: true,
        },
        coloredText: {
          fontSize: 10,
          bold: true,
          //color: 'gray', // Cambiar el color del texto a 'blue'
        },
        coloredTextgray: {
          fontSize: 14,
          bold: true,
          color: 'gray', // Cambiar el color del texto a 'blue'
        },
        footerText: {
          fontSize: 6,
          bold: false,
        },
        textTitulo: {
          fontSize: 10,
          bold: true,
        },
        textDato: {
          fontSize: 9,
          bold: false,
          //color: 'gray',
          opacity: 0.8,
        },
      },
      pageMargins: [60, 30, 40, 30] as any, // Márgenes: izquierda, arriba, derecha, abajo
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

  //SOLICITUD DE BAJA

  async generateSolicitudBaja(id: number): Promise<Buffer> {
    const res = await this.datosGeneralesReporte(id);
    if (
      !res ||
      (Array.isArray(res) && res.length === 0) ||
      (typeof res === 'object' && Object.keys(res).length === 0)
    ) {
      throw new Error('No se encontraron datos para el ID proporcionado');
    }

    this.datos = res;
    const headerImage = path.join(
      __dirname,
      '..',
      'assets',
      'images',
      'logo_gamlp.png',
    );
    const footerImage = path.join(
      __dirname,
      '..',
      'assets',
      'images',
      'footer.png',
    );
  
    const imgPath = this.obtenerMembretadoPorGestion(
      this.datos[0].gestion_carpeta,
    );
    //console.log('imgPath seleccionado:', imgPath);

    const documentDefinition = {
      pageSize: 'LETTER' as any,
      background: function (currentPage: any, pageSize: any) {
        return {
          image: imgPath,
          width: pageSize.width,
          height: pageSize.height,
          absolutePosition: { x: 0, y: 0 },
        };
      },

      header: {
        columns: [
          // Columna del texto centrado
        ],
      } as any,

      content: [
        {
          stack: [
            {
              text:
                '\n\n\n\n\n\nFORMULARIO SOLICITUD DE BAJA ' +
                this.datos[0].permisos +
                '\n',
              style: 'header',
              alignment: 'center',
            },
          ] as any,
        } as any,
        {
          text:
            this.datos[0].cod_carpeta +
            '-' +
            this.datos[0].permisodetalle +
            '\n\n\n',
          style: 'subheader',
          alignment: 'center',
        },
        {
          text: 'DATOS DE PROYECTO\n',
          style: 'textTitulo',
        },

        {
          table: {
            widths: ['*', 350],
            body: [
              [
                {
                  text: 'CÓDIGO:',
                  style: 'textTitulo',
                  fillColor: '#dddddd',
                  border: [false, true, false, false],
                },
                {
                  text: this.datos[0].cod_carpeta,
                  style: 'textDato',
                  fillColor: '#dddddd',
                  border: [false, true, false, false],
                },
              ],
              [
                { text: 'OBRA:\n', style: 'textTitulo' },
                { text: this.datos[0].desc_carpeta + '\n', style: 'textDato' },
              ],
              [
                { text: 'ZONA:\n', style: 'textTitulo', fillColor: '#dddddd' },
                {
                  text: this.datos[0].desc_zona_carpeta + '\n',
                  style: 'textDato',
                  fillColor: '#dddddd',
                },
              ],
              [
                { text: 'MONTO DEL PROYECTO:\n', style: 'textTitulo' },
                {
                  text: 'Bs.' + this.datos[0].total_carpeta + '\n',
                  style: 'textDato',
                },
              ],
              [
                {
                  text: 'FECHA VALIDACIÓN PROYECTO:\n',
                  style: 'textTitulo',
                  fillColor: '#dddddd',
                },
                {
                  text:
                    this.fechaString(this.datos[0].fecha_validacion_carpeta) +
                    '\n',
                  style: 'textDato',
                  alignment: 'middle',
                  fillColor: '#dddddd',
                },
              ],
            ],
          },
          layout: 'noBorders',
        },
        {
          table: {
            widths: ['*', 330],
            body: [
              [
                { text: '\n', style: 'textTitulo' },
                { text: '\n', style: 'textDato' },
              ],
              [
                { text: '\n', style: 'textTitulo' },
                { text: '\n', style: 'textDato' },
              ],
            ],
          },
          layout: 'lightHorizontalLines',
        },
        {
          text: 'Señor(a):\n',
          style: 'textDato',
        },
        {
          text: [this.datos[0].aprobador + '\n\n'],
          style: 'textDato',
        },
        {
          text: 'Mediante la presente se solicita el baja en la obra señalada del siguiente profesional:\n\n',
          style: 'textDato',
        },
        {
          table: {
            widths: ['*', '*', '*'], // Distribuir columnas uniformemente
            body: [
              // Encabezados de la tabla
              [
                {
                  text: 'PROFESIÓN',
                  style: 'textTitulo',
                  fillColor: '#d9eaf7',
                },
                { text: 'NOMBRES', style: 'textTitulo', fillColor: '#d9eaf7' },
                {
                  text: 'ROL DE USUARIO',
                  style: 'textTitulo',
                  fillColor: '#d9eaf7',
                },
              ],
              // Fila de datos
              [
                { text: 'INGENIERO(A)/ARQUITECTO(A)', style: 'textDato' },
                { text: 'JOSUE MIGUEL', style: 'textDato' },
                { text: 'FISCAL/SUPERVISOR', style: 'textDato' },
              ],
            ],
          },
          layout: {
            fillColor: (
              rowIndex: number,
              node: any,
              columnIndex: number,
            ): string | null => {
              return rowIndex === 0 ? '#d9eaf7' : null; // Colorear el encabezado
            },
            /* ME hLineWidth: (i: number, node: any): number => {
              return i === 0 || i === node.table.body.length ? 2 : 1; // Línea superior e inferior gruesas
            }, */
            vLineWidth: (i: number, node: any): number => {
              return 1; // Líneas verticales delgadas
            },
            hLineColor: (i: number, node: any): string => {
              return '#000000'; // Líneas horizontales negras
            },
            vLineColor: (i: number, node: any): string => {
              return '#000000'; // Líneas verticales negras
            },
          },
        },
        {
          text: '\n\JUSTIFICACION\n',
          style: 'textTitulo',
        },
        {
          text: this.datos[0].justificacion_baja,
          style: 'textDato',
          alignment: 'justify',
        },
        {
          text: [
            { text: '\n\nFecha de solicitud: ', style: 'textTitulo' },
            {
              text: this.fechaString(this.datos[0].fecha_baja),
              style: 'textDato',
            },
            { text: '\nFecha de baja efectiva: ', style: 'textTitulo' },
            {
              text: this.fechaString(this.datos[0].fecha_efectiva),
              style: 'textDato',
            },
          ],
        },
        {
          text: ['\n\n\n\n\n\n'],
        },
        {
          text: '\n',
          style: 'textDato',
          alignment: 'center',
        },
        {
          text: 'JEFE DE UNIDAD\n' + this.datos[0].nombre_da,
          style: 'textDato',
          alignment: 'center',
          bold: true,
        },
        {
          text: ['\n\n\n\n\n\n\n\ncc:Arch:'],
          style: 'footerText',
        },
      ],

      footer: function (
        currentPage: { toString: () => string },
        pageCount: string,
      ) {
        //return currentPage.toString() + ' of ' + pageCount;
        return {
          columns: [
            {
              text: currentPage.toString() + ' de ' + pageCount,
              alignment: 'right',
              style: 'footerText',
              margin: [0, 0, 30, 0],
            },
          ],
        };
      } as any,

      styles: {
        header: {
          fontSize: 16,
          bold: true,
        },
        subheader: {
          fontSize: 12,
          bold: true,
        },
        coloredText: {
          fontSize: 10,
          bold: true,
          color: 'gray', // Cambiar el color del texto a 'blue'
        },
        coloredTextgray: {
          fontSize: 14,
          bold: true,
          color: 'gray', // Cambiar el color del texto a 'blue'
        },
        footerText: {
          fontSize: 6,
          bold: false,
        },
        textTitulo: {
          fontSize: 9,
          bold: true,
        },
        textDato: {
          fontSize: 9,
          bold: false,
          //color: 'gray',
          opacity: 0.8,
        },
      },
      pageMargins: [60, 30, 40, 30] as any, // Márgenes: izquierda, arriba, derecha, abajo
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

  //FUNCIONES PARA CONSTRUIR

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

  // FECHA EN FORMATO dd/mm/aa
  fechaFormato(iso: string): string {
    let fecha: Date;
    let isoProcesado = iso;

    if (iso === 'hoy') {
      fecha = new Date(); // Usar fecha y hora actual
    } else if (iso) {
      fecha = new Date(iso);
    } else {
      return 'Sin fecha';
    }

    if (!(fecha instanceof Date) || isNaN(fecha.getTime())) {
      console.error(
        'La cadena proporcionada no resultó en una fecha válida:',
        iso,
      );
      return '';
    }

    // 3. Extraer día, mes y año
    const day = fecha.getDate() + 1;
    const month = fecha.getMonth() + 1; // getMonth() devuelve 0-11, sumar 1
    const year = fecha.getFullYear();

    // 4. Formatear día y mes con ceros a la izquierda si es necesario (dd, mm)
    const formattedDay = String(day).padStart(2, '0');
    const formattedMonth = String(month).padStart(2, '0');

    // 5. Construir y devolver la cadena final en formato dd/mm/aaaa
    return `${formattedDay}/${formattedMonth}/${year}`;
  }
}
