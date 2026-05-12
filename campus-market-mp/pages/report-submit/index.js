const { createReport } = require("../../services/report");

Page({
  data: {
    goodsId: "",
    reason: "",
    content: "",
  },

  onLoad(options) {
    this.setData({ goodsId: options.goodsId || "" });
  },

  handleInput(event) {
    const { field } = event.currentTarget.dataset;
    const value = field === "reason" ? event.detail.value.slice(0, 20) : event.detail.value.slice(0, 80);
    this.setData({ [field]: value });
  },

  async handleSubmit() {
    const reason = this.data.reason.trim();
    const content = this.data.content.trim();
    if (!reason || !content) {
      wx.showToast({ title: "请填写完整举报信息", icon: "none" });
      return;
    }
    try {
      await createReport({ goodsId: this.data.goodsId, reason, content });
      wx.showToast({ title: "举报已提交", icon: "success" });
      setTimeout(() => wx.navigateBack(), 300);
    } catch (error) {
      wx.showToast({ title: "举报失败", icon: "none" });
    }
  },
});
