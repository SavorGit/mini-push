// pages/share/video.js
const utils = require('../../utils/util.js')
const app = getApp()
var box_mac;
var openid;
var pubdetail;
var info;
var i;
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    pub_info: [],
    box_mac: '',
    vedio_url:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //wx.hideShareMenu();
    var that = this;
    var res_id = options.res_id;
    var type   = options.type;
    if (app.globalData.openid && app.globalData.openid != '') {
      that.setData({
        openid: app.globalData.openid
      })
      openid = app.globalData.openid;
      //判断用户是否注册
      utils.PostRequest(api_v_url+'/User/isRegister',{
        "openid": app.globalData.openid,
      }, (data, headers, cookies, errMsg, statusCode) => {
        wx.setStorage({
          key: 'savor_user_info',
          data: data.result.userinfo,
        })
      },res=>{
        wx.setStorage({
          key: 'savor_user_info',
          data: { 'openid': app.globalData.openid },
        })
      })
      
      
    } else {
      app.openidCallback = openid => {
        if (openid != '') {
          that.setData({
            openid: openid
          })
          openid = openid;
          //判断用户是否注册
          utils.PostRequest(api_v_url+'/User/isRegister', {
            "openid": openid,
          }, (data, headers, cookies, errMsg, statusCode) => {
            wx.setStorage({
              key: 'savor_user_info',
              data: data.result.userinfo,
            })
          },res=>{
            wx.setStorage({
              key: 'savor_user_info',
              data: { 'openid': openid },
            })
          })
          //判断用户是否注册结束
         
        }
      }
    }
    //var forscreen_id = options.forscreen_id;
    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    utils.PostRequest(api_v_url+'/Share/showVideo', {
      'res_id': res_id,
      'type': type,
      'openid': openid,
    }, (data, headers, cookies, errMsg, statusCode) => {
      info = data.result;
      that.setData({
        info: data.result,
        openid: openid,
        
      })
    })
    
    
  },
  
  //收藏资源
  onCollect: function (e) {
    var that = this;
    var openid = e.target.dataset.openid;
    var res_id = e.target.dataset.res_id;
    var info = e.target.dataset.info;
    var type = e.target.dataset.type;
    utils.PostRequest(api_v_url+'/collect/recLogs', {
      'openid': openid,
      'res_id': res_id,
      'type': type,
      'status': 1,
    }, (data, headers, cookies, errMsg, statusCode) => {
      var collect_nums = data.result.nums;
      info.collect_nums = collect_nums;
      info.is_collect = 1;
      that.setData({
        info: info
      })
    })
    
  },//收藏资源结束
  //取消收藏
  cancCollect: function (e) {
    var that = this;
    var res_id = e.target.dataset.res_id;
    var info = e.target.dataset.info;
    var openid = e.target.dataset.openid;
    var type = e.target.dataset.type;
    utils.PostRequest(api_v_url+'/collect/recLogs', {
      'openid': openid,
      'res_id': res_id,
      'type': type,
      'status': 0,
    }, (data, headers, cookies, errMsg, statusCode) => {
      var collect_nums = data.result.nums;
      info.collect_nums = collect_nums;
      info.is_collect = 0;
      that.setData({
        info: info
      })
    })
    
  },//取消收藏结束
  //点击分享按钮
  onShareAppMessage: function (res) {
    var that = this;
    var res_id = res.target.dataset.res_id;
    //var res_type = res.target.dataset.res_type;
    var openid = res.target.dataset.openid;
    var type   = res.target.dataset.type;
    var img_url = res.target.dataset.img_url;
    
    if (res.from === 'button') {
      // 转发成功
      utils.PostRequest(api_v_url+'/share/recLogs', {
        'openid': openid,
        'res_id': res_id,
        'type': type,
        'status': 1,
      }, (data, headers, cookies, errMsg, statusCode) => {
        info.share_nums++;


          that.setData({
            info: info
          })
      })
      // 来自页面内转发按钮
      return {
        title: '发现一个好玩的东西',
        path: '/pages/share/video?res_id=' + res_id+'&type='+type,
        imageUrl: img_url,
        success: function (res) {
          
        },
      }
    }
  },// 分享结束
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