// pages/hotel/order/account.js
const app = getApp()
const utils = require('../../../utils/util.js')
const mta = require('../../../utils/mta_analysis.js')
var api_url = app.globalData.api_url;
var cache_key = app.globalData.cache_key;
var goods_id;
var openid;
var order_type; 
var merchant_id; 
Page({

  /**
   * 页面的初始数据
   */
  data: {
    SystemInfo:app.SystemInfo,
    statusBarHeight: app.globalData.statusBarHeight,
    showBuyConfirmPopWindow: false,
    addDisabled: false,
    is_have_default_address:false,
    address_id:'',
    amount:1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu();
    let that = this;
    openid = options.openid;
    order_type = options.order_type;  //1单品下单 2购物车下单
    
    var merchant_name = options.merchant_name;
    merchant_id    = options.merchant_id;
    that.setData({
      merchant_name: merchant_name,
      order_type: order_type
    })
    //获取默认地址
    utils.PostRequest(api_url + '/Smallapp4/address/getDefaultAddress', {
      openid: openid,
    }, (data, headers, cookies, errMsg, statusCode) => {
      var address_info = data.result;
      if (JSON.stringify(address_info) == '{}'){
        that.setData({
          is_have_default_address: false
        })
        
      }else {
        that.setData({
          is_have_default_address: true,
          address_info: data.result,
          address_id: data.result.address_id
        })
      }
    });

    if (order_type==1){//单品下单
      goods_id = options.goods_id;
      var amount = options.amount;
      //菜品详情
      utils.PostRequest(api_url + '/Smallapp4/dish/detail', {
        goods_id: goods_id,
      }, (data, headers, cookies, errMsg, statusCode) => {
        var goods_info = data.result;
        goods_info.img_url = goods_info.cover_imgs[0];
        goods_info.amount =  Number(amount);
        var goods_list = [];
        goods_list.push(goods_info)
        var total_price = app.accMul(goods_info.price,amount);
        that.setData({
          goods_list:goods_list,
          total_price:total_price,
          cart_dish_nums: amount
        })

      });
      
    }else if(order_type==2){ //购物车下单
      
      var cart_list = wx.getStorageSync(cache_key + 'cart_' + merchant_id);
      cart_list = JSON.parse(cart_list)
      var total_price = 0;
      var goods_price = 0;
      var cart_dish_nums = 0;
      for(var i=0;i<cart_list.length;i++){
        goods_price = app.accMul(cart_list[i].price,cart_list[i].amount)
        
        total_price = app.plus(total_price,goods_price)
        cart_dish_nums +=cart_list[i].amount
      }
      that.setData({
        goods_list: cart_list,
        total_price: total_price,
        cart_dish_nums: cart_dish_nums
      })
    }else if(order_type==3){
      var order_id = options.order_id;
      //订单详情
      utils.PostRequest(api_url + '/Smallapp4/order/dishOrderdetail', {
        order_id: order_id,
        openid:openid,
      }, (data, headers, cookies, errMsg, statusCode) => {
        var order_list = data.result.goods;
        var total_price = 0;
        var goods_price = 0;
        var goods_list = [];
        var cart_dish_nums =0;
        for(var i=0;i<order_list.length;i++){
          if (order_list[i].status == 1){
            order_list[i].img_url = order_list[i].img
            goods_list.push(order_list[i]);
            goods_price = app.accMul(order_list[i].price, order_list[i].amount)

            total_price = app.plus(total_price, goods_price)
            cart_dish_nums += parseInt(order_list[i].amount)
          }
          
        }
        console.log(goods_list)
        that.setData({
          goods_list: goods_list,
          total_price: total_price,
          cart_dish_nums: cart_dish_nums
        })
      });
    }
  },
  /**
   * 下单
   */
  placeOrder: function (e) {
    var that = this;
    //var contact = e.detail.value.contact.replace(/\s+/g, '');
    //var address = e.detail.value.address.replace(/\s+/g, '');
    //var phone = e.detail.value.phone;
    var address_id = e.detail.value.address_id;
    var delivery_date = e.detail.value.delivery_date;
    var delivery_time = e.detail.value.delivery_time;
    if(order_type==1){
      var amount = e.detail.value.amount;
    }else {
      var amount = 1;
      goods_id = '';
    }
    if(order_type==2){
      var cart_list = that.data.goods_list
      //var cart_list = wx.getStorageSync(cache_key + 'cart_' + merchant_id);
      var carts = []
      if (cart_list != '') {
        //cart_list = JSON.parse(cart_list)
        for (var i = 0; i < cart_list.length; i++) {
          var tmp = {};
          tmp.id = cart_list[i].id
          tmp.amount = cart_list[i].amount;
          carts.push(tmp)
        }

      }
    }else if(order_type==3){
      var carts = []
      var goods_list = that.data.goods_list
      for (var i = 0; i < goods_list.length; i++) {
        var tmp = {};
        tmp.id = goods_list[i].id
        tmp.amount = goods_list[i].amount;
        carts.push(tmp)
      }
    }
    if (order_type == 2 || order_type == 3) {
      if (carts.length==0){
        app.showToast('购买商品已下架');
        return false;
      }
    }
    carts = JSON.stringify(carts);
    

    if (address_id==''){
      app.showToast('请选择收货地址')
      return false;
    }
    if (delivery_date == '') {
      app.showToast('请选择送达日期');
      return false;
    }
    if (delivery_time == '') {
      app.showToast('请选择送达时间');
      return false;
    }
    
    var delivery_time = delivery_date + ' ' + delivery_time;

    that.setData({
      addDisabled: true
    })
    //下单
    utils.PostRequest(api_url + '/Smallapp4/order/addDishorder', {
      address_id:address_id,
      amount: amount,
      delivery_time: delivery_time,
      goods_id: goods_id,
      openid: openid,
      carts: carts
    }, (data, headers, cookies, errMsg, statusCode) => {
      if(order_type==2){
        wx.removeStorage({
          key: cache_key + 'cart_' + merchant_id,
          success(res) {
            that.setData({
              showBuyConfirmPopWindow: true,
              order_msg1: data.result.message1,
              order_msg2: data.result.message2,
              addDisabled: false
            })
          }, fail: function () {

          }
        })
      }else {
        that.setData({
          showBuyConfirmPopWindow: true,
          order_msg1: data.result.message1,
          order_msg2: data.result.message2,
          addDisabled: false
        })
      }
      
      
    }, function () {
      that.setData({
        addDisabled: false
      })
    })
    mta.Event.stat('orderConfirm', { 'openid': openid })
  },
  bindDateChange: function (e) {
    var that = this;
    var type = e.currentTarget.dataset.type;
    if (type == 1) {
      var delivery_date = e.detail.value;
      that.setData({
        delivery_date: delivery_date
      })
    } else if (type == 2) {
      var delivery_time = e.detail.value;
      that.setData({
        delivery_time: delivery_time
      })
    }
  },
  modalConfirm: function (e) {
    wx.navigateBack({
      delta: 1
    })
    mta.Event.stat('orderSuccess', { 'openid': openid })
  },
  gotoDisheDetail: function (e) {
    if(order_type==1){
      var id = goods_id;
    }else {
      var id = e.currentTarget.dataset.goods_id;
    }
    wx.navigateTo({
      url: '/pages/hotel/dishes/detail?goods_id=' + id,
    })
  },
  /**
   * 选择收货地址
   */
  selectAddress:function(e){
    wx.navigateTo({
      url: '/pages/mine/address/index?openid='+openid+'&isOrder=1',
    })
  },
  addNum:function(e){
    var that = this;
    var keys = e.currentTarget.dataset.keys;
    var goods_list = that.data.goods_list;
    var total_price = 0;
    var goods_price = 0;
    var cart_dish_nums = 0;
    //console.log(goods_list)
    //console.log(keys)
    for (var i = 0; i < goods_list.length; i++) {
      if (i == keys) {
        goods_list[i].amount += 1;
      }
      goods_price = app.accMul(goods_list[i].price, goods_list[i].amount)
      total_price = app.plus(total_price, goods_price)
      cart_dish_nums += goods_list[i].amount
    }
    if(order_type==1){
      var amount = goods_list[0].amount
    }else {
      var amount = 1;
    }
    that.setData({
      goods_list: goods_list,
      total_price: total_price,
      cart_dish_nums: cart_dish_nums,
      amount: amount
    })
  },
  cutNum:function(e){
    var that = this;
    var keys = e.currentTarget.dataset.keys;
    var goods_list = that.data.goods_list;

    var total_price = 0;
    var goods_price = 0;
    var cart_dish_nums = 0;
    //console.log(goods_list)
    //console.log(keys)
    var is_empty = 0;
    for (var i = 0; i < goods_list.length; i++) {
      if (i == keys) {
        if(goods_list[i].amount==1){
          is_empty = 1;
          break;
        }
        goods_list[i].amount -= 1;
      }
      goods_price = app.accMul(goods_list[i].price, goods_list[i].amount)
      total_price = app.plus(total_price, goods_price)
      cart_dish_nums += goods_list[i].amount
    }
    if(is_empty==1){
      app.showToast('数量不能小于1');
      return false;
    }
    if (order_type == 1) {
      var amount = goods_list[0].amount
    } else {
      var amount = 1;
    }
    that.setData({
      goods_list: goods_list,
      total_price: total_price,
      cart_dish_nums: cart_dish_nums,
      amount: amount
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
    if(address_info!=''){
      address_info = JSON.parse(address_info)
      that.setData({
        is_have_default_address: true,
        address_info: address_info,
        address_id: address_info.address_id
      })
    }else {
      //获取默认地址
      utils.PostRequest(api_url + '/Smallapp4/address/getDefaultAddress', {
        openid: openid,
      }, (data, headers, cookies, errMsg, statusCode) => {
        var address_info = data.result;
        if (JSON.stringify(address_info) == '{}') {
          that.setData({
            is_have_default_address: false,
            address_id:''
          })

        } else {
          that.setData({
            is_have_default_address: true,
            address_info: data.result,
            address_id: data.result.address_id
          })
        }
      });

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

  // 关闭订单确认弹窗
  closeBuyConfirmPopWindow: function (e) {
    let self = this;
    self.setData({ showBuyConfirmPopWindow: false });
    wx.navigateBack({
      delta: 1
    })
  }
})