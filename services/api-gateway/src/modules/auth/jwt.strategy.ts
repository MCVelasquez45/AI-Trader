import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"

import { AuthService } from "./auth.service"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService, authService: AuthService) {
    super({
      secretOrKeyProvider: authService.getJwtSecretProvider(),
      jwtFromRequest: ExtractJwt.fromExtractors([authService.tokenExtractor(), ExtractJwt.fromAuthHeaderAsBearerToken()]),
      audience: configService.get<string>("AUTH_AUDIENCE"),
      issuer: configService.get<string>("AUTH_ISSUER"),
      algorithms: ["RS256"],
      ignoreExpiration: false
    })
  }

  validate(payload: unknown) {
    return payload
  }
}
