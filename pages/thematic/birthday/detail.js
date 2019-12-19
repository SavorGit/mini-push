// pages/thematic/birthday/detail.js
var mta = require('../../../utils/mta_analysis.js')
const app = getApp();
var constellation_name;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    detail_url: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    that.setData({
      detail_url: options.url + '?miniProgram=' + encodeURIComponent('{"navigationBarTitleText":"' + options.constellname + '","statusBarHeight":' + getApp().globalData.statusBarHeight+',"backgroundColor":"#EDEDED","color":"#333333"}')
    })
    constellation_name = options.constellname
    mta.Event.stat('constellationDetail', { 'name': constellation_name, 'ctype': 1 })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    mta.Event.stat('constellationDetail', { 'name': constellation_name, 'ctype': 2 })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})