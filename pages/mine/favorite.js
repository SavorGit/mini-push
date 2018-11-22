// pages/mine/favorite.js
const app = getApp();
var openid;
var page = 1;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    openid: '',
    page: 1,
    userinfo: [],
    sharelist: [],
    keys: '',
    hiddens: true,
    forscreen_id:'',
    collect:1
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    if (app.globalData.openid && app.globalData.openid != '') {
      that.setData({
        openid: app.globalData.openid
      })
      wx.setStorage({
        key: 'savor_user_info',
        data: { 'openid': app.globalData.openid },
      })

    } else {
      app.openidCallback = openid => {
        if (openid != '') {
          that.setData({
            openid: openid
          })
          
          wx.setStorage({
            key: 'savor_user_info',
            data: { 'openid': openid },
          })
        }
      }
    }
    //获取用户信息以及我的公开

    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    wx.request({
      url: 'https://mobile.littlehotspot.com/Smallapp21/User/getMyCollect',
      headers: {
        'Content-Type': 'application/json'
      },
      data: { openid: openid },
      success: function (res) {
        that.setData({
          //userinfo: res.data.result.user_info,
          sharelist: res.data.result.list,
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

  },
  

  popDel: function(e) {
    var forscreen_id = e.currentTarget.dataset.forscreen_id;
    var keys = e.currentTarget.dataset.keys;
    //console.log(forscreen_id);
    this.setData({
      showModal: true,
      forscreen_id: forscreen_id,
      keys: keys
    });
  },
  modalConfirm: function(e) {
    var that = this;
    var forscreen_id = e.currentTarget.dataset.forscreen_id;

    wx.request({
      url: 'https://mobile.littlehotspot.com/Smallapp/User/delMycollect',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        openid: openid,
        res_id: forscreen_id
      },
      success: function (res) {
        that.onLoad()
      }
    })
  },
  modalCancel: function(e) {

  },
  //预览图片
  previewImage: function (e) {
    var current = e.target.dataset.src;
    var pkey = e.target.dataset.pkey;
    var urls = [];
    for (var row in current) {
      urls[row] = current[row]['res_url']

    }
    //console.log(pkey);
    wx.previewImage({
      current: urls[pkey], // 当前显示图片的http链接
      urls: urls // 需要预览的图片http链接列表
    })
  },
  //上拉刷新
  loadMore: function (e) {
    var that = this;

    page = page + 1;
    that.setData({
      hiddens: false,
    })
    wx.request({
      url: 'https://mobile.littlehotspot.com/smallapp/user/getMyCollect',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        page: page,
        openid: openid,
      },
      method: "POST",
      success: function (res) {
        if (res.data.code == 10000) {
          that.setData({
            userinfo: res.data.result.user_info,
            sharelist: res.data.result.list,
            hiddens: true,
          })

        } else {
          that.setData({
            hiddens: true,
          })
        }
      }
    })
  },
})