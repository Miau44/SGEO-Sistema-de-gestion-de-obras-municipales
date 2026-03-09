// src/utils/cron-jobs.js
const cron = require('node-cron');
import { ficha_itemService } from '../ficha_item/ficha_item.service';
import { ContratoService } from '../../schema_public/contrato-modificatorio/contrato.service';

interface CronServices {
  ficha_itemservice: ficha_itemService;
  contratoservice: ContratoService;
}

export function inicioCronJobs({ ficha_itemservice, contratoservice }: CronServices) {
  console.log('Programador de tareas iniciado.');

  cron.schedule('0 0 * * *', async () => {
    console.log('Ejecutando tarea de media noche...');
    ejecutarProceso();
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
  }
}