const { wxLogin } = require("../../services/auth");
const { clearAuth, setToken, setUser } = require("../../utils/storage");

Page({
  data: {
    redirect: "",
    mockUser: "",
    submitting: false,
  },

  onLoad(options) {
    this.setData({
      redirect: options.redirect || "",
      mockUser: options.mockUser || "",
    });
  },

  async handleLogin() {
    if (this.data.submitting) {
      return;
    }

    this.setData({ submitting: true });
    wx.showLoading({
      title: "登录中",
      mask: true,
    });

    try {
      const loginCode = await this.getWechatCode();
      const result = await wxLogin(loginCode);
      const loginData = result.data || {};

      clearAuth();
      setToken(loginData.token || "");

      if (loginData.user) {
        setUser(loginData.user);
      }

      wx.hideLoading();

      if (loginData.isFirstLogin) {
        const target = this.data.redirect
          ? `/pages/register/index?redirect=${encodeURIComponent(this.data.redirect)}`
          : "/pages/register/index";

        wx.navigateTo({ url: target });
        return;
      }

      wx.showToast({
        title: "登录成功",
        icon: "success",
      });
      this.navigateAfterLogin();
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: "登录失败，请重试",
        icon: "none",
      });
    } finally {
      this.setData({ submitting: false });
    }
  },

  getWechatCode() {
    if (this.data.mockUser === "existing") {
      return Promise.resolve("existing-user");
    }

    if (this.data.mockUser === "new") {
      return Promise.resolve("test-user");
    }

    try {
      if (wx.getDeviceInfo && wx.getDeviceInfo().platform === "devtools") {
        return Promise.resolve("test-user");
      }
    } catch (error) {
      return Promise.resolve("test-user");
    }

    return new Promise((resolve) => {
      let settled = false;

      const finish = (code) => {
        if (settled) {
          return;
        }

        settled = true;
        resolve(code || "test-user");
      };

      setTimeout(() => {
        finish("test-user");
      }, 1500);

      wx.login({
        success: (res) => {
          finish(res.code);
        },
        fail: () => {
          finish("test-user");
        },
      });
    });
  },

  navigateAfterLogin() {
    const { redirect } = this.data;

    if (redirect && redirect.startsWith("pages/")) {
      const tabPages = [
        "pages/home/index",
        "pages/market/index",
        "pages/my-market/index",
        "pages/messages/index",
        "pages/profile/index",
      ];

      if (tabPages.includes(redirect)) {
        wx.switchTab({
          url: `/${redirect}`,
        });
        return;
      }

      wx.redirectTo({
        url: `/${redirect}`,
      });
      return;
    }

    wx.switchTab({
      url: "/pages/home/index",
    });
  },

  handleCancel() {
    const protectedTabTargets = [
      "pages/my-market/index",
      "pages/messages/index",
      "pages/profile/index",
    ];
    const redirect = this.data.redirect || "";

    if (protectedTabTargets.includes(redirect)) {
      wx.switchTab({
        url: "/pages/market/index",
      });
      return;
    }

    const pages = getCurrentPages();

    if (pages.length > 1) {
      wx.navigateBack();
      return;
    }

    wx.switchTab({
      url: "/pages/home/index",
    });
  },
});
