// mall/pages/hotel/index.js
/**
 * 【商城】店铺页面
 */
const utils = require('../../../utils/util.js')
var mta = require('../../../utils/mta_analysis.js')
const app = getApp()
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
var cache_key = app.globalData.cache_key;
var merchant_id;
var page_mall = 1;
var page_takeaway = 1;
var tab = 'goods';
let SavorUtils = {
  User: {

    // 判断用户是否注册
    isRegister: pageContext => utils.PostRequest(api_url + '/smallapp21/User/isRegister', {
      openid: pageContext.data.openid,
      page_id: 41
    }, (data, headers, cookies, errMsg, statusCode) => wx.setStorage({
      key: 'savor_user_info',
      data: data.result.userinfo,
    }), function () {
      wx.setStorage({
        key: 'savor_user_info',
        data: {
          openid: app.globalData.openid
        }
      })

    }, { isShowLoading: false }),
  },

};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    SystemInfo: getApp().SystemInfo,
    statusBarHeight: getApp().globalData.statusBarHeight,
    is_share: false,
    cart_list: [],
    cart_dish_nums: 0,
    total_price: 0,

    tab: 'goods',
    
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    
    if (app.globalData.openid && app.globalData.openid != '') {
      //注册用户
      that.setData({
        openid: app.globalData.openid
      });
      SavorUtils.User.isRegister(that); //判断用户是否注册
      if (typeof (options.q) != 'undefined') {
        var q = decodeURIComponent(options.q);
        var selemite = q.indexOf("?");
        var pams = q.substring(selemite + 3, q.length);

        var pams_arr = pams.split('_');
        merchant_id = pams_arr[1];
        var tab = pams_arr[3];
        that.setData({
          is_share: true,
          tab: tab,
        })
        mta.Event.stat('openShareMerchant', { 'merchantid': merchant_id, 'openid': app.globalData.openid })
      } else {
        if (typeof (options.tab) !='undefined'){
          var tab = options.tab
        }else {
          var tab = 'goods';
        }
        that.setData({
          tab:tab,
        })
        merchant_id = options.merchant_id;
        if (typeof (options.is_share) != 'undefined' && options.is_share == 1) {
          that.setData({
            is_share: true
          })
          mta.Event.stat('openShareMerchant', { 'merchantid': merchant_id, 'openid': app.globalData.openid })
        } else {
          that.setData({
            is_share: false
          })
        }
      }
      //商家详情
      that.getMerchantInfo(merchant_id);
      //菜品列表
      that.getDishInfo(merchant_id,21,1)
      //商城商品列表
      that.getDishInfo(merchant_id, 22,1)
      //购物车列表
      that.getCartInfo(merchant_id);
    } else {
      app.openidCallback = openid => {
        if (openid != '') {
          that.setData({
            openid: openid
          });
          SavorUtils.User.isRegister(that); //判断用户是否注册
          if (typeof (options.q) != 'undefined') {
            var q = decodeURIComponent(options.q);
            var selemite = q.indexOf("?");
            var pams = q.substring(selemite + 3, q.length);

            var pams_arr = pams.split('_');
            merchant_id = pams_arr[1];
            var tab = pams_arr[3];
            that.setData({
              is_share: true,
              tab: tab
            })
            mta.Event.stat('openShareMerchant', { 'merchantid': merchant_id, 'openid': openid })
          } else {
            if (typeof (options.tab) != 'undefined') {
              var tab = options.tab
            } else {
              var tab = 'goods';
            }
            that.setData({
              tab: tab,
            })
            merchant_id = options.merchant_id;
            if (typeof (options.is_share) != 'undefined' && options.is_share == 1) {
              that.setData({
                is_share: true
              })
              mta.Event.stat('openShareMerchant', { 'merchantid': merchant_id, 'openid': openid })
            } else {
              that.setData({
                is_share: false
              })
            }
          }
          //商家详情
          that.getMerchantInfo(merchant_id);

          //菜品列表
          that.getDishInfo(merchant_id,21,1)
          //商城商品列表
          that.getDishInfo(merchant_id, 22,1)
          //购物车列表
          that.getCartInfo(merchant_id);
        }
      }
    }
    if(typeof(options.tab)!='undefined'){
      tab = options.tab;
      that.setData({tab,tab})
    }
  },
  getMerchantInfo: function (merchant_id) {
    var that = this;
    utils.PostRequest(api_v_url + '/merchant/info', {
      merchant_id: merchant_id,
    }, (data, headers, cookies, errMsg, statusCode) =>{
      var mtype = data.result.mtype;
      if(mtype==2){
        var tab ='goods';
        that.setData({
          tab:tab,
        })
      }
      that.setData({
        mtype:data.result.mtype,
        hotel_info: data.result
      })

    });
  },
  getDishInfo: function (merchant_id,type,page) {
    var that = this;
    utils.PostRequest(api_v_url + '/dish/goodslist', {
      merchant_id: merchant_id,
      page: page,
      type:type
    }, (data, headers, cookies, errMsg, statusCode) => {
      if(type==21){
        that.setData({
          dishes_list: data.result
        })
      }else {
        that.setData({
          goods_list: data.result
        })
      }
    });
  },
  getCartInfo: function (merchant_id) {
    var that = this;
    var cart_list = wx.getStorageSync(cache_key + 'cart_' + merchant_id)
    if (cart_list != '') {
      cart_list = JSON.parse(cart_list);
      var total_price = 0;
      var goods_price = 0;
      var cart_dish_nums = 0;
      for (var i = 0; i < cart_list.length; i++) {
        goods_price = app.accMul(cart_list[i].price, cart_list[i].amount)

        total_price = app.plus(total_price, goods_price)
        cart_dish_nums += cart_list[i].amount;

      }
      that.setData({
        cart_list: cart_list,
        cart_dish_nums: cart_dish_nums,
        total_price: total_price,
      })
    }

  },
  /**
   * 拨打订餐电话
   */
  phonecallevent: function (e) {
    var tel = e.target.dataset.tel;
    app.phonecallevent(tel);
  },
  gotoDetail:function(e){
    var goods_id = e.currentTarget.dataset.goods_id;
    var type = e.currentTarget.dataset.type;
    if(type== 21){
      var url = '/pages/hotel/dishes/detail?goods_id=' + goods_id 
    }else if (type == 22) {
      var url = '/mall/pages/goods/detail?goods_id=' + goods_id;
    }
    wx.navigateTo({
      url: url,
    })
  },
  /**
   * 添加购物车
   */
  addCart: function (e) {
    var that = this;
    let index = e.currentTarget.dataset.index;
    var goods_info = e.currentTarget.dataset.goods_info;
    var cart_list = wx.getStorageSync(cache_key + 'cart_' + merchant_id)
    let dishesList = that.data.dishes_list;
    dishesList[index].addToCart = true;
    that.setData({ dishes_list: dishesList });
    setTimeout(function () {
      delete dishesList[index].addToCart;
      that.setData({ dishes_list: dishesList });
    }, 500);
    var cart_dish_nums = 0;
    var goods_price = 0;
    var total_price = 0;
    if (cart_list == '') {
      cart_list = [];
      goods_info.amount = 1;

      cart_list.unshift(goods_info);

      for (var i = 0; i < cart_list.length; i++) {
        goods_price = app.accMul(cart_list[i].price, cart_list[i].amount)

        total_price = app.plus(total_price, goods_price)
        cart_dish_nums += cart_list[i].amount;
      }
      that.setData({
        cart_list: cart_list,
        cart_dish_nums: cart_dish_nums,
        total_price: total_price
      })
      cart_list = JSON.stringify(cart_list);
      wx.setStorageSync(cache_key + 'cart_' + merchant_id, cart_list)
    } else {
      cart_list = JSON.parse(cart_list)

      var is_have = 0;
      for (var i = 0; i < cart_list.length; i++) {
        if (cart_list[i].id == goods_info.id) {
          cart_list[i].amount += 1;
          is_have = 1;
          break;
        }
      }
      if (is_have == 0) {
        goods_info.amount = 1;
        cart_list.unshift(goods_info);
      }

      for (var i = 0; i < cart_list.length; i++) {
        goods_price = app.accMul(cart_list[i].price, cart_list[i].amount)

        total_price = app.plus(total_price, goods_price)
        cart_dish_nums += cart_list[i].amount;
      }
      that.setData({
        cart_list: cart_list,
        cart_dish_nums: cart_dish_nums,
        total_price: total_price
      })
      cart_list = JSON.stringify(cart_list);
      wx.setStorageSync(cache_key + 'cart_' + merchant_id, cart_list)

    }
    app.showToast('购物车添加成功', 2000, 'success')
    mta.Event.stat('addCart', { 'openid': that.data.openid, 'goodsid': goods_info.id })
  },
  cutNum: function (e) {
    var that = this;
    var keys = e.currentTarget.dataset.keys;
    var cart_list = wx.getStorageSync(cache_key + 'cart_' + merchant_id)
    if (cart_list != '') {
      cart_list = JSON.parse(cart_list);
      var cart_dish_nums = 0;
      var goods_price = 0;
      var total_price = 0;
      for (var i = 0; i < cart_list.length; i++) {
        if (i == keys) {
          if (cart_list[i].amount == 1) {
            cart_list.splice(keys, 1);
          } else {
            console.log(cart_list);
            cart_list[i].amount -= 1;
            console.log(cart_list)
            cart_dish_nums += cart_list[i].amount;

            goods_price = app.accMul(cart_list[i].price, cart_list[i].amount)

            total_price = app.plus(total_price, goods_price)

          }
          //break;
        } else {
          cart_dish_nums += cart_list[i].amount;
          goods_price = app.accMul(cart_list[i].price, cart_list[i].amount)

          total_price = app.plus(total_price, goods_price)
        }
      }
      that.setData({
        cart_list: cart_list,
        cart_dish_nums: cart_dish_nums,
        total_price: total_price
      })
      if (cart_list.length == 0) {
        try {
          wx.removeStorageSync(cache_key + 'cart_' + merchant_id);
        } catch (e) {

        }
      } else {
        cart_list = JSON.stringify(cart_list);
        wx.setStorageSync(cache_key + 'cart_' + merchant_id, cart_list)
      }

    }
  },
  addNum: function (e) {
    var that = this;
    var keys = e.currentTarget.dataset.keys;
    var cart_list = wx.getStorageSync(cache_key + 'cart_' + merchant_id)
    if (cart_list != '') {
      cart_list = JSON.parse(cart_list);

      var cart_dish_nums = 0;

      var total_price = 0;
      var goods_price = 0;
      for (var i = 0; i < cart_list.length; i++) {
        if (i == keys) {
          cart_list[i].amount += 1;

        }
        goods_price = app.accMul(cart_list[i].price, cart_list[i].amount)

        total_price = app.plus(total_price, goods_price)
        cart_dish_nums += cart_list[i].amount;
      }
      that.setData({
        cart_list: cart_list,
        cart_dish_nums: cart_dish_nums,
        total_price: total_price
      })
      cart_list = JSON.stringify(cart_list);
      wx.setStorageSync(cache_key + 'cart_' + merchant_id, cart_list)
    }
  },
  /**
   * 清空购物车
   */
  clearCart: function (e) {
    var that = this;
    wx.removeStorage({
      key: cache_key + 'cart_' + merchant_id,
      success(res) {
        that.setData({
          cart_list: [],
          cart_dish_nums: 0,
          total_price: 0,
        })
        app.showToast('清空成功', 2000, 'success')
      }, fail: function () {
        app.showToast('清空成功')
      }
    })
  },
  /**
   * 去结算
   */
  gotoOrder: function (e) {
    let self = this;
    var cart_list = wx.getStorageSync(cache_key + 'cart_' + merchant_id);
    if (cart_list != '') {
      wx.navigateTo({
        url: '/pages/hotel/order/account?openid=' + this.data.openid + '&merchant_id=' + merchant_id + '&merchant_name=' + this.data.hotel_info.name + '&order_type=2&area_id=' + this.data.hotel_info.area_id,
      })

      self.setData({ showShoppingCartWindow: false });
      setTimeout(function () {
        self.setData({ showShoppingCartPopWindow: false });
      }, 500);
      mta.Event.stat('gotoAccounts', { 'openid': this.data.openid })
    } else {
      app.showToast('购物车没有商品');
    }
  },
  loadMore:function(e){
    var that = this;
    var tab = that.data.tab;
    if (tab =='goods'){
      page_mall +=1;
      that.getDishInfo(merchant_id, 22, page_mall);
    } else if (tab =='foods'){
      page_takeaway +=1;
      that.getDishInfo(merchant_id, 21, page_takeaway);
    }
  },


  // 打开购买弹窗
  openBuyGoodsPopWindow: function (e) {
    let self = this;
    var goods_info = e.currentTarget.dataset.goods_info;
    goods_info.amount = 1;
    self.setData({
      showBuyGoodsPopWindow: true,
      goods_info: goods_info
    });
  },

  // 关闭购买弹窗
  closeBuyGoodsPopWindow: function (e) {
    let self = this;
    self.setData({
      showBuyGoodsPopWindow: false
    });
  },
  //购物车减数量
  cutMallNum: function (e) {
    var that = this;
    var goods_info = that.data.goods_info;
    var stock_num = goods_info.stock_num; //库存
    if (goods_info.amount == 1) {
      app.showToast('至少选择一件商品');
      return false;
    }
    goods_info.amount -= 1;
    that.setData({
      goods_info: goods_info,
    })
  },
  //购物车增数量
  addMallNum: function (e) {
    var that = this;
    var goods_info = that.data.goods_info;
    var stock_num = goods_info.stock_num; //库存
    if (goods_info.amount == stock_num) {
      app.showToast('该商品库存不足');
      return false;
    }
    goods_info.amount += 1;
    that.setData({
      goods_info: goods_info,
    })
  },
  addMallCart: function (e) {
    var that = this;
    var goods_info = that.data.goods_info;
    goods_info.ischecked = true;
    var user_info = wx.getStorageSync("savor_user_info");
    var openid = user_info.openid;
    var mall_cart_list = wx.getStorageSync(cache_key + 'mall_cart_' + openid);
    if (mall_cart_list == '') {
      mall_cart_list = [];
      mall_cart_list.unshift(goods_info);
      mall_cart_list = JSON.stringify(mall_cart_list);
      wx.setStorageSync(cache_key + 'mall_cart_' + openid, mall_cart_list)
      that.setData({
        mall_cart_nums: goods_info.amount
      })
    } else {
      mall_cart_list = JSON.parse(mall_cart_list)

      var is_have = 0;
      for (var i = 0; i < mall_cart_list.length; i++) {
        if (mall_cart_list[i].id == goods_info.id) {
          mall_cart_list[i].amount += goods_info.amount;
          mall_cart_list[i].ischecked = true;
          is_have = 1;
          break;
        }
      }
      if (is_have == 0) {
        mall_cart_list.unshift(goods_info);
      }
      var mall_cart_nums = 0;
      for (let index in mall_cart_list) {
        mall_cart_nums += mall_cart_list[index].amount;
      }
      that.setData({
        mall_cart_nums: mall_cart_nums
      })

      mall_cart_list = JSON.stringify(mall_cart_list);
      wx.setStorageSync(cache_key + 'mall_cart_' + openid, mall_cart_list)
    }

    app.showToast('添加购物车成功');
  },
  buyOne: function (e) {
    var that = this;
    var goods_info = that.data.goods_info;
    var user_info = wx.getStorageSync("savor_user_info");
    var openid = user_info.openid;
    wx.navigateTo({
      url: '/mall/pages/order/confirmation?goods_id=' + goods_info.id + '&openid=' + openid + '&order_type=1&amount=' + goods_info.amount,
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

    var img_url = that.data.hotel_info.img;
    var hotel_name = that.data.hotel_info.name;
    var tab = that.data.tab;
    if(tab=='goods'){
      var title = hotel_name + '推出了特惠商品'
    }else if(tab=='foods'){
      var title = hotel_name + '推出了特惠菜品'
    }
    //console.log(e)
    //console.log(that.data)
    mta.Event.stat('shareMerchant', { 'merchantid': merchant_id, 'openid': that.data.openid, 'types': 1 })
    if (e.from === 'button') {
      // 来自页面内转发按钮
      return {
        title: title,
        path: '/mall/pages/hotel/index?merchant_id=' + merchant_id + "&is_share=1&tab="+tab,
        imageUrl: img_url,
        success: function (res) {
        },
      }
    } else {
      return {
        title: title,
        path: '/mall/pages/hotel/index?merchant_id=' + merchant_id + "&is_share=1&tab="+tab,
        imageUrl: img_url,
        success: function (res) {
        },
      }
    }
  },

  

  // 选项卡选择
  showTab: function (e) {
    let self = this;
    let tabType = e.currentTarget.dataset.tab;
    self.setData({
      tab: tabType
    });
  },

  // 打开购物车弹窗 - 菜品
  openDishesCartWindow: function (e) {
    let self = this;
    self.setData({ showDishesCartPopWindow: true, showDishesCartWindow: true });
  },

  // 关闭购物车弹窗 - 菜品
  closeDishesCartWindow: function (e) {
    let self = this;
    self.setData({ showDishesCartWindow: false });
    setTimeout(function () {
      self.setData({ showDishesCartPopWindow: false });
    }, 500);
  },
})