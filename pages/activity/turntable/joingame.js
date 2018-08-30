// pages/activity/turntable/joingame.js
var box_mac;
var activity_id;
var openid;
var gamecode;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    box_mac:'',
    openid :'',
    activity_id:'',
    gamecode:''
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var scene = options.scene.split('_');
    box_mac = scene[0];
    activity_id = scene[1];

    gamecode = "https://mobile.littlehotspot.com/Smallapp/Activity/getGameCode?scene=" + box_mac + "_" + activity_id;
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
    //console.log(options);
    box_mac = options.currentTarget.dataset.box_mac;
    openid  = options.currentTarget.dataset.openid;
    activity_id = options.currentTarget.dataset.activity_id;
    var avatarurl = options.detail.userInfo.avatarUrl;
    var nickname = options.detail.userInfo.nickName;
    var timestamp = (new Date()).valueOf();
    var gamecode = "https://mobile.littlehotspot.com/Smallapp/Activity/getGameCode?scene=" + box_mac + "_" + activity_id;
    wx.request({
      url: 'https://netty-push.littlehotspot.com/push/box',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "POST",
      data: {
        box_mac: box_mac,
        cmd: 'call-mini-program',
        msg: '{"action":103,"activity_id":' + activity_id + ',"openid":"' + openid + '","avatarurl":"' + avatarurl+'"}',
        req_id: timestamp
      },
      success:function(res){
        wx.navigateTo({
          url: '/pages/activity/turntable/join_success?gamecode=' + gamecode,
        });
        wx.request({
          url: 'https://mobile.littlehotspot.com/smallapp/Activity/joinGameLog',
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            activity_id: activity_id,
          },
          success: function (res) {

          }
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
  onShareAppMessage: function () {
  
  }
})