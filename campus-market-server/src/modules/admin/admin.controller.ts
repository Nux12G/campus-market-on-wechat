import { Body, Controller, Get, Post } from "@nestjs/common";
import { successResponse } from "../../common/constants/api-response.constant";
import { AdminService } from "./admin.service";

@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("dashboard")
  getDashboard() {
    return successResponse(this.adminService.getDashboard(), "admin dashboard fetched");
  }

  @Get("goods")
  getGoodsList() {
    return successResponse(this.adminService.getGoodsList(), "admin goods fetched");
  }

  @Get("users")
  getUsers() {
    return successResponse(this.adminService.getUsers(), "admin users fetched");
  }

  @Get("announcements")
  getAnnouncements() {
    return successResponse(
      this.adminService.getAnnouncements(),
      "admin announcements fetched",
    );
  }

  @Get("sensitive-words")
  getSensitiveWords() {
    return successResponse(
      this.adminService.getSensitiveWords(),
      "admin sensitive words fetched",
    );
  }

  @Get("penalties")
  getPenalties() {
    return successResponse(this.adminService.getPenalties(), "admin penalties fetched");
  }

  @Get("reports")
  getReports() {
    return successResponse(this.adminService.getReports(), "admin reports fetched");
  }

  @Post("ban-user")
  banUser(@Body() payload: Record<string, unknown>) {
    return successResponse(this.adminService.banUser(payload), "user banned");
  }

  @Post("unban-user")
  unbanUser(@Body() payload: Record<string, unknown>) {
    return successResponse(this.adminService.unbanUser(payload), "user unbanned");
  }

  @Post("force-off-shelf")
  forceOffShelfGoods(@Body() payload: Record<string, unknown>) {
    return successResponse(
      this.adminService.forceOffShelfGoods(payload),
      "goods forced off shelf",
    );
  }

  @Post("announcements")
  createAnnouncement(@Body() payload: Record<string, unknown>) {
    return successResponse(
      this.adminService.createAnnouncement(payload),
      "announcement created",
    );
  }

  @Post("sensitive-words")
  addSensitiveWord(@Body() payload: Record<string, unknown>) {
    return successResponse(
      this.adminService.addSensitiveWord(payload),
      "sensitive word added",
    );
  }

  @Post("penalties")
  createPenalty(@Body() payload: Record<string, unknown>) {
    return successResponse(this.adminService.createPenalty(payload), "penalty created");
  }

  @Post("reports/process")
  processReport(@Body() payload: Record<string, unknown>) {
    return successResponse(this.adminService.processReport(payload), "report processed");
  }
}
