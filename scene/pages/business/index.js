// scene/pages/business/index.js
/**
 * 【场景】商务宴请 - 首页
 */


const utils = require('../../../utils/util.js')
var mta = require('../../../utils/mta_analysis.js')
const app = getApp()
var api_v_url = app.globalData.api_v_url;
var openid;
var box_mac;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    SystemInfo: getApp().SystemInfo,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu({})
    openid  = options.openid;
    box_mac = options.box_mac;
    
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
      var share_file = data.result.share_file;
      if(share_file.length>0){
        that.setData({is_have_sharefile:false})
      }else {
        that.setData({is_have_sharefile:true,'sharefile_info':data.result.share_file})
      }
    })
  },
  forCard:function(e){
    var that = this;
    var card_info = that.data.card_info;
    card_info.acion = 100;
    var push_info = JSON.stringify(card_info) 
    utils.PostRequest(api_url+'/Netty/Index/pushnetty', {
      box_mac: box_mac,
      openid:openid,
      msg: push_info,
    }, (data, headers, cookies, errMsg, statusCode) => {
    })
  },
  forImages:function(e){
    wx.navigateTo({
      url: '/pages/forscreen/forimages/index?box_mac=' + box_mac + '&openid=' + openid ,
    })
  },
  forVideo:function(e){
    wx.navigateTo({
      url: '/pages/forscreen/forvideo/index?box_mac=' + box_mac + '&openid=' + openid ,
    })
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
  },
  /**
   * 分享名片
   */
  shareCard:function(e){

  },
  /**
   * 添加/编辑欢迎词
   */
  gotoWelcome:function(e){
    wx.navigateTo({
      url: '/scene/pages/welcome/add?openid='+openid+'&box_mac='+box_mac+'&type=1',
    })
  },
  /**
   * 投屏欢迎词
   */
  forscreenWelcome:function(e){

  },
  /**
   * 添加/编辑分享文件
   */
  gotoShareFiles:function(e){
    console.log('dddd')
    wx.navigateTo({
      url: '/scene/pages/business/files/sharefile?openid='+openid+'&box_mac='+box_mac+'&type=1',
    })
    
  },
  /**
   * 投屏分享文件
   */
  forscreenShareFile:function(e){
    
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