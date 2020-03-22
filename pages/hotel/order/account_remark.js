// pages/hotel/order/account_remark.js
/**
 * 确认订单备注页面
 */
const app = getApp()
const utils = require('../../../utils/util.js')
const mta = require('../../../utils/mta_analysis.js')
var api_url = app.globalData.api_url;
var cache_key = app.globalData.cache_key;


Page({

  /**
   * 页面的初始数据
   */
  data: {
    SystemInfo: getApp().SystemInfo,
    statusBarHeight: getApp().globalData.statusBarHeight,
    remark_list:[],
    remark_strs:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    utils.PostRequest(api_url + '/Smallapp4/aa/bb', {
      
    }, (data, headers, cookies, errMsg, statusCode) => that.setData({
      remark_list: data.result
    }));
  },
  selectRemark:function(e){
    var remark_list = this.data.remark_list;
    var keys = e.currentTarget.dataset.keys;
    var remrk_strs = this.data.remark_strs;
    if(remark_strs==''){
      remark_strs = remark_list[keys].name;
    }else {
      remark_strs = '、'+remark_list[keys].name;
    }
    this.setData({
      remark_strs:remark_strs,
    })
  },
  saveRemark:function(e){
    var remark_str = this.data.remark_str;
    if(remark_str!=''){
      wx.setStorageSync(cache_key+'order:remark', remark_str);
    }
    wx.navigateBack({
      delta: 1
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

  }
})