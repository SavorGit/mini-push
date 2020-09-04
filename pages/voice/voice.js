// pages/voice/voice.js
const app = getApp()
const plugin = requirePlugin("WechatSI")
const manager = plugin.getRecordRecognitionManager()

var CompText = '';
var CompTypeText = '';
var CityText = '';
var CountryText = '';

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
    this.initRecord();
    app.getRecordAuth()
  },
  initRecord:function(e){
    var that = this;
    manager.onStop = function(res){
      console.log("record file path",res.tempFilePath)
      CompTypeText = CompTypeText + res.result;
      that.setData({CompTypeText:CompTypeText})
    }
  },
  touchdown_plugin:function(){
    console.log('按下开始录音');
    manager.onStart=function(res){
      console.log("成功开始录音识别",res)
    }
    manager.start({
      duration: 60000,
      lang: "zh_CN"
    })
    wx.showToast({
      title: '正在聆听中',
      icon:'none',
      duration:60000
    })
  },
  touchup_plugin:function(){
    console.log('松开结束');
    wx.hideToast({})
    manager.stop()
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