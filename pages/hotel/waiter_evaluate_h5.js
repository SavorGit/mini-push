// pages/hotel/waiter_evaluate_h5.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isCollectOfficialAccount: false,// 是否关注公众号
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    /*let self = this;
    console.log('waiter_evaluate_h5', 'onLoad');
    if (self.data.isCollectOfficialAccount == false) {
      wx.navigateTo({
        url: '/pages/hotel/waiter_evaluate',
      });
    }*/
    var that = this;
    var box_id = options.box_id;
    var openid = options.openid;
    var l_url = app.api_url;
    var web_url = l_url +'/h5/comment/info/p/'+openid+'_'+box_id;
    that.setData({
      web_url:web_url,
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