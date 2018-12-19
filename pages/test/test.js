const app = getApp()


Page({

  /**
   * 页面的初始数据
   */
  data: {
    //wifi参数
    startError: '', //初始化错误提示
    wifiListError: false, //wifi列表错误显示开关
    wifiListErrorInfo: '', //wifi列表错误详细
    system: '', //版本号
    platform: '', //系统 
    ssid: 'wifi帐号', //wifi帐号(必填)
    pass: 'wifi密码', //无线网密码(必填)
    bssid: '', //设备号 自动获取
    endError: '', //连接最后的提示
    WIFI_flag: false //网络连接状态
  },

  onLoad: function () {
    wx.request({
      url: 'http://192.168.168.95:8888/',
      success:function(res){
        console.log(res)
      }
    })
    var that = this;
    //检测手机型号
    wx.getSystemInfo({
      success: function (res) {
        console.log(res)
        var _system = '';
        if (res.platform == 'android') _system = parseInt(res.system.substr(8));
        if (res.platform == 'ios') _system = parseInt(res.system.substr(4));
        if (res.platform == 'android' && _system < 6) {
          that.setData({
            startError: '手机版本暂时不支持'
          });
          wx.showModal({
            title: '提示',
            content: '手机版本暂时不支持此功能',
            showCancel: false
          });
          return
        }
        if (res.platform == 'ios' && _system < 11) {
          that.setData({
            startError: '手机版本暂时不支持'
          });
          wx.showModal({
            title: '提示',
            content: '手机版本暂时不支持此功能',
            showCancel: false
          });
          return
        }
        that.setData({
          platform: res.platform,
          system: _system
        });
        console.log(that.data.platform)
        console.log(that.data.system)
      }
    })
  },


  //初始化 Wi-Fi 模块。
  WIFI_Connect_start: function (that) {
    var that = this;
    wx.getConnectedWifi({
      success: function (res) {
        console.log(res.wifi)
        wx.showToast({
          title: 'Wifi网络已连接',
          icon: 'loading',
          duration: 1000
        })
        wx.startLocalServiceDiscovery({
          // 当前手机所连的局域网下有一个 _http._tcp. 类型的服务
          serviceType: '_http._tcp.',
          success: function (res) {
            console.log('success', res)
            wx.onLocalServiceFound(function (res) {
              console.log('onLocalServiceFound', res)//始终没有反应，没有数据
            })
          },
          fail: function (res) {
            console.log('fail', res)
            wx.showModal({
              title: '提示',
              content: res.errMsg,
              showCancel: false
            });
          },
        })
      },
      fail: function (res) {
        wx.startWifi({
          success: function (res) {
            //请求获取 Wi-Fi 列表
            wx.getWifiList({
              success: function (res) {
                that.onGetWifiList(that); //监听获取到 Wi-Fi 列表数据
              },
              fail: function (res) {
                that.setData({
                  wifiListError: true
                });
                that.setData({
                  wifiListErrorInfo: res.errMsg
                });
                wx.showModal({
                  title: '提示',
                  content: res.errMsg,
                  showCancel: false
                });
              }
            })
          },
          fail: function (res) {
            that.setData({
              startError: res.errMsg
            });
            wx.showModal({
              title: '提示',
              content: res.errMsg,
              showCancel: false
            });
          }
        })
      }
    })
  },


  onGetWifiList: function (that) {
    var that = this;
    //监听获取到 Wi-Fi 列表数据
    wx.onGetWifiList(function (res) { //获取列表
      if (that.data.platform == 'android') { //请求获取android Wi-Fi 列表
        if (res.wifiList.length) {
          //循环找出信号最好的那一个
          var ssid = that.data.ssid;
          var signalStrength = 0;
          var bssid = '';
          for (var i = 0; i < res.wifiList.length; i++) {
            if (res.wifiList[i]['SSID'] == ssid && res.wifiList[i]['signalStrength'] > signalStrength) {
              bssid = res.wifiList[i]['BSSID'];
              signalStrength = res.wifiList[i]['signalStrength'];
            }
          }
          if (!signalStrength) {
            that.setData({
              wifiListError: true
            });
            that.setData({
              wifiListErrorInfo: '未查询到设置的wifi'
            });
            return
          }
          that.setData({
            bssid: bssid
          });
          //执行连接方法
          //连接wifi
          that.Connected(that);
        } else {
          that.setData({
            wifiListError: true
          });
          that.setData({
            wifiListErrorInfo: '未查询到设置的wifi'
          });
        }
      } else { //请求获取IOS Wi-Fi 列表
        if (res.wifiList.length) { //WIFI_flag
          wx.setWifiList({
            wifiList: [{
              SSID: res.wifiList[0].SSID,
              BSSID: res.wifiList[0].BSSID,
              password: '88881111'
            }]
          })
        } else {
          wx.setWifiList({
            wifiList: []
          })
        }
        console.log('onGetWifiList', res)

      }
    })
  },


  Connected: function (that) {
    var that = this;
    wx.connectWifi({
      SSID: that.data.ssid,
      BSSID: that.data.bssid,
      password: that.data.pass,
      success: function (res) {
        that.setData({
          endError: 'wifi连接成功'
        });
      },
      fail: function (res) {
        that.setData({
          endError: res.errMsg
        });
        wx.showModal({
          title: '提示',
          content: res.errMsg,
          showCancel: false
        });
      }
    })
  },



})