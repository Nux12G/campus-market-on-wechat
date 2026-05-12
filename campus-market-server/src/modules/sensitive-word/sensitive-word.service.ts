import { BadRequestException, Injectable } from "@nestjs/common";
import { assertLength, assertRequired, normalizeText } from "../../common/utils/input-safety.util";

@Injectable()
export class SensitiveWordService {
  private readonly words = new Set<string>([
    "傻逼",
    "诈骗",
    "加v",
    "vx",
    "微信代购",
    "兼职刷单",
    "黄色",
    "赌博",
    "外挂",
    "代练",
  ]);

  getWords() {
    return Array.from(this.words).sort();
  }

  addWord(payload: Record<string, unknown>) {
    const word = normalizeText(payload.word);
    assertRequired(word, "sensitive word required");
    assertLength(word, 20, "sensitive word too long");

    this.words.add(word);

    return {
      word,
    };
  }

  assertSafeText(value: string, message: string) {
    const lowered = value.toLowerCase();
    const hit = this.getWords().find((word) => lowered.includes(word.toLowerCase()));

    if (hit) {
      throw new BadRequestException(message);
    }
  }
}
