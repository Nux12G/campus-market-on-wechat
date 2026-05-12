import { Injectable } from "@nestjs/common";
import { AnnouncementService } from "../announcement/announcement.service";
import { ExchangeService } from "../exchange/exchange.service";
import { PenaltyService } from "../penalty/penalty.service";

type MessageItem = {
  id: string;
  category: "received" | "result" | "sent" | "system";
  type: string;
  title: string;
  content: string;
  status: string;
  relatedId: number;
  createdAt: string;
};

@Injectable()
export class MessageService {
  constructor(
    private readonly exchangeService: ExchangeService,
    private readonly announcementService: AnnouncementService,
    private readonly penaltyService: PenaltyService,
  ) {}

  private formatContactType(type: string) {
    if (type === "qq") {
      return "QQ";
    }

    if (type === "mobile") {
      return "手机号";
    }

    return "微信";
  }

  getMessageList() {
    const requests = this.exchangeService.getAllRequests();
    const announcements = this.announcementService.getPublishedAnnouncements();
    const penalties = this.penaltyService.getUserPenalties(10000000);

    const exchangeMessages: MessageItem[] = requests
      .filter((item) => item.sellerUserNo === 10000000 || item.buyerUserNo === 10000000)
      .map((item) => {
        if (item.sellerUserNo === 10000000) {
          return {
            id: `exchange-${item.id}`,
            category: "received",
            type: "exchange_request",
            title: item.goodsTitle,
            content: `${item.buyerNickname} 想交换联系方式：${item.message}`,
            status: item.status,
            relatedId: item.id,
            createdAt: item.processedAt || item.createdAt,
          };
        }

        if (item.status === "approved") {
          return {
            id: `exchange-${item.id}`,
            category: "result",
            type: "exchange_result_success",
            title: item.goodsTitle,
            content: `卖家已同意申请，联系方式类型：${this.formatContactType(item.sellerContactType)}，联系方式：${item.sellerContactValue}`,
            status: item.status,
            relatedId: item.id,
            createdAt: item.processedAt || item.createdAt,
          };
        }

        if (item.status === "rejected") {
          return {
            id: `exchange-${item.id}`,
            category: "result",
            type: "exchange_result_rejected",
            title: item.goodsTitle,
            content: "卖家已拒绝你的联系方式申请",
            status: item.status,
            relatedId: item.id,
            createdAt: item.processedAt || item.createdAt,
          };
        }

        return {
          id: `exchange-${item.id}`,
          category: "sent",
          type: "exchange_request_sent",
          title: item.goodsTitle,
          content: "你的申请已提交，等待卖家处理",
          status: item.status,
          relatedId: item.id,
          createdAt: item.createdAt,
        };
      });

    const systemMessages: MessageItem[] = announcements
      .map((item) => ({
        id: `announcement-${item.id}`,
        category: "system" as const,
        type: "announcement",
        title: item.title,
        content: item.content,
        status: item.status,
        relatedId: item.id,
        createdAt: item.createdAt,
      }))
      .concat(
        penalties.map((item) => ({
          id: `penalty-${item.id}`,
          category: "system" as const,
          type: "penalty",
          title: item.title,
          content: item.content,
          status: "published",
          relatedId: item.id,
          createdAt: item.createdAt,
        })),
      );

    return exchangeMessages
      .concat(systemMessages)
      .sort(
        (left, right) =>
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      );
  }
}
