import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets';
  import { Server } from 'socket.io';
  import { SolicitudService } from './solicitud.service';
  
  @WebSocketGateway({
    cors: {
      origin: '*',
    },
  })
  export class SolicitudGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
  
    constructor(private readonly solicitudService: SolicitudService) {}
  
    async handleConnection(client: any) {
      console.log('Cliente conectado:', client.id);
    }
  
    handleDisconnect(client: any) {
      console.log('Cliente desconectado:', client.id);
    }
  
    @SubscribeMessage('updateTaskCount')
    async handleManualUpdate(client: any, payload: { id_user: number }) {
      if (!payload || !payload.id_user) {
        console.error('Usuario no proporcionado');
        return;
      }
  
      const userId = payload.id_user;
      console.log('Actualizando tareas para usuario:', userId);
  
      const taskCounts = await this.solicitudService.getTaskCounts(userId);
      this.server.emit('tasksUpdate', taskCounts); // Emitir a todos los clientes.
    }
  }
  