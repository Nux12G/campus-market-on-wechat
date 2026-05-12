export class CompleteProfileDto {
  nickname!: string;
  gender!: number;
  contactType!: "wechat" | "qq" | "mobile";
  contactValue!: string;
}
