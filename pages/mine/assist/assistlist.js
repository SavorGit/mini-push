// pages/mine/assist/assistlist.js
const utils = require('../../../utils/util.js')
const app = getApp()
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
var page = 1;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    assist_friend_list:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    var forscreen_id = options.forscreen_id;
    that.setData({
      forscreen_id: forscreen_id,
    })
    utils.PostRequest(api_v_url + '/ForscreenHelp/userlist', {
      forscreen_id: forscreen_id,
      page: 1,
      pagesize:20
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        assist_friend_list:data.result.datalist
      })
    })
    
  },
  loadMore: function(e) {
    var that = this;
    var forscreen_id = e.target.dataset.forscreen_id;
    
    page = page + 1;
    utils.PostRequest(api_v_url + '/ForscreenHelp/userlist', {
      forscreen_id: forscreen_id,
      page: page,
      pagesize:20
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        assist_friend_list: data.result.datalist
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