// pages/launch/video/index.js
const util = require('../../../utils/util.js')
const app = getApp()
var openid;
var box_mac;
var intranet_ip;
var wifi_mac;
var wifi_name;
var wifi_password;
var hotel_info = { 'intranet_ip': '', 'wifi_mac': '', 'wifi_name': '', 'wifi_password': '', is_jj: '1' };
var qrcode_url;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    is_upload: 0,
    intranet_ip,
    openid: '',
    box_mac: '',
    video_url: '',
    is_forscreen: 0,
    hiddens: true,
    replay_btn: 0,
    is_open_control: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (res) {
    var that = this;
    box_mac = res.box_mac;
    openid = res.openid;
    intranet_ip = res.intranet_ip;
    wifi_mac = res.wifi_mac;
    wifi_name = res.wifi_name;
    wifi_password = res.wifi_password;
    hotel_info.intranet_ip = intranet_ip;
    hotel_info.wifi_mac = wifi_mac;
    hotel_info.wifi_name = wifi_name;
    hotel_info.wifi_password = wifi_password;

    that.setData({
      box_mac: box_mac,
      openid: openid,
      hotel_info:hotel_info
    })
    var forscreen_id = (new Date()).valueOf();
    var filename = (new Date()).valueOf();
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      //compressed:false,
      maxDuration: 60,
      camera: 'back',
      success: function (res) {
        var video_url = res.tempFilePath
        that.setData({
          video_url: video_url,
          intranet_ip: intranet_ip,
          openid: openid,
          box_mac: box_mac,
          duration: res.duration,
          video_size: res.size,
          is_forscreen: 1
        })
      },
      fail: function (e) {
        wx.navigateBack({
          delta: 1,
        })
      }
    })
  },
  forscreen_video: function (res) {
    console.log(res);
    var that = this;
    that.setData({
      is_forscreen: 0,
      hiddens: false,
    })
    openid = res.currentTarget.dataset.openid;
    box_mac = res.currentTarget.dataset.boxmac;
    intranet_ip = res.currentTarget.dataset.intranet_ip;
    var user_info = wx.getStorageSync('savor_user_info');
    var avatarUrl = user_info.avatarUrl;
    var nickName = user_info.nickName;
    var video_url = res.currentTarget.dataset.video_url;
    var mobile_brand = app.globalData.mobile_brand;
    var mobile_model = app.globalData.mobile_model;
    var resouce_size = res.currentTarget.dataset.video_size;
    var duration = res.currentTarget.dataset.duration;
    var forscreen_id = (new Date()).valueOf();
    var filename = (new Date()).valueOf();
    console.log('http://' + intranet_ip + ':8080/videoH5?deviceId=' + openid + '&box_mac=' + box_mac + '&deviceName=' + mobile_brand + '&web=true&forscreen_id=' + forscreen_id + '&filename=' + filename + '&device_model=' + mobile_model + '&resource_size=' + resouce_size + '&duration=' + duration + '&action=2&resource_type=2&avatarUrl=' + avatarUrl + "&nickName=" + nickName);
    wx.uploadFile({
      url: 'http://' + intranet_ip + ':8080/videoH5?deviceId=' + openid + '&box_mac='+box_mac+'&deviceName=' + mobile_brand + '&web=true&forscreen_id=' + forscreen_id + '&filename=' + filename + '&device_model=' + mobile_model + '&resource_size=' + resouce_size + '&duration=' + duration + '&action=2&resource_type=2&avatarUrl=' + avatarUrl + "&nickName=" + nickName,
      filePath: video_url,
      name: 'fileUpload',
      success: function (res) {
        console.log(res)
        var info_rt = JSON.parse(res.data);
        if(info_rt.result==0){
          that.setData({
            is_upload: 1,
            vedio_url: video_url,
            filename: filename,
            resouce_size: resouce_size,
            duration: duration,
            intranet_ip: intranet_ip,
            hiddens: true,
          })
        }else if(info_rt.result==1001){

          that.setData({
            hiddens: true,
            is_forscreen:1,
            wifiErr: { 'is_open': 1, 'msg': '亲，使用此小程序前需要链接包间wifi,链接wifi投屏更快哦！', 'confirm': '重试', 'calcle': '', 'type': 3 }
          })
        }
        
      }, fail: function ({ errMsg }) {
        that.setData({
          hiddens: true,
          is_forscreen: 1,
          wifiErr: { 'is_open': 1, 'msg': '亲，使用此小程序前需要链接包间wifi,链接wifi投屏更快哦！', 'confirm': '重试', 'calcle': '', 'type': 3 }
        })
      }
    })
  },
  exitForscreend: function (res) {
    var that = this;
    openid = res.currentTarget.dataset.openid;
    box_mac = res.currentTarget.dataset.boxmac;
    intranet_ip = res.currentTarget.dataset.intranet_ip;

    wx.request({
      url: "http://" + intranet_ip + ":8080/h5/stop?deviceId=" + openid + "&box_mac="+box_mac+"&web=true",
      success: function (res) {
        if(res.data.result==0){
          wx.navigateBack({
            delta: 1
          })
          wx.showToast({
            title: '退出成功',
            icon: 'none',
            duration: 2000
          });
        }else if(res.data.result==1001){
          that.setData({
            hiddens: true,
            wifiErr: { 'is_open': 1, 'msg': '亲，使用此小程序前需要链接包间wifi,链接wifi投屏更快哦！', 'confirm': '重试', 'calcle': '', 'type': 3 }
          })
        }
      },
      fail: function ({ errMsg }) {

        that.setData({
          hiddens: true,
          wifiErr: { 'is_open': 1, 'msg': '亲，使用此小程序前需要链接包间wifi,链接wifi投屏更快哦！', 'confirm': '重试', 'calcle': '', 'type': 3 }
        })
      },
    })
  },
  chooseVedio: function (res) {
    var that = this;
    //console.log(res);
    box_mac = res.currentTarget.dataset.box_mac;
    openid = res.currentTarget.dataset.openid;
    that.setData({
      box_mac: box_mac,
      openid: openid
    })
    var intranet_ip = res.currentTarget.dataset.intranet_ip;
    var forscreen_id = (new Date()).valueOf();
    var filename = (new Date()).valueOf();
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      //compressed: false,
      maxDuration: 60,
      camera: 'back',
      success: function (res) {
        var video_url = res.tempFilePath
        that.setData({
          is_upload: 0,
          video_url: video_url,
          intranet_ip: intranet_ip,
          openid: openid,
          box_mac: box_mac,
          duration: res.duration,
          video_size: res.size,
          is_forscreen: 1
        })
      }
    })
  },
  //重投视频
  replayVedio: function (res) {
    var that = this;
    that.setData({
      replay_btn: 1,
    })
    var djs = 3;
    that.setData({
      djs: djs
    })
    var timer8_0 = setInterval(function () {
      djs -= 1;
      that.setData({
        djs: djs
      });
      if (djs == 0) {
        that.setData({
          replay_btn: 0,
        })
        clearInterval(timer8_0);
      }

    }, 1000);
    var user_info = wx.getStorageSync('savor_user_info');
    var avatarUrl = user_info.avatarUrl;
    var nickName = user_info.nickName;
    var intranet_ip = res.target.dataset.intranet_ip;
    var mobile_brand = app.globalData.mobile_brand;
    var mobile_model = app.globalData.mobile_model;
    var forscreen_id = (new Date()).valueOf();
    var filename = res.target.dataset.filename;
    var resouce_size = res.target.dataset.resouce_size;
    var duration = res.target.dataset.duration;
    var vedio_url = res.target.dataset.vedio_url;
    var box_mac = res.target.dataset.box_mac;
    wx.uploadFile({
      url: 'http://' + intranet_ip + ':8080/videoH5?deviceId=' + openid + '&box_mac=' + box_mac+'&deviceName=' + mobile_brand + '&web=true&forscreen_id=' + forscreen_id + '&filename=' + filename + '&device_model=' + mobile_model + '&resource_size=' + resouce_size + '&duration=' + duration + '&action=2&resource_type=2&avatarUrl=' + avatarUrl + "&nickName=" + nickName,
      filePath: vedio_url,
      name: 'fileUpload',
      success: function (res) {
        var info_rt = JSON.parse(res.data);
        if (info_rt.result == 0) {
          that.setData({
            is_upload: 1,
            vedio_url: video_url,
            filename: filename,
            resouce_size: resouce_size,
            duration: duration,
            intranet_ip: intranet_ip,
            hiddens: true,
          })
        } else if (info_rt.result == 1001) {

          that.setData({
            hiddens: true,
            wifiErr: { 'is_open': 1, 'msg': '亲，使用此小程序前需要链接包间wifi,链接wifi投屏更快哦！', 'confirm': '重试', 'calcle': '', 'type': 3 }
          })
        }

      }, fail: function ({ errMsg }) {
        that.setData({
          hiddens: true,
          wifiErr: { 'is_open': 1, 'msg': '亲，使用此小程序前需要链接包间wifi,链接wifi投屏更快哦！', 'confirm': '重试', 'calcle': '', 'type': 3 }
        })
      },
    })

  },

  //遥控呼大码
  callQrCode: util.throttle(function (e) {
    app.controlCallQrcode(intranet_ip, openid);
  }, 3000),//呼大码结束
  //打开遥控器
  openControl: function (e) {
    var that = this;

    //默认图
    qrcode_url = '/images/icon/huma.jpg';
    that.setData({
      popRemoteControlWindow: true,
      qrcode_img: qrcode_url,
      intranet_ip: intranet_ip,
      is_open_control: true,
    })
  },
  //关闭遥控
  closeControl: function (e) {
    var that = this;
    that.setData({
      is_open_control: false,
      popRemoteControlWindow: false,
    })

  },
  //遥控退出投屏
  exitForscreen: function (e) {
    var that = this;
    app.controlExitForscreen(openid, box_mac, hotel_info, that);
  },
  //遥控调整音量
  changeVolume: function (e) {
    var that = this;
    var change_type = e.currentTarget.dataset.change_type;
    app.controlChangeVolume(openid, box_mac, change_type, hotel_info, that);
  },
  //遥控切换节目
  changeProgram: function (e) {

    var that = this;
    var change_type = e.currentTarget.dataset.change_type;
    app.controlChangeProgram(openid, box_mac, change_type, hotel_info, that);
  },
  modalConfirm: function (e) {
    console.log(e);
    var that = this;
    var hotel_info = e.target.dataset.hotel_info;
    app.linkHotelWifi(hotel_info, that);
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
  onUnload: function (res) {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

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