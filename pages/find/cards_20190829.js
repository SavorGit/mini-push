// pages/find/cards_20190829.js
var app = getApp();
var util = require("../../utils/util.js")

var touchEvent = [];
var touchMoveExecuteTrip = 50;
var systemInfo = {
  SDKVersion: "",
  batteryLevel: 0,
  brand: "",
  errMsg: "",
  fontSizeSetting: 16,
  language: "zh",
  model: "",
  pixelRatio: 1,
  platform: "",
  statusBarHeight: 0,
  system: "",
  version: "",
  safeArea: {
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  window: {
    width: 0,
    height: 0
  },
  screen: {
    width: 0,
    height: 0
  }
};


Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: app.globalData.statusBarHeight,
    cards_img: [
      'http://oss.littlehotspot.com/forscreen/resource/1544865904825.jpg',
      'http://oss.littlehotspot.com/forscreen/resource/1547690338762.jpg',
      'http://oss.littlehotspot.com/forscreen/resource/1550142746462.mp4?x-oss-process=video/snapshot,t_3000,f_jpg,w_450,m_fast'
    ],
    // cards: [{
    //   x: 0,
    //   y: 0
    // }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var self = this;
    wx.getSystemInfo({
      success: function(res) {
        // console.log(res, app);
        systemInfo.SDKVersion = res.SDKVersion;
        systemInfo.batteryLevel = res.batteryLevel;
        systemInfo.brand = res.brand;
        systemInfo.errMsg = res.errMsg;
        systemInfo.fontSizeSetting = res.fontSizeSetting;
        systemInfo.language = res.language;
        systemInfo.model = res.model;
        systemInfo.pixelRatio = res.pixelRatio;
        systemInfo.platform = res.platform;
        systemInfo.statusBarHeight = res.statusBarHeight;
        systemInfo.system = res.system;
        systemInfo.version = res.version;
        systemInfo.safeArea.width = res.safeArea.width;
        systemInfo.safeArea.height = res.safeArea.height;
        systemInfo.safeArea.top = res.safeArea.top;
        systemInfo.safeArea.left = res.safeArea.left;
        systemInfo.safeArea.right = res.safeArea.right;
        systemInfo.safeArea.bottom = res.safeArea.bottom;
        systemInfo.window.width = res.windowWidth;
        systemInfo.window.height = res.windowHeight;
        systemInfo.screen.width = res.screenWidth;
        systemInfo.screen.height = res.screenHeight;
        // console.log(systemInfo);
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
  onShow: function(options) {

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
  /**
   * 点击事件
   */
  onClick: function(e) {

  },
  /**
   * 手指触摸动作开始
   */
  onTouchStart: function(e) {
    touchEvent["touchStart"] = e;
  },
  /**
   * 手指触摸动作结束
   */
  onTouchEnd: function(e) {
    touchEvent["touchEnd"] = e;
    this.touchMoveHandle();
  },
  /**
   * 滑动处理
   */
  touchMoveHandle: function() {
    var moveExecuteTrip = touchMoveExecuteTrip / systemInfo.pixelRatio;
    var xTrip = touchEvent["touchEnd"].changedTouches[0].pageX - touchEvent["touchStart"].changedTouches[0].pageX;
    var yTrip = touchEvent["touchEnd"].changedTouches[0].pageY - touchEvent["touchStart"].changedTouches[0].pageY;
    if (xTrip <= -1 * moveExecuteTrip) {
      this.toLeftHandle(touchEvent["touchStart"], touchEvent["touchEnd"]);
    } else if (xTrip >= moveExecuteTrip) {
      this.toRightHandle(touchEvent["touchStart"], touchEvent["touchEnd"]);
    }
    if (yTrip <= -1 * moveExecuteTrip) {
      this.toTopHandle(touchEvent["touchStart"], touchEvent["touchEnd"]);
    } else if (yTrip >= moveExecuteTrip) {
      this.toBottomHandle(touchEvent["touchStart"], touchEvent["touchEnd"]);
    }
  },
  /**
   * 向左滑动处理
   */
  toLeftHandle: function(startEvent, endEvent) {
    var self = this;
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'cubic-bezier(.8,.2,.1,0.8)',
    });
    animation = animation;
    animation.translateX(-420).rotate(-180).translateY(0).scale(0.2).opacity(0.1).step();
    animation.translateX(0).translateY(0).rotate(0).scale(1).opacity(1).step();
    this.setData({
      animationData: animation.export()
    });
  },
  /**
   * 向右滑动处理
   */
  toRightHandle: function(startEvent, endEvent) {
    var self = this;
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'cubic-bezier(.8,.2,.1,0.8)',
    });
    animation = animation;
    animation.translateX(420).rotate(180).translateY(0).scale(0.2).opacity(0.1).step();
    animation.translateX(0).translateY(0).rotate(0).scale(1).opacity(1).step();
    this.setData({
      animationData: animation.export()
    });
  },
  /**
   * 向上滑动处理
   */
  toTopHandle: function(startEvent, endEvent) {
    console.log("toTopHandle", startEvent, endEvent);
  },
  /**
   * 向下滑动处理
   */
  toBottomHandle: function(startEvent, endEvent) {
    console.log("toBottomHandle", startEvent, endEvent);
  }
})