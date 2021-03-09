// pages/forscreen/video/launch_video.js
const util = require('../../../utils/util.js')
var mta = require('../../../utils/mta_analysis.js')
const app = getApp()
var box_mac;
var openid;
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
var pageid  = 31;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    video_url:'',
    video_name:'',
    is_replay_disabel:false,
    showControl: false,   //显示授权登陆弹窗,
    is_box_show:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    var that = this;
    var user_info = wx.getStorageSync("savor_user_info");
    var res_id     = options.res_id;  //资源id
    var video_url  = options.video_url;
    var video_name = decodeURIComponent(options.video_name);
    box_mac    = options.box_mac;
    openid = user_info.openid;
    var filename = options.filename;
    var video_img_url = decodeURIComponent(options.video_img_url);
    //wx.hideShareMenu();

    

    var that = this;
    //获取节目单视频详情

    util.PostRequest(api_v_url+'/Demand/getVideoInfo', {
      res_id : res_id,
      openid : openid,
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        openid    : openid,
        res_id    : res_id,
        video_url : video_url,
        video_name: video_name,
        video_img_url: video_img_url,
        box_mac   : box_mac,
        openid    : openid,
        is_collect: data.result.is_collect,
        collect_num: data.result.collect_num,
        share_num : data.result.share_num,
        play_num  : data.result.play_num,
        res_type  : data.result.res_type, 
        filename  : filename,
      })
      
    })
    
    
    
  },
  //收藏资源
  onCollect: function (e) {
    var that = this;
    var openid = e.target.dataset.openid;
    var res_id = e.target.dataset.res_id;
    
    var res_type = e.target.dataset.type;
    util.PostRequest(api_v_url+'/collect/recLogs', {
      'openid': openid,
      'res_id': res_id,
      'type': res_type,
      'status': 1,
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        is_collect:1,
        collect_num:data.result.nums,
      })
    },res=>{
      app.showToast('网络异常，请稍后重试')
      
    })

    
  },//收藏资源结束
  //取消收藏
  cancCollect: function (e) {
    var that = this;
    var openid = e.target.dataset.openid;
    var res_id = e.target.dataset.res_id;
    
    var res_type = e.target.dataset.type;
    util.PostRequest(api_v_url+'/collect/recLogs', {
      'openid': openid,
      'res_id': res_id,
      'type': res_type,
      'status': 0,
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        is_collect: 0,
        collect_num: data.result.nums,
      })
    },res=>{
      app.showToast('网络异常，请稍后重试')
    })

    
  },//取消收藏结束
  //点击分享按钮
  onShareAppMessage: function (res) {
    console.log(res)
    var that = this;
    var openid = that.data.openid;
    var res_id = that.data.res_id;
    
    var res_type = that.data.res_type;
    var video_url = that.data.video_url;
    var video_name = that.data.video_name;
    var video_img = that.data.video_img_url;
    var share_num = that.data.share_num;
    
    if (res.from === 'button' || res.from=='menu') {
      
      // 转发成功
      share_num = share_num++;

      util.PostRequest(api_v_url+'/share/recLogs', {
        'openid': openid,
        'res_id': res_id,
        'type': res_type,
        'status': 1,
      }, (data, headers, cookies, errMsg, statusCode) => {
        that.setData({
          share_num: data.result.share_nums,
        })
      },res=>{
        app.showToast('网络异常，请稍后重试');
      })

      
      // 来自页面内转发按钮
      return {
        title: video_name,
        path: '/pages/share/video?res_id=' + res_id + '&type=3',
        imageUrl: video_img,
        success: function (res) {
          
        } 
      } 
    }
  },// 分享结束
  //电视播放
  boxShow(e) {
    var that = this;
    var box_mac = e.target.dataset.boxmac;
    
    if (box_mac == '') {
      app.scanQrcode(pageid);
    } else {
      var openid = e.currentTarget.dataset.openid;
      var vediourl = e.currentTarget.dataset.vediourl;
      var forscreen_char = e.currentTarget.dataset.name;
      var filename = e.currentTarget.dataset.filename;//文件名
      var timestamp = (new Date()).valueOf();
      var mobile_brand = app.globalData.mobile_brand;
      var mobile_model = app.globalData.mobile_model;


      var res_id = that.data.res_id;
      var res_type = 2;
      var action = 5;
      var media_info = {};
      media_info.forscreen_url = "media/resource/"+ filename;
      media_info.filename      = filename;
      media_info.res_id = res_id;
      media_info.resource_size = 0;
      media_info.duration = 0;
      var pubdetail = [];
      pubdetail.push(media_info);
      app.boxShow(box_mac, res_id, pubdetail, res_type, 1, action, '', self);


    }
  },//电视播放结束
  //遥控呼大码
  callQrCode: util.throttle(function (e) {
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var qrcode_img = e.currentTarget.dataset.qrcode_img;
    app.controlCallQrcode(openid, box_mac, qrcode_img);
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
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    app.controlExitForscreen(openid, box_mac);
  },
  //遥控调整音量
  changeVolume: function (e) {
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var change_type = e.currentTarget.dataset.change_type;
    app.controlChangeVolume(openid,box_mac, change_type);

  },
  //遥控切换节目
  changeProgram: function (e) {
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var change_type = e.currentTarget.dataset.change_type;
    app.controlChangeProgram(openid,box_mac, change_type);
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

  
})