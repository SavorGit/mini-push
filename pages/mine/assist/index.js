// pages/mine/assist/index.js
const utils = require('../../../utils/util.js')
var mta = require('../../../utils/mta_analysis.js')
const app = getApp()
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
var openid;
var inside = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    picinfo: [],
    is_assist:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options);
    var that = this;
    var forscreen_id = options.forscreen_id;
    var box_mac      = options.box_mac;
    if (typeof (options.inside) != 'undefined') {
      
      inside = options.inside;
    }else {
      inside = 0
    }
    console.log(inside);
    that.setData({
      forscreen_id:forscreen_id,
      box_mac:box_mac,
      inside: inside
    })
    if (app.globalData.openid && app.globalData.openid != '') {
      that.setData({
        openid: app.globalData.openid
      })
      openid = app.globalData.openid;
      //判断用户是否注册

      utils.PostRequest(api_v_url + '/User/isRegister', {
        "openid": app.globalData.openid,
      }, (data, headers, cookies, errMsg, statusCode) => {
        wx.setStorage({
          key: 'savor_user_info',
          data: data.result.userinfo,
        })
        if (data.result.userinfo.is_wx_auth != 3) {
          that.setData({
            showModal: true
          })
          mta.Event.stat("showwxauth", {})
        }
      },res=>{
        if(app.globalData.link_type!=2){
          wx.setStorage({
            key: 'savor_user_info',
            data: {
              'openid': app.globalData.openid
            },
          })
        }
      })

      
      //获取助力的内容
      getAssistInfo(app.globalData.openid, forscreen_id);
      //获取助力好友
      getAssistFriends(app.globalData.openid,forscreen_id);
    } else {
      app.openidCallback = openid => {
        if (openid != '') {
          that.setData({
            openid: openid
          })
          openid = openid;
          //判断用户是否注册

          utils.PostRequest(api_v_url + '/User/isRegister', {
            "openid": openid,
          }, (data, headers, cookies, errMsg, statusCode) => {
            wx.setStorage({
              key: 'savor_user_info',
              data: data.result.userinfo,
            })
            if (data.result.userinfo.is_wx_auth != 3) {
              that.setData({
                showModal: true
              })
              mta.Event.stat("showwxauth", {})
            }
          },res=>{
            wx.setStorage({
              key: 'savor_user_info',
              data: {
                'openid': openid
              },
            })
          })
          
          //获取助力的内容
          getAssistInfo(openid, forscreen_id);
          //获取助力好友
          getAssistFriends(app.globalData.openid, forscreen_id);
        }
      }
    }
    //热播内容
    utils.PostRequest(api_url + '/Smallapp3/content/getHotplaylist', {
      page:1,
      pagesize:3
    }, (data, headers, cookies, errMsg, statusCode) => {
      that.setData({
        hot_play: data.result.datalist
      })
    })
    

    function getAssistInfo(openid,forscreen_id){
      utils.PostRequest(api_url +'/Smallapp3/ForscreenHelp/detail', {
        openid:openid,
        forscreen_id:forscreen_id
      }, (data, headers, cookies, errMsg, statusCode) => {
        var is_assist ;
        if(data.result.status==3){
          is_assist= true
        }else {
          is_assist = false
        }
        var pubdetail = [{'res_url':''}];
        
        for(var i=0;i<1;i++){
          pubdetail[i]['res_url'] = data.result.img_url;
        }
        that.setData({
          assist_info:data.result,
          is_assist: is_assist,
          pubdetail: pubdetail,
        })
      })
      
    }
    function getAssistFriends(openid, forscreen_id){

      utils.PostRequest(api_url + '/Smallapp3/ForscreenHelp/userlist', {
        forscreen_id: forscreen_id,
        page:1,
        pagesize:7,
      }, (data, headers, cookies, errMsg, statusCode) => {
        that.setData({
          assist_frieds: data.result.datalist,
          assist_frieds_nums: data.result.total_num
        })
      })
      
    }
  },
  assist:function(e){
    var that = this;
    var user_info = wx.getStorageSync('savor_user_info');
    var openid = user_info.openid;
    var help_id = e.target.dataset.help_id;
    var forscreen_id = e.target.dataset.forscreen_id;
    var mobile_brand = app.globalData.mobile_brand;
    var mobile_model = app.globalData.mobile_model;
    var box_mac = e.target.dataset.box_mac;
    var forscreen_url  = e.target.dataset.forscreen_url;
    var resource_type = e.target.dataset.media_type;
    if (resource_type==1){
      resource_type = 2
    }else if(resource_type==2){
      resource_type = 1;
    }
    var timestamp = (new Date()).valueOf();
    if(user_info.is_wx_auth!=3){
      that.setData({
        showModel:true
      })
      mta.Event.stat("showwxauth", {})
    }else {
      utils.PostRequest(api_url +'/Smallapp3/ForscreenHelp/addhelp', {
        help_id:help_id,
        openid:openid
      }, (data, headers, cookies, errMsg, statusCode) => {
        that.setData({
          is_assist:true
        })

        utils.PostRequest(api_url + '/Smallapp3/ForscreenHelp/userlist', {
          forscreen_id: forscreen_id,
          page: 1,
          pagesize: 7,
        }, (data, headers, cookies, errMsg, statusCode) => {

          that.setData({
            assist_frieds: data.result.datalist,
            assist_frieds_nums: data.result.total_num
          })
        })
        utils.PostRequest(api_v_url + '/index/recordForScreenPics', {
          forscreen_id: timestamp,
            openid: openid,
            box_mac: box_mac,
            action: 50,
            mobile_brand: mobile_brand,
            mobile_model: mobile_model,
            imgs: '["' + forscreen_url+'"]',
            resource_type: resource_type,
            serial_number:app.globalData.serial_number
        }, (data, headers, cookies, errMsg, statusCode) => {

        })
        
      })
    }
  },
  onGetUserInfo: function (res) {
    var that = this;

    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    mta.Event.stat("clickonwxauth", {})
    if (res.detail.errMsg == 'getUserInfo:ok') {
      wx.getUserInfo({
        success(rets) {
          utils.PostRequest(api_v_url + '/User/registerCom', {
            'openid': openid,
            'avatarUrl': rets.userInfo.avatarUrl,
            'nickName': rets.userInfo.nickName,
            'gender': rets.userInfo.gender,
            'session_key': app.globalData.session_key,
            'iv': rets.iv,
            'encryptedData': rets.encryptedData
          }, (data, headers, cookies, errMsg, statusCode) => {
            wx.setStorage({
              key: 'savor_user_info',
              data: data.result,
            });
            that.setData({
              showModal: false,
            })
          })
          
        }
      })
      mta.Event.stat("allowauth", {})
    } else {
      utils.PostRequest(api_v_url + '/User/refuseRegister', {
        'openid': openid,
      }, (data, headers, cookies, errMsg, statusCode) => {
        user_info['is_wx_auth'] = 1;
        wx.setStorage({
          key: 'savor_user_info',
          data: user_info,
        })
      })
      
      mta.Event.stat("refuseauth", {})
    }


  },
  //关闭授权弹窗
  closeAuth: function () {
    //关闭授权登陆埋点
    var that = this;
    that.setData({
      showModal: false,
    })
    var user_info = wx.getStorageSync("savor_user_info");
   
    utils.PostRequest(api_url + '/Smallapp21/index/closeauthLog', {
      openid: openid,
        box_mac: '',
    }, (data, headers, cookies, errMsg, statusCode) => {

    })

    
    mta.Event.stat("closewxauth", {})
  },
  phonecallevent: function (e) {
    var tel = e.target.dataset.tel;
    wx.makePhoneCall({
      phoneNumber: tel
    })
  },
  //预览图片
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
  onShareAppMessage: function (res) {
    console.log(res);
    var that = this;
    var forscreen_id = res.target.dataset.forscreen_id;
    var box_mac      = res.target.dataset.box_mac;
    console.log(forscreen_id);
    var img_url = res.target.dataset.img_url;
    var title ="快来帮我助力";
    if (res.from === 'button') {
      wx.reportAnalytics('invite_friends_report', {
        num: 1,
      });
      // 转发成功
      // 来自页面内转发按钮
      return {
        title: title,
        path: '/pages/mine/assist/index?forscreen_id=' + forscreen_id +'&box_mac='+box_mac ,
        imageUrl: img_url,
        success: function (res) {

        }
      }
    }
  },// 分享结束
})