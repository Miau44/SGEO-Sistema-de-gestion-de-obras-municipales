export class ResponseDto {
    res: string;       // Resultado en texto
    resint: number;    // Resultado en número entero
    mensaje: string;   // Mensaje descriptivo
  
    constructor(res: string, resint: number, mensaje: string) {
      this.res = res;
      this.resint = resint;
      this.mensaje = mensaje;
    }
  }
  