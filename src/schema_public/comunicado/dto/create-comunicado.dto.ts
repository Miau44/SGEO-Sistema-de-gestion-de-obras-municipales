export class CreateComunicadoDto {
  titulo: string;
  contenido: string;
  url?: string;
  fecha_publicacion?: Date;
  fecha_expiracion?: Date;
  id_estado: number;
}