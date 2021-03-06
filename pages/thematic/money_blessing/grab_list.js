// 抢红包-红包列表 pages/thematic/money_blessing/grab_list.js
const utils = require('../../../utils/util.js')
const app = getApp();
var openid;
var page = 1;
var box_mac;
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    hiddens:true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    box_mac = options.box_mac;
    utils.PostRequest(api_v_url+'/redpacket/sendList', {
      openid: openid,
      page:page
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        redpacket_list:data.result,
        box_mac:box_mac,
      })

    },res=>{
      wx.navigateBack({
        delta: 1
      })
      app.showToast('获取红包列表失败');
      
    })
    
  },
  //上拉刷新
  loadMore: function (e) {
    var that = this;
    
    page = page + 1;
    
    utils.PostRequest(api_v_url+'/redpacket/sendList', {
      page: page,
        openid: openid,
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        redpacket_list: data.result,
        hiddens: true,
      })
    })
    
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

  }
})