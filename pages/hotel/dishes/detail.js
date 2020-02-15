// pages/hotel/dishes/detail.js
const app = getApp()
const utils = require('../../../utils/util.js')
const mta = require('../../../utils/mta_analysis.js')
var api_url = app.globalData.api_url;
var goods_id;
let SavorUtils = {
  User: {

    // 判断用户是否注册
    isRegister: pageContext => utils.PostRequest(api_url + '/smallapp21/User/isRegister', {
      openid: pageContext.data.openid,
      page_id: 41
    }, (data, headers, cookies, errMsg, statusCode) => wx.setStorage({
      key: 'savor_user_info',
      data: data.result.userinfo,
    }), function () {
      wx.setStorage({
        key: 'savor_user_info',
        data: {
          openid: app.globalData.openid
        }
      })

    }, { isShowLoading: false }),
  },

};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
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
      goods_id = pams_arr[1];
      that.setData({
        is_share:true
      })
    } else {
      goods_id = options.goods_id;
      that.setData({
        is_share: false
      })
    }
    if (app.globalData.openid && app.globalData.openid != '') {
      //注册用户
      that.setData({
        openid: app.globalData.openid
      });
      SavorUtils.User.isRegister(that); //判断用户是否注册
    } else {
      app.openidCallback = openid => {
        if (openid != '') {
          that.setData({
            openid: openid
          });
          SavorUtils.User.isRegister(that); //判断用户是否注册
        }
      }
    }

    //菜品详情
    utils.PostRequest(api_url + '/Smallapp4/dish/detail', {
      goods_id: goods_id,
    }, (data, headers, cookies, errMsg, statusCode) => that.setData({
      goods_info: data.result,
      merchant: data.result.merchant
      }), function () { 
        var is_share = that.data.is_share
        if(is_share==true){
          wx.reLaunch({
            url: '/pages/demand/index',
          })
          
        }else {
          wx.navigateBack({
            delta: 1
          })
        }
    });
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
  gotoHotelDetail:function(e){
    var merchant_id = e.currentTarget.dataset.merchant_id;
    wx.navigateTo({
      url: '/pages/hotel/detail?merchant_id=' + merchant_id,
    })
  },
  gotoPlaceOrder:function(e){
    var goods_id = e.currentTarget.dataset.goods_id;
    var openid = e.currentTarget.dataset.openid;
    wx.navigateTo({
      url: '/pages/hotel/order/account?goods_id='+goods_id+"&openid="+openid,
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