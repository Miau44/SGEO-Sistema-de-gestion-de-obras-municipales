import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateAvanceFisicoDto } from './dto/create-avance_fisico.dto';
import { UpdateAvanceFisicoDto } from './dto/update-avance_fisico.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AvanceFisico } from './entities/avance_fisico.entity'; 
import { DataSource, In, Repository } from 'typeorm';
import { AsociarDocumentoAvanceDto } from './dto/asociar-documento-avance.dto';
import { AvanceFisicoDocumento } from '../avance_fisico_documento/entities/avance_fisico_documento.entity';
import { Documento } from '../documento/entities/documento.entity';

@Injectable()
export class AvanceFisicoService {
  constructor(
    @InjectRepository(AvanceFisico)
    private readonly repo: Repository<AvanceFisico>,
    private readonly dataSource: DataSource,
  ) {}

  // create(createAvanceFisicoDto: CreateAvanceFisicoDto) {
  //   return 'This action adds a new avanceFisico';
  // }

  // async crearAvance(dto: CreateAvanceFisicoDto) {
  //   return this.dataSource.transaction(async (manager) => {
  //     const r = manager.getRepository(AvanceFisico);
  //     // 1) Leer actual anterior (si existe)
  //     const anterior = await r.findOne({
  //       where: { id_obra: dto.id_obra, id_estado: 1, id_estado_avance: 1 },
  //     });

  //     // 2) Regla de negocio: no bajar porcentaje salvo corrección
  //     if (anterior && Number(dto.porcentaje_obra) <= Number(anterior.porcentaje_obra)) {
  //         throw new BadRequestException('El porcentaje no puede ser menor o igual al avance actual.');
  //       }

  //     // 3) Si este nuevo será "Actual" (default = 1), desactualizar el anterior

  //     if (anterior) {
  //       await r.createQueryBuilder().update(AvanceFisico).set({ id_estado_avance: 0, fecha_modificacion: () => 'CURRENT_TIMESTAMP' })
  //         .where('id_avance_fisico = :id', { id: anterior.id_avance_fisico })
  //           .execute();
  //     }

  //     // 4) Insertar nuevo
  //     const nuevo = r.create({
  //       ...dto,
  //       id_estado_avance: 1,
  //       id_estado: 1,
  //     });
  //     return r.save(nuevo);
  //   });
  // }

  async crearAvance(dto: CreateAvanceFisicoDto) {
  return this.dataSource.transaction(async (manager) => {
    const r = manager.getRepository(AvanceFisico);
    const rol = (dto.rol_avance ?? 's') as 's'|'f';
    // 1) vigente anterior
    const anterior = await r.findOne({ where: { id_obra: dto.id_obra, id_estado: 1, id_estado_avance: 1, rol_avance: rol } });
    if (anterior && Number(dto.porcentaje_obra) <= Number(anterior.porcentaje_obra)) {
      throw new BadRequestException('El porcentaje no puede ser menor o igual al avance actual.');
    }
    // 2) desactualizar anterior
    if (anterior) {
      await r.createQueryBuilder().update(AvanceFisico)
        .set({ id_estado_avance: 0, fecha_modificacion: () => 'CURRENT_TIMESTAMP' })
        .where('id_avance_fisico = :id', { id: anterior.id_avance_fisico })
        .execute();
    }
    // 3) crear avance
    const saved = await r.save(r.create({ ...dto, rol_avance: rol, id_estado_avance: 1, id_estado: 1 }));

    // 4) 👇 asociar documentos si vinieron
    if (dto.ids_documento?.length) {
      const rDoc = manager.getRepository(Documento);
      const rRel = manager.getRepository(AvanceFisicoDocumento);

      const docs = await rDoc.findBy({ id_documento: In(dto.ids_documento) });
      if (docs.length !== dto.ids_documento.length) {
        throw new BadRequestException('Uno o más documentos no existen');
      }

      // (recomendado) coherencia de obra
      // for (const d of docs) {
      //   if (d.id_obra !== dto.id_obra) {
      //     throw new BadRequestException(`El documento ${d.id_documento} pertenece a otra obra`);
      //   }
      // }

      for (const d of docs) {
        const ya = await rRel.findOne({
          where: {
            avanceFisico: { id_avance_fisico: saved.id_avance_fisico },
            documento: { id_documento: d.id_documento },
            id_estado: 1,
          },
          relations: ['avanceFisico', 'documento'],
        });
        if (!ya) {
          await rRel.save(rRel.create({ avanceFisico: saved, documento: d, id_estado: 1 }));
        }
      }
    }

    return saved;
  });
}
  

  findAll() {
    // solo activos
    return this.repo.find({ where: { id_estado: 1 }, order: { fecha_registro: 'DESC' } });
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} avanceFisico`;
  // }

  async findOne(id: number) {
    const row = await this.repo.findOne({ where: { id_avance_fisico: id } });
    if (!row) throw new NotFoundException('Avance no encontrado');
    return row;
  }

   findActual(id_obra: number, rol?: 's' | 'f') {
    return this.repo.findOne({
       where: { id_obra, id_estado: 1, id_estado_avance: 1, ...(rol ? { rol_avance: rol } : {}) },
      order: { fecha_registro: 'DESC' },
    });
  }

  findHistorial(id_obra: number, rol?: 's' | 'f') {
    return this.repo.find({
      where: { id_obra, id_estado: 1 , ...(rol ? { rol_avance: rol } : {}) },
      order: { fecha_registro: 'DESC' },
    });
  }

  update(id: number, updateAvanceFisicoDto: UpdateAvanceFisicoDto) {
    return `This action updates a #${id} avanceFisico`;
  }

  async actualizarAvance(id: number, dto: UpdateAvanceFisicoDto) {
    return this.dataSource.transaction(async (manager) => {
      const r = manager.getRepository(AvanceFisico);
      const actual = await r.findOne({ where: { id_avance_fisico: id } });
      if (!actual) throw new NotFoundException('Avance no encontrado');
      const rol = actual.rol_avance as 's' | 'f';
      // Validar contra el vigente (si intenta bajar porcentaje)
      if (dto.porcentaje_obra !== undefined) {
        const vigente = await r.findOne({
          where: { id_obra: actual.id_obra, id_estado: 1, id_estado_avance: 1, rol_avance: rol },
        });
        if (
          vigente &&
          vigente.id_avance_fisico !== id &&
          Number(dto.porcentaje_obra) <= Number(vigente.porcentaje_obra)
        ) {
          throw new BadRequestException(
            'El porcentaje no puede ser menor o igual al avance actual.',
          );
        }
      }

      // Si se pasa a Actual, desactualizar el anterior de esa obra
      if (dto.id_estado_avance === 1) {
        await r.createQueryBuilder()
          .update(AvanceFisico)
          .set({ id_estado_avance: 0, fecha_modificacion: () => 'CURRENT_TIMESTAMP',
          })
          .where(
            'id_obra = :obra AND id_estado = 1 AND id_estado_avance = 1 AND id_avance_fisico <> :id AND rol_avance = :rol',
            { obra: actual.id_obra, id, rol },
          )
          .execute();
      }

      await r.update(id, { ...dto, fecha_modificacion: () => 'CURRENT_TIMESTAMP' as any });
      return r.findOne({ where: { id_avance_fisico: id } });
    });
  }

  async remove(id: number) {
    // borrado lógico; si borrás el actual, opcional: promover el más reciente histórico
    const row = await this.repo.findOne({ where: { id_avance_fisico: id } });
    if (!row) throw new NotFoundException('Avance no encontrado');
    await this.repo.update(id, { id_estado: 0, id_estado_avance: 0 });
    return { ok: true };
  }

    // Asocia un documento a un avance físico
    async asociarDocumento(id_avance: number, dto: AsociarDocumentoAvanceDto) {
    return this.dataSource.transaction(async (m) => {
      const rAvance = m.getRepository(AvanceFisico);
      const rDoc    = m.getRepository(Documento);
      const rRel    = m.getRepository(AvanceFisicoDocumento);

      const avance = await rAvance.findOne({ where: { id_avance_fisico: id_avance, id_estado: 1 } });
      if (!avance) throw new NotFoundException('Avance físico no encontrado');

      const doc = await rDoc.findOne({ where: { id_documento: dto.id_documento } });
      if (!doc) throw new NotFoundException('Documento no encontrado');

      // Coherencia: ambos deben ser de la misma obra
      // if (doc.id_obra !== avance.id_obra) {
      //   throw new BadRequestException('El documento pertenece a otra obra');
      // }

      // Idempotencia: si ya existe relación activa, devuélvela
      const existente = await rRel.findOne({
        where: {
          avanceFisico: { id_avance_fisico: id_avance },
          documento: { id_documento: dto.id_documento },
          id_estado: 1,
        },
        relations: ['avanceFisico', 'documento'],
      });
      if (existente) return existente;

      // Crear relación
      const rel = rRel.create({
        avanceFisico: avance,
        documento: doc,
        id_estado: 1,
      });
      return rRel.save(rel);
    });
  }

    async listarDocumentosDeAvance(id_avance: number) {
      const rRel = this.dataSource.getRepository(AvanceFisicoDocumento);
      const rels = await rRel.find({
        where: { avanceFisico: { id_avance_fisico: id_avance }, id_estado: 1 },
        relations: ['documento'],
        order: { fecha_registro: 'DESC' },
      });
      return rels.map(r => ({
        id_avance_fisico_documento: r.id_avance_fisico_documento,
        id_documento: r.documento.id_documento,
        nombre_documento: r.documento.nombre_documento,
        ruta_documento: r.documento.ruta_documento,
        id_tipo_documento: r.documento.id_tipo_documento,
        fecha_relacion: r.fecha_registro,
      }));
    }

    async detachDocumento(id_avance: number, id_documento: number) {
      const rRel = this.dataSource.getRepository(AvanceFisicoDocumento);
      const rel = await rRel.findOne({
        where: { avanceFisico: { id_avance_fisico: id_avance }, documento: { id_documento }, id_estado: 1 },
        relations: ['avanceFisico', 'documento'],
      });
      if (!rel) throw new NotFoundException('Relación no encontrada');
      await rRel.update(rel.id_avance_fisico_documento, {
        id_estado: 0,
        fecha_modificacion: () => 'CURRENT_TIMESTAMP' as any,
      });
      return { ok: true };
    } 

}