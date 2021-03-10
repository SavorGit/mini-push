// pages/find/video.js
const app = getApp();
const utils = require('../../utils/util.js')
var mta = require('../../utils/mta_analysis.js')
var pubdetail;
var box_mac;
var openid;
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
var pageid = 22;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    pageFrom: null, // 来源页面地址
    link_type: app.globalData.link_type, //1:外网投屏  2：直连投屏
    is_replay_disabel: true,
    showControl: false,
    is_box_show: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var self = this;
    var is_hot = 0;
    var res_id = 0;
    if(typeof(options.res_id)!='undefined'){
      res_id = options.res_id;
    }
    if(typeof(options.is_hot)!='undefined'){
      var is_hot = options.is_hot;
    }
    let pages = getCurrentPages(); //当前页面栈
    if (pages.length > 1) {
      self.setData({
        pageFrom: pages[1].route
      });
    } else {
      self.setData({
        pageFrom: ''
      });
    }

    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    box_mac = options.box_mac;

    //wx.hideShareMenu();
    var forscreen_id = options.forscreen_id;

    utils.PostRequest(api_v_url + '/index/isHaveCallBox', {
      openid:openid
    }, (data, headers, cookies, errMsg, statusCode) => {
      if (data.result.is_have == 1) {//如果已连接盒子
        self.setData({
          
          hotel_info: data.result,
          
        })
      }
    })
    utils.PostRequest(api_v_url + '/Find/showPic', {
      forscreen_id: forscreen_id,
        openid: openid,
        res_id:res_id,
    }, (data, headers, cookies, errMsg, statusCode) => {
      self.setData({
        forscreen_id:forscreen_id,
        videoinfo: data.result,
        play_num: data.result.play_num,
        collect_num: data.result.collect_num,
        share_num: data.result.share_num,
        is_collect: data.result.is_collect,
        openid: openid,
        box_mac: box_mac,
        is_replay_disabel:false,
        is_hot:is_hot
      })
    })
    
    
  },
  //收藏资源
  onCollect: function(e) {
    var self = this;
    var openid = e.target.dataset.openid;
    var res_id = e.target.dataset.res_id;

    var res_type = e.target.dataset.type;
    utils.tryCatch(mta.Event.stat('FindVideo_VideoDetail_Favorite', {
      'openid': openid,
      'from': self.data.pageFrom,
      'status': true
    }));

    utils.PostRequest(api_v_url + '/collect/recLogs', {
      'openid': openid,
      'res_id': res_id,
      'type': res_type,
      'status': 1,
    }, (data, headers, cookies, errMsg, statusCode) => {
      self.setData({
        is_collect: 1,
        collect_num: data.result.nums,
      })
    },res=>{
      app.showToast('网络异常，请稍后重试');
    })

    
  }, //收藏资源结束
  //取消收藏
  cancCollect: function(e) {
    var self = this;
    var openid = e.target.dataset.openid;
    var res_id = e.target.dataset.res_id;

    var res_type = e.target.dataset.type;
    utils.tryCatch(mta.Event.stat('FindVideo_VideoDetail_Favorite', {
      'openid': openid,
      'from': self.data.pageFrom,
      'status': false
    }));
    utils.PostRequest(api_v_url + '/collect/recLogs', {
      'openid': openid,
      'res_id': res_id,
      'type': res_type,
      'status': 0,
    }, (data, headers, cookies, errMsg, statusCode) => {
      self.setData({
        is_collect: 0,
        collect_num: data.result.nums,
      })
    },res=>{
      app.showToast('网络异常，请稍后重试')
    })

    
  }, //取消收藏结束
  //点击分享按钮
  onShareAppMessage: function(res) {
    console.log(res)
    var self = this;
    var openid = self.data.openid;
    var videoinfo = self.data.videoinfo;

    var res_id = videoinfo.forscreen_id;

    var res_type = 2;
    var pubdetail = videoinfo.pubdetail;
    var img_url = pubdetail[0]['vide_img'];

    var share_num = self.data.share_num;

    utils.tryCatch(mta.Event.stat('FindVideo_VideoDetail_Share', {
      'openid': openid,
      'from': self.data.pageFrom
    }));
    if (res.from === 'button' || res.from=='menu') {
      // 转发成功
      share_num = share_num++;
      utils.PostRequest(api_v_url + '/share/recLogs', {
        'openid': openid,
        'res_id': res_id,
        'type': res_type,
        'status': 1,
      }, (data, headers, cookies, errMsg, statusCode) => {
        self.setData({
          share_num: data.result.share_nums,
        })
      },res=>{
        app.showToast('网络异常，请稍后重试');
      })

      
      //var share_url = '/pages/share/pic?forscreen_id=' + res_id;
      // 来自页面内转发按钮
      return {
        title: '发现一个好玩的东西',
        path: '/pages/share/video?res_id=' + res_id + '&type=2',
        imageUrl: img_url,
        success: function(res) {

        }
      }
    }
  }, // 分享结束

  onVideoPlay: function(e) {
    var self = this;
    utils.tryCatch(mta.Event.stat('FindVideo_VideoDetail_Play', {
      'openid': openid,
      'from': self.data.pageFrom
    }));
  },

  //电视播放
  boxShow(e) {
    var self = this;
    var box_mac = e.target.dataset.boxmac;
    var find_id = e.target.dataset.forscreen_id

    utils.tryCatch(mta.Event.stat('FindVideo_VideoDetail_LaunchTV', {
      'openid': openid,
      'from': self.data.pageFrom,
      'boxmac': box_mac
    }));
    if (box_mac == '') {
      app.scanQrcode(pageid);
    } else {
      var user_info = wx.getStorageSync("savor_user_info");
      //console.log(user_info);
      var forscreen_id = self.data.forscreen_id;
      var avatarUrl = user_info.avatarUrl;
      var nickName = user_info.nickName;
      var openid = e.currentTarget.dataset.openid;
      pubdetail = e.currentTarget.dataset.pubdetail;
      var forscreen_char = '';
      var res_type = e.currentTarget.dataset.res_type;
      var mobile_brand = app.globalData.mobile_brand;
      var mobile_model = app.globalData.mobile_model;
      var res_len = e.currentTarget.dataset.res_nums;
      if (res_type == 1) {
        var action = 11; //发现图片点播
      } else if (res_type == 2) {
        var action = 12; //发现视频点播
      }
      var hotel_info = self.data.hotel_info;
      var is_hot = self.data.is_hot;
      app.boxShow(box_mac, find_id, pubdetail, res_type, res_len, action, hotel_info, self,is_hot);

      

      
      
      


    }
  }, //电视播放结束
  //遥控呼大码
  callQrCode: utils.throttle(function(e) {
    var self = this;
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var qrcode_img = e.currentTarget.dataset.qrcode_img;
    var hotel_info = e.currentTarget.dataset.hotel_info;
    app.controlCallQrcode(openid, box_mac, qrcode_img, '', self);
  }, 3000), //呼大码结束
  //打开遥控器
  openControl: function(e) {
    var self = this;
    var qrcode_url = api_v_url + '/index/getBoxQr?box_mac=' + box_mac + '&type=3';
    self.setData({

      showControl: true,
      qrcode_img: qrcode_url
    })
    mta.Event.stat('openControl', {
      'linktype': app.globalData.link_type
    })
  },
  //关闭遥控
  closeControl: function(e) {
    var self = this;
    self.setData({

      showControl: false,
    })
    mta.Event.stat("closecontrol", {})
  },
  //遥控退出投屏
  exitForscreen: function(e) {
    var self = this;
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var hotel_info = e.currentTarget.dataset.hotel_info;
    app.controlExitForscreen(openid, box_mac, '', self);
  },
  //遥控调整音量
  changeVolume: function(e) {
    var self = this;
    box_mac = e.currentTarget.dataset.box_mac;
    var change_type = e.currentTarget.dataset.change_type;
    var hotel_info = e.currentTarget.dataset.hotel_info;
    app.controlChangeVolume(openid, box_mac, change_type, '', self);

  },
  //遥控切换节目
  changeProgram: function(e) {
    var self = this;
    box_mac = e.currentTarget.dataset.box_mac;
    var change_type = e.currentTarget.dataset.change_type;
    var hotel_info = e.currentTarget.dataset.hotel_info;
    app.controlChangeProgram(openid, box_mac, change_type, '', self);
  },
  modalConfirm: function(e) {
    console.log(e);
    var self = this;
    var hotel_info = e.target.dataset.hotel_info;
    app.linkHotelWifi(hotel_info, self);
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
  goToBack: function(e) {
    app.goToBack();
  }
})