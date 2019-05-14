// pages/thematic/birthday/list.js
const util = require('../../../utils/util.js')
const app = getApp()
var box_mac;
var openid;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    openid:'',
    box_mac:'',
    choose_constellid:'',
    happylist:'',
    constellationlist:'',
    constellation_detail:'',
    videolist:'',
    showControl:false,
    is_open_red_packet:0,  //是否打开红包
  },

  getContellDetail:function(constellid){
    var that = this
    wx.request({
      url: 'https://mobile.littlehotspot.com/Smallapp3/constellation/getVideoList',
      header: {
        'content-type': 'application/json'
      },
      data: {
        constellation_id: constellid,
      },
      success: function (res) {
        that.setData({
          videolist: res.data.result
        })
      }
    })
    wx.request({
      url: 'https://mobile.littlehotspot.com/Smallapp3/constellation/getConstellationDetail',
      header: {
        'content-type': 'application/json'
      },
      data: {
        constellation_id: constellid,
      },
      success: function (res) {
        that.setData({
          constellation_detail: res.data.result
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //wx.hideShareMenu();
    var that = this;
    openid = options.openid;
    box_mac= options.box_mac;
    that.setData({
      openid:openid,
      box_mac:box_mac
    })
    wx.request({
      url: 'https://mobile.littlehotspot.com/Smallapp/index/isHaveCallBox?openid=' + openid,
      headers: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        if (res.data.code == 10000 && res.data.result.is_have == 1) {
          that.setData({
            is_open_simple: res.data.result.is_open_simple,
          })
        }
      }
    })
    wx.request({
      url: 'https://mobile.littlehotspot.com/Smallapp21/index/happylist',
      header: {
        'content-type': 'application/json'
      },
      success:function(res){
        //console.log(res);
        that.setData({
          happylist:res.data.result
        })
      }
    })
    wx.request({
      url: 'https://mobile.littlehotspot.com/Smallapp3/constellation/getConstellationList',
      header: {
        'content-type': 'application/json'
      },
      success:function(res){
        that.setData({
          constellationlist:res.data.result,
          choose_constellid:res.data.result[0]['id']
        })
        if (that.data.choose_constellid) {
          that.getContellDetail(that.data.choose_constellid)
        }
      }
    })

    //红包送祝福开关
    wx.request({
      url: 'https://mobile.littlehotspot.com/smallapp3/Redpacket/getConfig',
      header: {
        'content-type': 'application/json'
      },
      data:{
        type:1
      },
      success:function(res){
        if(res.data.code==10000){
          that.setData({
            is_open_red_packet: res.data.result.is_open_red_packet
          })
        }
        
      }
    })

  },
  switchConstell:function(e){
    var that = this;
    var constellid = e.currentTarget.dataset.constellid;
    that.setData({
      choose_constellid:constellid
    })
    that.getContellDetail(constellid)

  },
  showHappy:function(e){
    var box_mac = e.currentTarget.dataset.boxmac;
    var openid = e.currentTarget.dataset.openid;
    var vediourl = e.currentTarget.dataset.vediourl;
    var forscreen_char = 'Happy Birthday';

    var index1 = vediourl.lastIndexOf("/");
    var index2 = vediourl.length;
    var filename = vediourl.substring(index1 + 1, index2);//后缀名
    var timestamp = (new Date()).valueOf();
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
                    msg: '{ "action": 6,"url":"' + vediourl + '","filename":"' + filename + '","forscreen_id":"' + timestamp + '","resource_type":2}',
                  },
                  success: function (res) {
                    console.log(res);
                    wx.showToast({
                      title: '点播成功,电视即将开始播放',
                      icon: 'none',
                      duration: 5000
                    });
                    wx.request({
                      url: 'https://mobile.littlehotspot.com/Smallapp/index/recordForScreenPics',
                      header: {
                        'content-type': 'application/json'
                      },
                      data: {
                        forscreen_id: timestamp,
                        openid: openid,
                        box_mac: box_mac,
                        action: 5,
                        mobile_brand: mobile_brand,
                        mobile_model: mobile_model,
                        forscreen_char: forscreen_char,
                        imgs: '["media/resource/' + filename + '"]'
                      },
                    });
                  },
                  fail: function (res) {
                    wx.showToast({
                      title: '网络异常,点播失败',
                      icon: 'none',
                      duration: 2000
                    })
                  }
                })
              }else {

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
              msg: '{ "action": 6,"url":"' + vediourl + '","filename":"' + filename + '","forscreen_id":"' + timestamp + '","resource_type":2}',
            },
            success: function (res) {
              wx.showToast({
                title: '点播成功,电视即将开始播放',
                icon: 'none',
                duration: 5000
              });
              wx.request({
                url: 'https://mobile.littlehotspot.com/Smallapp/index/recordForScreenPics',
                header: {
                  'content-type': 'application/json'
                },
                data: {
                  forscreen_id: timestamp,
                  openid: openid,
                  box_mac: box_mac,
                  action: 5,
                  mobile_brand: mobile_brand,
                  mobile_model: mobile_model,
                  forscreen_char: forscreen_char,
                  imgs: '["media/resource/' + filename + '"]'
                },
              });
            },
            fail: function (res) {
              wx.showToast({
                title: '网络异常,点播失败',
                icon: 'none',
                duration: 2000
              })
            }
          })
        }
      }
    })

    
  },
  //点击红包送祝福
  clickRedPacket:function(e){
    var that = this;
    var user_info = wx.getStorageSync("savor_user_info");
    if (user_info.is_wx_auth != 3) {
      
      that.setData({
        showModal: true
      })
    } else {
      wx.navigateTo({
        url: '/pages/thematic/money_blessing/main?openid=' + openid + '&box_mac=' + box_mac,
      })
    }
  },
  onGetUserInfo: function (res) {
    var that = this;
    /*var user_info = wx.getStorageSync("savor_user_info");
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
          wx.navigateTo({
            url: '/pages/thematic/money_blessing/main?openid=' + openid + '&box_mac=' + box_mac,
          })
        }
      })
    }*/
    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    if (res.detail.errMsg == 'getUserInfo:ok') {
      wx.getUserInfo({
        success(rets) {
          wx.request({
            url: 'https://mobile.littlehotspot.com/smallapp3/User/registerCom',
            data: {
              'openid': openid,
              'avatarUrl': rets.userInfo.avatarUrl,
              'nickName': rets.userInfo.nickName,
              'gender': rets.userInfo.gender,
              'session_key': app.globalData.session_key,
              'iv': rets.iv,
              'encryptedData': rets.encryptedData
            },
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {
              if (res.data.code == 10000) {
                wx.setStorage({
                  key: 'savor_user_info',
                  data: res.data.result,
                });
                that.setData({
                  showModal: false,
                })
                wx.navigateTo({
                  url: '/pages/thematic/money_blessing/main?openid=' + openid + '&box_mac=' + box_mac,
                })
              } else {
                wx.showToast({
                  title: '微信授权登陆失败，请重试',
                  icon: 'none',
                  duration: 2000,

                })
              }

            }
          })
        }
      })
    }else {
      wx.request({
        url: 'https://mobile.littlehotspot.com/smallapp21/User/refuseRegister',
        data: {
          'openid': openid,
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          if (res.data.code == 10000) {
            user_info['is_wx_auth'] = 1;
            wx.setStorage({
              key: 'savor_user_info',
              data: user_info,
            })

          } else {
            wx.showToast({
              title: '拒绝失败,请重试',
              icon: 'none',
              duration: 2000
            });
          }

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
  },


  //遥控呼大码
  callQrCode: util.throttle(function (e) {
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var qrcode_img = e.currentTarget.dataset.qrcode_img;
    app.controlCallQrcode(openid, box_mac, qrcode_img);
  }, 3000),//呼大码结束
  //打开遥控器
  openControl: function (e) {
    var that = this;
    var qrcode_url = 'https://mobile.littlehotspot.com/Smallapp/index/getBoxQr?box_mac=' + box_mac + '&type=3';
    that.setData({

      showControl: true,
      qrcode_img: qrcode_url
    })
  },
  //关闭遥控
  closeControl: function (e) {
    var that = this;
    that.setData({

      showControl: false,
    })

  },
  //遥控退出投屏
  exitForscreen: function (e) {
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    app.controlExitForscreen(openid, box_mac);
  },
  //遥控调整音量
  changeVolume: function (e) {
    box_mac = e.currentTarget.dataset.box_mac;
    var change_type = e.currentTarget.dataset.change_type;
    app.controlChangeVolume(box_mac, change_type);

  },
  //遥控切换节目
  changeProgram: function (e) {
    box_mac = e.currentTarget.dataset.box_mac;
    var change_type = e.currentTarget.dataset.change_type;
    app.controlChangeProgram(box_mac, change_type);
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