// pages/interact/index.js
const utils = require('../../utils/util.js')
var mta = require('../../utils/mta_analysis.js')
const app = getApp()
var openid;
var wifiOk;
var box_mac;
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
var goods_nums = 1;
var jd_appid = app.globalData.jd_appid;
var cache_key = app.globalData.cache_key;
var pageid = 3;
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
    wifi_hidden: true,
    is_view_eval_waiter:0,  //是否显示评价服务员

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.hideLoading()
    //mta.Page.init()
    if (app.globalData.openid && app.globalData.openid != '') {
      wx.showLoading({
        title: '数据加载中..',
        mask: true
      })
      that.setData({
        openid: app.globalData.openid
      })
      openid = app.globalData.openid;
      //判断用户是否注册
      utils.PostRequest(api_v_url + '/User/isRegister', {
        "openid": app.globalData.openid,
        "page_id": 3
      }, (data, headers, cookies, errMsg, statusCode) => {
        //wx.hideLoading();
        wx.setStorage({
          key: 'savor_user_info',
          data: data.result.userinfo,

        })
        utils.PostRequest(api_url + '/Smallapp4/content/initdata', {
          "openid": app.globalData.openid,

        }, (data, headers, cookies, errMsg, statusCode) => {


          app.globalData.optimize_data = data.result.optimize_data;
          app.globalData.public_list = data.result.public_list;
          app.globalData.collect_list = data.result.collect_list;

          app.globalData.hotels = data.result.forscreen_hotels.hotels;
          utils.PostRequest(api_url + '/Smallapp4/content/getHotplaylist', {
            page: 1,
            pagesize: 6
          }, (data, headers, cookies, errMsg, statusCode) => {

            var hot_play = data.result.datalist;
            that.setData({
              hot_play: data.result.datalist
            });
            setTimeout(function () {
              wx.hideLoading();
            }, 1000)

            app.wifiOkCallback = wifiOk => {
              var hotel_info = app.globalData.hotel_info;
              if (Object.keys(hotel_info).length > 0) {
                that.setData({
                  wifi_hidden: true
                })
                var inner_url = 'http://' + hotel_info.intranet_ip + ':8080/h5/findHotShow?box_mac=' + hotel_info.box_mac + '&web=true&deviceId=123456';
                wx.request({
                  url: inner_url,
                  success: function (rest) {
                    if (rest.data.code == 10000) {

                      var rb_list = rest.data.result;
                      for (var i = 0; i < hot_play.length; i++) {
                        if (app.in_array(hot_play[i].forscreen_id, rb_list, 'media_id')) {

                          hot_play[i].is_show = 1;
                        } else {

                          hot_play[i].is_show = 0;
                        }
                      }

                    } else {
                      for (var i = 0; i < hot_play.length; i++) {
                        hot_play[i].is_show = 0;
                      }
                    }
                    console.log(hot_play);
                    that.setData({
                      hot_play: hot_play
                    });
                  }
                })
              }
            }
          });
        }, res => {
          wx.hideLoading();
        });

        utils.PostRequest(api_v_url + '/index/isHaveCallBox?openid=' + app.globalData.openid, {}, (data, headers, cookies, errMsg, statusCode) => {
          var is_have = data.result.is_have;
          
          
          if (is_have == 1) { //已经扫码链接电视
            var box_id = data.result.box_id;
            is_view_eval_waiter(box_id);
            app.linkHotelWifi(data.result, that);
            app.globalData.hotel_info = data.result;
            that.setData({
              is_link: 1,
              hotel_room: data.result.hotel_name + data.result.room_name,
              hotel_name: data.result.hotel_name,
              room_name: data.result.room_name,
              box_mac: data.result.box_mac,
              hotel_info: data.result,
              hotel_info_json: JSON.stringify(data.result),
              is_compress:data.result.is_compress
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

      });

      utils.PostRequest(api_url + '/Smallapp3/Adsposition/getAdspositionList', {
        position: '2,3',
      }, (data, headers, cookies, errMsg, statusCode) => {
        var imgUrls = data.result[2];
        var imgUrls_mid = [];
        if (typeof (data.result[3]) != 'undefined') {
          var imgUrls_mid = data.result[3];
        }
        that.setData({
          imgUrls: imgUrls,
          imgUrls_mid: imgUrls_mid
        });
      });


      //是否显示活动
      isShowAct(app.globalData.openid);
    } else {
      wx.showLoading({
        title: '数据加载中..',
        mask: true
      })
      app.openidCallback = openid => {
        console.log(app.globalData.serial_number)
        if (openid != '') {
          that.setData({
            openid: openid
          })
          openid = openid;
          //判断用户是否注册
          utils.PostRequest(api_v_url + '/User/isRegister', {
            "openid": openid,
            "page_id": 3
          }, (data, headers, cookies, errMsg, statusCode) => {
            //wx.hideLoading();
            wx.setStorage({
              key: 'savor_user_info',
              data: data.result.userinfo,
            })
            utils.PostRequest(api_url + '/Smallapp4/content/initdata', {
              "openid": openid,

            }, (data, headers, cookies, errMsg, statusCode) => {

              app.globalData.optimize_data = data.result.optimize_data;
              app.globalData.public_list = data.result.public_list;
              app.globalData.collect_list = data.result.collect_list;

              app.globalData.hotels = data.result.forscreen_hotels.hotels;

              utils.PostRequest(api_url + '/Smallapp4/content/getHotplaylist', {
                page: 1,
                pagesize: 6
              }, (data, headers, cookies, errMsg, statusCode) => {

                var hot_play = data.result.datalist;
                that.setData({
                  hot_play: data.result.datalist
                });
                setTimeout(function () {
                  wx.hideLoading();
                }, 1000)
                app.wifiOkCallback = wifiOk => {
                  var hotel_info = app.globalData.hotel_info;
                  if (Object.keys(hotel_info).length > 0) {
                    that.setData({
                      wifi_hidden: true
                    })
                    var inner_url = 'http://' + hotel_info.intranet_ip + ':8080/h5/findHotShow?box_mac=' + hotel_info.box_mac + '&web=true&deviceId=123456';
                    wx.request({
                      url: inner_url,
                      success: function (rest) {
                        if (rest.data.code == 10000) {

                          var rb_list = rest.data.result;
                          for (var i = 0; i < hot_play.length; i++) {
                            if (app.in_array(hot_play[i].forscreen_id, rb_list, 'media_id')) {

                              hot_play[i].is_show = 1;
                            } else {

                              hot_play[i].is_show = 0;
                            }
                          }
                        } else {
                          for (var i = 0; i < hot_play.length; i++) {
                            hot_play[i].is_show = 0;
                          }
                        }
                        that.setData({
                          hot_play: hot_play
                        });

                      }
                    })
                  }
                }
              });

            }, res => {
              wx.hideLoading();
            });

            utils.PostRequest(api_v_url + '/index/isHaveCallBox?openid=' + openid, {}, (data, headers, cookies, errMsg, statusCode) => {
              var is_have = data.result.is_have;
              if (is_have == 1) {
                var serial_number = app.globalData.serial_number;
                var head_serial_number = serial_number.substring(0,2);
                if(head_serial_number==app.globalData.not_link_box_pre){
                  app.globalData.serial_number = app.globalData.have_link_box_pre+openid+'_'+(new Date()).valueOf();
                }
                var box_id = data.result.box_id;
                is_view_eval_waiter(box_id);
                app.linkHotelWifi(data.result, that);
                app.globalData.hotel_info = data.result;
                that.setData({
                  is_link: 1,
                  hotel_room: data.result.hotel_name + data.result.room_name,
                  hotel_name: data.result.hotel_name,
                  room_name: data.result.room_name,
                  box_mac: data.result.box_mac,
                  hotel_info: data.result,
                  hotel_info_json: JSON.stringify(data.result),
                  wifi_hidden: true,
                  is_compress:data.result.is_compress
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

          });

          utils.PostRequest(api_url + '/Smallapp3/Adsposition/getAdspositionList', {
            position: '2,3',
          }, (data, headers, cookies, errMsg, statusCode) => {
            var imgUrls = data.result[2];
            var imgUrls_mid = [];
            if (typeof (data.result[3]) != 'undefined') {
              var imgUrls_mid = data.result[3];
            }
            that.setData({
              imgUrls: imgUrls,
              imgUrls_mid: imgUrls_mid
            });
          });


          isShowAct(openid);
        }
      }
    }
    //是否显示活动
    function isShowAct(openid) {
      var goods_info = wx.getStorageSync('savor_goods_info');
      if (goods_info == '' || typeof (goods_info) == 'undefined') {
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

      }
    }
    //是否显示评价入口
    function is_view_eval_waiter(box_id){
      utils.PostRequest(api_url + '/Smallapp4/index/getConfig', {
        box_id: box_id,
      }, (data, headers, cookies, errMsg, statusCode) => {
        var is_view_eval_waiter = data.result.is_comment;
        that.setData({
          box_id:box_id,
          is_view_eval_waiter: is_view_eval_waiter
        })
      });
    }

  },
  onGetUserInfo: function (res) {
    var that = this;

    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    mta.Event.stat("clickonwxauth", {})
    if (res.detail.errMsg == 'getUserInfo:ok') {
      wx.getUserInfo({
        success(rets) {
          utils.PostRequest(api_v_url + '/User/registerCom', {
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
              data: data.result,
            });
            that.setData({
              showModal: false,
            })
          }, res => wx.showToast({
            title: '微信登陆失败，请重试',
            icon: 'none',
            duration: 2000
          }));

        }
      })
      mta.Event.stat("allowauth", {})
    } else {
      utils.PostRequest(api_v_url + '/User/refuseRegister', {
        'openid': openid,
      }, (data, headers, cookies, errMsg, statusCode) => {
        user_info['is_wx_auth'] = 1;
        wx.setStorage({
          key: 'savor_user_info',
          data: user_info,
        })
      });
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
    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    if (box_mac == 'undefined' || box_mac == undefined) {
      box_mac = '';
    }
    utils.PostRequest(api_url + '/Smallapp21/index/closeauthLog', {
      openid: openid,
      box_mac: box_mac,
    });
    mta.Event.stat("closewxauth", {})
  },


  //选择照片上电视
  chooseImage(e) {
    var that = this;
    var user_info = wx.getStorageSync("savor_user_info");
    if (user_info.is_wx_auth != 3 && app.globalData.link_type != 2) {
      that.setData({
        showModal: true
      })
      mta.Event.stat("showwxauth", {})
    } else {
      var box_mac = e.detail.value.boxmac;
      var openid = e.detail.value.openid;
      var is_open_simple = e.detail.value.is_open_simple;
      var formId = e.detail.formId;
      if (box_mac == '') {

        app.scanQrcode(pageid);
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
        }

      }
      mta.Event.stat('gotoForscreenImg', { 'linktype': app.globalData.link_type, 'boxmac': box_mac })
    }
  },
  //选择视频投屏
  chooseVedio(e) {
    var that = this
    var user_info = wx.getStorageSync("savor_user_info");
    if (user_info.is_wx_auth != 3 && app.globalData.link_type != 2) {
      that.setData({
        showModal: true
      })
      mta.Event.stat("showwxauth", {})
    } else {
      var box_mac = e.detail.value.boxmac;
      var openid = e.detail.value.openid;
      var is_open_simple = e.detail.value.is_open_simple;
      var formId = e.detail.formId;
      if (box_mac == '') {
        app.scanQrcode(pageid);
      } else {
        if (app.globalData.link_type == 1) {
          var is_compress = that.data.is_compress;
          wx.navigateTo({
            url: '/pages/forscreen/forvideo/index?box_mac=' + box_mac + '&openid=' + openid + '&is_open_simple=' + is_open_simple+'&is_compress='+is_compress,
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
    console.log(app.globalData);
    mta.Event.stat('gotoForscreenVideo', { 'linktype': app.globalData.link_type, 'boxmac': box_mac })

  },

  showHappy(e) { //视频点播让盒子播放
    var box_mac = e.currentTarget.dataset.boxmac;
    var openid = e.currentTarget.dataset.openid;
    var intranet_ip = e.currentTarget.dataset.intranet_ip;
    if (box_mac == '') {
      app.scanQrcode(pageid);
    } else {
      wx.navigateTo({
        url: '/pages/thematic/birthday/list?openid=' + openid + '&box_mac=' + box_mac + "&intranet_ip=" + intranet_ip,
      })
    }
    mta.Event.stat('gotoHappyList', { 'linktype': app.globalData.link_type, 'boxmac': box_mac })
  },
  //互动游戏
  hdgames(e) {
    var openid = e.currentTarget.dataset.openid;
    var box_mac = e.currentTarget.dataset.boxmac;
    var linkcontent = e.currentTarget.dataset.linkcontent;

    if (box_mac == '') {
      app.scanQrcode(pageid);
    } else {
      var mobile_brand = app.globalData.mobile_brand;
      var mobile_model = app.globalData.mobile_model;

      wx.navigateTo({
        url: linkcontent + '?box_mac=' + box_mac + '&openid=' + openid + '&game_id=2'
      })
    }
    mta.Event.stat('clickTopAds', { 'linktype': app.globalData.link_type, "box_mac": box_mac })
    mta.Event.stat('gotoHdGame', { 'linktype': app.globalData.link_type, "box_mac": box_mac })
  },
  //断开连接
  breakLink: function (e) {
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
          mta.Event.stat('breakLink', { 'linktype': app.globalData.link_type, 'breakstatus': 1 })
        } else if (res.cancel) {
          mta.Event.stat('breakLink', { 'linktype': app.globalData.link_type, 'breakstatus': 0 })
        }
      }
    })




  },
  forscreenHistory: function (e) {
    var box_mac = e.currentTarget.dataset.boxmac;
    var openid = e.currentTarget.dataset.openid;
    if (box_mac == '') {
      app.scanQrcode(pageid);
    } else {
      wx.navigateTo({
        url: '/pages/forscreen/history/list?openid=' + openid + '&box_mac=' + box_mac,
      })
    }
    mta.Event.stat('gotoForscreenHis', { 'linktype': app.globalData.link_type, "boxmac": box_mac })
  },
  scanQrcode(e) {
    var box_mac = e.currentTarget.dataset.boxmac;
    if (box_mac == '') {
      app.scanQrcode(pageid);
    }
  },
  //遥控呼大码
  callQrCode: utils.throttle(function (e) {
    var that = this;
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var qrcode_img = e.currentTarget.dataset.qrcode_img;
    var hotel_info = e.currentTarget.dataset.hotel_info;
    app.controlCallQrcode(openid, box_mac, qrcode_img, hotel_info, that);
  }, 3000), //呼大码结束
  //打开遥控器
  openControl: function (e) {
    var that = this;
    var qrcode_url = api_url + '/Smallapp4/index/getBoxQr?box_mac=' + box_mac + '&type=3';
    that.setData({

      popRemoteControlWindow: true,
      qrcode_img: qrcode_url
    })
    mta.Event.stat('openControl', { 'linktype': app.globalData.link_type })
  },
  //关闭遥控
  closeControl: function (e) {
    var that = this;
    that.setData({

      popRemoteControlWindow: false,
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
    var type = e.target.dataset.type;
    if (type == 5) {
      var user_info = wx.getStorageSync(cache_key + 'user_info');
      that.setData({
        wifiErr: { 'is_open': 0, 'msg': '', 'confirm': '', 'calcle': '', 'type': 0 },
      })
      utils.PostRequest(api_url + '/Smallapp21/index/breakLink', {
        box_mac: box_mac,
        openid: user_info.openid
      }, (data, headers, cookies, errMsg, statusCode) => {
        wx.reLaunch({
          url: '../index/index'
        });
      });
    }
    var hotel_info = e.target.dataset.hotel_info;
    app.linkHotelWifi(hotel_info, that);
    mta.Event.stat("retrylinkwifi", {})
  },
  //文件投屏
  forfiles: function (e) {
    var that = this;
    var user_info = wx.getStorageSync("savor_user_info");
    if (user_info.is_wx_auth != 3) {
      that.setData({
        showModal: true
      })
      mta.Event.stat("showwxauth", {})
    } else {
      var box_mac = e.detail.value.boxmac;
      var openid = e.detail.value.openid;
      var is_open_simple = e.detail.value.is_open_simple;
      var formId = e.detail.formId;
      //微信好友文件投屏+h5文件投屏
      if (box_mac == '') {
        app.scanQrcode(pageid);
      } else {
        that.setData({
          showMe: true,
        })
        app.recordFormId(openid, formId);
      }
    }
    mta.Event.stat('gotoForscreenFile', { 'linktype': app.globalData.link_type, "boxmac": box_mac })
  },
  //微信好友文件
  wxFriendfiles: function (e) {
    var that = this;
    var box_mac = e.currentTarget.dataset.boxmac;
    var openid = e.currentTarget.dataset.openid;
    var is_open_simple = e.currentTarget.dataset.is_open_simple;
    wx.navigateTo({
      url: '/pages/forscreen/forfile/files?box_mac=' + box_mac + '&openid=' + openid + "&is_open_simple=" + is_open_simple,
      success: function (e) {
        that.setData({
          showMe: false
        })
      }
    })
  },
  phonefiles: function (e) {
    var that = this;
    var box_mac = e.currentTarget.dataset.boxmac;
    var openid = e.currentTarget.dataset.openid;
    var is_open_simple = e.currentTarget.dataset.is_open_simple;
    wx.navigateTo({
      url: '/pages/forscreen/forfile/h5files?box_mac=' + box_mac + '&openid=' + openid + "&is_open_simple=" + is_open_simple,
      success: function (e) {
        that.setData({
          showMe: false
        })
      }
    })
  },
  modalCancel: function (e) {
    var that = this;
    that.setData({
      showMe: false,
    })
    mta.Event.stat("cancellinkwifi", {})
  },
  changeActNums: function (e) {
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
  closeAct: function (e) {
    var that = this;
    wx.removeStorageSync('savor_goods_info');
    that.setData({
      showActgoods: false
    })
    goods_nums = 1;
  },
  //店内购买
  shopBuyGoods: function (e) {
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

  },
  //第三方购买（京东）
  tpBuyGoods: function (e) {
    var goods_id = e.currentTarget.dataset.goods_id;
    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    utils.PostRequest(api_url + '/Smallapp3/datalog/recordlog', {
      action_type: 3,
      data_id: goods_id,
      openid: openid,
      type: 2,
    });

  },
  //收藏商品
  collectGoods: function (e) {
    var goods_id = e.currentTarget.dataset.goods_id;
    var that = this;
    that.setData({
      showFavoritesPanel: true,
    })


  },
  //输入手机号失去焦点
  mobileOnInput: function (res) {
    var that = this;
    var mobile = res.detail.value;
    that.setData({
      mobile: mobile
    })
  },
  sendGoodsLink: function (e) {
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

  },
  //活动商品京东购买
  jdBuy: function (e) {
    var h5_url = e.currentTarget.dataset.h5_url;
    h5_url = encodeURIComponent(h5_url);
    wx.navigateTo({
      url: '/pages/h5/index?h5_url=' + h5_url,
    })
  },
  //电视播放
  boxShow: function (e) {
    var that = this;
    var forscreen_id = e.currentTarget.dataset.forscreen_id;

    var pubdetail = e.currentTarget.dataset.pubdetail;
    var res_type = e.currentTarget.dataset.res_type;
    var res_nums = e.currentTarget.dataset.res_nums;
    var hotel_info = e.currentTarget.dataset.hotel_info;
    var index = e.currentTarget.dataset.index;
    if (res_type == 1) {
      var action = 11; //发现图片点播
    } else if (res_type == 2) {
      var action = 12; //发现视频点播
    }

    app.boxShow(box_mac, forscreen_id, pubdetail, res_type, res_nums, action, hotel_info, that);

    var order = index + 1;
    mta.Event.stat('clickHotPlay', { 'linktype': app.globalData.link_type, 'boxmac': box_mac, "order": order })
  },
  phonecallevent: function (e) {
    var tel = e.target.dataset.tel;
    wx.makePhoneCall({
      phoneNumber: tel
    })
  },
  onPullDownRefresh: function () {
    this.onLoad();
    //wx.showNavigationBarLoading();
    // 隐藏导航栏加载框
    //wx.hideNavigationBarLoading();
    // 停止下拉动作
    wx.stopPullDownRefresh();
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

    var that = this;
    var user_info = wx.getStorageSync(cache_key + "user_info");
    if (typeof (user_info.openid) != 'undefined') {
      utils.PostRequest(api_v_url + '/index/isHaveCallBox', {
        openid: user_info.openid
      }, (data, headers, cookies, errMsg, statusCode) => {
        if (data.result.is_have == 1) {//如果已连接盒子
          var serial_number = app.globalData.serial_number;
          var head_serial_number = serial_number.substring(0,2);
          if(head_serial_number==app.globalData.not_link_box_pre){
            app.globalData.serial_number = app.globalData.have_link_box_pre+user_info.openid+'_'+(new Date()).valueOf();
          }
          if(app.globalData.link_type==2){
            app.linkHotelWifi(data.result, that);
            app.globalData.hotel_info = data.result;
          }
          that.setData({
            is_link: 1,
            link_type:data.result.forscreen_type,
            hotel_room: data.result.hotel_name + data.result.room_name,
            hotel_name: data.result.hotel_name,
            room_name: data.result.room_name,
            box_mac: data.result.box_mac,
            hotel_info: data.result,
            hotel_info_json: JSON.stringify(data.result),
            is_compress:data.result.is_compress
          })
          box_mac = data.result.box_mac;
        } else {//如果未连接盒子
          var serial_number = app.globalData.serial_number;
          var head_serial_number = serial_number.substring(0,2);
          if(head_serial_number==app.globalData.have_link_box_pre){
            app.globalData.serial_number = app.globalData.not_link_box_pre+user_info.openid+'_'+(new Date()).valueOf();
          }
          app.globalData.link_type = 0;
          box_mac = ''
          that.setData({
            is_link: 0,
            box_mac: '',
            link_type: 0
          })

        }
      }, re => { }, { isShowLoading: false });
    }
    mta.Event.stat('showIndex', { 'linktype': app.globalData.link_type })

    //this.onLoad()
  },
  bannerGo: function (e) {
    var linkcontent = e.currentTarget.dataset.linkcontent;
    wx.switchTab({
      url: linkcontent,
    })
    /*wx.navigateTo({
      url: linkcontent
    })*/
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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  openAdsLink: function (e) {
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
    console.log(box_mac);
    mta.Event.stat('clickTopAds', { 'linktype': app.globalData.link_type, "boxmac": box_mac })
  },
  closeWxAuth: function (e) {
    var that = this;
    that.setData({
      showModal: false,
    })
    mta.Event.stat("closewxauth", {})
  },
  // 跳转到服务员评价页
  gotoPageHotelWaiterEvaluate: function (e) {
    var box_id = e.currentTarget.dataset.box_id
    var openid = e.currentTarget.dataset.openid
    if (box_mac == '') {
      app.scanQrcode(pageid);
    }else {
      wx.navigateTo({
        url: '/pages/hotel/waiter_evaluate_h5?openid='+openid+'&box_id='+box_id,
      });
    } 
  }
})