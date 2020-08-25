// games/pages/activity/din_dash.js

const app = getApp()
const utils = require('../../../utils/util.js')
var mta = require('../../../utils/mta_analysis.js')
var api_v_url = app.globalData.api_v_url;
var cache_key = app.globalData.cache_key;
var openid;
var box_mac;
var activity_id;
var activity_id;
let SavorUtils = {
  User: {

    // 判断用户是否注册
    isRegister: openid => utils.PostRequest(api_v_url + '/User/isRegister', {
      openid: openid,
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
    }, {
      isShowLoading: false
    }),
  },
};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    SystemInfo: getApp().SystemInfo,
    showPage: 'JOIN', // JOIN:参与结果； LOTTERY:抽奖结果。
    showStatus: 'success', // success:成功； fail:失败。
    showModal: false, //显示授权登陆弹窗
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    openid = options.openid;
    box_mac= options.box_mac;
    activity_id = 0;
    if(typeof(options.activity_id)!='undefined'){
      activity_id = options.activity_id;
    }
    SavorUtils.User.isRegister(openid); //判断用户是否注册
    var user_info = wx.getStorageSync(cache_key + 'user_info');
    if (user_info.is_wx_auth != 3) {
      that.setData({
        showModal: true
      })
    } else {
      that.getActivityInfo();
    }
  },
  getActivityInfo() {
    var that = this;
    utils.PostRequest(api_v_url + '/aa/bb', {
      openid:openid,
      box_mac:box_mac,
      activity_id:activity_id
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        act_info: data.result
      })
    })

  },
  onGetUserInfo: function (res) {
    var that = this;
    var user_info = wx.getStorageSync("savor_user_info");
    mta.Event.stat("clickonwxauth", {})
    if (res.detail.errMsg == 'getUserInfo:ok') {
      wx.getUserInfo({
        success(rets) {
          utils.PostRequest(api_v_url + '/User/registerCom', {
            'openid': openid,
            'avatarUrl': rets.userInfo.avatarUrl,
            'nickName': rets.userInfo.nickName,
            'gender': rets.userInfo.gender,
            'session_key': app.globalData.session_key,
            'iv': rets.iv,
            'encryptedData': rets.encryptedData
          }, (data, headers, cookies, errMsg, statusCode) => {
            that.getActivityInfo();
            wx.setStorage({
              key: 'savor_user_info',
              data: data.result,
            });
            that.setData({
              showModal: false,
            })
          }, res => wx.showToast({
            title: '微信登陆失败，请重试',
            icon: 'none',
            duration: 2000
          }));
        }
      })
      mta.Event.stat("allowauth", {})
    } else {
      utils.PostRequest(api_v_url + '/User/refuseRegister', {
        'openid': openid,
      }, (data, headers, cookies, errMsg, statusCode) => {
        user_info['is_wx_auth'] = 1;
        wx.setStorage({
          key: 'savor_user_info',
          data: user_info,
        })
        wx.reLaunch({
          url: '/pages/index/index',
        })
      });
      mta.Event.stat("refuseauth", {})
    }
  },
  //关闭授权弹窗
  closeWxAuth: function () {
    //关闭授权登陆埋点
    var that = this;
    that.setData({
      showModal: false,
    })
    wx.reLaunch({
      url: '/pages/index/index',
    })
    mta.Event.stat("closewxauth", {})
  },
  prizeNotice: function () {
    wx.requestSubscribeMessage({
      tmplIds: ['HqNYdceqH7MAQk6dl4Gn54yZObVRNG0FJk40OIwa9x4'],
      success(res) {}
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