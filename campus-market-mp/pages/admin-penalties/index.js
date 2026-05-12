const { createPenalty, getAdminPenalties } = require("../../services/admin");

Page({
  data: {
    loading: true,
    loadFailed: false,
    penalties: [],
    userNo: "",
    title: "",
    content: "",
  },

  onShow() {
    this.fetchPenalties();
  },

  async fetchPenalties() {
    this.setData({ loading: true, loadFailed: false });
    try {
      const result = await getAdminPenalties();
      this.setData({ penalties: result.data || [] });
    } catch (error) {
      this.setData({ loadFailed: true });
      wx.showToast({ title: "处罚列表加载失败", icon: "none" });
    } finally {
      this.setData({ loading: false });
    }
  },

  handleInput(event) {
    const { field } = event.currentTarget.dataset;
    const value =
      field === "userNo"
        ? event.detail.value.slice(0, 8)
        : field === "title"
          ? event.detail.value.slice(0, 20)
          : event.detail.value.slice(0, 120);
    this.setData({ [field]: value });
  },

  async handleSubmit() {
    const { userNo, title, content } = this.data;
    if (!userNo.trim() || !title.trim() || !content.trim()) {
      wx.showToast({ title: "请填写完整处罚信息", icon: "none" });
      return;
    }
    try {
      await createPenalty({
        userNo: userNo.trim(),
        title: title.trim(),
        content: content.trim(),
      });
      wx.showToast({ title: "处罚通知已发送", icon: "success" });
      this.setData({ userNo: "", title: "", content: "" });
      this.fetchPenalties();
    } catch (error) {
      wx.showToast({ title: "发送失败", icon: "none" });
    }
  },
});
