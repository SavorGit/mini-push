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
    wx.navigateTo({
      url: '/mall/pages/order/detail?order_id='+order_id+'&openid='+openid,
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