const { getAdminReports, processReport } = require("../../services/admin");

Page({
  data: {
    loading: true,
    loadFailed: false,
    reports: [],
  },

  onShow() {
    this.fetchReports();
  },

  async fetchReports() {
    this.setData({ loading: true, loadFailed: false });
    try {
      const result = await getAdminReports();
      this.setData({ reports: result.data || [] });
    } catch (error) {
      this.setData({ loadFailed: true });
      wx.showToast({ title: "举报列表加载失败", icon: "none" });
    } finally {
      this.setData({ loading: false });
    }
  },

  async handleProcess(event) {
    const { id } = event.currentTarget.dataset;
    try {
      await processReport({ reportId: id });
      wx.showToast({ title: "已标记处理", icon: "success" });
      this.fetchReports();
    } catch (error) {
      wx.showToast({ title: "处理失败", icon: "none" });
    }
  },
});
