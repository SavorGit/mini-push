// pages/mine/index_20181010.js
const utils = require('../../utils/util.js')
var mta = require('../../utils/mta_analysis.js')
const app = getApp();
var openid;
var box_mac;
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url
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
    wifiErr: app.globalData.wifiErr,
    is_view_official_account:app.globalData.is_view_official_account, //是否显示关注公众号
    is_test:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu()
    var that = this;
    that.setData({
      link_type:app.globalData.link_type,
    })
    var user_info = wx.getStorageSync(cache_key+'user_info');
    openid = user_info.openid;
    var colose_official_account = wx.getStorageSync(cache_key+'colose_official_account');
    if(user_info.subscribe==0 && colose_official_account ==''){
      that.setData({
        is_view_official_account:true
      })
    }else {
      that.setData({
        is_view_official_account:false
      })
    }
    that.setData({openid:openid})
    that.isHaveCallBox(openid);
    
    //获取用户信息以及我的公开
    utils.PostRequest(api_v_url + '/User/index', {
      openid: openid 
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        userinfo: data.result.user_info,
        publiclist: data.result.public_list,
        collectlist: data.result.collect_list
      })
    })
    
    
  },
  isHaveCallBox:function(openid){
    var that = this;
    utils.PostRequest(api_v_url + '/index/isHaveCallBox', {
      openid: app.globalData.openid
    }, (data, headers, cookies, errMsg, statusCode) => {
      if (data.result.is_have == 1) {
        var is_test = data.result.is_test
        that.setData({
          hotel_info: data.result,
          box_mac: data.result.box_mac,
          is_test:is_test
        })
        box_mac = data.result.box_mac;
      } else {
        //app.globalData.link_type = 1;
        that.setData({
          is_link: 0,
          box_mac: '',
          link_type: 1,
          popRemoteControlWindow: false
        })
        box_mac = '';
      }
    }, re => { }, { isShowLoading: false });
  },
  testForscreen:function(e){
    var box_mac = e.currentTarget.dataset.boxmac;
    var type   = e.currentTarget.dataset.type;
    utils.PostRequest(api_v_url + '/forscreen/collectforscreen', {
      box_mac: box_mac,
      openid: openid,
      type:type
    }, (data, headers, cookies, errMsg, statusCode) =>{
      app.showToast('投屏成功')
    })
  },
  forscreenHistory: function (e) {
    var box_mac = e.currentTarget.dataset.boxmac;
    if (box_mac == '') {
      app.scanQrcode();
    } else {
      wx.navigateTo({
        url: '/pages/forscreen/history/list?openid=' + openid + '&box_mac=' + box_mac,
      })
    }
    mta.Event.stat('gotoForscreenHis', { 'linktype': app.globalData.link_type, "boxmac": box_mac })
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
    console.log(e)
    var that = this;
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var qrcode_img = e.currentTarget.dataset.qrcode_img;
    app.controlCallQrcode(openid, box_mac, qrcode_img,'', that);
  }, 3000),//呼大码结束
  //打开遥控器
  openControl: function (e) {
    var that = this;
    var qrcode_url = api_v_url+'/index/getBoxQr?box_mac=' + box_mac + '&type=3';
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
    //var hotel_info = e.currentTarget.dataset.hotel_info;
    app.controlExitForscreen(openid, box_mac, '', that);
  },
  //遥控调整音量
  changeVolume: function (e) {
    var that = this;
    box_mac = e.currentTarget.dataset.box_mac;
    openid = e.currentTarget.dataset.openid;
    var change_type = e.currentTarget.dataset.change_type;
    //var hotel_info = e.currentTarget.dataset.hotel_info;
    app.controlChangeVolume(openid, box_mac, change_type, '', that);

  },
  //遥控切换节目
  changeProgram: function (e) {
    var that = this;
    box_mac = e.currentTarget.dataset.box_mac;
    openid = e.currentTarget.dataset.openid;
    var change_type = e.currentTarget.dataset.change_type;
    //var hotel_info = e.currentTarget.dataset.hotel_info;
    app.controlChangeProgram(openid, box_mac, change_type, '', that);
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
  clickLikeContentPro:function(e){
    console.log(e)
    var res_url = e.currentTarget.dataset.rts.res_url;
    var title   = e.currentTarget.dataset.rts.title;
    var res_id  = e.currentTarget.dataset.rts.res_id;
    var filename= e.currentTarget.dataset.rts.filename;
    var res_type = e.currentTarget.dataset.rts.res_type;
    var media_type = e.currentTarget.dataset.rts.media_type;
    var is_hot = 0;
    if(res_type==5){
      is_hot = 2;
    }

    if(media_type==1){
      var imgurl  = e.currentTarget.dataset.rts.imgurl;
      imgurl = encodeURIComponent(imgurl);
      var url="/pages/forscreen/video/launch_video?video_url="+res_url+"&video_name="+title+"&box_mac="+box_mac+"&res_id="+res_id+"&filename="+filename+"&video_img_url="+imgurl+'&is_hot='+is_hot
      
    }else {
      var url = "/pages/forscreen/image/launch_image?res_id="+res_id+"&box_mac="+box_mac+'&is_hot=2'
    }
    wx.navigateTo({
      url: url,
    })
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
    var userinfo = wx.getStorageSync(cache_key+'user_info');
    var openid = userinfo.openid

    that.isHaveCallBox(openid);
    app.isRegister(openid,that);
     
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
    
    var userinfo = wx.getStorageSync(cache_key+'user_info');
    var openid = userinfo.openid
    var type = e.currentTarget.dataset.type;
    if(type==3){
      var url = '/pages/hotel/order/index?openid=' + openid + "&order_status=0";
    }else if(type==5){
      var url = '/mall/pages/order/list?openid=' + openid + "&order_status=0";
    }else if(type==6){
      var url = '/mall/pages/gift/order/gift_list?openid=' + openid + "&order_status=0";
    }
    wx.navigateTo({
      url: url,
    })
  },
  /**
   * 我的收货地址
   */
  gotoAdress:function(e){
    //var openid = this.data.openid;
    var userinfo = wx.getStorageSync(cache_key+'user_info');
    var openid = userinfo.openid
    wx.navigateTo({
      url: '/pages/mine/address/index?openid='+openid+'&isOrder=0',
    })
  },
  closeFollowOfficialAccount:function(e){
    this.setData({
      is_view_official_account:false
    })
    wx.setStorageSync(cache_key+'colose_official_account',1);
  },
  nowFollowOfficialAccount:function(){
    var openid= this.data.openid;
    var user_info = wx.getStorageSync(cache_key+'user_info');
    if(user_info.wx_mpopenid=='' || typeof(user_info.wx_mpopenid)=='undefined'){
      wx.navigateTo({
        url: '/pages/h5/index?h5_url='+app.globalData.Official_account_url+openid,
      })
    }else {
      wx.navigateTo({
        url: '/pages/h5/index?h5_url='+app.globalData.Official_article_url,
      })
    }
    mta.Event.stat('clickOfficialAccount',{'openid':openid})
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