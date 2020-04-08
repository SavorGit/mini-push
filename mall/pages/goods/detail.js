// mall/pages/goods/detail.js
/**
 * 【商城】商品详情页面
 */
const utils = require('../../../utils/util.js')
var mta = require('../../../utils/mta_analysis.js')
const app = getApp()
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
var cache_key = app.globalData.cache_key;
var goods_id;
let SavorUtils = {
  User: {

    // 判断用户是否注册
    isRegister: pageContext => utils.PostRequest(api_v_url + '/User/isRegister', {
      openid: pageContext.data.openid,
      page_id: 2
    }, (data, headers, cookies, errMsg, statusCode) => wx.setStorage({
      key: 'savor_user_info',
      data: data.result.userinfo,
    }), function () {
      if (app.globalData.link_type != 2) {
        wx.setStorage({
          key: 'savor_user_info',
          data: {
            openid: app.globalData.openid
          }
        })
      }

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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    if (app.globalData.openid && app.globalData.openid != '') {
      //注册用户
      self.setData({
        openid: app.globalData.openid
      });
      SavorUtils.User.isRegister(self); //判断用户是否注册
    } else {
      app.openidCallback = openid => {
        if (openid != '') {
          self.setData({
            openid: openid
          });
          SavorUtils.User.isRegister(self); //判断用户是否注册
        }
      }
    }
    if (typeof (options.q) != 'undefined') {
      var q = decodeURIComponent(options.q);
      var selemite = q.indexOf("?");
      var pams = q.substring(selemite + 3, q.length);

      var pams_arr = pams.split('_');
      goods_id = pams_arr[1];
      self.setData({
        is_share: true
      })
      
    }else{
      goods_id = options.goods_id;
      if (typeof (options.is_share) != 'undefined' && options.is_share == 1) {
        self.setData({
          is_share: true
        })
      } else {
        self.setData({
          is_share: false
        })
      }
    }


    //获取商品详情
    self.getGoodsInfo(goods_id);
  },
  getGoodsInfo:function(goods_id){
    var that = this;
    utils.PostRequest(api_v_url + '/dish/detail', {
      goods_id:goods_id
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        goods_info:data.result,
        merchant: data.result.merchant
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
    if (e.from === 'button') {
      // 来自页面内转发按钮
      return {
        title: hotel_name + '推出了特惠商品-' + goods_name,
        path: '/mall/pages/goods/detail?goods_id=' + goods_id + "&is_share=1",
        imageUrl: img_url,
        success: function (res) {
        },
      }
    } else {
      return {
        title: hotel_name + '推出了特惠商品-' + goods_name,
        path: '/mall/pages/goods/detail?goods_id=' + goods_id + "&is_share=1",
        imageUrl: img_url,
        success: function (res) {
        },
      }
    }
  }
})