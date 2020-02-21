// pages/mine/index_20181010.js
const utils = require('../../utils/util.js')
var mta = require('../../utils/mta_analysis.js')
const app = getApp();
var openid;
var box_mac;
var api_url = app.globalData.api_url;
var cache_key = app.globalData.cache_key;
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
    wifiErr: app.globalData.wifiErr
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //wx.hideShareMenu();
    var that = this;
    that.setData({
      link_type:app.globalData.link_type,
    })
    if (app.globalData.link_type == 2) {
      var userinfo = wx.getStorageSync(cache_key+'user_info');
      userinfo.id = userinfo.user_id;
      that.setData({
        publiclist:app.globalData.public_list,
        collectlist:app.globalData.collect_list,
        userinfo: userinfo,
        box_mac:app.globalData.hotel_info.box_mac,
        openid: userinfo.openid,
        hotel_info:app.globalData.hotel_info
      })
      
    }else {
      if (app.globalData.openid && app.globalData.openid != '') {
        that.setData({
          openid: app.globalData.openid
        })
        openid = app.globalData.openid;
        //判断用户是否注册
        wx.request({
          url: api_url + '/smallapp21/User/isRegister',
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
            if (app.globalData.link_type != 2) {
              wx.setStorage({
                key: 'savor_user_info',
                data: { 'openid': app.globalData.openid },
              })
            }

          }
        });//判断用户是否注册结束
        wx.request({
          url: api_url + '/Smallapp4/index/isHaveCallBox?openid=' + app.globalData.openid,
          headers: {
            'Content-Type': 'application/json'
          },

          success: function (rest) {
            var is_have = rest.data.result.is_have;
            if (is_have == 1) {
              app.linkHotelWifi(rest.data.result, that);
              that.setData({
                hotel_info: rest.data.result,
                box_mac: rest.data.result.box_mac,
                //is_open_simple: rest.data.result.is_open_simple,
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
              url: api_url + '/smallapp21/User/isRegister',
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
                if (app.globalData.link_type != 2) {
                  wx.setStorage({
                    key: 'savor_user_info',
                    data: { 'openid': openid },
                  })
                }

              }
            });//判断用户是否注册结束
            wx.request({
              url: api_url + '/Smallapp4/index/isHaveCallBox?openid=' + openid,
              headers: {
                'Content-Type': 'application/json'
              },

              success: function (rest) {
                var is_have = rest.data.result.is_have;
                if (is_have == 1) {
                  app.linkHotelWifi(rest.data.result, that);
                  that.setData({
                    is_link: 1,

                    box_mac: rest.data.result.box_mac,
                  })
                  box_mac = rest.data.result.box_mac;
                  //getHotelInfo(rest.data.result.box_mac);
                } else {
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
        url: api_url + '/Smallapp3/User/index',
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

    }
    
  },
  

  refreshOn:function(){
    wx.showToast({
      title: '刷新成功',
      icon: 'none',
      duration: 2000
    });
    this.onLoad();
  },
  //遥控呼大码
  callQrCode: utils.throttle(function (e){
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
    var hotel_info = e.target.dataset.hotel_info;
    app.linkHotelWifi(hotel_info, that);
  },
  clickPublicContent: function(e){
    mta.Event.stat("clickpubliccontent", {})
  },
  clickPublicContentMore: function(e){
    mta.Event.stat("clickpubliccontentmore", {})
  },
  clickLikeContent: function(e){
    mta.Event.stat("clicklikecontent", {})
  },
  clickLikeContentMore:function(e){
    mta.Event.stat("clicklikecontentmore", {})
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
    if (app.globalData.openid && app.globalData.openid != '') {
      utils.PostRequest(api_url + '/Smallapp4/index/isHaveCallBox', {
        openid: app.globalData.openid
      }, (data, headers, cookies, errMsg, statusCode) => {
        if (data.result.is_have == 1) {

        } else {
          app.globalData.link_type = 1;
          that.setData({
            is_link: 0,
            box_mac: '',
            link_type: 1,
            popRemoteControlWindow: false
          })
          box_mac = '';
        }
      }, re => { }, { isShowLoading: false });
    } else {
      app.openidCallback = openid => {
        utils.PostRequest(api_url + '/Smallapp4/index/isHaveCallBox', {
          openid: openid
        }, (data, headers, cookies, errMsg, statusCode) => {
          if (data.result.is_have == 1) {

          } else {
            app.globalData.link_type = 1;
            that.setData({
              is_link: 0,
              box_mac: '',
              link_type: 1,
              popRemoteControlWindow: false
            })
            box_mac = '';
          }
        }, re => { }, { isShowLoading: false });
      }
    }
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
    mta.Event.stat("pulltorefresh", {})
    this.onLoad();
    //wx.showNavigationBarLoading();
    // 隐藏导航栏加载框
    //wx.hideNavigationBarLoading();
    // 停止下拉动作
    wx.stopPullDownRefresh();
  },
  bindImgErro:function(e){
    var that = this;
    var index_key = e.currentTarget.dataset.index;
    var type = e.currentTarget.dataset.type;  // pub:公开   col:收藏
    
    if(type=='pub'){
      var list = that.data.publiclist;
    }else if(type=='col'){
      var list = that.data.collectlist;
    }
    for (var i = 0; i < list.length; i++) {
      list[index_key].imgurl = '/images/imgs/default-pic.png';
    }
    if(type=='pub'){
      that.setData({
        publiclist: list
      })
    }else if(type=='col'){
      that.setData({
        collectlist: list
      })
    }
    
  },
  tts:function(e){
    console.log(e);
    var that = this;
    var index_key = e.currentTarget.dataset.index;
    var type = e.currentTarget.dataset.type;  // pub:公开   col:收藏

    if (type == 'pub') {
      var list = that.data.publiclist;
    } else if (type == 'col') {
      var list = that.data.collectlist;
    }
    console.log(list);
    for (var i = 0; i < list.length; i++) {
      list[index_key].imgurl = '/images/imgs/default-pic.png';
    }
    if (type == 'pub') {
      that.setData({
        publiclist: list
      })
    } else if (type == 'col') {
      that.setData({
        collectlist: list
      })
    }
  },
  /**
   * 我的订单
   */
  gotoOrder:function(e){
    console.log(e);
    var  openid = this.data.openid;
    wx.navigateTo({
      url: '/pages/hotel/order/index?openid=' + openid +"&order_status=0",
    })
  },
  /**
   * 我的收货地址
   */
  gotoAdress:function(e){
    var openid = this.data.openid;
    wx.navigateTo({
      url: '/pages/mine/address/index?openid='+openid,
    })
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