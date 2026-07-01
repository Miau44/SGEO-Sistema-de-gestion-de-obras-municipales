import { Injectable } from '@nestjs/common';
import { CreateEstructuraOrganizacionalDto } from './dto/create-estructura_organizacional.dto';
import { UpdateEstructuraOrganizacionalDto } from './dto/update-estructura_organizacional.dto';
import { ResponseService } from 'src/response.service';
import { InjectRepository } from '@nestjs/typeorm';
import { And, Any, Not, Repository } from 'typeorm';
import { EstructuraOrganizacional } from './entities/estructura_organizacional.entity';
import { EstructuraOrganizacionalNuevo } from './entities/estructura_organizacional_nuevo.entity';
import { Persona } from '../../schema_public/persona/entities/persona.entity';
import { PersonaPermiso } from 'src/schema_public/persona_permiso/entities/persona_permiso.entity';
import { EstructuraDADto } from './dto/estructura-da.dto';


@Injectable()
export class EstructuraOrganizacionalService {

  constructor(
    @InjectRepository(EstructuraOrganizacional) private tipoDocRepositorio: Repository<EstructuraOrganizacional>,
    private responseService: ResponseService,

    @InjectRepository(EstructuraOrganizacional) private EORepository: Repository<EstructuraOrganizacional>,
    @InjectRepository(EstructuraOrganizacionalNuevo) private EORepositoryNuevo: Repository<EstructuraOrganizacionalNuevo>,
    @InjectRepository(Persona) private PersonaRep: Repository<Persona>,
    @InjectRepository(PersonaPermiso) private PersonaPermisoRep: Repository<PersonaPermiso>,
  ) { }
  create(createEstructuraOrganizacionalDto: CreateEstructuraOrganizacionalDto) {
    return 'This action adds a new estructuraOrganizacional';
  }

  async findAll(gestion: number) {
    try {
      const resultado = await this.tipoDocRepositorio.find({
        where: { gestion: gestion }
      });
      return this.responseService.success(resultado, "Listado Correctamente.")

    } catch (error) {
      return this.responseService.error(error);
    }
  }


  findOne(id: number) {
    return `This action returns a #${id} estructuraOrganizacional`;
  }

  update(id: number, updateEstructuraOrganizacionalDto: UpdateEstructuraOrganizacionalDto) {
    return `This action updates a #${id} estructuraOrganizacional`;
  }

  remove(id: number) {
    return `This action removes a #${id} estructuraOrganizacional`;
  }

  async estructuraDa(estructuraDa: EstructuraDADto) {
    try {

      const estructura = await this.findAll(estructuraDa.gestion)
      const nuevoArray: any = [];
      if (estructura) {
        const datosResumidos = estructura.data.filter((item: any, index: any, self: any) => {
          return index === self.findIndex((t: any) => t.gestion === item.gestion && t.desc_cod_da === item.desc_cod_da);
        });
        if (datosResumidos) {
          for (var i = 0; i < datosResumidos.length; i++) {
            const nuevoElemento = {
              gestion: datosResumidos[i].gestion,
              cod_da: datosResumidos[i].cod_da,
              desc_cod_da: datosResumidos[i].desc_cod_da,
              nombre_da: datosResumidos[i].nombre_da,
              sigla_da: datosResumidos[i].sigla_da
            };
            nuevoArray.push(nuevoElemento);
          }
        }
      }
      const respuesta = nuevoArray
      return this.responseService.success(respuesta, "Listado Correctamente.")
    } catch (error) {
      return this.responseService.error(error);
    }
  }

  async llenarUEDesdeServicio(): Promise<void> {
    try {
      const currentYear = new Date().getFullYear();
      console.log('Iniciando el proceso de llenado de la base de datos...');
      // Consumir el servicio externo
      const url = process.env.URL_DLC +'simv2-genera-token/estructura';
      var response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          "gestion": currentYear,
          "desc_cod_da": 0,
          "desc_cod_ue": 0,
          "cod_poa": 0,
          "cod_carpeta": 0
        })
      });
      const data = await response.json();
      
      // Iterar sobre los datos y guardarlos en la base de datos
      for (const item of data.datos) {
        const nuevaEstructura = this.EORepository.create({
          gestion: item.gestion,
          cod_da: item.cod_da,
          desc_cod_da: item.desc_cod_da,
          nombre_da: item.nombre_da,
          sigla_da: item.sigla_da || null,
          cod_ue: item.cod_ue,
          desc_cod_ue: item.desc_cod_ue,
          nombre_ue: item.nombre_ue,
          sigla_ue: item.sigla_ue || null,
          id_estado: 1, // Valor por defecto
          usuario_registro: 0, // Valor por defecto
        });

        await this.EORepository.save(nuevaEstructura);
      }
      console.log('Datos insertados correctamente');
    } catch (error) {
      console.error('Error al consumir el servicio o insertar datos:', error);
    }
  }

  async cargadoPuesto(gestion: number, codigo_ue: string): Promise<any> {
    try {
      const datosSeguridad = process.env.URL_SEGURIDAD + 'listarUsuariosXcodigouo';
      var body = {
        "codigoue": codigo_ue,
        "gestion": gestion
      };
      console.log('Cuerpo de la solicitud:', body);
      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          //"idrol":  estructuraDto.idrol,
          "codigoue": "["+codigo_ue+"]",
          "gestion": gestion
        }),
      };
      const response = await fetch(datosSeguridad, options);
      const resultadoUsuarios = await response.json();
      //console.log('Resultado de usuarios del servicio de seguridad:', resultadoUsuarios.data.length);
      
      //bucle por cada usuario
      for (const usuario of resultadoUsuarios.data) {
        
          const usuarioExistente = await this.PersonaRep.findOne({
            select: { id_persona: true, usuario: true},
            where: {usuario: usuario.usuario}
          });
          if (usuarioExistente) {
            var pp = await this.PersonaPermisoRep.find({
              where: { id_persona: usuarioExistente.id_persona }
            });
            if(pp){
              if(usuario.nodos){
                //actualizar todos los registros de pp
                for (const permiso of pp) {
                  permiso.puesto = usuario.nodos[0].puesto;
                }
                var responsepp = await this.PersonaPermisoRep.save(pp);
                //console.log('Puesto actualizado para el usuario:', responsepp);
              }
              else{
                for (const permiso of pp) {
                  permiso.puesto = usuario.puesto;
                }
                var responsepp = await this.PersonaPermisoRep.save(pp);
                //console.log('El usuario no tiene nodos asignados:', usuario.usuario);
              }
            }
          }
      }
    } catch (error) {
      return this.responseService.error(error);
    }
  }
}
