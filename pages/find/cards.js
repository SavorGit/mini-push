// pages/find/cards.js
var app = getApp();
var utils = require("../../utils/util.js")
var api_url = app.globalData.api_url;
var page_num = 1;
var openid;
var box_mac;
var touchEvent = [];
var touchMoveExecuteTrip = '150rpx';
var systemInfo = app.SystemInfo;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: app.globalData.statusBarHeight,
    documentHeight: app.SystemInfo.documentHeight,
    screenBottomSpace: systemInfo.screenBottomSpace,
    cards_img: [],
    box_mac: '',
    marked_words:'暂无数据'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var self = this;
    self.touchMoveHandler = new utils.TouchMoveHandler(systemInfo, touchMoveExecuteTrip);

    //获取发现页面数据 
    if (app.globalData.openid && app.globalData.openid != '') {
      self.setData({
        openid: app.globalData.openid
      })
      openid = app.globalData.openid;
      //判断用户是否注册
      getJxcontents(app.globalData.openid);
      isregister(app.globalData.openid);
      ishavecallbox(app.globalData.openid);
      
      lead(app.globalData.openid);
    } else {
      app.openidCallback = openid => {
        if (openid != '') {
          self.setData({
            openid: openid
          })
          openid = openid;
          getJxcontents(openid);
          isregister(openid);
          ishavecallbox(openid);
          
          lead(openid);
        }
      }
    }


    //引导蒙层
    function lead(openid) {
      
      var user_info = wx.getStorageSync('savor_user_info');
      var guide_prompt = user_info.guide_prompt;
      if (guide_prompt.length == 0) {
        self.setData({
          findCardListGuidedMask: true,
        })
      } else {
        var is_lead = 1;
        for (var i = 0; i < guide_prompt.length; i++) {
          if (guide_prompt[i] == 5) {
            is_lead = 0;
            break;
          }
        }
        if (is_lead == 1) {
          self.setData({
            findCardListGuidedMask: true
          })
        }
      }
      

    }
    function isregister(openid) {
      wx.request({
        url: api_url + '/smallapp21/User/isRegister',
        data: {
          "openid": openid,
          "page_id": 2
        },
        header: {
          'content-type': 'application/json'
        },
        success: function(res) {
          wx.setStorage({
            key: 'savor_user_info',
            data: res.data.result.userinfo,
          })
        },
        fail: function(e) {
          wx.setStorage({
            key: 'savor_user_info',
            data: {
              'openid': openid
            },
          })
        }
      }); //判断用户是否注册结束
    }

    function ishavecallbox(openid) {
      wx.request({
        url: api_url + '/Smallapp/index/isHaveCallBox?openid=' + openid,
        headers: {
          'Content-Type': 'application/json'
        },

        success: function(rest) {
          var is_have = rest.data.result.is_have;
          if (is_have == 1) {

            self.setData({
              is_link: 1,
              hotel_name: rest.data.result.hotel_name,
              room_name: rest.data.result.room_name,
              box_mac: rest.data.result.box_mac,
              is_open_simple: rest.data.result.is_open_simple,
            })
            box_mac = rest.data.result.box_mac;

          } else {
            self.setData({
              is_link: 0,
              box_mac: '',
            })
            box_mac = '';
          }
        }
      })
    }

    function getJxcontents(openid) {
      wx.showLoading({
        title: '数据加载中',
      })
      wx.request({
        url: api_url + '/Smallapp3/Find/findlist',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          openid: openid,
        },
        success: function(res) {
          if (res.data.code == 10000) {
            self.setData({
              cards_img: res.data.result
            })
          } else {
            self.setData({
              showContinueModalPopWindow: true
            })
          }
          wx.hideLoading();
        },
        fail: function(res) {
          self.setData({
            showContinueModalPopWindow: true
          })
          wx.hideLoading();
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function(options) {

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

  
  goHome: function(e) {
    wx.reLaunch({
      url: '/pages/demand/index',
    })
  },
  getFindList: function(e) {
    var that = this;
    wx.request({
      url: api_url + '/Smallapp3/Find/findlist',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        openid: openid,
      },
      success: function(res) {
        if (res.data.code == 10000) {
          if(res.data.result.length==0){
            that.setData({
              marked_words:'亲～别划了，已经没有了^_^'
            })
          }
          that.setData({
            cards_img: res.data.result
          })
        } else {
          that.setData({
            showContinueModalPopWindow: true
          })
        }

      },
      fail: function(res) {
        that.setData({
          showContinueModalPopWindow: true
        })
      }
    })
  },
  /**
   * 点击事件
   */
  onClick: function(e) {
    var that = this;
    var res_type = e.currentTarget.dataset.res_type;
    var pop_video_url = e.currentTarget.dataset.res_url;
    //console.log(pop_video_url);
    if (res_type == 1) { //图片
      var current = e.currentTarget.dataset.src;

      var urls = [];
      for (var row in current) {
        urls[row] = current[row]['res_url']

      }
      wx.previewImage({
        current: urls[0], // 当前显示图片的http链接
        urls: urls // 需要预览的图片http链接列表
      })
    } else { //视频
      that.setData({
        showVideoWindow: true,
        pop_video_url: pop_video_url
      })
    }
  },
  /**
   * 手指触摸动作结束
   */
  onTouchEnd: function(e) {
    var self = this;
    var user_info = wx.getStorageSync('savor_user_info');
    var openid = user_info.openid;

    var id = e.currentTarget.dataset.id;

    var type = e.currentTarget.dataset.type;
    var forscreen_id = e.currentTarget.dataset.forscreen_id;
    if (type == 2 || type == 3) {
      var res_id = forscreen_id;
      var c_type = 2;
    } else {
      var res_id = id;
      var c_type = 3
    }

    touchEvent["touchEnd"] = touchEvent.pop();
    this.touchMoveHandler.touchMoveHandle(self, touchEvent["touchStart"], touchEvent["touchEnd"], function(handleEvent, page, startEvent, endEvent, top, left, x) {
      if (handleEvent == self.touchMoveHandler.Event.LeftSlideMoved || handleEvent == self.touchMoveHandler.Event.RightSlideMoved) {
        wx.request({
          url: api_url + '/Smallapp3/Find/recordViewfind',
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            openid: openid,
            id: id,
            type: type,
          },
        })
      }
      

      if (handleEvent == self.touchMoveHandler.Event.InsufficientData) {
        var cards_img = self.data.cards_img;
        var tmp = '[';
        var space = '';
        for (var i = 0; i < cards_img.length; i++) {
          tmp += space + '{"id":' + cards_img[i].id + ',"type":' + cards_img[i].type + '}';
          space = ',';
        }
        tmp += ']';
        //console.log(tmp);
        wx.request({
          url: api_url + '/Smallapp3/Find/findlist',
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            openid: openid,
            find_ids: tmp
          },
          success: function(res) {
            if (res.data.code == 10000) {
              var list_info = res.data.result;
              for (var k = 0; k < list_info.length; k++) {
                self.data.cards_img.push(list_info[k]);
              }
              if(res.data.result.length==0){
                self.setData({
                  marked_words:'亲～别划了，已经没有了^_^'
                })
              }
              //self.data.cards_img.push(res.data.result);

            } else {
              self.setData({
                showContinueModalPopWindow: true,
              })
            }
          },
          fail: function(res) {
            page_num--;
            self.setData({
              showContinueModalPopWindow: true,
            })
          }
        })
      }
      //console.log(handleEvent, page, startEvent, endEvent, top, left, x);
    });
    delete touchEvent["touchStart"];
    delete touchEvent["touchEnd"];
  },
  /**
   * 手指触摸后移动
   */
  onTouchMove: function(e) {
    var self = this;
    touchEvent[0] = e;
    if (typeof(touchEvent["touchStart"]) != 'object' || touchEvent["touchStart"] == null) {
      touchEvent["touchStart"] = e;
      return;
    }

    var tripX = e.touches[0].pageX - touchEvent["touchStart"].touches[0].pageX;
    var tripY = e.touches[0].pageY - touchEvent["touchStart"].touches[0].pageY + systemInfo.statusBarHeight + 46;
    var animation = wx.createAnimation({
      duration: 0,
      // timingFunction: 'cubic-bezier(.8,.2,.1,0.8)',
      timingFunction: 'linear'
    });
    animation.left(tripX).top(tripY).step({
      duration: 0,
      timingFunction: 'linear'
    });
    this.setData({
      animationData: animation.export()
    });
    setTimeout(function() {
      self.setData({
        animationData: {}
      });
    }, 0);
  },
  /**
   * 点击不喜欢
   */
  flyLeft: function(e) {
    var user_info = wx.getStorageSync('savor_user_info');
    var openid = user_info.openid;
    var id = e.currentTarget.dataset.id;
    var type = e.currentTarget.dataset.type;
    var self = this;
    self.touchMoveHandler.clickMoveHandle(self, self.touchMoveHandler.SlideType.LeftSlide, '1350rpx', e, function(handleEvent, page, startEvent, endEvent, top, left, x) {
      if (handleEvent == self.touchMoveHandler.Event.LeftSlideMoved) {
        wx.request({
          url: api_url + '/Smallapp3/Find/recordViewfind',
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            openid: openid,
            id: id,
            type: type,
          },
        })
      }
      if (handleEvent == self.touchMoveHandler.Event.InsufficientData) {
        var cards_img = self.data.cards_img;
        var tmp = '[';
        var space = '';
        for (var i = 0; i < cards_img.length; i++) {
          tmp += space + '{"id":' + cards_img[i].id + ',"type":' + cards_img[i].type + '}';
          space = ',';
        }
        tmp += ']';
        wx.request({
          url: api_url + '/Smallapp3/Find/findlist',
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            openid: openid,
            find_ids: tmp
          },
          success: function(res) {
            if (res.data.code == 10000) {
              var list_info = res.data.result;
              for (var k = 0; k < list_info.length; k++) {
                self.data.cards_img.push(list_info[k]);
              }
              if(res.data.result.list_info==0){
                self.setData({
                  marked_words:'亲～别划了，已经没有了^_^'
                })
              }
              //self.data.cards_img.push(res.data.result);

            } else {
              self.setData({
                showContinueModalPopWindow: true,
              })
            }
          },
          fail: function(res) {

            self.setData({
              showContinueModalPopWindow: true,
            })
          }
        })
      }

      //console.log(handleEvent, page, startEvent, endEvent, top, left, x);
    });
  },
  /**
   * 点击喜欢
   */
  flyRight: function(e) {
    var self = this;
    var user_info = wx.getStorageSync('savor_user_info');
    var openid = user_info.openid;
    var id = e.currentTarget.dataset.id;
    var type = e.currentTarget.dataset.type;
    var forscreen_id = e.currentTarget.dataset.forscreen_id;
    if (type == 2 || type == 3) {
      var res_id = forscreen_id;
      var c_type = 2;
    } else {
      var res_id = id;
      var c_type = 3
    }
    self.touchMoveHandler.clickMoveHandle(self, self.touchMoveHandler.SlideType.RightSlide, '1350rpx', e, function(handleEvent, page, startEvent, endEvent, top, left, x) {
      //console.log("handleEvent=" + handleEvent)
      if (handleEvent == self.touchMoveHandler.Event.RightSlideMoved) {
        wx.request({
          url: api_url + '/Smallapp3/Find/recordViewfind',
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            openid: openid,
            id: id,
            type: type,
          },
        })

        /*wx.request({
          url: api_url + '/Smallapp/collect/recLogs',
          header: {
            'content-type': 'application/json'
          },
          data: {
            'openid': openid,
            'res_id': res_id,
            'type': c_type,
            'status': 1,
          },
        })*/
      }
      if (handleEvent == self.touchMoveHandler.Event.InsufficientData) {
        var cards_img = self.data.cards_img;
        var tmp = '[';
        var space = '';
        for (var i = 0; i < cards_img.length; i++) {
          tmp += space + '{"id":' + cards_img[i].id + ',"type":' + cards_img[i].type + '}';
          space = ',';
        }
        tmp += ']';
        wx.request({
          url: api_url + '/Smallapp3/Find/findlist',
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            openid: openid,
            find_ids: tmp
          },
          success: function(res) {
            if (res.data.code == 10000) {
              var list_info = res.data.result;
              for (var k = 0; k < list_info.length; k++) {
                self.data.cards_img.push(list_info[k]);
              }
              //self.data.cards_img.push(res.data.result);
              if(res.data.result.length==0){
                self.setData({
                  marked_words:'亲～别划了，已经没有了^_^'
                })
              }
            } else {
              self.setData({
                showContinueModalPopWindow: true,
              })
            }
          },
          fail: function(res) {

            self.setData({
              showContinueModalPopWindow: true,
            })
          }
        })
      }
      //console.log(handleEvent, page, startEvent, endEvent, top, left, x);
    });
  },
  collectRes:function(e){
    var that = this;
    var user_info = wx.getStorageSync('savor_user_info');
    var openid = user_info.openid;
    var id = e.currentTarget.dataset.id;
    var type = e.currentTarget.dataset.type;
    var forscreen_id = e.currentTarget.dataset.forscreen_id;
    var cards_img = e.currentTarget.dataset.cards_img;
    
    if (type == 2 || type == 3) {
      var res_id = forscreen_id;
      var c_type = 2;
    } else {
      var res_id = id;
      var c_type = 3
    }

    wx.request({
      url: api_url + '/Smallapp/collect/recLogs',
      header: {
        'content-type': 'application/json'
      },
      data: {
        'openid': openid,
        'res_id': res_id,
        'type': c_type,
        'status': 1,
        'only_co':1,
      },
      success:function(res){
        if(res.data.code==10000){
          wx.showToast({
            title: '收藏成功',
            icon: 'success',
            duration: 2000
          })
          for (var jk = 0; jk < 1; jk++) {
            cards_img[jk].collect_num++;
          }
          that.setData({
            cards_img: cards_img
          })
        }else {
          wx.showToast({
            title: '您已经收藏过了',
            icon: 'none',
            duration: 2000
          })
        }
        
      },fail:function(res){
        wx.showToast({
          title: '收藏失败，请重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
    
  },
  //电视播放
  boxShow: function(e) {
    //console.log(e);
    var forscreen_id = e.currentTarget.dataset.forscreen_id;

    var pubdetail = e.currentTarget.dataset.pubdetail;
    var res_type = e.currentTarget.dataset.res_type;
    var res_nums = e.currentTarget.dataset.res_nums;
    var type = e.currentTarget.dataset.type;
    if(type==1){
      var action = 5;
    }else {
      if (res_type == 1) {
        var action = 11; //发现图片点播
      } else if (res_type == 2) {
        var action = 12; //发现视频点播
      }
    }
    app.boxShow(box_mac, forscreen_id, pubdetail, res_type, res_nums, action);
  },
  //点击分享按钮
  onShareAppMessage: function(res) {
    console.log(res);
    var that = this;
    var user_info = wx.getStorageSync('savor_user_info');
    var openid = user_info.openid;
    var type = res.target.dataset.type;
    var res_type = res.target.dataset.res_type;
    if (type == 1) {
      var res_id = res.target.dataset.id;
      var c_type = 3;
      if (res_type == 1) {
        var share_url = '/pages/share/pic?forscreen_id=' + res_id;
      } else {
        var share_url = '/pages/share/video?res_id=' + res_id + '&type=3';
      }

    } else if (type == 2 || type == 3) {
      var res_id = res.target.dataset.forscreen_id;
      var c_type = 2;
      console.log(res_type);
      if (res_type == 1) {
        var share_url = '/pages/share/pic?forscreen_id=' + res_id;

      } else {
        var share_url = '/pages/share/video?res_id=' + res_id + '&type=2';
      }
    }
    console.log(share_url);
    var video_url = res.target.dataset.video_url;
    var img_url = res.target.dataset.img_url;
    var res_url = res.target.dataset.res_url;

    if (res.from === 'button') {

      // 转发成功
      wx.request({
        url: api_url + '/Smallapp/share/recLogs',
        header: {
          'content-type': 'application/json'
        },
        data: {
          'openid': openid,
          'res_id': res_id,
          'type': c_type,
          'status': 1,
        },
        success: function(e) {
          //var cards_img = that.cards_img



        },
        fail: function({
          errMsg
        }) {
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
        path: share_url,
        imageUrl: img_url,
        success: function(res) {


        },
      }
    }
  }, // 分享结束
  closePopVideo: function(e) {
    var that = this;
    that.setData({
      showVideoWindow: false
    })
  },
  forDetail: function(e) {
    var box_mac = e.currentTarget.dataset.box_mac;
    var forscreen_id = e.currentTarget.dataset.forscreen_id;
    var goods_id = e.currentTarget.dataset.goods_id;
    var type = e.currentTarget.dataset.type; //1官方 2精选 3公开
    var res_type = e.currentTarget.dataset.res_type; //1图片2视频
    var path = '';
    if (type == 1) {
      var video_url = e.currentTarget.dataset.res_url;
      var title = encodeURIComponent(e.currentTarget.dataset.title);
      var file_name = e.currentTarget.dataset.filename;
      var img_url = e.currentTarget.dataset.img_url;
      path = '/pages/forscreen/video/launch_video?video_url=' + video_url + '&video_name=' + title + '&box_mac=' + box_mac + '&res_id=' + goods_id + '&filename=' + file_name + '&video_img_url=' + img_url;
      //console.log(path)
    } else {
      if (res_type == 1) { //图片
        path = '/pages/find/picture?forscreen_id=' + forscreen_id + '&box_mac=' + box_mac;
      } else { //视频
        path = '/pages/find/video?forscreen_id=' + forscreen_id + '&box_mac=' + box_mac;
      }

    }
    //console.log(path);
    wx.navigateTo({
      url: path,
    })
  },
  //遥控呼大码
  callQrCode: utils.throttle(function(e) {
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var qrcode_img = e.currentTarget.dataset.qrcode_img;
    app.controlCallQrcode(openid, box_mac, qrcode_img);
  }, 3000), //呼大码结束
  //打开遥控器
  openControl: function(e) {
    var that = this;
    var qrcode_url = api_url + '/Smallapp/index/getBoxQr?box_mac=' + box_mac + '&type=3';
    console.log(qrcode_url);
    that.setData({
      showControl: true,
      qrcode_img: qrcode_url
    })
  },
  //关闭遥控
  closeControl: function(e) {
    var that = this;
    that.setData({
      showControl: false,
    })

  },
  //遥控退出投屏
  exitForscreen: function(e) {
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    app.controlExitForscreen(openid, box_mac);
  },
  //遥控调整音量
  changeVolume: function(e) {
    box_mac = e.currentTarget.dataset.box_mac;
    var change_type = e.currentTarget.dataset.change_type;
    app.controlChangeVolume(box_mac, change_type);

  },
  //遥控切换节目
  changeProgram: function(e) {
    box_mac = e.currentTarget.dataset.box_mac;
    var change_type = e.currentTarget.dataset.change_type;
    app.controlChangeProgram(box_mac, change_type);
  },
  closeLead: function (e) {
    var that = this;
    var type = 5;
    that.setData({
      findCardListGuidedMask: false,
    })
    
    
    wx.request({
      url: api_url + '/Smallapp3/content/guidePrompt',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        openid: openid,
        type: type,
      },
      success: function (res) {
        if (res.data.code == 10000) {
          var user_info = wx.getStorageSync('savor_user_info');

          user_info.guide_prompt.push(type);
          wx.setStorageSync('savor_user_info', user_info);

        }
      }
    })
  },
})