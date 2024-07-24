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
    const data = [
      { id: 1, name: 'Producto 1', price: 100 },
      { id: 2, name: 'Producto 2', price: 200 },
    ];
    const pdfBuffer = await this.reportService.generatePdf(data);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=report.pdf',
    });
    res.send(pdfBuffer);
  }
}
