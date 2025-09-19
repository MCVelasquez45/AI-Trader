import { HttpService } from "@nestjs/axios"
import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { lastValueFrom } from "rxjs"
import { z } from "zod"

import { FeatureFlagService } from "../../feature-flags/feature-flag.service"
import { RecommendationRequestDto } from "../dto/recommendation-request.dto"

const recommendationSchema = z.object({
  decision: z.object({ direction: z.enum(["CALL", "PUT"]), strategy: z.string() }),
  contracts: z.array(z.any()),
  position: z.object({ contracts: z.number(), notional: z.number(), est_max_loss: z.number().optional() }),
  confidence: z.number(),
  rationale: z.object({}).passthrough().optional(),
  disclosure: z.string().optional()
})

@Injectable()
export class RequestRouterService {
  private readonly logger = new Logger(RequestRouterService.name)

  private readonly marketDataUrl = this.configService.get<string>("MARKET_DATA_URL", "http://localhost:7001")
  private readonly analyticsUrl = this.configService.get<string>("OPTIONS_ANALYTICS_URL", "http://localhost:7002")
  private readonly signalsUrl = this.configService.get<string>("SIGNALS_URL", "http://localhost:7003")
  private readonly recommenderUrl = this.configService.get<string>("RECOMMENDER_URL", "http://localhost:7004")
  private readonly orchestratorUrl = this.configService.get<string>("AI_ORCHESTRATOR_URL", "http://localhost:7005")

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly featureFlags: FeatureFlagService
  ) {}

  async routeRecommendation(userId: string, payload: RecommendationRequestDto) {
    const [chainSnapshot, signalSnapshot] = await Promise.all([
      this.fetchOptionsAnalytics(payload),
      this.fetchSignals(payload.symbol)
    ])

    const recommendation = await this.fetchRecommendation(chainSnapshot, signalSnapshot, payload, userId)
    const rationale = await this.fetchRationale(recommendation, signalSnapshot, payload, userId)

    const merged = { ...recommendation, rationale }
    recommendationSchema.parse(merged)
    return merged
  }

  private async fetchOptionsAnalytics(payload: RecommendationRequestDto) {
    const request$ = this.httpService.post(`${this.analyticsUrl}/screen`, payload)
    const response = await lastValueFrom(request$)
    return response.data
  }

  private async fetchSignals(symbol: string) {
    const request$ = this.httpService.get(`${this.signalsUrl}/snapshot/${symbol}`)
    const response = await lastValueFrom(request$)
    return response.data
  }

  private async fetchRecommendation(chainSnapshot: unknown, signalSnapshot: unknown, payload: RecommendationRequestDto, userId: string) {
    const request$ = this.httpService.post(`${this.recommenderUrl}/score`, {
      user_id: userId,
      market_data_url: this.marketDataUrl,
      chain_snapshot: chainSnapshot,
      signals: signalSnapshot,
      request: payload
    })
    const response = await lastValueFrom(request$)
    return response.data
  }

  private async fetchRationale(recommendation: unknown, signals: unknown, payload: RecommendationRequestDto, userId: string) {
    const ragOn = await this.featureFlags.variation("recommendation-rag", userId, true)
    if (!ragOn) {
      return { summary: "RAG disabled", layers: {} }
    }

    const request$ = this.httpService.post(`${this.orchestratorUrl}/rationale`, {
      user_id: userId,
      symbol: payload.symbol,
      recommendation,
      signals
    })
    const response = await lastValueFrom(request$)
    return response.data
  }
}
