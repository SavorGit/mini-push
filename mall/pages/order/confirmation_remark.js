// mall/pages/order/confirmation_remark.js
/**
 * 【商城】订单确认备注页面
 */
const app = getApp()
const utils = require('../../../utils/util.js')
const mta = require('../../../utils/mta_analysis.js')
var api_url = app.globalData.api_url;
var cache_key = app.globalData.cache_key;

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
    var remark_strs = wx.getStorageSync(cache_key + 'mall_order:remark')
    if (remark_strs != '') {
      that.setData({
        remark_strs: remark_strs
      })
    }
  },
  saveRemark: function (e) {
    var remark_strs = this.data.remark_strs;
    if (remark_strs != '') {
      wx.setStorageSync(cache_key + 'mall_order:remark', remark_strs);
    }
    wx.navigateBack({
      delta: 1
    })
  },
  setInputRemark: function (e) {
    var that = this;
    var remark_strs = e.detail.value;
    this.setData({
      remark_strs: remark_strs
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