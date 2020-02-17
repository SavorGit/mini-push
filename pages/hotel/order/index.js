// pages/hotel/order/index.js
const app = getApp()
const utils = require('../../../utils/util.js')
const mta = require('../../../utils/mta_analysis.js')
var api_url = app.globalData.api_url;
var openid;
var page = 1;
var page_all = 1;
var page_dealing = 1;
var page_complete = 1;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    selectedTab: 'all',
    order_status: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu();
    var that = this;
    openid = options.openid
    var order_status = options.order_status
    that.setData({
      order_status: order_status
    })


    //全部订单
    utils.PostRequest(api_url + '/Smallapp4/order/dishOrderlist', {
      openid: openid,
      page: 1,
      status: 0
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        all_order_list: data.result.datalist
      })
    })
    //处理中的订单
    utils.PostRequest(api_url + '/Smallapp4/order/dishOrderlist', {
      openid: openid,

      page: 1,
      status: 1
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        deal_order_list: data.result.datalist
      })
    })
    //已完成的订单
    utils.PostRequest(api_url + '/Smallapp4/order/dishOrderlist', {
      openid: openid,
      page: 1,
      status: 2
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        complete_order_list: data.result.datalist
      })
    })
  },
  swichOrderList: function (e) {
    var that = this;
    var order_status = e.currentTarget.dataset.order_status
    that.setData({
      order_status: order_status,
    })

  },
  loadMore: function (e) {
    var that = this;
    var order_status = that.data.order_status
    if (order_status == 0) {
      page_all +=1;
      page = page_all;
    } else if (order_status == 1) {
      page_dealing += 1;
      page = page_dealing;
    } else if (order_status == 2) {
      page_complete += 1;
      page = page_complete;
    }
    //订单分页
    utils.PostRequest(api_url + '/Smallapp4/order/dishOrderlist', {
      openid: openid,
      page: page,
      status: order_status
    }, (data, headers, cookies, errMsg, statusCode) => {
      if (order_status == 0) {
        that.setData({
          all_order_list: data.result.datalist
        })
      } else if (order_status == 1) {
        that.setData({
          deal_order_list: data.result.datalist
        })
      } else if (order_status == 3) {
        that.setData({
          complete_order_list: data.result.datalist
        })
      }

    })
  },
  gotoDishDetail:function(e){
    var goods_id = e.currentTarget.dataset.goods_id;
    wx.navigateTo({
      url: '/pages/hotel/dishes/detail?goods_id='+goods_id,
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
  switchTab: function (e) {
    let self = this;
    let selectedTab = e.currentTarget.dataset.tab;
    self.setData({ selectedTab: selectedTab });
  }
})