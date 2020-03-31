// pages/hotel/order/detail.js
/**
 * 订单详情页面
 */


const app = getApp()
const utils = require('../../../utils/util.js')
const mta = require('../../../utils/mta_analysis.js')
var api_url = app.globalData.api_url;
var order_id;
var openid;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    /*markers: [{
      iconPath: "/images/imgs/default-user.png",
      id: 0,
      latitude: 23.099994,
      longitude: 113.324520,
      width: 50,
      height: 50
    }],
    polyline: [{
      points: [{
        longitude: 113.3245211,
        latitude: 23.10229
      }, {
        longitude: 113.324520,
        latitude: 23.21229
      }],
      color: "#FF0000DD",
      width: 2,
      dottedLine: true
    }],
    controls: [{
      id: 1,
      iconPath: '/images/imgs/default-pic.png',
      position: {
        left: 0,
        top: 300 - 50,
        width: 50,
        height: 50
      },
      clickable: true
    }]*/
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    openid = options.openid;
    order_id = options.order_id;
    //订单详情
    utils.PostRequest(api_url + '/smallapp43/order/detail', {
      openid: openid,
      order_id: order_id,
    }, (data, headers, cookies, errMsg, statusCode) => {
      //var hotel_location = data.result.hotel_location;
      ///var user_location = data.result.user_location;
      
      that.setData({
        //user_location: user_location,
        order_info: data.result,
        markers: data.result.markers
      })
    });
  },
  gotoDeshes: function (e) {
    console.log(e)
    var goods_id = e.currentTarget.dataset.goods_id;
    if (goods_id != '' && typeof (goods_id) != 'undefined') {
      wx.navigateTo({
        url: '/pages/hotel/dishes/detail?goods_id=' + goods_id,
      })
    }
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
  reFreshOrder:function(e){
    var that = this;
    //订单详情
    utils.PostRequest(api_url + '/smallapp43/order/detail', {
      openid: openid,
      order_id: order_id,
    }, (data, headers, cookies, errMsg, statusCode) => {
      //var hotel_location = data.result.hotel_location;
      ///var user_location = data.result.user_location;

      that.setData({
        //user_location: user_location,
        order_info: data.result,
        markers: data.result.markers
      })
      app.showToast('刷新成功');
    });
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