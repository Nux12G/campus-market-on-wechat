const { getHotGoods } = require("../../services/goods");
const { requireLogin } = require("../../utils/guard");

const FALLBACK_CARDS = [
  {
    id: "guide-trade",
    type: "guide",
    title: "交易指南",
    subtitle: "优先选择白天、人流稳定的校区公共区域完成线下交换。",
    tag: "安全建议",
    actionText: "查看建议",
  },
  {
    id: "guide-fraud",
    type: "guide",
    title: "防骗提醒",
    subtitle: "涉及提前转账、代付链接、异常二维码时，先暂停交易并核实身份。",
    tag: "防骗提示",
    actionText: "提高警惕",
  },
  {
    id: "guide-campus",
    type: "guide",
    title: "校区交换建议",
    subtitle: "同校区交换效率更高，跨校区建议提前约定时间与地点。",
    tag: "交换建议",
    actionText: "提前沟通",
  },
  {
    id: "guide-rule",
    type: "guide",
    title: "平台规则",
    subtitle: "商品图片、文案和联系方式都需真实有效，违规内容会被强制下架。",
    tag: "平台规则",
    actionText: "规范发布",
  },
];

Page({
  data: {
    loading: true,
    loadFailed: false,
    hotGoods: [],
    homeCards: [],
    initialized: false,
  },

  onLoad() {
    this.fetchHotGoods();
  },

  onShow() {
    if (this.data.initialized) {
      this.fetchHotGoods();
    }
  },

  onPullDownRefresh() {
    this.fetchHotGoods({ stopRefresh: true });
  },

  async fetchHotGoods(options = {}) {
    const { stopRefresh = false } = options;

    this.setData({
      loading: true,
      loadFailed: false,
    });

    try {
      const result = await getHotGoods();
      const goodsList = (result.data || []).map((item) => ({
        ...item,
        type: "goods",
        priceText: Number(item.expectedPrice).toFixed(0),
        viewText: this.formatViewCount(item.viewCount),
        publishText: this.formatPublishText(item.publishedAt),
        recommendText: item.recommendType === "new" ? "新上架" : "热门推荐",
      }));

      const homeCards = this.fillHomeCards(goodsList);

      this.setData({
        hotGoods: goodsList,
        homeCards,
        loadFailed: false,
        initialized: true,
      });
    } catch (error) {
      this.setData({
        loadFailed: true,
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

  fillHomeCards(goodsList) {
    const cards = goodsList.slice();
    let fallbackIndex = 0;

    while (cards.length < 8 && fallbackIndex < FALLBACK_CARDS.length) {
      cards.push(FALLBACK_CARDS[fallbackIndex]);
      fallbackIndex += 1;
    }

    return cards.slice(0, 8);
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
      return `${diffHours}小时前`;
    }

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}天前`;
  },

  handleGoMarket() {
    wx.switchTab({
      url: "/pages/market/index",
    });
  },

  handleGoMyMarket() {
    if (!requireLogin("/pages/login/index", "pages/my-market/index")) {
      return;
    }

    wx.switchTab({
      url: "/pages/my-market/index",
    });
  },

  handleGoodsTap(event) {
    const { id } = event.currentTarget.dataset;

    wx.navigateTo({
      url: `/pages/goods-detail/index?id=${id}`,
    });
  },

  handleGuideTap() {
    wx.showToast({
      title: "后续可替换为你提供的正式文案",
      icon: "none",
    });
  },

  handleRetry() {
    this.fetchHotGoods();
  },
});
