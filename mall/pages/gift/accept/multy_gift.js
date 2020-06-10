// mall/pages/gift/accept/multy_gift.js
const utils = require('../../../../utils/util.js')
var mta = require('../../../../utils/mta_analysis.js')
const app = getApp()
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
var cache_key = app.globalData.cache_key;
var order_id;
var openid;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    is_have_default_address:false,
    is_edit_send_word:false, //是否修改寄语
    send_word:'',            //寄语
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    openid   = options.openid;
    order_id = options.order_id;
    that.getOrderInfo();
  },
  getOrderInfo:function(){
    var that = this;
    utils.PostRequest(api_v_url + '/aa/bb', {
      order_id   : order_id,
      openid     : openid
    }, (data, headers, cookies, errMsg, statusCode) => {
      //that.getDefaultAddr()
    });
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
      
    })
  },
  //点击笔头修改寄语
  editSendWord:function(e){
    var that = this;
    that.setData({
      is_edit_send_word:true,
    })
  },
  //保存寄语
  saveSendWord:function(e){
    var that = this;
    var send_word = e.detail.value.send_word.replace(/\s+/g, '');
    if(send_word==''){
      app.showToast('请输入寄语');
      return false;
    }
    utils.PostRequest(api_v_url + '/order/modifyMessage', {
      openid: openid,
      order_id:order_id,
      message:send_word,
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        is_edit_send_word:false,
        send_word:send_word,
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
    var that = this;
    var user_info = wx.getStorageSync(cache_key+'user_info');

    var nickName   = user_info.nickName
    //var goods_name = that.data.order_goods_info.name;
    //var img_url    = that.data.order_goods_info.img
    var img_url = 'https://oss.littlehotspot.com/WeChat/resource/share.jpg';
    //var title = nickName+'送你小热点好物'+goods_name;
    var title = that.data.share_title;
    if (e.from === 'button') {
      // 来自页面内转发按钮
      return {
        title: title,
        path: '/pages/hotel/gift/share?order_id=' + order_id,
        imageUrl: img_url,
        success: function (res) {
        },
      }
    } else {
      return {
        title: title,
        path: '/pages/hotel/gift/share?order_id=' + order_id,
        imageUrl: img_url,
        success: function (res) {
        },
      }
    }
  }
})