import { Injectable, NotFoundException } from "@nestjs/common";
import {
  assertLength,
  assertNoSensitiveWords,
  assertNumericString,
  assertRequired,
  normalizeText,
} from "../../common/utils/input-safety.util";

type ReportItem = {
  id: number;
  goodsId: number;
  reporterUserNo: number;
  reason: string;
  content: string;
  status: "pending" | "processed";
  createdAt: string;
};

@Injectable()
export class ReportService {
  private nextId = 2;
  private readonly reports: ReportItem[] = [
    {
      id: 1,
      goodsId: 102,
      reporterUserNo: 10000000,
      reason: "疑似违规图片",
      content: "商品图片内容需要管理员进一步核查。",
      status: "pending",
      createdAt: "2026-04-16T10:00:00.000Z",
    },
  ];

  createReport(payload: Record<string, unknown>) {
    const goodsIdText = normalizeText(payload.goodsId);
    const reason = normalizeText(payload.reason);
    const content = normalizeText(payload.content);

    assertRequired(goodsIdText, "goodsId required");
    assertNumericString(goodsIdText, "invalid goodsId");
    assertRequired(reason, "report reason required");
    assertRequired(content, "report content required");
    assertLength(reason, 20, "report reason too long");
    assertLength(content, 80, "report content too long");
    assertNoSensitiveWords(reason, "report reason contains sensitive words");
    assertNoSensitiveWords(content, "report content contains sensitive words");

    const item: ReportItem = {
      id: this.nextId++,
      goodsId: Number(goodsIdText),
      reporterUserNo: 10000000,
      reason,
      content,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    this.reports.unshift(item);
    return item;
  }

  getReports() {
    return this.reports.slice();
  }

  processReport(payload: Record<string, unknown>) {
    const reportIdText = normalizeText(payload.reportId);
    assertRequired(reportIdText, "reportId required");
    assertNumericString(reportIdText, "invalid reportId");

    const report = this.reports.find((item) => item.id === Number(reportIdText));
    if (!report) {
      throw new NotFoundException("report not found");
    }

    report.status = "processed";
    return report;
  }
}
