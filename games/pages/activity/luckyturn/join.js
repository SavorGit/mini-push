// pages/game/luckyturn/join.js
/**
 * 【游戏】 幸运转转转 - 参与
 */
const app = getApp()
const utils = require('../../../../utils/util.js')
var mta = require('../../../../utils/mta_analysis.js')
var api_v_url = app.globalData.api_v_url;
var oss_upload_url = app.globalData.oss_upload_url;
var openid;
var box_mac;
var user_info ;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    SystemInfo: getApp().SystemInfo

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    openid = options.openid;
    box_mac = options.box_mac;
    utils.PostRequest(api_v_url + '/User/isRegister', {
      openid:openid,
    }, (data, headers, cookies, errMsg, statusCode) => {
      user_info = data.result.userinfo;
      if(user_info.is_wx_auth==3){
        that.joinPrize();
      }else {
        that.setData({user_info:user_info})
      }
      
    })
  },
  joinPrize:function(){
    utils.PostRequest(api_v_url + '/activity/joinLottery', {
      openid:openid,
      box_mac:box_mac,
    }, (data, headers, cookies, errMsg, statusCode) => {
      var tips = data.result.tips;
      app.showToast(tips,2000,'success',true);
      wx.switchTab({
        url: '/pages/index/index',
      })
    })
    
  },
  onGetUserInfo: function (res) {
    var that = this;

    if (res.detail.errMsg == 'getUserInfo:ok') {
      if(typeof(openid)!='undefined'){
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
              
            }, res => wx.showToast({
              title: '微信登陆失败，请重试',
              icon: 'none',
              duration: 2000
            }));
  
          }
        })
      }else {
        
        app.showToast('微信登陆失败，请重试');
        
      }
      
      
    } else {
      utils.PostRequest(api_v_url + '/User/refuseRegister', {
        'openid': openid,
      }, (data, headers, cookies, errMsg, statusCode) => {
        
      });
    }


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