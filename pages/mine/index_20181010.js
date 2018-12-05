// pages/mine/index_20181010.js
const app = getApp();
var openid;
var box_mac;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    openid: '',
    userinfo:[],
    publiclist:[],
    collectlist:[],
    box_mac:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    if (app.globalData.openid && app.globalData.openid != '') {
      that.setData({
        openid: app.globalData.openid
      })
      openid = app.globalData.openid;
      //判断用户是否注册
      wx.request({
        url: 'https://mobile.littlehotspot.com/smallapp21/User/isRegister',
        data: {
          "openid": app.globalData.openid,
          "page_id": 5
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          wx.setStorage({
            key: 'savor_user_info',
            data: res.data.result.userinfo,
          })
        },
        fail: function (e) {
          wx.setStorage({
            key: 'savor_user_info',
            data: { 'openid': app.globalData.openid },
          })
        }
      });//判断用户是否注册结束
      wx.request({
        url: 'https://mobile.littlehotspot.com/Smallapp/index/isHaveCallBox?openid=' + app.globalData.openid,
        headers: {
          'Content-Type': 'application/json'
        },

        success: function (rest) {
          var is_have = rest.data.result.is_have;
          if (is_have == 1) {
            that.setData({
              box_mac: rest.data.result.box_mac,
            })
            box_mac = rest.data.result.box_mac;
            
          } else {
            that.setData({
              is_link: 0,
              box_mac: '',
            })
            box_mac = '';
          }

        }
      })

    } else {
      app.openidCallback = openid => {
        if (openid != '') {
          that.setData({
            openid: openid
          })
          openid = openid;
          //判断用户是否注册
          wx.request({
            url: 'https://mobile.littlehotspot.com/smallapp21/User/isRegister',
            data: {
              "openid": app.globalData.openid,
              "page_id": 5
            },
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {
              wx.setStorage({
                key: 'savor_user_info',
                data: res.data.result.userinfo,
              })
            },
            fail: function (e) {
              wx.setStorage({
                key: 'savor_user_info',
                data: { 'openid': openid },
              })
            }
          });//判断用户是否注册结束
          wx.request({
            url: 'https://mobile.littlehotspot.com/Smallapp/index/isHaveCallBox?openid=' + openid,
            headers: {
              'Content-Type': 'application/json'
            },

            success: function (rest) {
              var is_have = rest.data.result.is_have;
              if (is_have == 1) {
                that.setData({
                  is_link: 1,
                  
                  box_mac: rest.data.result.box_mac,
                })
                box_mac = rest.data.result.box_mac;
                //getHotelInfo(rest.data.result.box_mac);
              }else {
                that.setData({
                  is_link: 0,
                  box_mac: '',
                })
                box_mac = '';
              }
            }
          })
        }
      }
    }
    //获取用户信息以及我的公开

    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    wx.request({
      url: 'https://mobile.littlehotspot.com/Smallapp21/User/index',
      headers: {
        'Content-Type': 'application/json'
      },
      data: { openid: openid },
      success: function (res) {
        that.setData({
          userinfo: res.data.result.user_info,
          publiclist: res.data.result.public_list,
          collectlist: res.data.result.collect_list
        })
      }
    })
  },
  //呼大码
  callQrCode: function (e) {
    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    //console.log(openid);
    if (box_mac) {
      var timestamp = (new Date()).valueOf();
      var qrcode_url = 'https://mobile.littlehotspot.com/Smallapp/index/getBoxQr?box_mac=' + box_mac + '&type=3';
      var mobile_brand = app.globalData.mobile_brand;
      var mobile_model = app.globalData.mobile_model;

      wx.request({
        url: 'https://mobile.littlehotspot.com/smallapp21/User/isForscreenIng',
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
                    url: 'https://mobile.littlehotspot.com/Netty/Index/index',
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
                        url: 'https://mobile.littlehotspot.com/Smallapp/index/recordForScreenPics',
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
          }else {
            wx.request({
              url: 'https://mobile.littlehotspot.com/Netty/Index/index',
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
                  url: 'https://mobile.littlehotspot.com/Smallapp/index/recordForScreenPics',
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
  },//呼大码结束

  refreshOn:function(){
    wx.showToast({
      title: '刷新成功',
      icon: 'none',
      duration: 2000
    });
    this.onLoad();
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
    this.onLoad();
    //wx.showNavigationBarLoading();
    // 隐藏导航栏加载框
    //wx.hideNavigationBarLoading();
    // 停止下拉动作
    wx.stopPullDownRefresh();
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