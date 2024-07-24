import { Injectable } from '@nestjs/common';
//import * as PdfPrinter from 'pdfmake/src/printer';
import PdfPrinter from 'pdfmake';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class ReportService {
  //pdfstyles: any;
  private readonly fonts = {
    Roboto: {
      normal: path.join(__dirname, '..', 'assets', 'fonts', 'Roboto-Regular.ttf'),
      bold: path.join(__dirname, '..', 'assets', 'fonts', 'Roboto-Medium.ttf'),
      italics: path.join(__dirname, '..', 'assets', 'fonts', 'Roboto-Italic.ttf'),
      bolditalics: path.join(__dirname, '..', 'assets', 'fonts', 'Roboto-MediumItalic.ttf'),
    },
  };

  pdfstyles: any = {
    header: { fontSize: 12, alignment: 'center', bold: true, italics: true },
    header11: { fontSize: 11, alignment: 'center', bold: true },
    titulo11: { fontSize: 11, alignment: 'left', bold: true },
    header10: { fontSize: 10, alignment: 'left', bold: false },////////
    headertitulo: { fontSize: 10, alignment: 'center', bold: true, decoration: 'underline' },
    headertitulo8: { fontSize: 8, alignment: 'center', bold: true, decoration: 'underline' },
    textParrafo: { alignment: 'justify', bold: false, fontSize: 10 },
    textTitulo: { fontSize: 10, alignment: 'justify', bold: true },
    textTituloCabezaTabla: { fontSize: 10, alignment: 'center', bold: true },
    textDato: { fontSize: 10, bold: false },
    textoPie: { alignment: 'left', bold: false, fontSize: 6 },
    textFirma: { alignment: 'center', bold: true, fontSize: 10 },
    linea: { alignment: 'center', bold: true },
  }
 

  private readonly printer = new PdfPrinter(this.fonts);
  private getImageBase64(imagePath: string): string {
    const image = fs.readFileSync(imagePath);
    return image.toString('base64');
  }

  async generatePdf(data: any): Promise<Buffer> {
    const headerImage = path.join(__dirname, '..', 'assets', 'images', 'logo_gamlp.png');
    const footerImage = path.join(__dirname, '..', 'assets', 'images', 'footer.png');

    const documentDefinition = {
     pageSize: 'LETTER' as any,      
      header: {
        columns: [
          { image: `data:image/png;base64,${this.getImageBase64(headerImage)}`, width: 100},
          { text: '', style: 'header', alignment: 'left' }
        ],
        margin: [40, 10]
      } as any,  // <- Agrega "as any" para hacer compatible el tipo
    /*  footer: (currentPage:any, pageCount:any) => {
        return {
          columns: [
            { text: `Página ${currentPage} de ${pageCount}`, alignment: 'center' },
            { image: `data:image/png;base64,${this.getImageBase64(footerImage)}`, width: 150, alignment: 'right' }
          ],
          margin: [40, 10]
        }
      } as any,    */  
    
      content: [
   

        {
          text: '\n\n\n\n\FORMULARIO DE SOLICITUD DE SUPERVISOR.\n\n\n\n',
          style: 'header', alignment: 'center'
        } as any,     
        {
          text: 'DATOS DE PROYECTO. \n\n',
          style: 'subheader',
        },  
        
        {
          table: {
            widths: ['*',400],
            body: [
            [
                {text: [ { text: 'CÓDIGO:', style: 'textTitulo' },] , fillColor: '#dddddd' ,border: [false, true, false, false]},
                {text: [ { text: 'OBN-629-2024', style: 'textDato' }], fillColor: '#dddddd', border: [false, true, false, false]}              
            ],

            [
              {text: [ { text: 'OBRA:', style: 'textTitulo' },]},
              {text: [ { text: 'RECONSTRUCCION PARQUE INFANTIL Y OBRAS COMPLEMENTARIAS CALLE SEÑOR DE MAYO Y CALLE LUIS ESPINAL CAMPS ZONA HUACATAQUI-SAMP ', style: 'textDato' }]}
            ],
            [
              {text: [ { text: 'ZONA:', style: 'textTitulo' },], fillColor: '#dddddd'},
              {text: [ { text: 'SAN JORGE', style: 'textDato' }], fillColor: '#dddddd'}
            ],
            [
              {text: [ { text: 'MONTO DEL PROYECTO:\n', style: 'textTitulo' },]},
              {text: [ { text: '19,456.255.15 \n', style: 'textDato' }]}
            ],

            ]
          },
          // fontSize: 9, bold: true,
          layout: 'noBorders'
        }, 

        {
          table: {
            widths: ['*',360],
            body: [
            [
              {text: [ { text: 'MODALIDAD DE CONTRATACIÓN:', style: 'textTitulo' },], fillColor: '#dddddd'},
              {text: [ { text: 'LICITACIÓN PÚBLICA', style: 'textDato' }], fillColor: '#dddddd'}
            ],

            [
              {text: [ { text: 'FECHA DE VALIDADCIÓN DE CARPETA:\n\n\n\n', style: 'textTitulo' },]},
              {text: [ { text: '18 DE ABRIL DE 2023\n\n\n\n', style: 'textDato'}]}
            ]

            ]
          },
          layout: 'noBorders'
        },  
        
        {
          table: {
            widths: ['*',330],
            body: [
              [
                {text: [ { text: '\n', style: 'textTitulo' },]},
                {text: [ { text: '\n', style: 'textDato' }], }
              ],[
                {text: [ { text: '\n', style: 'textTitulo' },]},
                {text: [ { text: '\n', style: 'textDato' }], }
              ],

          
            ]
          },
          layout: 'lightHorizontalLines'
        },          
        
        {
          table: {
            widths: ['*','*','*'],
            body: [
            [
              {text: [ { text: 'CUANTIA:', style: 'textTitulo' },],fillColor: '#dddddd'},
              {text: [ { text: 'TIPO DE OBRA', style: 'textTitulo' }],fillColor: '#dddddd'},
              {text: [ { text: 'FECHA DE SOLICITUD:', style: 'textTitulo' },],fillColor: '#dddddd'},

            ],

            [
              {text: [ { text: '18 DE ABRIL DE 2023\n\n', style: 'textDato'}]},
              {text: [ { text: 'FECHA DE VALIDADCIÓN DE CARPETA:\n\n', style: 'textDato' },]},
              {text: [ { text: '18 DE ABRIL DE 2023\n\n', style: 'textDato'}]}
            ],
            [
              {text: [ { text: 'SUPERVISOR SUGERIDO:', style: 'textTitulo' },],fillColor: '#dddddd'},
              {text: [ { text: 'UNIDAD EJECUTORA', style: 'textTitulo' }],fillColor: '#dddddd'},
              {text: [ { text: 'FECHA DE SOLICITUD:', style: 'textTitulo' },],fillColor: '#dddddd'},

            ],

            [
              {text: [ { text: '18 DE ABRIL DE 2023\n', style: 'textDato'}]},
              {text: [ { text: 'FECHA DE VALIDADCIÓN DE CARPETA:\n', style: 'textDato' },]},
              {text: [ { text: '18 DE ABRIL DE 2023\n', style: 'textDato'}]}
            ]            

            ]
          },
          layout: 'noBorders'
        },   
        
        
        {
          text: [
            '\n\n\n\n\n\n\nSolicitante:Jose Perez:' + '\n' + 'RPC/RPA',
          ],
          style: 'subheader',
        },        


   /*     {
          table: {
            body: [
              ['ID', 'Nombre', 'Precio'],
              ...data.map((item: any) => [item.id, item.name, item.price]),
            ],
          },
        },*/


      ],
      styles: {
        header: {
          fontSize: 14,
          bold: true, 
        },
        subheader: {
          fontSize: 11,
          bold: true,
        },
      
      textTitulo: {
        fontSize: 9,
        bold: true,
      },        
        textDato: {
          fontSize: 9,
          bold: false,
        },        
      },


      
           
    };

    const pdfDoc = this.printer.createPdfKitDocument(documentDefinition);
    let chunks: any[] = [];
    return new Promise<Buffer>((resolve, reject) => {
      pdfDoc.on('data', (chunk:any) => {
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
