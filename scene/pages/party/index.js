// scene/pages/party/index.js
/**
 * 【场景】生日聚会 - 首页
 */
const utils = require('../../../utils/util.js')
var mta = require('../../../utils/mta_analysis.js')
const app = getApp()
var api_v_url = app.globalData.api_v_url;
var api_url   = app.globalData.api_url;
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
    openid = options.openid;
    box_mac = options.box_mac;
    var hotel_name = options.hotel_name;
    var room_name  = options.room_name;
    this.setData({'hotel_name':hotel_name,'room_name':room_name})
    this.getHappyList();
  },
  gotoWelcome:function(e){
    wx.navigateTo({
      url: '/scene/pages/welcome/add?openid='+openid+'&box_mac='+box_mac+'&type=4',
    })
  },
  getHappyList:function(){
    var that = this;
    utils.PostRequest(api_v_url+'/index/happylist', {
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        happylist:data.result
      })
    })
  },

  showHappy:function(e){

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