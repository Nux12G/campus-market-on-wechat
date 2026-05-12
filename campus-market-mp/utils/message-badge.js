const LAST_READ_MESSAGE_AT = "campus_market_last_read_message_at";

function getLastReadMessageAt() {
  return wx.getStorageSync(LAST_READ_MESSAGE_AT) || "";
}

function markMessagesRead() {
  wx.setStorageSync(LAST_READ_MESSAGE_AT, new Date().toISOString());
}

function countUnreadMessages(messages = []) {
  const lastReadAt = getLastReadMessageAt();

  if (!lastReadAt) {
    return messages.filter((item) => item.category !== "sent").length;
  }

  const lastReadTime = new Date(lastReadAt).getTime();
  return messages.filter((item) => {
    if (item.category === "sent") {
      return false;
    }

    return new Date(item.createdAt).getTime() > lastReadTime;
  }).length;
}

async function refreshMessageBadge() {
  return 0;
}

module.exports = {
  getLastReadMessageAt,
  markMessagesRead,
  countUnreadMessages,
  refreshMessageBadge,
};
