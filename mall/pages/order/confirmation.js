// mall/pages/order/confirmation.js
/**
 * 【商城】订单确认页面
 */
const utils = require('../../../utils/util.js')
var mta = require('../../../utils/mta_analysis.js')
const app = getApp()
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
var cache_key = app.globalData.cache_key;
var goods_id;
var openid;
var order_type;
var merchant_id;
var goods_ids =[];
Page({

  /**
   * 页面的初始数据
   */
  data: {
    SystemInfo: getApp().SystemInfo,
    statusBarHeight: getApp().globalData.statusBarHeight,
    is_have_default_address: false,
    total_fee:0,
    pay_type: '',//支付方式
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.hideShareMenu();
    openid = options.openid;
    order_type = options.order_type;  //1单品下单 2购物车下单  3再次购买

    wx.removeStorageSync(cache_key + 'order:remark')


    that.getDefaultAddr();
    if(order_type==1){
      var goods_info ={};
      goods_info.id = options.goods_id;
      goods_info.amount = options.amount;
      goods_ids.push(goods_info);
      
    }else if(order_type==2){

    }else if(order_type==3){

    }
    goods_ids= JSON.stringify(goods_ids);
    that.getOrderList(goods_ids)
    //获取支付方式
    that.getPrepareData()
  },
  getDefaultAddr:function(){
    var that = this; //获取默认地址
    utils.PostRequest(api_v_url + '/address/getDefaultAddress', {
      openid: openid,
    }, (data, headers, cookies, errMsg, statusCode) => {
      var address_info = data.result;
      if (JSON.stringify(address_info) == '{}') {
        that.setData({
          is_have_default_address: false
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
  getOrderList:function(goods_ids){
    var that = this;
    utils.PostRequest(api_v_url + '/order/getpreorder', {
      goods_ids: goods_ids,
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        order_goods_list:data.result.goods,
        amount:data.result.amount,
        total_fee:data.result.total_fee
      })
    })
  },
  getPrepareData:function(e){
    var that = this;
    utils.PostRequest(api_v_url + '/order/getPrepareData', {
      type:2
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        pay_types: data.result.pay_types,
      })
    })
  },
  /**
   * 支付方式
   */
  selectPayType: function (e) {
    var pay_type = e.detail.value;
    this.setData({
      pay_type: pay_type,
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
    }else {
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

  },

  // 跳转到订单确认备注页面
  gotoRemark: function (e) {
    wx.navigateTo({
      url: '/mall/pages/order/confirmation_remark',
    })
  }
})