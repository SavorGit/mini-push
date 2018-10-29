// pages/thematic/birthday/list.js
const app = getApp()
var box_mac;
var openid;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid:'',
    box_mac:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    openid = options.openid;
    box_mac= options.box_mac;
    that.setData({
      openid:openid,
      box_mac:box_mac
    })
  },
  showHappy:function(e){
    var box_mac = e.currentTarget.dataset.boxmac;
    var openid = e.currentTarget.dataset.openid;
    var vediourl = e.currentTarget.dataset.vediourl;
    var forscreen_char = e.currentTarget.dataset.name;

    var index1 = vediourl.lastIndexOf("/");
    var index2 = vediourl.length;
    var filename = vediourl.substring(index1 + 1, index2);//后缀名
    var timestamp = (new Date()).valueOf();
    var mobile_brand = app.globalData.mobile_brand;
    var mobile_model = app.globalData.mobile_model;
    wx.request({
      url: "https://netty-push.littlehotspot.com/push/box",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "POST",
      data: {
        box_mac: box_mac,
        cmd: 'call-mini-program',
        msg: '{ "action": 5,"url":"' + vediourl + '","filename":"' + filename + '"}',
        req_id: timestamp
      },
      success: function (res) {
        wx.showToast({
          title: '点播成功,电视即将开始播放',
          icon: 'none',
          duration: 5000
        });
        wx.request({
          url: 'https://mobile.littlehotspot.com/Smallapp/index/recordForScreenPics',
          header: {
            'content-type': 'application/json'
          },
          data: {
            openid: openid,
            box_mac: box_mac,
            action: 5,
            mobile_brand: mobile_brand,
            mobile_model: mobile_model,
            forscreen_char: forscreen_char,
            imgs: '["media/resource/' + filename + '"]'
          },
        });
      },
      fail: function (res) {
        wx.showToast({
          title: '网络异常,点播失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
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