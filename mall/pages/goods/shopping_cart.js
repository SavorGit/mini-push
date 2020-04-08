// mall/pages/goods/shopping_cart.js
/**
 * 【商城】购物车页面
 */


import touch from '../../../utils/touch.js'
Page({
  touch: new touch(),
  /**
   * 页面的初始数据
   */
  data: {
    SystemInfo: getApp().SystemInfo,
    statusBarHeight: getApp().globalData.statusBarHeight,
    list: [{}, {}, {}, {}, {}, {}]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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

  //
  touchstart: function (e) {
    let self = this;
    //开始触摸时 重置所有删除
    let data = self.touch._touchstart(e, this.data.list)
    this.setData({
      list: data
    })
  },

  //滑动事件处理
  touchmove: function (e) {
    let self = this;
    let data = self.touch._touchmove(e, this.data.list)
    this.setData({
      list: data
    })
  },
})