import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, Max, Min } from "class-validator";

export class UpdateCoordenadasObraDto {
  @ApiProperty({ example: -16.5001234 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitud: number;

  @ApiProperty({ example: -68.1505678 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitud: number;
}