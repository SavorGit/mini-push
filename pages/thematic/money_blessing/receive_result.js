// pages//thematic/money_blessing/receive_result.js
const app = getApp();
var openid;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var order_id = options.order_id;
    var sign     = options.sign;
    var user_id = options.user_id;
    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    wx.request({
      url: 'https://mobile.littlehotspot.com/Smallapp3/redpacket/grabBonusResult',
      header: {
        'content-type': 'application/json'
      },
      data:{
        order_id: order_id,
        sign: sign,
        user_id: user_id,
      },
      success:function(res){
        if(res.data.code==10000){
          that.setData({
            order_status: res.data.result.status,
            order_id: res.data.result.order_id,
            user_id: res.data.result.user_id,
            bless: res.data.result.bless,
            money: res.data.result.money,
            nickName: res.data.result.nickName,
            avatarUrl: res.data.result.avatarUrl,
            box_mac: res.data.result.mac,
            openid : openid,
          })
        }else {
          wx.reLaunch({
            url: '/pages/index/index',
          })
          wx.showToast({
            title: '红包领取失败',
            icon: 'none',
            duration: 2000,
          })
        }
      }
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