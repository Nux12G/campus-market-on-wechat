import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { SensitiveWordService } from "../sensitive-word/sensitive-word.service";
import { UserService } from "../user/user.service";
import {
  assertLength,
  assertNumericString,
  assertPrice,
  assertRequired,
  normalizeText,
} from "../../common/utils/input-safety.util";

type GoodsItem = {
  id: number;
  title: string;
  expectedPrice: number;
  coverImage: string;
  viewCount: number;
  sellerNickname: string;
  sellerUserNo: number;
  publishedAt: string;
  updatedAt?: string;
  campusTag: string;
  campusName: string;
  description: string;
  shelfLifeText: string;
  images: string[];
  reviewStatus?: "approved" | "pending" | "rejected";
  status?: "on_sale" | "off_shelf" | "deleted";
};

type GoodsQuery = {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  keyword?: string;
  campus?: string;
  sellerUserNo?: number;
};

@Injectable()
export class GoodsService {
  constructor(
    private readonly userService: UserService,
    private readonly sensitiveWordService: SensitiveWordService,
  ) {}

  private readonly homeRecommendWindowMs = 2 * 60 * 60 * 1000;
  private readonly campusOptions = [
    "海甸校区",
    "观澜湖修校区",
    "城西校区",
    "儋州校区",
  ];

  private readonly myGoodsIds = new Set<number>([101, 105, 110]);
  private homeRecommendCache: { expiresAt: number; list: GoodsItem[] } | null = null;

  private readonly mockGoods: GoodsItem[] = [
    {
      id: 101,
      title: "九成新考研高数全套",
      expectedPrice: 58,
      coverImage: "https://dummyimage.com/600x600/dff4ff/2d6a8e&text=%E9%AB%98%E6%95%B0",
      viewCount: 286,
      sellerNickname: "校园用户",
      sellerUserNo: 10000000,
      publishedAt: "2026-04-10T15:30:00.000Z",
      campusTag: "教材资料",
      campusName: "海甸校区",
      description: "适合考研冲刺阶段，笔记完整，只有少量划线，整套一起出。",
      shelfLifeText: "无",
      images: [
        "https://dummyimage.com/900x900/dff4ff/2d6a8e&text=%E9%AB%98%E6%95%B01",
        "https://dummyimage.com/900x900/eaf8ff/2d6a8e&text=%E9%AB%98%E6%95%B02",
      ],
    },
    {
      id: 102,
      title: "宿舍小风扇静音款",
      expectedPrice: 35,
      coverImage: "https://dummyimage.com/600x600/eaf8ff/2d6a8e&text=%E9%A3%8E%E6%89%87",
      viewCount: 265,
      sellerNickname: "阿泽",
      sellerUserNo: 10000018,
      publishedAt: "2026-04-09T09:20:00.000Z",
      campusTag: "宿舍电器",
      campusName: "观澜湖修校区",
      description: "夏天宿舍神器，风力正常，支持 USB 供电，运行声音比较轻。",
      shelfLifeText: "无",
      images: [
        "https://dummyimage.com/900x900/eaf8ff/2d6a8e&text=%E9%A3%8E%E6%89%871",
        "https://dummyimage.com/900x900/f4fbff/2d6a8e&text=%E9%A3%8E%E6%89%872",
      ],
    },
    {
      id: 103,
      title: "大学英语四六级词汇书",
      expectedPrice: 20,
      coverImage: "https://dummyimage.com/600x600/f4fbff/2d6a8e&text=%E8%AF%8D%E6%B1%87",
      viewCount: 249,
      sellerNickname: "Mia",
      sellerUserNo: 10000023,
      publishedAt: "2026-04-08T12:00:00.000Z",
      campusTag: "教材资料",
      campusName: "城西校区",
      description: "四六级备考常用词汇书，保存较好，适合大一大二阶段复习。",
      shelfLifeText: "无",
      images: [
        "https://dummyimage.com/900x900/f4fbff/2d6a8e&text=%E8%AF%8D%E6%B1%871",
      ],
    },
    {
      id: 104,
      title: "二手羽毛球拍一副",
      expectedPrice: 88,
      coverImage: "https://dummyimage.com/600x600/dff4ff/2d6a8e&text=%E7%90%83%E6%8B%8D",
      viewCount: 224,
      sellerNickname: "阿航",
      sellerUserNo: 10000031,
      publishedAt: "2026-04-10T07:10:00.000Z",
      campusTag: "运动器材",
      campusName: "儋州校区",
      description: "适合日常训练，拍线状态良好，随拍套一起出。",
      shelfLifeText: "无",
      images: [
        "https://dummyimage.com/900x900/dff4ff/2d6a8e&text=%E7%90%83%E6%8B%8D1",
        "https://dummyimage.com/900x900/eef9ff/2d6a8e&text=%E7%90%83%E6%8B%8D2",
      ],
    },
    {
      id: 105,
      title: "可折叠书桌收纳架",
      expectedPrice: 42,
      coverImage: "https://dummyimage.com/600x600/e8f8ff/2d6a8e&text=%E6%94%B6%E7%BA%B3",
      viewCount: 213,
      sellerNickname: "校园用户",
      sellerUserNo: 10000000,
      publishedAt: "2026-04-07T17:45:00.000Z",
      campusTag: "宿舍好物",
      campusName: "海甸校区",
      description: "适合宿舍桌面整理，收纳文具和小摆件都很方便。",
      shelfLifeText: "无",
      images: [
        "https://dummyimage.com/900x900/e8f8ff/2d6a8e&text=%E6%94%B6%E7%BA%B31",
      ],
    },
    {
      id: 106,
      title: "小米充电宝 10000mAh",
      expectedPrice: 49,
      coverImage: "https://dummyimage.com/600x600/f3fbff/2d6a8e&text=%E5%85%85%E7%94%B5%E5%AE%9D",
      viewCount: 208,
      sellerNickname: "小雨",
      sellerUserNo: 10000042,
      publishedAt: "2026-04-09T20:18:00.000Z",
      campusTag: "数码配件",
      campusName: "观澜湖修校区",
      description: "正常使用无鼓包，带一根短数据线，适合日常通勤充电。",
      shelfLifeText: "无",
      images: [
        "https://dummyimage.com/900x900/f3fbff/2d6a8e&text=%E5%85%85%E7%94%B5%E5%AE%9D1",
      ],
    },
    {
      id: 107,
      title: "8成新台灯护眼版",
      expectedPrice: 30,
      coverImage: "https://dummyimage.com/600x600/eaf8ff/2d6a8e&text=%E5%8F%B0%E7%81%AF",
      viewCount: 195,
      sellerNickname: "北北",
      sellerUserNo: 10000047,
      publishedAt: "2026-04-06T11:05:00.000Z",
      campusTag: "宿舍电器",
      campusName: "城西校区",
      description: "亮度可调，夜间学习够用，底座稳，插电即用。",
      shelfLifeText: "无",
      images: [
        "https://dummyimage.com/900x900/eaf8ff/2d6a8e&text=%E5%8F%B0%E7%81%AF1",
      ],
    },
    {
      id: 108,
      title: "编程入门书 3 本打包",
      expectedPrice: 66,
      coverImage: "https://dummyimage.com/600x600/dff4ff/2d6a8e&text=%E7%BC%96%E7%A8%8B",
      viewCount: 182,
      sellerNickname: "Lemon",
      sellerUserNo: 10000051,
      publishedAt: "2026-04-10T03:36:00.000Z",
      campusTag: "教材资料",
      campusName: "儋州校区",
      description: "适合大一新生入门，包含 JavaScript 和 Python 基础读物。",
      shelfLifeText: "无",
      images: [
        "https://dummyimage.com/900x900/dff4ff/2d6a8e&text=%E7%BC%96%E7%A8%8B1",
      ],
    },
    {
      id: 109,
      title: "寝室懒人沙发垫",
      expectedPrice: 39,
      coverImage: "https://dummyimage.com/600x600/eef9ff/2d6a8e&text=%E6%B2%99%E5%8F%91",
      viewCount: 173,
      sellerNickname: "小七",
      sellerUserNo: 10000056,
      publishedAt: "2026-04-05T14:10:00.000Z",
      campusTag: "宿舍好物",
      campusName: "海甸校区",
      description: "午休和刷课都很舒服，拆洗方便，搬宿舍也不占地方。",
      shelfLifeText: "无",
      images: [
        "https://dummyimage.com/900x900/eef9ff/2d6a8e&text=%E6%B2%99%E5%8F%911",
      ],
    },
    {
      id: 110,
      title: "机械键盘青轴 87键",
      expectedPrice: 128,
      coverImage: "https://dummyimage.com/600x600/e6f7ff/2d6a8e&text=%E9%94%AE%E7%9B%98",
      viewCount: 166,
      sellerNickname: "校园用户",
      sellerUserNo: 10000000,
      publishedAt: "2026-04-08T19:40:00.000Z",
      campusTag: "数码配件",
      campusName: "观澜湖修校区",
      description: "灯效正常，键帽完整，适合宿舍写代码和游戏使用。",
      shelfLifeText: "无",
      images: [
        "https://dummyimage.com/900x900/e6f7ff/2d6a8e&text=%E9%94%AE%E7%9B%981",
      ],
    },
    {
      id: 111,
      title: "高颜值保温杯 500ml",
      expectedPrice: 25,
      coverImage: "https://dummyimage.com/600x600/f4fbff/2d6a8e&text=%E6%9D%AF%E5%AD%90",
      viewCount: 152,
      sellerNickname: "南希",
      sellerUserNo: 10000066,
      publishedAt: "2026-04-07T08:25:00.000Z",
      campusTag: "日用百货",
      campusName: "城西校区",
      description: "外观干净，保温效果还可以，适合日常带去教室。",
      shelfLifeText: "无",
      images: [
        "https://dummyimage.com/900x900/f4fbff/2d6a8e&text=%E6%9D%AF%E5%AD%901",
      ],
    },
    {
      id: 112,
      title: "课程设计绘图板 A3",
      expectedPrice: 44,
      coverImage: "https://dummyimage.com/600x600/eaf8ff/2d6a8e&text=%E7%BB%98%E5%9B%BE",
      viewCount: 145,
      sellerNickname: "阿棠",
      sellerUserNo: 10000071,
      publishedAt: "2026-04-04T16:30:00.000Z",
      campusTag: "学习工具",
      campusName: "儋州校区",
      description: "工科课程设计用过，边角有轻微磨损，功能正常。",
      shelfLifeText: "无",
      images: [
        "https://dummyimage.com/900x900/eaf8ff/2d6a8e&text=%E7%BB%98%E5%9B%BE1",
      ],
    },
    {
      id: 113,
      title: "考公行测题库资料",
      expectedPrice: 52,
      coverImage: "https://dummyimage.com/600x600/dff4ff/2d6a8e&text=%E8%80%83%E5%85%AC",
      viewCount: 139,
      sellerNickname: "Yuki",
      sellerUserNo: 10000075,
      publishedAt: "2026-04-03T10:12:00.000Z",
      campusTag: "教材资料",
      campusName: "海甸校区",
      description: "纸质资料较全，适合备考初期系统刷题。",
      shelfLifeText: "无",
      images: [
        "https://dummyimage.com/900x900/dff4ff/2d6a8e&text=%E8%80%83%E5%85%AC1",
      ],
    },
    {
      id: 114,
      title: "宿舍迷你加湿器",
      expectedPrice: 28,
      coverImage: "https://dummyimage.com/600x600/edfaff/2d6a8e&text=%E5%8A%A0%E6%B9%BF%E5%99%A8",
      viewCount: 128,
      sellerNickname: "晨晨",
      sellerUserNo: 10000083,
      publishedAt: "2026-04-06T21:50:00.000Z",
      campusTag: "宿舍电器",
      campusName: "观澜湖修校区",
      description: "支持夜灯模式，适合北方宿舍秋冬使用，小巧不占位。",
      shelfLifeText: "无",
      images: [
        "https://dummyimage.com/900x900/edfaff/2d6a8e&text=%E5%8A%A0%E6%B9%BF%E5%99%A81",
      ],
    },
  ];

  getCampusOptions() {
    return this.campusOptions;
  }

  getHotGoods() {
    const now = Date.now();

    if (this.homeRecommendCache && this.homeRecommendCache.expiresAt > now) {
      return this.homeRecommendCache.list;
    }

    const visibleGoods = this.getVisibleGoods();
    const hotGoods = this.sortGoods(visibleGoods, "viewCount");
    const latestGoods = this.sortGoods(visibleGoods, "latest");
    const pickedIds = new Set<number>();

    const topMix: GoodsItem[] = [];

    hotGoods.slice(0, 2).forEach((item) => {
      if (!pickedIds.has(item.id)) {
        topMix.push(this.withRecommendTag(item, "hot"));
        pickedIds.add(item.id);
      }
    });

    latestGoods.slice(0, 2).forEach((item) => {
      if (!pickedIds.has(item.id)) {
        topMix.push(this.withRecommendTag(item, "new"));
        pickedIds.add(item.id);
      }
    });

    hotGoods.forEach((item) => {
      if (!pickedIds.has(item.id) && topMix.length < 4) {
        topMix.push(this.withRecommendTag(item, "hot"));
        pickedIds.add(item.id);
      }
    });

    const restList: GoodsItem[] = [];
    hotGoods.forEach((item) => {
      if (!pickedIds.has(item.id) && topMix.length + restList.length < 8) {
        restList.push(this.withRecommendTag(item, "hot"));
        pickedIds.add(item.id);
      }
    });

    latestGoods.forEach((item) => {
      if (!pickedIds.has(item.id) && topMix.length + restList.length < 8) {
        restList.push(this.withRecommendTag(item, "new"));
        pickedIds.add(item.id);
      }
    });

    const list = topMix.concat(restList).slice(0, 8);

    this.homeRecommendCache = {
      expiresAt: now + this.homeRecommendWindowMs,
      list,
    };

    return list;
  }

  getGoodsList(query: GoodsQuery) {
    const page = this.normalizePage(query.page);
    const pageSize = this.normalizePageSize(query.pageSize);
    const sortBy = query.sortBy || "viewCount";
    const campus = (query.campus || "").trim();
    const sellerUserNo = Number(query.sellerUserNo || 0);
    const filteredGoods = this.filterBySeller(
      this.filterByCampus(this.getVisibleGoods(), campus),
      sellerUserNo,
    );
    const sortedGoods = this.sortGoods(filteredGoods, sortBy);

    return this.buildPagedResult(sortedGoods, page, pageSize, {
      sortBy,
      keyword: "",
      campus,
    });
  }

  searchGoods(query: GoodsQuery) {
    const keyword = (query.keyword || "").trim();
    const page = this.normalizePage(query.page);
    const pageSize = this.normalizePageSize(query.pageSize);
    const sortBy = query.sortBy || "viewCount";
    const campus = (query.campus || "").trim();
    const sellerUserNo = Number(query.sellerUserNo || 0);

    const filteredGoods = this.sortGoods(
      this.filterBySeller(
        this.filterByCampus(
          this.getVisibleGoods().filter((item) => this.matchesKeyword(item, keyword)),
          campus,
        ),
        sellerUserNo,
      ),
      sortBy,
    );

    return this.buildPagedResult(filteredGoods, page, pageSize, {
      sortBy,
      keyword,
      campus,
    });
  }

  getMyGoods() {
    const mine = Array.from(this.myGoodsIds)
      .map((id, index) => {
        const goods = this.findGoodsById(id);
        const statuses = ["上架中", "浏览较高", "待完善"];

        return {
          ...goods,
          statusText: statuses[index] || "上架中",
          wantCount: [6, 3, 1][index] || 0,
          updatedAt:
            goods.updatedAt ||
            [
              "2026-04-10T20:10:00.000Z",
              "2026-04-09T18:40:00.000Z",
              "2026-04-08T13:22:00.000Z",
            ][index] ||
            goods.publishedAt,
        };
      })
      .sort(
        (left, right) =>
          new Date(right.updatedAt || right.publishedAt).getTime() -
          new Date(left.updatedAt || left.publishedAt).getTime(),
      );

    return {
      list: mine,
      summary: {
        total: mine.length,
        onSale: mine.length,
        totalViews: mine.reduce((sum, item) => sum + item.viewCount, 0),
      },
    };
  }

  getGoodsDetail(id: number) {
    const goods = this.enrichSeller(this.findGoodsById(id));
    const currentUser = this.userService.getCurrentUser();

    if (this.userService.isUserBanned(goods.sellerUserNo)) {
      throw new NotFoundException("goods not found");
    }

    return {
      ...goods,
      seller: {
        nickname: goods.sellerNickname,
        userNo: goods.sellerUserNo,
        avatarUrl: goods.sellerUserNo === currentUser.userNo ? currentUser.avatarUrl : "",
      },
    };
  }

  incrementViewCount(id: number) {
    const goods = this.findGoodsById(id);
    goods.viewCount += 1;
    goods.updatedAt = new Date().toISOString();

    return {
      id: goods.id,
      viewCount: goods.viewCount,
    };
  }

  createGoods(payload: Record<string, unknown>) {
    if (this.myGoodsIds.size >= 7) {
      throw new BadRequestException("goods limit reached");
    }

    const nextId = Math.max(...this.mockGoods.map((item) => item.id)) + 1;
    const now = new Date().toISOString();
    const title = normalizeText(payload.title);
    const price = normalizeText(payload.price);
    const campusName = normalizeText(payload.campusName || this.campusOptions[0]);
    const description = normalizeText(payload.description);
    const images = Array.isArray(payload.images) ? payload.images.map(String) : [];
    const shelfLifeType = normalizeText(payload.shelfLifeType || "无");
    const shelfLifeDate = normalizeText(payload.shelfLifeDate || "");

    assertRequired(title, "title required");
    assertLength(title, 10, "title too long");
    this.sensitiveWordService.assertSafeText(title, "title contains sensitive words");
    assertRequired(price, "price required");
    assertPrice(price, "invalid price");
    assertRequired(description, "description required");
    assertLength(description, 60, "description too long");
    this.sensitiveWordService.assertSafeText(description, "description contains sensitive words");

    const goods: GoodsItem = {
      id: nextId,
      title,
      expectedPrice: Number(price),
      coverImage: images[0] || "https://dummyimage.com/600x600/dff4ff/2d6a8e&text=%E6%96%B0%E5%95%86%E5%93%81",
      viewCount: 0,
      sellerNickname: "校园用户",
      sellerUserNo: 10000000,
      publishedAt: now,
      updatedAt: now,
      campusTag: "新发布",
      campusName,
      description,
      shelfLifeText: shelfLifeType === "指定日期" ? shelfLifeDate : "无",
      images: images.length ? images : ["https://dummyimage.com/900x900/dff4ff/2d6a8e&text=%E6%96%B0%E5%95%86%E5%93%81"],
      reviewStatus: "pending",
      status: "on_sale",
    };

    this.mockGoods.unshift(goods);
    this.myGoodsIds.add(goods.id);
    this.homeRecommendCache = null;

    return goods;
  }

  updateGoods(id: number, payload: Record<string, unknown>) {
    if (!this.myGoodsIds.has(id)) {
      throw new BadRequestException("cannot edit this goods");
    }

    const goods = this.findGoodsById(id);
    const title = normalizeText(payload.title || goods.title);
    const price = normalizeText(payload.price || goods.expectedPrice);
    const campusName = normalizeText(payload.campusName || goods.campusName);
    const description = normalizeText(payload.description || goods.description);
    const images = Array.isArray(payload.images) ? payload.images.map(String) : goods.images;
    const shelfLifeType = normalizeText(payload.shelfLifeType || "无");
    const shelfLifeDate = normalizeText(payload.shelfLifeDate || "");

    assertRequired(title, "title required");
    assertLength(title, 10, "title too long");
    this.sensitiveWordService.assertSafeText(title, "title contains sensitive words");
    assertPrice(price, "invalid price");
    assertRequired(description, "description required");
    assertLength(description, 60, "description too long");
    this.sensitiveWordService.assertSafeText(description, "description contains sensitive words");

    goods.title = title;
    goods.expectedPrice = Number(price);
    goods.campusName = campusName;
    goods.description = description;
    goods.images = images.length ? images : goods.images;
    goods.coverImage = goods.images[0];
    goods.shelfLifeText = shelfLifeType === "指定日期" ? shelfLifeDate : "无";
    goods.updatedAt = new Date().toISOString();
    this.homeRecommendCache = null;

    return goods;
  }

  offShelfGoods(id: number) {
    if (!this.myGoodsIds.has(id)) {
      throw new BadRequestException("cannot edit this goods");
    }

    const goods = this.findGoodsById(id);
    goods.status = "off_shelf";
    goods.updatedAt = new Date().toISOString();
    this.homeRecommendCache = null;

    return {
      id: goods.id,
      status: goods.status,
    };
  }

  deleteGoods(id: number) {
    if (!this.myGoodsIds.has(id)) {
      throw new BadRequestException("cannot edit this goods");
    }

    const goods = this.findGoodsById(id);
    goods.status = "deleted";
    goods.updatedAt = new Date().toISOString();
    this.myGoodsIds.delete(id);
    this.homeRecommendCache = null;

    return {
      id: goods.id,
      status: goods.status,
    };
  }

  adminForceOffShelfGoods(payload: Record<string, unknown>) {
    const goodsIdText = normalizeText(payload.goodsId);
    const reason = normalizeText(payload.reason || "管理员强制下架");

    assertRequired(goodsIdText, "goodsId required");
    assertNumericString(goodsIdText, "invalid goodsId");
    assertLength(reason, 30, "reason too long");
    this.sensitiveWordService.assertSafeText(reason, "reason contains sensitive words");

    const id = Number(goodsIdText);
    const goods = this.findGoodsById(id);
    goods.status = "off_shelf";
    goods.updatedAt = new Date().toISOString();
    this.homeRecommendCache = null;

    return {
      id: goods.id,
      status: goods.status,
      reason,
    };
  }

  getAdminGoodsList() {
    return this.mockGoods
      .filter((item) => this.getGoodsStatus(item) !== "deleted")
      .map((item) => ({
        ...this.enrichSeller(item),
        status: this.getGoodsStatus(item),
        reviewStatus: item.reviewStatus || "approved",
      }))
      .sort(
        (left, right) =>
          new Date(right.updatedAt || right.publishedAt).getTime() -
          new Date(left.updatedAt || left.publishedAt).getTime(),
      );
  }

  invalidateHomeRecommendCache() {
    this.homeRecommendCache = null;
  }

  private findGoodsById(id: number) {
    const goods = this.mockGoods.find((item) => item.id === id);

    if (!goods) {
      throw new NotFoundException("goods not found");
    }

    if (this.getGoodsStatus(goods) === "deleted") {
      throw new NotFoundException("goods not found");
    }

    return goods;
  }

  private getVisibleGoods() {
    return this.mockGoods
      .filter(
        (item) =>
          this.getGoodsStatus(item) === "on_sale" &&
          !this.userService.isUserBanned(item.sellerUserNo),
      )
      .map((item) => this.enrichSeller(item));
  }

  private enrichSeller(goods: GoodsItem) {
    const currentUser = this.userService.getCurrentUser();

    if (goods.sellerUserNo !== currentUser.userNo) {
      return goods;
    }

    return {
      ...goods,
      sellerNickname: currentUser.nickname,
    };
  }

  private withRecommendTag(goods: GoodsItem, recommendType: "hot" | "new") {
    return {
      ...goods,
      recommendType,
    };
  }

  private getGoodsStatus(goods: GoodsItem) {
    return goods.status || "on_sale";
  }

  private filterByCampus(goods: GoodsItem[], campus: string) {
    if (!campus) {
      return goods;
    }

    return goods.filter((item) => item.campusName === campus);
  }

  private filterBySeller(goods: GoodsItem[], sellerUserNo: number) {
    if (!sellerUserNo) {
      return goods;
    }

    return goods.filter((item) => item.sellerUserNo === sellerUserNo);
  }

  private buildPagedResult(
    goods: GoodsItem[],
    page: number,
    pageSize: number,
    extra: { sortBy: string; keyword: string; campus: string },
  ) {
    const total = goods.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      list: goods.slice(start, end),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
        hasMore: end < total,
      },
      filters: extra,
      campusOptions: this.campusOptions,
    };
  }

  private matchesKeyword(item: GoodsItem, keyword: string) {
    if (!keyword) {
      return true;
    }

    return [item.title, item.campusTag, item.campusName, item.sellerNickname, item.description]
      .join(" ")
      .toLowerCase()
      .includes(keyword.toLowerCase());
  }

  private sortGoods(goods: GoodsItem[], sortBy: string) {
    const list = goods.slice();

    if (sortBy === "latest") {
      return list.sort(
        (left, right) =>
          new Date(right.updatedAt || right.publishedAt).getTime() -
          new Date(left.updatedAt || left.publishedAt).getTime(),
      );
    }

    return list.sort((left, right) => right.viewCount - left.viewCount);
  }

  private normalizePage(page?: number) {
    const value = Number(page || 1);
    return Number.isFinite(value) && value > 0 ? value : 1;
  }

  private normalizePageSize(pageSize?: number) {
    const value = Number(pageSize || 10);
    if (!Number.isFinite(value) || value <= 0) {
      return 10;
    }

    return Math.min(value, 20);
  }
}
