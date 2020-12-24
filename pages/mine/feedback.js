// pages/mine/feedback.js
/**
 * 意见反馈页面
 */
const utils = require('../../utils/util.js')
var mta = require('../../utils/mta_analysis.js')
const app = getApp();
var api_v_url = app.globalData.api_v_url;
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
    wx.hideShareMenu();
    if (app.globalData.openid && app.globalData.openid != '' && typeof(app.globalData.openid)!='undefined') {
      that.setData({
        openid: app.globalData.openid
      })

    }else {

      app.openidCallback = openid => { 
        if (openid != '' && typeof(app.globalData.openid)!='undefined') {
          that.setData({
            openid: openid
          })
        }
      }
    }
  },
  submitFd:function(e){
    var that = this;

    var content = e.detail.value.content;
    var contact = e.detail.value.contact.replace(/\s+/g, '');
    var mobile  = e.detail.value.mobile.replace(/\s+/g, '');
    var openid = that.data.openid;
    console.log(mobile);
    if(content.replace(/\s+/g, '').length==0){
      app.showToast('请输入您的意见内容');
      return false;
    }
    if(!app.checkMobile(mobile) && mobile!=''){
      return false;
    }
    utils.PostRequest(api_v_url + '/content/feedback', {
      openid:  openid,
      content: content,
      contact: contact,
      mobile : mobile,
      mobile_brand  : app.globalData.mobile_model,
      mobile_model  : app.globalData.mobile_model,
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.submitFeedback();
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

  /**
   * 投资意见反馈表单
   * @param {*} e 事件
   */
  submitFeedback: function (e) {
    let self = this;
    let timerId = null;
    function cutSecond() {
      let closeSuccessWindowSecond = self.data.closeSuccessWindowSecond;
      if (timerId != null && timerId != undefined) {
        clearTimeout(timerId);
      }
      if (closeSuccessWindowSecond <= 0) {
        wx.switchTab({
          url: '/pages/index/index',
          fail: function (res) {
            console.error(res);
          }
        });
        return;
      }
      timerId = setTimeout(function () {
        self.setData({ closeSuccessWindowSecond: closeSuccessWindowSecond - 1 }, cutSecond);
      }, 1000);
    }
    self.setData({ showSuccessWindow: true, closeSuccessWindowSecond: 5 }, cutSecond);
  },

  /**
   * 点击进入首页按钮
   * @param {*} e 事件
   */
  gotoIndex: function (e) {
    let self = this;
    wx.switchTab({
      url: '/pages/index/index',
      fail: function (res) {
        console.error(res);
      }
    });
  },

  /**
   * 校验手机号
   * @param {*} e 
   */
  /*checkPhone: function (e) {
    if (e.detail.keyCode >= 48 && e.detail.keyCode <= 57) {// 主键盘数字
      return;
    } else if (e.detail.keyCode >= 96 && e.detail.keyCode <= 105) {// 小键盘数字
      return;
    } else if (e.detail.keyCode == 8) {// 回退按钮
      return;
    } else if (e.detail.keyCode == 46) {// 删除按钮
      return;
    }
    // console.log(e, e.detail.keyCode);
    var value = parseInt(e.detail.value);
    this.setData({ phone: value });
  }*/
})