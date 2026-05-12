import { Module } from "@nestjs/common";
import { AnnouncementService } from "./announcement.service";
import { SensitiveWordModule } from "../sensitive-word/sensitive-word.module";

@Module({
  imports: [SensitiveWordModule],
  providers: [AnnouncementService],
  exports: [AnnouncementService],
})
export class AnnouncementModule {}
