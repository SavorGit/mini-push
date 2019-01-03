// pages/forscreen/video/launch_video.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    video_url:'',
    video_name:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var user_info = wx.getStorageSync("savor_user_info");
    var res_id     = options.res_id;  //资源id
    var video_url  = options.video_url;
    var video_name = options.video_name;
    var box_mac    = options.box_mac;
    var openid = user_info.openid;
    var filename = options.filename;
    var video_img_url = options.video_img_url;
    wx.hideShareMenu();
    var that = this;
    //获取节目单视频详情
    wx.request({
      url: 'https://mobile.littlehotspot.com/Smallapp3/Demand/getVideoInfo',
      data:{
        res_id : res_id,
        openid : openid,
      },
      success:function(res){
        that.setData({
          openid    : openid,
          res_id    : res_id,
          video_url : video_url,
          video_name: video_name,
          video_img_url: video_img_url,
          box_mac   : box_mac,
          openid    : openid,
          is_collect: res.data.result.is_collect,
          collect_num: res.data.result.collect_num,
          share_num : res.data.result.share_num,
          play_num  : res.data.result.play_num,
          res_type  : res.data.result.res_type, 
          filename  : filename,
        })
      }
    })
    
    
  },
  //收藏资源
  onCollect: function (e) {
    var that = this;
    var openid = e.target.dataset.openid;
    var res_id = e.target.dataset.res_id;
    
    var res_type = e.target.dataset.type;
    wx.request({
      url: 'https://mobile.littlehotspot.com/Smallapp/collect/recLogs',
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
        that.setData({
          is_collect:1,
          collect_num:e.data.result.nums,
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
  },//收藏资源结束
  //取消收藏
  cancCollect: function (e) {
    var that = this;
    var openid = e.target.dataset.openid;
    var res_id = e.target.dataset.res_id;
    
    var res_type = e.target.dataset.type;
    wx.request({
      url: 'https://mobile.littlehotspot.com/Smallapp/collect/recLogs',
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
       
      
        that.setData({
          is_collect: 0,
          collect_num: e.data.result.nums,
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
  },//取消收藏结束
  //点击分享按钮
  onShareAppMessage: function (res) {
    var that = this;
    var openid = res.target.dataset.openid;
    var res_id = res.target.dataset.res_id;
    
    var res_type = res.target.dataset.type;
    var video_url = res.target.dataset.video_url;
    var video_name = res.target.dataset.video_name;
    var video_img = res.target.dataset.video_img;
    var share_num = res.target.dataset.share_num;
    
    if (res.from === 'button') {
      
      // 转发成功
      share_num = share_num++;
      wx.request({
        url: 'https://mobile.littlehotspot.com/Smallapp3/share/recLogs',
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
          if(e.data.code==10000){
            that.setData({
              share_num: e.data.result.share_nums,
            })
          }
          

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
        title: video_name,
        path: '/pages/forscreen/video/launch_video?video_url=' + video_url + '&video_name=' + video_name,
        imageUrl: video_img,
        success: function (res) {
          
        } 
      } 
    }
  },// 分享结束
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
      var filename = e.currentTarget.dataset.filename;//文件名
      var timestamp = (new Date()).valueOf();
      var mobile_brand = app.globalData.mobile_brand;
      var mobile_model = app.globalData.mobile_model;
      wx.request({
        url: 'https://mobile.littlehotspot.com/smallapp21/User/isForscreenIng',
        headers: {
          'Content-Type': 'application/json'
        },
        method: "POST",
        data: { box_mac: box_mac },
        success: function (res) {
          var is_forscreen = res.data.result.is_forscreen;
          if (is_forscreen == 1) {
            wx.showModal({
              title: '确认要打断投屏',
              content: '当前电视正在进行投屏,继续投屏有可能打断当前投屏中的内容.',
              success: function (res) {
                if (res.confirm) {
                  //console.log('用户点击确定')
                  wx.request({
                    url: 'https://mobile.littlehotspot.com/Netty/Index/index',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    method: "POST",
                    data: {
                      box_mac: box_mac,
                      msg: '{ "action": 5,"url":"' + vediourl + '","filename":"' + filename + '","forscreen_id":' + timestamp + ',"resource_id":' + timestamp + '}',
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
                          forscreen_id: timestamp,
                          resource_id: timestamp,
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
                } else if (res.cancel) {
                  //console.log('用户点击取消')
                }
              }
            })
          } else {
            wx.request({
              url: 'https://mobile.littlehotspot.com/Netty/Index/index',
              headers: {
                'Content-Type': 'application/json'
              },
              method: "POST",
              data: {
                box_mac: box_mac,
                msg: '{ "action": 5,"url":"' + vediourl + '","filename":"' + filename + '","forscreen_id":' + timestamp + ',"resource_id":' + timestamp + '}',
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
                    forscreen_id: timestamp,
                    resource_id: timestamp,
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
        }
      })
      //return false;

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