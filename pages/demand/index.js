//index.js
//获取应用实例
const app = getApp()
var timestamp = (new Date()).valueOf();
var box_mac;                     //当前连接机顶盒mac
var page = 1;                    //当前节目单页数
var user_id;
var program_list;                //点播列表
var openid;                      //用户openid
Page({
  data: {
    openid: '',
    motto: '热点投屏',
    userInfo: {},
    hasUserInfo: false,
    tempFilePaths: '',
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    showView: true,
    imgUrls: [],
    hiddens: true,
    box_mac: ''
  },

  onLoad: function () {
    var that = this;
    var user_info = wx.getStorageSync('savor_user_info')
    if (app.globalData.openid && app.globalData.openid != '') {
      //注册用户
      that.setData({
        openid: app.globalData.openid
      })
      openid = openid;
      wx.getUserInfo({
        success: function (res) {
          wx.request({
            url: 'https://mobile.littlehotspot.com/smallapp/User/register',
            data: {
              "openid": app.globalData.openid,
              "avatarUrl": res.userInfo.avatarUrl,
              "nickName": res.userInfo.nickName,
              "gender": res.userInfo.gender,
            },
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {
              wx.setStorage({
                key: 'savor_user_info',
                data: res.data.result,
              })
            },
            fail: function (e) {
              wx.setStorage({
                key: 'savor_user_info',
                data: { 'openid': app.globalData.openid },
              })
            }
          })
        },
        fail:function(){
          wx.request({
            url: 'https://mobile.littlehotspot.com/smallapp/User/register',
            data: {
              "openid": app.globalData.openid,

            },
            header: {
              'content-type': 'application/json'
            },
            success:function(){
              wx.setStorage({
                key: 'savor_user_info',
                data: { 'openid': app.globalData.openid },
              })
            }
          });
        }
      });
      wx.request({
        url: 'https://mobile.littlehotspot.com/Smallapp/index/isHaveCallBox?openid=' + app.globalData.openid,
        headers: {
          'Content-Type': 'application/json'
        },
        success: function (rest) {
          var is_have = rest.data.result.is_have;
          if (is_have == 1) {
            that.setData({
              box_mac: rest.data.result.box_mac,
            })

          }

        }
      })
    } else {
      app.openidCallback = openid => {
        if (openid != '') {
          that.setData({
            openid: openid
          })
          openid = openid;
          //注册用户

          wx.getUserInfo({
            success: function (res) {
              wx.request({
                url: 'https://mobile.littlehotspot.com/smallapp/User/register',
                data: {
                  "openid": openid,
                  "avatarUrl": res.userInfo.avatarUrl,
                  "nickName": res.userInfo.nickName,
                  "gender": res.userInfo.gender
                },
                header: {
                  'content-type': 'application/json'
                },
                success: function (res) {
                  wx.setStorage({
                    key: 'savor_user_info',
                    data: res.data.result,
                  })
                }
              })
            },
            fail: function (e) {
              wx.request({
                url: 'https://mobile.littlehotspot.com/smallapp/User/register',
                data: {
                  "openid": openid,

                },
                header: {
                  'content-type': 'application/json'
                },
                success: function () {
                  
                }
              });
              wx.setStorage({
                key: 'savor_user_info',
                data: { 'openid': openid },
              })
            }
          });
          wx.request({
            url: 'https://mobile.littlehotspot.com/Smallapp/index/isHaveCallBox?openid=' + openid,
            headers: {
              'Content-Type': 'application/json'
            },

            success: function (rest) {
              var is_have = rest.data.result.is_have;
              if (is_have == 1) {
                that.setData({
                  box_mac: rest.data.result.box_mac,
                })

              }

            }
          })
        }
      }
    }
    var user_info = wx.getStorageSync("savor_user_info");

    openid = user_info.openid;
    //获取点播列表
    wx.request({
      url: 'https://mobile.littlehotspot.com/smallapp/Demand/getList',
      data: {
        page: page,
        openid: openid,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.code == 10000) {
          program_list = res.data.result
          that.setData({
            program_list: res.data.result,
          })
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.onLoad()
  },
  scanqrcode() {
    wx.scanCode({
      onlyFromCamera: true,
      success: (res) => {
        //console.log(res);
        wx.navigateTo({
          url: '/' + res.path
        })
      }
    })
  },
  //上拉刷新
  loadMore: function (e) {
    var that = this;

    page = page + 1;
    that.setData({
      hiddens: false,
    })
    wx.request({
      url: 'https://mobile.littlehotspot.com/smallapp/Demand/getList',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        page: page,
        openid: openid,
      },
      method: "POST",
      success: function (res) {
        if (res.data.code == 10000) {
          that.setData({
            program_list: res.data.result,
            hiddens: true,
          })
          program_list = res.data.result
        } else {
          that.setData({
            hiddens: true,
          })
        }
      }
    })
  },
  //电视播放
  boxShow(e) {
    var box_mac = e.target.dataset.boxmac;
    if (box_mac == '') {
      wx.showModal({
        title: '提示',
        content: "您可扫码链接热点合作餐厅电视,使用此功能",
        showCancel: true,
        confirmText: '立即扫码',
        success: function (res) {
          if (res.confirm == true) {
            wx.scanCode({
              onlyFromCamera: true,
              success: (res) => {
                //console.log(res);
                wx.navigateTo({
                  url: '/' + res.path
                })
              }
            })
          }

        }
      });
    } else {
      var openid = e.currentTarget.dataset.openid;
      var vediourl = e.currentTarget.dataset.vediourl;
      var forscreen_char = e.currentTarget.dataset.name;

      var index1 = vediourl.lastIndexOf("/");
      var index_ask = vediourl.lastIndexOf("?");
      if (index_ask > 0) {
        var index2 = index_ask
      } else {
        var index2 = vediourl.length;
      }
      var filename = vediourl.substring(index1 + 1, index2);//文件名
      var timestamp = (new Date()).valueOf();
      var mobile_brand = app.globalData.mobile_brand;
      var mobile_model = app.globalData.mobile_model;
      wx.request({
        url: "https://netty-push.littlehotspot.com/push/box",
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        method: "POST",
        data: {
          box_mac: box_mac,
          cmd: 'call-mini-program',
          msg: '{ "action": 5,"url":"' + vediourl + '","filename":"' + filename + '"}',
          req_id: timestamp
        },
        success: function (res) {
          wx.showToast({
            title: '点播成功,电视即将开始播放',
            icon: 'none',
            duration: 2000
          });
          wx.request({
            url: 'https://mobile.littlehotspot.com/Smallapp/index/recordForScreenPics',
            header: {
              'content-type': 'application/json'
            },
            data: {
              openid: openid,
              box_mac: box_mac,
              action: 5,
              mobile_brand: mobile_brand,
              mobile_model: mobile_model,
              forscreen_char: forscreen_char,
              imgs: '["media/resource/' + filename + '"]'
            },
          });
        },
        fail: function (res) {
          wx.showToast({
            title: '网络异常,点播失败',
            icon: 'none',
            duration: 2000
          })
        }
      })
    }
  },//电视播放结束
  //收藏资源
  onCollect: function (e) {
    var that = this;
    //var openid = e.target.dataset.openid;
    var res_id = e.target.dataset.res_id;
    var res_key = e.target.dataset.res_key;
    wx.request({
      url: 'https://mobile.littlehotspot.com/Smallapp/collect/recLogs',
      header: {
        'content-type': 'application/json'
      },
      data: {
        'openid': openid,
        'res_id': res_id,
        'type': 1,
        'status': 1,
      },
      success: function (e) {
        for (var i = 0; i < program_list.length; i++) {
          if (i == res_key) {
            program_list[i].is_collect = 1;
            program_list[i].collect_num++;
          }
        }
        that.setData({
          program_list: program_list
        })
        if (e.data.code == 10000) {
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
        }
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
    var res_key = e.target.dataset.res_key;
    wx.request({
      url: 'https://mobile.littlehotspot.com/Smallapp/collect/recLogs',
      header: {
        'content-type': 'application/json'
      },
      data: {
        'openid': openid,
        'res_id': res_id,
        'type': 1,
        'status': 0,
      },
      success: function (e) {
        for (var i = 0; i < program_list.length; i++) {
          if (i == res_key) {
            program_list[i].is_collect = 0;
            program_list[i].collect_num--;
          }
        }
        that.setData({
          program_list: program_list
        })
        if (e.data.code == 10000) {
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
        }
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
    var openid = res.target.dataset.openid;
    var res_id = res.target.dataset.res_id;
    var res_key = res.target.dataset.res_key;
    var video_url = res.target.dataset.video_url;
    var video_name = res.target.dataset.video_name;
    var video_img = res.target.dataset.video_img;
    if (res.from === 'button') {
      // 来自页面内转发按钮
      return {
        title: video_name,
        path: '/pages/forscreen/video/launch_video?video_url=' + video_url + '&video_name=' + video_name,
        imageUrl: video_img,
        success: function (res) {
          // 转发成功
          wx.request({
            url: 'https://mobile.littlehotspot.com/Smallapp/share/recLogs',
            header: {
              'content-type': 'application/json'
            },
            data: {
              'openid': openid,
              'res_id': res_id,
              'type': 1,
              'status': 1,
            },
            success: function (e) {
              for (var i = 0; i < program_list.length; i++) {
                if (i == res_key) {
                  program_list[i].share_num++;
                }
              }
              that.setData({
                program_list: program_list
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
        },
      }
    }
  },// 分享结束
})
