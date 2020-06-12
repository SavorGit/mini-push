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
var goods_id;    //赠送礼品id
var nickName;    //赠送人昵称
var receive_num; //已领取礼品数量
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
    is_have_receive:0
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
    receive_num = options.receive_num;  //领取礼物的数量
    if(receive_num>1){
      wx.hideShareMenu();
    }else if(receive_num==1){
      that.getOrderInfo()
    }
    
    that.setData({
      user_info: user_info,
      nickName:nickName,
      receive_num:receive_num,
      accept_num:receive_num,
    })
  },
  getOrderInfo: function () {
    var that = this;
    utils.PostRequest(api_v_url + '/gift/info', {
      order_id: order_id,
      openid: openid
    }, (data, headers, cookies, errMsg, statusCode) => {
      var records = data.result.records //领取列表
      var amount = data.result.amount
      var give_num = data.result.give_num; //赠送礼品份数
      var selfreceive_num = data.result.selfreceive_num; //自己领取礼品份数
      var goods_info = data.result.goods;
      var merchant_info = data.result.merchant;
      var receive_type = data.result.receive_type;
      var expire_date = data.result.expire_date;
      var message = data.result.message;
      //var nickName = data.result.nickName;
      var address = data.result.address;
      var receive_order_id = data.result.receive_order_id;
      var give_order_id = data.result.give_order_id;
      if(address.length==0){
        var is_have_receive = 0;
      }else {
        var is_have_receive = 1;
      }
      that.setData({
        order_info: data.result,
        records: records,
        amount: amount,
        expire_date:expire_date,
        goods_info: goods_info,
        give_num: give_num,
        merchant_info: merchant_info,
        receive_type: receive_type,
        message:message,
        //nickName:nickName,
        selfreceive_num:selfreceive_num,
        address:address,
        receive_order_id:receive_order_id,
        give_order_id:give_order_id,
        is_have_receive:is_have_receive
      })
    });
  },
  /**
   * 选择收货地址
   */
  selectAddress: function (e) {
    wx.navigateTo({
      url: '/mall/pages/gift/order/select_address?openid=' + openid + '&order_id='+order_id+'&nickName='+nickName+'&goods_id='+goods_id,
    })
  },
  addNums:function(e){
    var that = this;
    var type = e.currentTarget.dataset.type;
    var accept_num = that.data.accept_num;
    var gift_num = that.data.gift_num;
    if(type==1){//自己领取
      if(accept_num>=receive_num){
        app.showToast('最多可领取'+receive_num+'份');
        return false;
      }
      accept_num +=1;
      gift_num   -=1;
    }else if(type==2){//送给好友
      if(gift_num>=receive_num){
        app.showToast('最多可领取'+receive_num+'份');
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
      if(accept_num<=0){
        return false;
      }
      accept_num -=1;
      gift_num   +=1;
    }else if(type==2) {//送给好友
      if(gift_num<=0){
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
    var is_have_receive = that.data.is_have_receive;
    if(is_have_receive==1){
      app.showToast('该礼品您已领取完成');
      return false;
    }
    var accept_num = that.data.accept_num;
    var gift_num   = that.data.gift_num;
    utils.PostRequest(api_v_url + '/gift/confirmReceive', {
      order_id    : order_id,
      openid      : openid,
      receive_num : accept_num,  //自己领取份数
      give_num    : gift_num,    //赠送份数
      
    }, (data, headers, cookies, errMsg, statusCode) => {
      //var order_id = data.result.order_id;
      // wx.navigateTo({
      //   url: '/mall/pages/gift/accept/multy_gift?order_id='+order_id+'&openid='+openid,
      // })
      wx.redirectTo({
        url: '/mall/pages/gift/accept/multy_gift?order_id='+order_id+'&openid='+openid,
      })
    },function(){
      app.showToast('您已分配该礼品的领取数量')
      wx.redirectTo({
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
    var that = this;
    that.getSuccess();
  },
  getSuccess:function(){
    var that = this;
    utils.PostRequest(api_v_url + '/gift/getsuccess', {
      order_id: order_id,
      openid: openid
    }, (data, headers, cookies, errMsg, statusCode) => {
      var address = data.result.address;
      if(address.length==0){
        var is_have_receive = 0;
      }else {
        var is_have_receive = 1;
      }
      that.setData({
        is_have_receive:is_have_receive
      })
    })
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
    var that = this;
    var user_info = wx.getStorageSync(cache_key+'user_info');
    var nickName   = user_info.nickName
    var img_url = 'https://oss.littlehotspot.com/WeChat/resource/share.jpg';
    var goods_info = that.data.goods_info
    var title = nickName+'送你小热点好物-'+goods_info.name;

    if (e.from === 'button') {
      that.shareGift();
      // 来自页面内转发按钮
      return {
        title: title,
        path: '/pages/hotel/gift/share?order_id=' + order_id,
        imageUrl: img_url,
        success: function (res) {
          
        },
      }
      
    } else {
      that.shareGift();
      return {
        title: title,
        path: '/pages/hotel/gift/share?order_id=' + order_id,
        imageUrl: img_url,
        success: function (res) {
          
        },
      }
      
    }


    
  },
  shareGift:function(){
    utils.PostRequest(api_v_url + '/gift/give', {
      openid: openid,
      order_id:order_id
    }, (data, headers, cookies, errMsg, statusCode) => {
      
      
    })
  }
})