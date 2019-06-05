// pages/share/video.js
const app = getApp()
var box_mac;
var openid;
var pubdetail;
var info;
var i;
var api_url = app.globalData.api_url;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    pub_info: [],
    box_mac: '',
    vedio_url:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //wx.hideShareMenu();
    var that = this;
    var res_id = options.res_id;
    var type   = options.type;
    if (app.globalData.openid && app.globalData.openid != '') {
      that.setData({
        openid: app.globalData.openid
      })
      openid = app.globalData.openid;
      //判断用户是否注册
      wx.request({
        url: api_url+'/smallapp21/User/isRegister',
        data: {
          "openid": app.globalData.openid,
          
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          wx.setStorage({
            key: 'savor_user_info',
            data: res.data.result.userinfo,
          })
        },
        fail: function (e) {
          wx.setStorage({
            key: 'savor_user_info',
            data: { 'openid': app.globalData.openid },
          })
        }
      });//判断用户是否注册结束
      
    } else {
      app.openidCallback = openid => {
        if (openid != '') {
          that.setData({
            openid: openid
          })
          openid = openid;
          //判断用户是否注册
          wx.request({
            url: api_url+'/smallapp21/User/isRegister',
            data: {
              "openid": app.globalData.openid,
              
            },
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {
              wx.setStorage({
                key: 'savor_user_info',
                data: res.data.result.userinfo,
              })
            },
            fail: function (e) {
              wx.setStorage({
                key: 'savor_user_info',
                data: { 'openid': openid },
              })
            }
          });//判断用户是否注册结束
         
        }
      }
    }
    //var forscreen_id = options.forscreen_id;
    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    wx.request({
      url: api_url+'/smallapp3/Share/showVideo',
      data: {
        'res_id': res_id,
        'type': type,
        'openid': openid,
      },
      success: function (res) {
        //console.log(res.data.result.pubdetail);
        info = res.data.result;
        that.setData({
          info: res.data.result,
          openid: openid,
          
        })
      }
    })
    
  },
  
  //收藏资源
  onCollect: function (e) {
    var that = this;
    var openid = e.target.dataset.openid;
    var res_id = e.target.dataset.res_id;
    var info = e.target.dataset.info;
    var type = e.target.dataset.type;
    wx.request({
      url: api_url+'/Smallapp/collect/recLogs',
      header: {
        'content-type': 'application/json'
      },
      data: {
        'openid': openid,
        'res_id': res_id,
        'type': type,
        'status': 1,
      },
      success: function (e) {
        var collect_nums = e.data.result.nums;
        info.collect_nums = collect_nums;
        info.is_collect = 1;
        that.setData({
          info: info
        })
        /*if (e.data.code == 10000) {
          wx.showToast({
            title: '收藏成功',
            icon: 'none',
            duration: 2000
          })
        } else {
          wx.showToast({
            title: '收藏失败，请稍后重试',
            icon: 'none',
            duration: 2000
          })
        }*/
      },
      fial: function ({ errMsg }) {
        wx.showToast({
          title: '网络异常，请稍后重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },//收藏资源结束
  //取消收藏
  cancCollect: function (e) {
    var that = this;
    var res_id = e.target.dataset.res_id;
    var info = e.target.dataset.info;
    var openid = e.target.dataset.openid;
    var type = e.target.dataset.type;
    wx.request({
      url: api_url+'/Smallapp/collect/recLogs',
      header: {
        'content-type': 'application/json'
      },
      data: {
        'openid': openid,
        'res_id': res_id,
        'type': type,
        'status': 0,
      },
      success: function (e) {
        var collect_nums = e.data.result.nums;
        info.collect_nums = collect_nums;
        info.is_collect = 0;
        that.setData({
          info: info
        })
        /*if (e.data.code == 10000) {
          wx.showToast({
            title: '取消收藏成功',
            icon: 'none',
            duration: 2000
          })
        } else {
          wx.showToast({
            title: '取消收藏失败，请稍后重试',
            icon: 'none',
            duration: 2000
          })
        }*/
      },
      fial: function ({ errMsg }) {
        wx.showToast({
          title: '网络异常，请稍后重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },//取消收藏结束
  //点击分享按钮
  onShareAppMessage: function (res) {
    var that = this;
    var res_id = res.target.dataset.res_id;
    //var res_type = res.target.dataset.res_type;
    var openid = res.target.dataset.openid;
    var type   = res.target.dataset.type;
    var img_url = res.target.dataset.img_url;
    
    if (res.from === 'button') {
      // 转发成功
      wx.request({
        url: api_url+'/Smallapp/share/recLogs',
        header: {
          'content-type': 'application/json'
        },
        data: {
          'openid': openid,
          'res_id': res_id,
          'type': type,
          'status': 1,
        },
        success: function (e) {

          info.share_nums++;


          that.setData({
            info: info
          })

        },
        fial: function ({ errMsg }) {
          wx.showToast({
            title: '网络异常，请稍后重试',
            icon: 'none',
            duration: 2000
          })
        }
      })

      // 来自页面内转发按钮
      return {
        title: '发现一个好玩的东西',
        path: '/pages/share/video?res_id=' + res_id+'&type='+type,
        imageUrl: img_url,
        success: function (res) {
          
        },
      }
    }
  },// 分享结束
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