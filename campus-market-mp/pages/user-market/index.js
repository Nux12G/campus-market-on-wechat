const { getGoodsList } = require("../../services/goods");

Page({
  data: {
    sellerUserNo: "",
    sellerNickname: "",
    loading: true,
    loadFailed: false,
    goodsList: [],
  },

  onLoad(options) {
    this.setData({
      sellerUserNo: options.sellerUserNo || "",
      sellerNickname: decodeURIComponent(options.sellerNickname || "卖家"),
    });
    this.fetchSellerGoods();
  },

  onPullDownRefresh() {
    this.fetchSellerGoods({ stopRefresh: true });
  },

  async fetchSellerGoods(options = {}) {
    const { stopRefresh = false } = options;
    this.setData({
      loading: true,
      loadFailed: false,
    });

    try {
      const result = await getGoodsList({
        sellerUserNo: this.data.sellerUserNo,
        page: 1,
        pageSize: 20,
        sortBy: "latest",
      });

      const list = (result.data.list || []).map((item) => ({
        ...item,
        priceText: Number(item.expectedPrice).toFixed(0),
        viewText: this.formatCount(item.viewCount),
      }));

      this.setData({
        goodsList: list,
      });
    } catch (error) {
      this.setData({ loadFailed: true });
      wx.showToast({
        title: "他的集市加载失败",
        icon: "none",
      });
    } finally {
      this.setData({ loading: false });
      if (stopRefresh) {
        wx.stopPullDownRefresh();
      }
    }
  },

  formatCount(value) {
    if (value >= 10000) {
      return `${(value / 10000).toFixed(1)}w`;
    }

    return `${value}`;
  },

  handleGoodsTap(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/goods-detail/index?id=${id}`,
    });
  },

  handleRetry() {
    this.fetchSellerGoods();
  },
});
