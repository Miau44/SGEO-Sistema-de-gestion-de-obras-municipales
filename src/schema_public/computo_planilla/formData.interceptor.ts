import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class FormDataInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    console.log('Datos del FormData:', request.body);
    console.log('Archivo:', request.file);    
    // Si el cuerpo no existe, inicializarlo
    if (!request.body) {
      request.body = {};
    }

    // Combinar los datos del FormData con el cuerpo
    const file = request.file; // Archivo
    if (file) {
      request.body.file = file; // Agregar el archivo al cuerpo
    }

    return next.handle();
  }
}