
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Persona } from '../persona/entities/persona.entity';
import { PersonaPermiso } from '../persona_permiso/entities/persona_permiso.entity';
import { RolPermiso } from '../rol_permiso/entities/rol_permiso.entity';
@Injectable()
export class SubrolesService {
  constructor(
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
    @InjectRepository(PersonaPermiso)
    private readonly personaPermisoRepository: Repository<PersonaPermiso>,
    @InjectRepository(RolPermiso)
    private readonly rolPermisoRepository: Repository<RolPermiso>,
  ) {}

  async obtenerSubroles(id_usuario: number) {
    // Obtener el id_persona del id_usuario solo si tiene id_estado = 1
    const persona = await this.personaRepository.findOne({ where: { id_usuario, id_estado: 1 } });
    if (!persona) return { error: 'Usuario no encontrado o inactivo' };

    // Obtener los permisos de la persona con id_estado = 1
    const permisos = await this.personaPermisoRepository.find({ where: { id_persona: persona.id_persona, id_estado: 1 } });

    // Obtener los subroles con id_estado = 1
    const subroles = await Promise.all(
      permisos.map(async (permiso) => {
        const rolPermiso = await this.rolPermisoRepository.findOne({ where: { id_permiso: permiso.id_permiso, id_estado: 1 } });
        return rolPermiso ? { id_permiso: permiso.id_permiso, descripcion_rol: rolPermiso.descripcion_rol } : null;
      })
    );

    // Filtrar valores nulos
    const validSubroles = subroles.filter(sr => sr !== null);

    // Definir las variables booleanas según la lógica de subroles
    const permisos_ = validSubroles
  .filter(sr => sr !== null) // Filtra los valores nulos
  .map(sr => sr!.id_permiso); // Usa "!" para asegurar que sr no es null

  const resultado = {
    jefe_sub: permisos_.includes(85) && permisos_.includes(86), // Solo si tiene ambos permisos
    jefe_desie: permisos_.includes(86) && !permisos_.includes(85), // Solo si tiene 86 pero NO 85
    jefe_dfo: permisos_.includes(90) && !permisos_.includes(85) && !permisos_.includes(86), // No debe ser jefe_sub ni jefe_desie
    subalcalde: permisos_.includes(87) && !permisos_.includes(85) && !permisos_.includes(86) && !permisos_.includes(90), // Exclusivo
  };
  

      

    return resultado;
  }
}