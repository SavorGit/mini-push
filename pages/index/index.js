// pages/interact/index.js
const utils = require('../../utils/util.js')
var mta = require('../../utils/mta_analysis.js')
const app = getApp()
var openid;
var box_mac;
var api_url = app.globalData.api_url;
var goods_nums = 1;
var jd_appid = app.globalData.jd_appid;
var cache_key = app.globalData.cache_key;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    openid: '',
    hotel_name: '', //酒楼名称
    room_name: '', //包间名称
    box_mac: '', //机顶盒mac
    is_link: 0, //是否连接酒楼电视

    showModal: false, //显示授权登陆弹窗
    showActgoods: false, // 显示活动促销
    showButton4JD: false, // 显示京东购买按钮
    showButton4Favorites: true, // 显示收藏按钮
    showFavoritesPanel: false, // 显示收藏面板

    is_open_simple: 0,
    imgUrls: [], //顶部广告位
    imgUrls_mid: [], //中部广告位
    indicatorDots: true, //是否显示面板指示点
    autoplay: true, //是否自动切换
    interval: 3000, //自动切换时间间隔
    lb_duration: 1000, //滑动动画时长
    goods_nums: 1,
    jd_appid: jd_appid,
    hot_play: [], //热播内容
    link_type: app.globalData.link_type,
    wifiErr: app.globalData.wifiErr,
    //is_game_banner: 0, //是否显示猴子爬树游戏banner
    //happy_vedio_url: '', //生日视频url
    //happy_vedio_name: '', //生日视频名称
    //happy_vedio_title: '', //生日视频标题

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    //mta.Page.init()
    if (app.globalData.openid && app.globalData.openid != '') {
      that.setData({
        openid: app.globalData.openid
      })
      openid = app.globalData.openid;
      //判断用户是否注册
      utils.PostRequest(api_url + '/smallapp21/User/isRegister', {
        "openid": app.globalData.openid,
        "page_id": 3
      }, (data, headers, cookies, errMsg, statusCode) => wx.setStorage({
        key: 'savor_user_info',
        data: data.result.userinfo,
      }), res => wx.setStorage({
        key: 'savor_user_info',
        data: {
          'openid': app.globalData.openid
        }
      }));
      utils.PostRequest(api_url + '/Smallapp4/content/initdata', {
        "openid": app.globalData.openid,
        
      }, (data, headers, cookies, errMsg, statusCode) => {
        console.log('sss');
        app.globalData.optimize_data = data.result.optimize_data;
        app.globalData.public_list = data.result.public_list;
        app.globalData.collect_list = data.result.collect_list;
      }, res => {

      });
      
      utils.PostRequest(api_url + '/Smallapp4/index/isHaveCallBox?openid=' + app.globalData.openid, {}, (data, headers, cookies, errMsg, statusCode) => {
        var is_have = data.result.is_have;
        if (is_have == 1) { //已经扫码链接电视
          app.linkHotelWifi(data.result, that);
          that.setData({
            is_link: 1,
            hotel_room: data.result.hotel_name + data.result.room_name,
            hotel_name: data.result.hotel_name,
            room_name: data.result.room_name,
            box_mac: data.result.box_mac,
            hotel_info: data.result,
            hotel_info_json: JSON.stringify(data.result),
          })
          box_mac = data.result.box_mac;
        } else {
          that.setData({
            is_link: 0,
            box_mac: '',
          })
          box_mac = '';
        }
      });
      
      //是否显示活动
      isShowAct(app.globalData.openid);
    } else {
      app.openidCallback = openid => {
        if (openid != '') {
          that.setData({
            openid: openid
          })
          openid = openid;
          //判断用户是否注册
          utils.PostRequest(api_url + '/smallapp21/User/isRegister', {
            "openid": openid,
            "page_id": 3
          }, (data, headers, cookies, errMsg, statusCode) => wx.setStorage({
            key: 'savor_user_info',
            data: data.result.userinfo,
          }), res => wx.setStorage({
            key: 'savor_user_info',
            data: {
              'openid': openid
            },
          }));
          utils.PostRequest(api_url + '/Smallapp4/content/initdata', {
            "openid": openid,

          }, (data, headers, cookies, errMsg, statusCode) => {
            console.log('dddd');
            app.globalData.optimize_data = data.result.optimize_data;
            app.globalData.public_list = data.result.public_list;
            app.globalData.collect_list = data.result.collect_list;
          }, res => {

          });
          
          utils.PostRequest(api_url + '/Smallapp4/index/isHaveCallBox?openid=' + openid, {}, (data, headers, cookies, errMsg, statusCode) => {
            var is_have = data.result.is_have;
            if (is_have == 1) {
              app.linkHotelWifi(data.result, that);
              that.setData({
                is_link: 1,
                hotel_room: data.result.hotel_name + data.result.room_name,
                hotel_name: data.result.hotel_name,
                room_name: data.result.room_name,
                box_mac: data.result.box_mac,
                hotel_info: data.result,
                hotel_info_json: JSON.stringify(data.result),
              })
              box_mac = data.result.box_mac;
            } else {
              that.setData({
                is_link: 0,
                box_mac: '',
              })
              box_mac = '';
            }
          });
          // wx.request({
          //   url: api_url + '/Smallapp4/index/isHaveCallBox?openid=' + openid,
          //   headers: {
          //     'Content-Type': 'application/json'
          //   },
          //   success: function(rest) {
          //     var is_have = rest.data.result.is_have;
          //     if (is_have == 1) {
          //       app.linkHotelWifi(rest.data.result, that);
          //       //select_link_way(rest.data.result);
          //       that.setData({
          //         is_link: 1,
          //         hotel_room: rest.data.result.hotel_name + rest.data.result.room_name,
          //         hotel_name: rest.data.result.hotel_name,
          //         room_name: rest.data.result.room_name,
          //         box_mac: rest.data.result.box_mac,
          //         hotel_info: rest.data.result,
          //         hotel_info_json: JSON.stringify(rest.data.result),
          //       })
          //       box_mac = rest.data.result.box_mac;
          //       //getHotelInfo(rest.data.result.box_mac);
          //     } else {
          //       that.setData({
          //         is_link: 0,
          //         box_mac: '',
          //       })
          //       box_mac = '';
          //     }
          //   }
          // });
          //是否显示活动
          isShowAct(openid);
        }
      }
    }
    //是否显示活动
    function isShowAct(openid) {
      var goods_info = wx.getStorageSync('savor_goods_info');
      if (goods_info == '' || typeof(goods_info) == 'undefined') {
        //************************上线去掉 */
        // that.setData({
        //   showActgoods: true
        // });
      } else {
        var goods_id = goods_info.goods_id;
        var goods_box_mac = goods_info.goods_box_mac;
        var uid = goods_info.uid;
        that.setData({
          goods_id: goods_id,
          goods_box_mac: goods_box_mac,
          uid: uid,
        })
        utils.PostRequest(api_url + '/Smallsale/goods/getdetail', {
          goods_id: goods_id,
          uid: uid,
          openid: openid
        }, (data, headers, cookies, errMsg, statusCode) => {
          if (data.result.jd_url == '') {
            var is_jd = false;
          } else {
            is_jd = true;
          }
          that.setData({
            jd_url: data.result.jd_url,
            goods_info: data.result,
            showActgoods: true,
            showButton4JD: is_jd,
            showButton4Favorites: is_jd
          });
        });
        // wx.request({
        //   url: api_url + '/Smallsale/goods/getdetail',
        //   headers: {
        //     'Content-Type': 'application/json'
        //   },
        //   data: {
        //     goods_id: goods_id,
        //     uid: uid,
        //     openid: openid
        //   },
        //   success: function(res) {
        //     //console.log(res);
        //     if (res.data.code == 10000) {
        //       //console.log(res);
        //       if (res.data.result.jd_url == '') {
        //         var is_jd = false;
        //       } else {
        //         is_jd = true;
        //       }
        //       //console.log(is_jd);
        //       that.setData({
        //         jd_url: res.data.result.jd_url,
        //         goods_info: res.data.result,
        //         showActgoods: true,
        //         showButton4JD: is_jd,
        //         showButton4Favorites: is_jd
        //       });
        //     }
        //   }
        // })
      }
    }
    utils.PostRequest(api_url + '/Smallapp3/Adsposition/getAdspositionList', {
      position: '2,3',
    }, (data, headers, cookies, errMsg, statusCode) => {
      var imgUrls = data.result[2];
      var imgUrls_mid = [];
      if (typeof(data.result[3]) != 'undefined') {
        var imgUrls_mid = data.result[3];
      }
      that.setData({
        imgUrls: imgUrls,
        imgUrls_mid: imgUrls_mid
      });
    });
    // wx.request({ //banner图
    //   url: api_url + '/Smallapp3/Adsposition/getAdspositionList',
    //   data: {
    //     position: '2,3',
    //   },
    //   success: function(res) {
    //     if (res.data.code == 10000) {
    //       var imgUrls = res.data.result[2];
    //       var imgUrls_mid = [];

    //       if (typeof(res.data.result[3]) != 'undefined') {
    //         var imgUrls_mid = res.data.result[3];
    //       }

    //       //console.log(res);
    //       that.setData({
    //         imgUrls: imgUrls,
    //         imgUrls_mid: imgUrls_mid
    //       })
    //     }
    //   }
    // })
    utils.PostRequest(api_url + '/Smallapp4/content/getHotplaylist', {
      page: 1,
      pagesize: 5
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        hot_play: data.result.datalist
      });
    });
    // wx.request({ //热播内容
    //   url: api_url + '/Smallapp4/content/getHotplaylist',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   method: "POST",
    //   data: {
    //     page: 1,
    //     pagesize: 5
    //   },
    //   success: function(res) {
    //     if (res.data.code == 10000) {
    //       //onsole.log(res.data.result);
    //       that.setData({
    //         hot_play: res.data.result.datalist
    //       })
    //     }
    //   }
    // })
  },
  onGetUserInfo: function(res) {
    var that = this;

    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    if (res.detail.errMsg == 'getUserInfo:ok') {
      wx.getUserInfo({
        success(rets) {
          utils.PostRequest(api_url + '/smallapp3/User/registerCom', {
            'openid': openid,
            'avatarUrl': rets.userInfo.avatarUrl,
            'nickName': rets.userInfo.nickName,
            'gender': rets.userInfo.gender,
            'session_key': app.globalData.session_key,
            'iv': rets.iv,
            'encryptedData': rets.encryptedData
          }, (data, headers, cookies, errMsg, statusCode) => {
            wx.setStorage({
              key: 'savor_user_info',
              data: res.data.result,
            });
            that.setData({
              showModal: false,
            })
          }, res => wx.showToast({
            title: '微信登陆失败，请重试',
            icon: 'none',
            duration: 2000
          }));
          // wx.request({
          //   url: api_url + '/smallapp3/User/registerCom',
          //   data: {
          //     'openid': openid,
          //     'avatarUrl': rets.userInfo.avatarUrl,
          //     'nickName': rets.userInfo.nickName,
          //     'gender': rets.userInfo.gender,
          //     'session_key': app.globalData.session_key,
          //     'iv': rets.iv,
          //     'encryptedData': rets.encryptedData
          //   },
          //   header: {
          //     'content-type': 'application/json'
          //   },
          //   success: function(res) {
          //     if (res.data.code == 10000) {
          //       wx.setStorage({
          //         key: 'savor_user_info',
          //         data: res.data.result,
          //       });
          //       that.setData({
          //         showModal: false,
          //       })
          //     } else {
          //       wx.showToast({
          //         title: '微信授权登陆失败，请重试',
          //         icon: 'none',
          //         duration: 2000,

          //       })
          //     }

          //   },
          //   fail: function(res) {
          //     wx.showToast({
          //       title: '微信登陆失败，请重试',
          //       icon: 'none',
          //       duration: 2000
          //     });
          //   }
          // })
        }
      })
    } else {
      utils.PostRequest(api_url + '/smallapp21/User/refuseRegister', {
        'openid': openid,
      }, (data, headers, cookies, errMsg, statusCode) => {
        user_info['is_wx_auth'] = 1;
        wx.setStorage({
          key: 'savor_user_info',
          data: user_info,
        })
      });
      // wx.request({
      //   url: api_url + '/smallapp21/User/refuseRegister',
      //   data: {
      //     'openid': openid,
      //   },
      //   header: {
      //     'content-type': 'application/json'
      //   },
      //   success: function(res) {
      //     if (res.data.code == 10000) {
      //       user_info['is_wx_auth'] = 1;
      //       wx.setStorage({
      //         key: 'savor_user_info',
      //         data: user_info,
      //       })

      //     } else {
      //       wx.showToast({
      //         title: '拒绝失败,请重试',
      //         icon: 'none',
      //         duration: 2000
      //       });
      //     }

      //   }
      // })
    }


  },
  //关闭授权弹窗
  closeAuth: function() {
    //关闭授权登陆埋点
    var that = this;
    that.setData({
      showModal: false,
    })
    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    //console.log(box_mac);
    if (box_mac == 'undefined' || box_mac == undefined) {
      box_mac = '';
    }
    utils.PostRequest(api_url + '/Smallapp21/index/closeauthLog', {
      openid: openid,
      box_mac: box_mac,
    });
    // wx.request({
    //   url: api_url + '/Smallapp21/index/closeauthLog',
    //   header: {
    //     'content-type': 'application/json'
    //   },
    //   data: {
    //     openid: openid,
    //     box_mac: box_mac,
    //   },

    // })
  },


  //选择照片上电视
  chooseImage(e) {
    var that = this;
    var user_info = wx.getStorageSync("savor_user_info");
    if (user_info.is_wx_auth != 3) {
      that.setData({
        showModal: true
      })
    } else {
      var box_mac = e.detail.value.boxmac;
      var openid = e.detail.value.openid;
      var is_open_simple = e.detail.value.is_open_simple;
      var formId = e.detail.formId;
      if (box_mac == '') {

        app.scanQrcode();
      } else {

        if (app.globalData.link_type == 1) {
          wx.navigateTo({
            url: '/pages/forscreen/forimages/index?box_mac=' + box_mac + '&openid=' + openid + '&is_open_simple=' + is_open_simple,
          })
          app.recordFormId(openid, formId);
        } else if (app.globalData.link_type == 2) {

          var intranet_ip = e.detail.value.intranet_ip;
          var wifi_mac = e.detail.value.wifi_mac;
          var wifi_name = e.detail.value.wifi_name;
          var wifi_password = e.detail.value.wifi_password;
          wx.navigateTo({
            url: '/pages/forscreen/forimages/wifi?box_mac=' + box_mac + '&openid=' + openid + '&intranet_ip=' + intranet_ip + '&wifi_mac=' + wifi_mac + '&wifi_name=' + wifi_name + '&wifi_password=' + wifi_password,
          })
          //console.log('直连投屏')
        }

      }
    }
  },
  //选择视频投屏
  chooseVedio(e) {
    var that = this
    var user_info = wx.getStorageSync("savor_user_info");
    if (user_info.is_wx_auth != 3) {
      that.setData({
        showModal: true
      })
    } else {
      var box_mac = e.detail.value.boxmac;
      var openid = e.detail.value.openid;
      var is_open_simple = e.detail.value.is_open_simple;
      var formId = e.detail.formId;
      if (box_mac == '') {
        app.scanQrcode();
      } else {
        if (app.globalData.link_type == 1) {
          wx.navigateTo({
            url: '/pages/forscreen/forvideo/index?box_mac=' + box_mac + '&openid=' + openid + '&is_open_simple=' + is_open_simple,
          })
          app.recordFormId(openid, formId);
        } else {
          var intranet_ip = e.detail.value.intranet_ip;
          var wifi_mac = e.detail.value.wifi_mac;
          var wifi_name = e.detail.value.wifi_name;
          var wifi_password = e.detail.value.wifi_password;

          wx.navigateTo({
            url: '/pages/forscreen/forvideo/wifi?box_mac=' + box_mac + '&openid=' + openid + '&intranet_ip=' + intranet_ip + '&wifi_mac=' + wifi_mac + '&wifi_name=' + wifi_name + '&wifi_password=' + wifi_password,
          })
        }

      }
    }


  },

  showHappy(e) { //视频点播让盒子播放
    var box_mac = e.currentTarget.dataset.boxmac;
    var openid = e.currentTarget.dataset.openid;
    var intranet_ip = e.currentTarget.dataset.intranet_ip;
    if (box_mac == '') {
      app.scanQrcode();
    } else {
      wx.navigateTo({
        url: '/pages/thematic/birthday/list?openid=' + openid + '&box_mac=' + box_mac + "&intranet_ip=" + intranet_ip,
      })
    }
  },
  //互动游戏
  hdgames(e) {
    var openid = e.currentTarget.dataset.openid;
    var box_mac = e.currentTarget.dataset.boxmac;
    var linkcontent = e.currentTarget.dataset.linkcontent;

    if (box_mac == '') {
      app.scanQrcode();
    } else {
      var mobile_brand = app.globalData.mobile_brand;
      var mobile_model = app.globalData.mobile_model;

      wx.navigateTo({
        url: linkcontent + '?box_mac=' + box_mac + '&openid=' + openid + '&game_id=2'
      })
    }

  },
  //断开连接
  breakLink: function(e) {
    var that = this;
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.boxmac;
    var timestamp = (new Date()).valueOf();

    wx.showModal({
      title: '提示',
      content: '确定要断开链接的电视吗？',
      success(res) {
        if (res.confirm) {
          utils.PostRequest(api_url + '/Smallapp21/index/breakLink', {
            box_mac: box_mac,
            openid: openid
          }, (data, headers, cookies, errMsg, statusCode) => {
            that.setData({
              is_link: 0,
              box_mac: ''
            });
            wx.reLaunch({
              url: '../index/index'
            });
            wx.showToast({
              title: '断开成功',
              icon: 'none',
              duration: 2000
            });
          });
          // wx.request({
          //   url: api_url + '/Smallapp21/index/breakLink',
          //   header: {
          //     'content-type': 'application/json'
          //   },
          //   method: "POST",
          //   data: {
          //     box_mac: box_mac,
          //     openid: openid
          //   },
          //   success: function(res) {
          //     if (res.data.code == 10000) {
          //       that.setData({
          //         is_link: 0,
          //         box_mac: ''
          //       })
          //       wx.reLaunch({
          //         url: '../index/index'
          //       })
          //       wx.showToast({
          //         title: '断开成功',
          //         icon: 'none',
          //         duration: 2000
          //       })
          //     } else {
          //       wx.showToast({
          //         title: '断开失败',
          //         icon: 'none',
          //         duration: 2000
          //       })
          //     }
          //   },
          //   fail: function(res) {
          //     wx.showToast({
          //       title: '网络异常，断开失败',
          //       icon: 'none',
          //       duration: 2000
          //     })
          //   }
          // })
        } else if (res.cancel) {

        }
      }
    })




  },
  forscreenHistory: function(e) {
    var box_mac = e.currentTarget.dataset.boxmac;
    var openid = e.currentTarget.dataset.openid;
    if (box_mac == '') {
      app.scanQrcode();
    } else {
      wx.navigateTo({
        url: '/pages/forscreen/history/list?openid=' + openid + '&box_mac=' + box_mac,
      })
    }
  },
  scanQrcode(e) {
    var box_mac = e.currentTarget.dataset.boxmac;
    if (box_mac == '') {
      app.scanQrcode();
    }
  },
  //遥控呼大码
  callQrCode: utils.throttle(function(e) {
    var that = this;
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var qrcode_img = e.currentTarget.dataset.qrcode_img;
    var hotel_info = e.currentTarget.dataset.hotel_info;
    app.controlCallQrcode(openid, box_mac, qrcode_img, hotel_info, that);
  }, 3000), //呼大码结束
  //打开遥控器
  openControl: function(e) {
    var that = this;
    var qrcode_url = api_url + '/Smallapp4/index/getBoxQr?box_mac=' + box_mac + '&type=3';
    that.setData({

      popRemoteControlWindow: true,
      qrcode_img: qrcode_url
    })
  },
  //关闭遥控
  closeControl: function(e) {
    var that = this;
    that.setData({

      popRemoteControlWindow: false,
    })

  },
  //遥控退出投屏
  exitForscreen: function(e) {
    var that = this;
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var hotel_info = e.currentTarget.dataset.hotel_info;
    app.controlExitForscreen(openid, box_mac, hotel_info, that);
  },
  //遥控调整音量
  changeVolume: function(e) {
    var that = this;
    box_mac = e.currentTarget.dataset.box_mac;
    openid = e.currentTarget.dataset.openid;
    var change_type = e.currentTarget.dataset.change_type;
    var hotel_info = e.currentTarget.dataset.hotel_info;
    app.controlChangeVolume(openid, box_mac, change_type, hotel_info, that);
  },
  //遥控切换节目
  changeProgram: function(e) {
    var that = this;
    box_mac = e.currentTarget.dataset.box_mac;
    openid = e.currentTarget.dataset.openid;
    var change_type = e.currentTarget.dataset.change_type;
    var hotel_info = e.currentTarget.dataset.hotel_info;
    app.controlChangeProgram(openid, box_mac, change_type, hotel_info, that);
  },
  modalConfirm: function(e) {
    console.log(e);
    var that = this;
    var hotel_info = e.target.dataset.hotel_info;
    app.linkHotelWifi(hotel_info, that);
  },
  //文件投屏
  forfiles: function(e) {
    var that = this;
    var user_info = wx.getStorageSync("savor_user_info");
    if (user_info.is_wx_auth != 3) {
      that.setData({
        showModal: true
      })
    } else {
      var box_mac = e.detail.value.boxmac;
      var openid = e.detail.value.openid;
      var is_open_simple = e.detail.value.is_open_simple;
      var formId = e.detail.formId;
      //微信好友文件投屏+h5文件投屏
      if (box_mac == '') {
        app.scanQrcode();
      } else {
        that.setData({
          showMe: true,
        })
        app.recordFormId(openid, formId);
      }

      //微信好友文件投屏
      /*if (box_mac == '') {

        app.scanQrcode();
      } else {
        wx.navigateTo({
          url: '/pages/forscreen/forfile/files?box_mac=' + box_mac + '&openid=' + openid + "&is_open_simple=" + is_open_simple ,
        })
      }*/

    }
  },
  //微信好友文件
  wxFriendfiles: function(e) {
    var that = this;
    var box_mac = e.currentTarget.dataset.boxmac;
    var openid = e.currentTarget.dataset.openid;
    var is_open_simple = e.currentTarget.dataset.is_open_simple;
    wx.navigateTo({
      url: '/pages/forscreen/forfile/files?box_mac=' + box_mac + '&openid=' + openid + "&is_open_simple=" + is_open_simple,
      success: function(e) {
        that.setData({
          showMe: false
        })
      }
    })
  },
  phonefiles: function(e) {
    var that = this;
    var box_mac = e.currentTarget.dataset.boxmac;
    var openid = e.currentTarget.dataset.openid;
    var is_open_simple = e.currentTarget.dataset.is_open_simple;
    wx.navigateTo({
      url: '/pages/forscreen/forfile/h5files?box_mac=' + box_mac + '&openid=' + openid + "&is_open_simple=" + is_open_simple,
      success: function(e) {
        that.setData({
          showMe: false
        })
      }
    })
  },
  modalCancel: function(e) {
    var that = this;
    that.setData({
      showMe: false,
    })
  },
  changeActNums: function(e) {
    var that = this;
    var type = e.currentTarget.dataset.type;
    if (type == 1) { //数量增加
      if (goods_nums == 10) {
        wx.showToast({
          title: '数量不能大于10',
          icon: 'none',
          duration: 2000,
        })
      } else {
        goods_nums += 1;
        //console.log(goods_nums);
      }
    } else if (type == 2) { //数量减少
      if (goods_nums == 1) {
        wx.showToast({
          title: '数量不能小于1',
          icon: 'none',
          duration: 2000,
        })
      } else {
        goods_nums -= 1;
      }
    }
    that.setData({
      goods_nums: goods_nums,
    })
  },
  closeAct: function(e) {
    var that = this;
    wx.removeStorageSync('savor_goods_info');
    that.setData({
      showActgoods: false
    })
    goods_nums = 1;
  },
  //店内购买
  shopBuyGoods: function(e) {
    //console.log(e);
    var that = this;
    var goods_id = e.currentTarget.dataset.goods_id;
    var goods_nums = e.currentTarget.dataset.goods_nums;
    var goods_box_mac = e.currentTarget.dataset.goods_box_mac;
    var buy_type = e.currentTarget.dataset.buy_type;
    var user_info = wx.getStorageSync("savor_user_info");
    var uid = e.currentTarget.dataset.uid;
    openid = user_info.openid;
    utils.PostRequest(api_url + '/Smallsale/order/addOrder', {
      goods_id: goods_id,
      box_mac: goods_box_mac,
      amount: goods_nums,
      openid: openid,
      buy_type: buy_type,
      uid: uid
    }, (data, headers, cookies, errMsg, statusCode) => {
      if (buy_type == 1) {
        wx.showToast({
          title: '购买成功',
          icon: 'none',
          duration: 2000,
        })
      }
    });
    // wx.request({
    //   url: api_url + '/Smallsale/order/addOrder',
    //   header: {
    //     'content-type': 'application/json'
    //   },
    //   data: {
    //     goods_id: goods_id,
    //     box_mac: goods_box_mac,
    //     amount: goods_nums,
    //     openid: openid,
    //     buy_type: buy_type,
    //     uid: uid
    //   },
    //   success: function(res) {
    //     if (res.data.code == 10000) {
    //       if (buy_type == 1) {
    //         wx.showToast({
    //           title: '购买成功',
    //           icon: 'none',
    //           duration: 2000,
    //         })
    //       }

    //     } else {
    //       if (buy_type == 1) {
    //         wx.showToast({
    //           title: res.data.msg,
    //           icon: 'none',
    //           duration: 2000,
    //         })
    //       }

    //     }
    //   }
    // })
  },
  //第三方购买（京东）
  tpBuyGoods: function(e) {
    var goods_id = e.currentTarget.dataset.goods_id;
    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    utils.PostRequest(api_url + '/Smallapp3/datalog/recordlog', {
      action_type: 3,
      data_id: goods_id,
      openid: openid,
      type: 2,
    });
    // wx.request({
    //   url: api_url + '/Smallapp3/datalog/recordlog',
    //   header: {
    //     'content-type': 'application/json'
    //   },
    //   data: {
    //     action_type: 3,
    //     data_id: goods_id,
    //     openid: openid,
    //     type: 2,
    //   },
    // })
  },
  //收藏商品
  collectGoods: function(e) {
    var goods_id = e.currentTarget.dataset.goods_id;
    var that = this;
    that.setData({
      showFavoritesPanel: true,
    })


  },
  //输入手机号失去焦点
  mobileOnInput: function(res) {
    var that = this;
    var mobile = res.detail.value;
    that.setData({
      mobile: mobile
    })
  },
  sendGoodsLink: function(e) {
    var that = this;
    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    var goods_id = e.currentTarget.dataset.goods_id;

    var mobile = e.currentTarget.dataset.mobile;
    if (mobile == '') {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    var is_mobile = app.checkMobile(mobile);
    if (!is_mobile) {
      return;
    }
    utils.PostRequest(api_url + '/Smallsale/collection/addGoodscollection', {
      goods_id: goods_id,
      phone: mobile,
      openid: openid,
    }, (data, headers, cookies, errMsg, statusCode) => wx.showToast({
      title: '商品链接已发送到您的手机',
      icon: 'none',
      duration: 2000,
    }));
    // wx.request({
    //   url: api_url + '/Smallsale/collection/addGoodscollection',
    //   header: {
    //     'content-type': 'application/json'
    //   },
    //   data: {
    //     goods_id: goods_id,
    //     phone: mobile,
    //     openid: openid,
    //   },
    //   success: function(res) {
    //     if (res.data.code == 10000) {
    //       wx.showToast({
    //         title: '商品链接已发送到您的手机',
    //         icon: 'none',
    //         duration: 2000,
    //       })
    //     } else {
    //       var err_msg = res.data.msg;
    //       wx.showToast({
    //         title: err_msg,
    //         icon: 'none',
    //         duration: 2000,
    //       })
    //     }
    //   },
    //   fail: function(res) {
    //     wx.showToast({
    //       title: '商品链接发送失败，请稍后重试',
    //       icon: 'none',
    //       duration: 2000,
    //     })
    //   }
    // })
  },
  //活动商品京东购买
  jdBuy: function(e) {
    //console.log(e);
    var h5_url = e.currentTarget.dataset.h5_url;
    h5_url = encodeURIComponent(h5_url);
    wx.navigateTo({
      url: '/pages/h5/index?h5_url=' + h5_url,
    })
  },
  //电视播放
  boxShow: function(e) {
    var forscreen_id = e.currentTarget.dataset.forscreen_id;

    var pubdetail = e.currentTarget.dataset.pubdetail;
    var res_type = e.currentTarget.dataset.res_type;
    var res_nums = e.currentTarget.dataset.res_nums;
    var hotel_info = e.currentTarget.dataset.hotel_info;
    if (res_type == 1) {
      var action = 11; //发现图片点播
    } else if (res_type == 2) {
      var action = 12; //发现视频点播
    }

    app.boxShow(box_mac, forscreen_id, pubdetail, res_type, res_nums, action, hotel_info);
  },
  phonecallevent: function(e) {
    var tel = e.target.dataset.tel;
    wx.makePhoneCall({
      phoneNumber: tel
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

    var that = this;
    var user_info = wx.getStorageSync(cache_key+"user_info");
    if(typeof(user_info.openid)!='undefined'){
      utils.PostRequest(api_url + '/Smallapp4/index/isHaveCallBox', {
        openid: user_info.openid
      }, (data, headers, cookies, errMsg, statusCode) => {
        if (data.result.is_have == 1) {
          that.setData({
            is_link: 1,
            hotel_room: data.result.hotel_name + data.result.room_name,
            hotel_name: data.result.hotel_name,
            room_name: data.result.room_name,
            box_mac: data.result.box_mac,
            hotel_info: data.result,
            hotel_info_json: JSON.stringify(data.result),
          })
          box_mac = data.result.box_mac;
        } else {
          app.globalData.link_type = 1;
          box_mac = ''
          that.setData({
            is_link: 0,
            box_mac: '',
            link_type: 1
          })

        }
        //console.log(data);
      }, re => { }, { isShowLoading: false });
    }
    

    //this.onLoad()
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

  },
  openAdsLink: function(e) {
    var ads_id = e.currentTarget.dataset.ads_id;
    var user_info = wx.getStorageSync('savor_user_info');
    var openid = user_info.openid;

    wx.reportAnalytics('ads_open_report', {
      ads_id: ads_id,
      open_num: 1,
    });
    utils.PostRequest(api_url + '/Smallapp3/datalog/recordlog', {
      action_type: 1,
      openid: openid,
      data_id: ads_id,
      type: 1
    });
    // wx.request({
    //   url: api_url + '/Smallapp3/datalog/recordlog',
    //   header: {
    //     'content-type': 'application/json'
    //   },
    //   data: {
    //     action_type: 1,
    //     openid: openid,
    //     data_id: ads_id,
    //     type: 1

    //   },
    //   success: function(res) {

    //   }
    // })
  },
  closeWxAuth: function(e) {
    var that = this;
    that.setData({
      showModal: false,
    })
  }
})