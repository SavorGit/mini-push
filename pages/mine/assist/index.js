// pages/mine/assist/index.js
const app = getApp()
var api_url = app.globalData.api_url;
var openid;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    var forscreen_id = options.forscreen_id;
    if (app.globalData.openid && app.globalData.openid != '') {
      that.setData({
        openid: app.globalData.openid
      })
      openid = app.globalData.openid;
      //判断用户是否注册
      wx.request({
        url: api_url + '/smallapp21/User/isRegister',
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
          if (res.data.result.userinfo.is_wx_auth != 3) {
            that.setData({
              showModal: true
            })
          }
        },
        fail: function (e) {
          wx.setStorage({
            key: 'savor_user_info',
            data: {
              'openid': app.globalData.openid
            },
          })
        }
      }); //判断用户是否注册结束
      //获取助力的内容
      getAssistInfo(app.globalData.openid, forscreen_id);
    } else {
      app.openidCallback = openid => {
        if (openid != '') {
          that.setData({
            openid: openid
          })
          openid = openid;
          //判断用户是否注册
          wx.request({
            url: api_url + '/smallapp21/User/isRegister',
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
              if (res.data.result.userinfo.is_wx_auth != 3) {
                that.setData({
                  showModal: true
                })
              }
            },
            fail: function (e) {
              wx.setStorage({
                key: 'savor_user_info',
                data: {
                  'openid': openid
                },
              })
            }
          }); //判断用户是否注册结束
          //获取助力的内容
          getAssistInfo(openid, forscreen_id);
        }
      }
    }
    //热播内容
    wx.request({
      url: api_url + '/aa/bb/cc',
      headers: {
        'Content-Type': 'application/json'
      },
      method: "POST",
      success: function (res) {
        if (res.data.code == 10000) {
          that.setData({
            hot_play: res.data.result
          })
        }
      }
    })

    function getAssistInfo(openid,forscreen_id){
      wx.request({
        url: api_url+'/aa/bb/cc',
        headers: {
          'Content-Type': 'application/json'
        },
        method: "POST",
        
        success:function(res){
          if(res.data.code==10000){

          }
        }
      })
    }
  },
  assist:function(e){
    var that = this;
    var user_info = wx.getStorageSync('savor_user_info');
    var openid = user_info.openid;
    if(user_info.is_wx_auth!=3){
      that.setData({
        showModel:true
      })
    }else {
      wx.request({
        url: api+'/aa/bb/cc',
        header: {
          'content-type': 'application/json'
        },
        method:'POST',
        success:function(res){
          if(res.data.code==10000){

          }else {
            wx.showToast({
              title: res.data.msg,
              icon:'none',
              duration:2000
            })
            that.setData({
              assist_desc:res.data.msg,
              is_btn_disable: true
            })
          }
        }
      })
    }
  },
  onGetUserInfo: function (res) {
    var that = this;

    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    if (res.detail.errMsg == 'getUserInfo:ok') {
      wx.getUserInfo({
        success(rets) {
          wx.request({
            url: api_url + '/smallapp3/User/registerCom',
            data: {
              'openid': openid,
              'avatarUrl': rets.userInfo.avatarUrl,
              'nickName': rets.userInfo.nickName,
              'gender': rets.userInfo.gender,
              'session_key': app.globalData.session_key,
              'iv': rets.iv,
              'encryptedData': rets.encryptedData
            },
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {
              if (res.data.code == 10000) {
                wx.setStorage({
                  key: 'savor_user_info',
                  data: res.data.result,
                });
                that.setData({
                  showModal: false,
                })
              } else {
                wx.showToast({
                  title: '微信授权登陆失败，请重试',
                  icon: 'none',
                  duration: 2000,

                })
              }

            },
            fail: function (res) {
              wx.showToast({
                title: '微信登陆失败，请重试',
                icon: 'none',
                duration: 2000
              });
            }
          })
        }
      })
    } else {
      wx.request({
        url: api_url + '/smallapp21/User/refuseRegister',
        data: {
          'openid': openid,
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          if (res.data.code == 10000) {
            user_info['is_wx_auth'] = 1;
            wx.setStorage({
              key: 'savor_user_info',
              data: user_info,
            })

          } else {
            wx.showToast({
              title: '拒绝失败,请重试',
              icon: 'none',
              duration: 2000
            });
          }

        }
      })
    }


  },
  //关闭授权弹窗
  closeAuth: function () {
    //关闭授权登陆埋点
    var that = this;
    that.setData({
      showModal: false,
    })
    var user_info = wx.getStorageSync("savor_user_info");
   
    wx.request({
      url: api_url + '/Smallapp21/index/closeauthLog',
      header: {
        'content-type': 'application/json'
      },
      data: {
        openid: openid,
        box_mac: '',
      },

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
  onShareAppMessage: function (res) {
    var that = this;
    var forscreen_id = res.target.dataset.forscreen_id;
    var video_img = res.target.dataset.video_img;
    var title ="快来帮我助力";
    if (res.from === 'button') {
      // 转发成功
      // 来自页面内转发按钮
      return {
        title: video_name,
        path: '/pages/mine/video?res_id=' + res_id + '&type=3',
        imageUrl: video_img,
        success: function (res) {

        }
      }
    }
  },// 分享结束
})