// pages/forscreen/history/list.js
const utils = require('../../../utils/util.js')
var mta = require('../../../utils/mta_analysis.js')
const app = getApp();
var openid;
var box_mac = '';
var page ;
var forscreen_history_list;
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
var pubdetail = [];
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    forscreen_history_list: '',
    hiddens: true, //上拉加载中
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //wx.hideShareMenu();
    page = 1;
    var self = this;
    openid = options.openid;
    box_mac = options.box_mac;
    self.setData({
      openid: openid,
      box_mac: box_mac
    })
    //获取投屏历史
    utils.PostRequest(api_v_url + '/ForscreenHistory/getList', {
      openid: openid,
      box_mac: box_mac,
      page: page,
      type:1,
    }, (data, headers, cookies, errMsg, statusCode) => {
      var hst_list = data.result;

        if (JSON.stringify(hst_list) == "{}") {
          self.setData({
            forscreen_history_list: ''
          })
        } else {
          self.setData({
            forscreen_history_list: data.result
          })
        }
      
    })
    
    
  },
  replayHistory: function(e) {
    var self = this;
    
    
    
    

    var box_mac = e.target.dataset.box_mac;
    var action = 8; //重新播放
    var forscreen_id = (new Date()).valueOf(); //投屏id
    var res_type = e.target.dataset.res_type;
    var res_list = e.target.dataset.historylist;
    var res_nums = res_list.length;
    pubdetail = []
    for(var i=0;i<res_nums;i++){
      var tmp = {forscreen_url:'',res_id:'',filename:'',resource_size:'',duration:0,quality_type:''};
      tmp.forscreen_url = res_list[i].forscreen_url;
      tmp.res_id        = res_list[i].resource_id;
      tmp.filename      = res_list[i].filename;
      tmp.resource_size = res_list[i].resource_size;
      tmp.quality_type  = res_list[i].quality_type;
      tmp.duration      = 0;
      pubdetail[i] = tmp;
    }
    app.boxShow(box_mac, forscreen_id, pubdetail, res_type, res_nums, action, '', self);
    
    if (res_type == 1) {
      utils.tryCatch(mta.Event.stat('LaunchHistory_Picture_LaunchTV', {
        'openid': self.data.openid
      }));
    } else {
      utils.tryCatch(mta.Event.stat('LaunchHistory_Video_LaunchTV', {
        'openid': self.data.openid
      }));
    }


  },
  previewImage: function(e) {
    var self = this;
    var current = e.target.dataset.src;
    var pkey = e.target.dataset.pkey;
    var urls = [];
    for (var row in current) {
      urls[row] = current[row]['res_url']
    }
    //console.log(pkey);
    wx.previewImage({
      current: urls[pkey], // 当前显示图片的http链接
      urls: urls, // 需要预览的图片http链接列表
      success: function(res) {
        utils.tryCatch(mta.Event.stat('LaunchHistory_Picture_PreviewImage', {
          'openid': self.data.openid,
          'status': 'success'
        }));
      },
      fail: function(e) {
        utils.tryCatch(mta.Event.stat('LaunchHistory_Picture_PreviewImage', {
          'openid': self.data.openid,
          'status': 'fail'
        }));
      }
    })
  },
  onVideoPlay: function(e) {
    var self = this;
    utils.tryCatch(mta.Event.stat('LaunchHistory_Video_Play', {
      'openid': self.data.openid
    }));
  },
  onVideoPause: function(e) {
    var self = this;
    utils.tryCatch(mta.Event.stat('LaunchHistory_Video_Pause', {
      'openid': self.data.openid
    }));
  },
  onFullScreenChange: function(e) {
    var self = this;
    utils.tryCatch(mta.Event.stat('LaunchHistory_Video_FullScreen', {
      'openid': self.data.openid,
      'fullscreen': e.detail.fullScreen
    }));
  },
  //上拉刷新
  loadMore: function(e) {
    var self = this;
    var openid = e.target.dataset.openid;
    var box_mac = e.target.dataset.box_mac;
    page = page + 1;
    

    utils.PostRequest(api_v_url + '/ForscreenHistory/getList', {
      page: page,
      box_mac: box_mac,
      openid: openid,
      type:1,
    }, (data, headers, cookies, errMsg, statusCode) => {
        var hst_list = data.result;

        if (JSON.stringify(hst_list) == "{}") {
          self.setData({
            forscreen_history_list: ''
          })
        } else {
          self.setData({
            forscreen_history_list: data.result
          })
        }
      
    })
    
  },
  //遥控呼大码
  callQrCode: utils.throttle(function(e) {
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var qrcode_img = e.currentTarget.dataset.qrcode_img;
    app.controlCallQrcode(openid, box_mac, qrcode_img);
  }, 3000), //呼大码结束
  //打开遥控器
  openControl: function(e) {
    var self = this;
    var qrcode_url = api_url + '/Smallapp4/index/getBoxQr?box_mac=' + box_mac + '&type=3';
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
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    app.controlExitForscreen(openid, box_mac);
  },
  //遥控调整音量
  changeVolume: function(e) {
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var change_type = e.currentTarget.dataset.change_type;
    app.controlChangeVolume(openid, box_mac, change_type);

  },
  //遥控切换节目
  changeProgram: function(e) {
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var change_type = e.currentTarget.dataset.change_type;
    app.controlChangeProgram(openid, box_mac, change_type);
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  goToBack: function(e) {
    app.goToBack();
  }
})