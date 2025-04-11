import { PartialType } from '@nestjs/mapped-types';
import { CreateDesignacionDto } from './create-designacion.dto';
import { ApiProperty } from "@nestjs/swagger";


export class UpdateDesignacionDto extends PartialType(CreateDesignacionDto) {


}