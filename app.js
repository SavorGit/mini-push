//app.js
App({

  onLaunch: function() {
    var that = this
    wx.login({
      success: res => {
        var code = res.code; //返回code
        wx.request({
          url: 'https://mobile.littlehotspot.com/smallapp/index/getOpenid',
          data: {
            "code": code
          },
          header: {
            'content-type': 'application/json'
          },
          success: function(res) {
            that.globalData.openid = res.data.result.openid;
            if (that.openidCallback) {
              that.openidCallback(res.data.result.openid);
            }
          }
        })
      }
    })
    wx.getSystemInfo({
      success: function(res) {
        that.globalData.mobile_brand = res.brand;
        that.globalData.mobile_model = res.model;
      }
    })
  },
  onShow: function(options) {
    var app = this;
    wx.getSystemInfo({
      success: function(res) {
        app.globalData.statusBarHeight = res.statusBarHeight;
      }
    })
  },
  globalData: {
    openid: '',
    box_mac: '',
    mobile_brand: '',
    mobile_model: '',
    statusBarHeight: 0
  }
})