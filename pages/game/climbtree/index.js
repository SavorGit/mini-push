// pages/game/climbtree/index.js
const utils = require('../../../utils/util.js')
var mta = require('../../../utils/mta_analysis.js')
const app = getApp()
var djs = 60;
var api_url = app.globalData.api_url;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    box_mac: '',
    game_id: '',
    showButton: true,
    hiddens: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideShareMenu();
    var that = this;
    var box_mac = options.box_mac;
    var game_id = options.game_id;
    this.setData({
      box_mac: box_mac,
      game_id: game_id,
    })
  },
  lunchGame: function(res) {
    djs = 60;
    var that = this;
    let userInfo = wx.getStorageSync("savor_user_info");
    let openId = userInfo.openid;

    // wx.showToast({
    //   title: '房间创建中，请稍后...',
    //   icon: 'none',
    //   duration: 2000
    // })
    var box_mac = res.target.dataset.box_mac;
    var game_id = res.target.dataset.game_id;
    utils.tryCatch(mta.Event.stat('Game_Detail_Launch', {
      'openid': openId,
      'gameid': game_id,
      'boxmac': box_mac
    }));
    utils.PostRequest(api_url + '/Games/Index/getGameInfo', {
      game_id: game_id
    }, (data, headers, cookies, errMsg, statusCode) => {
      var game_h5_url = "https://" + data.result.game_url + box_mac;
      var game_m_h5_url = "https://" + data.result.game_url + box_mac + '/' + data.result.game_m_url;
      
      utils.PostRequest(api_url + '/Games/ClimbTree/isHaveGameimg', {
        box_mac: box_mac,
      }, (data, headers, cookies, errMsg, statusCode) => {
        var is_gaming = data.result.is_gaming;
          if (is_gaming == 1) {

            app.showToast('该房间已经创建游戏!')
            
          } else {
            that.setData({
              showButton: false,
              hiddens: false,
            })
            utils.PostRequest(api_url + '/Netty/Index/pushnetty', {
              box_mac: box_mac,
              msg: '{"action":110,"url":"' + game_h5_url + '"}'
            }, (data, headers, cookies, errMsg, statusCode) => {

              var interval = setInterval(function() {


                utils.PostRequest(api_url + '/Games/ClimbTree/isHaveLaunchGame', {
                  box_mac: box_mac,
                }, (data, headers, cookies, errMsg, statusCode) => {
                  that.setData({
                    hiddens: true,
                    showButton: true
                  })
                  clearInterval(interval);
                  utils.PostRequest(api_url + '/Games/ClimbTree/clearLaunchGame', {
                    box_mac: box_mac,
                  }, (data, headers, cookies, errMsg, statusCode) => {

                  })
                  game_m_h5_url +='?isLauncher=true';
                  wx.navigateTo({
                    url: '/pages/game/climbtree/climbtree?box_mac=' + box_mac + '&game_m_h5_url=' + game_m_h5_url
                  })
                },re => { }, { isShowLoading: false })
                
                if (djs <= 0) {
                  clearInterval(interval);
                  that.setData({
                    hiddens: true,
                    showButton: true
                  })
                }
                djs--;

              }.bind(this), 1000);
            })

            
          }
      })
      
    },res=>{
      wx.showToast({
        title: '该游戏不存在',
        icon: 'none',
        duration: 2000
      })
      wx.navigateTo({
        url: '/pages/index/index',
      })
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
  onShareAppMessage: function() {

  },
  goToBack: function(e) {
    app.goToBack();
  }
})