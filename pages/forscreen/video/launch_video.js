// pages/forscreen/video/launch_video.js
const util = require('../../../utils/util.js')
var mta = require('../../../utils/mta_analysis.js')
const app = getApp()
var box_mac;
var openid;
var api_url = app.globalData.api_url;
var pageid  = 31;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    video_url:'',
    video_name:'',
    is_replay_disabel:false,
    showControl: false,   //显示授权登陆弹窗,
    is_box_show:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    var that = this;
    var user_info = wx.getStorageSync("savor_user_info");
    var res_id     = options.res_id;  //资源id
    var video_url  = options.video_url;
    var video_name = decodeURIComponent(options.video_name);
    box_mac    = options.box_mac;
    openid = user_info.openid;
    var filename = options.filename;
    var video_img_url = options.video_img_url;
    //wx.hideShareMenu();

    wx.request({
      url: api_url+'/Smallapp4/index/isHaveCallBox?openid=' + openid,
      headers: {
        'Content-Type': 'application/json'
      },
      success:function(res){
        if (res.data.code == 10000 && res.data.result.is_have == 1){
          that.setData({
            is_open_simple: res.data.result.is_open_simple,
          })
        }
      }
    })
    

    var that = this;
    //获取节目单视频详情
    wx.request({
      url: api_url+'/Smallapp3/Demand/getVideoInfo',
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
      url: api_url+'/Smallapp/collect/recLogs',
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
      url: api_url+'/Smallapp/collect/recLogs',
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
        url: api_url+'/Smallapp3/share/recLogs',
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
        path: '/pages/share/video?res_id=' + res_id + '&type=3',
        imageUrl: video_img,
        success: function (res) {
          
        } 
      } 
    }
  },// 分享结束
  //电视播放
  boxShow(e) {
    var that = this;
    var box_mac = e.target.dataset.boxmac;
    
    if (box_mac == '') {
      app.scanQrcode(pageid);
    } else {
      var openid = e.currentTarget.dataset.openid;
      var vediourl = e.currentTarget.dataset.vediourl;
      var forscreen_char = e.currentTarget.dataset.name;
      var filename = e.currentTarget.dataset.filename;//文件名
      var timestamp = (new Date()).valueOf();
      var mobile_brand = app.globalData.mobile_brand;
      var mobile_model = app.globalData.mobile_model;
      wx.request({
        url: api_url+'/smallapp21/User/isForscreenIng',
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
                  that.setData({
                    is_box_show: true,
                  })
                  //console.log('用户点击确定')
                  var djs = 10;
                  that.setData({
                    is_replay_disabel: true
                  })

                  that.setData({
                    djs: djs
                  })
                  var timer8_0 = setInterval(function () {
                    djs -= 1;
                    that.setData({
                      djs: djs
                    });
                    if (djs == 0) {
                      that.setData({
                        is_replay_disabel: false,
                      })
                      clearInterval(timer8_0);
                    }

                  }, 1000);
                  wx.request({
                    url: api_url+'/Netty/Index/pushnetty',
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
                        url: api_url+'/Smallapp/index/recordForScreenPics',
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
            
            var djs = 10;
            that.setData({
              is_replay_disabel: true
            })

            that.setData({
              djs: djs,
              is_box_show: true,
            })
            var timer8_0 = setInterval(function () {
              djs -= 1;
              that.setData({
                djs: djs
              });
              if (djs == 0) {
                that.setData({
                  is_replay_disabel: false,
                })
                clearInterval(timer8_0);
              }

            }, 1000);
            wx.request({
              url: api_url+'/Netty/Index/pushnetty',
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
                  url: api_url+'/Smallapp/index/recordForScreenPics',
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
  //遥控呼大码
  callQrCode: util.throttle(function (e) {
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var qrcode_img = e.currentTarget.dataset.qrcode_img;
    app.controlCallQrcode(openid, box_mac, qrcode_img);
  }, 3000),//呼大码结束
  //打开遥控器
  openControl: function (e) {
    var that = this;
    var qrcode_url = api_url+'/Smallapp4/index/getBoxQr?box_mac=' + box_mac + '&type=3';
    that.setData({

      showControl: true,
      qrcode_img: qrcode_url
    })
    mta.Event.stat('openControl', { 'linktype': app.globalData.link_type })
  },
  //关闭遥控
  closeControl: function (e) {
    var that = this;
    that.setData({

      showControl: false,
    })
    mta.Event.stat("closecontrol", {})
  },
  //遥控退出投屏
  exitForscreen: function (e) {
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    app.controlExitForscreen(openid, box_mac);
  },
  //遥控调整音量
  changeVolume: function (e) {
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var change_type = e.currentTarget.dataset.change_type;
    app.controlChangeVolume(openid,box_mac, change_type);

  },
  //遥控切换节目
  changeProgram: function (e) {
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var change_type = e.currentTarget.dataset.change_type;
    app.controlChangeProgram(openid,box_mac, change_type);
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

  
})