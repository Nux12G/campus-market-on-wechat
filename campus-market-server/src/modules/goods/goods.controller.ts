import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { successResponse } from "../../common/constants/api-response.constant";
import { GoodsService } from "./goods.service";

@Controller("goods")
export class GoodsController {
  constructor(private readonly goodsService: GoodsService) {}

  @Get("hot")
  getHotGoods() {
    return successResponse(this.goodsService.getHotGoods(), "hot goods fetched");
  }

  @Get("list")
  getGoodsList(
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
    @Query("sortBy") sortBy?: string,
    @Query("campus") campus?: string,
    @Query("sellerUserNo") sellerUserNo?: string,
  ) {
    return successResponse(
      this.goodsService.getGoodsList({
        page: Number(page),
        pageSize: Number(pageSize),
        sortBy,
        campus,
        sellerUserNo: Number(sellerUserNo),
      }),
      "goods list fetched",
    );
  }

  @Get("search")
  searchGoods(
    @Query("keyword") keyword?: string,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
    @Query("sortBy") sortBy?: string,
    @Query("campus") campus?: string,
  ) {
    return successResponse(
      this.goodsService.searchGoods({
        keyword,
        page: Number(page),
        pageSize: Number(pageSize),
        sortBy,
        campus,
      }),
      "goods search fetched",
    );
  }

  @Get("mine")
  getMyGoods() {
    return successResponse(this.goodsService.getMyGoods(), "my goods fetched");
  }

  @Post()
  createGoods(@Body() payload: Record<string, unknown>) {
    return successResponse(this.goodsService.createGoods(payload), "goods created");
  }

  @Post(":id/update")
  updateGoods(@Param("id") id: string, @Body() payload: Record<string, unknown>) {
    return successResponse(
      this.goodsService.updateGoods(Number(id), payload),
      "goods updated",
    );
  }

  @Post(":id/off-shelf")
  offShelfGoods(@Param("id") id: string) {
    return successResponse(
      this.goodsService.offShelfGoods(Number(id)),
      "goods off shelf",
    );
  }

  @Post(":id/delete")
  deleteGoods(@Param("id") id: string) {
    return successResponse(
      this.goodsService.deleteGoods(Number(id)),
      "goods deleted",
    );
  }

  @Get(":id")
  getGoodsDetail(@Param("id") id: string) {
    return successResponse(
      this.goodsService.getGoodsDetail(Number(id)),
      "goods detail fetched",
    );
  }

  @Post(":id/view")
  incrementViewCount(@Param("id") id: string) {
    return successResponse(
      this.goodsService.incrementViewCount(Number(id)),
      "goods view count updated",
    );
  }
}
