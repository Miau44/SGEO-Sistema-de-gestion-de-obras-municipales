import { Injectable } from '@nestjs/common';
import { HttpException } from '@nestjs/common';

@Injectable()
export class ResponseService {
  
  error(error: any, message: string = 'Internal server error', statusCode?: number) {
    let errorMessage = 'An unknown error occurred';
    let errorStatus = statusCode || 500; 

    if (error instanceof HttpException) {
      errorStatus = error.getStatus(); 
            errorMessage = error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      statusCode: errorStatus,
      message,
      data: errorMessage,
    };
  }

  success(data: any, message: string = 'Operation successful', statusCode: number = 200) {
    if (data === null || data === undefined || (Array.isArray(data) && data.length === 0) || (typeof data === 'object' && Object.keys(data).length === 0)) {
      return {
        statusCode: 204,
        message: 'Registros no encontrados.',
        data: [],
      };
    }

    return {
      statusCode,
      message,
      data,
    };
  }
}
