import { Controller, Get } from "@nestjs/common";
import { successResponse } from "../../common/constants/api-response.constant";
import { MessageService } from "./message.service";

@Controller("messages")
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get("list")
  getMessageList() {
    return successResponse(this.messageService.getMessageList(), "message list fetched");
  }
}
