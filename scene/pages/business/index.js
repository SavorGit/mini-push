// scene/pages/business/index.js
/**
 * 【场景】商务宴请 - 首页
 */


const utils = require('../../../utils/util.js')
var mta = require('../../../utils/mta_analysis.js')
const app = getApp()
var cache_key = app.globalData.cache_key;
var api_v_url = app.globalData.api_v_url;
var api_url   = app.globalData.api_url;
var openid;
var box_mac;
var mobile_brand = app.globalData.mobile_brand;
var mobile_model = app.globalData.mobile_model;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    SystemInfo: getApp().SystemInfo,
    oss_url:app.globalData.oss_url,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu({})
    openid  = options.openid;
    box_mac = options.box_mac;
    var hotel_name = options.hotel_name;
    var room_name  = options.room_name;
    var is_compress = options.is_compress;
    this.setData({'hotel_name':hotel_name,'room_name':room_name,is_compress:is_compress})
  },
  /**
   * 获取商务功能数据
   */
  getBussnessInfo:function(openid,box_mac){
    var that = this;
    utils.PostRequest(api_v_url + '/Businessdinners/moduleList', {
      openid:openid,
      box_mac:box_mac,
    }, (data, headers, cookies, errMsg, statusCode) =>{
      var card_info = data.result.card;
      if(JSON.stringify(card_info) == "{}"){
        that.setData({is_have_card:false})
      }else {
        that.setData({is_have_card:true,card_info:card_info})
      }
      var welcome_info = data.result.welcome;
      if(JSON.stringify(welcome_info) == "{}"){
        that.setData({is_have_welcome:false})
      }else {
        that.setData({is_have_welcome:true,welcome_info:welcome_info})
      }
      var share_file_num = data.result.share_file_num;

      var share_file = data.result.share_file;
      if(share_file_num>0){
        that.setData({is_have_sharefile:true,'share_file':share_file})
      }else {
        that.setData({is_have_sharefile:false})
      }


      var images = data.result.images;
      var images_num = data.result.images_num;
      var videos = data.result.videos;
      var videos_num = data.result.videos_num
      var forscreen_file = data.result.forscreen_file;
      var forscreen_file_num = data.result.forscreen_file_num;

      that.setData({
        images:images,
        images_num:images_num,
        videos:videos,
        videos_num:videos_num,
        forscreen_file:forscreen_file,
        forscreen_file_num:forscreen_file_num
      })
    })
  },

  forImages:function(e){
    wx.navigateTo({
      url: '/pages/forscreen/forimages/index?box_mac=' + box_mac + '&openid=' + openid ,
    })
    mta.Event.stat('besForscreenImage',{'openid':openid,'boxmac':box_mac})
  },
  forVideo:function(e){
    var is_compress = this.data.is_compress;
    wx.navigateTo({
      url: '/pages/forscreen/forvideo/index?box_mac=' + box_mac + '&openid=' + openid +'&is_compress='+is_compress,
    })
    mta.Event.stat('besForscreenVideo',{'openid':openid,'boxmac':box_mac})
  },
  forfiles: function (e) {
    var that = this;
  
    //微信好友文件投屏+h5文件投屏
    if(app.globalData.sys_info.platform=='android'){
      that.setData({showMe: true,})
    }else {
      var version = app.globalData.sys_info.version
      if(app.compareVersion(version,'7.0.18')){
        that.setData({showMe: true,})
      }else {
       
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
    mta.Event.stat('besForscreenShareFile',{'openid':openid,'boxmac':box_mac})
  },
  //微信好友文件
  wxFriendfiles: function (e) {
    var that = this;
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
  /**
   * 编辑/添加名片
   */
  gotoCard:function(e){
    wx.navigateTo({
      url: '/scene/pages/business/card/add?openid='+openid+'&box_mac='+box_mac,
    })
    mta.Event.stat('clickAddCard',{'openid':openid,'boxmac':box_mac})
  },
 
  /**
   * 添加/编辑欢迎词
   */
  gotoWelcome:function(e){
    var pageTitle = e.currentTarget.dataset.page_title;
    var is_have_welcome = this.data.is_have_welcome;
    if(is_have_welcome){
      var welcome_id = this.data.welcome_info.welcome_id;
    }else {
      var welcome_id = 0 ;
      
    }
    wx.navigateTo({
      url: '/scene/pages/welcome/add?openid='+openid+'&box_mac='+box_mac+'&type=3&welcome_id='+welcome_id+'&pageTitle='+pageTitle,
    })
    mta.Event.stat('clickAddWelcome',{'openid':openid,'boxmac':box_mac,'typeid':1})
  },
  
  /**
   * 添加/编辑分享文件
   */
  gotoShareFiles:function(e){
    wx.navigateTo({
      url: '/scene/pages/business/files/sharefile?openid='+openid+'&box_mac='+box_mac+'&type=1',
    })
    mta.Event.stat('clickAddShareFile',{'openid':openid,'boxmac':box_mac})
    
  },
  gotoGift:function(e){
    wx.navigateTo({
      url: '/scene/pages/gift/list?openid='+openid+'&box_mac='+box_mac,
    })
    mta.Event.stat('clickSendGift',{'openid':openid,'boxmac':box_mac,'typeid':1})
  },
  gotoRedPack:function(e){
    wx.navigateTo({
      url: '/pages/thematic/money_blessing/packing?openid='+openid+'&box_mac='+box_mac+'&type=4',
    })
    mta.Event.stat('clickSendRedPack',{'openid':openid,'boxmac':box_mac,'typeid':1})
    
  },
  //分享名片到电视
  forscreenCard:function(e){
    var that = this;
    utils.PostRequest(api_v_url + '/Businessdinners/shareCardOnTv', {
      openid:openid,
      box_mac:box_mac,
    }, (data, headers, cookies, errMsg, statusCode) =>{
      app.showToast('投屏成功',2000,'success')
    })
    var card_info = that.data.card_info;
    var forscreen_id =(new Date()).valueOf();
    utils.PostRequest(api_v_url + '/index/recordForScreenPics', {
      forscreen_id: forscreen_id,
      openid: openid,
      box_mac: box_mac,
      action: 45,
      mobile_brand: mobile_brand,
      mobile_model: mobile_model,
      forscreen_char: '',
      imgs: '["'+card_info.qrcode_img_path+'"]',
      res_sup_time: 0,
      res_eup_time: 0,
      resource_type: 1,
      res_nums: 1,
      serial_number:app.globalData.serial_number
    }, (data, headers, cookies, errMsg, statusCode) => {
    },res=>{},{ isShowLoading: false })
    mta.Event.stat('forscreenCard',{'openid':openid,'boxmac':box_mac})
  },
  forscreenWelcome:function(e){
    var that = this;
    var welcome_info = that.data.welcome_info;
    utils.PostRequest(api_v_url + '/Welcome/demandplay', {
      openid:openid,
      box_mac:box_mac,
      welcome_id:welcome_info.welcome_id
    }, (data, headers, cookies, errMsg, statusCode) =>{
      app.showToast('投屏成功',2000,'success')
    })
    var forscreen_id =(new Date()).valueOf();
    var image_list = welcome_info.images;
    var image_str ='';
    var space  = '';
    for(let i in image_list){
      image_str +=space +'"'+image_list[i]+'"';
      space = ',';
    }
    utils.PostRequest(api_v_url + '/index/recordForScreenPics', {
      forscreen_id: forscreen_id,
      openid: openid,
      box_mac: box_mac,
      action: 42,
      mobile_brand: mobile_brand,
      mobile_model: mobile_model,
      forscreen_char: welcome_info.content,
      imgs: '['+image_str+']',
      res_sup_time: 0,
      res_eup_time: 0,
      resource_type: 1,
      res_nums: image_list.length,
      serial_number:app.globalData.serial_number
    }, (data, headers, cookies, errMsg, statusCode) => {
    },res=>{},{ isShowLoading: false })
    mta.Event.stat('forscreenWelcome',{'openid':openid,'boxmac':box_mac,'typeid':1})
  },
  /**
   * 投屏分享文件
   */
  forscreenShareFile:function(e){
    var file_id = e.currentTarget.dataset.file_id;
    var file_path= e.currentTarget.dataset.file_path;
    utils.PostRequest(api_v_url + '/file/shareFileOnTv', {
      openid:openid,
      file_id:file_id
    }, (data, headers, cookies, errMsg, statusCode) =>{
      app.showToast('投屏成功',2000,'success')
    })
    //记录投屏历史
    var forscreen_id =(new Date()).valueOf();
    utils.PostRequest(api_v_url + '/index/recordForScreenPics', {
      forscreen_id: forscreen_id,
      openid: openid,
      box_mac: box_mac,
      action: 44,
      mobile_brand: mobile_brand,
      mobile_model: mobile_model,
      forscreen_char: '',
      imgs: '["'+file_path+'"]',
      res_sup_time: 0,
      res_eup_time: 0,
      resource_type: 3,
      serial_number:app.globalData.serial_number
    }, (data, headers, cookies, errMsg, statusCode) => {
    },res=>{},{ isShowLoading: false })
    mta.Event.stat('forscreenShareFile',{'openid':openid,'boxmac':box_mac})
  },
  gotoForFiles:function(e){
    var that = this;
    wx.navigateTo({
      url: '/scene/pages/forscreen/forfile?openid='+openid+'&box_mac='+box_mac+'&scene_type=2',
    })
  },
  gotoForImages:function(e){
    wx.navigateTo({
      url: '/scene/pages/forscreen/forimages?openid='+openid+'&box_mac='+box_mac+'&scene_type=4',
    })
  },
  gotoForVideo:function(e){
    wx.navigateTo({
      url: '/scene/pages/forscreen/forvideo?openid='+openid+'&box_mac='+box_mac+'&scene_type=3',
    })
  },
  forscreenFile:function(e){
    var file_id = e.currentTarget.dataset.file_id;
    console.log('/pages/forscreen/forfile?file_id='+file_id+'&openid='+openid+'&box_mac='+box_mac)
    wx.navigateTo({
      url: '/pages/forscreen/forfile/files?file_id='+file_id+'&openid='+openid+'&box_mac='+box_mac,
    })
  },
  forscreenImage:function(e){
    var that = this;
    var keys = e.currentTarget.dataset.keys;
    var images = that.data.images;
    
    //return false;
    var user_info = wx.getStorageSync(cache_key+'user_info');
    var forscreen_id =(new Date()).valueOf();
    var netty_info = {};
    netty_info.action = 4;
    netty_info.resource_type = 1;
    netty_info.forscreen_id = forscreen_id;
    netty_info.res_sup_time = forscreen_id;
    netty_info.res_eup_time = forscreen_id;
    netty_info.openid = openid;
    netty_info.forscreen_char = '';
    netty_info.avatarUrl = user_info.avatarUrl;
    netty_info.nickName  = user_info.nickName;
    netty_info.serial_number = app.globalData.serial_number;

    var img_info = {};
    var img_list = [];
    img_info.url = images[keys].file_path;
    img_info.filename = images[keys].name;
    img_info.order    = 0;
    img_info.img_id   = images[keys].img_id;
    img_info.resource_size = images[keys].resource_size;
    img_list.push(img_info);
    netty_info.img_list = img_list;
    netty_info = JSON.stringify(netty_info);
    console.log(netty_info);
    utils.PostRequest(api_url + '/Netty/Index/pushnetty', {
      box_mac: box_mac,
      msg: netty_info,
    }, (data, headers, cookies, errMsg, statusCode) => {
      app.showToast('投屏成功',2000,'success')
      var action = 46;
      var imgs = '["'+images[keys].file_path+'"]';
      var quality_type = 3;
      var resource_id = images[keys].img_id;
      var resource_size  =img_info.resource_size;
      var resource_type = 1;
      that.recordForscreen(forscreen_id,action,imgs,quality_type,resource_id,resource_size,resource_type);
    })

  },
  forscreenVideo:function(e){
    var that = this;
    var keys = e.currentTarget.dataset.keys;
    var videos = that.data.videos;
    console.log(videos);

    var user_info = wx.getStorageSync(cache_key+'user_info');
    var forscreen_id =(new Date()).valueOf();
    var netty_info = {};
    
    netty_info.action = 2;
    netty_info.url = videos[keys].file_path;
    netty_info.filename = videos[keys].name;
    netty_info.openid   = openid;
    netty_info.resource_type = 2;
    netty_info.video_id = videos[keys].video_id;
    netty_info.avatarUrl = user_info.avatarUrl;
    netty_info.nickName = user_info.nickName;
    netty_info.forscreen_id = forscreen_id;
    netty_info.res_sup_time = forscreen_id;
    netty_info.res_eup_time = forscreen_id;
    netty_info.resource_size = videos[keys].resource_size;
    netty_info.serial_number = app.globalData.serial_number;
    netty_info = JSON.stringify(netty_info);
    utils.PostRequest(api_url + '/Netty/Index/pushnetty', {
      box_mac: box_mac,
      msg: netty_info,
    }, (data, headers, cookies, errMsg, statusCode) => {
      app.showToast('投屏成功',2000,'success')
      var action =47;
      var imgs = '["'+videos[keys].file_path+'"]';
      var quality_type = 0;
      var resource_id = videos[keys].video_id;
      var resource_size = videos[keys].resource_size;
      var resource_type = 2;
      var duration =  videos[keys].duration
      that.recordForscreen(forscreen_id,action,imgs,quality_type,resource_id,resource_size,resource_type,duration);
    })
  },

  recordForscreen:function(forscreen_id,action,imgs,quality_type,resource_id,resource_size,resource_type,duration= 0){
    utils.PostRequest(api_v_url + '/index/recordForScreenPics', {
      forscreen_id: forscreen_id,
      openid: openid,
      box_mac: box_mac,
      action: action,
      mobile_brand: mobile_brand,
      mobile_model: mobile_model,
      forscreen_char: '',
      public_text: '',
      imgs: imgs,
      quality_type:quality_type,
      resource_id: resource_id,
      res_sup_time: forscreen_id,
      res_eup_time: forscreen_id,
      resource_size: resource_size,
      is_pub_hotelinfo: 0,
      is_share: 0,
      resource_type: resource_type,
      res_nums: 1,
      duration:duration,
      serial_number:app.globalData.serial_number
    }, (data, headers, cookies, errMsg, statusCode) => {
    },re => { }, { isShowLoading: false })
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
    this.getBussnessInfo(openid,box_mac);
    this.ttp()
  },
  ttp:function(e){
    var that = this;
    var is_stop = 0;
    var timer8_0 = setInterval(function () {
    
    //console.log(polling_time);
      utils.PostRequest(api_v_url + '/file/getConversionResult', {
        box_mac: box_mac,
        openid:openid
      }, (data, headers, cookies, errMsg, statusCode) => {
        var forscreen_file_num = data.result.forscreen_file_num;
        var forscreen_file = data.result.forscreen_file;
        is_stop = data.result.is_stop;
        if(is_stop==1){
          clearInterval(timer8_0);
        }
        that.setData({forscreen_file:forscreen_file,forscreen_file_num:forscreen_file_num})
      },res=>{},{ isShowLoading: false })
      
    }, 30000);
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