import { BadRequestException, Injectable } from "@nestjs/common";
import {
  assertLength,
  assertRequired,
  normalizeText,
} from "../../common/utils/input-safety.util";
import { SensitiveWordService } from "../sensitive-word/sensitive-word.service";

type AnnouncementItem = {
  id: number;
  title: string;
  content: string;
  status: "published";
  createdAt: string;
};

@Injectable()
export class AnnouncementService {
  constructor(private readonly sensitiveWordService: SensitiveWordService) {}

  private nextId = 2;

  private readonly announcements: AnnouncementItem[] = [
    {
      id: 1,
      title: "平台公告",
      content: "请优先在同校区内完成线下交换，确保交易安全。",
      status: "published",
      createdAt: "2026-04-13T09:00:00.000Z",
    },
  ];

  getAllAnnouncements() {
    return this.announcements.slice().sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );
  }

  getPublishedAnnouncements() {
    return this.getAllAnnouncements().filter((item) => item.status === "published");
  }

  createAnnouncement(payload: Record<string, unknown>) {
    const title = normalizeText(payload.title);
    const content = normalizeText(payload.content);

    assertRequired(title, "announcement title required");
    assertRequired(content, "announcement content required");
    assertLength(title, 20, "announcement title too long");
    assertLength(content, 120, "announcement content too long");
    this.sensitiveWordService.assertSafeText(
      title,
      "announcement title contains sensitive words",
    );
    this.sensitiveWordService.assertSafeText(
      content,
      "announcement content contains sensitive words",
    );

    const announcement: AnnouncementItem = {
      id: this.nextId++,
      title,
      content,
      status: "published",
      createdAt: new Date().toISOString(),
    };

    this.announcements.unshift(announcement);
    return announcement;
  }
}
