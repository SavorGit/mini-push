// pages/hotel/detail.js
const app = getApp()
const utils = require('../../utils/util.js')
const mta = require('../../utils/mta_analysis.js')
var api_url = app.globalData.api_url;
var cache_key = app.globalData.cache_key;
var merchant_id;
var page = 1;
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
    statusBarHeight: getApp().globalData.statusBarHeight,
    is_share: false,
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
        that.setData({
          is_share: true
        })
        mta.Event.stat('openShareMerchant', { 'merchantid': merchant_id, 'openid': app.globalData.openid })
      } else {
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
      that.getDishInfo(merchant_id)




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
            that.setData({
              is_share: true
            })
            mta.Event.stat('openShareMerchant', { 'merchantid': merchant_id, 'openid': openid })
          } else {
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
          that.getDishInfo(merchant_id)
        }
      }
    }


  },
  getMerchantInfo: function (merchant_id) {
    var that = this;
    utils.PostRequest(api_url + '/Smallapp4/merchant/info', {
      merchant_id: merchant_id,
    }, (data, headers, cookies, errMsg, statusCode) => that.setData({
      hotel_info: data.result
    }));
  },
  getDishInfo: function (merchant_id) {
    var that = this;
    utils.PostRequest(api_url + '/Smallapp4/dish/goodslist', {
      merchant_id: merchant_id,
      page: 1
    }, (data, headers, cookies, errMsg, statusCode) => that.setData({
      dishes_list: data.result
    }));
  },
  /**
   * 拨打订餐电话
   */
  phonecallevent: function (e) {
    var tel = e.target.dataset.tel;
    wx.makePhoneCall({
      phoneNumber: tel
    })

  },
  loadMore: function (e) {
    var that = this;
    page += 1;
    //菜品列表
    utils.PostRequest(api_url + '/Smallapp4/dish/goodslist', {
      merchant_id: merchant_id,
      page: page
    }, (data, headers, cookies, errMsg, statusCode) => that.setData({
      dishes_list: data.result
    }));
  },
  /**
   * 下单
   */
  placeOrder: function (e) {
    var goods_id = e.currentTarget.dataset.goods_id;
    var openid = e.currentTarget.dataset.openid;
    wx.navigateTo({
      url: '/pages/hotel/order/account?goods_id=' + goods_id + "&openid=" + openid,
    })

  },
  gotoDisheDetail: function (e) {
    var goods_id = e.currentTarget.dataset.goods_id;
    wx.navigateTo({
      url: '/pages/hotel/dishes/detail?goods_id=' + goods_id,
    })
  },
  previewImage: function (e) {
    var current = e.currentTarget.dataset.src;
    var urls = [];
    for (var i = 0; i < 1; i++) {
      urls[i] = current;
    }
    wx.previewImage({
      current: urls[0], // 当前显示图片的http链接
      urls: urls // 需要预览的图片http链接列表
    })

  },
  /**
   * 第三方平台
   */
  gotoPlatform: function (e) {
    wx.navigateTo({
      url: '/pages/hotel/platform/index?merchant_id=' + merchant_id,
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
    if (cart_list == '') {
      cart_list = [];
      goods_info.amount = 1;

      cart_list.unshift(goods_info);
      console.log(cart_list)
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
      console.log(cart_list)
      cart_list = JSON.stringify(cart_list);
      wx.setStorageSync(cache_key + 'cart_' + merchant_id, cart_list)

    }
    app.showToast('购物车添加成功', 2000, 'success')
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
    //菜品列表
    utils.PostRequest(api_url + '/Smallapp4/dish/goodslist', {
      merchant_id: merchant_id,
      page: page
    }, (data, headers, cookies, errMsg, statusCode) => that.setData({
      dishes_list: data.result
    }));
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
    var that = this;
    page += 1;
    //菜品列表
    utils.PostRequest(api_url + '/Smallapp4/dish/goodslist', {
      merchant_id: merchant_id,
      page: page
    }, (data, headers, cookies, errMsg, statusCode) => that.setData({
      dishes_list: data.result
    }));
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (e) {
    var that = this;

    var img_url = that.data.hotel_info.img;
    var hotel_name = that.data.hotel_info.name;
    //console.log(e)
    //console.log(that.data)
    mta.Event.stat('shareMerchant', { 'merchantid': merchant_id, 'openid': that.data.openid, 'types': 1 })
    if (e.from === 'button') {
      // 来自页面内转发按钮
      return {
        title: hotel_name + '推出了特惠菜品',
        path: '/pages/hotel/detail?merchant_id=' + merchant_id + "&is_share=1",
        imageUrl: img_url,
        success: function (res) {
        },
      }
    } else {
      return {
        title: hotel_name + '推出了特惠菜品',
        path: '/pages/hotel/detail?merchant_id=' + merchant_id + "&is_share=1",
        imageUrl: img_url,
        success: function (res) {
        },
      }
    }

  },

  // 打开购物车弹窗
  openShoppingCartWindow: function (e) {
    let self = this;
    self.setData({ showShoppingCartPopWindow: true, showShoppingCartWindow: true });
  },

  // 关闭购物车弹窗
  closeShoppingCartWindow: function (e) {
    let self = this;
    self.setData({ showShoppingCartWindow: false });
    setTimeout(function () {
      self.setData({ showShoppingCartPopWindow: false });
    }, 500);
  },

  // 清空购物车
  cleanShoppingCart: function (e) {
    let self = this;
  }
})