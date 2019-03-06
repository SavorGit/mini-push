// 抢红包-抢红包 pages/thematic/money_blessing/grab.js
const app = getApp();
var openid;
var box_mac;
var order_id;
var scene;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    wxAuthLogin: false,
    order_status :0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu();
    var that = this;
    scene = decodeURIComponent(options.scene);
    var scene_arr = scene.split('_');
    order_id = scene_arr[0];
    box_mac = scene_arr[1];
    that.setData({
      order_id:order_id,
      box_mac:box_mac,
    })
    if (app.globalData.openid && app.globalData.openid != '') {
      that.setData({
        openid: app.globalData.openid
      })
      openid = app.globalData.openid;
      var forscreen_id = (new Date()).valueOf();
      var mobile_brand = app.globalData.mobile_brand;
      var mobile_model = app.globalData.mobile_model;
      //记录扫码抢红包日志
      wx.request({
        url: 'https://mobile.littlehotspot.com/Smallapp21/index/recordForScreenPics',
        header: {
          'content-type': 'application/json'
        },
        data: {
          forscreen_id: forscreen_id,
          openid: openid,
          box_mac: box_mac,
          action: 121,
          mobile_brand: mobile_brand,
          mobile_model: mobile_model,

          imgs: '[]',
          resource_id: order_id,

        },
      })
      //判断用户是否注册
      wx.request({
        url: 'https://mobile.littlehotspot.com/smallapp21/User/isRegister',
        data: {
          "openid": openid,
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          var code = res.data.code;
          if (code == 10000) {
            wx.setStorage({
              key: 'savor_user_info',
              data: res.data.result.userinfo,
            })
            var is_wx_auth = res.data.result.userinfo.is_wx_auth;

            if (is_wx_auth != 2) {
              that.setData({
                showModal: true
              })
            } else {
              //如果已授权   请求获取扫电视红包小程序码结果
              wx.request({
                url: 'https://mobile.littlehotspot.com/Smallapp3/redpacket/getScanresult',
                header: {
                  'content-type': 'application/json'
                },
                data: {
                  "open_id": openid,
                  "order_id": order_id,
                },
                success: function (res) {
                  if (res.data.code == 10000) {
                    var order_status = res.data.result.status;
                    if (order_status == 4 || order_status == 0) {
                      wx.redirectTo({
                        url: '/pages/thematic/money_blessing/receive_h5?jump_url=' + encodeURIComponent(res.data.result.jump_url),
                      })

                    } else if (order_status == 1 || order_status == 2) {
                      that.setData({
                        order_status: res.data.result.status,
                        avatarUrl: res.data.result.avatarUrl,
                        bless: res.data.result.bless,
                        nickName: res.data.result.nickName,
                        order_id: res.data.result.order_id,
                        money: res.data.result.money,
                      })
                    } else if (order_status == 3) {
                      wx.request({
                        url: 'https://mobile.littlehotspot.com//Smallapp3/redpacket/grabBonusResult',
                        header: {
                          'content-type': 'application/json'
                        },
                        data: {
                          order_id: order_id,
                          user_id: res.data.result.user_id,
                          sign: res.data.result.sign,
                        },
                        success: function (rt) {
                          if (rt.data.code == 10000) {
                            that.setData({
                              order_status: res.data.result.status,
                              avatarUrl: res.data.result.avatarUrl,
                              bless: res.data.result.bless,
                              nickName: res.data.result.nickName,
                              order_id: res.data.result.order_id,
                              money: res.data.result.money,
                            })
                          } else {
                            wx.reLaunch({
                              url: '/pages/index/index',
                            })
                            wx.showToast({
                              title: '红包领取失败',
                              icon: 'none',
                              duration: 2000,
                            })
                          }
                        }
                      })
                    } else if (order_status == 5) {
                      wx.redirectTo({
                        url: '/pages/thematic/money_blessing/grab_detail?order_id=' + order_id,
                      })
                    }
                  } else {
                    wx.reLaunch({
                      url: '/pages/index/index',
                    })
                    wx.showToast({
                      title: '该红包不可领取',
                      icon: 'none',
                      duration: 2000,
                    })
                  }

                }
              })

            }

          } else {
            wx.reLaunch({
              url: '/pages/index/index',
            })
            wx.showToast({
              title: '用户数据异常',
              icon: 'none',
              duration: 2000
            })
          }
        },
        fail: function (e) {
          wx.reLaunch({
            url: '/pages/index/index',
          })
        }
      });//判断用户是否注册结束
      
    } else {
      app.openidCallback = openid => {
        if (openid != '') {
          that.setData({
            openid: openid
          })
          openid = openid;
          
          var forscreen_id = (new Date()).valueOf();
          var mobile_brand = app.globalData.mobile_brand;
          var mobile_model = app.globalData.mobile_model;
          //记录扫码抢红包日志
          wx.request({
            url: 'https://mobile.littlehotspot.com/Smallapp21/index/recordForScreenPics',
            header: {
              'content-type': 'application/json'
            },
            data: {
              forscreen_id: forscreen_id,
              openid: openid,
              box_mac: box_mac,
              action: 121,
              mobile_brand: mobile_brand,
              mobile_model: mobile_model,

              imgs: '[]',
              resource_id: order_id,

            },
          })
          //判断用户是否注册
          wx.request({
            url: 'https://mobile.littlehotspot.com/smallapp21/User/isRegister',
            data: {
              "openid": openid,
            },
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {
              var code = res.data.code;
              if (code == 10000) {
                wx.setStorage({
                  key: 'savor_user_info',
                  data: res.data.result.userinfo,
                })
                var is_wx_auth = res.data.result.userinfo.is_wx_auth;

                if (is_wx_auth != 2) {
                  that.setData({
                    showModal: true
                  })
                } else {
                  //如果已授权   请求获取扫电视红包小程序码结果
                  wx.request({
                    url: 'https://mobile.littlehotspot.com/Smallapp3/redpacket/getScanresult',
                    header: {
                      'content-type': 'application/json'
                    },
                    data: {
                      "open_id": openid,
                      "order_id": order_id,
                    },
                    success: function (res) {
                      if (res.data.code == 10000) {
                        var order_status = res.data.result.status;
                        if (order_status == 4 || order_status == 0) {
                          wx.redirectTo({
                            url: '/pages/thematic/money_blessing/receive_h5?jump_url=' + encodeURIComponent(res.data.result.jump_url),
                          })

                        } else if (order_status == 1 || order_status == 2) {
                          that.setData({
                            order_status: res.data.result.status,
                            avatarUrl: res.data.result.avatarUrl,
                            bless: res.data.result.bless,
                            nickName: res.data.result.nickName,
                            order_id: res.data.result.order_id,
                            money: res.data.result.money,
                          })
                        } else if (order_status == 3) {
                          wx.request({
                            url: 'https://mobile.littlehotspot.com//Smallapp3/redpacket/grabBonusResult',
                            header: {
                              'content-type': 'application/json'
                            },
                            data: {
                              order_id: order_id,
                              user_id: res.data.result.user_id,
                              sign: res.data.result.sign,
                            },
                            success: function (rt) {
                              if (rt.data.code == 10000) {
                                that.setData({
                                  order_status: res.data.result.status,
                                  avatarUrl: res.data.result.avatarUrl,
                                  bless: res.data.result.bless,
                                  nickName: res.data.result.nickName,
                                  order_id: res.data.result.order_id,
                                  money: res.data.result.money,
                                })
                              } else {
                                wx.reLaunch({
                                  url: '/pages/index/index',
                                })
                                wx.showToast({
                                  title: '红包领取失败',
                                  icon: 'none',
                                  duration: 2000,
                                })
                              }
                            }
                          })
                        } else if (order_status == 5) {
                          wx.redirectTo({
                            url: '/pages/thematic/money_blessing/grab_detail?order_id=' + order_id,
                          })
                        }
                      } else {
                        wx.reLaunch({
                          url: '/pages/index/index',
                        })
                        wx.showToast({
                          title: '该红包不可领取',
                          icon: 'none',
                          duration: 2000,
                        })
                      }

                    }
                  })

                }

              } else {
                wx.reLaunch({
                  url: '/pages/index/index',
                })
                wx.showToast({
                  title: '用户数据异常',
                  icon: 'none',
                  duration: 2000
                })
              }
            },
            fail: function (e) {
              wx.reLaunch({
                url: '/pages/index/index',
              })
            }
          });//判断用户是否注册结束
        }
      }
    }
    
    
    
    //
    
  },
  onGetUserInfo: function (res) {
    var that = this;
    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    if (res.detail.errMsg == 'getUserInfo:ok') {
      wx.request({
        url: 'https://mobile.littlehotspot.com/smallapp21/User/register',
        data: {
          'openid': openid,
          'avatarUrl': res.detail.userInfo.avatarUrl,
          'nickName': res.detail.userInfo.nickName,
          'gender': res.detail.userInfo.gender
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          wx.setStorage({
            key: 'savor_user_info',
            data: res.data.result,
          });
          that.setData({
            showModal: false,
          })
          this.reload();
          // wx.navigateTo({
          //   url: '/pages/thematic/money_blessing/main',
          // })
        }
      })
    }

  },
  //关闭授权弹窗
  closeAuth: function () {
    //关闭授权登陆埋点
    var that = this;
    that.setData({
      showModal: false,
    })
    if (box_mac == 'undefined' || box_mac == undefined) {
      box_mac = '';
    }
    wx.request({
      url: 'https://mobile.littlehotspot.com/Smallapp21/index/closeauthLog',
      header: {
        'content-type': 'application/json'
      },
      data: {
        openid: openid,
        box_mac: box_mac,
      },

    })
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