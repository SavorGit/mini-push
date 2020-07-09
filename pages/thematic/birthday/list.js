// pages/thematic/birthday/list.js
const util = require('../../../utils/util.js')
var mta = require('../../../utils/mta_analysis.js')
const app = getApp()
var box_mac;
var openid;
var intranet_ip;
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url
var cache_key = app.globalData.cache_key;
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
      url: api_url+'/Smallapp3/constellation/getVideoList',
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
      url: api_url+'/Smallapp3/constellation/getConstellationDetail',
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
      box_mac:box_mac,
    })
    wx.request({
      url: api_v_url+'/index/isHaveCallBox?openid=' + openid,
      headers: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        if (res.data.code == 10000 && res.data.result.is_have == 1) {
          app.linkHotelWifi(res.data.result, that);
          that.setData({
            is_open_simple: res.data.result.is_open_simple,
            hotel_info:res.data.result,
          })
        }
      }
    })
    wx.request({
      url: api_url+'/Smallapp21/index/happylist',
      header: {
        'content-type': 'application/json'
      },
      success:function(res){
        that.setData({
          happylist:res.data.result
        })
      }
    })
    wx.request({
      url: api_url+'/Smallapp3/constellation/getConstellationList',
      header: {
        'content-type': 'application/json'
      },
      success:function(res){
        that.setData({
          constellationlist:res.data.result,
          choose_constellid:res.data.result[0]['id'],
          choose_constellname: res.data.result[0]['name'],
          choose_constellisnow: 1
        })
        if (that.data.choose_constellid) {
          mta.Event.stat('viewConstellation', { 'name': that.data.choose_constellname })
          that.getContellDetail(that.data.choose_constellid)
        }
      }
    })

    //红包送祝福开关
    wx.request({
      url: api_url+'/smallapp3/Redpacket/getConfig',
      header: {
        'content-type': 'application/json'
      },
      data:{
        type:1
      },
      success:function(res){
        if(res.data.code==10000){
          if(app.globalData.link_type==1){
            that.setData({
              is_open_red_packet: res.data.result.is_open_red_packet
            })
          }else if(app.globalData.link_type ==2){
            that.setData({
              is_open_red_packet: 0
            })
          }
          
        }
        
      }
    })

  },
  switchConstell:function(e){
    var that = this;
    var constellid = e.currentTarget.dataset.constellid;
    var constellisnow = e.currentTarget.dataset.isnow;
    var constellname = e.currentTarget.dataset.name;
    that.setData({
      choose_constellid:constellid,
      choose_constellisnow:constellisnow,
      choose_constellname:constellname
    })
    that.getContellDetail(constellid)
    if(constellisnow==1){
      mta.Event.stat('viewConstellation', { 'name': constellname })
    }else{
      mta.Event.stat('viewNextConstellation', { 'name': constellname })
    }
  },
  showHappy:function(e){
    var user_info = wx.getStorageSync(cache_key +'user_info');
    var box_mac = e.currentTarget.dataset.boxmac;
    var openid = e.currentTarget.dataset.openid;
    var vediourl = e.currentTarget.dataset.vediourl;
    var hotel_info = e.currentTarget.dataset.hotel_info;
    var source = e.currentTarget.dataset.source
    var rname = e.currentTarget.dataset.name;
    
    var forscreen_char = 'Happy Birthday';
    var index1 = vediourl.lastIndexOf("/");
    var index2 = vediourl.length;
    var filename = vediourl.substring(index1 + 1, index2);//后缀名

    if(app.globalData.link_type==1){
      var timestamp = (new Date()).valueOf();
      var mobile_brand = app.globalData.mobile_brand;
      var mobile_model = app.globalData.mobile_model;

      wx.request({
        url: api_url + '/smallapp21/User/isForscreenIng',
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
                  mta.Event.stat('breakForscreen', { 'isbreak':1 })
                  wx.request({
                    url: api_url + '/Netty/Index/pushnetty',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    method: "POST",
                    data: {
                      box_mac: box_mac,
                      msg: '{ "action": 6,"url":"' + vediourl + '","filename":"' + filename + '","forscreen_id":"' + timestamp + '","resource_type":2,"openid":"'+openid+'"}',
                    },
                    success: function (res) {
                      wx.showToast({
                        title: '点播成功,电视即将开始播放',
                        icon: 'none',
                        duration: 5000
                      });
                      wx.request({
                        url: api_url + '/Smallapp/index/recordForScreenPics',
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
                          imgs: '["media/resource/' + filename + '"]',
                          serial_number:app.globalData.serial_number
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
                } else {
                  mta.Event.stat('breakForscreen', { 'isbreak': 0 })
                }
              }
            })
          } else {
            wx.request({
              url: api_url + '/Netty/Index/pushnetty',
              headers: {
                'Content-Type': 'application/json'
              },
              method: "POST",
              data: {
                box_mac: box_mac,
                msg: '{ "action": 6,"url":"' + vediourl + '","filename":"' + filename + '","forscreen_id":"' + timestamp + '","resource_type":2,"openid":"'+openid+'"}',
              },
              success: function (res) {
                wx.showToast({
                  title: '点播成功,电视即将开始播放',
                  icon: 'none',
                  duration: 5000
                });
                wx.request({
                  url: api_url + '/Smallapp/index/recordForScreenPics',
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
                    imgs: '["media/resource/' + filename + '"]',
                    serial_number:app.globalData.serial_number
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
    }else if(app.globalData.link_type==2){
      
      wx.request({
        url: "http://" + hotel_info.intranet_ip + ":8080/h5/birthday_ondemand?deviceId=" + openid + "&box_mac=" + box_mac + "&web=true&media_name=" + filename + "&media_url=" + vediourl +'&avatarUrl='+user_info.avatarUrl+'&nickName='+user_info.nickName,
        success: function (res) {
          if (res.data.code == 10000) {
            wx.showToast({
              title: '点播成功',
              icon: 'none',
              duration: 2000,
            })
          } else {
            wx.showToast({
              title: '点播失败，请重试',
              icon: 'none',
              duration: 2000,
            })
          }
        },
        fail: function (res) {
          wx.showToast({
            title: '点播失败，请重试',
            icon: 'none',
            duration: 2000,
          })
        }
      })
    }
    if(source==1){
      mta.Event.stat('clickBirthdayMusic', { 'name': rname })
    } else if (source == 2){
      var that = this;
      if (that.data.choose_constellisnow == 1) {
        mta.Event.stat('playConstellationVideo', { 'name': that.data.choose_constellname, 'videoname': rname })
      }else{
        mta.Event.stat('playNextConstellationVideo', { 'name': that.data.choose_constellname, 'videoname': rname })
      }
    }
    
  },
  //点击红包送祝福
  clickRedPacket:function(e){
    mta.Event.stat("clickredpacket", {})

    var that = this;
    var user_info = wx.getStorageSync("savor_user_info");
    if (user_info.is_wx_auth != 3) {
      
      that.setData({
        showModal: true
      })
      mta.Event.stat("showwxauth", {})
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
        url: api_url+'/smallapp21/User/register',
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
    mta.Event.stat("clickonwxauth", {})
    if (res.detail.errMsg == 'getUserInfo:ok') {
      wx.getUserInfo({
        success(rets) {
          wx.request({
            url: api_v_url+'/User/registerCom',
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
      mta.Event.stat("allowauth", {})
    }else {
      wx.request({
        url: api_v_url+'/User/refuseRegister',
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
      mta.Event.stat("refuseauth", {})
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
      url: api_url+'/Smallapp21/index/closeauthLog',
      header: {
        'content-type': 'application/json'
      },
      data: {
        openid: openid,
        box_mac: box_mac,
      },

    })
    mta.Event.stat("closewxauth", {})
  },


  //遥控呼大码
  callQrCode: util.throttle(function (e) {
    var that = this;
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var qrcode_img = e.currentTarget.dataset.qrcode_img;
    var hotel_info = e.currentTarget.dataset.hotel_info;
    app.controlCallQrcode(openid, box_mac, qrcode_img, hotel_info, that);
  }, 3000),//呼大码结束
  //打开遥控器
  openControl: function (e) {
    var that = this;
    var qrcode_url = api_url+'/Smallapp4/index/getBoxQr?box_mac=' + box_mac + '&type=3';
    that.setData({

      showControl: true,
      qrcode_img: qrcode_url
    })
    mta.Event.stat('openControl', { 'linktype': app.globalData.link_type })
  },
  //关闭遥控
  closeControl: function (e) {
    var that = this;
    that.setData({

      showControl: false,
    })
    mta.Event.stat("closecontrol", {})
  },
  //遥控退出投屏
  exitForscreen: function (e) {
    var that = this;
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var hotel_info = e.currentTarget.dataset.hotel_info;
    app.controlExitForscreen(openid, box_mac, hotel_info, that);
  },
  //遥控调整音量
  changeVolume: function (e) {
    var that = this;
    box_mac = e.currentTarget.dataset.box_mac;
    openid = e.currentTarget.dataset.openid;
    var change_type = e.currentTarget.dataset.change_type;
    var hotel_info = e.currentTarget.dataset.hotel_info;
    app.controlChangeVolume(openid, box_mac, change_type, hotel_info, that);
  },
  //遥控切换节目
  changeProgram: function (e) {
    var that = this;
    box_mac = e.currentTarget.dataset.box_mac;
    openid = e.currentTarget.dataset.openid;
    var change_type = e.currentTarget.dataset.change_type;
    var hotel_info = e.currentTarget.dataset.hotel_info;
    app.controlChangeProgram(openid, box_mac, change_type, hotel_info, that);
  },
  modalConfirm: function (e) {
    var that = this;
    var hotel_info = e.target.dataset.hotel_info;
    app.linkHotelWifi(hotel_info, that);
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
  goToBack: function (e) {
    app.goToBack();
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