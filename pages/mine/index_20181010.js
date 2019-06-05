// pages/mine/index_20181010.js
const util = require('../../utils/util.js')
const app = getApp();
var openid;
var box_mac;
var api_url = app.globalData.api_url;
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
    //wx.hideShareMenu();
    var that = this;
    if (app.globalData.openid && app.globalData.openid != '') {
      that.setData({
        openid: app.globalData.openid
      })
      openid = app.globalData.openid;
      //判断用户是否注册
      wx.request({
        url: api_url+'/smallapp21/User/isRegister',
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
        url: api_url+'/Smallapp/index/isHaveCallBox?openid=' + app.globalData.openid,
        headers: {
          'Content-Type': 'application/json'
        },

        success: function (rest) {
          var is_have = rest.data.result.is_have;
          if (is_have == 1) {
            that.setData({
              box_mac: rest.data.result.box_mac,
              is_open_simple: rest.data.result.is_open_simple,
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
            url: api_url+'/smallapp21/User/isRegister',
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
            url: api_url+'/Smallapp/index/isHaveCallBox?openid=' + openid,
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
      url: api_url+'/Smallapp3/User/index',
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
  

  refreshOn:function(){
    wx.showToast({
      title: '刷新成功',
      icon: 'none',
      duration: 2000
    });
    this.onLoad();
  },
  //遥控呼大码
  callQrCode: util.throttle(function (e){
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var qrcode_img = e.currentTarget.dataset.qrcode_img;
    app.controlCallQrcode(openid, box_mac, qrcode_img);
  }, 3000),//呼大码结束
  //打开遥控器
  openControl: function (e) {
    var that = this;
    var qrcode_url = api_url+'/Smallapp/index/getBoxQr?box_mac=' + box_mac + '&type=3';
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