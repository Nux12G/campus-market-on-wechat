const { getGoodsList, searchGoods } = require("../../services/goods");
const { requireLogin } = require("../../utils/guard");
const { getToken } = require("../../utils/storage");

const SORT_OPTIONS = [
  { label: "热度优先", value: "viewCount" },
  { label: "最新发布", value: "latest" },
];

const CAMPUS_OPTIONS = [
  "全部校区",
  "海甸校区",
  "观澜湖修校区",
  "城西校区",
  "儋州校区",
];

Page({
  data: {
    sortBy: "viewCount",
    sortOptions: SORT_OPTIONS,
    campusOptions: CAMPUS_OPTIONS,
    activeCampus: "全部校区",
    keyword: "",
    inputKeyword: "",
    isLoggedIn: false,
    loading: true,
    loadingMore: false,
    loadFailed: false,
    goodsList: [],
    pagination: {
      page: 1,
      pageSize: 8,
      total: 0,
      totalPages: 1,
      hasMore: false,
    },
    initialized: false,
  },

  onLoad() {
    this.syncLoginState();
    this.fetchGoods({ reset: true });
  },

  onShow() {
    this.syncLoginState();

    if (this.data.initialized) {
      this.fetchGoods({ reset: true });
    }
  },

  onPullDownRefresh() {
    this.fetchGoods({
      reset: true,
      stopRefresh: true,
    });
  },

  onReachBottom() {
    const { loading, loadingMore, pagination } = this.data;

    if (loading || loadingMore || !pagination.hasMore) {
      return;
    }

    this.fetchGoods({
      reset: false,
      page: pagination.page + 1,
    });
  },

  syncLoginState() {
    this.setData({
      isLoggedIn: Boolean(getToken()),
    });
  },

  async fetchGoods(options = {}) {
    const { reset = false, page = 1, stopRefresh = false } = options;
    const { pagination, sortBy, keyword, activeCampus } = this.data;
    const targetPage = reset ? 1 : page;
    const isSearching = Boolean(keyword);
    const campus = activeCampus === "全部校区" ? "" : activeCampus;

    this.setData({
      loading: reset,
      loadingMore: !reset,
      loadFailed: false,
    });

    try {
      const requestFn = isSearching ? searchGoods : getGoodsList;
      const result = await requestFn({
        page: targetPage,
        pageSize: pagination.pageSize,
        sortBy,
        campus,
        ...(isSearching ? { keyword } : {}),
      });

      const data = result.data || {};
      const list = (data.list || []).map((item) => this.normalizeGoods(item));
      const campusOptions = data.campusOptions
        ? ["全部校区"].concat(data.campusOptions)
        : this.data.campusOptions;

      this.setData({
        goodsList: reset ? list : this.data.goodsList.concat(list),
        pagination: data.pagination || this.data.pagination,
        campusOptions,
        loadFailed: false,
        initialized: true,
      });
    } catch (error) {
      this.setData({
        loadFailed: reset || !this.data.goodsList.length,
      });
      wx.showToast({
        title: "加载失败，请重试",
        icon: "none",
      });
    } finally {
      this.setData({
        loading: false,
        loadingMore: false,
      });

      if (stopRefresh) {
        wx.stopPullDownRefresh();
      }
    }
  },

  normalizeGoods(item) {
    return {
      ...item,
      priceText: Number(item.expectedPrice).toFixed(0),
      viewText: this.formatViewCount(item.viewCount),
      publishText: this.formatPublishText(item.publishedAt),
    };
  },

  formatViewCount(count) {
    if (count >= 10000) {
      return `${(count / 10000).toFixed(1)}w`;
    }

    return `${count}`;
  },

  formatPublishText(dateString) {
    if (!dateString) {
      return "刚刚发布";
    }

    const publishedAt = new Date(dateString);
    const now = new Date();
    const diffHours = Math.max(1, Math.floor((now - publishedAt) / (1000 * 60 * 60)));

    if (diffHours < 24) {
      return `${diffHours}小时前`;
    }

    return `${Math.floor(diffHours / 24)}天前`;
  },

  handleInput(event) {
    this.setData({
      inputKeyword: event.detail.value,
    });
  },

  handleSearchAccess() {
    if (this.data.isLoggedIn) {
      return;
    }

    requireLogin("/pages/login/index", "pages/market/index");
  },

  handleSearch() {
    if (!this.data.isLoggedIn) {
      this.handleSearchAccess();
      return;
    }

    this.setData({
      keyword: this.data.inputKeyword.trim(),
    });
    this.fetchGoods({ reset: true });
  },

  handleClearSearch() {
    this.setData({
      keyword: "",
      inputKeyword: "",
    });
    this.fetchGoods({ reset: true });
  },

  handleSortChange(event) {
    const { sort } = event.currentTarget.dataset;

    if (sort === this.data.sortBy) {
      return;
    }

    this.setData({ sortBy: sort });
    this.fetchGoods({ reset: true });
  },

  handleCampusChange(event) {
    const { campus } = event.currentTarget.dataset;

    if (campus === this.data.activeCampus) {
      return;
    }

    this.setData({
      activeCampus: campus,
    });
    this.fetchGoods({ reset: true });
  },

  handleGoDetail(event) {
    const { id } = event.currentTarget.dataset;

    wx.navigateTo({
      url: `/pages/goods-detail/index?id=${id}`,
    });
  },

  handleRetry() {
    this.fetchGoods({ reset: true });
  },
});
