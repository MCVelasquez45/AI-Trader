import { Module } from "@nestjs/common"
import { PassportModule } from "@nestjs/passport"
import { JwtModule } from "@nestjs/jwt"

import { JwtAuthGuard } from "./jwt.guard"
import { JwtStrategy } from "./jwt.strategy"
import { AuthService } from "./auth.service"

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({})
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard]
})
export class AuthModule {}
