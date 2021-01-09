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
    is_view_official_account:app.globalData.is_view_official_account, //是否显示关注公众号
    is_test:0,
    is_open_popcomment:0,
    star_list:[{'lev':1,'is_select':true},{'lev':2,'is_select':true},{'lev':3,'is_select':true},{'lev':4,'is_select':true},{'lev':5,'is_select':true}],
    comment_str:'',
    is_reward:'1',
    comment_disable:false,
    reward_list:[],
    showMsgToase:false,
    use_time:{'use_time_str':'','cut_sec':'','is_show':false}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.removeStorageSync(cache_key+'colose_official_account');
    var that = this;
    that.getHotplaylist();
    //var box_mac = that.data.boxShow
    //that.getAdspositionList(box_mac);
      
  },
  
  getHotplaylist:function(){//获取热播内容
    var that = this;
    utils.PostRequest(api_url + '/Smallapp4/content/getHotplaylist', {
      page: 1,
      pagesize: 6
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        hot_play: data.result.datalist
      });
    })
  },
  getAdspositionList:function(box_id){//获取轮播广告banner
    var that = this;
    utils.PostRequest(api_v_url + '/Adsposition/getAdspositionList', {
        position: '2,3',
        box_id:box_id
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
      },re => { }, { isShowLoading: false });
  },
  is_view_eval_waiter:function (openid,box_id){
    var that = this;
    utils.PostRequest(api_v_url + '/index/getConfig', {
      box_id: box_id,
      openid:openid,
    }, (data, headers, cookies, errMsg, statusCode) => {
      if(app.globalData.qualityList.length==0){
        app.globalData.qualityList = data.result.quality_list;
        
      }
      app.globalData.is_getjj_history = data.result.is_open_simplehistory;
      var is_view_eval_waiter = data.result.is_comment;
      that.setData({is_view_eval_waiter: is_view_eval_waiter})
      var is_closeComment = wx.getStorageSync(app.globalData.cache_key+'is_closeComment');
      var staff_user_info = data.result.staff_user_info;
      var is_open_reward = data.result.is_open_reward;
      if(is_closeComment!=1){
        var is_reward = that.data.is_reward;
        if(staff_user_info.staff_id==0 || is_open_reward==0){
          is_reward = 0;
        }
        var comment_str = that.data.comment_str;
        var reward_list = that.data.reward_list;
        if(reward_list.length==0){
          reward_list = data.result.reward_money
        }
        that.setData({
          is_reward:is_reward,
          is_open_reward:is_open_reward,
          box_id:box_id,
          is_open_popcomment:data.result.is_open_popcomment,
          staff_user_info:data.result.staff_user_info,
          tags:data.result.tags,
          comment_str:comment_str,
          reward_list:reward_list
        })
      } 
      
    },re => { }, { isShowLoading: false });
  },
  
  onGetUserInfo: function (res) {
    var that = this;

    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    mta.Event.stat("clickonwxauth", {})
    if (res.detail.errMsg == 'getUserInfo:ok') {
      if(typeof(openid)!='undefined'){
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
      }else {
        that.setData({
          showModal: false,
        })
        app.showToast('微信登陆失败，请重试');
        
      }
      
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
    if(user_info=='' || typeof(user_info)=='undefined'){
      app.showToast('网络异常，请用微信重新扫码链接电视')
      return false;
    }
    if (user_info.is_wx_auth != 3 ) {
      that.setData({
        showModal: true
      })
      mta.Event.stat("showwxauth", {})
    } else {
      var box_mac = e.detail.value.boxmac;
      var openid = e.detail.value.openid;
      
      if (box_mac == '') {

        app.scanQrcode(pageid);
      } else {
        var hotel_info = app.globalData.hotel_info;
        wx.navigateTo({
          url: '/pages/forscreen/forimages/index?box_mac=' + box_mac + '&openid=' + openid ,
        })
        /*if(hotel_info.forscreen_method=='1-1'){
          wx.navigateTo({
            url: '/pages/forscreen/forimages/index?box_mac=' + box_mac + '&openid=' + openid ,
          })
        }else {
          if (hotel_info.forscreen_type == 1) {
            wx.navigateTo({
              url: '/pages/forscreen/forimages/index?box_mac=' + box_mac + '&openid=' + openid ,
            })
          } else if (hotel_info.forscreen_type== 2) {
  
            var intranet_ip = e.detail.value.intranet_ip;
            var wifi_mac = e.detail.value.wifi_mac;
            var wifi_name = e.detail.value.wifi_name;
            var wifi_password = e.detail.value.wifi_password;
            wx.navigateTo({
              url: '/pages/forscreen/forimages/wifi?box_mac=' + box_mac + '&openid=' + openid + '&intranet_ip=' + intranet_ip + '&wifi_mac=' + wifi_mac + '&wifi_name=' + wifi_name + '&wifi_password=' + wifi_password,
            })
          }
        }*/
      }
      mta.Event.stat('gotoForscreenImg', { 'linktype': app.globalData.link_type, 'boxmac': box_mac })
    }
  },
  //选择视频投屏
  chooseVedio(e) {
    var that = this
    var user_info = wx.getStorageSync("savor_user_info");
    if(user_info=='' || typeof(user_info)=='undefined'){
      app.showToast('网络异常，请用微信重新扫码链接电视')
      return false;
    }
    if (user_info.is_wx_auth != 3 ) {
      that.setData({
        showModal: true
      })
      mta.Event.stat("showwxauth", {})
    } else {
      var box_mac = e.detail.value.boxmac;
      var openid = e.detail.value.openid;
      
      if (box_mac == '') {
        app.scanQrcode(pageid);
      } else {
        var hotel_info = app.globalData.hotel_info;
        var is_compress = that.data.is_compress;
        wx.navigateTo({
          url: '/pages/forscreen/forvideo/index?box_mac=' + box_mac + '&openid=' + openid +'&is_compress='+is_compress,
        })
        /*if(hotel_info.forscreen_method=='1-1'){
          var is_compress = that.data.is_compress;
            wx.navigateTo({
              url: '/pages/forscreen/forvideo/index?box_mac=' + box_mac + '&openid=' + openid +'&is_compress='+is_compress,
            })
        }else {
          if (hotel_info.forscreen_type == 1) {
            var is_compress = that.data.is_compress;
            wx.navigateTo({
              url: '/pages/forscreen/forvideo/index?box_mac=' + box_mac + '&openid=' + openid +'&is_compress='+is_compress,
            })
          } else {
            var intranet_ip = e.detail.value.intranet_ip;
            var wifi_mac = e.detail.value.wifi_mac;
            var wifi_name = e.detail.value.wifi_name;
            var wifi_password = e.detail.value.wifi_password;
  
            wx.navigateTo({
              url: '/pages/forscreen/forvideo/wifi?box_mac=' + box_mac + '&openid=' + openid + '&intranet_ip=' + intranet_ip + '&wifi_mac=' + wifi_mac + '&wifi_name=' + wifi_name + '&wifi_password=' + wifi_password,
            })
          }
        }*/
        


        

      }
    }
    mta.Event.stat('gotoForscreenVideo', { 'linktype': app.globalData.link_type, 'boxmac': box_mac })

  },

  showHappy(e) { //视频点播让盒子播放
    var box_mac = e.currentTarget.dataset.boxmac;
    var openid = e.currentTarget.dataset.openid;
    if (box_mac == '') {
      app.scanQrcode(pageid);
    } else {
      wx.navigateTo({
        url: '/pages/thematic/birthday/list?openid=' + openid + '&box_mac=' + box_mac ,
      })
    }
    mta.Event.stat('gotoHappyList', { 'linktype': app.globalData.link_type, 'boxmac': box_mac })
  },
  //互动游戏
  hdgames(e) {
    var openid = e.currentTarget.dataset.openid;
    var box_mac = e.currentTarget.dataset.boxmac;
    var linkcontent = e.currentTarget.dataset.linkcontent;
    var box_id  = e.currentTarget.dataset.box_id;

    if (box_mac == '') {
      app.scanQrcode(pageid);
    } else {
      var mobile_brand = app.globalData.mobile_brand;
      var mobile_model = app.globalData.mobile_model;

      wx.navigateTo({
        url: linkcontent + '?box_mac=' + box_mac + '&openid=' + openid + '&box_id='+box_id+'&game_id=2'
      })
    }
    mta.Event.stat('clickTopAds', { 'linktype': app.globalData.link_type, "box_mac": box_mac })
    mta.Event.stat('gotoHdGame', { 'linktype': app.globalData.link_type, "box_mac": box_mac })
  },
  //本小程序内跳转
  goToPage:function(e){
    var openid = e.currentTarget.dataset.openid;
    var linkcontent = e.currentTarget.dataset.linkcontent;
    wx.navigateTo({
      url: linkcontent+'&openid='+openid, 
    })
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
    if(user_info=='' || typeof(user_info)=='undefined'){
      app.showToast('网络异常，请用微信重新扫码链接电视')
      return false;
    }
    if (user_info.is_wx_auth != 3) {
      that.setData({
        showModal: true
      })
      mta.Event.stat("showwxauth", {})
    } else {
      var box_mac = e.detail.value.boxmac;
      var openid = e.detail.value.openid;
      
      //微信好友文件投屏+h5文件投屏
      if (box_mac == '') {
        app.scanQrcode(pageid);
      } else {
        if(app.globalData.sys_info.platform=='android'){
          that.setData({
          showMe: true,
          })
        }else {
          var box_mac = e.detail.value.boxmac;
          var openid = e.detail.value.openid;
          wx.navigateTo({
            url: '/pages/forscreen/forfile/files?box_mac=' + box_mac + '&openid=' + openid ,
            success: function (e) {
              that.setData({
                showMe: false
              })
            }
          })
        }
        
        
      }
    }
    mta.Event.stat('gotoForscreenFile', { 'linktype': app.globalData.link_type, "boxmac": box_mac })
  },
  //微信好友文件
  wxFriendfiles: function (e) {
    var that = this;
    var box_mac = e.currentTarget.dataset.boxmac;
    var openid = e.currentTarget.dataset.openid;
    wx.navigateTo({
      url: '/pages/forscreen/forfile/files?box_mac=' + box_mac + '&openid=' + openid ,
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
    wx.navigateTo({
      url: '/pages/forscreen/forfile/h5files?box_mac=' + box_mac + '&openid=' + openid ,
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
    //this.onLoad();
    //wx.showNavigationBarLoading();
    // 隐藏导航栏加载框
    //wx.hideNavigationBarLoading();
    // 停止下拉动作
    //wx.stopPullDownRefresh();
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
    if (app.globalData.openid && app.globalData.openid != '' && typeof(app.globalData.openid)!='undefined') {
      that.setData({
        openid: app.globalData.openid
      })
      openid = app.globalData.openid;
      
      utils.PostRequest(api_v_url + '/index/isHaveCallBox', {
        openid: openid,
      }, (data, headers, cookies, errMsg, statusCode) => {

        if (data.result.is_have == 1) {//如果已连接盒子
          
          var serial_number = app.globalData.serial_number;
          var head_serial_number = serial_number.substring(0,2);
          if(head_serial_number==app.globalData.not_link_box_pre){
            app.globalData.serial_number = app.globalData.have_link_box_pre+openid+'_'+(new Date()).valueOf();
          }
          that.is_view_eval_waiter(openid,data.result.box_id);
          app.linkHotelWifi(data.result, that);
          that.getAdspositionList(data.result.box_id)
          app.globalData.hotel_info = data.result;
          that.setData({
            box_id:data.result.box_id,
            is_test:data.result.is_test,
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
          that.getAdspositionList('')
          var serial_number = app.globalData.serial_number;
          var head_serial_number = serial_number.substring(0,2);
          if(head_serial_number==app.globalData.have_link_box_pre){
            app.globalData.serial_number = app.globalData.not_link_box_pre+openid+'_'+(new Date()).valueOf();
          }
          app.globalData.link_type = 0;
          box_mac = ''
          that.setData({
            is_link: 0,
            box_mac: '',
            link_type: 0
          })

        }
        app.isRegister(openid,that,1,data.result.is_have);
      }, re => { }, { isShowLoading: false });
      

    }else {
      wx.showLoading({
        title: '数据加载中..',
        mask: true
      })
      app.openidCallback = openid => {
        
        if (openid != '' && typeof(app.globalData.openid)!='undefined') {
          that.setData({
            openid: openid
          })
          openid = openid;
          
          utils.PostRequest(api_v_url + '/index/isHaveCallBox', {
            openid: openid,
          
          }, (data, headers, cookies, errMsg, statusCode) => {
            var is_have = data.result.is_have;
            if (is_have == 1) {
              
              var serial_number = app.globalData.serial_number;
              var head_serial_number = serial_number.substring(0,2);
              if(head_serial_number==app.globalData.not_link_box_pre){
                app.globalData.serial_number = app.globalData.have_link_box_pre+openid+'_'+(new Date()).valueOf();
              }
              var box_id = data.result.box_id;
              that.is_view_eval_waiter(openid,box_id);
              app.linkHotelWifi(data.result, that);
              that.getAdspositionList(data.result.box_id)
              app.globalData.hotel_info = data.result;
              that.setData({
                box_id:data.result.box_id,
                is_test:data.result.is_test,
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
              that.getAdspositionList('')
              that.setData({
                is_link: 0,
                box_mac: '',
              })
              box_mac = '';
            }
            app.isRegister(openid,that,1,is_have);
          });
        }else {
          wx.hideLoading({ })
          that.getAdspositionList('')
          that.setData({
            is_link: 0,
            box_mac: '',
          })
          box_mac = '';
        }
        
      }
    }
  },
  bannerGo: function (e) {
    var linkcontent = e.currentTarget.dataset.linkcontent;
    wx.switchTab({
      url: linkcontent,
    })
  },
  testForscreen:function(e){
    var box_mac = e.currentTarget.dataset.boxmac;
    var openid = e.currentTarget.dataset.openid;
    var type   = e.currentTarget.dataset.type;
    utils.PostRequest(api_v_url + '/forscreen/collectforscreen', {
      box_mac: box_mac,
      openid: openid,
      type:type
    }, (data, headers, cookies, errMsg, statusCode) =>{
      app.showToast('投屏成功')
    })
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
      var user_info = wx.getStorageSync("savor_user_info");
      if (user_info.is_wx_auth != 3 ) {
        this.setData({
          showModal: true
        })
        mta.Event.stat("showwxauth", {})
      }else {
        wx.navigateTo({
          //url: '/pages/hotel/waiter_evaluate_h5?openid='+openid+'&box_id='+box_id,
          url:'/pages/hotel/comment/index?openid='+openid+'&box_mac='+box_mac+'&box_id='+box_id,
        });
      }
    } 
  },
  closeFollowOfficialAccount:function(e){
    this.setData({
      is_view_official_account:false
    })
    wx.setStorageSync(cache_key+'colose_official_account',1);
  },
  nowFollowOfficialAccount:function(){
    var openid= this.data.openid;
    /*wx.navigateTo({
      url: '/pages/h5/index?h5_url='+app.globalData.Official_account_url+openid,
    })*/
    var user_info = wx.getStorageSync(cache_key+'user_info');
    if(user_info.wx_mpopenid=='' || typeof(user_info.wx_mpopenid)=='undefined'){
      wx.navigateTo({
        url: '/pages/h5/index?h5_url='+app.globalData.Official_account_url+openid,
      })
    }else {
      wx.navigateTo({
        url: '/pages/h5/index?h5_url='+app.globalData.Official_article_url,
      })
    }
    mta.Event.stat('clickOfficialAccount',{'openid':openid})
  },
  closeComment:function(e){
    var that = this;
    wx.setStorage({
      data: 1,
      key: app.globalData.cache_key+'is_closeComment',
      success:function(e){
        that.setData({is_open_popcomment:0})
      }
    })
    
  },
  subStar:function(e){
    var star_list = this.data.star_list;
    var keys = e.target.dataset.keys;
    var flag = keys +1;
    
    if(flag<star_list.length){
      for(let i in star_list){
        if(i>keys){
          star_list[i].is_select = false
        }
      }
      this.setData({star_list:star_list})
    }
  },
  addStar:function(e){
    var star_list = this.data.star_list;
    var keys = e.target.dataset.keys;
    for(let i in star_list){
      if(i<=keys){
        star_list[i].is_select = true;
      }
    }
    this.setData({star_list:star_list})
  },
  editCommnet:function(e){
    var comment_str = e.detail.value;
    this.setData({comment_str:comment_str})
    
  },
  clickTag:function(e){
    var comment_str = this.data.comment_str;
    var value = e.target.dataset.value;
    var keys  = e.target.dataset.keys;
    var tags  = this.data.tags;
    for(let i in tags){
      if(i== keys){
        tags[i].selected = true
      }else {
        tags[i].selected = false
      }
    }
    this.setData({tags:tags})
    if(comment_str==''){
      comment_str += value
    }else {
      comment_str += ','+value
    }
    
    this.setData({comment_str:comment_str})
  },
  subComment:function(openid,score,comment_str,staff_id,box_mac,order_id=0){
    var that = this;
    utils.PostRequest(api_v_url + '/Comment/subComment', {
      openid: openid,
      score:score,
      content:comment_str,
      staff_id :staff_id,
      box_mac:box_mac,
      reward_id:order_id
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({is_open_popcomment:0,comment_disable:false})
      app.showToast('感谢您的支持！',2000,'success')
      var forscreen_id = (new Date()).valueOf();
      that.recordForscreenLog(forscreen_id,openid,box_mac,52);
    })
  },
  payReward:function(openid,score,comment_str,staff_id,box_mac,reward_id){
    var that = this;
    utils.PostRequest(api_v_url + '/comment/reward', {
      box_mac:box_mac,
      reward_id:reward_id,
      openid: openid,
      staff_id:staff_id,
    }, (data, headers, cookies, errMsg, statusCode) => {
      var order_id = data.result.order_id;
      wx.requestPayment({
        'timeStamp': data.result.payinfo.timeStamp,
        'nonceStr': data.result.payinfo.nonceStr,
        'package': data.result.payinfo.package,
        'signType': data.result.payinfo.signType,
        'paySign': data.result.payinfo.paySign,
        success(res) {
          that.subComment(openid,score,comment_str,staff_id,box_mac,order_id) 
        },
        fail(res) {
          if (res.errMsg == "requestPayment:fail cancel") {
            app.showToast('支付取消')
            
          } else {
            app.showToast('支付失败')
          }
          that.setData({comment_disable:false})
        }
      })
    },re => { 
      that.setData({comment_disable:false})
    })
  },
  submitComment:function(e){
    console.log(e);
    //return false;
    var that = this;
    var star_list = this.data.star_list;
    var comment_str = this.data.comment_str.replace(/\s+/g, '');
    var staff_user_info = this.data.staff_user_info;
    var openid = this.data.openid;
    var box_mac = e.detail.value.box_mac;

    var score = 0;
    var flag_score = 0;
    /*if(comment_str==''){
      app.showToast('请填写评价内容');
      return false;
    }*/
    for(let i in star_list){
      if(star_list[i].is_select==true){
        score  +=1;
      }
    }
    var is_reward = that.data.is_reward;
    
    if(is_reward==1){//打赏
      var reward_id = 0;
      var reward_list = that.data.reward_list;
      for(let i in reward_list){
        if(reward_list[i].selected===true){
          reward_id = reward_list[i].id;
          break;
        }
      }
      if(reward_id==0){
        app.showToast('请选择打赏金额');
        return false;
      }
      that.setData({comment_disable:true})
      that.payReward(openid,score,comment_str,staff_user_info.staff_id,box_mac,reward_id);
    }else {//不打赏
      that.subComment(openid,score,comment_str,staff_user_info.staff_id,box_mac)
    }
    
  },
  recordForscreenLog:function(forscreen_id,openid,box_mac,action=0){

    utils.PostRequest(api_v_url+'/index/recordForScreenPics', {
      forscreen_id: forscreen_id,
      openid: openid,
      box_mac: box_mac,
      action: action,
      mobile_brand: app.globalData.mobile_brand,
      mobile_model: app.globalData.mobile_model,
      imgs: '[]',
      serial_number:app.globalData.serial_number

    }, (data, headers, cookies, errMsg, statusCode) => {
      
    },re => { }, { isShowLoading: false })
    
  },
  gotoActivity:function(e){
    var that = this;
    var linkcontent = e.currentTarget.dataset.linkcontent;
    var user_info = wx.getStorageSync("savor_user_info");
    if (user_info.is_wx_auth != 3 ) {
      that.setData({
        showModal: true
      })
      mta.Event.stat("showwxauth", {})
    } else {
      var openid = that.data.openid;
      var box_mac = that.data.box_mac;
      if (box_mac == '') {

        app.scanQrcode(pageid);
      } else {
        wx.navigateTo({
          url: linkcontent+'?openid='+openid+'&box_mac='+box_mac+'&is_share=0',
        })
        mta.Event.stat('clickDindashBanner',{'openid':user_info.openid,'boxmac':box_mac})
      }
    }
  },
  //选择打赏金额
  selectReward:function(e){
    var reward_list = this.data.reward_list;
    var keys = e.currentTarget.dataset.keys;
    for(let i in reward_list){
      if(reward_list[i].selected===true){
        reward_list[i].selected = false;
      }
      if(i==keys){
        reward_list[i].selected = true;
      }
    }
    this.setData({reward_list:reward_list});
  },
  // 打赏选项卡选择
  showTab: function (e) {
    let self = this;
    let is_reward = e.currentTarget.dataset.is_reward;
    self.setData({
      is_reward: is_reward
    });
  },
  /**
   * 商务宴请
   */
  gotoBusiness:function(e){
    var that = this;
    var box_mac = e.target.dataset.box_mac;
    var openid = e.target.dataset.openid;
    mta.Event.stat('gotoBusiness',{'openid':openid,'boxmac':box_mac})
    var user_info = wx.getStorageSync("savor_user_info");
    if(user_info=='' || typeof(user_info)=='undefined'){
      app.showToast('网络异常，请用微信重新扫码链接电视')
      return false;
    }
    if (user_info.is_wx_auth != 3 ) {
      that.setData({
        showModal: true
      })
      mta.Event.stat("showwxauth", {})
    } else {
      if (box_mac == '') {
        app.scanQrcode(pageid);
      } else {
        var hotel_name = that.data.hotel_name;
        var room_name = that.data.room_name;
        var is_compress = that.data.is_compress
        wx.navigateTo({
          url: '/scene/pages/business/index?openid='+openid+'&box_mac='+box_mac+'&hotel_name='+hotel_name+'&room_name='+room_name+'&is_compress='+is_compress,
        })
      }
    }
  },
  /**
   * 生日聚会
   */
  gotoParty:function(e){
    var that = this;
    var box_mac = e.target.dataset.box_mac;
    var openid = e.target.dataset.openid;
    mta.Event.stat('gotoParty',{'openid':openid,'boxmac':box_mac})
    var user_info = wx.getStorageSync("savor_user_info");
    if(user_info=='' || typeof(user_info)=='undefined'){
      app.showToast('网络异常，请用微信重新扫码链接电视')
      return false;
    }
    if (user_info.is_wx_auth != 3 ) {
      that.setData({
        showModal: true
      })
      mta.Event.stat("showwxauth", {})
    } else {
      if (box_mac == '') {
        app.scanQrcode(pageid);
      } else {
        var hotel_name = that.data.hotel_name;
        var room_name = that.data.room_name;
        wx.navigateTo({
          url: '/scene/pages/party/index?openid='+openid+'&box_mac='+box_mac+'&hotel_name='+hotel_name+'&room_name='+room_name,
        })
      }
    }
  },
  gotoDf:function(e){
    wx.navigateTo({
      url: '/pages/scene/business/downloadfile',
    })
  }
})