import { Module, OnModuleDestroy, OnModuleInit } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { LDClient, init } from "@launchdarkly/node-server-sdk"

import { FeatureFlagService } from "./feature-flag.service"

@Module({
  providers: [
    FeatureFlagService,
    {
      provide: LDClient,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const sdkKey = configService.get<string>("LAUNCHDARKLY_SDK_KEY")
        if (!sdkKey) {
          return null
        }
        const client = init(sdkKey)
        await client.waitForInitialization()
        return client
      }
    }
  ],
  exports: [FeatureFlagService]
})
export class FeatureFlagModule implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly client: LDClient | null) {}

  async onModuleInit() {
    if (this.client) {
      await this.client.waitForInitialization()
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.flush()
      await this.client.close()
    }
  }
}
