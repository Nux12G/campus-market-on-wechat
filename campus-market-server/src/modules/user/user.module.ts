import { Module } from "@nestjs/common";
import { SensitiveWordModule } from "../sensitive-word/sensitive-word.module";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
  imports: [SensitiveWordModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
