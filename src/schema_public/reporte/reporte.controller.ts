import { Controller, Get, Res,Query } from '@nestjs/common';
import { ReportService } from './reporte.service';
import { Response } from 'express';
import { Public } from 'src/common/decorators/public.decorator';


@Controller('reporte')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Public()
  @Get('solicitud')
  async getReport(@Res() res: Response,
  @Query('gestion') gestion: number, // Primer parámetro de entrada
  @Query('id') id: number,            // Segundo parámetro de entrada
): Promise<void> {
    const pdfBuffer = await this.reportService.generatePdf(gestion, id);    
    res.set({
      'Content-Type': 'application/pdf',
  //    'Content-Disposition': 'attachment; filename=report.pdf',
      'Content-Length': pdfBuffer.length,      
    });
    res.send(pdfBuffer);
  }



  @Public()
  @Get('memorandum')
  async getReporte(@Res() res: Response,
  @Query('gestion') gestion: number, // Primer parámetro de entrada
  @Query('id') id: number,            // Segundo parámetro de entrada
): Promise<void> {
    const pdfBuffer = await this.reportService.generateMemo(gestion, id);    
    res.set({
      'Content-Type': 'application/pdf',
  //    'Content-Disposition': 'attachment; filename=report.pdf',
      'Content-Length': pdfBuffer.length,      
    });
    res.send(pdfBuffer);
  }



  @Public()
  @Get('memorandum-reemplazo')
  async getReporteReemplazo(@Res() res: Response,
  @Query('gestion') gestion: number, // Primer parámetro de entrada
  @Query('id') id: number,            // Segundo parámetro de entrada
): Promise<void> {
    const pdfBuffer = await this.reportService.generateMemoReemplazo(gestion, id);    
    res.set({
      'Content-Type': 'application/pdf',
  //    'Content-Disposition': 'attachment; filename=report.pdf',
      'Content-Length': pdfBuffer.length,      
    });
    res.send(pdfBuffer);
  }


  @Public()
  @Get('envio-documentacion')
  async getReporteEnvioDocumentacion(@Res() res: Response,
  @Query('id_obra') id_obra: number, // Primer parámetro de entrada
  @Query('id_tipo') id_tipo: number,            // Segundo parámetro de entrada
): Promise<void> {
    const pdfBuffer = await this.reportService.generateEnvioDoc(id_obra, id_tipo);    
    res.set({
      'Content-Type': 'application/pdf',
  //    'Content-Disposition': 'attachment; filename=report.pdf',
      'Content-Length': pdfBuffer.length,      
    });
    res.send(pdfBuffer);
  }  

}
