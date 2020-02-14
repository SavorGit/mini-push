// pages/hotel/order/account.js
const app = getApp()
const utils = require('../../../utils/util.js')
const mta = require('../../../utils/mta_analysis.js')
var api_url = app.globalData.api_url;
var goods_id;
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    goods_id = options.goods_id;

  },
  /**
   * 下单
   */
  placeOrder:function(e){
    var that = this;
    //下单
    utils.PostRequest(api_url + '/Smallapp4/order/addDishorder', {
      address: address,
      amount: amount,
      contact: contact,
      delivery_time: delivery_time,
      goods_id: goods_id,
      openid: openid,
      phone: phone,
      remark: remark
    }, (data, headers, cookies, errMsg, statusCode) => self.setData({
      
    }));
    
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