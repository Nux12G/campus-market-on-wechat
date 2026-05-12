const { requireLogin } = require("../../utils/guard");
const { getCurrentUserProfile } = require("../../services/user");
const { getUser, setUser } = require("../../utils/storage");

Page({
  data: {
    userInfo: null,
  },

  onShow() {
    if (!requireLogin("/pages/login/index", "pages/profile/index")) {
      return;
    }

    this.setData({
      userInfo: getUser() || null,
    });
    this.fetchProfile();
  },

  async fetchProfile() {
    try {
      const result = await getCurrentUserProfile();
      setUser(result.data);
      this.setData({
        userInfo: result.data || null,
      });
    } catch (error) {
      wx.showToast({
        title: "个人信息加载失败",
        icon: "none",
      });
    }
  },

  handleGoAvatar() {
    wx.navigateTo({
      url: "/pages/profile-avatar/index",
    });
  },

  handleGoNickname() {
    wx.navigateTo({
      url: "/pages/profile-nickname/index",
    });
  },

  handleGoContact() {
    wx.navigateTo({
      url: "/pages/profile-contact/index",
    });
  },

  handleGoAdmin() {
    wx.navigateTo({
      url: "/pages/admin-dashboard/index",
    });
  },
});
