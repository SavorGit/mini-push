// pages/activity/turntable/joingame.js
const app = getApp();
var box_mac;
var activity_id;
var openid;
var gamecode;
var unionid;
var api_v_url = app.globalData.api_v_url;
const utils = require('../../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    box_mac:'',
    openid :'',
    activity_id:'',
    gamecode:'',
    is_wx_auth:0
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    console.log(options);
    if(typeof(options.scene)!='undefined'){
      var scene = options.scene.split('_');
      box_mac = scene[0];
      activity_id = scene[1];
    }else {
      box_mac = options.box_mac;
      activity_id = options.activity_id;
    }
    

    gamecode = api_v_url+"/Activity/getGameCode?scene=" + box_mac + "_" + activity_id;
    wx.login({
      success: res => {
        var code = res.code; //返回code
        wx.request({
          url: 'https://mobile.littlehotspot.com/smallapp/index/getOpenid',
          data: { "code": code },
          header: {
            'content-type': 'application/json'
          },
          success: function (res) {
            utils.PostRequest(api_v_url + '/User/isRegister', {
              openid: res.data.result.openid,
              unionid:res.data.result.unionid
            }, (data, headers, cookies, errMsg, statusCode) => {
              var  is_wx_auth = data.result.userinfo.is_wx_auth;
              var avatarUrl   = data.result.userinfo.avatarUrl;
              var nickName    = data.result.userinfo.nickName;
              
              that.setData({is_wx_auth:is_wx_auth,avatarUrl:avatarUrl,nickName:nickName})
            })
            unionid = res.data.result.unionid;
            
            //console.log(res.data.result.openid);
            that.setData({
              box_mac:box_mac,
              activity_id:activity_id,
              openid:res.data.result.openid,
              gamecode:gamecode
            })
          }
        })
      }
    });
  },
  /**
   * 加入游戏
   */
  joingame:function(options){
    console.log(options);
    var that = this;

    box_mac = options.currentTarget.dataset.box_mac;
    openid  = options.currentTarget.dataset.openid;
    activity_id = options.currentTarget.dataset.activity_id;
    var is_wx_auth = that.data.is_wx_auth;
    console.log(is_wx_auth)
    if(is_wx_auth==3){
      var avatarurl = that.data.avatarUrl;
      var nickname = that.data.nickName;
      var timestamp = (new Date()).valueOf();
      //var gamecode = "https://mobile.littlehotspot.com/Smallapp/Activity/getGameCode?scene=" + box_mac + "_" + activity_id;
      var gamecode = api_v_url+"/Activity/getGameCode";
      var mobile_brand = app.globalData.mobile_brand;
      var mobile_model = app.globalData.mobile_model;


      wx.request({
        url: api_v_url+'/Activity/canJoinGame',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          activity_id: activity_id,

        },
        success: function (res) {
          var canjoin = res.data.result.can_join;
          if(canjoin==1){
            wx.request({
              url: api_v_url+'/Activity/joinGameLog',
              headers: {
                'Content-Type': 'application/json'
              },
              data: {
                activity_id: activity_id,
                openid: openid,
                mobile_brand: mobile_brand,
                mobile_model: mobile_model,
                join_time: timestamp

              },
              success: function (res) {
                wx.request({
                  url: 'https://mobile.littlehotspot.com/Netty/Index/index',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  method: "POST",
                  data: {
                    box_mac: box_mac,
                    msg: '{"action":103,"activity_id":' + activity_id + ',"openid":"' + openid + '","avatarurl":"' + avatarurl + '"}',
                  },
                  success: function (ret) {
                    wx.navigateTo({
                      url: '/pages/activity/turntable/join_success?gamecode=' + gamecode + "&box_mac=" + box_mac + "&activity_id=" + activity_id,
                    });
                  }
                });
              }
            })
          }else {
            //本局游戏已结束，无法加入，您可扫描电视二维码加入新一局的游戏，或扫描链接电视发起新的游戏。
            wx.showModal({
              title: '加入游戏失败',
              content: "本局游戏已结束。您可参与下一局或在小程序内发起新的游戏。",
              showCancel: false,
              confirmText: '确定'
            });
          }
        }
      })
    }else {
      wx.getUserProfile({
        desc:'获取用户头像',
        success:function(res){
          console.log(res)
          var avatarurl = res.userInfo.avatarUrl;
          var nickname = res.userInfo.nickName;
          var gender   = res.userInfo.gender;
          var timestamp = (new Date()).valueOf();
          //var gamecode = "https://mobile.littlehotspot.com/Smallapp/Activity/getGameCode?scene=" + box_mac + "_" + activity_id;
          var gamecode = api_v_url+"/Activity/getGameCode";
          var mobile_brand = app.globalData.mobile_brand;
          var mobile_model = app.globalData.mobile_model;
          utils.PostRequest(api_v_url + '/User/registerCom', {
            'openid': openid,
            'avatarUrl': avatarurl,
            'nickName': nickname,
            'gender': gender,
            'unionid':unionid
          }, (data, headers, cookies, errMsg, statusCode) => {
          })
  
          wx.request({
            url: api_v_url+'/Activity/canJoinGame',
            headers: {
              'Content-Type': 'application/json'
            },
            data: {
              activity_id: activity_id,
  
            },
            success: function (res) {
              var canjoin = res.data.result.can_join;
              if(canjoin==1){
                wx.request({
                  url: api_v_url+'/Activity/joinGameLog',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  data: {
                    activity_id: activity_id,
                    openid: openid,
                    mobile_brand: mobile_brand,
                    mobile_model: mobile_model,
                    join_time: timestamp
  
                  },
                  success: function (res) {
                    wx.request({
                      url: 'https://mobile.littlehotspot.com/Netty/Index/index',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      method: "POST",
                      data: {
                        box_mac: box_mac,
                        msg: '{"action":103,"activity_id":' + activity_id + ',"openid":"' + openid + '","avatarurl":"' + avatarurl + '"}',
                      },
                      success: function (ret) {
                        wx.navigateTo({
                          url: '/pages/activity/turntable/join_success?gamecode=' + gamecode + "&box_mac=" + box_mac + "&activity_id=" + activity_id,
                        });
                      }
                    });
                  }
                })
              }else {
                //本局游戏已结束，无法加入，您可扫描电视二维码加入新一局的游戏，或扫描链接电视发起新的游戏。
                wx.showModal({
                  title: '加入游戏失败',
                  content: "本局游戏已结束。您可参与下一局或在小程序内发起新的游戏。",
                  showCancel: false,
                  confirmText: '确定'
                });
              }
            }
          })
        }
      })
    }
    

    

    
    
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