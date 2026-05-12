const {
  createAnnouncement,
  getAdminAnnouncements,
} = require("../../services/admin");

Page({
  data: {
    loading: true,
    loadFailed: false,
    announcements: [],
    title: "",
    content: "",
  },

  onShow() {
    this.fetchAnnouncements();
  },

  async fetchAnnouncements() {
    this.setData({
      loading: true,
      loadFailed: false,
    });

    try {
      const result = await getAdminAnnouncements();
      this.setData({
        announcements: result.data || [],
      });
    } catch (error) {
      this.setData({ loadFailed: true });
      wx.showToast({
        title: "公告列表加载失败",
        icon: "none",
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  handleTitleInput(event) {
    this.setData({
      title: event.detail.value.slice(0, 20),
    });
  },

  handleContentInput(event) {
    this.setData({
      content: event.detail.value.slice(0, 120),
    });
  },

  async handleSubmit() {
    const title = this.data.title.trim();
    const content = this.data.content.trim();

    if (!title || !content) {
      wx.showToast({
        title: "请先填写完整公告",
        icon: "none",
      });
      return;
    }

    try {
      await createAnnouncement({ title, content });
      wx.showToast({
        title: "公告已发布",
        icon: "success",
      });
      this.setData({
        title: "",
        content: "",
      });
      this.fetchAnnouncements();
    } catch (error) {
      wx.showToast({
        title: "公告发布失败",
        icon: "none",
      });
    }
  },
});
