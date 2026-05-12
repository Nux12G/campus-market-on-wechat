import { BadRequestException, Injectable } from "@nestjs/common";
import {
  assertLength,
  assertNumericString,
  assertRequired,
  normalizeText,
} from "../../common/utils/input-safety.util";
import { SensitiveWordService } from "../sensitive-word/sensitive-word.service";

type UserProfile = {
  id: number;
  userNo: number;
  nickname: string;
  avatarUrl: string;
  avatarUpdatedAt: string | null;
  nicknameUpdatedAt: string | null;
  gender: number;
  contactType: "wechat" | "qq" | "mobile";
  contactValue: string;
  role: number;
  isProfileComplete: boolean;
  status?: "normal" | "banned";
};

@Injectable()
export class UserService {
  constructor(private readonly sensitiveWordService: SensitiveWordService) {}

  private readonly bannedUsers = new Map<number, { expiresAt: string | null; reason: string }>();
  private readonly mockUsers = [
    { userNo: 10000000, nickname: "校园用户", role: 9, status: "normal" },
    { userNo: 10000018, nickname: "阿泽", role: 1, status: "normal" },
    { userNo: 10000023, nickname: "Mia", role: 1, status: "normal" },
    { userNo: 10000031, nickname: "阿航", role: 1, status: "normal" },
    { userNo: 10000042, nickname: "小雨", role: 1, status: "normal" },
  ];

  private currentUser: UserProfile = {
    id: 1,
    userNo: 10000000,
    nickname: "校园用户",
    avatarUrl: "",
    avatarUpdatedAt: null,
    nicknameUpdatedAt: null,
    gender: 1,
    contactType: "wechat",
    contactValue: "campus-demo",
    role: 9,
    isProfileComplete: true,
    status: "normal",
  };

  getCurrentUser() {
    return this.currentUser;
  }

  assertCurrentUserIsAdmin() {
    if (this.currentUser.role !== 9) {
      throw new BadRequestException("admin permission required");
    }
  }

  updateAvatar(payload: Record<string, unknown>) {
    this.assertCooldown(this.currentUser.avatarUpdatedAt, "avatar update cooldown");
    this.currentUser.avatarUrl = String(payload.avatarUrl || "");
    this.currentUser.avatarUpdatedAt = new Date().toISOString();
    return this.currentUser;
  }

  updateNickname(payload: Record<string, unknown>) {
    this.assertCooldown(this.currentUser.nicknameUpdatedAt, "nickname update cooldown");
    const nickname = normalizeText(payload.nickname);
    assertRequired(nickname, "nickname required");
    assertLength(nickname, 10, "nickname too long");
    this.sensitiveWordService.assertSafeText(nickname, "nickname contains sensitive words");
    this.currentUser.nickname = nickname;
    this.currentUser.nicknameUpdatedAt = new Date().toISOString();
    return this.currentUser;
  }

  updateContact(payload: Record<string, unknown>) {
    const contactType = normalizeText(payload.contactType || this.currentUser.contactType) as
      | "wechat"
      | "qq"
      | "mobile";
    const contactValue = normalizeText(payload.contactValue || this.currentUser.contactValue);

    this.assertContact(contactType, contactValue);

    this.currentUser.contactType = contactType;
    this.currentUser.contactValue = contactValue;
    return this.currentUser;
  }

  completeProfile(payload: {
    nickname: string;
    gender: number;
    contactType: "wechat" | "qq" | "mobile";
    contactValue: string;
  }) {
    const nickname = normalizeText(payload.nickname);
    assertRequired(nickname, "nickname required");
    assertLength(nickname, 10, "nickname too long");
    this.sensitiveWordService.assertSafeText(nickname, "nickname contains sensitive words");
    this.currentUser.nickname = nickname;
    this.currentUser.gender = payload.gender;
    this.assertContact(payload.contactType, payload.contactValue);
    this.currentUser.contactType = payload.contactType;
    this.currentUser.contactValue = payload.contactValue;
    this.currentUser.isProfileComplete = true;
    return this.currentUser;
  }

  adminBanUser(payload: Record<string, unknown>) {
    const userNoText = normalizeText(payload.userNo);
    const duration = normalizeText(payload.duration || "permanent");
    const reason = normalizeText(payload.reason || "管理员封禁");

    assertRequired(userNoText, "userNo required");
    assertNumericString(userNoText, "invalid userNo");

    if (!["1d", "14d", "permanent"].includes(duration)) {
      throw new BadRequestException("invalid duration");
    }

    assertLength(reason, 30, "reason too long");
    this.sensitiveWordService.assertSafeText(reason, "reason contains sensitive words");

    const userNo = Number(userNoText);
    const expiresAt =
      duration === "1d"
        ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        : duration === "14d"
          ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
          : null;

    this.bannedUsers.set(userNo, {
      expiresAt,
      reason,
    });

    return {
      userNo,
      status: "banned",
      duration,
      expiresAt,
      reason,
    };
  }

  adminUnbanUser(payload: Record<string, unknown>) {
    const userNoText = normalizeText(payload.userNo);
    assertRequired(userNoText, "userNo required");
    assertNumericString(userNoText, "invalid userNo");

    const userNo = Number(userNoText);
    this.bannedUsers.delete(userNo);

    return {
      userNo,
      status: "normal",
    };
  }

  getAdminUsers() {
    return this.mockUsers.map((user) => {
      const record = this.bannedUsers.get(user.userNo);
      const isBanned = this.isUserBanned(user.userNo);

      return {
        ...user,
        status: isBanned ? "banned" : "normal",
        expiresAt: record ? record.expiresAt : null,
        reason: record ? record.reason : "",
      };
    });
  }

  isUserBanned(userNo: number) {
    if (userNo === this.currentUser.userNo) {
      return this.currentUser.status === "banned";
    }

    const record = this.bannedUsers.get(userNo);
    if (!record) {
      return false;
    }

    if (!record.expiresAt) {
      return true;
    }

    const expired = new Date(record.expiresAt).getTime() <= Date.now();
    if (expired) {
      this.bannedUsers.delete(userNo);
      return false;
    }

    return true;
  }

  private assertCooldown(updatedAt: string | null, message: string) {
    if (!updatedAt) {
      return;
    }

    const lastUpdatedAt = new Date(updatedAt).getTime();
    const now = Date.now();
    const diffDays = (now - lastUpdatedAt) / (1000 * 60 * 60 * 24);

    if (diffDays < 30) {
      throw new BadRequestException(message);
    }
  }

  private assertContact(
    contactType: "wechat" | "qq" | "mobile",
    contactValue: string,
  ) {
    assertRequired(contactValue, "contact required");

    if (!["wechat", "qq", "mobile"].includes(contactType)) {
      throw new BadRequestException("invalid contact type");
    }

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
