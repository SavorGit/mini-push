// mall/pages/order/gift.js
const utils   = require('../../../utils/util.js')
var mta       = require('../../../utils/mta_analysis.js')
const app     = getApp()
var api_url   = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
var cache_key = app.globalData.cache_key;
var openid;
var order_id;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    is_edit_send_word:false, //是否修改寄语
    send_word:'',            //寄语
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    openid = options.openid;
    order_id = options.order_id;
    that.getOrderInfo(openid,order_id);
    
  },
  getOrderInfo:function(openid,order_id){
    var that = this;
    utils.PostRequest(api_v_url + '/aa/bb', {
      openid: openid,
      order_id:order_id
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        order_goods_list:data.result.goods,
      })
    })
  },
  //点击笔头修改寄语
  editSendWord:function(e){
    var that = this;
    that.setData({
      is_edit_send_word:true,
    })
  },
  //保存寄语
  saveSendWord:function(e){
    var that = this;
    var send_word = e.detail.value.send_word;
    utils.PostRequest(api_v_url + '/aa/bb', {
      openid: openid,
      order_id:order_id,
      send_word:send_word,
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        send_word:send_word,
      })
    })
  },
  //查看赠送进度
  viewOrderDetail:function(e){
    wx.navigateTo({
      url: '/mall/pages/order/gift_detail_send?order_id='+order_id+'&openid='+openid,
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
    var user_info = wx.getStorageSync(cache_key+'user_info');

    var nickName   = user_info.nickName
    var goods_name = that.data.goods_name;
    var img_url    = that.data.img_url

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