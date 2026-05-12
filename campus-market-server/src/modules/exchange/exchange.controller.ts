import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { successResponse } from "../../common/constants/api-response.constant";
import { ExchangeService } from "./exchange.service";

@Controller("exchange")
export class ExchangeController {
  constructor(private readonly exchangeService: ExchangeService) {}

  @Post("apply")
  apply(@Body() payload: Record<string, unknown>) {
    return successResponse(this.exchangeService.apply(payload), "exchange request created");
  }

  @Get("received")
  getReceivedRequests() {
    return successResponse(this.exchangeService.getReceivedRequests(), "received requests fetched");
  }

  @Get("sent")
  getSentRequests() {
    return successResponse(this.exchangeService.getSentRequests(), "sent requests fetched");
  }

  @Post(":id/approve")
  approve(@Param("id") id: string) {
    return successResponse(this.exchangeService.approve(Number(id)), "exchange request approved");
  }

  @Post(":id/reject")
  reject(@Param("id") id: string) {
    return successResponse(this.exchangeService.reject(Number(id)), "exchange request rejected");
  }
}
