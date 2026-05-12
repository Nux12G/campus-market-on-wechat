const { updateNickname } = require("../../services/user");
const { getUser, setUser } = require("../../utils/storage");

Page({
  data: {
    nickname: "",
    submitting: false,
  },

  onShow() {
    const user = getUser() || {};
    this.setData({
      nickname: user.nickname || "",
    });
  },

  handleInput(event) {
    this.setData({
      nickname: event.detail.value.slice(0, 10),
    });
  },

  async handleSubmit() {
    const nickname = this.data.nickname.trim();

    if (this.data.submitting || !nickname) {
      return;
    }

    this.setData({ submitting: true });
    wx.showLoading({
      title: "保存中",
      mask: true,
    });

    try {
      const result = await updateNickname({ nickname });
      setUser(result.data);
      wx.showToast({
        title: "昵称已更新",
        icon: "success",
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 300);
    } catch (error) {
      const messageText =
        error && error.data && error.data.message === "nickname update cooldown"
          ? "昵称30天内只能修改一次"
          : "更新失败";
      wx.showToast({
        title: messageText,
        icon: "none",
      });
    } finally {
      wx.hideLoading();
      this.setData({ submitting: false });
    }
  },
});
