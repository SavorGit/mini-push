//app.js
App({

  onLaunch: function () {
    var that = this
    wx.login({
      success: res => {
        var code = res.code; //返回code
        wx.request({
          url: 'https://mobile.littlehotspot.com/smallapp/index/getOpenid',
          data: { "code": code },
          header: {
            'content-type': 'application/json'
          },
          success: function (res) {
            that.globalData.openid = res.data.result.openid;
          }
        })
      }
    })
  },
  globalData: {
    openid: '',
    box_mac: ''
  }
})