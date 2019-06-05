// 抢红包-红包列表 pages/thematic/money_blessing/grab_list.js
const app = getApp();
var openid;
var page = 1;
var box_mac;
var api_url = app.globalData.api_url;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    hiddens:true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    box_mac = options.box_mac;
    wx.request({
      url: api_url+'/Smallapp3/redpacket/sendList',
      header: {
        'content-type': 'application/json'
      },
      data: {
        openid: openid,
        page:page
      },
      success:function(res){
        //console.log(res);
        if(res.data.code==10000){
          that.setData({
            redpacket_list:res.data.result,
            box_mac:box_mac,
          })

        }else {
          wx.navigateBack({
            delta: 1
          })
          wx.showToast({
            title: '获取红包列表失败',
            icon: 'none',
            duration: 2000
          })
        }
      }
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
      url: api_url+'/Smallapp3/redpacket/sendList',
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
            redpacket_list: res.data.result,
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