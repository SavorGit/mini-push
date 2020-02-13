// pages/hotel/detail.js
const app = getApp()
const utils = require('../../utils/util.js')
const mta = require('../../utils/mta_analysis.js')
var api_url = app.globalData.api_url;
var merchant_id;
var page = 1;
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
    if (typeof (options.q) != 'undefined') {
      var q = decodeURIComponent(options.q);
      var selemite = q.indexOf("?");
      var pams = q.substring(selemite + 3, q.length);

      var pams_arr = pams.split('_');
      merchant_id = pams_arr[1];
    }else {
      merchant_id = options.merchant_id;
    }
    
    //商家详情
    utils.PostRequest(api_url + '/aa/bb/cc', {
      merchant_id: merchant_id,
    }, (data, headers, cookies, errMsg, statusCode) => self.setData({
      hotel_info: data.result
    }));

    //菜品列表
    utils.PostRequest(api_url + '/aa/bb/cc', {
      merchant_id: merchant_id,
      page:1
    }, (data, headers, cookies, errMsg, statusCode) => self.setData({
      dishes_list: data.result
    }));
  },
  /**
   * 拨打订餐电话
   */
  phonecallevent: function (e) {
    var tel = e.target.dataset.tel;
    wx.makePhoneCall({
      phoneNumber: tel
    })
    
  },
  loadMore:function(e){
    var that = this;
    page +=1;
    //菜品列表
    utils.PostRequest(api_url + '/aa/bb/cc', {
      merchant_id: merchant_id,
      page: page
    }, (data, headers, cookies, errMsg, statusCode) => self.setData({
      dishes_list: data.result
    }));
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
  onShareAppMessage: function (e) {
    var img_url = e.currentTarget.dataset.img_url;
    if (res.from === 'button') {
      // 来自页面内转发按钮
      return {
        title: '热点聚焦，投你所好',
        path: '/pages/hotel/index?merchant_id=' + merchant_id,
        imageUrl: img_url,
        success: function (res) {


        },
      }
    }
  }
})