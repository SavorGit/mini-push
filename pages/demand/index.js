//index.js
//获取应用实例
const util = require('../../utils/util.js')
const app = getApp()
var timestamp = (new Date()).valueOf();
var box_mac;                     //当前连接机顶盒mac
var page = 1;                    //当前节目单页数
var user_id;
var program_list;                //点播列表
var openid;                      //用户openid
var api_url = app.globalData.api_url;
Page({
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    openid: '',
    motto: '热点投屏',
    userInfo: {},
    hasUserInfo: false,
    tempFilePaths: '',
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    showView: true,
    imgUrls: [],
    hiddens: true,
    box_mac: '',
    showControl:false,

    indicatorDots: true,  //是否显示面板指示点
    autoplay: true,      //是否自动切换
    interval: 3000,       //自动切换时间间隔
    lb_duration: 1000,       //滑动动画时长
  },  

  onLoad: function () {
    //wx.hideShareMenu();
    var that = this;
    var user_info = wx.getStorageSync('savor_user_info')
    if (app.globalData.openid && app.globalData.openid != '') {
      //注册用户
      that.setData({
        openid: app.globalData.openid
      })
      openid = app.globalData.openid;
      //判断用户是否注册
      wx.request({
        url: api_url+'/smallapp21/User/isRegister',
        data: {
          "openid": app.globalData.openid,
          'page_id':1
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
              "page_id":1
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
    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    wx.request({
      url: api_url+'/Smallapp/index/isHaveCallBox?openid=' + openid,
      headers: {
        'Content-Type': 'application/json'
      },

      success: function (rest) {
        var is_have = rest.data.result.is_have;
        if (is_have == 1) {
          that.setData({
            box_mac: rest.data.result.box_mac,
            is_open_simple: rest.data.result.is_open_simple,
          });
          box_mac = rest.data.result.box_mac;
          //获取节目单列表
          wx.request({//获取机顶盒节目单列表
            url: api_url+'/Smallapp3/Demand/getBoxProgramList',
            header: {
              'Content-Type': 'application/json'
            },
            data: {
              box_mac: box_mac,
              page: page,
              openid: openid,
            },
            method: "POST",
            success: function (res) {
              program_list = res.data.result
              that.setData({
                program_list: res.data.result
              })
            }
          })
        } else {
          //获取小程序主节目单列表
          wx.request({
            url: api_url+'/Smallapp3/Demand/getDemanList',
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
          });
          that.setData({
            box_mac: '',
          })
          box_mac = '';
        }
      }
    })
    wx.request({
      url: api_url+'/Smallapp3/Adsposition/getAdspositionList',
      data: {
        position: 1,
      },
      success: function (res) {
        if (res.data.code == 10000) {
          var imgUrls = res.data.result;
          that.setData({
            imgUrls: res.data.result
          })
        }
      }
    })
    
  },
  //遥控呼大码
  callQrCode: util.throttle(function (e) {
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var qrcode_img = e.currentTarget.dataset.qrcode_img;
    app.controlCallQrcode(openid, box_mac, qrcode_img); 
  }, 3000),
  //呼大码结束
  //打开遥控器
  openControl:function(e){
    var that = this;
    var qrcode_url = api_url+'/Smallapp/index/getBoxQr?box_mac=' + box_mac + '&type=3';
    that.setData({
      showControl: true,
      qrcode_img: qrcode_url
    })
  },
  //关闭遥控
  closeControl:function(e){
    var that = this;
    that.setData({
      showControl: false,
    })
    
  },
  //遥控退出投屏
  exitForscreen:function(e){
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    app.controlExitForscreen(openid,box_mac);
  },
  //遥控调整音量
  changeVolume:function(e){
    box_mac = e.currentTarget.dataset.box_mac;
    var change_type = e.currentTarget.dataset.change_type;
    app.controlChangeVolume(box_mac, change_type);

  },
  //遥控切换节目
  changeProgram:function(e){
    box_mac = e.currentTarget.dataset.box_mac;
    var change_type = e.currentTarget.dataset.change_type;
    app.controlChangeProgram(box_mac, change_type);
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //this.onLoad()
  },
  
  //上拉刷新
  loadMore: function (e) {
    var that = this;
    var box_mac = e.currentTarget.dataset.boxmac;
    page = page + 1;
    that.setData({
      hiddens: false,
    })
    if(box_mac=='' || box_mac ==undefined){
      wx.request({
        //url: api_url+'/smallapp/Demand/getList',
        url: api_url+'/Smallapp3/Demand/getDemanList',
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
    }else {
      wx.request({
        //url: api_url+'/Smallapp/BoxProgram/getBoxProgramList',
        url: api_url+'/Smallapp3/Demand/getBoxProgramList',
        header: {
          'Content-Type': 'application/json'
        },
        data: {
          box_mac: box_mac,
          page: page,
          openid:openid,
        },
        method: "POST",
        success: function (res) {
          program_list = res.data.result
          that.setData({
            program_list: res.data.result,
            hiddens: true,
          })
        }
      })
    }
    
  },
  //电视播放
  boxShow(e) {
    var box_mac = e.target.dataset.boxmac;
    

    if (box_mac == '') {
      app.scanQrcode();
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
          if(is_forscreen==1){
            wx.showModal({
              title: '确认要打断投屏',
              content: '当前电视正在进行投屏,继续投屏有可能打断当前投屏中的内容.',
              success: function (res) {
                if (res.confirm) {
                  //console.log('用户点击确定')
                  wx.request({
                    url: api_url+'/Netty/Index/index',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    method: "POST",
                    data: {
                      box_mac: box_mac,
                      msg: '{ "action": 5,"url":"' + vediourl + '","filename":"' + filename + '","forscreen_id":' + timestamp + ',"resource_id":' + timestamp + '}',
                    },
                    success: function (res) {
                      if(res.data.code==10000){
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
                      }else {
                        wx.showToast({
                          title: '该电视暂不支持投屏',
                          icon: 'none',
                          duration: 2000
                        });
                      }
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
          }else {
            wx.request({
              url: api_url+'/Netty/Index/index',
              headers: {
                'Content-Type': 'application/json'
              },
              method: "POST",
              data: {
                box_mac: box_mac,
                msg: '{ "action": 5,"url":"' + vediourl + '","filename":"' + filename + '","forscreen_id":' + timestamp + ',"resource_id":' + timestamp + '}',
              },
              success: function (res) {
                if(res.data.code==10000){
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
                }else {
                  wx.showToast({
                    title: '该电视暂不支持投屏',
                    icon: 'none',
                    duration: 2000
                  });
                }
                
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
  //收藏资源
  onCollect: function (e) {
    var that = this;
    //var openid = e.target.dataset.openid;
    var res_id = e.target.dataset.res_id;
    var res_key = e.target.dataset.res_key;
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
        for (var i = 0; i < program_list.length; i++) {
          if (i == res_key) {
            program_list[i].is_collect = 1;
            program_list[i].collect_num++;
          }
        }
        that.setData({
          program_list: program_list
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
    var res_key = e.target.dataset.res_key;
    var res_type= e.target.dataset.type;
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
        for (var i = 0; i < program_list.length; i++) {
          if (i == res_key) {
            program_list[i].is_collect = 0;
            program_list[i].collect_num--;
          }
        }
        that.setData({
          program_list: program_list
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
    var openid = res.target.dataset.openid;
    var res_id = res.target.dataset.res_id;
    var res_key = res.target.dataset.res_key;
    var res_type= res.target.dataset.type;
    var video_url = res.target.dataset.video_url;
    var video_name = res.target.dataset.video_name;
    var video_img = res.target.dataset.video_img;
    
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
          'type': 3,
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
        path: '/pages/share/video?res_id='+res_id+'&type=3',
        imageUrl: video_img,
        success: function (res) {
          
          
        },
      }
    }
  },// 分享结束
  //查看视频播放记录日志
  demandLog:function(res){
    var openid = res.currentTarget.dataset.openid;
    var box_mac = res.currentTarget.dataset.box_mac;
    var mobile_brand = app.globalData.mobile_brand;
    var mobile_model = app.globalData.mobile_model; 
    var forscreen_char = res.currentTarget.dataset.title;
    var imgs = res.currentTarget.dataset.tx_url;
    var resource_id = res.currentTarget.dataset.id
    var timestamp = (new Date()).valueOf();
    var duration = res.currentTarget.dataset.duration;
    wx.request({
      url: api_url+'/Smallapp/index/recordForScreenPics',
      header: {
        'content-type': 'application/json'
      },
      data: {
        openid: openid,
        box_mac: box_mac,
        action: 21,
        resource_type: 2,
        mobile_brand: mobile_brand,
        mobile_model: mobile_model,
        forscreen_char: forscreen_char,
        imgs: '["' + imgs + '"]',
        resource_id: resource_id,
        res_sup_time: 0,
        res_eup_time: 0,
        resource_size: 0,
        is_pub_hotelinfo: 0,
        is_share: 0,
        forscreen_id: timestamp,
        duration: duration,
      },
    });
  },
  
})
