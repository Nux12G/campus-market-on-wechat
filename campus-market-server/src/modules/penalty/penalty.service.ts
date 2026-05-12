import { Injectable } from "@nestjs/common";
import {
  assertLength,
  assertNoSensitiveWords,
  assertRequired,
  assertNumericString,
  normalizeText,
} from "../../common/utils/input-safety.util";

type PenaltyItem = {
  id: number;
  userNo: number;
  title: string;
  content: string;
  createdAt: string;
};

@Injectable()
export class PenaltyService {
  private nextId = 2;
  private readonly penalties: PenaltyItem[] = [
    {
      id: 1,
      userNo: 10000000,
      title: "测试处罚通知",
      content: "请勿在商品简介中发布引流或违规内容，后续再犯将限制功能。",
      createdAt: "2026-04-16T09:00:00.000Z",
    },
  ];

  createPenalty(payload: Record<string, unknown>) {
    const userNoText = normalizeText(payload.userNo);
    const title = normalizeText(payload.title);
    const content = normalizeText(payload.content);

    assertRequired(userNoText, "userNo required");
    assertNumericString(userNoText, "invalid userNo");
    assertRequired(title, "penalty title required");
    assertRequired(content, "penalty content required");
    assertLength(title, 20, "penalty title too long");
    assertLength(content, 120, "penalty content too long");
    assertNoSensitiveWords(title, "penalty title contains sensitive words");
    assertNoSensitiveWords(content, "penalty content contains sensitive words");

    const item: PenaltyItem = {
      id: this.nextId++,
      userNo: Number(userNoText),
      title,
      content,
      createdAt: new Date().toISOString(),
    };

    this.penalties.unshift(item);
    return item;
  }

  getAllPenalties() {
    return this.penalties.slice();
  }

  getUserPenalties(userNo: number) {
    return this.penalties.filter((item) => item.userNo === userNo);
  }
}
