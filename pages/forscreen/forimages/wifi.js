// pages/launch/pic/index.js
const util = require('../../../utils/util.js')
const app = getApp()
var box_mac;
var openid;
var intranet_ip;
var wifi_mac;
var wifi_name;
var wifi_password;
var hotel_info = { 'intranet_ip': '', 'wifi_mac': '', 'wifi_name': '', 'wifi_password': '', is_jj:'1'};
var qrcode_url;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    is_upload: 0,
    img_lenth: 0,
    intranet_ip: '',
    filename_arr: '',
    forscreen_char: '',
    up_imgs: [],
    is_btn_disabel: false,
    hiddens: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    box_mac = options.box_mac;
    openid = options.openid;
    intranet_ip = options.intranet_ip;
    wifi_mac = options.wifi_mac;
    wifi_name = options.wifi_name;
    wifi_password = options.wifi_password;
    hotel_info.intranet_ip = intranet_ip;
    hotel_info.wifi_mac   = wifi_mac;
    hotel_info.wifi_name  = wifi_name;
    hotel_info.wifi_password = wifi_password;
    
    that.setData({
      box_mac: box_mac,
      openid: openid,
      is_btn_disabel: true,
      hotel_info:hotel_info,
    })
    wx.chooseImage({
      count: 6, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有

      success: function (res) {
        var img_len = res.tempFilePaths.length;
        var tmp_imgs = [];
        for (var i = 0; i < img_len; i++) {
          tmp_imgs[i] = { "tmp_img": res.tempFilePaths[i], "resource_size": res.tempFiles[i].size };
        }
        that.setData({
          up_imgs: tmp_imgs,
          img_lenth: img_len,
          intranet_ip: intranet_ip,
          is_btn_disabel: false,
        })
      },
      fail: function (e) {
        wx.navigateBack({
          delta: 1,
        })
      }
    })
  },
  up_forscreen: function (e) {

    var that = this;
    that.setData({
      is_btn_disabel: true,
      hiddens: true,
    })
    //console.log(res.detail.value);
    var box_mac = e.detail.value.box_mac;
    var user_info = wx.getStorageSync('savor_user_info');
    var avatarUrl = user_info.avatarUrl;
    var nickName = user_info.nickName;
    var img_lenth = e.detail.value.img_lenth;
    var intranet_ip = e.detail.value.intranet_ip;
    var mobile_brand = app.globalData.mobile_brand;
    var mobile_model = app.globalData.mobile_model;
    var forscreen_char = e.detail.value.forscreen_char;
    var upimgs = [];

    if (e.detail.value.upimgs0 != '' && e.detail.value.upimgs0 != undefined) {

      upimgs[0] = { 'img_url': e.detail.value.upimgs0, 'img_size': e.detail.value.upimgsize0 };


    }
    if (e.detail.value.upimgs1 != '' && e.detail.value.upimgs1 != undefined) {
      upimgs[1] = { 'img_url': e.detail.value.upimgs1, 'img_size': e.detail.value.upimgsize1 };
    }
    if (e.detail.value.upimgs2 != '' && e.detail.value.upimgs2 != undefined) {
      upimgs[2] = { 'img_url': e.detail.value.upimgs2, 'img_size': e.detail.value.upimgsize2 };
    }
    if (e.detail.value.upimgs3 != '' && e.detail.value.upimgs3 != undefined) {
      upimgs[3] = { 'img_url': e.detail.value.upimgs3, 'img_size': e.detail.value.upimgsize3 };
    }
    if (e.detail.value.upimgs4 != '' && e.detail.value.upimgs4 != undefined) {
      upimgs[4] = { 'img_url': e.detail.value.upimgs4, 'img_size': e.detail.value.upimgsize4 };
    }
    if (e.detail.value.upimgs5 != '' && e.detail.value.upimgs5 != undefined) {
      upimgs[5] = { 'img_url': e.detail.value.upimgs5, 'img_size': e.detail.value.upimgsize5 };
    }
    if (e.detail.value.upimgs6 != '' && e.detail.value.upimgs6 != undefined) {
      upimgs[6] = { 'img_url': e.detail.value.upimgs6, 'img_size': e.detail.value.upimgsize6 };
    }
    if (e.detail.value.upimgs7 != '' && e.detail.value.upimgs7 != undefined) {
      upimgs[7] = { 'img_url': e.detail.value.upimgs7, 'img_size': e.detail.value.upimgsize7 };
    }
    if (e.detail.value.upimgs8 != '' && e.detail.value.upimgs8 != undefined) {
      upimgs[8] = { 'img_url': e.detail.value.upimgs8, 'img_size': e.detail.value.upimgsize8 };
    }
    var forscreen_id = (new Date()).valueOf();
    var filename_arr = [];
    for (var i = 0; i < img_lenth; i++) {

      var img_url = upimgs[i].img_url;
      var img_size = upimgs[i].img_size;
      var filename = (new Date()).valueOf();
      filename_arr[i] = filename;

      wx.uploadFile({
        url: "http://" + intranet_ip + ":8080/picH5?isThumbnail=1&imageId=20170301&deviceId=" + openid + "&box_mac="+box_mac+"&deviceName=" + mobile_brand + "&rotation=90&imageType=1&web=true&forscreen_id=" + forscreen_id + '&forscreen_char=' + forscreen_char + '&filename=' + filename + '&device_model=' + mobile_model + '&resource_size=' + img_size + '&action=4&resource_type=0&avatarUrl=' + avatarUrl + "&nickName=" + nickName + "&forscreen_nums=" + img_lenth,
        filePath: img_url,
        name: 'fileUpload',
        success: function (res) {
          
          if (i == img_lenth ){
            var info_rt = JSON.parse(res.data);
            if(info_rt.result==1001){
              that.setData({
                wifiErr: { 'is_open': 1, 'msg': '亲，使用此小程序前需要链接包间wifi,链接wifi投屏更快哦！', 'confirm': '重试', 'calcle': '', 'type': 3 }
              })
            }
          }
        },
        fail: function ({ errMsg }) {
          if (i == img_lenth) {
            that.setData({
              wifiErr: { 'is_open': 1, 'msg': '亲，使用此小程序前需要链接包间wifi,链接wifi投屏更快哦！', 'confirm': '重试', 'calcle': '', 'type': 3 }
            })
          }
        },
      });
      sleep(1);
    }
    function sleep(delay) {
      var start = (new Date()).getTime();
      while ((new Date()).getTime() - start < delay) {
        continue;
      }
    }

    that.setData({
      up_imgs: upimgs,
      filename_arr: filename_arr,
      is_upload: 1,
      forscreen_char: forscreen_char,
      hiddens: true,
    })

  },
  chooseImage: function (res) {
    var that = this;
    openid = res.currentTarget.dataset.openid;
    box_mac = res.currentTarget.dataset.box_mac;
    intranet_ip = res.currentTarget.dataset.intranet_ip

    that.setData({
      box_mac: box_mac,
      openid: openid,
      intranet_ip: intranet_ip,
      is_btn_disabel: true,
      //up_imgs: [],


    })

    wx.chooseImage({
      count: 6, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        that.setData({
          up_imgs: [],
        })
        var img_len = res.tempFilePaths.length;

        var tmp_imgs = [];
        for (var i = 0; i < img_len; i++) {
          tmp_imgs[i] = { "tmp_img": res.tempFilePaths[i], "resource_size": res.tempFiles[i].size };
        }
        that.setData({
          up_imgs: tmp_imgs,
          img_lenth: img_len,
          intranet_ip: intranet_ip,
          is_upload: 0,
          is_btn_disabel: false,
        })
      }
    })
  },
  up_single_pic: function (res) {
    var that = this;
    //console.log(res);
    openid = res.currentTarget.dataset.openid;
    box_mac = res.currentTarget.dataset.boxmac;
    intranet_ip = res.currentTarget.dataset.intranet_ip

    var user_info = wx.getStorageSync('savor_user_info');
    var avatarUrl = user_info.avatarUrl;
    var nickName = user_info.nickName;
    var filename = res.currentTarget.dataset.filename;
    var forscreen_char = res.currentTarget.dataset.forscreen_char;
    var resouce_size = res.currentTarget.dataset.resouce_size;
    var forscreen_id = (new Date()).valueOf();
    var mobile_brand = app.globalData.mobile_brand;
    var mobile_model = app.globalData.mobile_model;
    var img_url = res.currentTarget.dataset.img_url;
    var choose_key = res.currentTarget.dataset.choose_key;
    that.setData({
      choose_key: choose_key
    })
    wx.uploadFile({
      url: "http://" + intranet_ip + ":8080/h5/singleImg?isThumbnail=1&imageId=20170301&deviceId=" + openid + "&box_mac="+box_mac+"&deviceName=" + mobile_brand + "&rotation=90&imageType=1&web=true&forscreen_id=" + forscreen_id + '&forscreen_char=' + forscreen_char + '&filename=' + filename + '&device_model=' + mobile_model + '&resource_size=' + resouce_size + '&action=2&resource_type=1&avatarUrl=' + avatarUrl + "&nickName=" + nickName,
      filePath: img_url,
      name: 'fileUpload',
      success: function (res) {
        var info_rt = JSON.parse(res.data);
        if (info_rt.result == 1001) {
          that.setData({
            wifiErr: { 'is_open': 1, 'msg': '亲，使用此小程序前需要链接包间wifi,链接wifi投屏更快哦！', 'confirm': '重试', 'calcle': '', 'type': 3 }
          })
        }
      },fail: function ({ errMsg }) {
        that.setData({
          wifiErr: { 'is_open': 1, 'msg': '亲，使用此小程序前需要链接包间wifi,链接wifi投屏更快哦！', 'confirm': '重试', 'calcle': '', 'type': 3 }
        })

      },
    });
  },

  exitForscreend: function (res) {
    var that = this;
    openid = res.currentTarget.dataset.openid;
    box_mac = res.currentTarget.dataset.boxmac;
    intranet_ip = res.currentTarget.dataset.intranet_ip;

    wx.request({
      url: "http://" + intranet_ip + ":8080/h5/stop?deviceId=" + openid + "&box_mac="+box_mac+"&web=true",
      success: function (res) {
        console.log(res);
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
            wifiErr: { 'is_open': 1, 'msg': '亲，使用此小程序前需要链接包间wifi,链接wifi投屏更快哦！', 'confirm': '重试', 'calcle': '', 'type': 3 }
          })
        }
        
      },
      fail: function ({ errMsg }) {
        wx.showToast({
          title: '退出失败',
          icon: 'none',
          duration: 2000
        });
        wx.navigateBack({
          delta: 1,
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
      intranet_ip: intranet_ip
    })
  },
  //关闭遥控
  closeControl: function (e) {
    var that = this;
    that.setData({

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
    //app.controlChangeVolume(intranet_ip, openid, change_type);
    console.log(hotel_info);
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
  onUnload: function () {

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