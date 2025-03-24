export class FormatoNumericoUtil {
    /**
     * Convierte un número en formato PostgreSQL (1729.34567) a formato "es-ES" (1.729,34567)
     */
    static formatearNumero(numero: any, decimales: number = 2): string {
      if (numero === null || numero === undefined || isNaN(numero)) {
        return '0';
      }
  
      let numeroFloat = parseFloat(numero);
  
      return numeroFloat.toLocaleString('es-ES', {
        minimumFractionDigits: decimales,
        maximumFractionDigits: decimales,
      });
    }
  
    /**
     * Convierte un número en formato "es-ES" (1.729,34567) a formato PostgreSQL (1729.34567)
     */
    static desformatearNumero(numero: string): number {
      if (!numero) {
        return 0;
      }
  
      let numeroLimpio = numero.replace(/\./g, '').replace(',', '.');
  
      return parseFloat(numeroLimpio);
    }
  }
  