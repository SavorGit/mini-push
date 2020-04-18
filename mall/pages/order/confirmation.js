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
var amount ;
var openid;
var order_type;
var merchant_id;
var carts;
var pur_uid;
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
    remark_strs:'', //备注信息
    addDisabled: false,
    address_id: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.hideShareMenu();
    var goods_ids = [];
    goods_id = '';
    carts = [];
    if (typeof (options.pur_uid)!='undefined'){
      pur_uid = options.pur_uid
    }else {
      pur_uid=''
    }
    openid = options.openid;
    order_type = options.order_type;  //1单品下单 2购物车下单  3再次购买

    wx.removeStorageSync(cache_key + 'mall_order:remark')

    
    that.getDefaultAddr();
    if(order_type==1){
      var goods_info ={};
      goods_id = options.goods_id;
      amount = options.amount
      goods_info.id = goods_id;
      goods_info.amount = amount ;
      goods_ids.push(goods_info);
      goods_ids = JSON.stringify(goods_ids);
      that.getOrderList(goods_ids)
    }else if(order_type==2){
      var mall_cart_list = wx.getStorageSync(cache_key + 'mall_cart_' + openid);
      
      mall_cart_list = JSON.parse(mall_cart_list);

      for(let i in mall_cart_list){
        var goods_info = {};
        if(mall_cart_list[i].ischecked==true){
          goods_info.id = mall_cart_list[i].id;
          goods_info.amount = mall_cart_list[i].amount;
          goods_ids.push(goods_info);
          carts.push(goods_info)
        }
        
      }
      goods_ids = JSON.stringify(goods_ids);
      that.getOrderList(goods_ids)
    }else if(order_type==3){//再次购买
      var order_id = options.order_id
      //订单详情
      utils.PostRequest(api_url + '/smallapp43/order/detail', {
        openid: openid,
        order_id: order_id,
      }, (data, headers, cookies, errMsg, statusCode) => {
        var order_goods_list = data.result.goods;
        for(let i in order_goods_list){
          var goods_info = {};
          goods_info.id = order_goods_list[i].id;
          goods_info.amount = order_goods_list[i].amount;
          goods_ids.push(goods_info);
          carts.push(goods_info)
        }
        goods_ids = JSON.stringify(goods_ids);
        that.getOrderList(goods_ids)
      })
    }
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
   * 选择收货地址
   */
  selectAddress: function (e) {
    wx.navigateTo({
      url: '/pages/mine/address/index?openid=' + openid + '&isOrder=1',
    })
  },
  gotoInvoice: function (e) {
    wx.navigateTo({
      url: '/pages/hotel/order/account_invoice',
    })
  },
  //商城下单
  addShopOrder:function(e){
    
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

    //获取订单备注
    var remark_strs = wx.getStorageSync(cache_key + 'mall_order:remark')
    if (remark_strs != '') {
      that.setData({
        remark_strs: remark_strs
      })
    }

    //获取发票信息
    var bill_info = wx.getStorageSync(cache_key + 'order:bill');
    if (bill_info != '') {
      bill_info = JSON.parse(bill_info);
      that.setData({
        bill_info: bill_info
      })
    }
  },
  addMallOrder:function(e){
    var that = this;
    var address_id = e.detail.value.address_id;
    if (address_id==''){
      app.showToast('请选择您的收货地址');
      return false;
    }
    if(order_type==1){

    }


    //支付方式
    var pay_types = that.data.pay_types;
    var pay_type = that.data.pay_type;
    if (pay_type == '') {
      pay_type = pay_types[0].id
    }
    //订单备注
    var remark = wx.getStorageSync(cache_key + 'mall_order:remark');
    //发票信息
    var bill_cache = wx.getStorageSync(cache_key + 'order:bill');
    var company = '';
    var credit_code = '';
    var title_type = '';
    var email = '';
    if (bill_cache != '') {
      var bill_info = JSON.parse(bill_cache);
      company = bill_info.title;
      credit_code = bill_info.taxNumber
      title_type = bill_info.type;
      email      = bill_info.email;
    }
    //carts = JSON.stringify(carts)
    var order_cats = JSON.stringify(carts)
    //下单
    utils.PostRequest(api_v_url + '/order/addShoporder', {
      address_id: address_id,
      amount: amount,
      carts: order_cats,
      company: company,
      credit_code: credit_code,
      email:email,
      goods_id: goods_id,
      openid: openid,
      pay_type: pay_type,
      remark: remark,
      title_type, title_type,
      uid:pur_uid
    }, (data, headers, cookies, errMsg, statusCode) => {
      //支付流程
      var order_id = data.result.order_id;
      var jump_type = data.result.jump_type;
      if (data.result.pay_type == 10) {
        wx.requestPayment({
          'timeStamp': data.result.payinfo.timeStamp,
          'nonceStr': data.result.payinfo.nonceStr,
          'package': data.result.payinfo.package,
          'signType': 'MD5',
          'paySign': data.result.payinfo.paySign,
          success(res) {
            that.setData({
              addDisabled: false
            })
            app.showToast('支付成功', 2000, 'success')
            if(order_type==2){
              console.log('222222222222')
              //清空购物车的商品
              that.clearMallCart();
            }
            wx.navigateTo({
              url: '/mall/pages/order/payment?order_id='+order_id+'&openid='+openid+'&jump_type='+jump_type,
            })
          },
          fail(res) {
            if (res.errMsg == "requestPayment:fail cancel") {
              app.showToast('支付取消');
              that.setData({
                addDisabled: false
              })
            } else {
              app.showToast('支付失败');
              that.setData({
                addDisabled: false
              })
            }

          }
        })
      }
    })
  },
  clearMallCart:function(){
    console.log(carts)
    var tmp = carts;
    var mall_cart_list = wx.getStorageSync(cache_key + 'mall_cart_' + openid);
    mall_cart_list = JSON.parse(mall_cart_list);
    for(let i in mall_cart_list){
      for (let j in tmp){
        if (tmp[j].id==mall_cart_list[i].id){
          mall_cart_list.splice(i,1);
        }
      }
    }
    //console.log(mall_cart_list)
    if(mall_cart_list.length==0){
      wx.removeStorageSync(cache_key + 'mall_cart_' + openid)
    }else {
      mall_cart_list = JSON.stringify(mall_cart_list);
      wx.setStorageSync(cache_key + 'mall_cart_' + openid, mall_cart_list)
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