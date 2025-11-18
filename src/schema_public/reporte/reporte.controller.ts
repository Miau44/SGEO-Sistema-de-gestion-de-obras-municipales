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
import { InformeObraSupervisor } from './Informe_obra/informe_supervisor.service';
import { InformeObraFiscal } from './Informe_obra/informe_fiscal.service';
import { ActaProvisional } from './actas/acta_provisional.service';
import { InformeInicialService } from './actividades_previas/informe_inicial/informe_inicial.service';
import { ComputoMetricoPago } from './pagos/computo-metrico-pagos.service';
import { PlanillaPago } from './pagos/planilla-pagos.service';
import { InformePagoSupervisor } from './pagos/informe-pago-supervisor.service';
import { InformePagoFiscal } from './pagos/informe_pago_fiscal.service';
import { ResumenCertificado } from './pagos/resumen-certificado.service';
import { ActaDefinitiva } from './actas/acta_definitiva.service';
import { InformeObraSupervisor2 } from './Informe_obra/informe_supervisor2.service';
import { fichaInspeccion } from './seguimiento/ficha_inspeccion.service';

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
    private readonly informeobrasupervisor: InformeObraSupervisor,
    private readonly informeobrafiscal: InformeObraFiscal,
    private readonly actaprovisional: ActaProvisional,
    private readonly informeInicialService: InformeInicialService,
    private readonly computopago: ComputoMetricoPago,
    private readonly planillapago: PlanillaPago,
    private readonly informepagosupervisor: InformePagoSupervisor,
    private readonly informepagofiscal: InformePagoFiscal,
    private readonly resumencertificado: ResumenCertificado,
    private readonly actadefinitiva: ActaDefinitiva,
    private readonly informeobrasupervisor2: InformeObraSupervisor2,
    private readonly fichainspeccion: fichaInspeccion,

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
  @Get('informe-inicial-informe')
  async InformeInicialService(@Res() res: Response,
  @Query('id_obra') id_obra: number
  ): Promise<void> {
    const pdfBuffer = await this.informeInicialService.generateInformeInicial(id_obra);    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,      
    });
    res.send(pdfBuffer);
  }



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


  //Me comentado
  // @Public()
  // @Get('informe-inicial')
  // async getReporteInformeInicial(@Res() res: Response,
  // @Query('id_usuario') id_usuario: number,
  // @Query('id_obra') id_obra: number

  // ): Promise<void> {
  //   const pdfBuffer = await this.reportService.generateInformeInicial(id_usuario, id_obra);    
  //   res.set({
  //     'Content-Type': 'application/pdf',
  //     'Content-Length': pdfBuffer.length,      
  //   });
  //   res.send(pdfBuffer);
  // }

  
      
	      

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


   ///////////////////////// INFORME DE OBRA //////////////////////////////////
  @Public()
    @Get('informe-obra-sup')
    async InformeObrasupervisor(@Res() res: Response,
    @Query('id_obra') id_obra: number,
    @Query('id_informe') id_informe: number,
    ): Promise<void> {
      const pdfBuffer = await this.informeobrasupervisor.generateInformeObraSupervisor(id_obra, id_informe);    
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Length': pdfBuffer.length,      
      });
      res.send(pdfBuffer);
    }


    @Public()
     @Get('informe-obra-fis')
     async InformeObraFiscal(@Res() res: Response,
     @Query('id_obra') id_obra: number,
     @Query('id_informe') id_informe: number,
     ): Promise<void> {
      const pdfBuffer = await this.informeobrafiscal.generateInformeObraFiscal(id_obra, id_informe);    
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Length': pdfBuffer.length,      
      });
      res.send(pdfBuffer);
    }

 ///////////////////////// ACTAS DE ENTREGA //////////////////////////////////
  @Public()
    @Get('acta-provisional')
    async ActaProvisional(@Res() res: Response,
    @Query('id_obra') id_obra: number,
    @Query('id_informe') id_informe: number,
    ): Promise<void> {
      const pdfBuffer = await this.actaprovisional.generateActaProvisional(id_obra, id_informe);    
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Length': pdfBuffer.length,      
      });
      res.send(pdfBuffer);
    }


  @Public()
    @Get('acta-definitiva')
    async ActaDefinitiva(@Res() res: Response,
    @Query('id_obra') id_obra: number,
    @Query('id_informe') id_informe: number,
    ): Promise<void> {
      const pdfBuffer = await this.actadefinitiva.generateActaDefinitiva(id_obra, id_informe);    
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Length': pdfBuffer.length,      
      });
      res.send(pdfBuffer);
    }

  ////////////////////////////// MODULO DE PAGOS /////////////////////////////

  @Public()
    @Get('computo-metrico-pagos')
    async ComputoMetricoPago(@Res() res: Response,
    @Query('id_obra') id_obra: number,
    @Query('id_modificacion_pago') id_modificacion_pago: number
    ): Promise<void> {
      const pdfBuffer = await this.computopago.generateComputoMetricoPago(id_obra, id_modificacion_pago);    
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Length': pdfBuffer.length,      
      });
      res.send(pdfBuffer);
    }

  
  @Public()
    @Get('planilla-pagos')
    async PlanillaPago(@Res() res: Response,
    @Query('id_obra') id_obra: number,
    @Query('id_modificacion_pago') id_modificacion_pago: number
    ): Promise<void> {
      const pdfBuffer = await this.planillapago.generatePlanillaPago(id_obra, id_modificacion_pago);    
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Length': pdfBuffer.length,      
      });
      res.send(pdfBuffer);
  }


  @Public()
  @Get('informe-pago-supervisor')
  async InformePagoSupervisor(@Res() res: Response,
  @Query('id_modif_pago') id_modif_pago: number
  ): Promise<void> {
    const pdfBuffer = await this.informepagosupervisor.generateInformePagoSupervisor(id_modif_pago);    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,      
    });
    res.send(pdfBuffer);
  }


  @Public()
  @Get('informe-pago-fiscal')
  async InformePagoFiscal(@Res() res: Response,
  @Query('id_modif_pago') id_modif_pago: number
  ): Promise<void> {
    const pdfBuffer = await this.informepagofiscal.generateInformePagoFiscal(id_modif_pago);    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,      
    });
    res.send(pdfBuffer);
  }

  @Public()
  @Get('resumen-certificado')
  async ResumenCertificado(@Res() res: Response,
  @Query('id_modif_pago') id_modif_pago: number
  ): Promise<void> {
    const pdfBuffer = await this.resumencertificado.generateResumenCertificado(id_modif_pago);    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,      
    });
    res.send(pdfBuffer);
  }

///////////////////////// INFORME DE OBRA ////////////////////////////////// BORRAR
  @Public()
    @Get('informe-obra-sup2')
    async InformeObrasupervisor2(@Res() res: Response,
    @Query('id_obra') id_obra: number,
    @Query('id_informe') id_informe: number,
    ): Promise<void> {
      const pdfBuffer = await this.informeobrasupervisor2.generateInformeObraSupervisor2(id_obra, id_informe);    
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Length': pdfBuffer.length,      
      });
      res.send(pdfBuffer);
    }

///////////////////////// FICHA DE INSPECCION ////////////////////////////////// 
  @Public()
    @Get('ficha-inspeccion')
    async fichaInspeccion(@Res() res: Response,
    @Query('id_obra') id_obra: number,
    @Query('id_avance') id_avance: number,
    ): Promise<void> {
      const pdfBuffer = await this.fichainspeccion.generatefichaInspeccion(id_obra, id_avance);    
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Length': pdfBuffer.length,      
      });
      res.send(pdfBuffer);
    }


}
