//index.js
//获取应用实例
const app = getApp()
var policy;
var signature;
var postf;   //上传文件扩展名
var timestamp = (new Date()).valueOf();
var box_mac;
Page({
  onShareAppMessage: function () {
    return {
      title: '热点投屏',
      imageUrl: '/images/qrcode.jpg'
    }
  },
  onLoad: function () {
    wx.request({
      url: 'https://mobile.littlehotspot.com/Smallapp/Index/getOssParams',
      headers: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        policy = res.data.policy;
        signature = res.data.signature;
      }
    })
  },
  data: {
    motto: '热点投屏',
    userInfo: {},
    hasUserInfo: false,
    tempFilePaths: '',
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  scanqrcode() {
    wx.scanCode({
      onlyFromCamera: true,
      success: (res) => {
        wx.navigateTo({
          url: '/'+res.path
        })
      }
    })
  }
})
