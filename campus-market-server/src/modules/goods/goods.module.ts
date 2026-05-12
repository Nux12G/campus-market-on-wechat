import { Module } from "@nestjs/common";
import { GoodsController } from "./goods.controller";
import { GoodsService } from "./goods.service";
import { SensitiveWordModule } from "../sensitive-word/sensitive-word.module";
import { UserModule } from "../user/user.module";

@Module({
  imports: [UserModule, SensitiveWordModule],
  controllers: [GoodsController],
  providers: [GoodsService],
  exports: [GoodsService],
})
export class GoodsModule {}
