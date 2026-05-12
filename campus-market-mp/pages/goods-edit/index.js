const { getGoodsDetail, updateGoods } = require("../../services/goods");

const CAMPUS_OPTIONS = ["海甸校区", "观澜湖修校区", "城西校区", "儋州校区"];
const SHELF_LIFE_OPTIONS = ["无", "指定日期"];

Page({
  data: {
    goodsId: "",
    loading: true,
    loadFailed: false,
    submitting: false,
    campusOptions: CAMPUS_OPTIONS,
    campusIndex: 0,
    shelfLifeOptions: SHELF_LIFE_OPTIONS,
    shelfLifeIndex: 0,
    today: "2026-04-13",
    form: {
      title: "",
      price: "",
      shelfLifeType: "无",
      shelfLifeDate: "",
      campusName: CAMPUS_OPTIONS[0],
      description: "",
      images: [],
    },
    errors: {
      title: "",
      price: "",
      campusName: "",
      shelfLifeDate: "",
      images: "",
      description: "",
    },
  },

  onLoad(options) {
    const goodsId = options.id || "";
    this.setData({ goodsId });
    this.fetchGoodsDetail(goodsId);
  },

  async fetchGoodsDetail(goodsId) {
    if (!goodsId) {
      this.setData({ loading: false, loadFailed: true });
      return;
    }

    this.setData({ loading: true, loadFailed: false });

    try {
      const result = await getGoodsDetail(goodsId);
      const detail = result.data || {};
      const shelfLifeType = detail.shelfLifeText && detail.shelfLifeText !== "无" ? "指定日期" : "无";
      const campusIndex = Math.max(0, this.data.campusOptions.indexOf(detail.campusName));
      const shelfLifeIndex = Math.max(0, this.data.shelfLifeOptions.indexOf(shelfLifeType));

      this.setData({
        campusIndex,
        shelfLifeIndex,
        form: {
          title: detail.title || "",
          price: detail.expectedPrice ? String(detail.expectedPrice) : "",
          shelfLifeType,
          shelfLifeDate: shelfLifeType === "指定日期" ? detail.shelfLifeText : "",
          campusName: detail.campusName || CAMPUS_OPTIONS[0],
          description: detail.description || "",
          images: detail.images || [],
        },
      });
    } catch (error) {
      this.setData({ loadFailed: true });
      wx.showToast({
        title: "编辑商品加载失败",
        icon: "none",
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  handleCampusChange(event) {
    const campusIndex = Number(event.detail.value);
    const campusName = this.data.campusOptions[campusIndex] || this.data.campusOptions[0];
    this.setData({
      campusIndex,
      "form.campusName": campusName,
      "errors.campusName": "",
    });
  },

  handleShelfLifeTypeChange(event) {
    const shelfLifeIndex = Number(event.detail.value);
    const shelfLifeType = this.data.shelfLifeOptions[shelfLifeIndex] || this.data.shelfLifeOptions[0];
    this.setData({
      shelfLifeIndex,
      "form.shelfLifeType": shelfLifeType,
      "form.shelfLifeDate": shelfLifeType === "无" ? "" : this.data.form.shelfLifeDate,
      "errors.shelfLifeDate": "",
    });
  },

  handleShelfLifeDateChange(event) {
    this.setData({
      "form.shelfLifeDate": event.detail.value,
      "errors.shelfLifeDate": "",
    });
  },

  handleInput(event) {
    const { field } = event.currentTarget.dataset;
    const value =
      field === "title"
        ? event.detail.value.slice(0, 10)
        : field === "description"
          ? event.detail.value.slice(0, 60)
          : event.detail.value;
    this.setData({
      [`form.${field}`]: value,
      [`errors.${field}`]: "",
    });
  },

  chooseImages() {
    const remainCount = 3 - this.data.form.images.length;
    if (remainCount <= 0) {
      wx.showToast({
        title: "最多上传3张图片",
        icon: "none",
      });
      return;
    }

    wx.chooseMedia({
      count: remainCount,
      mediaType: ["image"],
      sizeType: ["compressed"],
      sourceType: ["album", "camera"],
      success: (res) => {
        const tempFiles = (res.tempFiles || []).map((item) => item.tempFilePath);
        this.setData({
          "form.images": this.data.form.images.concat(tempFiles).slice(0, 3),
          "errors.images": "",
        });
      },
      fail: () => {
        wx.showToast({
          title: "图片选择失败",
          icon: "none",
        });
      },
    });
  },

  handleDeleteImage(event) {
    const { index } = event.currentTarget.dataset;
    const images = this.data.form.images.slice();
    images.splice(index, 1);
    this.setData({
      "form.images": images,
    });
  },

  validateForm() {
    const { form } = this.data;
    const errors = {
      title: "",
      price: "",
      campusName: "",
      shelfLifeDate: "",
      images: "",
      description: "",
    };

    if (!form.title.trim()) {
      errors.title = "请输入商品标题";
    }
    if (!form.price.trim()) {
      errors.price = "请输入预期价格";
    } else if (!/^\d+(\.\d{1,2})?$/.test(form.price.trim())) {
      errors.price = "价格格式不正确";
    }
    if (!form.campusName) {
      errors.campusName = "请选择校区";
    }
    if (form.shelfLifeType === "指定日期" && !form.shelfLifeDate) {
      errors.shelfLifeDate = "请选择保质期日期";
    }
    if (!form.images.length) {
      errors.images = "请至少上传1张商品图片";
    }
    if (!form.description.trim()) {
      errors.description = "请输入商品简介";
    } else if (form.description.trim().length < 8) {
      errors.description = "商品简介至少8个字";
    }

    this.setData({ errors });
    return Object.values(errors).every((item) => !item);
  },

  async handleSubmit() {
    if (this.data.submitting) {
      return;
    }
    if (!this.validateForm()) {
      wx.showToast({
        title: "请先完善表单信息",
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
      const { form, goodsId } = this.data;
      await updateGoods(goodsId, {
        title: form.title.trim(),
        price: form.price.trim(),
        campusName: form.campusName,
        description: form.description.trim(),
        images: form.images,
        shelfLifeType: form.shelfLifeType,
        shelfLifeDate: form.shelfLifeDate,
      });

      wx.showToast({
        title: "保存成功",
        icon: "success",
      });

      setTimeout(() => {
        wx.switchTab({
          url: "/pages/my-market/index",
        });
      }, 400);
    } catch (error) {
      wx.showToast({
        title: "保存失败，请重试",
        icon: "none",
      });
    } finally {
      wx.hideLoading();
      this.setData({ submitting: false });
    }
  },

  handleRetry() {
    this.fetchGoodsDetail(this.data.goodsId);
  },
});
