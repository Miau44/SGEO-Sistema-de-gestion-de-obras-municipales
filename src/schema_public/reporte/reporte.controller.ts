import { Controller, Get, Res,Query } from '@nestjs/common';
import { ReportService } from './reporte.service';
import { Response } from 'express';
import { Public } from 'src/common/decorators/public.decorator';
import { ReporteOrdenProcederService } from './reporte-orden-proceder.service';


@Controller('reporte')
export class ReportController {
  constructor(private readonly reportService: ReportService,
    private readonly reporteOPService: ReporteOrdenProcederService
  ) {}

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
  @Query('id_obra') id_obra: number

): Promise<void> {
    const pdfBuffer = await this.reportService.generateEnvioDoc(id_obra);    
    res.set({
      'Content-Type': 'application/pdf',
  //    'Content-Disposition': 'attachment; filename=report.pdf',
      'Content-Length': pdfBuffer.length,      
    });
    res.send(pdfBuffer);
  }  



  @Public()
  @Get('informe-inicial')
  async getReporteInformeInicial(@Res() res: Response,
  @Query('id_obra') id_obra: number
): Promise<void> {
    const pdfBuffer = await this.reportService.generateInformeInicial(id_obra);    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,      
    });
    res.send(pdfBuffer);
  }    


  @Public()
  @Get('informe-actividades')
  async getReporteInformeActividades(@Res() res: Response,
  @Query('id_obra') id_obra: number

): Promise<void> {
    const pdfBuffer = await this.reportService.generateInformeActividades(id_obra);    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,      
    });
    res.send(pdfBuffer);
  }    


  @Public()
  @Get('informe-solicitud-baja')
  async getReporteSolicitudBaja(@Res() res: Response,
  @Query('id_obra') id_obra: number

): Promise<void> {
    const pdfBuffer = await this.reportService.generateSolicitudBajaSupervisorFiscal(id_obra);    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,      
    });
    res.send(pdfBuffer);
  }    
//////////////////////////////////////////////MÓDULO ORDEN DE PROCEDER/////////////////////////////// 

  //controller formulario 14
  @Public()
  @Get('op-informe-doc-contrato2')
  async getReporteDocumento2(@Res() res: Response,
  @Query('id_obra') id_obra: number

  ): Promise<void> {
    const pdfBuffer = await this.reporteOPService.generateDocumentoContrato2(id_obra);    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,      
    });
    res.send(pdfBuffer);
  }   

  @Public()
  @Get('op-informe-Sol-Anticipo')
  async getReporteInformeSolAnticip(@Res() res: Response,
  @Query('id_obra') id_obra: number
  ): Promise<void> {
    const pdfBuffer = await this.reporteOPService.generateInformeSoliAnticipio(id_obra);    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,      
    });
    res.send(pdfBuffer);
  }   

  @Public()
  @Get('op-instrcciones-Orden-Proceder-Carta')
  async generatecartaInstruccionesOrdeProcedeRev(@Res() res: Response,
  @Query('id_obra') id_obra: number
  ): Promise<void> {
    const pdfBuffer = await this.reporteOPService.generatecartaInstruccionesOrdeProcedeRev(id_obra);    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,      
    });
    res.send(pdfBuffer);
  } 

  @Public()
  @Get('op-Orden-Proceder-REV01')
  async generateOrdProcRev01(@Res() res: Response,
  @Query('id_obra') id_obra: number
  ): Promise<void> {
    const pdfBuffer = await this.reporteOPService.generateOrdenProcederREV01(id_obra);    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,      
    });
    res.send(pdfBuffer);
  } 
  @Public()
  @Get('op-inf-revisionPagos-REV')
  async generateinfrevisionPagosREV(@Res() res: Response,
  @Query('id_obra') id_obra: number
  ): Promise<void> {
    const pdfBuffer = await this.reporteOPService.generateInformeRevisionPagos(id_obra);    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,      
    });
    res.send(pdfBuffer);
  } 
}
