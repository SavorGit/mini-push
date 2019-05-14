// pages/share/pic.js
const app = getApp()
var box_mac;
var openid;
var pubdetail;
var pub_info;
var i;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    pub_info:[],
    box_mac:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //wx.hideShareMenu();
    var that = this;
    var forscreen_id = options.forscreen_id;
    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    wx.request({
      url: 'https://mobile.littlehotspot.com/smallapp21/Discovery/showPic',
      data:{'forscreen_id':forscreen_id,
            'openid':openid,
            },
      success: function (res) {
        console.log(res.data.result);
        that.setData({
          pub_info:res.data.result,
          openid:openid
        })
      }
    })
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
            box_mac: rest.data.result.box_mac,
          })
          box_mac = rest.data.result.box_mac;
          //getHotelInfo(rest.data.result.box_mac);
        } else {
          that.setData({
            is_link: 0,
            box_mac: '',
          })
          box_mac = '';
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
    //console.log(pkey);
    wx.previewImage({
      current: urls[pkey], // 当前显示图片的http链接
      urls: urls // 需要预览的图片http链接列表
    })
  },
  
  //收藏资源
  onCollect: function (e) {
    var that = this;
    var openid = e.target.dataset.openid;
    var res_id = e.target.dataset.res_id;
    var pub_info = e.target.dataset.pub_info;
    wx.request({
      url: 'https://mobile.littlehotspot.com/Smallapp/collect/recLogs',
      header: {
        'content-type': 'application/json'
      },
      data: {
        'openid': openid,
        'res_id': res_id,
        'type': 2,
        'status': 1,
      },
      success: function (e) {
        var collect_nums = e.data.result.nums;
        pub_info.collect_num = collect_nums;
        pub_info.is_collect =1;
        that.setData({
          pub_info: pub_info
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
    var pub_info = e.target.dataset.pub_info;
    var openid = e.target.dataset.openid;
    wx.request({
      url: 'https://mobile.littlehotspot.com/Smallapp/collect/recLogs',
      header: {
        'content-type': 'application/json'
      },
      data: {
        'openid': openid,
        'res_id': res_id,
        'type': 2,
        'status': 0,
      },
      success: function (e) {
        var collect_nums = e.data.result.nums;
        pub_info.collect_num = collect_nums;
        pub_info.is_collect = 0;
        that.setData({
          pub_info: pub_info
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
    var res_type = res.target.dataset.res_type;
    var openid = res.target.dataset.openid;
    var pub_info = res.target.dataset.pub_info;
    var pubdetail = res.target.dataset.pubdetail;

    if (res_type == 1) {
      var img_url = pubdetail[0]['res_url'];
    } else {
      var img_url = pubdetail[0]['vide_img'];
    }

    if (res.from === 'button') {
      // 转发成功
      wx.request({
        url: 'https://mobile.littlehotspot.com/Smallapp/share/recLogs',
        header: {
          'content-type': 'application/json'
        },
        data: {
          'openid': openid,
          'res_id': res_id,
          'type': 2,
          'status': 1,
        },
        success: function (e) {

          pub_info.share_num++;


          that.setData({
            pub_info: pub_info
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
        path: '/pages/share/pic?forscreen_id='+res_id,
        imageUrl: img_url,
        success: function (res) {
          
        },
      }
    }
  },// 分享结束
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

  
})