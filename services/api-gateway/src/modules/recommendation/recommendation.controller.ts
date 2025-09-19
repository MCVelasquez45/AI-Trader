import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common"
import { Request } from "express"

import { JwtAuthGuard } from "../auth/jwt.guard"
import { RecommendationRequestDto } from "./dto/recommendation-request.dto"
import { RequestRouterService } from "./services/request-router.service"

@Controller({ path: "recommendations" })
export class RecommendationController {
  constructor(private readonly requestRouter: RequestRouterService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async recommend(@Req() request: Request, @Body() payload: RecommendationRequestDto) {
    const userId = String((request.user as { sub?: string } | undefined)?.sub ?? "anonymous")
    return this.requestRouter.routeRecommendation(userId, payload)
  }
}
