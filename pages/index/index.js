// pages/interact/index.js
const util = require('../../utils/util.js')
const app = getApp()
var openid;
var box_mac;
var api_url = app.globalData.api_url;
var goods_nums = 1;
var jd_appid = app.globalData.jd_appid;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    openid: '',
    hotel_name: '', //酒楼名称
    room_name: '', //包间名称
    box_mac: '', //机顶盒mac
    is_link: 0, //是否连接酒楼电视
    happy_vedio_url: '', //生日视频url
    happy_vedio_name: '', //生日视频名称
    happy_vedio_title: '', //生日视频标题
    showModal: false, //显示授权登陆弹窗
    showActgoods: false, // 显示活动促销
    
      showButton4JD: false, // 显示京东购买按钮
      showButton4Favorites: true, // 显示收藏按钮
      showFavoritesPanel: false, // 显示收藏面板
    
    is_game_banner: 0, //是否显示猴子爬树游戏banner
    is_open_simple: 0,
    imgUrls: [],   //顶部广告位
    imgUrls_mid:[],//中部广告位

    indicatorDots: true, //是否显示面板指示点
    autoplay: true, //是否自动切换
    interval: 3000, //自动切换时间间隔
    lb_duration: 1000, //滑动动画时长
    goods_nums:1,
    jd_appid:jd_appid,
    hot_play:[]    //热播内容
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    if (app.globalData.openid && app.globalData.openid != '') {
      that.setData({
        openid: app.globalData.openid
      })
      openid = app.globalData.openid;
      //判断用户是否注册
      wx.request({
        url: api_url + '/smallapp21/User/isRegister',
        data: {
          "openid": app.globalData.openid,
          "page_id": 3
        },
        header: {
          'content-type': 'application/json'
        },
        success: function(res) {
          wx.setStorage({
            key: 'savor_user_info',
            data: res.data.result.userinfo,
          })
          if (res.data.result.userinfo.is_wx_auth != 3) {
            that.setData({
              showModal: true
            })
          }
        },
        fail: function(e) {
          wx.setStorage({
            key: 'savor_user_info',
            data: {
              'openid': app.globalData.openid
            },
          })
        }
      }); //判断用户是否注册结束
      wx.request({
        url: api_url + '/Smallapp/index/isHaveCallBox?openid=' + app.globalData.openid,
        headers: {
          'Content-Type': 'application/json'
        },
        success: function(rest) {
          var is_have = rest.data.result.is_have;
          if (is_have == 1) { //已经扫码链接电视
            that.setData({
              is_link: 1,
              hotel_name: rest.data.result.hotel_name,
              room_name: rest.data.result.room_name,
              box_mac: rest.data.result.box_mac,
            })
            box_mac = rest.data.result.box_mac;
            getHotelInfo(rest.data.result.box_mac);
          } else {
            that.setData({
              is_link: 0,
              box_mac: '',
            })
            box_mac = '';
          }
        }
      });
      //是否显示活动
      isShowAct();
    } else {
      app.openidCallback = openid => {
        if (openid != '') {
          that.setData({
            openid: openid
          })
          openid = openid;
          //判断用户是否注册
          wx.request({
            url: api_url + '/smallapp21/User/isRegister',
            data: {
              "openid": app.globalData.openid,
              "page_id": 3
            },
            header: {
              'content-type': 'application/json'
            },
            success: function(res) {
              wx.setStorage({
                key: 'savor_user_info',
                data: res.data.result.userinfo,
              })
              if (res.data.result.userinfo.is_wx_auth != 3) {
                that.setData({
                  showModal: true
                })
              }
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
          wx.request({
            url: api_url + '/Smallapp/index/isHaveCallBox?openid=' + openid,
            headers: {
              'Content-Type': 'application/json'
            },
            success: function(rest) {
              var is_have = rest.data.result.is_have;
              if (is_have == 1) {
                that.setData({
                  is_link: 1,
                  hotel_name: rest.data.result.hotel_name,
                  room_name: rest.data.result.room_name,
                  box_mac: rest.data.result.box_mac,
                })
                box_mac = rest.data.result.box_mac;
                getHotelInfo(rest.data.result.box_mac);
              } else {
                that.setData({
                  is_link: 0,
                  box_mac: '',
                })
                box_mac = '';
              }
            }
          });
          //是否显示活动
          isShowAct();
        }
      }
    }
    //是否显示活动
    function isShowAct(){
      var goods_info = wx.getStorageSync('savor_goods_info');
      if(goods_info=='' || typeof(goods_info)=='undefined'){
        //************************上线去掉 */
        // that.setData({
        //   showActgoods: true
        // });
      }else {
        var goods_id = goods_info.goods_id;
        var goods_box_mac = goods_info.goods_box_mac;
        that.setData({
          goods_id:goods_id,
          goods_box_mac:goods_box_mac,
        })
        wx.request({
          url: api_url +'/Smallsale/goods/getdetail',
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            goods_id: goods_id,
          },
          success:function(res){
            console.log(res);
            if(res.data.code==10000){
              console.log(res);
              if(res.data.result.jd_url==''){
                var is_jd = false;
              }else {
                is_jd =true;
              }
              console.log(is_jd);
              that.setData({
                jd_url: res.data.result.jd_url,
                goods_info:res.data.result,
                showActgoods: true,
                showButton4JD:is_jd,
                showButton4Favorites:is_jd
              });
            }
            
          }
        })
        
      }
      
    }
    function getHotelInfo(box_mac) { //获取链接的酒楼信息
      wx.request({
        url: api_url + '/Smallapp/Index/getHotelInfo',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          box_mac: box_mac,
        },
        method: "POST",
        success: function(res) {
          that.setData({
            hotel_room: res.data.result.hotel_name + res.data.result.room_name,
            happy_vedio_url: res.data.result.vedio_url,
            happy_vedio_name: res.data.result.file_name,
            happy_vedio_title: res.data.result.name,
            is_open_simple: res.data.result.is_open_simple
          })
        }
      })
    }
    wx.request({
      url: api_url + '/Smallapp3/Adsposition/getAdspositionList',
      data: {
        position: '2,3',
      },
      success: function(res) {
        if (res.data.code == 10000) {
          var imgUrls = res.data.result[2];
          var imgUrls_mid = res.data.result[3];
          that.setData({
            imgUrls: imgUrls,
            imgUrls_mid: imgUrls_mid
          })
        }
      }
    })
    //热播内容
    wx.request({
      url: api_url +'/Smallapp3/content/getHotplaylist',
      headers: {
        'Content-Type': 'application/json'
      },
      method: "POST",
      success:function(res){
        if(res.data.code==10000){
          that.setData({
            hot_play:res.data.result
          })
        }
      }
    })
  },
  onGetUserInfo: function(res) {
    var that = this;

    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    if (res.detail.errMsg == 'getUserInfo:ok') {
      wx.getUserInfo({
        success(rets) {
          wx.request({
            url: api_url + '/smallapp3/User/registerCom',
            data: {
              'openid': openid,
              'avatarUrl': rets.userInfo.avatarUrl,
              'nickName': rets.userInfo.nickName,
              'gender': rets.userInfo.gender,
              'session_key': app.globalData.session_key,
              'iv': rets.iv,
              'encryptedData': rets.encryptedData
            },
            header: {
              'content-type': 'application/json'
            },
            success: function(res) {
              if (res.data.code == 10000) {
                wx.setStorage({
                  key: 'savor_user_info',
                  data: res.data.result,
                });
                that.setData({
                  showModal: false,
                })
              } else {
                wx.showToast({
                  title: '微信授权登陆失败，请重试',
                  icon: 'none',
                  duration: 2000,

                })
              }

            },
            fail: function(res) {
              wx.showToast({
                title: '微信登陆失败，请重试',
                icon: 'none',
                duration: 2000
              });
            }
          })
        }
      })
    } else {
      wx.request({
        url: api_url + '/smallapp21/User/refuseRegister',
        data: {
          'openid': openid,
        },
        header: {
          'content-type': 'application/json'
        },
        success: function(res) {
          if (res.data.code == 10000) {
            user_info['is_wx_auth'] = 1;
            wx.setStorage({
              key: 'savor_user_info',
              data: user_info,
            })

          } else {
            wx.showToast({
              title: '拒绝失败,请重试',
              icon: 'none',
              duration: 2000
            });
          }

        }
      })
    }


  },
  //关闭授权弹窗
  closeAuth: function() {
    //关闭授权登陆埋点
    var that = this;
    that.setData({
      showModal: false,
    })
    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    console.log(box_mac);
    if (box_mac == 'undefined' || box_mac == undefined) {
      box_mac = '';
    }
    wx.request({
      url: api_url + '/Smallapp21/index/closeauthLog',
      header: {
        'content-type': 'application/json'
      },
      data: {
        openid: openid,
        box_mac: box_mac,
      },

    })
  },


  //选择照片上电视
  chooseImage(e) {
    console.log(e);
    var that = this;
    var user_info = wx.getStorageSync("savor_user_info");
    if (user_info.is_wx_auth != 3) {
      that.setData({
        showModal: true
      })
    } else {
      var box_mac = e.detail.value.boxmac;
      var openid = e.detail.value.openid;
      var is_open_simple = e.detail.value.is_open_simple;
      var formId = e.detail.formId;
      if (box_mac == '') {

        app.scanQrcode();
      } else {
        wx.navigateTo({
          url: '/pages/forscreen/forimages/index?box_mac=' + box_mac + '&openid=' + openid + '&is_open_simple=' + is_open_simple,
        })
        app.recrdFormId(openid, formId);
      }
    }
  },
  //选择视频投屏
  chooseVedio(e) {
    var that = this
    var user_info = wx.getStorageSync("savor_user_info");
    if (user_info.is_wx_auth != 3) {
      that.setData({
        showModal: true
      })
    } else {
      var box_mac = e.detail.value.boxmac;
      var openid = e.detail.value.openid;
      var is_open_simple = e.detail.value.is_open_simple;
      var formId = e.detail.formId;
      if (box_mac == '') {
        app.scanQrcode();
      } else {
        wx.navigateTo({
          url: '/pages/forscreen/forvideo/index?box_mac=' + box_mac + '&openid=' + openid + '&is_open_simple=' + is_open_simple,
        })
        app.recrdFormId(openid, formId);
      }
    }


  },

  showHappy(e) { //视频点播让盒子播放
    var box_mac = e.currentTarget.dataset.boxmac;
    var openid = e.currentTarget.dataset.openid;
    if (box_mac == '') {
      app.scanQrcode();
    } else {
      wx.navigateTo({
        url: '/pages/thematic/birthday/list?openid=' + openid + '&box_mac=' + box_mac,
      })
    }
  },
  //互动游戏
  hdgames(e) {
    var openid = e.currentTarget.dataset.openid;
    var box_mac = e.currentTarget.dataset.boxmac;
    var linkcontent = e.currentTarget.dataset.linkcontent;

    if (box_mac == '') {
      app.scanQrcode();
    } else {
      var mobile_brand = app.globalData.mobile_brand;
      var mobile_model = app.globalData.mobile_model;

      wx.navigateTo({
        url: linkcontent + '?box_mac=' + box_mac + '&openid=' + openid + '&game_id=2'
      })
    }

  },
  //断开连接
  breakLink: function(e) {
    var that = this;
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.boxmac;
    var timestamp = (new Date()).valueOf();
    wx.request({
      url: api_url + '/Smallapp21/index/breakLink',
      header: {
        'content-type': 'application/json'
      },
      method: "POST",
      data: {
        box_mac: box_mac,
        openid: openid
      },
      success: function(res) {
        if (res.data.code == 10000) {
          that.setData({
            is_link: 0,
            box_mac: ''
          })
          wx.reLaunch({
            url: '../index/index'
          })
          wx.showToast({
            title: '断开成功',
            icon: 'none',
            duration: 2000
          })
        } else {
          wx.showToast({
            title: '断开失败',
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail: function(res) {
        wx.showToast({
          title: '网络异常，断开失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  forscreenHistory: function(e) {
    var box_mac = e.currentTarget.dataset.boxmac;
    var openid = e.currentTarget.dataset.openid;
    if (box_mac == '') {
      app.scanQrcode();
    } else {
      wx.navigateTo({
        url: '/pages/forscreen/history/list?openid=' + openid + '&box_mac=' + box_mac,
      })
    }
  },
  //遥控呼大码
  callQrCode: util.throttle(function(e) {
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var qrcode_img = e.currentTarget.dataset.qrcode_img;
    app.controlCallQrcode(openid, box_mac, qrcode_img);
  }, 3000), //呼大码结束
  //打开遥控器
  openControl: function(e) {
    var that = this;
    var qrcode_url = api_url + '/Smallapp/index/getBoxQr?box_mac=' + box_mac + '&type=3';
    that.setData({

      popRemoteControlWindow: true,
      qrcode_img: qrcode_url
    })
  },
  //关闭遥控
  closeControl: function(e) {
    var that = this;
    that.setData({

      popRemoteControlWindow: false,
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
  //文件投屏
  forfiles: function(e) {
    var that = this;
    var user_info = wx.getStorageSync("savor_user_info");
    if (user_info.is_wx_auth != 3) {
      that.setData({
        showModal: true
      })
    } else {
      var box_mac = e.detail.value.boxmac;
      var openid = e.detail.value.openid;
      var is_open_simple = e.detail.value.is_open_simple;
      var formId = e.detail.formId;
      //微信好友文件投屏+h5文件投屏
      if (box_mac == '') {
        app.scanQrcode();
      } else {
        that.setData({
          showMe: true,
        })
        app.recrdFormId(openid,formId);
      }

      //微信好友文件投屏
      /*if (box_mac == '') {

        app.scanQrcode();
      } else {
        wx.navigateTo({
          url: '/pages/forscreen/forfile/files?box_mac=' + box_mac + '&openid=' + openid + "&is_open_simple=" + is_open_simple ,
        })
      }*/

    }
  },
  //微信好友文件
  wxFriendfiles: function(e) {
    var that = this;
    var box_mac = e.currentTarget.dataset.boxmac;
    var openid = e.currentTarget.dataset.openid;
    var is_open_simple = e.currentTarget.dataset.is_open_simple;
    wx.navigateTo({
      url: '/pages/forscreen/forfile/files?box_mac=' + box_mac + '&openid=' + openid + "&is_open_simple=" + is_open_simple,
      success: function(e) {
        that.setData({
          showMe: false
        })
      }
    })
  },
  phonefiles: function(e) {
    var that = this;
    var box_mac = e.currentTarget.dataset.boxmac;
    var openid = e.currentTarget.dataset.openid;
    var is_open_simple = e.currentTarget.dataset.is_open_simple;
    wx.navigateTo({
      url: '/pages/forscreen/forfile/h5files?box_mac=' + box_mac + '&openid=' + openid + "&is_open_simple=" + is_open_simple,
      success: function(e) {
        that.setData({
          showMe: false
        })
      }
    })
  },
  modalCancel: function(e) {
    var that = this;
    that.setData({
      showMe: false,
    })
  },
  changeActNums:function(e){
    var that  = this;
    var type = e.currentTarget.dataset.type;
    if(type==1){//数量增加
      if (goods_nums == 10) {
        wx.showToast({
          title: '数量不能大于10',
          icon: 'none',
          duration: 2000,
        })
      }else {
        goods_nums +=1;
        console.log(goods_nums);
      }
    }else if(type==2){ //数量减少
      if(goods_nums==1){
        wx.showToast({
          title: '数量不能小于1',
          icon:'none',
          duration:2000,
        })
      }else {
        goods_nums -=1;
      }
    }
    that.setData({
      goods_nums:goods_nums,
    })
  },
  closeAct:function(e){
    var that = this;
    wx.removeStorageSync('savor_goods_info');
    that.setData({
      showActgoods:false
    })
    goods_nums = 1;
  },
  //店内购买
  shopBuyGoods:function(e){
    console.log(e);
    var that = this;
    var goods_id = e.currentTarget.dataset.goods_id;
    var goods_nums = e.currentTarget.dataset.goods_nums;
    var goods_box_mac = e.currentTarget.dataset.goods_box_mac;
    var buy_type = e.currentTarget.dataset.buy_type;
    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    wx.request({
      url: api_url +'/Smallsale/order/addOrder',
      header: {
        'content-type': 'application/json'
      },
      data:{
        goods_id:goods_id,
        box_mac:goods_box_mac,
        amount:goods_nums,
        openid:openid,
        buy_type: buy_type
      },
      success:function(res){
        if(res.data.code==10000){
          if (buy_type==1){
            wx.showToast({
              title: '购买成功',
              icon: 'none',
              duration: 2000,
            })
          }
          
        }else {
          if(buy_type==1){
            wx.showToast({
              title: res.data.msg,
              icon: 'none',
              duration: 2000,
            })
          }
          
        }
      }
    })
  },
  //收藏商品
  collectGoods:function(e){
    var goods_id = e.currentTarget.dataset.goods_id;
    var that = this;
    that.setData({
      showFavoritesPanel:true,
    })
    
    
  },
  //输入手机号失去焦点
  mobileOnInput: function (res) {
    var that = this;
    var mobile = res.detail.value;
    that.setData({
      mobile: mobile
    })
  },
  sendGoodsLink:function(e){
    var that = this;
    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    var goods_id = e.currentTarget.dataset.goods_id;
    
    var mobile = e.currentTarget.dataset.mobile;
    if(mobile==''){
      wx.showToast({
        title: '请输入手机号',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    var is_mobile = app.checkMobile(mobile);
    if (!is_mobile) {
      return;
    }
    wx.request({
      url: api_url +'/Smallsale/collection/addGoodscollection',
      header: {
        'content-type': 'application/json'
      },
      data:{
        goods_id:goods_id,
        phone:mobile,
        openid:openid,
      },success:function(res){
        if(res.data.code==10000){
          wx.showToast({
            title: '商品链接已发送到您的手机',
            icon:'none',
            duration:2000,
          })
        }else {
          var err_msg = res.data.msg;
          wx.showToast({
            title: err_msg,
            icon: 'none',
            duration: 2000,
          })
        }
      },fail:function(res){
        wx.showToast({
          title: '商品链接发送失败，请稍后重试',
          icon: 'none',
          duration: 2000,
        })
      }
    })
  },
  //活动商品京东购买
  jdBuy:function(e){
    console.log(e);
    var h5_url = e.currentTarget.dataset.h5_url;
    h5_url = encodeURIComponent(h5_url);
    wx.navigateTo({
      url: '/pages/h5/index?h5_url='+h5_url,
    })
  },
  //电视播放
  boxShow:function(e){
    var forscreen_id = e.currentTarget.dataset.forscreen_id;
    console.log(box_mac);
    var pubdetail = e.currentTarget.dataset.pubdetail;
    var res_type = e.currentTarget.dataset.res_type;
    var res_num  = e.currentTarget.dataset.res_num;
    app.boxShow(box_mac, forscreen_id, pubdetail, res_type, res_num);
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
    this.onLoad()
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})