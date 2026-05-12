const { completeProfile, getCurrentUser } = require("../../services/auth");
const { setToken, setUser } = require("../../utils/storage");

Page({
  data: {
    redirect: "",
    genderOptions: ["男", "女"],
    genderIndex: -1,
    contactTypes: [
      { label: "微信", value: "wechat", placeholder: "请输入微信号", maxLength: 20 },
      { label: "QQ", value: "qq", placeholder: "请输入QQ号", maxLength: 12 },
      { label: "手机号", value: "mobile", placeholder: "请输入手机号", maxLength: 11 },
    ],
    activeContactType: "wechat",
    submitting: false,
    form: {
      nickname: "",
      genderLabel: "请选择",
      contactTypeLabel: "微信",
      contactValue: "",
    },
    errors: {
      nickname: "",
      gender: "",
      contactValue: "",
    },
  },

  onLoad(options) {
    this.setData({
      redirect: options.redirect || "",
    });
  },

  handleNicknameInput(event) {
    const nickname = event.detail.value.slice(0, 10);

    this.setData({
      "form.nickname": nickname,
      "errors.nickname": "",
    });
  },

  handleGenderChange(event) {
    const genderIndex = Number(event.detail.value);
    const genderLabel = this.data.genderOptions[genderIndex] || "请选择";

    this.setData({
      genderIndex,
      "form.genderLabel": genderLabel,
      "errors.gender": "",
    });
  },

  handleContactTypeSelect(event) {
    const { type, label } = event.currentTarget.dataset;

    this.setData({
      activeContactType: type,
      "form.contactTypeLabel": label,
      "form.contactValue": "",
      "errors.contactValue": "",
    });
  },

  handleContactInput(event) {
    const option = this.data.contactTypes.find((item) => item.value === this.data.activeContactType);
    const contactValue = event.detail.value.slice(0, option ? option.maxLength : 20);

    this.setData({
      "form.contactValue": contactValue,
      "errors.contactValue": "",
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

  validateForm() {
    const { form, activeContactType } = this.data;
    const errors = {
      nickname: "",
      gender: "",
      contactValue: "",
    };

    const nickname = form.nickname.trim();
    const contactValue = form.contactValue.trim();

    if (!nickname) {
      errors.nickname = "请输入昵称";
    } else if (nickname.length < 2) {
      errors.nickname = "昵称至少2个字";
    } else if (nickname.length > 10) {
      errors.nickname = "昵称最多10个字";
    }

    if (form.genderLabel === "请选择") {
      errors.gender = "请选择性别";
    }

    errors.contactValue = this.validateContact(activeContactType, contactValue);

    this.setData({ errors });

    return !errors.nickname && !errors.gender && !errors.contactValue;
  },

  buildSubmitPayload() {
    const { form, activeContactType } = this.data;
    const genderMap = {
      男: 1,
      女: 2,
    };

    return {
      nickname: form.nickname.trim(),
      gender: genderMap[form.genderLabel] || 0,
      contactType: activeContactType,
      contactValue: form.contactValue.trim(),
    };
  },

  async handleSubmit() {
    if (this.data.submitting || !this.validateForm()) {
      return;
    }

    this.setData({ submitting: true });
    wx.showLoading({
      title: "提交中",
      mask: true,
    });

    try {
      const payload = this.buildSubmitPayload();
      const result = await completeProfile(payload);
      const profileData = result.data || {};

      if (profileData.token) {
        setToken(profileData.token);
      }

      if (profileData.user) {
        setUser(profileData.user);
      } else {
        const currentUserResult = await getCurrentUser();
        setUser(currentUserResult.data);
      }

      wx.showToast({
        title: "资料已完成",
        icon: "success",
      });

      setTimeout(() => {
        this.navigateByRedirect(this.data.redirect);
      }, 400);
    } catch (error) {
      const message = error && error.data ? error.data.message : "";
      const messageText =
        message === "nickname too long"
          ? "昵称最多10个字"
          : message === "nickname contains sensitive words"
            ? "昵称包含敏感词"
            : message === "invalid wechat"
              ? "微信号格式不正确"
              : message === "invalid qq"
                ? "QQ号格式不正确"
                : message === "invalid mobile"
                  ? "手机号格式不正确"
                  : "提交失败，请重试";

      wx.showToast({
        title: messageText,
        icon: "none",
      });
    } finally {
      wx.hideLoading();
      this.setData({ submitting: false });
    }
  },

  navigateByRedirect(redirect) {
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
});
