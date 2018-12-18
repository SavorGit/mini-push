// pages/game/climbtree/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    box_mac: '',
    game_id: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var box_mac = options.box_mac;
    var game_id = options.game_id;
    this.setData({
      box_mac: box_mac,
      game_id: game_id,
    })
  },
  lunchGame:function(res){
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
              wx.navigateTo({
                url: '/pages/game/climbtree/climbtree?box_mac=' + box_mac + '&game_m_h5_url=' + game_m_h5_url
              })
              // wx.request({//发起互动游戏
              //   url: 'https://mobile.littlehotspot.com/Games/ClimbTree/launchGame',
              //   data: {
              //     game_id: 2,
              //     box_mac: box_mac
              //   },
              //   success:function(rts){
                  
              //   }
              // })
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