// pages/forscreen/video/launch_video.js
const utils = require('../../../utils/util.js')
var mta = require('../../../utils/mta_analysis.js')
const app = getApp()
var box_mac;
var openid;
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
var pageid  = 31;
var is_hot;
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
    is_share:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    var that = this;
    if(typeof(options.is_share)!='undefined'){
      var is_share = options.is_share
      that.setData({is_share:is_share})
    }
    if (app.globalData.openid && app.globalData.openid != '' && typeof(app.globalData.openid)!='undefined') {
      is_hot = 0;
      if(typeof(options.is_hot)!='undefined'){
        is_hot = options.is_hot;
      }
      
      var user_info = wx.getStorageSync("savor_user_info");
      var res_id     = options.res_id;  //资源id
      var video_url  = options.video_url;
      var video_name = decodeURIComponent(options.video_name);
      box_mac    = options.box_mac;
      openid     = app.globalData.openid
      var filename = options.filename;
      var video_img_url = decodeURIComponent(options.video_img_url);
      that.setData({
        openid    : openid,
        res_id    : res_id,
        video_url : video_url,
        video_name: video_name,
        video_img_url: video_img_url,
        box_mac   : box_mac,
        openid    : openid,
       
        filename  : filename,
      })

      that.getHotplaylist(box_mac,res_id);
      that.getVideoInfo(openid,res_id);
      that.isHaveCallBox(openid);
    }else {
      app.openidCallback = openid => {
        is_hot = 0;
        if(typeof(options.is_hot)!='undefined'){
          is_hot = options.is_hot;
        }
        var res_id     = options.res_id;  //资源id
        var video_url  = options.video_url;
        var video_name = decodeURIComponent(options.video_name);
        box_mac    = options.box_mac;
        var filename = options.filename;
        var video_img_url = decodeURIComponent(options.video_img_url);
        that.setData({
          openid    : openid,
          res_id    : res_id,
          video_url : video_url,
          video_name: video_name,
          video_img_url: video_img_url,
          box_mac   : box_mac,
          openid    : openid,
         
          filename  : filename,
        })

        that.getHotplaylist(box_mac,res_id);
        that.getVideoInfo(openid,res_id);
        that.isHaveCallBox(openid);
        
      }
    }
    
    
    //获取节目单视频详情

    
    
    
    
  },
  getVideoInfo:function(openid,res_id){
    var that = this;
    utils.PostRequest(api_v_url+'/Demand/getVideoInfo', {
      res_id : res_id,
      openid : openid,
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        
        is_collect: data.result.is_collect,
        collect_num: data.result.collect_num,
        share_num : data.result.share_num,
        play_num  : data.result.play_num,
        res_type  : data.result.res_type, 
      
      })
      
    })
  },
  isHaveCallBox:function(openid){
    var that = this;
    utils.PostRequest(api_v_url + '/index/isHaveCallBox', {
      openid:openid
    }, (data, headers, cookies, errMsg, statusCode) => {
      if (data.result.is_have == 1) {//如果已连接盒子
        that.setData({
          
          hotel_info: data.result,
          
        })
      }
    })
  },
  getHotplaylist:function(box_mac='',res_id){//获取热播内容
    var that = this;
    utils.PostRequest(api_v_url + '/content/hotplay', {
      page: 1,
      box_mac:box_mac
    }, (data, headers, cookies, errMsg, statusCode) => {
      var hot_play = data.result.datalist;
      for(var i in hot_play){
        if(res_id==hot_play[i].ads_id){
          hot_play.splice(i,1);
        }
      }
      that.setData({
        hot_play: data.result.datalist
      });
    })
  },
  //收藏资源
  onCollect: function (e) {
    var that = this;
    var openid = e.target.dataset.openid;
    var res_id = e.target.dataset.res_id;
    
    var res_type = e.target.dataset.type;
    utils.PostRequest(api_v_url+'/collect/recLogs', {
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
    utils.PostRequest(api_v_url+'/collect/recLogs', {
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
    var filename = that.data.filename;
    
    if (res.from === 'button' || res.from=='menu') {
      
      // 转发成功
      share_num = share_num++;

      utils.PostRequest(api_v_url+'/share/recLogs', {
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

      if(res_type==5){
        var share_url = '/pages/forscreen/video/launch_video?res_id='+res_id+'&is_hot=2&is_share=1&video_url='+video_url+'&video_name='+video_name+'&box_mac=&filename='+filename+'&video_img_url='+video_img+'';
      }else {
        var share_url = '/pages/share/video?res_id=' + res_id + '&type=3&is_share=true'
      }
      // 来自页面内转发按钮
      return {
        title: video_name,
        path: share_url,
        imageUrl: video_img,
        success: function (res) {
          
        } 
      } 
    }
  },// 分享结束
  //电视播放
  boxShow(e) {
    var that = this;
    var box_mac = e.currentTarget.dataset.boxmac;
    
    if (box_mac == '') {
      wx.showModal({
        title: '提示',
        content: "请使用微信扫电视二维码",
        showCancel: false,
        confirmText:'我知道了'
      })
    } else {
      var openid = e.currentTarget.dataset.openid;
      var vediourl = e.currentTarget.dataset.vediourl;
      var forscreen_char = e.currentTarget.dataset.name;
      var filename = e.currentTarget.dataset.filename;//文件名
      var timestamp = (new Date()).valueOf();
      var mobile_brand = app.globalData.mobile_brand;
      var mobile_model = app.globalData.mobile_model;
      var hotel_info = that.data.hotel_info;

      var res_id = that.data.res_id;
      var res_type = 2;
      if(is_hot==0){
        var action = 5;
      }else {
        var action = 15;
      }
      
      var media_info = {};
      media_info.forscreen_url = "media/resource/"+ filename;
      media_info.filename      = filename;
      media_info.res_id = res_id;
      media_info.resource_size = 0;
      media_info.duration = 0;
      var pubdetail = [];
      pubdetail.push(media_info);
      app.boxShow(box_mac, res_id, pubdetail, res_type, 1, action, hotel_info, self,is_hot);


    }
  },//电视播放结束
  //电视播放
  forscreenBox: function (e) {
    var that = this;
    var forscreen_id = e.currentTarget.dataset.forscreen_id;
    var res_id       = e.currentTarget.dataset.res_id;

    var pubdetail = e.currentTarget.dataset.pubdetail;
    var res_type = e.currentTarget.dataset.res_type;
    var res_nums = e.currentTarget.dataset.res_nums;
    var hotel_info = e.currentTarget.dataset.hotel_info;
    var index = e.currentTarget.dataset.index;
    var type  = e.currentTarget.dataset.type;
    var is_share = that.data.is_share;
    if(type==1){
      if (res_type == 1) {
        var action = 11; //发现图片点播
        var jump_url = '/pages/find/picture?is_share='+is_share+'&box_mac='+box_mac+'&forscreen_id='+forscreen_id+'&is_hot=1&res_id='+res_id;
      } else if (res_type == 2) {
        var action = 12; //发现视频点播
        var jump_url = '/pages/find/video?is_share='+is_share+'&box_mac='+box_mac+'&forscreen_id='+forscreen_id+'&is_hot=1&res_id='+res_id;
      }
      var is_hot = 1;
    }else if(type==2){
      var hot_play = that.data.hot_play;
      var hot_paly_info = hot_play[index];
      var pubdetail = hot_paly_info['pubdetail'];
      var res_id = hot_paly_info.ads_id;
      var video_name= hot_paly_info.title;
      var video_url = pubdetail[0].res_url;
      var filename = pubdetail[0].filename;
      var resource_size = pubdetail[0].resource_size;
      var duration = pubdetail[0].duration;
      var res_nums = 1;
      var res_type = 2;
      var action = 5;
      var img_url = encodeURIComponent(pubdetail[0].img_url);

      var jump_url = '/pages/forscreen/video/launch_video?is_share='+is_share+'&res_id='+res_id+'&video_url='+video_url+'&video_name='+video_name+'&box_mac='+box_mac+'&filename='+filename+'&video_img_url='+img_url;
      
      var media_info = {};
      media_info.forscreen_url = "media/resource/"+ filename;
      media_info.filename      = filename;
      media_info.res_id = res_id;
      media_info.resource_size = resource_size;
      media_info.duration = duration;
      var pubdetail = [];
      pubdetail.push(media_info);
      var is_hot = 0;
    }else if(type==3){
      
      var is_hot = 2;
      if(res_type==1){
        var action = 11; //发现图片点播
        var res_nums = 1;
        var res_id = e.currentTarget.dataset.ads_id;
        var jump_url = '/pages/forscreen/image/launch_image?box_mac='+box_mac+'&is_hot=2&res_id='+res_id+'&is_share='+is_share;
      }else {
        var hot_play = that.data.hot_play;
        var hot_paly_info = hot_play[index];
        var pubdetail = hot_paly_info['pubdetail'];
        var res_id = hot_paly_info.ads_id;
        var video_name= hot_paly_info.title;
        var video_url = pubdetail[0].res_url;
        var filename = pubdetail[0].filename;
        var resource_size = pubdetail[0].resource_size;
        var duration = pubdetail[0].duration;
        var res_nums = 1;
        var res_type = 2;
        var action = 12;
        var img_url = encodeURIComponent(pubdetail[0].img_url);

        var jump_url = '/pages/forscreen/video/launch_video?is_share='+is_share+'&res_id='+res_id+'&video_url='+video_url+'&video_name='+video_name+'&box_mac='+box_mac+'&filename='+filename+'&video_img_url='+img_url+'&is_hot=2';
        
        var media_info = {};
        media_info.forscreen_url = "media/resource/"+ filename;
        media_info.filename      = filename;
        media_info.res_id = res_id;
        media_info.resource_size = resource_size;
        media_info.duration = duration;
        var pubdetail = [];
        pubdetail.push(media_info);
      
      }

    }
    
    if(box_mac!='' && typeof(box_mac)!='undefined'){
      //跳转到详情页
      app.boxShow(box_mac, res_id, pubdetail, res_type, res_nums, action, hotel_info, that,is_hot);
    }
    wx.redirectTo({
      url: jump_url,
    })

  },
  //遥控呼大码
  callQrCode: utils.throttle(function (e) {
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
    var self = this;
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var hotel_info = self.data.hotel_info;
    if (box_mac == '') {
      wx.showModal({
        title: '提示',
        content: "请使用微信扫电视二维码",
        showCancel: false,
        confirmText:'我知道了'
      })
    } else {
      app.controlExitForscreen(openid, box_mac, hotel_info, self);
    }
    
  },
  //遥控调整音量
  changeVolume: function (e) {
    var self = this;
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var change_type = e.currentTarget.dataset.change_type;
    var hotel_info = e.currentTarget.dataset.hotel_info;
    if (box_mac == '') {
      wx.showModal({
        title: '提示',
        content: "请使用微信扫电视二维码",
        showCancel: false,
        confirmText:'我知道了'
      })
    } else {
      app.controlChangeVolume(openid, box_mac, change_type, hotel_info, self);
    }
    

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