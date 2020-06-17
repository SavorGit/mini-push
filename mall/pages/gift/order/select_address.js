// mall/pages/gift/order/select_address.js
/**
 * 【商城】赠品选择收货地址页面
 */


const utils = require('../../../../utils/util.js')
var mta = require('../../../../utils/mta_analysis.js')
const app = getApp()
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
var cache_key = app.globalData.cache_key;
var order_id;
var openid;
var goods_id;
var nickName;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    SystemInfo: getApp().SystemInfo,
    statusBarHeight: getApp().globalData.statusBarHeight,
    is_have_default_address: false,
    address_id: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.hideShareMenu();
    //var address_info = wx.getStorageSync(cache_key + 'select_address_info')
    wx.removeStorageSync(cache_key + 'select_address_info')
    order_id = options.order_id;
    nickName = options.nickName;
    var user_info = wx.getStorageSync(cache_key + 'user_info');
    openid = options.openid;
    goods_id = options.goods_id;
    console.log('dddddd'+order_id)
    console.log('ddddd'+openid)
    that.setData({
      user_info: user_info,
      nickName:nickName
    })
    that.getDefaultAddr();
  },

  getDefaultAddr: function () {
    var that = this; //获取默认地址
    utils.PostRequest(api_v_url + '/address/getDefaultAddress', {
      openid: openid,
    }, (data, headers, cookies, errMsg, statusCode) => {
      var address_info = data.result;
      if (JSON.stringify(address_info) == '{}') {
        that.setData({
          is_have_default_address: false,
          address_id: ''
        })
        var address_id = '';
      } else {
        var address_id = data.result.address_id
        that.setData({
          is_have_default_address: true,
          address_info: data.result,
          address_id: data.result.address_id
        })
      }
    });
  },
  /**
   * 选择收货地址
   */
  selectAddress: function (e) {
    wx.navigateTo({
      url: '/pages/mine/address/index?openid=' + openid + '&isOrder=1',
    })
  },
  getPhoneNumber: function (e) {
    var that = this;
    console.log(e)
    if ("getPhoneNumber:ok" != e.detail.errMsg) {
      app.showToast('获取用户手机号失败')
      return false;
    }
    var iv = e.detail.iv;
    var encryptedData = e.detail.encryptedData;
    utils.PostRequest(api_v_url + '/user/bindMobile', {
      openid:openid,
      iv: iv,
      encryptedData: encryptedData,
      session_key: app.globalData.session_key,
    }, (data, headers, cookies, errMsg, statusCode) => {

      console.log(data);
      //更新缓存
      var user_info = wx.getStorageSync(cache_key + 'user_info');
      user_info.mobile = data.result.phoneNumber;
      wx.setStorageSync(cache_key + 'user_info', user_info)
      that.setData({
        user_info:user_info
      })
      //确定收货地址领取礼品
      that.receiveGift();
    })
  },
  receiveGift: function () {
    var that = this;
    var address_id = that.data.address_id;
    if (address_id == '') {
      app.showToast('请选择您的收货地址');
      return false;
    }
    utils.PostRequest(api_v_url + '/gift/confirmAddress/', {
      openid: openid,
      order_id: order_id,
      address_id: address_id,
    }, (data, headers, cookies, errMsg, statusCode) => {
      
      var order_id = data.result.order_id;
      var receive_order_id = data.result.receive_order_id;
      console.log(order_id+'收货地址:'+receive_order_id)
      if(receive_order_id>0 && typeof(receive_order_id)!='undefined'){
        app.showToast('该礼品已被领取');
        setTimeout(function() {
          wx.redirectTo({
            url: '/pages/hotel/gift/share?order_id='+receive_order_id,
            
          })
        }, 1000);
        
        
      }else {
        wx.redirectTo({
          url: '/mall/pages/gift/order/receive_success?order_id=' + order_id + '&openid=' + openid+'&goods_id='+goods_id,
        })
      }
      
    },function(e){
      console.log(e)
      // wx.navigateBack({
      //   delta:2
      // })
      wx.reLaunch({
        url: '/pages/shopping/index',
      })
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
    var address_info = wx.getStorageSync(cache_key + 'select_address_info')
    if (address_info != '') {
      address_info = JSON.parse(address_info)
      address_info.address = address_info.detail_address
      that.setData({
        is_have_default_address: true,
        address_info: address_info,
        address_id: address_info.address_id
      })
    } else {
      that.getDefaultAddr();
    }
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