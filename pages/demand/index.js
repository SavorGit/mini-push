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
    box_mac: ''
  },  

  onLoad: function () {
    wx.hideShareMenu();
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
        url: 'https://mobile.littlehotspot.com/smallapp21/User/isRegister',
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
            url: 'https://mobile.littlehotspot.com/smallapp21/User/isRegister',
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
      url: 'https://mobile.littlehotspot.com/Smallapp/index/isHaveCallBox?openid=' + openid,
      headers: {
        'Content-Type': 'application/json'
      },

      success: function (rest) {
        var is_have = rest.data.result.is_have;
        if (is_have == 1) {
          that.setData({
            box_mac: rest.data.result.box_mac,
          });
          box_mac = rest.data.result.box_mac;
          //获取节目单列表
          wx.request({//获取机顶盒节目单列表
            url: 'https://mobile.littlehotspot.com/Smallapp3/Demand/getBoxProgramList',
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
            url: 'https://mobile.littlehotspot.com/Smallapp3/Demand/getDemanList',
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
    
    
  },
  //呼大码
  callQrCode: function (e) {
    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    //console.log(openid);
    if (box_mac) {
      var timestamp = (new Date()).valueOf();
      var qrcode_url = 'https://mobile.littlehotspot.com/Smallapp/index/getBoxQr?box_mac=' + box_mac + '&type=3';
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
                  wx.request({
                    url: 'https://mobile.littlehotspot.com/Netty/Index/index',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    method: "POST",
                    data: {
                      box_mac: box_mac,
                      msg: '{ "action": 9,"url":"' + qrcode_url + '"}',
                    },
                    success: function () {
                      wx.showToast({
                        title: '呼玛成功，电视即将展示',
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
                          action: 9,
                          mobile_brand: mobile_brand,
                          mobile_model: mobile_model,
                          imgs: '[]'
                        },

                      })
                    }
                  })
                }else {

                }
              }
            })
          }else {
            wx.request({
              url: 'https://mobile.littlehotspot.com/Netty/Index/index',
              headers: {
                'Content-Type': 'application/json'
              },
              method: "POST",
              data: {
                box_mac: box_mac,
                msg: '{ "action": 9,"url":"' + qrcode_url + '"}',
              },
              success: function () {
                wx.showToast({
                  title: '呼玛成功，电视即将展示',
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
                    action: 9,
                    mobile_brand: mobile_brand,
                    mobile_model: mobile_model,
                    imgs: '[]'
                  },

                })
              }
            })
          }
        }
      })


      
    }
  },//呼大码结束
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
    var box_mac = e.currentTarget.dataset.boxmac;
    page = page + 1;
    that.setData({
      hiddens: false,
    })
    if(box_mac=='' || box_mac ==undefined){
      wx.request({
        //url: 'https://mobile.littlehotspot.com/smallapp/Demand/getList',
        url: 'https://mobile.littlehotspot.com/Smallapp3/Demand/getDemanList',
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
        //url: 'https://mobile.littlehotspot.com/Smallapp/BoxProgram/getBoxProgramList',
        url: 'https://mobile.littlehotspot.com/Smallapp3/Demand/getBoxProgramList',
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
          if(is_forscreen==1){
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
                      if(res.data.code==10000){
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
                if(res.data.code==10000){
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
        url: 'https://mobile.littlehotspot.com/Smallapp/share/recLogs',
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
        path: '/pages/forscreen/video/launch_video?video_url=' + video_url + '&video_name=' + video_name,
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
      url: 'https://mobile.littlehotspot.com/Smallapp/index/recordForScreenPics',
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
  }
})
