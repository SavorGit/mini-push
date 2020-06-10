// mall/pages/gift/accept/index.js
/**
 * 【商城】转赠页面
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
var goods_num;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    SystemInfo: getApp().SystemInfo,
    is_have_default_address: false,
    address_id: '',
    accept_num:0,
    gift_num:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    
    //var address_info = wx.getStorageSync(cache_key + 'select_address_info')
    wx.removeStorageSync(cache_key + 'select_address_info')
    order_id = options.order_id;
    nickName = options.nickName;
    var user_info = wx.getStorageSync(cache_key + 'user_info');
    openid = options.openid;
    goods_id = options.goods_id;
    goods_num = options.goods_num;  //领取礼物的数量
    if(goods_num>1){
      wx.hideShareMenu();
    }
    
    that.setData({
      user_info: user_info,
      nickName:nickName,
      goods_num:goods_num,
      accept_num:goods_num,
    })
  },
  /**
   * 选择收货地址
   */
  selectAddress: function (e) {
    wx.navigateTo({
      url: '/mall/pages/order/select_address?openid=' + openid + '&order_id='+order_id+'&nickName='+nickName+'&goods_id='+goods_id,
    })
  },
  addNums:function(e){
    var that = this;
    var type = e.currentTarget.dataset.type;
    var accept_num = that.data.accept_num;
    var gift_num = that.data.gift_num;
    if(type==1){//自己领取
      if(accept_num>=goods_num){
        app.showToast('最多可领取'+goods_num+'份');
        return false;
      }
      accept_num +=1;
      gift_num   -=1;
    }else if(type==2){//送给好友
      if(gift_num>=goods_num){
        app.showToast('最多可领取'+goods_num+'份');
        return false;
      }
      gift_num +=1;
      accept_num -=1;
    }
    that.setData({
      accept_num : accept_num,
      gift_num   : gift_num
    })
  },
  cutNums:function(e){
    var that = this;
    var type = e.currentTarget.dataset.type;
    var accept_num = that.data.accept_num;
    var gift_num = that.data.gift_num;
    if(type==1){//自己领取
      if(accept_num<0){
        return false;
      }
      accept_num -=1;
      gift_num   +=1;
    }else if(type==2) {//送给好友
      if(gift_num<0){
        return false;
      }
      gift_num   -=1;
      accept_num +=1;
    }
    that.setData({
      accept_num : accept_num,
      gift_num   : gift_num
    })
  },
  confirmOrder:function(){
    var that = this;
    var accept_num = that.data.accept_num;
    var gift_num   = that.data.gift_num;
    utils.PostRequest(api_v_url + '/aa/bb', {
      order_id   : order_id,
      openid     : openid,
      accept_num : accept_num,
      gift_num   : gift_num,
      
    }, (data, headers, cookies, errMsg, statusCode) => {
      var order_id = data.result.order_id;
      wx.navigateTo({
        url: '/mall/pages/gift/accept/multy_gift?order_id='+order_id+'&openid='+openid,
      })
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
    var that = this;
    var user_info = wx.getStorageSync(cache_key+'user_info');
    var nickName   = user_info.nickName
    var img_url = 'https://oss.littlehotspot.com/WeChat/resource/share.jpg';

    utils.PostRequest(api_v_url + '/aa/bb', {
      openid: openid,
      order_id:order_id
    }, (data, headers, cookies, errMsg, statusCode) => {
      var title = date.result.share_title;
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
    })
  }
})