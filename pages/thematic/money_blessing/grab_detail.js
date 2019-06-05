// 抢红包-红包详情成功 pages/thematic/money_blessing/grab_detail.js
const app = getApp();
var page =1;
var openid;
var api_url = app.globalData.api_url;
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
  onLoad: function(options) {
    var that = this;
    var order_id = options.order_id;
    var box_mac = options.box_mac;
    that.setData({
      box_mac:box_mac,
    })
    var user_info = wx.getStorageSync('savor_user_info');
    openid = user_info.openid;
    if(order_id == undefined){
      wx.navigateBack({
        delta: 1
      })
      wx.showToast({
        title: '该红包为异常红包',
        icon: 'none',
        duration: 2000
      })
    }
    wx.request({
      url: api_url+'/Smallapp3/redpacket/redpacketDetail',
      header: {
        'content-type': 'application/json'
      },
      data:{
        order_id:order_id,
        openid:openid,
        page:page,
      },
      success:function(res){
        if(res.data.code==10000){
          that.setData({
            packet_info:res.data.result.info,
            receive_list: res.data.result.receive_list,
            openid:openid,
          })

        }else {
          wx.navigateBack({
            delta:1,
          })
          wx.showToast({
            title: '该红包为异常红包',
            icon: 'none',
            duration: 2000
          })
        }
      }

    })
  },
  cintoindex:function(e){
    wx.reLaunch({
      url: '/pages/index/index',
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