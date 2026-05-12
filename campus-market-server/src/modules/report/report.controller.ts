import { Body, Controller, Post } from "@nestjs/common";
import { successResponse } from "../../common/constants/api-response.constant";
import { ReportService } from "./report.service";

@Controller("reports")
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  createReport(@Body() payload: Record<string, unknown>) {
    return successResponse(this.reportService.createReport(payload), "report created");
  }
}
