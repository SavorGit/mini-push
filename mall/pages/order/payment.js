// mall/pages/order/payment.js
/**
 * 【商城】支付页面
 */
const utils = require('../../../utils/util.js')
var mta = require('../../../utils/mta_analysis.js')
const app = getApp()
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
var cache_key = app.globalData.cache_key;

var openid;
var order_id;
var jump_type;
var page = 1;
var pagesize = 20;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    SystemInfo: getApp().SystemInfo,
    statusBarHeight: getApp().globalData.statusBarHeight,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this; 
    console.log(options)
    order_id = options.order_id;
    openid   = options.openid;
    jump_type = options.jump_type;
    that.setData({jump_type,jump_type})
    that.getRecommend('', 1, 3);
  },
  getRecommend: function (goods_id, page, pagesize) {
    var that = this;
    utils.PostRequest(api_v_url + '/shop/recommend', {
      page: page,
      pagesize: pagesize,
      goods_id: goods_id
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        rec_list: data.result,
      })
    });
  },
  gotoOrderDetail:function(e){
    var that = this;
    if(jump_type==1){
      var url = '/mall/pages/order/list?openid='+openid+'&order_status=0'
    }else if(jump_type==2){
      var url = '/mall/pages/order/detail?order_id='+order_id+'&openid='+openid
    }
    wx.navigateTo({
      url: url,
    })
  },
  gotoIndex:function(e){
    wx.switchTab({
      url: '/pages/shopping/index',
    })
  },
  gotoRecList:function(e){
    wx.navigateTo({
      url: '/mall/pages/goods/recommendation',
    })
  },
  gotoGoodsDetail: function (e) {
    var goods_id = e.currentTarget.dataset.goods_id;
    wx.navigateTo({
      url: '/mall/pages/goods/detail?goods_id=' + goods_id,
    })
  },
  loadMore:function(e){
    var that = this;
    page +=1;
    that.getRecommend('',page,pagesize);
  },

  //购物车减数量
  cutNum: function (e) {
    var that = this;
    var goods_info = that.data.goods_info;
    var stock_num = goods_info.stock_num; //库存
    if (goods_info.amount == 1) {
      app.showToast('至少选择一件商品');
      return false;
    }
    goods_info.amount -= 1;
    that.setData({
      goods_info: goods_info,
    })
  },
  //购物车增数量
  addNum: function (e) {
    var that = this;
    var goods_info = that.data.goods_info;
    var stock_num = goods_info.stock_num; //库存
    if (goods_info.amount == stock_num) {
      app.showToast('该商品库存不足');
      return false;
    }
    goods_info.amount += 1;
    that.setData({
      goods_info: goods_info,
    })
  },
  addMallCart: function (e) {
    var that = this;
    var goods_info = that.data.goods_info;
    goods_info.ischecked = true;
    var user_info = wx.getStorageSync("savor_user_info");
    var openid = user_info.openid;
    var mall_cart_list = wx.getStorageSync(cache_key + 'mall_cart_' + openid);
    if (mall_cart_list == '') {
      mall_cart_list = [];
      mall_cart_list.unshift(goods_info);
      mall_cart_list = JSON.stringify(mall_cart_list);
      wx.setStorageSync(cache_key + 'mall_cart_' + openid, mall_cart_list)
      that.setData({
        mall_cart_nums: goods_info.amount
      })
    } else {
      mall_cart_list = JSON.parse(mall_cart_list)

      var is_have = 0;
      for (var i = 0; i < mall_cart_list.length; i++) {
        if (mall_cart_list[i].id == goods_info.id) {
          mall_cart_list[i].amount += goods_info.amount;
          mall_cart_list[i].ischecked = true;
          is_have = 1;
          break;
        }
      }
      if (is_have == 0) {
        mall_cart_list.unshift(goods_info);
      }
      var mall_cart_nums = 0;
      for (let index in mall_cart_list) {
        mall_cart_nums += mall_cart_list[index].amount;
      }
      that.setData({
        mall_cart_nums: mall_cart_nums
      })

      mall_cart_list = JSON.stringify(mall_cart_list);
      wx.setStorageSync(cache_key + 'mall_cart_' + openid, mall_cart_list)
    }

    app.showToast('添加购物车成功');
  },
  // 打开购买弹窗
  openBuyGoodsPopWindow: function (e) {
    let self = this;
    var goods_info = e.currentTarget.dataset.goods_info;
    goods_info.amount = 1;
    self.setData({
      showBuyGoodsPopWindow: true,
      goods_info: goods_info
    });
  },

  // 关闭购买弹窗
  closeBuyGoodsPopWindow: function (e) {
    let self = this;
    self.setData({
      showBuyGoodsPopWindow: false
    });
  },
  buyOne: function (e) {
    var that = this;
    var goods_info = that.data.goods_info;
    var user_info = wx.getStorageSync("savor_user_info");
    var openid = user_info.openid;
    wx.navigateTo({
      url: '/mall/pages/order/confirmation?goods_id=' + goods_info.id + '&openid=' + openid + '&order_type=1&amount=' + goods_info.amount,
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})