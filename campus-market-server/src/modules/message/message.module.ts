import { Module } from "@nestjs/common";
import { AnnouncementModule } from "../announcement/announcement.module";
import { ExchangeModule } from "../exchange/exchange.module";
import { PenaltyModule } from "../penalty/penalty.module";
import { MessageController } from "./message.controller";
import { MessageService } from "./message.service";

@Module({
  imports: [ExchangeModule, AnnouncementModule, PenaltyModule],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}
