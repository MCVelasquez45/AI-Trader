import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { passportJwtSecret } from "jwks-rsa"
import { JwtFromRequestFunction } from "passport-jwt"
import { Request } from "express"

@Injectable()
export class AuthService {
  constructor(private readonly configService: ConfigService) {}

  getJwtSecretProvider() {
    const domain = this.configService.getOrThrow<string>("AUTH_JWKS_URI")
    return passportJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: domain
    })
  }

  tokenExtractor(): JwtFromRequestFunction {
    return (request: Request) => {
      const header = request.headers.authorization
      if (header?.startsWith("Bearer ")) {
        return header.replace("Bearer ", "")
      }
      const cookieToken = request.cookies?.token
      return cookieToken
    }
  }
}
