import { Controller, Get, Param } from '@nestjs/common';
import { SubrolesService } from './subroles.service';

@Controller('subroles')
export class SubrolesController {
  constructor(private readonly subrolesService: SubrolesService) {}

  @Get(':id_usuario')
  async obtenerSubroles(@Param('id_usuario') id_usuario: number) {
    return this.subrolesService.obtenerSubroles(id_usuario);
  }
}
