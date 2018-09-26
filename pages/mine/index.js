// pages/mine/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 0,
    swiperTabHeight: 150
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },
  //滑动切换
  swiperTab: function(e) {
    var that = this;
    var swiperItemIndex;
    if (typeof(e) != 'undefined' && typeof(e.detail) != 'undefined') {
      swiperItemIndex = e.detail.current;
    }
    if (typeof(swiperItemIndex) != 'number') {
      swiperItemIndex = 0;
    }
    var query = wx.createSelectorQuery();
    query.select('#tab_' + swiperItemIndex).boundingClientRect(function(rect) {
      that.setData({
        swiperTabHeight: rect.height + 10,
        currentTab: swiperItemIndex
      });
    }).exec();
  },
  //点击切换
  clickTab: function(e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.swiperTab();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})