// pages/activity/turntable/game.js
const app = getApp();
var utils = require("../../../utils/util.js");
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl:'',
    nickName: '',
    box_mac :'',
    openid : '',
    activity_id:'',
    gameCode:'',
    showStart:true,


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //console.log(options);
      var that = this;
      var avatarurl = options.avatarurl;           //微信用户头像
      var nickName  = options.nickName;            //微信用户昵称
      var box_mac   = options.box_mac;             //机顶盒mac
      var openid    = options.openid;              //openid
      var activity_id = options.activity_id;         //活动id
      //var activity_id  = (new Date()).valueOf();   //活动id
      var gameCode = api_v_url+"/Activity/getGameCode?scene="+box_mac+"_"+activity_id;
      that.setData({
        avatarurl:avatarurl,
        nickName :nickName,
        box_mac  :box_mac,
        openid   :openid,
        activity_id : activity_id,
        gameCode: gameCode

      });
      
  },
  //开始游戏
  startGame:function(e){
    var that = this;
    var retry = e.currentTarget.dataset.retry;
    var box_mac   = e.currentTarget.dataset.box_mac;
    var openid    = e.currentTarget.dataset.openid;
    var avatarurl = e.currentTarget.dataset.avatarurl;
    var nickname  = e.currentTarget.dataset.nickname;
    var activity_id = e.currentTarget.dataset.activity_id;
    var timestamp = (new Date()).valueOf();
    


    
    if (retry == 0) {
      utils.PostRequest(api_v_url + '/activity/getTurntableStatus', {
        activity_id:activity_id
      }, (data, headers, cookies, errMsg, statusCode) => {
        wx.request({
          url: api_v_url+'/Activity/startGameLog',
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            activity_id: activity_id,
            startgame_time: timestamp
          },
          success: function (res) {
            that.setData({
              showStart: false,
            })
            wx.request({
              url: api_url+'/Netty/Index/pushnetty',
              
              method: "POST",
              data: {
                box_mac: box_mac,
                cmd: 'call-mini-program',
                msg: '{"action":102,"openid":"' + openid + '","activity_id":' + activity_id + '}',
                req_id: activity_id
              },
              success:function(ret){
  
              }
            });
          }
        })
      },res=>{
        wx.navigateBack({
          delta: 2,
        })
      })
      
    } else if (retry == 1) {

      utils.PostRequest(api_v_url + '/activity/againTurntable', {
        box_mac: box_mac,
        openid:openid,
        activity_id: activity_id,
      }, (data, headers, cookies, errMsg, statusCode) => {
        app.showToast('操作成功');
      })

      
    }

  },
  //重新发起游戏
  /*orgGame(e){
    var box_mac = e.currentTarget.dataset.box_mac;
    var openid  = e.currentTarget.dataset.openid;
      wx.navigateTo({
        url: '/pages/activity/turntable/index?box_mac='+box_mac+'&openid='+openid,
      })
  },*/

  //退出游戏
  endGame: function (e) {
    var that = this;
    var box_mac = e.currentTarget.dataset.box_mac;
    var openid = e.currentTarget.dataset.openid;
    var activity_id = e.currentTarget.dataset.activity_id;
    wx.request({
      url: api_url+'/Netty/Index/pushnetty',
      
      method: "POST",
      data: {
        box_mac: box_mac,
        cmd: 'call-mini-program',
        msg: '{"action":104,"openid":"' + openid + '","activity_id":' + activity_id + '}',
        req_id: activity_id
      },
      success:function(res){
         wx.navigateBack({
           delta:2
         })
      },fail:function(res){
        wx.showToast({
          title: '网络异常，退出失败！',
          icon: 'none',
          duration: 2000
        })
      }
    })
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
  onShareAppMessage: function (e) {
    var that = this;
    var box_mac = e.target.dataset.box_mac;
    var activity_id = e.target.dataset.activity_id;
    if (e.from === 'button') {
      
      var share_url = '/pages/activity/turntable/joingame?box_mac='+box_mac+'&activity_id='+activity_id;
      return {
        title: '您的好友邀请您参与转盘游戏',
        path: share_url,
        success: function(res) {
          // console.log('full_scroll.Page.onShareAppMessage','return', e);
        },
      }
    }
  
  }
})