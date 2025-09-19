import { Inject, Injectable, Logger } from "@nestjs/common"
import { LDClient, LDFlagValue } from "launchdarkly-node-server-sdk"

@Injectable()
export class FeatureFlagService {
  private readonly logger = new Logger(FeatureFlagService.name)

  constructor(@Inject(LDClient) private readonly client: LDClient | null) {}

  async variation<T extends LDFlagValue>(flagKey: string, userKey: string, fallback: T): Promise<T> {
    if (!this.client) {
      this.logger.warn(`LaunchDarkly client not configured for flag ${flagKey}`)
      return fallback
    }

    return (await this.client.variation(flagKey, { key: userKey }, fallback)) as T
  }
}
