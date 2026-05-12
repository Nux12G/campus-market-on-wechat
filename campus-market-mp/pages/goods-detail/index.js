const { getGoodsDetail, incrementGoodsView } = require("../../services/goods");
const { requireLogin } = require("../../utils/guard");
const { getUser } = require("../../utils/storage");

Page({
  data: {
    goodsId: "",
    loading: true,
    loadFailed: false,
    goodsDetail: null,
    isOwner: false,
  },

  onLoad(options) {
    const goodsId = options.id || "";

    this.setData({ goodsId });
    this.fetchGoodsDetail(goodsId);
  },

  onPullDownRefresh() {
    this.fetchGoodsDetail(this.data.goodsId, {
      stopRefresh: true,
    });
  },

  async fetchGoodsDetail(goodsId, options = {}) {
    const { stopRefresh = false } = options;

    if (!goodsId) {
      this.setData({
        loading: false,
        loadFailed: true,
      });
      return;
    }

    this.setData({
      loading: true,
      loadFailed: false,
    });

    try {
      const detailResult = await getGoodsDetail(goodsId);
      const detail = this.normalizeGoods(detailResult.data);
      const currentUser = getUser() || {};
      const isOwner =
        Boolean(currentUser.userNo) && currentUser.userNo === detail.seller.userNo;

      this.setData({
        goodsDetail: detail,
        loadFailed: false,
        isOwner,
      });

      const viewResult = await incrementGoodsView(goodsId);
      const viewCount = viewResult.data ? viewResult.data.viewCount : detail.viewCount;
      this.setData({
        "goodsDetail.viewCount": viewCount,
        "goodsDetail.viewText": this.formatViewCount(viewCount),
      });
    } catch (error) {
      this.setData({
        loadFailed: true,
      });
      wx.showToast({
        title: "详情加载失败",
        icon: "none",
      });
    } finally {
      this.setData({
        loading: false,
      });

      if (stopRefresh) {
        wx.stopPullDownRefresh();
      }
    }
  },

  normalizeGoods(detail) {
    return {
      ...detail,
      priceText: Number(detail.expectedPrice).toFixed(0),
      viewText: this.formatViewCount(detail.viewCount),
      publishText: this.formatPublishText(detail.publishedAt),
      imageList: detail.images && detail.images.length ? detail.images : [detail.coverImage],
    };
  },

  formatViewCount(count) {
    if (count >= 10000) {
      return `${(count / 10000).toFixed(1)}w`;
    }

    return `${count}`;
  },

  formatPublishText(dateString) {
    if (!dateString) {
      return "刚刚发布";
    }

    const publishedAt = new Date(dateString);
    const now = new Date();
    const diffHours = Math.max(1, Math.floor((now - publishedAt) / (1000 * 60 * 60)));

    if (diffHours < 24) {
      return `${diffHours}小时前发布`;
    }

    return `${Math.floor(diffHours / 24)}天前发布`;
  },

  handleRetry() {
    this.fetchGoodsDetail(this.data.goodsId);
  },

  handleWant() {
    if (this.data.isOwner) {
      wx.showToast({
        title: "不能申请自己的商品",
        icon: "none",
      });
      return;
    }

    if (!requireLogin("/pages/login/index", `pages/goods-detail/index?id=${this.data.goodsId}`)) {
      return;
    }

    wx.navigateTo({
      url: `/pages/exchange-apply/index?goodsId=${this.data.goodsId}`,
    });
  },

  handleViewSellerMarket() {
    const goodsDetail = this.data.goodsDetail;

    if (!goodsDetail) {
      return;
    }

    wx.navigateTo({
      url: `/pages/user-market/index?sellerUserNo=${goodsDetail.seller.userNo}&sellerNickname=${encodeURIComponent(goodsDetail.seller.nickname)}`,
    });
  },

  handleReport() {
    wx.navigateTo({
      url: `/pages/report-submit/index?goodsId=${this.data.goodsId}`,
    });
  },
});
