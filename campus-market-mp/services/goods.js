const { request } = require("./request");

function getHotGoods() {
  return request({
    url: "/goods/hot",
    method: "GET",
  });
}

function getGoodsList(params = {}) {
  return request({
    url: "/goods/list",
    method: "GET",
    data: params,
  });
}

function searchGoods(params = {}) {
  return request({
    url: "/goods/search",
    method: "GET",
    data: params,
  });
}

function getGoodsDetail(id) {
  return request({
    url: `/goods/${id}`,
    method: "GET",
  });
}

function incrementGoodsView(id) {
  return request({
    url: `/goods/${id}/view`,
    method: "POST",
  });
}

function getMyGoods() {
  return request({
    url: "/goods/mine",
    method: "GET",
  });
}

function createGoods(payload) {
  return request({
    url: "/goods",
    method: "POST",
    data: payload,
  });
}

function updateGoods(id, payload) {
  return request({
    url: `/goods/${id}/update`,
    method: "POST",
    data: payload,
  });
}

function offShelfGoods(id) {
  return request({
    url: `/goods/${id}/off-shelf`,
    method: "POST",
  });
}

function deleteGoods(id) {
  return request({
    url: `/goods/${id}/delete`,
    method: "POST",
  });
}

function getGoodsSellerMarket(userNo) {
  return request({
    url: "/goods/list",
    method: "GET",
    data: {
      sellerUserNo: userNo,
    },
  });
}

module.exports = {
  getHotGoods,
  getGoodsList,
  searchGoods,
  getGoodsDetail,
  incrementGoodsView,
  getMyGoods,
  createGoods,
  updateGoods,
  offShelfGoods,
  deleteGoods,
  getGoodsSellerMarket,
};
