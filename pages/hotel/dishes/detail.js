// pages/hotel/dishes/detail.js
const app = getApp()
const utils = require('../../../utils/util.js')
const mta = require('../../../utils/mta_analysis.js')
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url
var cache_key = app.globalData.cache_key;
var goods_id;
let SavorUtils = {
  User: {

    // 判断用户是否注册
    isRegister: pageContext => utils.PostRequest(api_v_url + '/User/isRegister', {
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
    amount: 1,
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
      if (typeof (options.q) != 'undefined') {
        var q = decodeURIComponent(options.q);
        var selemite = q.indexOf("?");
        var pams = q.substring(selemite + 3, q.length);

        var pams_arr = pams.split('_');
        goods_id = pams_arr[1];
        that.setData({
          is_share: true
        })
        console.log("openid:" + app.globalData.openid)
        mta.Event.stat('openShareDishes', { 'openid': app.globalData.openid, 'goodsid': goods_id })
      } else {
        goods_id = options.goods_id;
        if (typeof (options.is_share) != 'undefined' && options.is_share == 1) {
          that.setData({
            is_share: true
          })
          console.log("openid:" + app.globalData.openid)
          mta.Event.stat('openShareDishes', { 'openid': app.globalData.openid, 'goodsid': goods_id })
        } else {
          that.setData({
            is_share: false
          })
        }
      }
      //菜品详情
      that.getDishInfo(goods_id)
      SavorUtils.User.isRegister(that); //判断用户是否注册
    } else {
      app.openidCallback = openid => {
        if (openid != '') {
          that.setData({
            openid: openid
          });

          if (typeof (options.q) != 'undefined') {
            var q = decodeURIComponent(options.q);
            var selemite = q.indexOf("?");
            var pams = q.substring(selemite + 3, q.length);

            var pams_arr = pams.split('_');
            goods_id = pams_arr[1];
            that.setData({
              is_share: true
            })
            console.log("openid:" + app.globalData.openid)
            mta.Event.stat('openShareDishes', { 'openid': openid, 'goodsid': goods_id })
          } else {
            goods_id = options.goods_id;
            if (typeof (options.is_share) != 'undefined' && options.is_share == 1) {
              that.setData({
                is_share: true
              })
              mta.Event.stat('openShareDishes', { 'openid': openid, 'goodsid': goods_id })
            } else {
              that.setData({
                is_share: false
              })
            }
          }
          //菜品详情
          that.getDishInfo(goods_id)


          SavorUtils.User.isRegister(that); //判断用户是否注册
        }
      }
    }


  },
  getDishInfo: function (goods_id) {
    var that = this;
    utils.PostRequest(api_v_url + '/dish/detail', {
      goods_id: goods_id,
    }, (data, headers, cookies, errMsg, statusCode) => that.setData({
      goods_info: data.result,
      merchant: data.result.merchant
    }), function () {
      var is_share = that.data.is_share
      if (is_share == true) {
        wx.reLaunch({
          url: '/pages/shopping/index',
        })

      } else {
        wx.navigateBack({
          delta: 1
        })
      }
    });
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
  gotoHotelDetail: function (e) {
    var merchant_id = e.currentTarget.dataset.merchant_id;
    wx.navigateTo({
      url: '/pages/hotel/shop?merchant_id=' + merchant_id+'&tab=foods',
    })
  },
  gotoPlaceOrder: function (e) {
    var self = this;
    var goods_id = e.currentTarget.dataset.goods_id;
    var openid = e.currentTarget.dataset.openid;
    var amount = e.currentTarget.dataset.amount;
    if (self.data.showChangeOrderGoodsPopWindow) {
      wx.navigateTo({
        url: '/pages/hotel/order/account?goods_id=' + goods_id + "&openid=" + openid + '&order_type=1&merchant_name=' + this.data.merchant.name + '&merchant_id=' + this.data.merchant.merchant_id+'&amount='+amount+'&area_id='+this.data.merchant.area_id,
        success: function (res) {
          self.closeChangeOrderGoodsWindow(e);
        }
      })
      mta.Event.stat('dishDetailPlaceOrder', { 'openid': openid, 'goodsid': goods_id });
    } else {
      self.openChangeOrderGoodsWindow(e);
    }
    // wx.navigateTo({
    //   url: '/pages/hotel/order/account?goods_id=' + goods_id + "&openid=" + openid + '&order_type=1&merchant_name=' + this.data.merchant.name + '&merchant_id=' + this.data.merchant.merchant_id,
    // })
    // mta.Event.stat('dishDetailPlaceOrder', { 'openid': openid, 'goodsid': goods_id })
  },
  cutNum:function(e){
    var amount = this.data.amount;
    amount = Number(amount);
    if(amount==1){
      app.showToast('数量不能小于1');
      return false;
    } 
    amount -=1;
    this.setData({
      amount:amount
    })

  },
  addNum:function(e){
    var amount = this.data.amount;
    amount = Number(amount);
    amount += 1;
    this.setData({
      amount:amount
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
    wx.removeStorageSync(cache_key + 'select_address_info')
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
    var img_url = that.data.goods_info.cover_imgs[0];
    var goods_name = that.data.goods_info.name;
    var hotel_name = that.data.merchant.name;
    var goods_id = that.data.goods_info.goods_id;
    //console.log(e)
    mta.Event.stat('shareDishes', { 'goodsid': goods_id, 'openid': that.data.openid })
    if (e.from === 'button') {
      // 来自页面内转发按钮
      return {
        title: hotel_name + '推出了特惠菜品-' + goods_name,
        path: '/pages/hotel/dishes/detail?goods_id=' + goods_id + "&is_share=1",
        imageUrl: img_url,
        success: function (res) {
        },
      }
    } else {
      return {
        title: hotel_name + '推出了特惠菜品-' + goods_name,
        path: '/pages/hotel/dishes/detail?goods_id=' + goods_id + "&is_share=1",
        imageUrl: img_url,
        success: function (res) {
        },
      }
    }
  },

  // 打开更改订单商品弹窗
  openChangeOrderGoodsWindow: function (e) {
    let self = this;
    self.setData({ showChangeOrderGoodsPopWindow: true, showChangeOrderGoodsWindow: true });

  },

  // 关闭更改订单商品弹窗
  closeChangeOrderGoodsWindow: function (e) {
    let self = this;
    self.setData({ showChangeOrderGoodsWindow: false });
    setTimeout(function () {
      self.setData({ showChangeOrderGoodsPopWindow: false });
    }, 500);
  }
})