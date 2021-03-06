// pages/share/pic.js
const utils = require('../../utils/util.js')
const app = getApp()
var box_mac;
var openid;
var pubdetail;
var pub_info;
var i;
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    pub_info:[],
    box_mac:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    //wx.hideShareMenu();
    var that = this;
    var forscreen_id = options.forscreen_id;
    var user_info = wx.getStorageSync("savor_user_info");
    if (app.globalData.openid && app.globalData.openid != '' && typeof(app.globalData.openid)!='undefined') {
      openid = app.globalData.openid
      that.showPic(openid,forscreen_id);
      that.isHaveCallBox(openid);
    }else {
      app.openidCallback = openid => {
        that.showPic(openid,forscreen_id);
        that.isHaveCallBox(openid);
      }
    }
    
    
    
  },
  showPic:function(openid,forscreen_id){
    var that = this;
    utils.PostRequest(api_v_url+'/Discovery/showPic', {
      'forscreen_id':forscreen_id,
      'openid':openid,
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        pub_info:data.result,
        openid:openid
      })
    })
  },
  isHaveCallBox:function(openid){
    var that = this;
    utils.PostRequest(api_v_url+'/index/isHaveCallBox', {
      openid:openid,
    }, (data, headers, cookies, errMsg, statusCode) => {
      var is_have = data.result.is_have;
        if (is_have == 1) {
          that.setData({
            is_link: 1,
            box_mac: data.result.box_mac,
          })
          box_mac = data.result.box_mac;
        } else {
          that.setData({
            is_link: 0,
            box_mac: '',
          })
          box_mac = '';
        }

    })
  },
  previewImage: function (e) {
    var current = e.target.dataset.src;
    var pkey = e.target.dataset.pkey;
    var urls = [];
    for (var row in current) {
      urls[row] = current[row]['res_url']

    }
    //console.log(pkey);
    wx.previewImage({
      current: urls[pkey], // 当前显示图片的http链接
      urls: urls // 需要预览的图片http链接列表
    })
  },
  
  //收藏资源
  onCollect: function (e) {
    var that = this;
    var openid = e.target.dataset.openid;
    var res_id = e.target.dataset.res_id;
    var pub_info = e.target.dataset.pub_info;

    utils.PostRequest(api_v_url+'/collect/recLogs', {
      'openid': openid,
      'res_id': res_id,
      'type': 2,
      'status': 1,
    }, (data, headers, cookies, errMsg, statusCode) => {
      var collect_nums = data.result.nums;
      pub_info.collect_num = collect_nums;
      pub_info.is_collect =1;
      that.setData({
        pub_info: pub_info
      })
    })

    
  },//收藏资源结束
  //取消收藏
  cancCollect: function (e) {
    var that = this;
    var res_id = e.target.dataset.res_id;
    var pub_info = e.target.dataset.pub_info;
    var openid = e.target.dataset.openid;
    utils.PostRequest(api_v_url+'/collect/recLogs', {
      'openid': openid,
      'res_id': res_id,
      'type': 2,
      'status': 0,
    }, (data, headers, cookies, errMsg, statusCode) => {
      var collect_nums = data.result.nums;
      pub_info.collect_num = collect_nums;
      pub_info.is_collect = 0;
      that.setData({
        pub_info: pub_info
      })
    })
    
  },//取消收藏结束
  //点击分享按钮
  onShareAppMessage: function (res) {
    var that = this;
    var res_id = res.target.dataset.res_id;
    var res_type = res.target.dataset.res_type;
    var openid = res.target.dataset.openid;
    var pub_info = res.target.dataset.pub_info;
    var pubdetail = res.target.dataset.pubdetail;

    if (res_type == 1) {
      var img_url = pubdetail[0]['res_url'];
    } else {
      var img_url = pubdetail[0]['vide_img'];
    }

    if (res.from === 'button') {
      // 转发成功
      utils.PostRequest(api_v_url+'/share/recLogs', {
        'openid': openid,
        'res_id': res_id,
        'type': 2,
        'status': 1,
      }, (data, headers, cookies, errMsg, statusCode) => {
          pub_info.share_num++;
          that.setData({
            pub_info: pub_info
          })
      })
      
      // 来自页面内转发按钮
      return {
        title: '发现一个好玩的东西',
        path: '/pages/share/pic?forscreen_id='+res_id,
        imageUrl: img_url,
        success: function (res) {
          
        },
      }
    }
  },// 分享结束
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

  
})