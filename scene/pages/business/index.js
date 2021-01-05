// scene/pages/business/index.js
const utils = require('../../../utils/util.js')
var mta = require('../../../utils/mta_analysis.js')
const app = getApp()
var api_v_url = app.globalData.api_v_url;
var openid;
var box_mac;
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
    openid  = options.openid;
    box_mac = options.box_mac;
    this.getBussnessInfo(openid,box_mac);
  },
  /**
   * 获取商务功能数据
   */
  getBussnessInfo:function(openid,box_mac){
    var that = this;
    utils.PostRequest(api_v_url + '/aa/bb', {
      openid:openid,
      box_mac:box_mac,
    }, (data, headers, cookies, errMsg, statusCode) =>{
      that.setData({business_info:data.result})
    })
  },
  
  /**
   * 编辑/添加名片
   */
  gotoCard:function(e){
    wx.navigateTo({
      url: '/scene/pages/business/card/add?openid+'+openid+'&box_mac='+box_mac,
    })
  },
  /**
   * 分享名片
   */
  shareCard:function(e){

  },
  /**
   * 添加/编辑欢迎词
   */
  gotoWelcome:function(e){
    wx.navigateTo({
      url: '/scene/pages/business/card/add?openid+'+openid+'&box_mac='+box_mac+'&type=1',
    })
  },
  /**
   * 投屏欢迎词
   */
  forscreenWelcome:function(e){

  },
  /**
   * 添加/编辑分享文件
   */
  gotoShareFiles:function(e){
    wx.navigateTo({
      url: '/scene/pages/business/forfiles/index?openid+'+openid+'&box_mac='+box_mac,
    })
  },
  /**
   * 投屏分享文件
   */
  forscreenShareFile:function(e){
    
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