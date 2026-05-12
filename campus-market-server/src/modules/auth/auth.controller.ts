import { Body, Controller, Get, Post } from "@nestjs/common";
import { successResponse } from "../../common/constants/api-response.constant";
import { AuthService } from "./auth.service";
import { CompleteProfileDto } from "./dto/complete-profile.dto";
import { WxLoginDto } from "./dto/wx-login.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("wx-login")
  wxLogin(@Body() payload: WxLoginDto) {
    return successResponse(this.authService.wxLogin(payload), "wechat login mock success");
  }

  @Post("complete-profile")
  completeProfile(@Body() payload: CompleteProfileDto) {
    return successResponse(this.authService.completeProfile(payload), "profile completed");
  }

  @Get("me")
  getCurrentUser() {
    return successResponse(this.authService.getCurrentUser(), "current user fetched");
  }
}
