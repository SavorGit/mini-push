// games/pages/gamelist.js
const utils = require('../../utils/util.js')
var mta = require('../../utils/mta_analysis.js')
const app = getApp()
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
var cache_key = app.globalData.cache_key;
var box_mac;
var openid;
var page;
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
    var that = this;
    box_mac = options.box_mac;
    openid  = options.openid;
    page    = 1;
    //获取游戏列表
    that.getGameList();

  },
  getGameList:function(){
    var that = this;
    utils.PostRequest(api_v_url + '/aa/bb', {
      page:page
    }, (data, headers, cookies, errMsg, statusCode) =>{
      that.setData({
        gameList:data.result.datalist,
      })

    });
  },
  loadMore: function (e) {
    var that = this;
    page += 1;
    that.getGameList();
  },
  gotoGameDetail:function(e){
    var that = this;
    var keys = e.currentTarget.dataset.keys;
    var gameList = that.data.gameList;
    var jumpUrl = gameList[keys].url;
    var game_id = gameList[keys].id;
    jumpUrl +='?openid='+openid+'&box_mac='+box_mac+'&game_id='+game_id;
    wx.navigateTo({
      url: jumpUrl,
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