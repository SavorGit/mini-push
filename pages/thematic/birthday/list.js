// pages/thematic/birthday/list.js
const utils = require('../../../utils/util.js')
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
    utils.PostRequest(api_v_url+'/constellation/getVideoList', {
      constellation_id: constellid,
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        videolist: data.result
      })
    })
    utils.PostRequest(api_v_url+'/constellation/getConstellationDetail', {
      constellation_id: constellid,
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        constellation_detail: data.result
      })
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
    utils.PostRequest(api_v_url+'/index/happylist', {
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        happylist:data.result
      })
    })
    utils.PostRequest(api_v_url+'/constellation/getConstellationList', {
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        constellationlist:data.result,
        choose_constellid:data.result[0]['id'],
        choose_constellname: data.result[0]['name'],
        choose_constellisnow: 1
      })
      if (that.data.choose_constellid) {
        mta.Event.stat('viewConstellation', { 'name': that.data.choose_constellname })
        that.getContellDetail(that.data.choose_constellid)
      }
    })
    

    //红包送祝福开关

    utils.PostRequest(api_v_url+'/Redpacket/getConfig', {
      type:1
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        is_open_red_packet: data.result.is_open_red_packet
      })
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
    var source = e.currentTarget.dataset.source
    var rname = e.currentTarget.dataset.name;
    
    var forscreen_char = 'Happy Birthday';
    var index1 = vediourl.lastIndexOf("/");
    var index2 = vediourl.length;
    var filename = vediourl.substring(index1 + 1, index2);//后缀名


    var timestamp = (new Date()).valueOf();
    var mobile_brand = app.globalData.mobile_brand;
    var mobile_model = app.globalData.mobile_model;
    utils.PostRequest(api_v_url + '/User/isForscreenIng', {
      box_mac: box_mac 
    }, (data, headers, cookies, errMsg, statusCode) => {
      var is_forscreen = data.result.is_forscreen;
        if (is_forscreen == 1) {
          wx.showModal({
            title: '确认要打断投屏',
            content: '当前电视正在进行投屏,继续投屏有可能打断当前投屏中的内容.',
            success: function (res) {
              if (res.confirm) {
                mta.Event.stat('breakForscreen', { 'isbreak':1 })

                utils.PostRequest(api_url + '/Netty/Index/pushnetty', {
                  box_mac: box_mac,
                  msg: '{ "action": 6,"url":"' + vediourl + '","filename":"' + filename + '","forscreen_id":"' + timestamp + '","resource_type":2,"openid":"'+openid+'","serial_number":"'+app.globalData.serial_number+'"}',
                }, (data, headers, cookies, errMsg, statusCode) => {
                  wx.showToast({
                    title: '点播成功,电视即将开始播放',
                    icon: 'none',
                    duration: 5000
                  });
                  utils.PostRequest(api_v_url + '/index/recordForScreenPics', {
                    forscreen_id: timestamp,
                    openid: openid,
                    box_mac: box_mac,
                    action: 5,
                    mobile_brand: mobile_brand,
                    mobile_model: mobile_model,
                    forscreen_char: forscreen_char,
                    imgs: '["media/resource/' + filename + '"]',
                    serial_number:app.globalData.serial_number
                  }, (data, headers, cookies, errMsg, statusCode) => {

                  })
                  
                })
              } else {
                mta.Event.stat('breakForscreen', { 'isbreak': 0 })
              }
            }
          })
        } else {
          utils.PostRequest(api_url + '/Netty/Index/pushnetty', {
            box_mac: box_mac,
            msg: '{ "action": 6,"url":"' + vediourl + '","filename":"' + filename + '","forscreen_id":"' + timestamp + '","resource_type":2,"openid":"'+openid+'","serial_number":"'+app.globalData.serial_number+'"}',
          }, (data, headers, cookies, errMsg, statusCode) => {
            wx.showToast({
              title: '点播成功,电视即将开始播放',
              icon: 'none',
              duration: 5000
            });
            utils.PostRequest(api_v_url + '/index/recordForScreenPics', {
              forscreen_id: timestamp,
                openid: openid,
                box_mac: box_mac,
                action: 5,
                mobile_brand: mobile_brand,
                mobile_model: mobile_model,
                forscreen_char: forscreen_char,
                imgs: '["media/resource/' + filename + '"]',
                serial_number:app.globalData.serial_number
            }, (data, headers, cookies, errMsg, statusCode) => {

            },res=>{},{ isShowLoading: false })
            
          },res=>{},{ isShowLoading: false })
          
        }

    },res=>{},{ isShowLoading: false })
    
    
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
    
    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    mta.Event.stat("clickonwxauth", {})
    if (res.detail.errMsg == 'getUserInfo:ok') {
      wx.getUserInfo({
        success(rets) {
          utils.PostRequest(api_v_url+'/User/registerCom', {
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
            wx.navigateTo({
              url: '/pages/thematic/money_blessing/main?openid=' + openid + '&box_mac=' + box_mac,
            })
          },res=>{},{ isShowLoading: false })
          
        }
      })
      mta.Event.stat("allowauth", {})
    }else {
      utils.PostRequest(api_v_url+'/User/refuseRegister', {
        'openid': openid,
      }, (data, headers, cookies, errMsg, statusCode) => {
        user_info['is_wx_auth'] = 1;
        wx.setStorage({
          key: 'savor_user_info',
          data: user_info,
        })
      },res=>{},{ isShowLoading: false })
      
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
    utils.PostRequest(api_v_url+'/index/closeauthLog', {
      openid: openid,
      box_mac: box_mac,
    }, (data, headers, cookies, errMsg, statusCode) => {

    },res=>{},{ isShowLoading: false })
    
    mta.Event.stat("closewxauth", {})
  },


  //遥控呼大码
  callQrCode: utils.throttle(function (e) {
    var that = this;
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var qrcode_img = e.currentTarget.dataset.qrcode_img;
    app.controlCallQrcode(openid, box_mac, qrcode_img, '', that);
  }, 3000),//呼大码结束
  //打开遥控器
  openControl: function (e) {
    var that = this;
    var qrcode_url = api_v_url+'/index/getBoxQr?box_mac=' + box_mac + '&type=3';
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
    app.controlExitForscreen(openid, box_mac, '', that);
  },
  //遥控调整音量
  changeVolume: function (e) {
    var that = this;
    box_mac = e.currentTarget.dataset.box_mac;
    openid = e.currentTarget.dataset.openid;
    var change_type = e.currentTarget.dataset.change_type;
    app.controlChangeVolume(openid, box_mac, change_type, '', that);
  },
  //遥控切换节目
  changeProgram: function (e) {
    var that = this;
    box_mac = e.currentTarget.dataset.box_mac;
    openid = e.currentTarget.dataset.openid;
    var change_type = e.currentTarget.dataset.change_type;
    app.controlChangeProgram(openid, box_mac, change_type, '', that);
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