const { forceOffShelfGoods, getAdminGoods } = require("../../services/admin");

Page({
  data: {
    loading: true,
    loadFailed: false,
    keyword: "",
    allGoods: [],
    goodsList: [],
  },

  onShow() {
    this.fetchGoodsList();
  },

  async fetchGoodsList() {
    this.setData({
      loading: true,
      loadFailed: false,
    });

    try {
      const result = await getAdminGoods();
      const allGoods = result.data || [];
      this.setData({
        allGoods,
        goodsList: allGoods,
      });
    } catch (error) {
      this.setData({
        loadFailed: true,
      });
      wx.showToast({
        title: "商品列表加载失败",
        icon: "none",
      });
    } finally {
      this.setData({
        loading: false,
      });
    }
  },

  async handleForceOffShelf(event) {
    const { id } = event.currentTarget.dataset;

    wx.showModal({
      title: "确认强制下架",
      content: `确认对商品ID ${id} 执行强制下架吗？`,
      success: async (res) => {
        if (!res.confirm) {
          return;
        }

        try {
          await forceOffShelfGoods({
            goodsId: id,
            reason: "管理员强制下架",
          });
          wx.showToast({
            title: "下架成功",
            icon: "success",
          });
          this.fetchGoodsList();
        } catch (error) {
          wx.showToast({
            title: "下架失败",
            icon: "none",
          });
        }
      },
    });
  },

  handleSearchInput(event) {
    const keyword = event.detail.value.slice(0, 20);
    const normalized = keyword.trim().toLowerCase();
    const goodsList = !normalized
      ? this.data.allGoods
      : this.data.allGoods.filter((item) => {
          return (
            String(item.id).includes(normalized) ||
            String(item.sellerUserNo).includes(normalized) ||
            String(item.title || "").toLowerCase().includes(normalized)
          );
        });

    this.setData({
      keyword,
      goodsList,
    });
  },
});
