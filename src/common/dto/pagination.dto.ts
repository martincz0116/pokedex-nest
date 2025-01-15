import { IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {
    @IsPositive()
    @IsOptional()
    @Min(1)
    limit?: number;

    @IsPositive()
    @IsOptional()
    offset?: number;

};