import { Injectable } from "@nestjs/common";
import { CompleteProfileDto } from "./dto/complete-profile.dto";
import { WxLoginDto } from "./dto/wx-login.dto";
import { UserService } from "../user/user.service";

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  wxLogin(payload: WxLoginDto) {
    const isFirstLogin = payload.code !== "existing-user";

    return {
      token: "mock-token-dev",
      isFirstLogin,
      user: isFirstLogin ? null : this.userService.getCurrentUser(),
    };
  }

  completeProfile(payload: CompleteProfileDto) {
    return {
      token: "mock-token-dev",
      user: this.userService.completeProfile({
        nickname: payload.nickname,
        gender: payload.gender,
        contactType: payload.contactType,
        contactValue: payload.contactValue,
      }),
    };
  }

  getCurrentUser() {
    return this.userService.getCurrentUser();
  }
}
