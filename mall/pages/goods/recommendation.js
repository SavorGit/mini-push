// mall/pages/goods/recommendation.js
/**
 * 【商城】商品推荐页面
 */

const utils = require('../../../utils/util.js')
var mta = require('../../../utils/mta_analysis.js')
const app = getApp()
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
var cache_key = app.globalData.cache_key;
var page = 1;
var pagesize = 10;

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
    that.getRecList(page,pagesize);
  },
  getRecList: function (page) {
    var that = this;
    utils.PostRequest(api_v_url + '/shop/recommend', {
      page: page,
      pagesize: pagesize
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        rec_list: data.result,
      })
    });
  },
  loadMore:function(e){
    var that = this;
    page +=1;
    that.getRecList(page);
  },
  gotoDetail:function(e){
    var goods_id = e.currentTarget.dataset.goods_id;
    wx.navigateTo({
      url: '/mall/pages/goods/detail?goods_id=' + goods_id,
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