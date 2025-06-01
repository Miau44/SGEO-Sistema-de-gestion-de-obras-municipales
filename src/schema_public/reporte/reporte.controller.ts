import { Controller, Get, Res,Query } from '@nestjs/common';
import { ReportService } from './reporte.service';
import { Response } from 'express';
import { Public } from 'src/common/decorators/public.decorator';
import { ReporteOrdenProcederService } from './reporte-orden-proceder.service';
import { ReporteActPreviasService } from './reporte-act-previas.service';
import { InformeModificacionSupervisor } from './modificacion/informe-modificacion-supervisor.service';
import { MemoOrdenCambio } from './modificacion/memo-orden-cambio.service';
import { SolicitudGarantia } from './modificacion/solicitud-garantia.service';
import { InformeModificacionFiscal } from './modificacion/informe-modificacion-fiscal.service';
import { ComputoMetrico } from './modificacion/computo-metrico.service';
import { AnexoOC } from './modificacion/anexo-oc.service';
import { PlanillaReordenamiento } from './modificacion/planilla-reordenamiento.service';

@Controller('reporte')
export class ReportController {
  constructor(private readonly reportService: ReportService,
    private readonly reporteOPService: ReporteOrdenProcederService,
    private readonly reporteAPService: ReporteActPreviasService,
    private readonly informeModificacionSupervisor: InformeModificacionSupervisor,
    private readonly memoOrdenCambio: MemoOrdenCambio,
    private readonly solicitudGarantia: SolicitudGarantia,
    private readonly informeModificacionFiscal: InformeModificacionFiscal,
    private readonly computometrico: ComputoMetrico,
    private readonly anexooc: AnexoOC,
    private readonly planillareorden: PlanillaReordenamiento,
  ) {}


//////////////////////////////////////////////MÓDULO DESIGNACIÓN/////////////////////////////////////
  @Public()
  @Get('solicitud')
  async getReport(@Res() res: Response,
  @Query('id') id: number,            //parámetro de entrada
): Promise<void> {
    const pdfBuffer = await this.reportService.generatePdf(id);    
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
  @Query('id') id: number,            //parámetro de entrada
): Promise<void> {
    const pdfBuffer = await this.reportService.generateMemo(id);    
    res.set({
      'Content-Type': 'application/pdf',
  //    'Content-Disposition': 'attachment; filename=report.pdf',
      'Content-Length': pdfBuffer.length,      
    });
    res.send(pdfBuffer);
  }



  @Public()
  @Get('solicitud-reemplazo')
  async getSolicitudReemplazo(@Res() res: Response,
  @Query('id') id: number,            //parámetro de entrada
): Promise<void> {
    const pdfBuffer = await this.reportService.generateSolReemplazo(id);    
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
  @Query('id') id: number,            //parámetro de entrada
): Promise<void> {
    const pdfBuffer = await this.reportService.generateMemoReemplazo(id);    
    res.set({
      'Content-Type': 'application/pdf',
  //    'Content-Disposition': 'attachment; filename=report.pdf',
      'Content-Length': pdfBuffer.length,      
    });
    res.send(pdfBuffer);
  }



  @Public()
  @Get('solicitud-baja')
  async getReporteSolicitudBaja(@Res() res: Response,
  @Query('id') id: number,            //parámetro de entrada
): Promise<void> {
    const pdfBuffer = await this.reportService.generateSolicitudBaja(id);    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,      
    });
    res.send(pdfBuffer);
  }


//////////////////////////////////////////////MÓDULO ACTIVIDADES PREVIAS/////////////////////////////// 

@Public()
  @Get('envio-documentacion')
  async getReporteEnvioDocumentacion(@Res() res: Response,
  @Query('id_obra') id_obra: number  //parametro de entrada

  ): Promise<void> {
    const pdfBuffer = await this.reporteAPService.generateEnvioDoc(id_obra);    
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
  @Query('id_usuario') id_usuario: number,
  @Query('id_obra') id_obra: number

): Promise<void> {
    const pdfBuffer = await this.reportService.generateInformeInicial(id_usuario, id_obra);    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,      
    });
    res.send(pdfBuffer);
  }

  
      
	      

  @Public()
    @Get('actividades_previas_fiscal')
    async getReporteActPreviasFiscal(@Res() res: Response,
    @Query('id_obra') id_obra: number,    //parametro de entrada

    ): Promise<void> {
      const pdfBuffer = await this.reporteAPService.generateInformeFISCAL(id_obra);    
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Length': pdfBuffer.length,      
      });
      res.send(pdfBuffer);
    }


//////////////////////////////////////////////MÓDULO ORDEN DE PROCEDER/////////////////////////////// 

  @Public()
 @Get('envio-doc-contrato')
 async getReporteDocumento2(@Res() res: Response,
 @Query('id_obra') id_obra: number,     //parametro de entrada
 
 ): Promise<void> {
   const pdfBuffer = await this.reporteOPService.generateDocumentoContrato(id_obra);    
   res.set({
     'Content-Type': 'application/pdf',
     'Content-Length': pdfBuffer.length,      
   });
   res.send(pdfBuffer);
 } 
 
 

 @Public()
  @Get('nota-instruccion-OrdenProceder')
  async generateInstruccionOrdenProceder(@Res() res: Response,
  @Query('id_obra') id_obra: number     //parametro de entrada
  ): Promise<void> {
    const pdfBuffer = await this.reporteOPService.generateInstruccionOrdenProceder(id_obra);    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,      
    });
    res.send(pdfBuffer);
  } 




  @Public()
  @Get('informe-Sol-Anticipo')
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
  @Get('Orden-Proceder')
  async generateOrdProcRev01(@Res() res: Response,
  @Query('id_obra') id_obra: number
  ): Promise<void> {
    const pdfBuffer = await this.reporteOPService.generateOrdenProceder(id_obra);    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,      
    });
    res.send(pdfBuffer);
  } 



  @Public()
  @Get('informe-prev-Pagos')
  async generateinfrevisionPagosREV(@Res() res: Response,
  @Query('id_obra') id_obra: number
  ): Promise<void> {
    const pdfBuffer = await this.reporteOPService.generateInformePrevPagos(id_obra);    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,      
    });
    res.send(pdfBuffer);
  } 


////////////////////////////// MODULO DE MODIFICACIONES /////////////////////////////

  @Public()
  @Get('informe-modificacion-supervisor')
  async InformeModificacionSupervisorService(@Res() res: Response,
  @Query('id_modif_pago') id_modif_pago: number
  ): Promise<void> {
    const pdfBuffer = await this.informeModificacionSupervisor.generateInformeModificacionSupervisor(id_modif_pago);    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,      
    });
    res.send(pdfBuffer);
  }

  @Public()
  @Get('memo-orden-cambio')
  async MemoOrdenCambio(@Res() res: Response,
  @Query('id_modif_pago') id_modif_pago: number
  ): Promise<void> {
    const pdfBuffer = await this.memoOrdenCambio.generateOrdenCambio(id_modif_pago);    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,      
    });
    res.send(pdfBuffer);
  }


  @Public()
  @Get('solicitud-garantia')
  async SolicitudGarantia(@Res() res: Response,
  @Query('id_modif_pago') id_modif_pago: number
  ): Promise<void> {
    const pdfBuffer = await this.solicitudGarantia.generateSolicitudGarantia(id_modif_pago);    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,      
    });
    res.send(pdfBuffer);
  }


   @Public()
  @Get('informe-modificacion-fiscal')
  async InformeModificacionFiscal(@Res() res: Response,
  @Query('id_modif_pago') id_modif_pago: number
  ): Promise<void> {
    const pdfBuffer = await this.informeModificacionFiscal.generateInformeModificacionFiscal(id_modif_pago);    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,      
    });
    res.send(pdfBuffer);
  }


   @Public()
  @Get('computo-metrico')
  async ComputoMetrico(@Res() res: Response,
  @Query('id_obra') id_obra: number,
  @Query('id_modificacion_pago') id_modificacion_pago: number
  ): Promise<void> {
    const pdfBuffer = await this.computometrico.generateComputoMetrico(id_obra, id_modificacion_pago);    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,      
    });
    res.send(pdfBuffer);
  }


  @Public()
  @Get('anexo-oc')
  async AnexoOC(@Res() res: Response,
  @Query('id_modif_pago') id_modif_pago: number
  ): Promise<void> {
    const pdfBuffer = await this.anexooc.generateAnexoOC(id_modif_pago);    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,      
    });
    res.send(pdfBuffer);
  }


  @Public()
  @Get('planilla-reordenamiento')
  async PlanillaReordenamiento(@Res() res: Response,
  @Query('id_obra') id_obra: number,
  @Query('id_modificacion_pago') id_modificacion_pago: number
  ): Promise<void> {
    const pdfBuffer = await this.planillareorden.generatePlanillaReordenamiento(id_obra, id_modificacion_pago);    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,      
    });
    res.send(pdfBuffer);
  }


}
