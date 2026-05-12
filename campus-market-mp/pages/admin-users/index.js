const { banUser, getAdminUsers, unbanUser } = require("../../services/admin");

Page({
  data: {
    loading: true,
    loadFailed: false,
    users: [],
    reason: "",
    durationOptions: [
      { label: "1天", value: "1d" },
      { label: "14天", value: "14d" },
      { label: "永久", value: "permanent" },
    ],
    durationIndex: 2,
  },

  onShow() {
    this.fetchUsers();
  },

  async fetchUsers() {
    this.setData({
      loading: true,
      loadFailed: false,
    });

    try {
      const result = await getAdminUsers();
      this.setData({
        users: result.data || [],
      });
    } catch (error) {
      this.setData({ loadFailed: true });
      wx.showToast({
        title: "用户列表加载失败",
        icon: "none",
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  handleReasonInput(event) {
    this.setData({ reason: event.detail.value.slice(0, 30) });
  },

  handleDurationChange(event) {
    const index = event.currentTarget.dataset.index;
    this.setData({
      durationIndex: Number(index),
    });
  },

  async handleBan(event) {
    const { userno } = event.currentTarget.dataset;
    const reason = this.data.reason.trim();

    try {
      const duration = this.data.durationOptions[this.data.durationIndex].value;
      await banUser({
        userNo: userno,
        reason,
        duration,
      });
      wx.showToast({
        title: "封禁成功",
        icon: "success",
      });
      this.fetchUsers();
    } catch (error) {
      wx.showToast({
        title: "封禁失败",
        icon: "none",
      });
    }
  },

  async handleUnban(event) {
    const { userno } = event.currentTarget.dataset;

    try {
      await unbanUser({
        userNo: userno,
      });
      wx.showToast({
        title: "已解除封禁",
        icon: "success",
      });
      this.fetchUsers();
    } catch (error) {
      wx.showToast({
        title: "解除失败",
        icon: "none",
      });
    }
  },
});
