// pages/demand/goods_detail.js
const app = getApp()
var api_url = app.globalData.api_url;
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var box_mac = options.box_mac;
    var goods_id = options.goods_id;
    wx.request({
      url: api_url+'/aa/bb/cc',
      header: {
        'content-type': 'application/json'
      },
      success:function(res){
        if(res.data.code==10000){
          that.setData({

          })
        }
      }
    })

  },
  //电视播放
  boxShow: function (e) {
    var forscreen_id = e.currentTarget.dataset.forscreen_id;

    var pubdetail = e.currentTarget.dataset.pubdetail;
    var res_type = e.currentTarget.dataset.res_type;
    var res_nums = e.currentTarget.dataset.res_nums;
    app.boxShow(box_mac, forscreen_id, pubdetail, res_type, res_nums);
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