// mall/pages/order/gift_detail_send.js
/**
 * 【商城】赠送订单详情页面
 */

const utils = require('../../../../utils/util.js')
var mta = require('../../../../utils/mta_analysis.js')
const app = getApp()
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
var cache_key = app.globalData.cache_key;
var order_id ;
var openid ;
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
    that.getOrderInfo(order_id,openid);
  },
  getOrderInfo:function(e){
    var that = this;
    utils.PostRequest(api_v_url + '/order/detail', {
      openid:openid,
      order_id:order_id
    }, (data, headers, cookies, errMsg, statusCode) => {
      var goods   = data.result.goods[0];
      var merchant= data.result.merchant;
      var order_info = data.result;
      var gift_records = data.result.gift_records;
      var message = data.result.message
      that.setData({
        goods:goods,
        merchant:merchant,
        order_info:order_info,
        gift_records:gift_records
      })
    })
  },
  gotoGoodsDetail:function(e){
    var goods_id = e.currentTarget.dataset.goods_id;
    wx.navigateTo({
      url: '/pages/hotel/goods/detail?goods_id='+goods_id,
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
  onShareAppMessage: function (e) {
    var that = this;
    console.log(that.data)
    var nickName   = that.data.order_info.nickName
    var goods_name = that.data.goods.name;
    var img_url    = that.data.goods.img
    var title = nickName+'送你小热点好物'+goods_name;
    if (e.from === 'button') {
      // 来自页面内转发按钮
      return {
        title: title,
        path: '/pages/hotel/gift/share?order_id=' + order_id,
        imageUrl: img_url,
        success: function (res) {
        },
      }
    } else {
      return {
        title: title,
        path: '/pages/hotel/gift/share?order_id=' + order_id,
        imageUrl: img_url,
        success: function (res) {
        },
      }
    }

  }
})