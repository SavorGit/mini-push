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
            var openid = res.data.result.openid;
            //console.log(res.data.result.openid);
            wx.request({
              url: 'https://mobile.littlehotspot.com/Smallapp/index/isHaveCallBox?openid=' + openid,
              headers: {
                'Content-Type': 'application/json'
              },

              success: function (rest) {
                var is_have = rest.data.result.is_have;
                if(is_have==1){
                  var box_mac = rest.data.result.box_mac;
                  wx.navigateTo({
                    url: '/pages/forscreen/forscreen?scene='+box_mac,
                  })
                }

              }
            })
            //app.globalData.openid = res.data.result.openid;
            //setInfos(box_mac, res.data.result.openid);
          }
        })
      }
    });

    

    /*wx.request({
      url: 'https://mobile.littlehotspot.com/Smallapp/Index/getOssParams',
      headers: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        policy = res.data.policy;
        signature = res.data.signature;
      }
    })*/
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
        console.log(res);
        wx.navigateTo({
          url: '/'+res.path
        })
      }
    })
  }
})
