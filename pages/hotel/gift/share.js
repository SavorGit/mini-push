// pages/hotel/gift/share.js
const app = getApp()
const utils = require('../../../utils/util.js')
const mta = require('../../../utils/mta_analysis.js')
var api_v_url = app.globalData.api_v_url;
var cache_key = app.globalData.cache_key;
var order_id;
let SavorUtils = {
  User: {

    // 判断用户是否注册
    isRegister: pageContext => utils.PostRequest(api_v_url + '/User/isRegister', {
      openid: pageContext.data.openid, 
    }, (data, headers, cookies, errMsg, statusCode) =>{
      pageContext.setData({
        user_info:data.result.userinfo
      })
      wx.setStorage({
        key: 'savor_user_info',
        data: data.result.userinfo,
      })

    } , function () {
      wx.setStorage({
        key: 'savor_user_info',
        data: {
          openid: app.globalData.openid
        }
      })

    }),
  },

};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    receive_num:1,//领取礼品数量
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    order_id = options.order_id;
    if (app.globalData.openid && app.globalData.openid != '') {
      that.setData({
        openid: app.globalData.openid
      });
      SavorUtils.User.isRegister(that);                           //判断用户是否注册
      that.getGiftInfo(app.globalData.openid,order_id);           //获取礼品信息
      that.getGiftReceiveList(app.globalData.openid,order_id);    //获取领取列表
    }else {
      app.openidCallback = openid => {
        if (openid != '') {
          that.setData({
            openid: openid
          });
        }
      }
      SavorUtils.User.isRegister(that);                           //判断用户是否注册
      that.getGiftInfo(openid,order_id);                          //获取礼品信息
      that.getGiftReceiveList(openid,order_id);                   //获取领取列表
    }
  },
  /**
   * @desc   获取礼品信息
   * @param {*} openid    当前用户openid
   * @param {*} order_id  礼品订单id
   */
  getGiftInfo:function(openid,order_id){
    var that = this;
    utils.PostRequest(api_v_url + '/aa/bb', {
      openid:openid,
      order_id: order_id,
    }, (data, headers, cookies, errMsg, statusCode) =>{
      
      //判断是否领取过但是未填写地址
      //领取过 未填写地址 跳转到填写收货地址页面
      //领取过  但未领取到上线
      //领取过  已达到上线
      //已被领取完
      that.setData({
        goods_info:data.result
      })

    }, function () {
      wx.reLaunch({
        url: '/pages/shopping/index',
      })
      
    });
  },
  /***
   * @desc 获取领取礼品列表
   * @param {*} openid     当前用户openid
   * @param {*} order_id   礼品订单id
   */
  getGiftReceiveList:function(openid,order_id){
    var that = this;
    utils.PostRequest(api_url + '/aa/bb', {
      openid:openid,
      order_id: order_id,
    }, (data, headers, cookies, errMsg, statusCode) =>{
      that.setData({
        receiveList:data.result,
      })
    })
  },
  cutReceiveAmount:function(e){
    //判断领取数量是否超过最大值 或者剩余数量
    var remian_num = that.data.remian_num;
    var max_receive_num = that.data.max_receive_num;
    var receive_num = that.data.receive_num;
    if(receive_num==1){
      app.showtoast('最少领取一份');
      return false;
    }
    receive_num -=1;
    that.setData({
      receive_num:receive_num
    })
  },
  addReceiveAmount:function(e){
    var remian_num = that.data.remian_num;
    var max_receive_num = that.data.max_receive_num;
    var receive_num = that.data.receive_num;
    if(receive_num>= remian_num ){
      app.showtoast('剩余数量不足');
      return false;
    }
    if(receive_num>=max_receive_num){
      app.showtoast('每个人最多领'+max_receive_num+'份');
      return false;
    }
    receive_num +=1;
    that.setData({receive_num:receive_num})
  },
  getPhoneNumber:function(e){
    if ("getPhoneNumber:ok" != e.detail.errMsg){
      wx.showTost('获取用户手机号失败')
      return false;
    }
    var iv = e.detail.iv;
    var encryptedData = e.detail.encryptedData;
    utils.PostRequest(api_url + '/aa/bb', {
      iv:iv,
      encryptedData: encryptedData,
      session_key: app.globalData.session_key,
    }, (data, headers, cookies, errMsg, statusCode) =>{
      //更新缓存
      //领取礼品
      that.receiveGift();
    })
  },
  receiveGift:function(){
    var that = this;
   
    var openid = that.data.openid
    utils.PostRequest(api_v_url + '/aa/bb/', {
      openid:openid,
      order_id: order_id,
    }, (data, headers, cookies, errMsg, statusCode) =>{
      //判断是否领取过但是未填写地址
      //领取过 未填写地址 跳转到填写收货地址页面
      //领取过  但未领取到上线
      //领取过  已达到上线
      //已被领取完
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