// pages/activity/turntable/game.js
const app = getApp();
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


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //console.log(options);
      var that = this;
      var avatarUrl = options.avatarUrl;           //微信用户头像
      var nickName  = options.nickName;            //微信用户昵称
      var box_mac   = options.box_mac;             //机顶盒mac
      var openid    = options.openid;              //openid
      var activity_id  = (new Date()).valueOf();   //活动id
      var gameCode = "https://mobile.littlehotspot.com/Smallapp/Activity/getGameCode?scene="+box_mac+":"+activity_id;
      that.setData({
        avatarUrl:avatarUrl,
        nickName :nickName,
        box_mac  :box_mac,
        openid   :openid,
        activity_id : activity_id,
        gameCode: gameCode

      });
      /*wx.request({
        url: 'https://mobile.littlehotspot.com/smallapp/activity/getGameCode',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          
        },
        success:function(ret){
           console.log(111);
        },
      })*/
  },
  //开始游戏
  startGame:function(e){
    console.log(e);
    var that = this;
    var box_mac   = e.currentTarget.dataset.box_mac;
    var openid    = e.currentTarget.dataset.openid;
    var avatarurl = e.currentTarget.dataset.avatarurl;
    var nickname  = e.currentTarget.dataset.nickname;
    var activity_id = e.currentTarget.dataset.activity_id;

    


    wx.request({
      url: 'https://netty-push.littlehotspot.com/push/box',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "POST",
      data: {
        box_mac: box_mac,
        cmd: 'call-mini-program',
        msg: '{"action":11,"avatarurl":' + avatarurl + ',"openid":"' + openid + '","activity_id":' + activity_id+'}',
        req_id: activity_id
      },
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