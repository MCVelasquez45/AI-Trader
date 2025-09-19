import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler"
import { APP_GUARD } from "@nestjs/core"

import { AuthModule } from "./modules/auth/auth.module"
import { RecommendationModule } from "./modules/recommendation/recommendation.module"
import { FeatureFlagModule } from "./modules/feature-flags/feature-flag.module"

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { name: "user", ttl: 60, limit: 60 },
      { name: "symbol", ttl: 60, limit: 20 }
    ]),
    AuthModule,
    RecommendationModule,
    FeatureFlagModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule {}
