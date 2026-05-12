import { Module } from "@nestjs/common";
import { ExchangeController } from "./exchange.controller";
import { ExchangeService } from "./exchange.service";
import { SensitiveWordModule } from "../sensitive-word/sensitive-word.module";

@Module({
  imports: [SensitiveWordModule],
  controllers: [ExchangeController],
  providers: [ExchangeService],
  exports: [ExchangeService],
})
export class ExchangeModule {}
