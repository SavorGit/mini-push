// pages/hotel/order/account.js
/**
 * 确认订单页面
 */


const app = getApp()
const utils = require('../../../utils/util.js')
const mta = require('../../../utils/mta_analysis.js')
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
var cache_key = app.globalData.cache_key;
var goods_id;
var openid;
var order_type;
var merchant_id;
var area_id;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    SystemInfo: app.SystemInfo,
    statusBarHeight: app.globalData.statusBarHeight,
    tab: 'take-out',
    showBuyConfirmPopWindow: false,
    addDisabled: false,
    is_have_default_address: false,
    address_id: '',
    amount: 1,
    delivery_fee:0,
    delivery_platform:0,
    total_price:0,
    tableware_index:0,
    delivery_index:0,
    pay_type:'',//支付方式
    selfpick_time:'',//自提时间
    delivery_time:'立即配送',
    order_price:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu();
    let that = this;
    openid = options.openid;
    order_type = options.order_type;  //1单品下单 2购物车下单  3再次购买
    area_id    = options.area_id;
    var merchant_name = options.merchant_name;
    merchant_id = options.merchant_id;
    that.getMerchantInfo(merchant_id);
    that.setData({
      merchant_name: merchant_name,
      order_type: order_type
    })
    wx.removeStorageSync(cache_key + 'order:remark')
    //获取默认地址
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
      if (order_type == 1) {//单品下单
        goods_id = options.goods_id;
        var amount = options.amount;
        //菜品详情
        utils.PostRequest(api_v_url + '/dish/detail', {
          goods_id: goods_id,
        }, (data, headers, cookies, errMsg, statusCode) => {
          var goods_info = data.result;
          goods_info.img_url = goods_info.cover_imgs[0];
          goods_info.amount = Number(amount);
          var goods_list = [];
          goods_list.push(goods_info)
          var total_price = app.accMul(goods_info.price, amount);
          that.setData({
            goods_list: goods_list,
            total_price: total_price,
            cart_dish_nums: amount
          })
          //获取订单准备数据
          that.getPrepareData(merchant_id, total_price, address_id);
        });

      } else if (order_type == 2) { //购物车下单

        var cart_list = wx.getStorageSync(cache_key + 'cart_' + merchant_id);
        cart_list = JSON.parse(cart_list)
        var total_price = 0;
        var goods_price = 0;
        var cart_dish_nums = 0;
        for (var i = 0; i < cart_list.length; i++) {
          goods_price = app.accMul(cart_list[i].price, cart_list[i].amount)

          total_price = app.plus(total_price, goods_price)
          cart_dish_nums += cart_list[i].amount
        }
        that.setData({
          goods_list: cart_list,
          total_price: total_price,
          cart_dish_nums: cart_dish_nums
        })

        //获取订单准备数据
        that.getPrepareData(merchant_id, total_price, address_id);
      } else if (order_type == 3) {
        var order_id = options.order_id;
        //订单详情
        utils.PostRequest(api_v_url + '/order/detail', {
          order_id: order_id,
          openid: openid,
        }, (data, headers, cookies, errMsg, statusCode) => {
          var order_list = data.result.goods;
          var total_price = 0;
          var goods_price = 0;
          var goods_list = [];
          var cart_dish_nums = 0;
          for (var i = 0; i < order_list.length; i++) {
            if (order_list[i].status == 1) {
              order_list[i].img_url = order_list[i].img
              goods_list.push(order_list[i]);
              goods_price = app.accMul(order_list[i].price, order_list[i].amount)

              total_price = app.plus(total_price, goods_price)
              cart_dish_nums += parseInt(order_list[i].amount)
            }

          }
          that.setData({
            goods_list: goods_list,
            total_price: total_price,
            cart_dish_nums: cart_dish_nums
          })

          //获取订单准备数据
          that.getPrepareData(merchant_id, total_price, address_id);
        });
      }
    });

  },
  getMerchantInfo: function (merchant_id) {
    var that = this;
    utils.PostRequest(api_v_url + '/merchant/info', {
      merchant_id: merchant_id,
    }, (data, headers, cookies, errMsg, statusCode) => that.setData({
      hotel_info: data.result
    }));
  },
  getPrepareData: function (merchant_id, total_price, address_id){
    var that = this;
    //获取下单预备数据(包括配送类型和支付方式)
    that.setData({
      addDisabled: true
    })
    var money = total_price;
    utils.PostRequest(api_v_url + '/order/getPrepareData', {
      merchant_id: merchant_id,
    }, (data, headers, cookies, errMsg, statusCode) => {
      var delivery_types = data.result.delivery_types;
      var delivery_platform = data.result.delivery_platform
      var pay_types = data.result.pay_types
      var tableware = data.result.tableware
      var tableware_arr = [];
      for(var i=0;i<tableware.length;i++){
        tableware_arr.push(tableware[i].name);
      }
      if (delivery_platform == 1 && address_id!='') {//获取配送费
        utils.PostRequest(api_v_url + '/order/getDeliveryfee', {
          address_id: address_id,
          merchant_id: merchant_id,
          money: money,
          openid: openid
        }, (data, headers, cookies, errMsg, statusCode) => {
          var tab = that.data.tab;
          var total_price = that.data.total_price;
          
          if (tab =='take-out'){
            var order_price = app.plus(total_price,data.result.fee)
          }else {
            var order_price = total_price
          }
          console.log(order_price)
          that.setData({
            delivery_fee: data.result.fee,
            order_price: order_price
          })
        });
      }else{
        var total_price = that.data.total_price;
        that.setData({
          order_price: total_price
        })
      }
      that.setData({
        addDisabled: false,
        delivery_types: delivery_types,
        //delivery_type: delivery_types[0].id,
        delivery_platform: delivery_platform,
        pay_types: pay_types,
        tableware: tableware,
        tableware_arr: tableware_arr
      })
    });
    //获取配送时间列表
    utils.PostRequest(api_v_url + '/order/getDeliveryTime', {
      merchant_id: merchant_id,
    }, (data, headers, cookies, errMsg, statusCode) => {
      
      var deliveryTime = data.result;
      var delevery_arr = [];
      for (var i = 0; i < deliveryTime.length;i++){
        delevery_arr.push(deliveryTime[i].name);
      }

      that.setData({
        deliveryTime: data.result,
        delevery_arr: delevery_arr
      })
    });
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
    if (order_type == 1) {
      var amount = e.detail.value.amount;
    } else {
      var amount = 1;
      goods_id = '';
    }
    if (order_type == 2) {
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
    } else if (order_type == 3) {
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
      if (carts.length == 0) {
        app.showToast('购买商品已下架');
        return false;
      }
    }
    carts = JSON.stringify(carts);

    var tab = that.data.tab;
    var phone = '';
    var selfpick_time ='';
    if (tab =='take-out'){
      var delivery_type = 1;
    } else if (tab = 'hotel'){
      var delivery_type = 2;
      phone = e.detail.value.phone;
      selfpick_time = that.data.selfpick_time

      if(phone==''){
        app.showToast('请输入预留手机号');
        return false;
      }
      if(selfpick_time==''){
        app.showToast('请选择自提时间');
        return false;
      }
    }
    if (address_id == '' && tab =='take-out') {
      app.showToast('请选择收货地址')
      return false;
    }
    //配送时间
    var delivery_index = that.data.delivery_index
    var deliveryTime = that.data.deliveryTime;
    var delivery_time = deliveryTime[delivery_index].value;

    //支付方式
    var pay_types = that.data.pay_types;
    var pay_type = that.data.pay_type;
    if(pay_type==''){
      pay_type = pay_types[0].id
    }
    //订单备注
    var remark = wx.getStorageSync(cache_key+'order:remark');
    //发票信息
    var bill_cache = wx.getStorageSync(cache_key+'order:bill');
    var company = '';
    var credit_code = '';
    var title_type ='';
    if(bill_cache !=''){
      var bill_info = JSON.parse(bill_cache);
      company = bill_info.title;
      credit_code = bill_info.taxNumber
      title_type = bill_info. type;
    }
    //餐具份数
    var tableware_index = that.data.tableware_index
    var tableware_obj = that.data.tableware;
    
    var tableware = tableware_obj[tableware_index].id;


    that.setData({
      addDisabled: true
    })
    //下单
    utils.PostRequest(api_v_url + '/order/addOrder', {
      address_id: address_id,
      amount: amount,
      carts: carts,
      company: company,
      credit_code: credit_code,
      delivery_time: delivery_time,
      delivery_type: delivery_type,
      
      goods_id: goods_id,
      openid: openid,
      pay_type: pay_type,
      phone: phone,
      remark: remark,
      selfpick_time: selfpick_time,
      tableware: tableware,
      title_type, title_type
    }, (data, headers, cookies, errMsg, statusCode) => {
      //支付流程
      var order_id = data.result.order_id;
      if(data.result.pay_type==10){
        wx.requestPayment({
          'timeStamp': data.result.payinfo.timeStamp,
          'nonceStr': data.result.payinfo.nonceStr,
          'package': data.result.payinfo.package,
          'signType': 'MD5',
          'paySign': data.result.payinfo.paySign,
          success(res) {
            if (order_type == 2) {
              wx.removeStorage({
                key: cache_key + 'cart_' + merchant_id,
                success(res) {
                  that.setData({
                    //showBuyConfirmPopWindow: true,
                    //order_msg1: data.result.message1,
                    //order_msg2: data.result.message2,
                    addDisabled: false
                  })
                }, fail: function () {

                }
              })
            } else {
              that.setData({
                //showBuyConfirmPopWindow: true,
                //order_msg1: data.result.message1,
                //order_msg2: data.result.message2,
                addDisabled: false
              })
            }
            app.showToast('支付成功', 2000,'success')
            wx.navigateTo({
              url: '/pages/hotel/order/detail?order_id=' + order_id+'&openid='+openid,
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
      }else {
        if (order_type == 2) {
          wx.removeStorage({
            key: cache_key + 'cart_' + merchant_id,
            success(res) {
              
            }, fail: function () {

            }
          })
        }
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
  /*bindDateChange: function (e) {
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
  },*/
  modalConfirm: function (e) {
    wx.navigateBack({
      delta: 1
    })
    mta.Event.stat('orderSuccess', { 'openid': openid })
  },
  gotoDisheDetail: function (e) {
    if (order_type == 1) {
      var id = goods_id;
    } else {
      var id = e.currentTarget.dataset.goods_id;
    }
    wx.navigateTo({
      url: '/pages/hotel/dishes/detail?goods_id=' + id,
    })
  },
  /**
   * 选择收货地址
   */
  selectAddress: function (e) {
    wx.navigateTo({
      url: '/pages/mine/address/index?openid=' + openid + '&isOrder=1&area_id='+area_id,
    })
  },
  addNum: function (e) {
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
  cutNum: function (e) {
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
        if (goods_list[i].amount == 1) {
          is_empty = 1;
          break;
        }
        goods_list[i].amount -= 1;
      }
      goods_price = app.accMul(goods_list[i].price, goods_list[i].amount)
      total_price = app.plus(total_price, goods_price)
      cart_dish_nums += goods_list[i].amount
    }
    if (is_empty == 1) {
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
  gotoRemark:function(e){
    wx.navigateTo({
      url: '/pages/hotel/order/account_remark',
    })
  },
  gotoInvoice:function(e){
    wx.navigateTo({
      url: '/pages/hotel/order/account_invoice',
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
      var address_id = address_info.address_id;
      var delivery_platform = that.data.delivery_platform;
      var total_price = that.data.total_price;
    
      if (delivery_platform == 1 && address_id > 0 && total_price>0){
        
        utils.PostRequest(api_v_url + '/order/getDeliveryfee', {
          address_id: address_id,
          merchant_id: merchant_id,
          money: total_price,
          openid: openid
        }, (data, headers, cookies, errMsg, statusCode) => {
          var tab = that.data.tab;
          var total_price = that.data.total_price;

          if (tab == 'take-out') {
            var order_price = app.plus(total_price, data.result.fee)
          } else {
            var order_price = total_price
          }
          that.setData({
            delivery_fee: data.result.fee,
            order_price: order_price
          })
        });
      }
      
    } else {
      //获取默认地址
      utils.PostRequest(api_v_url + '/address/getDefaultAddress', {
        openid: openid,
      }, (data, headers, cookies, errMsg, statusCode) => {
        var address_info = data.result;
        if (JSON.stringify(address_info) == '{}') {
          that.setData({
            is_have_default_address: false,
            address_id: '',
            order_price: that.data.total_price,
            delivery_fee:0,
          })

        } else {
          var delivery_platform = that.data.delivery_platform;
          var address_id = address_info.address_id;
          var money = that.data.total_price;
          if (delivery_platform == 1 && address_id != '') {//获取配送费
            utils.PostRequest(api_v_url + '/order/getDeliveryfee', {
              address_id: address_id,
              merchant_id: merchant_id,
              money: money,
              openid: openid
            }, (data, headers, cookies, errMsg, statusCode) => {
              var tab = that.data.tab;
              var total_price = that.data.total_price;

              if (tab == 'take-out') {
                var order_price = app.plus(total_price, data.result.fee)
              } else {
                var order_price = total_price
              }
              console.log(order_price)
              that.setData({
                delivery_fee: data.result.fee,
                order_price: order_price
              })
            });
          } else {
            var total_price = that.data.total_price;
            that.setData({
              delivery_fee:0,
              order_price: total_price
            })
          }


          that.setData({
            is_have_default_address: true,
            address_info: data.result,
            address_id: data.result.address_id
          })
        }
      });

    }
    //获取订单备注
    var remark_strs = wx.getStorageSync(cache_key + 'order:remark')
    if(remark_strs!=''){
      that.setData({
        remark_strs: remark_strs
      })
    }
    
    //获取发票信息
    var bill_info = wx.getStorageSync(cache_key + 'order:bill');
    if(bill_info!=''){
      bill_info = JSON.parse(bill_info);
      that.setData({
        bill_info:bill_info
      })
    }
  },
  /**
   * 支付方式
   */
  selectPayType:function(e){
    var pay_type = e.detail.value;
    this.setData({
      pay_type: pay_type,
    })
  },
  /**
   * 选择配送时间
   */
  selectDeleveryTime:function(e){
    var delivery_index = e.detail.value;
    this.setData({
      delivery_index: delivery_index
    })
  },
  /**
   * 选择餐具份数
   */
  selectTabWare:function(e){
    var tableware_index = e.detail.value;
    this.setData({
      tableware_index: tableware_index
    })
  },
  //选择自取时间
  selectSelfPick:function(e){
    var selfpick_time = e.detail.value;
    this.setData({
      selfpick_time: selfpick_time
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
  onShareAppMessage: function () {

  },

  // 关闭订单确认弹窗
  closeBuyConfirmPopWindow: function (e) {
    let self = this;
    self.setData({ showBuyConfirmPopWindow: false });
    wx.navigateBack({
      delta: 1
    })
  },


  // 选项卡选择
  showTab: function (e) {
    let self = this;
    let tabType = e.currentTarget.dataset.tab;
    self.setData({ tab: tabType });
    var total_price = self.data.total_price;
    var delivery_fee = self.data.delivery_fee;
    if (tabType =='take-out'){
      var order_price = app.plus(total_price,delivery_fee);
    }else {
      var order_price = total_price;
    }
    self.setData({
      order_price: order_price
    })
  }
})