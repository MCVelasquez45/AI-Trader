import { Module } from "@nestjs/common"
import { HttpModule } from "@nestjs/axios"

import { RecommendationController } from "./recommendation.controller"
import { RequestRouterService } from "./services/request-router.service"
import { FeatureFlagModule } from "../feature-flags/feature-flag.module"

@Module({
  imports: [HttpModule.register({ timeout: 1000 }), FeatureFlagModule],
  controllers: [RecommendationController],
  providers: [RequestRouterService]
})
export class RecommendationModule {}
