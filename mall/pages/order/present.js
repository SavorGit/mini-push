// mall/pages/order/present.js
const utils   = require('../../../utils/util.js')
var mta       = require('../../../utils/mta_analysis.js')
const app     = getApp()
var api_url   = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
var cache_key = app.globalData.cache_key;
var openid;
var goods_id ;
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    pay_type:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    var that = this;
    wx.hideShareMenu();
    openid = options.openid;
    goods_id = options.goods_id;
    var amount = options.amount;
    wx.removeStorageSync(cache_key + 'mall_order:remark') //清楚订单备注
    that.setData({amount:amount,present_amount:1})
    //获取购买商品信息
    var goods_ids = [];
    var goods_info ={};
    goods_info.id = goods_id;
    goods_info.amount = amount ;
    goods_ids.push(goods_info);
    goods_ids = JSON.stringify(goods_ids);
    that.getGoodsInfo(goods_ids); //获取订单数据
    that.getPrepareData(); //获取支付方式
  },
  getGoodsInfo:function(goods_ids){
    var that = this;
    utils.PostRequest(api_v_url + '/order/getpreorder', {
      goods_ids: goods_ids,
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        order_goods_list:data.result.goods,
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
  cutNum:function(e){
    var that = this;
    var type = e.currentTarget.dataset.type;
    var amount = that.data.amount;
    var present_amount = that.data.present_amount;
    var price = that.data.goods_info.price;
    if(type==1){//购买数量
      if (amount == 1) {
        app.showToast('至少选择一件商品');
        return false;
      }
      amount -= 1;
    }else if(type==2){//没人领取份数上限
      if(present_amount ==1){
        app.showToast('至少选择一件商品');
        return false;
      }
      present_amount -=1;
    }
    var total_fee = app.accMul(price, amount)
    total_fee = total_fee.toFixed(2); 
    that.setData({
      amount:amount,
      present_amount:present_amount,
      total_fee:total_fee
    })
  },
  addNum:function(e){
    var that = this;
    var type = e.currentTarget.dataset.type;
    var amount = that.data.amount;
    var present_amount = that.data.present_amount;
    var stock_num = that.data.goods_info.stock_num;
    var price = that.data.goods_info.price;
    if(type==1){//购买数量
      if (amount == stock_num) {
        app.showToast('该商品库存不足');
        return false;
      }
      amount += 1;
    }else if(type==2){//没人领取份数上限
      if(present_amount==amount){
        app.showToast('领取上限不可大于购买总数')
        return false;
      }
      present_amount +=1;
    }
    var total_fee = app.accMul(price, amount)
    total_fee = total_fee.toFixed(2); 
    that.setData({
      amount:amount,
      present_amount:present_amount,
      total_fee:total_fee
    })
  },
  addOrder:function(e){
    var that = this;
    utils.PostRequest(api_v_url + '/aaa/bbb', {
      openid:openid,
      goods_id: goods_id,
      amount:amount,
    }, (data, headers, cookies, errMsg, statusCode) => {
      var order_id = data.result.order_id;
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
           
            wx.navigateTo({
              url: '/mall/pages/order/gift?order_id='+order_id+'&openid='+openid,
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
  //跳转到发票信息页面
  gotoInvoice: function (e) {
    wx.navigateTo({
      url: '/pages/hotel/order/account_invoice',
    })
  },
  // 跳转到订单确认备注页面
  gotoRemark: function (e) {
    wx.navigateTo({
      url: '/mall/pages/order/confirmation_remark',
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