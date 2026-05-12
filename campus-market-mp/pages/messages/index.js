const { approveExchange, rejectExchange } = require("../../services/exchange");
const { getMessageList } = require("../../services/message");
const { requireLogin } = require("../../utils/guard");
const { countUnreadMessages, getLastReadMessageAt, markMessagesRead } = require("../../utils/message-badge");

Page({
  data: {
    loading: true,
    loadFailed: false,
    groupedMessages: {
      received: [],
      result: [],
      sent: [],
      system: [],
    },
    unreadCount: 0,
  },

  onShow() {
    if (!requireLogin("/pages/login/index", "pages/messages/index")) {
      return;
    }

    this.fetchMessages();
  },

  onPullDownRefresh() {
    if (!requireLogin("/pages/login/index", "pages/messages/index")) {
      wx.stopPullDownRefresh();
      return;
    }

    this.fetchMessages({ stopRefresh: true });
  },

  async fetchMessages(options = {}) {
    const { stopRefresh = false } = options;

    this.setData({
      loading: true,
      loadFailed: false,
    });

    try {
      const result = await getMessageList();
      const messages = result.data || [];
      const lastReadAt = getLastReadMessageAt();
      const groupedMessages = this.groupMessages(messages, lastReadAt);
      const unreadCount = countUnreadMessages(messages);

      this.setData({
        groupedMessages,
        unreadCount,
      });

      markMessagesRead();
    } catch (error) {
      this.setData({ loadFailed: true });
      wx.showToast({
        title: "消息加载失败",
        icon: "none",
      });
    } finally {
      this.setData({ loading: false });
      if (stopRefresh) {
        wx.stopPullDownRefresh();
      }
    }
  },

  groupMessages(messages, lastReadAt) {
    const lastReadTime = lastReadAt ? new Date(lastReadAt).getTime() : 0;
    const grouped = {
      received: [],
      result: [],
      sent: [],
      system: [],
    };

    messages.forEach((item) => {
      const category = grouped[item.category] ? item.category : "system";
      grouped[category].push({
        ...item,
        timeText: this.formatTime(item.createdAt),
        isUnread:
          category !== "sent" &&
          (!lastReadTime || new Date(item.createdAt).getTime() > lastReadTime),
      });
    });

    return grouped;
  },

  formatTime(dateString) {
    if (!dateString) {
      return "刚刚";
    }

    const date = new Date(dateString);
    return `${date.getMonth() + 1}-${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  },

  async handleApprove(event) {
    const { id } = event.currentTarget.dataset;
    await this.processExchange(id, "approve");
  },

  async handleReject(event) {
    const { id } = event.currentTarget.dataset;
    await this.processExchange(id, "reject");
  },

  async processExchange(id, action) {
    try {
      if (action === "approve") {
        await approveExchange(id);
      } else {
        await rejectExchange(id);
      }

      wx.showToast({
        title: action === "approve" ? "已同意" : "已拒绝",
        icon: "success",
      });
      this.fetchMessages();
    } catch (error) {
      wx.showToast({
        title: "处理失败",
        icon: "none",
      });
    }
  },

  handleRetry() {
    this.fetchMessages();
  },
});
