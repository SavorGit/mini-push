// pages/hotel/detail.js
const app = getApp()
const utils = require('../../utils/util.js')
const mta = require('../../utils/mta_analysis.js')
var api_url = app.globalData.api_url;
var merchant_id;
var page = 1;
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
      merchant_id = pams_arr[1];
      that.setData({
        is_share:true
      })
    } else {
      merchant_id = options.merchant_id;
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

    //商家详情
    utils.PostRequest(api_url + '/Smallapp4/merchant/info', {
      merchant_id: merchant_id,
    }, (data, headers, cookies, errMsg, statusCode) => that.setData({
      hotel_info: data.result
    }));

    //菜品列表
    utils.PostRequest(api_url + '/Smallapp4/dish/goodslist', {
      merchant_id: merchant_id,
      page: 1
    }, (data, headers, cookies, errMsg, statusCode) => that.setData({
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
  loadMore: function (e) {
    var that = this;
    page += 1;
    //菜品列表
    utils.PostRequest(api_url + '/Smallapp4/dish/goodslist', {
      merchant_id: merchant_id,
      page: page
    }, (data, headers, cookies, errMsg, statusCode) => that.setData({
      dishes_list: data.result
    }));
  },
  /**
   * 下单
   */
  placeOrder: function (e) {
    var goods_id = e.currentTarget.dataset.goods_id;
    var openid = e.currentTarget.dataset.openid;
    wx.navigateTo({
      url: '/pages/hotel/order/account?goods_id=' + goods_id+"&openid="+openid,
    })

  },
  gotoDisheDetail:function(e){
    var goods_id = e.currentTarget.dataset.goods_id;
    wx.navigateTo({
      url: '/pages/hotel/dishes/detail?goods_id=' + goods_id,
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
    var that = this;
    //菜品列表
    utils.PostRequest(api_url + '/Smallapp4/dish/goodslist', {
      merchant_id: merchant_id,
      page: page
    }, (data, headers, cookies, errMsg, statusCode) => that.setData({
      dishes_list: data.result
    }));
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
    var that = this;
    page += 1;
    //菜品列表
    utils.PostRequest(api_url + '/Smallapp4/dish/goodslist', {
      merchant_id: merchant_id,
      page: page
    }, (data, headers, cookies, errMsg, statusCode) => that.setData({
      dishes_list: data.result
    }));
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (e) {
    var img_url = e.target.dataset.img_url;
    if (e.from === 'button') {
      // 来自页面内转发按钮
      return {
        title: '热点聚焦，投你所好',
        path: '/pages/hotel/detail?merchant_id=' + merchant_id,
        imageUrl: img_url,
        success: function (res) {
        },
      }
    }
  }
})