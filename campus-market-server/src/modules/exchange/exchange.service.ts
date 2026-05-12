import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import {
  assertLength,
  assertRequired,
  normalizeText,
} from "../../common/utils/input-safety.util";
import { SensitiveWordService } from "../sensitive-word/sensitive-word.service";

type ExchangeRequest = {
  id: number;
  goodsId: number;
  goodsTitle: string;
  goodsCoverImage: string;
  buyerUserNo: number;
  buyerNickname: string;
  sellerUserNo: number;
  sellerNickname: string;
  campusName: string;
  message: string;
  status: "pending" | "approved" | "rejected";
  sellerContactType: "wechat" | "qq" | "mobile";
  sellerContactValue: string;
  processedAt: string | null;
  createdAt: string;
};

@Injectable()
export class ExchangeService {
  constructor(private readonly sensitiveWordService: SensitiveWordService) {}

  private readonly currentUserNo = 10000000;
  private nextId = 3;

  private readonly requests: ExchangeRequest[] = [
    {
      id: 1,
      goodsId: 101,
      goodsTitle: "九成新考研高数全套",
      goodsCoverImage: "https://dummyimage.com/600x600/dff4ff/2d6a8e&text=%E9%AB%98%E6%95%B0",
      buyerUserNo: 10000018,
      buyerNickname: "阿泽",
      sellerUserNo: 10000000,
      sellerNickname: "校园用户",
      campusName: "海甸校区",
      message: "想问下这套资料里笔记是否完整，如果完整我想要。",
      status: "pending",
      sellerContactType: "wechat",
      sellerContactValue: "campus_demo_wechat",
      processedAt: null,
      createdAt: "2026-04-13T10:00:00.000Z",
    },
    {
      id: 2,
      goodsId: 102,
      goodsTitle: "宿舍小风扇静音款",
      goodsCoverImage: "https://dummyimage.com/600x600/eaf8ff/2d6a8e&text=%E9%A3%8E%E6%89%87",
      buyerUserNo: 10000000,
      buyerNickname: "校园用户",
      sellerUserNo: 10000018,
      sellerNickname: "阿泽",
      campusName: "观澜湖修校区",
      message: "如果风力正常我想收，方便的话请通过。",
      status: "approved",
      sellerContactType: "wechat",
      sellerContactValue: "azhe_wechat",
      processedAt: "2026-04-13T12:00:00.000Z",
      createdAt: "2026-04-13T11:00:00.000Z",
    },
  ];

  apply(payload: Record<string, unknown>) {
    const goodsId = Number(payload.goodsId || 0);
    const sellerUserNo = Number(payload.sellerUserNo || 0);

    if (!goodsId || !sellerUserNo) {
      throw new BadRequestException("invalid exchange payload");
    }

    if (sellerUserNo === this.currentUserNo) {
      throw new BadRequestException("cannot apply own goods");
    }

    const request: ExchangeRequest = {
      id: this.nextId++,
      goodsId,
      goodsTitle: String(payload.goodsTitle || "未命名商品"),
      goodsCoverImage: String(payload.goodsCoverImage || ""),
      buyerUserNo: this.currentUserNo,
      buyerNickname: "校园用户",
      sellerUserNo,
      sellerNickname: String(payload.sellerNickname || "卖家"),
      campusName: String(payload.campusName || ""),
      message: normalizeText(payload.message || ""),
      status: "pending",
      sellerContactType: normalizeText(payload.sellerContactType || "wechat") as
        | "wechat"
        | "qq"
        | "mobile",
      sellerContactValue: normalizeText(
        payload.sellerContactValue || payload.sellerContact || "seller_contact",
      ),
      processedAt: null,
      createdAt: new Date().toISOString(),
    };

    assertRequired(request.message, "exchange message required");
    assertLength(request.message, 20, "exchange message too long");
    this.sensitiveWordService.assertSafeText(
      request.message,
      "exchange message contains sensitive words",
    );
    this.assertContact(request.sellerContactType, request.sellerContactValue);

    this.requests.unshift(request);
    return request;
  }

  getReceivedRequests() {
    return this.requests.filter((item) => item.sellerUserNo === this.currentUserNo);
  }

  getSentRequests() {
    return this.requests.filter((item) => item.buyerUserNo === this.currentUserNo);
  }

  approve(id: number) {
    const request = this.findRequest(id);
    if (request.sellerUserNo !== this.currentUserNo) {
      throw new BadRequestException("cannot process this request");
    }
    request.status = "approved";
    request.processedAt = new Date().toISOString();
    return request;
  }

  reject(id: number) {
    const request = this.findRequest(id);
    if (request.sellerUserNo !== this.currentUserNo) {
      throw new BadRequestException("cannot process this request");
    }
    request.status = "rejected";
    request.processedAt = new Date().toISOString();
    return request;
  }

  getAllRequests() {
    return this.requests.slice();
  }

  private findRequest(id: number) {
    const request = this.requests.find((item) => item.id === id);
    if (!request) {
      throw new NotFoundException("exchange request not found");
    }
    return request;
  }

  private assertContact(
    contactType: "wechat" | "qq" | "mobile",
    contactValue: string,
  ) {
    if (!["wechat", "qq", "mobile"].includes(contactType)) {
      throw new BadRequestException("invalid contact type");
    }

    assertRequired(contactValue, "contact required");

    if (contactType === "wechat") {
      if (!/^[a-zA-Z][-_a-zA-Z0-9]{4,19}$/.test(contactValue)) {
        throw new BadRequestException("invalid wechat");
      }
      return;
    }

    if (contactType === "qq") {
      if (!/^[1-9][0-9]{4,11}$/.test(contactValue)) {
        throw new BadRequestException("invalid qq");
      }
      return;
    }

    if (!/^1[3-9][0-9]{9}$/.test(contactValue)) {
      throw new BadRequestException("invalid mobile");
    }
  }
}
