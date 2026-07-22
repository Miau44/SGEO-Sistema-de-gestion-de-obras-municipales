// src/utils/cron-jobs.js
const cron = require('node-cron');
import { ficha_itemService } from '../ficha_item/ficha_item.service';
import { ContratoService } from '../../schema_public/contrato-modificatorio/contrato.service';
import { CorreoService } from 'src/schema_public/correo/correo.service';
import { LogService } from 'src/schema_public/log/log.service';

interface CronServices {
  ficha_itemservice: ficha_itemService;
  contratoservice: ContratoService;
  correoService: CorreoService;
  logService: LogService;
}

export function inicioCronJobs({ ficha_itemservice, contratoservice, correoService, logService }: CronServices) {
  console.log('Programador de tareas iniciado.');

  cron.schedule('0 0 * * *', async () => {
    console.log('Ejecutando tarea de media noche...');
     try {
      await ejecutarProceso();
    } catch (error) {
      console.error('Error general al ejecutar el cron:', error);
    }
    
  });

   cron.schedule('0 0 * * *', async () => {
    console.log('Ejecutando tarea de medianoche...');

    try {
      // se crea el registro cuando el cron se ejecuta correctamente
      await logService.create({
        id_usuario: 0,
        funcionalidad: 'CRON_GENERAL',
        mensaje: 'El cron de medianoche se ejecutó correctamente',
        parametro: JSON.stringify({
          expresion_cron: '0 0 * * *'
        }),
        respuesta: JSON.stringify({
          estado: 'INICIADO',
          fecha_ejecucion: new Date().toISOString()
        })
      });

      await ejecutarProceso();

    } catch (error) {
      console.error('Error durante la ejecución del cron:', error);
    }
  });

  // Tarea 2: Cada día a mediodía (12:00)
  // cron.schedule('0 12 * * *', () => {
  //   console.log('Ejecutando tarea de mediodía...');
  //   // Lógica de tu tarea aquí
  // });

  async function ejecutarProceso() {
    const token = await ficha_itemservice.obtenerToken();
    const ues = await ficha_itemservice.obtenerUes(2026,9684);
    
    const tkn = await contratoservice.obtenerToken();
    const contratos = await contratoservice.llenarContratosDesdeServicio(2025,9684);
    
    // ALERTAS CRONOGRAMA
    const alertas_correos = await correoService.procesarAlertasCronograma();
    console.log(alertas_correos);
    console.log('==== FIN CRON ====');
  }
}