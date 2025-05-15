import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class InformeModificacionSupervisorService {

  async generarPDF(htmlBody: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true, // o true
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // útil en Linux sin GUI
    });

    const page = await browser.newPage();

    // Construcción del HTML completo
    const htmlCompleto = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; }
            .cabecera {
              text-align: center;
              font-size: 22px;
              font-weight: bold;
              margin-bottom: 20px;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <div class="cabecera">
            Reporte de preba<br/>
            Fecha: ${new Date().toLocaleDateString()}
          </div>
          <div class="contenido">
            ${htmlBody}
          </div>
        </body>
      </html>
    `;

    

    await page.setContent(htmlCompleto, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '30mm', bottom: '20mm', left: '15mm', right: '15mm' },
    });
    await browser.close();
    const buffer = Buffer.from(pdfBuffer);
    return buffer;
  }
}
