//app.js
App({
  controlExitForscreen:function (openid,box_mac) {
    var that = this;
    //openid = e.currentTarget.dataset.openid;
    //box_mac = e.currentTarget.dataset.boxmac;
    var timestamp = (new Date()).valueOf();
    wx.request({
      url: that.globalData.api_url +'/Netty/Index/index',
      headers: {
        'Content-Type': 'application/json'
      },
      method: "POST",
      data: {
        box_mac: box_mac,
        msg: '{ "action": 3,"openid":"' + openid + '"}',
      },
      success: function (res) {
        // wx.navigateBack({
        //   delta: 1
        // })
        wx.showToast({
          title: '退出成功',
          icon: 'none',
          duration: 2000
        });
      },
      fail: function (res) {
        wx.showToast({
          title: '网络异常，退出失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },//退出投屏结束
  //遥控器呼玛
  controlCallQrcode: function (openid, box_mac,qrcode_img){
    
    //console.log(openid);
    if (box_mac) {
      var timestamp = (new Date()).valueOf();
      var qrcode_url = that.globalData.api_url +'/Smallapp/index/getBoxQr?box_mac=' + box_mac + '&type=3';
      var mobile_brand = this.globalData.mobile_brand;
      var mobile_model = this.globalData.mobile_model;

      wx.request({
        url: that.globalData.api_url +'/smallapp21/User/isForscreenIng',
        headers: {
          'Content-Type': 'application/json'
        },
        method: "POST",
        data: { box_mac: box_mac },
        success: function (res) {
          var is_forscreen = res.data.result.is_forscreen;
          if (is_forscreen == 1) {
            wx.showModal({
              title: '确认要打断投屏',
              content: '当前电视正在进行投屏,继续投屏有可能打断当前投屏中的内容.',
              success: function (res) {
                if (res.confirm) {
                  wx.request({
                    url: that.globalData.api_url +'/Netty/Index/index',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    method: "POST",
                    data: {
                      box_mac: box_mac,
                      msg: '{ "action": 9,"url":"' + qrcode_url + '"}',
                    },
                    success: function () {
                      wx.showToast({
                        title: '呼玛成功，电视即将展示',
                        icon: 'none',
                        duration: 2000
                      });
                      wx.request({
                        url: that.globalData.api_url +'/Smallapp/index/recordForScreenPics',
                        header: {
                          'content-type': 'application/json'
                        },
                        data: {
                          openid: openid,
                          box_mac: box_mac,
                          action: 9,
                          mobile_brand: mobile_brand,
                          mobile_model: mobile_model,
                          imgs: '[]'
                        },

                      })
                    }
                  })
                } else {

                }
              }
            })
          } else {
            wx.request({
              url: that.globalData.api_url +'/Netty/Index/index',
              headers: {
                'Content-Type': 'application/json'
              },
              method: "POST",
              data: {
                box_mac: box_mac,
                msg: '{ "action": 9,"url":"' + qrcode_url + '"}',
              },
              success: function () {
                wx.showToast({
                  title: '呼玛成功，电视即将展示',
                  icon: 'none',
                  duration: 2000
                });
                wx.request({
                  url: that.globalData.api_url +'/Smallapp/index/recordForScreenPics',
                  header: {
                    'content-type': 'application/json'
                  },
                  data: {
                    openid: openid,
                    box_mac: box_mac,
                    action: 9,
                    mobile_brand: mobile_brand,
                    mobile_model: mobile_model,
                    imgs: '[]'
                  },

                })
              }
            })
          }
        }
      })
    }
  },
  //遥控器控制音量
  controlChangeVolume: function (box_mac,change_type) {
    
    var timestamp = (new Date()).valueOf();
    wx.request({
      url: that.globalData.api_url +'/Netty/Index/index',
      headers: {
        'Content-Type': 'application/json'
      },
      method: "POST",
      data: {
        box_mac: box_mac,
        msg: '{"action":31,"change_type":' + change_type + '}',
      },
    })
  },
  //遥控控制节目
  controlChangeProgram:function(box_mac,change_type){
    var timestamp = (new Date()).valueOf();
    wx.request({
      url: that.globalData.api_url +'/Netty/Index/index',
      headers: {
        'Content-Type': 'application/json'
      },
      method: "POST",
      data: {
        box_mac: box_mac,
        msg: '{"action":32,"change_type":' + change_type + '}',
      },
    })
  },
  //扫码
  scanQrcode:function(){
    wx.showModal({
      title: '提示',
      content: "您可扫码链接热点合作餐厅电视,使用此功能",
      showCancel: true,
      confirmText: '立即扫码',
      success: function (res) {
        if (res.confirm == true) {
          wx.scanCode({
            onlyFromCamera: true,
            success: (res) => {
              if (res.scanType =='QR_CODE'){
                var selemite = res.result.indexOf("?");
                var params = res.result.substring(selemite, res.result.length);
                
                params = '/pages/forscreen/forscreen'+params;
                wx.navigateTo({
                  url: params
                })
              } else if (res.scanType == 'WX_CODE'){
                wx.navigateTo({
                  url: '/' + res.path
                })
              }
            }
          })
        }
      }
    });
    

  },
  onLaunch: function() {
    // 获取小程序更新机制兼容
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function (res) {
                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate()
                }
              }
            })
          })
          updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            wx.showModal({
              title: '已经有新版本了哟~',
              content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
            })
          })
        }
      })
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }



    var that = this
    wx.login({
      success: res => {
        var code = res.code; //返回code
        wx.request({
          url: that.globalData.api_url +'/smallapp/index/getOpenid',
          data: {
            "code": code
          },
          header: {
            'content-type': 'application/json'
          },
          success: function(res) {
            that.globalData.openid = res.data.result.openid;
            that.globalData.session_key = res.data.result.session_key;
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
    session_key:'',
    box_mac: '',
    mobile_brand: '',
    mobile_model: '',
    statusBarHeight: 0,
    rest_appid:'wxc395eb4b44563af1',
    jijian_appid:'wx7883a4327329a67c',
    api_url:'https://mobile.littlehotspot.com',
    oss_upload_url: 'https://image.littlehotspot.com',
    netty_url: 'https://netty-push.littlehotspot.com',
    oss_url: 'https://oss.littlehotspot.com',
  }
})