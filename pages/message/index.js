// pages/message/index.js
const app = getApp()
var box_mac;
var openid;
var api_url = app.globalData.api_url;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    openid:'',
    box_mac:'',
    showModal: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    var user_info = wx.getStorageSync('savor_user_info')
    if (app.globalData.openid && app.globalData.openid != '') {
      //注册用户
      that.setData({
        openid: app.globalData.openid
      })
      openid = app.globalData.openid;
      //判断用户是否注册
      wx.request({
        url: api_url+'/smallapp21/User/isRegister',
        data: {
          "openid": app.globalData.openid,
          'page_id': 4
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          wx.setStorage({
            key: 'savor_user_info',
            data: res.data.result.userinfo,
          })
        },
        fail: function (e) {
          wx.setStorage({
            key: 'savor_user_info',
            data: { 'openid': app.globalData.openid },
          })
        }
      });//判断用户是否注册结束

    } else {
      app.openidCallback = openid => {
        if (openid != '') {
          that.setData({
            openid: openid
          })
          openid = openid;
          //判断用户是否注册
          wx.request({
            url: api_url+'/smallapp21/User/isRegister',
            data: {
              "openid": app.globalData.openid,
              "page_id": 4
            },
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {
              wx.setStorage({
                key: 'savor_user_info',
                data: res.data.result.userinfo,
              })
            },
            fail: function (e) {
              wx.setStorage({
                key: 'savor_user_info',
                data: { 'openid': openid },
              })
            }
          });//判断用户是否注册结束

        }
      }
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
    this.onLoad()
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

  },
  /**
   * 弹窗
   */
  showDialogBtn: function() {
    this.setData({
      showModal: true
    })
  },
  modalCancel: function() {
    this.setData({
      showModal: false
    })
  },
  modalConfirm: function() {
    this.setData({
      showModal: false
    })
  },



  /**关闭授权窗口 */
  closeAuth: function() {
    this.setData({
      showModal: false
    })
  }
})