// mall/pages/order/detail.js
/**
 * 【商城】订单详情页面
 */
const utils = require('../../../utils/util.js')
var mta = require('../../../utils/mta_analysis.js')
const app = getApp()
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
var cache_key = app.globalData.cache_key;
var order_id;
var openid;
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
    order_id = options.order_id;
    openid   = options.openid;
    that.getOrderInfo(order_id);
  },
  getOrderInfo(){
    var that = this;
    utils.PostRequest(api_v_url + '/order/detail', {
      openid: openid,
      order_id: order_id,
    }, (data, headers, cookies, errMsg, statusCode) => {
      var express = data.result.express;
      console.log(express)
      that.setData({
        order_info:data.result,
        express: data.result.express,
        merchant:data.result.merchant
      })
    })
  },
  phonecallevent:function(e){
    var tel = e.detail.value;
    app.phonecallevent(tel);
  },
  gotoExinfo:function(e){
    wx.navigateTo({
      url: '/mall/pages/order/logistics?order_id='+order_id+'&openid='+openid,
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