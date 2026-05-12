import { Body, Controller, Get, Post } from "@nestjs/common";
import { successResponse } from "../../common/constants/api-response.constant";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("me")
  getCurrentUser() {
    return successResponse(this.userService.getCurrentUser(), "user fetched");
  }

  @Post("avatar")
  updateAvatar(@Body() payload: Record<string, unknown>) {
    return successResponse(this.userService.updateAvatar(payload), "avatar updated");
  }

  @Post("nickname")
  updateNickname(@Body() payload: Record<string, unknown>) {
    return successResponse(this.userService.updateNickname(payload), "nickname updated");
  }

  @Post("contact")
  updateContact(@Body() payload: Record<string, unknown>) {
    return successResponse(this.userService.updateContact(payload), "contact updated");
  }
}
