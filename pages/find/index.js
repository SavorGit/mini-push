// pages/find/index.js
const app = getApp()
var openid;
var page = 1;                    //当前节目单页数
var discovery_list;                //发现列表
var pubdetail;
var i;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    openid: '',
    hotel_name: '',   //酒楼名称
    room_name: '',    //包间名称
    box_mac: '',     //机顶盒mac
    is_link: 0,       //是否连接酒楼电视
    discovery_list:[],
    hiddens: true,
    box_mac: ''
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    if (app.globalData.openid && app.globalData.openid != '') {
      that.setData({
        openid: app.globalData.openid
      })
      //注册用户
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
                data: { 'openid': openid },
              })
            }
          })
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
              is_link: 1,
              hotel_name: rest.data.result.hotel_name,
              room_name: rest.data.result.room_name,
              box_mac: rest.data.result.box_mac,
            })
            //getHotelInfo(rest.data.result.box_mac);
            /*var box_mac = rest.data.result.box_mac;
            wx.navigateTo({
              url: '/pages/forscreen/forscreen?scene=' + box_mac,
            })*/
          } else {

          }

        }
      })
    } else {
      app.openidCallback = openid => {
        if (openid != '') {
          that.setData({
            openid: openid
          })
          //注册用户

          wx.getUserInfo({
            success: function (res) {
              wx.request({
                url: 'https://mobile.littlehotspot.com/smallapp/User/register',
                data: {
                  "openid": app.globalData.openid,
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
                  is_link: 1,
                  //hotel_name: rest.data.result.hotel_name,
                  //room_name: rest.data.result.room_name,
                  //box_mac: rest.data.result.box_mac,
                })
                //getHotelInfo(rest.data.result.box_mac);
              }
            }
          })
        }
      }
    }
    function getHotelInfo(box_mac) {
      wx.request({
        url: 'https://mobile.littlehotspot.com/Smallapp/Index/getHotelInfo',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          box_mac: box_mac,
        },
        method: "POST",
        success: function (res) {
          that.setData({
            hotel_room: res.data.result.hotel_name + res.data.result.room_name,
            happy_vedio_url: res.data.result.vedio_url,
            happy_vedio_name: res.data.result.file_name,
            happy_vedio_title: res.data.result.name,
          })
        }
      })
    }
    //获取发现列表
    wx.request({
      url: 'https://mobile.littlehotspot.com/smallapp/Discovery/index',
      data: {
        page: page,
        openid: openid,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.code == 10000) {
          discovery_list = res.data.result
          that.setData({
            discovery_list: res.data.result,
          })
        }
      }
    })
    
  },
  previewImage: function (e) {
    var current = e.target.dataset.src;
    var pkey = e.target.dataset.pkey;
    var urls = [];
    for (var row in current) {
      urls[row] = current[row]['res_url']

    }
    console.log(pkey);
    wx.previewImage({
      current: urls[pkey], // 当前显示图片的http链接
      urls: urls // 需要预览的图片http链接列表
    })
  },
  //上拉刷新
  loadMore: function (e) {
    var that = this;
    var openid = e.target.dataset.openid;
    page = page + 1;
    that.setData({
      hiddens: false,
    })
    wx.request({
      url: 'https://mobile.littlehotspot.com/smallapp/Discovery/index',
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
            discovery_list: res.data.result,
            hiddens: true,
          })
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
      pubdetail = e.currentTarget.dataset.pubdetail;
      var forscreen_char = '';
      var res_type = e.currentTarget.dataset.res_type;
      var mobile_brand = app.globalData.mobile_brand;
      var mobile_model = app.globalData.mobile_model;
      if(res_type==1){
        var action= 11;   //发现图片点播
      }else if(res_type==2){
        var action = 12;  //发现视频点播
      }
      var res_len = e.currentTarget.dataset.res_nums;
      var forscreen_id = (new Date()).valueOf();

      if(res_type==1){
        for (i = 0; i < res_len; i++) {
          var order = i + 1;
          wx.request({//start
            url: 'https://mobile.littlehotspot.com/Smallapp/index/recordForScreenPics',
            header: {
              'content-type': 'application/json'
            },
            data: {
              forscreen_id: forscreen_id,
              openid: openid,
              box_mac: box_mac,
              action: action,
              mobile_brand: mobile_brand,
              mobile_model: mobile_model,
              forscreen_char: forscreen_char,
              imgs: '["' + pubdetail[i]['forscreen_url'] + '"]',
              resource_id: pubdetail[i]['res_id'],
              res_sup_time: 0,
              res_eup_time: 0,
              resource_size: pubdetail[i]['resource_size'],
              is_pub_hotelinfo: 0,
              is_share: 0
            },
            success: function (ret) {
            }
            


          });//end
          var url = pubdetail[i]['forscreen_url'];
          var filename = pubdetail[i]['filename'];
          var res_id = pubdetail[i]['res_id'];

          wx.request({
            url: "https://netty-push.littlehotspot.com/push/box",
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            data: {
              box_mac: box_mac,
              cmd: 'call-mini-program',
              msg: '{ "action": 4, "resource_type":2, "url":"' + url + '","filename":"' + filename + '","openid":"' + openid + '","img_nums":' + res_len + ',"forscreen_char":"' + forscreen_char + '","order":' + order + ',"forscreen_id":"' + forscreen_id + '","img_id":"' + res_id + '"}',
              req_id: res_id
            },
            success: function (result) {

              wx.showToast({
                title: '点播成功,电视即将开始播放',
                icon: 'none',
                duration: 2000
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
      }else {//视频投屏
        for (i = 0; i < res_len; i++) {
          wx.request({
            url: 'https://mobile.littlehotspot.com/Smallapp/index/recordForScreenPics',
            header: {
              'content-type': 'application/json'
            },
            data: {
              openid: openid,
              box_mac: box_mac,
              action: 12,

              mobile_brand: mobile_brand,
              mobile_model: mobile_model,
              forscreen_char: forscreen_char,
              imgs: '["' + pubdetail[i]['forscreen_url'] + '"]',
              resource_id: pubdetail[i]['res_id'],
              res_sup_time: 0,
              res_eup_time: 0,
              resource_size: pubdetail[i]['resource_size'],
              is_pub_hotelinfo: 0,
              is_share: 0,
              forscreen_id: forscreen_id,
              duration: pubdetail[i]['duration'],
            },
            success: function (ret) {

            }
          });

          wx.request({
            url: "https://netty-push.littlehotspot.com/push/box",
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            data: {
              box_mac: box_mac,
              cmd: 'call-mini-program',
              msg: '{ "action":2, "url": "' + pubdetail[i]['forscreen_url'] + '", "filename":"' + pubdetail[i]['filename'] + '","openid":"' + openid + '","resource_type":2,"video_id":"' + pubdetail[i]['res_id'] + '"}',
              req_id: pubdetail[i]['res_id']
            },
            success: function (result) {

              wx.showToast({
                title: '点播成功,电视即将开始播放',
                icon: 'none',
                duration: 2000
              });
            },
            fail: function (res) {
              wx.showToast({
                title: '网络异常,点播失败',
                icon: 'none',
                duration: 2000
              })
            }
          });
        } 
      }
    }
  },//电视播放结束
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.onLoad()
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