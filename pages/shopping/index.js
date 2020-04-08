// pages/shopping/index.js
/**
 * 【商城】首页
 */
const utils = require('../../utils/util.js')
var mta = require('../../utils/mta_analysis.js')
const app = getApp()
var timestamp = (new Date()).valueOf();
var box_mac; //当前连接机顶盒mac
var page = 1; //当前节目单页数
var user_id;
var program_list; //点播列表
var openid; //用户openid
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
var pageid = 1;
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
  Page: {},

  Netty: {}
};

Page({

  /**
   * 页面的初始数据
   */
  data: {
    SystemInfo: getApp().SystemInfo,
    statusBarHeight: getApp().globalData.statusBarHeight,
    topBanners: {
      indicatorDots: true,
      autoplay: true,
      interval: 3000,
      duration: 300,
      list:[]
    }
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
    var user_info = wx.getStorageSync("savor_user_info");
    //轮播图
    utils.PostRequest(api_v_url + '/Adsposition/getAdspositionList', {
      position: 1,
    }, (data, headers, cookies, errMsg, statusCode) => {
      var topBanners = self.data.topBanners;
      //topBanners.list.push(data.result);
      topBanners.list = data.result
      console.log(topBanners);
      self.setData({
        topBanners: topBanners,
      })
      //self.data.topBanners.list = data.result
    });
  },
  //banner点击跳转
  bannerGo: function (e) {
    var linkcontent = e.currentTarget.dataset.linkcontent;
    /*wx.navigateTo({
      url: linkcontent 
    })*/
    wx.switchTab({
      url: linkcontent
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
  onShareAppMessage: function () {

  },

  // 打开购买弹窗
  openBuyGoodsPopWindow: function (e) {
    let self = this;
    self.setData({
      showBuyGoodsPopWindow: true
    });
  },

  // 关闭购买弹窗
  closeBuyGoodsPopWindow: function (e) {
    let self = this;
    self.setData({
      showBuyGoodsPopWindow: false
    });
  }
})