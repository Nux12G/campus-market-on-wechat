import { Module } from "@nestjs/common";
import { AnnouncementModule } from "../announcement/announcement.module";
import { GoodsModule } from "../goods/goods.module";
import { PenaltyModule } from "../penalty/penalty.module";
import { ReportModule } from "../report/report.module";
import { SensitiveWordModule } from "../sensitive-word/sensitive-word.module";
import { UserModule } from "../user/user.module";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";

@Module({
  imports: [UserModule, GoodsModule, AnnouncementModule, SensitiveWordModule, PenaltyModule, ReportModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
