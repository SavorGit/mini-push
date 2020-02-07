// pages/hotel/waiter_evaluate.js
/*
 *服务员评价页
 */
const utils = require('../../utils/util.js')
var mta = require('../../utils/mta_analysis.js')
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: app.globalData.statusBarHeight
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var openid = options.openid;
    var box_id = options.box_id;
    that.setData({
      openid:openid,
      box_id:box_id,
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

  },
  // 跳转到服务员评价页
  gotoPageHotelWaiterEvaluate: function (e) {
    let that = this;
    var box_id = e.currentTarget.dataset.box_id
    var openid = e.currentTarget.dataset.openid
    
    wx.navigateTo({
      url: '/pages/hotel/waiter_evaluate_h5?openid='+openid+'&box_id='+box_id,
    });
  }
})