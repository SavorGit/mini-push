// pages/forscreen/forfile/h5files.js
const util = require('../../../utils/util.js')
const app = getApp()
var api_url = app.globalData.api_url;
var openid;
var box_mac;
var is_open_simple;
var mobile_brand = app.globalData.mobile_brand;
var mobile_model = app.globalData.mobile_model;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    pixelRatio: 0,
    screenHeight: 0,
    screenWidth: 0,
    windowHeight: 0,
    windowWidth: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options);
    var that = this;
    openid = options.openid;
    box_mac = options.box_mac;
    is_open_simple = options.is_open_simple;
    that.setData({
      openid: openid,
      box_mac: box_mac,
      is_open_simple: is_open_simple,
      mobile_brand: mobile_brand,
      mobile_model: mobile_model,
    });
    wx.getSystemInfo({
      success: function(res) {
        console.log(res);
        var web_url = "https://mobile.littlehotspot.com/h5/fileforscreen/launch_file?windowHeight=" + res.windowHeight + "&statusBarHeight=" + res.statusBarHeight + "&box_mac=" + box_mac + "&mobile_brand=" + mobile_brand+"&mobile_model="+mobile_model+"&openid="+openid+"&is_open_simple="+is_open_simple
        web_url = encodeURI(web_url);
        console.log(web_url);
        that.setData({
          web_url:web_url,
          pixelRatio: res.pixelRatio,
          screenHeight: res.screenHeight,
          screenWidth: res.screenWidth,
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        });
      }
    });
    
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

  },

  pageLoad: function(event) {
  }
})