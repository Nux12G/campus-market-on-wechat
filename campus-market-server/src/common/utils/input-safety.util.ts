import { BadRequestException } from "@nestjs/common";

const SENSITIVE_WORDS = [
  "傻逼",
  "诈骗",
  "加V",
  "vx",
  "微信代购",
  "兼职刷单",
  "黄色",
  "赌博",
  "外挂",
  "代练",
];

function normalizeText(input: unknown) {
  return String(input || "").trim();
}

function assertLength(value: string, max: number, message: string) {
  if (value.length > max) {
    throw new BadRequestException(message);
  }
}

function assertRequired(value: string, message: string) {
  if (!value) {
    throw new BadRequestException(message);
  }
}

function assertNumericString(value: string, message: string) {
  if (!/^\d+$/.test(value)) {
    throw new BadRequestException(message);
  }
}

function assertPrice(value: string, message: string) {
  if (!/^\d+(\.\d{1,2})?$/.test(value)) {
    throw new BadRequestException(message);
  }
}

function assertNoSensitiveWords(value: string, message: string) {
  const lowered = value.toLowerCase();
  const hit = SENSITIVE_WORDS.find((word) => lowered.includes(word.toLowerCase()));

  if (hit) {
    throw new BadRequestException(message);
  }
}

export {
  normalizeText,
  assertLength,
  assertRequired,
  assertNumericString,
  assertPrice,
  assertNoSensitiveWords,
};
