const { deleteGoods, getMyGoods, offShelfGoods } = require("../../services/goods");
const { requireLogin } = require("../../utils/guard");

Page({
  data: {
    loading: true,
    loadFailed: false,
    goodsList: [],
    summary: {
      total: 0,
      onSale: 0,
      totalViews: 0,
    },
  },

  onShow() {
    if (!requireLogin("/pages/login/index", "pages/my-market/index")) {
      return;
    }

    this.fetchMyGoods();
  },

  onPullDownRefresh() {
    if (!requireLogin("/pages/login/index", "pages/my-market/index")) {
      wx.stopPullDownRefresh();
      return;
    }

    this.fetchMyGoods({ stopRefresh: true });
  },

  async fetchMyGoods(options = {}) {
    const { stopRefresh = false } = options;

    this.setData({
      loading: true,
      loadFailed: false,
    });

    try {
      const result = await getMyGoods();
      const data = result.data || {};
      const list = (data.list || []).map((item) => ({
        ...item,
        priceText: Number(item.expectedPrice).toFixed(0),
        viewText: this.formatCount(item.viewCount),
        wantText: this.formatCount(item.wantCount),
        updatedText: this.formatUpdatedText(item.updatedAt),
        canOffShelf: item.statusText !== "已下架",
      }));

      this.setData({
        goodsList: list,
        summary: data.summary || this.data.summary,
        loadFailed: false,
      });
    } catch (error) {
      this.setData({
        loadFailed: true,
      });
      wx.showToast({
        title: "我的集市加载失败",
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

  formatCount(value) {
    if (value >= 10000) {
      return `${(value / 10000).toFixed(1)}w`;
    }

    return `${value}`;
  },

  formatUpdatedText(dateString) {
    if (!dateString) {
      return "刚刚更新";
    }

    const updatedAt = new Date(dateString);
    const now = new Date();
    const diffHours = Math.max(1, Math.floor((now - updatedAt) / (1000 * 60 * 60)));

    if (diffHours < 24) {
      return `${diffHours}小时前更新`;
    }

    return `${Math.floor(diffHours / 24)}天前更新`;
  },

  handlePublish() {
    wx.navigateTo({
      url: "/pages/goods-publish/index",
    });
  },

  handleGoodsTap(event) {
    const { id } = event.currentTarget.dataset;

    wx.navigateTo({
      url: `/pages/goods-detail/index?id=${id}`,
    });
  },

  handleEdit(event) {
    const { id } = event.currentTarget.dataset;

    wx.navigateTo({
      url: `/pages/goods-edit/index?id=${id}`,
    });
  },

  handleOffShelf(event) {
    const { id } = event.currentTarget.dataset;

    wx.showModal({
      title: "确认下架",
      content: "下架后，该商品不会继续出现在集市大厅中。",
      success: async (res) => {
        if (!res.confirm) {
          return;
        }

        try {
          await offShelfGoods(id);
          wx.showToast({
            title: "已下架",
            icon: "success",
          });
          this.fetchMyGoods();
        } catch (error) {
          wx.showToast({
            title: "下架失败",
            icon: "none",
          });
        }
      },
    });
  },

  handleDelete(event) {
    const { id } = event.currentTarget.dataset;

    wx.showModal({
      title: "确认删除",
      content: "删除后该商品会从我的集市移除。",
      success: async (res) => {
        if (!res.confirm) {
          return;
        }

        try {
          await deleteGoods(id);
          wx.showToast({
            title: "已删除",
            icon: "success",
          });
          this.fetchMyGoods();
        } catch (error) {
          wx.showToast({
            title: "删除失败",
            icon: "none",
          });
        }
      },
    });
  },

  handleRetry() {
    this.fetchMyGoods();
  },
});
