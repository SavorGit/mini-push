// pages/mine/assist/index.js
const app = getApp()
var api_url = app.globalData.api_url;
var openid;
var inside = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    picinfo: [],
    is_assist:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options);
    var that = this;
    var forscreen_id = options.forscreen_id;
    var box_mac      = options.box_mac;
    if (typeof (options.inside) != 'undefined') {
      inside = options.inside;
    }
    that.setData({
      forscreen_id:forscreen_id,
      box_mac:box_mac,
      inside: inside
    })
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
      //获取助力好友
      getAssistFriends(app.globalData.openid,forscreen_id);
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
          //获取助力好友
          getAssistFriends(app.globalData.openid, forscreen_id);
        }
      }
    }
    //热播内容
    wx.request({
      url: api_url + '/Smallapp3/content/getHotplaylist',
      headers: {
        'Content-Type': 'application/json'
      },
      method: "POST",
      data:{
        page:1,
        pagesize:3
      },
      success: function (res) {
        if (res.data.code == 10000) {
          console.log(res.data.result);
          that.setData({
            hot_play: res.data.result.datalist
          })
        }
      }
    })

    function getAssistInfo(openid,forscreen_id){
      wx.request({
        url: api_url +'/Smallapp3/ForscreenHelp/detail',
        headers: {
          'Content-Type': 'application/json'
        },
        method: "POST",
        data:{
          openid:openid,
          forscreen_id:forscreen_id
        },success:function(res){
          if(res.data.code==10000){
            var is_assist ;
            if(res.data.result.status==3){
              is_assist= true
            }else {
              is_assist = false
            }
            var pubdetail = [{'res_url':''}];
            
            for(var i=0;i<1;i++){
              pubdetail[i]['res_url'] = res.data.result.img_url;
            }
            console.log('dfdafad');
            that.setData({
              assist_info:res.data.result,
              is_assist: is_assist,
              pubdetail: pubdetail,
            })
          }
        }
      })
    }
    function getAssistFriends(openid, forscreen_id){
      wx.request({
        url: api_url + '/Smallapp3/ForscreenHelp/userlist',
        headers: {
          'Content-Type': 'application/json'
        },
        method: "POST",
        data: {
          forscreen_id: forscreen_id,
          page:1,
          pagesize:7,
        }, success: function (res) {
          if (res.data.code == 10000) {
            that.setData({
              assist_frieds: res.data.result.datalist,
              assist_frieds_nums: res.data.result.total_num
            })
          }
        }
      })
    }
  },
  assist:function(e){
    var that = this;
    var user_info = wx.getStorageSync('savor_user_info');
    var openid = user_info.openid;
    var help_id = e.target.dataset.help_id;
    var forscreen_id = e.target.dataset.forscreen_id;
    var mobile_brand = app.globalData.mobile_brand;
    var mobile_model = app.globalData.mobile_model;
    var box_mac = e.target.dataset.box_mac;
    var forscreen_url  = e.target.dataset.forscreen_url;
    var resource_type = e.target.dataset.media_type;
    var timestamp = (new Date()).valueOf();
    if(user_info.is_wx_auth!=3){
      that.setData({
        showModel:true
      })
    }else {
      wx.request({
        url: api_url +'/Smallapp3/ForscreenHelp/addhelp',
        header: {
          'content-type': 'application/json'
        },
        method:'POST',
        data:{
          help_id:help_id,
          openid:openid
        },
        success:function(res){
          if(res.data.code==10000){
            that.setData({
              is_assist:true
            })
            wx.request({
              url: api_url + '/Smallapp3/ForscreenHelp/userlist',
              headers: {
                'Content-Type': 'application/json'
              },
              method: "POST",
              data: {
                forscreen_id: forscreen_id,
                page: 1,
                pagesize: 7,
              }, success: function (res) {
                if (res.data.code == 10000) {
                  that.setData({
                    assist_frieds: res.data.result.datalist,
                    assist_frieds_nums: res.data.result.total_num
                  })
                }
              }
            })
            wx.request({
              url: that.globalData.api_url + '/Smallapp/index/recordForScreenPics',
              header: {
                'content-type': 'application/json'
              },
              data:{
                forscreen_id: timestamp,
                openid: openid,
                box_mac: box_mac,
                action: 50,
                mobile_brand: mobile_brand,
                mobile_model: mobile_model,
                imgs: '[' + forscreen_url+']',
                resource_type: resource_type
              }
              
            })
          }else {
            wx.showToast({
              title: res.data.msg,
              icon:'none',
              duration:2000
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
  phonecallevent: function (e) {
    var tel = e.target.dataset.tel;
    wx.makePhoneCall({
      phoneNumber: tel
    })
  },
  //预览图片
  previewImage: function (e) {
    var current = e.target.dataset.src;
    var pkey = e.target.dataset.pkey;
    var urls = [];
    for (var row in current) {
      urls[row] = current[row]['res_url']

    }
    //console.log(pkey);
    wx.previewImage({
      current: urls[pkey], // 当前显示图片的http链接
      urls: urls // 需要预览的图片http链接列表
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
    console.log(res);
    var that = this;
    var forscreen_id = res.target.dataset.forscreen_id;
    var box_mac      = res.target.dataset.box_mac;
    console.log(forscreen_id);
    var img_url = res.target.dataset.img_url;
    var title ="快来帮我助力";
    if (res.from === 'button') {
      wx.reportAnalytics('invite_friends_report', {
        num: 1,
      });
      // 转发成功
      // 来自页面内转发按钮
      return {
        title: title,
        path: '/pages/mine/assist/index?forscreen_id=' + forscreen_id +'&box_mac='+box_mac ,
        imageUrl: img_url,
        success: function (res) {

        }
      }
    }
  },// 分享结束
})