import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from "class-validator"

export enum RiskProfileDto {
  CONSERVATIVE = "conservative",
  NEUTRAL = "neutral",
  AGGRESSIVE = "aggressive"
}

export class RecommendationConstraintsDto {
  @IsOptional()
  @IsBoolean()
  earnings_window_ok?: boolean

  @IsOptional()
  @IsNumber()
  @Min(0)
  max_spread_pct?: number
}

export class RecommendationRequestDto {
  @IsString()
  @IsNotEmpty()
  symbol!: string

  @IsEnum(RiskProfileDto)
  risk_profile!: RiskProfileDto

  @IsNumber()
  @IsPositive()
  capital_usd!: number

  @IsOptional()
  constraints?: RecommendationConstraintsDto
}
