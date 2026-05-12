const { addSensitiveWord, getSensitiveWords } = require("../../services/admin");

Page({
  data: {
    loading: true,
    loadFailed: false,
    words: [],
    word: "",
  },

  onShow() {
    this.fetchWords();
  },

  async fetchWords() {
    this.setData({
      loading: true,
      loadFailed: false,
    });

    try {
      const result = await getSensitiveWords();
      this.setData({
        words: result.data || [],
      });
    } catch (error) {
      this.setData({ loadFailed: true });
      wx.showToast({
        title: "敏感词加载失败",
        icon: "none",
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  handleInput(event) {
    this.setData({
      word: event.detail.value.slice(0, 20),
    });
  },

  async handleSubmit() {
    const word = this.data.word.trim();

    if (!word) {
      wx.showToast({
        title: "请输入敏感词",
        icon: "none",
      });
      return;
    }

    try {
      await addSensitiveWord({ word });
      wx.showToast({
        title: "敏感词已添加",
        icon: "success",
      });
      this.setData({ word: "" });
      this.fetchWords();
    } catch (error) {
      wx.showToast({
        title: "添加失败",
        icon: "none",
      });
    }
  },
});
