const { updateAvatar } = require("../../services/user");
const { getUser, setUser } = require("../../utils/storage");

const AVATAR_OPTIONS = [
  "https://dummyimage.com/200x200/67c4ff/ffffff&text=A",
  "https://dummyimage.com/200x200/9cdeff/1f516d&text=B",
  "https://dummyimage.com/200x200/8fd6c5/ffffff&text=C",
  "https://dummyimage.com/200x200/ffd76a/7a5600&text=D",
  "https://dummyimage.com/200x200/ffb8a8/ffffff&text=E",
  "https://dummyimage.com/200x200/b7c8ff/244b63&text=F",
];

Page({
  data: {
    avatarOptions: AVATAR_OPTIONS,
    avatarUrl: "",
    submitting: false,
  },

  onShow() {
    const user = getUser() || {};
    this.setData({
      avatarUrl: user.avatarUrl || "",
    });
  },

  chooseAvatar(event) {
    const { url } = event.currentTarget.dataset;

    this.setData({
      avatarUrl: url,
    });
  },

  async handleSubmit() {
    if (this.data.submitting || !this.data.avatarUrl) {
      return;
    }

    this.setData({ submitting: true });
    wx.showLoading({
      title: "保存中",
      mask: true,
    });

    try {
      const result = await updateAvatar({
        avatarUrl: this.data.avatarUrl,
      });
      setUser(result.data);
      wx.showToast({
        title: "头像已更新",
        icon: "success",
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 300);
    } catch (error) {
      const messageText =
        error && error.data && error.data.message === "avatar update cooldown"
          ? "头像30天内只能修改一次"
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
