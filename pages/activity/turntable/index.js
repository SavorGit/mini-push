const app = getApp();
Page({
  data:{
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    box_mac:'',
    openid:''
  },
  onLoad: function (options) {
    var that = this;
    var box_mac = options.box_mac;
    var openid  = options.openid; 
    that.setData({
      box_mac:box_mac,
      openid :openid
    });
  },
  //发起游戏
  bindGetUserInfo:function(res){

    var box_mac = res.currentTarget.dataset.box_mac;
    var openid  = res.currentTarget.dataset.openid;
    var avatarUrl = res.detail.userInfo.avatarUrl;
    var nickName = res.detail.userInfo.nickName;
    wx.navigateTo({
      url: '/pages/activity/turntable/game?avatarUrl='+avatarUrl+'&nickName='+nickName+'&box_mac='+box_mac+'&openid='+openid,
    })
    
  }
})