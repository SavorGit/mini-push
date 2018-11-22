const app = getApp();
Page({
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    box_mac:'',
    openid:'',
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
    var avatarurl = res.detail.userInfo.avatarUrl;
    var nickName = res.detail.userInfo.nickName;
    var mobile_brand = app.globalData.mobile_brand;
    var mobile_model = app.globalData.mobile_model;
    var activity_id = (new Date()).valueOf();
    var gamecode = "https://mobile.littlehotspot.com/Smallapp/Activity/getGameCode?scene=" + box_mac + "_" + activity_id;
    /*wx.request({
      url: 'https://netty-push.littlehotspot.com/push/box',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "POST",
      data: {
        box_mac: box_mac,
        cmd: 'call-mini-program',
        msg: '{"action":101,"activity_id":' + activity_id + ',"openid":"' + openid + '","avatarurl":"' + avatarurl + '","gamecode":"' + gamecode+'"}',
        req_id: activity_id
      },
      success: function (res) {
        //记录日志
        wx.request({
          url: 'https://mobile.littlehotspot.com/smallapp/Activity/orgGameLog',
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            activity_id: activity_id,
            box_mac:box_mac,
            openid:openid,
            mobile_brand: mobile_brand,
            mobile_model: mobile_model,
          },
          success: function (res) {

          }
        })
        wx.navigateTo({
          url: '/pages/activity/turntable/game?avatarurl=' + avatarurl + '&nickName=' + nickName + '&box_mac=' + box_mac + '&openid=' + openid+'&activity_id='+activity_id,
        })
      },
      fail:function(res){
        wx.showToast({
          title: '该电视暂不支持游戏',
          icon: 'none',
          duration: 2000
        })
      }
    })*/
    //记录日志
    wx.request({
      url: 'https://mobile.littlehotspot.com/smallapp/Activity/orgGameLog',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        activity_id: activity_id,
        box_mac: box_mac,
        openid: openid,
        mobile_brand: mobile_brand,
        mobile_model: mobile_model,
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
            msg: '{"action":101,"activity_id":' + activity_id + ',"openid":"' + openid + '","avatarurl":"' + avatarurl + '","gamecode":"' + gamecode + '"}',
          },
          success:function(rt){
            wx.navigateTo({
              url: '/pages/activity/turntable/game?avatarurl=' + avatarurl + '&nickName=' + nickName + '&box_mac=' + box_mac + '&openid=' + openid + '&activity_id=' + activity_id,
            })
          },
          fail: function (res) {
            wx.showToast({
              title: '该电视暂不支持游戏',
              icon: 'none',
              duration: 2000
            })
          }
        });
      }
    })
    
    
  },
  
})