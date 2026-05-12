const { applyExchange } = require("../../services/exchange");
const { getGoodsDetail } = require("../../services/goods");
const { requireLogin } = require("../../utils/guard");

Page({
  data: {
    goodsId: "",
    loading: true,
    submitting: false,
    loadFailed: false,
    goodsDetail: null,
    message: "",
  },

  onLoad(options) {
    if (!requireLogin("/pages/login/index", "pages/exchange-apply/index")) {
      return;
    }

    const goodsId = options.goodsId || "";
    this.setData({ goodsId });
    this.fetchGoodsDetail(goodsId);
  },

  async fetchGoodsDetail(goodsId) {
    if (!goodsId) {
      this.setData({ loading: false, loadFailed: true });
      return;
    }

    this.setData({ loading: true, loadFailed: false });

    try {
      const result = await getGoodsDetail(goodsId);
      this.setData({
        goodsDetail: result.data || null,
      });
    } catch (error) {
      this.setData({ loadFailed: true });
      wx.showToast({
        title: "申请页加载失败",
        icon: "none",
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  handleInput(event) {
    this.setData({
      message: event.detail.value.slice(0, 20),
    });
  },

  async handleSubmit() {
    if (this.data.submitting) {
      return;
    }

    const goodsDetail = this.data.goodsDetail;
    const message = this.data.message.trim();

    if (!goodsDetail) {
      wx.showToast({
        title: "商品信息异常",
        icon: "none",
      });
      return;
    }

    if (!message) {
      wx.showToast({
        title: "请填写申请留言",
        icon: "none",
      });
      return;
    }

    this.setData({ submitting: true });
    wx.showLoading({
      title: "提交中",
      mask: true,
    });

    try {
      await applyExchange({
        goodsId: goodsDetail.id,
        goodsTitle: goodsDetail.title,
        goodsCoverImage: goodsDetail.coverImage,
        sellerUserNo: goodsDetail.seller.userNo,
        sellerNickname: goodsDetail.seller.nickname,
        campusName: goodsDetail.campusName,
        message,
        sellerContactType: "wechat",
        sellerContactValue: "seller_contact_demo",
      });

      wx.showToast({
        title: "申请已发送",
        icon: "success",
      });

      setTimeout(() => {
        wx.navigateBack();
      }, 400);
    } catch (error) {
      const messageText =
        error && error.data && error.data.message === "cannot apply own goods"
          ? "不能申请自己的商品"
          : "提交失败，请重试";

      wx.showToast({
        title: messageText,
        icon: "none",
      });
    } finally {
      wx.hideLoading();
      this.setData({ submitting: false });
    }
  },

  handleRetry() {
    this.fetchGoodsDetail(this.data.goodsId);
  },
});
