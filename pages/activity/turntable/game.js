// pages/activity/turntable/game.js
const app = getApp();
Page({
  onShareAppMessage: function (res) {
    var activity_id = res.target.dataset.activity_id;
    var box_mac = res.target.dataset.box_mac;
    if (res.from === 'button') {
      // 来自页面内转发按钮
      return {
        title: '赶紧加入，吃饭怎么能不喝酒！',
        path: '/pages/activity/turntable/joingame?scene='+box_mac+'_'+activity_id,
        imageUrl: '/images/share_game.jpg'
      }
    }
    
    
  },
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
      var gameCode = "https://mobile.littlehotspot.com/Smallapp/Activity/getGameCode?scene="+box_mac+"_"+activity_id;
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
    
   

    /*wx.request({
      url: 'https://netty-push.littlehotspot.com/push/box',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "POST",
      data: {
        box_mac: box_mac,
        cmd: 'call-mini-program',
        msg: '{"action":102,"openid":"' + openid + '","activity_id":' + activity_id+'}',
        req_id: activity_id
      },
      success:function(res){
        that.setData({
          showStart:false,
        })
        if(retry==0){
          wx.request({
            url: 'https://mobile.littlehotspot.com/smallapp/Activity/startGameLog',
            headers: {
              'Content-Type': 'application/json'
            },
            data: {
              activity_id: activity_id,
              startgame_time: timestamp
            },
            success: function (res) {

            }
          })
        }else if(retry==1){
          wx.request({
            url: 'https://mobile.littlehotspot.com/smallapp/Activity/retryGame',
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
        
      }
    })*/
    if (retry == 0) {
      wx.request({
        url: 'https://mobile.littlehotspot.com/smallapp/Activity/jugeGamePerson',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          activity_id: activity_id
        },
        success: function (res) {
          var persons = res.data.result.nums;
          if (persons > 0) {
            wx.request({
              url: 'https://mobile.littlehotspot.com/smallapp/Activity/startGameLog',
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
                  url: 'https://mobile.littlehotspot.com/Netty/Index/index',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  method: "POST",
                  data: {
                    box_mac: box_mac,
                    msg: '{"action":102,"openid":"' + openid + '","activity_id":' + activity_id + '}',
                  },
                  success: function (ret) {

                  }
                });
              }
            })
          } else {
            /*wx.showToast({
              title: '单人无法开始，邀请在座好友一起游戏吧！',
              icon: 'none',
              duration: 2000
            })*/
            wx.showModal({
              title: '提示',
              content: "1、单人无法开始游戏;\r\n2、您应先邀请在座好友扫描电视中二维码加入游戏;\r\n3、开始游戏前请勿退出游戏，否则将会造成游戏无法继续。",
              showCancel:false,
              confirmText:'我知道了'
            });
          }
        }
      })
      
    } else if (retry == 1) {
      wx.request({
        url: 'https://mobile.littlehotspot.com/smallapp/Activity/retryGame',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          activity_id: activity_id,
        },
        success: function (res) {
          that.setData({
            showStart: false,
          })
          wx.request({
            url: 'https://mobile.littlehotspot.com/Netty/Index/index',
            headers: {
              'Content-Type': 'application/json'
            },
            method: "POST",
            data: {
              box_mac: box_mac,
              msg: '{"action":105,"openid":"' + openid + '","activity_id":' + activity_id + '}',
            },
            success: function (ret) {

            }
          });
        }
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
      url: 'https://mobile.littlehotspot.com/Netty/Index/index',
      headers: {
        'Content-Type': 'application/json'
      },
      method: "POST",
      data: {
        box_mac: box_mac,
        msg: '{"action":104,"openid":"' + openid + '","activity_id":' + activity_id + '}',
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
})