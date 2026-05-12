const { updateContact } = require("../../services/user");
const { getUser, setUser } = require("../../utils/storage");

const CONTACT_OPTIONS = [
  { label: "微信", value: "wechat", placeholder: "请输入微信号", maxLength: 20 },
  { label: "QQ", value: "qq", placeholder: "请输入QQ号", maxLength: 12 },
  { label: "手机号", value: "mobile", placeholder: "请输入手机号", maxLength: 11 },
];

Page({
  data: {
    contactOptions: CONTACT_OPTIONS,
    contactIndex: 0,
    contactType: "wechat",
    contactValue: "",
    submitting: false,
  },

  onShow() {
    const user = getUser() || {};
    const contactType = user.contactType || "wechat";
    const contactIndex = Math.max(
      0,
      this.data.contactOptions.findIndex((item) => item.value === contactType),
    );

    this.setData({
      contactType,
      contactIndex,
      contactValue: user.contactValue || "",
    });
  },

  handleTypeChange(event) {
    const contactIndex = Number(event.detail.value);
    const option = this.data.contactOptions[contactIndex] || this.data.contactOptions[0];

    this.setData({
      contactIndex,
      contactType: option.value,
      contactValue: "",
    });
  },

  handleInput(event) {
    const option = this.data.contactOptions[this.data.contactIndex];
    this.setData({
      contactValue: event.detail.value.slice(0, option.maxLength),
    });
  },

  validateContact(contactType, contactValue) {
    if (!contactValue) {
      return "请输入联系方式";
    }

    if (contactType === "wechat" && !/^[a-zA-Z][-_a-zA-Z0-9]{4,19}$/.test(contactValue)) {
      return "微信号格式不正确";
    }

    if (contactType === "qq" && !/^[1-9][0-9]{4,11}$/.test(contactValue)) {
      return "QQ号格式不正确";
    }

    if (contactType === "mobile" && !/^1[3-9][0-9]{9}$/.test(contactValue)) {
      return "手机号格式不正确";
    }

    return "";
  },

  async handleSubmit() {
    const contactValue = this.data.contactValue.trim();
    const contactType = this.data.contactType;
    const errorMessage = this.validateContact(contactType, contactValue);

    if (this.data.submitting) {
      return;
    }

    if (errorMessage) {
      wx.showToast({
        title: errorMessage,
        icon: "none",
      });
      return;
    }

    this.setData({ submitting: true });
    wx.showLoading({
      title: "保存中",
      mask: true,
    });

    try {
      const result = await updateContact({
        contactType,
        contactValue,
      });
      setUser(result.data);
      wx.showToast({
        title: "联系方式已更新",
        icon: "success",
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 300);
    } catch (error) {
      const messageText =
        error && error.data && error.data.message === "invalid wechat"
          ? "微信号格式不正确"
          : error && error.data && error.data.message === "invalid qq"
            ? "QQ号格式不正确"
            : error && error.data && error.data.message === "invalid mobile"
              ? "手机号格式不正确"
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
