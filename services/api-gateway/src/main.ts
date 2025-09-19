import { NestFactory } from "@nestjs/core"
import { ValidationPipe } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import * as cookieParser from "cookie-parser"

import { AppModule } from "./app.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true })
  const configService = app.get(ConfigService)

  app.use(cookieParser())

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true
    })
  )

  const port = configService.get<number>("PORT", 4000)
  await app.listen(port)
  // eslint-disable-next-line no-console
  console.log(`API Gateway listening on ${port}`)
}

bootstrap()
