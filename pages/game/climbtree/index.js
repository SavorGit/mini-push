// pages/game/climbtree/index.js
var djs = 60;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    box_mac: '',
    game_id: '',
    showButton:true,
    hiddens: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu();
    var that = this;
    var box_mac = options.box_mac;
    var game_id = options.game_id;
    this.setData({
      box_mac: box_mac,
      game_id: game_id,
    })
  },
  lunchGame:function(res){
    djs = 60;
    var that = this;
    that.setData({
      showButton:false,
      hiddens:false,
    })
    wx.request({
      url: 'https://mobile.littlehotspot.com/Games/ClimbTree/clearLaunchGame',
      data: {
        box_mac: box_mac,
      },
    })
    // wx.showToast({
    //   title: '房间创建中，请稍后...',
    //   icon: 'none',
    //   duration: 2000
    // })
    var box_mac = res.target.dataset.box_mac;
    var game_id = res.target.dataset.game_id;
    wx.request({
      url: 'https://mobile.littlehotspot.com/Games/Index/getGameInfo',
      data:{
        game_id:game_id
      },
      success:function(res){
        if(res.data.code==10000){
          var game_h5_url = res.data.result.game_url +box_mac;
          var game_m_h5_url = game_h5_url + '/' + res.data.result.game_m_url;
          
          wx.request({
            url: 'https://mobile.littlehotspot.com/Netty/index/index',
            data: {
              box_mac: box_mac,
              msg: '{"action":110,"url":"'+game_h5_url+'"}'
            },
            success: function (rtt) {

                
                var interval = setInterval(function () {

                  wx.request({
                    url: 'https://mobile.littlehotspot.com/Games/ClimbTree/isHaveLaunchGame',
                    data: {
                      box_mac: box_mac,
                    },
                    success: function (tmps) {
                      if (tmps.data.code == 10000) {
                        that.setData({
                          hiddens: true,
                          showButton: true
                        })
                        clearInterval(interval);
                        wx.request({
                          url: 'https://mobile.littlehotspot.com/Games/ClimbTree/clearLaunchGame',
                          data: {
                            box_mac: box_mac,
                          },
                        })
                        wx.navigateTo({
                          url: '/pages/game/climbtree/climbtree?box_mac=' + box_mac + '&game_m_h5_url=' + game_m_h5_url
                        })
                      } 
                    }
                  })
                  if(djs<=0){
                    clearInterval(interval);
                    that.setData({
                      hiddens:true,
                      showButton:true
                    })
                  }
                  djs--;

                }.bind(this), 1000);
            }
          })
        }else {
          
        }
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