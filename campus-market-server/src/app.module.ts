import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./modules/auth/auth.module";
import { UserModule } from "./modules/user/user.module";
import { GoodsModule } from "./modules/goods/goods.module";
import { ExchangeModule } from "./modules/exchange/exchange.module";
import { MessageModule } from "./modules/message/message.module";
import { AnnouncementModule } from "./modules/announcement/announcement.module";
import { PenaltyModule } from "./modules/penalty/penalty.module";
import { SensitiveWordModule } from "./modules/sensitive-word/sensitive-word.module";
import { ReportModule } from "./modules/report/report.module";
import { UploadModule } from "./modules/upload/upload.module";
import { AdminModule } from "./modules/admin/admin.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.dev"],
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    GoodsModule,
    ExchangeModule,
    MessageModule,
    AnnouncementModule,
    PenaltyModule,
    SensitiveWordModule,
    ReportModule,
    UploadModule,
    AdminModule,
  ],
})
export class AppModule {}
