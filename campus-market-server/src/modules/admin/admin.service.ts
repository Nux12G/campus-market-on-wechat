import { Injectable } from "@nestjs/common";
import { AnnouncementService } from "../announcement/announcement.service";
import { GoodsService } from "../goods/goods.service";
import { PenaltyService } from "../penalty/penalty.service";
import { ReportService } from "../report/report.service";
import { SensitiveWordService } from "../sensitive-word/sensitive-word.service";
import { UserService } from "../user/user.service";

@Injectable()
export class AdminService {
  constructor(
    private readonly userService: UserService,
    private readonly goodsService: GoodsService,
    private readonly announcementService: AnnouncementService,
    private readonly sensitiveWordService: SensitiveWordService,
    private readonly penaltyService: PenaltyService,
    private readonly reportService: ReportService,
  ) {}

  getDashboard() {
    this.userService.assertCurrentUserIsAdmin();
    return {
      adminUserNo: this.userService.getCurrentUser().userNo,
      capabilities: ["ban_user", "force_off_shelf_goods"],
    };
  }

  getUsers() {
    this.userService.assertCurrentUserIsAdmin();
    return this.userService.getAdminUsers();
  }

  banUser(payload: Record<string, unknown>) {
    this.userService.assertCurrentUserIsAdmin();
    const result = this.userService.adminBanUser(payload);
    this.goodsService.invalidateHomeRecommendCache();
    return result;
  }

  unbanUser(payload: Record<string, unknown>) {
    this.userService.assertCurrentUserIsAdmin();
    const result = this.userService.adminUnbanUser(payload);
    this.goodsService.invalidateHomeRecommendCache();
    return result;
  }

  forceOffShelfGoods(payload: Record<string, unknown>) {
    this.userService.assertCurrentUserIsAdmin();
    return this.goodsService.adminForceOffShelfGoods(payload);
  }

  getGoodsList() {
    this.userService.assertCurrentUserIsAdmin();
    return this.goodsService.getAdminGoodsList();
  }

  getAnnouncements() {
    this.userService.assertCurrentUserIsAdmin();
    return this.announcementService.getAllAnnouncements();
  }

  createAnnouncement(payload: Record<string, unknown>) {
    this.userService.assertCurrentUserIsAdmin();
    return this.announcementService.createAnnouncement(payload);
  }

  getSensitiveWords() {
    this.userService.assertCurrentUserIsAdmin();
    return this.sensitiveWordService.getWords();
  }

  addSensitiveWord(payload: Record<string, unknown>) {
    this.userService.assertCurrentUserIsAdmin();
    return this.sensitiveWordService.addWord(payload);
  }

  getPenalties() {
    this.userService.assertCurrentUserIsAdmin();
    return this.penaltyService.getAllPenalties();
  }

  createPenalty(payload: Record<string, unknown>) {
    this.userService.assertCurrentUserIsAdmin();
    return this.penaltyService.createPenalty(payload);
  }

  getReports() {
    this.userService.assertCurrentUserIsAdmin();
    return this.reportService.getReports();
  }

  processReport(payload: Record<string, unknown>) {
    this.userService.assertCurrentUserIsAdmin();
    return this.reportService.processReport(payload);
  }
}
