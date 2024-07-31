import { Controller, Get, Res } from '@nestjs/common';
import { ReportService } from './reporte.service';
import { Response } from 'express';
import { Public } from 'src/common/decorators/public.decorator';


@Controller('reporte')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Public()
  @Get()
  async getReport(@Res() res: Response): Promise<void> {
   
    //const data =   await this.reportService.datosGenerales(2024,15)    
    const pdfBuffer = await this.reportService.generatePdf();
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=report.pdf',
      'Content-Length': pdfBuffer.length,      
    });
    res.send(pdfBuffer);
  }
}
