// pages/demand/goods_detail.js
const app = getApp()
var api_url = app.globalData.api_url;
var box_mac;
var goods_info;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    goods_info:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    var user_info = wx.getStorageSync('savor_user_info');
    var openid  = user_info.openid;
    box_mac = options.box_mac;
    var goods_id = options.goods_id;
    wx.request({
      url: api_url + '/Smallapp3/optimize/detail',
      header: {
        'content-type': 'application/json'
      },
      data:{
        goods_id : goods_id,
        openid:openid,
      },
      success: function(res) {
        if (res.data.code == 10000) {
          goods_info = res.data.result
          that.setData({
            goods_info :res.data.result
          })
        }
      }
    })

  },
  //电视播放
  boxShow: function(e) {
    var forscreen_id = e.currentTarget.dataset.goods_id;

    var pubdetail = e.currentTarget.dataset.pubdetail;
    var res_type = e.currentTarget.dataset.media_type;
    var res_nums = 1;
    app.boxShow(box_mac, forscreen_id, pubdetail, res_type, res_nums);
  },
  clickBuyGoods:function(e){
    var user_info = wx.getStorageSync('savor_user_info');
    var openid = user_info.openid;
    var goods_id = e.currentTarget.dataset.goods_id;
    wx.request({
      url: api_url +'/Smallapp3/datalog/recordlog',
      header: {
        'content-type': 'application/json'
      },
      data:{
        openid:openid,
        data_id:goods_id,
        action_type:3,
        type:2
      },
      success:function(res){

      }
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
  //电视播放
  boxShow: function (e) {
    console.log(e);
    var forscreen_id = e.currentTarget.dataset.gods_id;

    var pubdetail = e.currentTarget.dataset.pubdetail;
    var res_type = 2;
    var res_nums = 1;
    app.boxShow(box_mac, forscreen_id, pubdetail, res_type, res_nums);
  },
  //收藏资源
  onCollect: function (e) {
    var that = this;
    //var openid = e.target.dataset.openid;
    var res_id = e.target.dataset.res_id;
    var user_info = wx.getStorageSync('savor_user_info');
    var openid = user_info.openid;
    var res_type = 4;
    wx.request({
      url: api_url + '/Smallapp/collect/recLogs',
      header: {
        'content-type': 'application/json'
      },
      data: {
        'openid': openid,
        'res_id': res_id,
        'type': res_type,
        'status': 1,
      },
      success: function (e) {
        goods_info.is_collect = 1;
        goods_info.collect_num = e.data.result.nums;
        that.setData({
          goods_info: goods_info
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
    var user_info = wx.getStorageSync('savor_user_info');
    var openid = user_info.openid;
    var res_type = 4;
    wx.request({
      url: api_url + '/Smallapp/collect/recLogs',
      header: {
        'content-type': 'application/json'
      },
      data: {
        'openid': openid,
        'res_id': res_id,
        'type': res_type,
        'status': 0,
      },
      success: function (e) {
        goods_info.is_collect=0;
        goods_info.collect_num = e.data.result.nums;
        that.setData({
          goods_info: goods_info
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
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(res) {
    var that = this;
    var user_info = wx.getStorageSync('savor_user_info');
    var openid = user_info.openid;
    var res_id = res.target.dataset.res_id;
    var img_url = res.target.dataset.img_url;

    var goods_id = res.target.dataset.goods_id;

    if (res.from === 'button') {
      // 转发成功
      wx.request({
        url: api_url + '/Smallapp/share/recLogs',
        header: {
          'content-type': 'application/json'
        },
        data: {
          'openid': openid,
          'res_id': goods_id,
          'type': 4,
          'status': 1,
        },
        success: function (e) {
          goods_info.share_num ++;

          
          that.setData({
            goods_info: goods_info
          })

        },
        fail: function ({ errMsg }) {
          wx.showToast({
            title: '网络异常，请稍后重试',
            icon: 'none',
            duration: 2000
          })
        }
      })
      // 来自页面内转发按钮
      return {
        title: '热点聚焦，投你所好',
        path: '/pages/demand/goods_detail?goods_id=' + goods_id + '&box_mac=',
        imageUrl: img_url,
        success: function (res) {


        },
      }
    }
  }
})