// pages/find/index.js
const app = getApp()
var openid;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid: '',
    is_link: 0,       //是否连接酒楼电视
    
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
              //hotel_name: rest.data.result.hotel_name,
              //room_name: rest.data.result.room_name,
              //box_mac: rest.data.result.box_mac,
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