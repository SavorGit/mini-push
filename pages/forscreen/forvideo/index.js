// pages/forscreen/forvideo/index.js
const utils = require('../../../utils/util.js')
var mta = require('../../../utils/mta_analysis.js')
const app = getApp();
var tmp;
var openid;
var policy;
var signature;
var postf; //上传文件扩展名
var box_mac = '';
var forscreen_char = '';
var res_sup_time;
var page = 1;
var res_size;
var forscreen_history_list;
var api_url = app.globalData.api_url;
var oss_upload_url = app.globalData.oss_upload_url;
var oss_url = app.globalData.oss_url;
var pubdetail = [];
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    showVedio: true,
    showRechoose: false,
    upload_vedio_temp: '',
    oss_video_url: '',
    duration: 0,
    //upload_vedio_img_temp:'',
    vedio_percent: 0,
    item: [{
        'name': '公开时显示餐厅信息',
        'value': '1',
        'checked': true,
        'disabled': false
      },
      {
        'name': '公开发表，公众可见',
        'value': '2',
        'checked': false,
        'disabled': false
      },

    ],
    is_pub_hotelinfo: 1, //是否公开酒楼信息
    is_share: 0, //是否分享到发现栏目
    is_btn_disabel: true,
    avatarUrl: '',
    nickName: '',
    replay_video_url: '',
    is_replay_disabel: false,
    djs: 10,
    forscreen_history_list: '',
    hiddens: true, //上拉加载中,
    load_fresh_char: '',
    is_view_control: false,
    is_view_control: true,
    is_open_control: false,
    showGuidedMaskBeforLaunch: false,
    showGuidedMaskAfterLaunch: false,
    res_head_desc: '视频',
    compressed:true,  //默认压缩
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(e) {
    //wx.hideShareMenu();
    var that = this
    box_mac = e.box_mac;
    var openid = e.openid;
    var user_info = wx.getStorageSync("savor_user_info");
    var avatarUrl = user_info.avatarUrl;
    var nickName = user_info.nickName;
    var is_open_simple = e.is_open_simple;
    if(typeof(e.is_compress)!='undefined'){
      var is_compress = e.is_compress
    }else {
      var is_compress = 1
    }
    if(is_compress==1){
      var compressed = true;
    }else if(is_compress==0){
      var compressed = false;
    }
    
    that.setData({
      openid: openid,
      box_mac: box_mac,
      upload_vedio_temp: '',
      avatarUrl: avatarUrl,
      nickName: nickName,
      is_open_simple: is_open_simple,
      is_compress:is_compress
    })

    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      compressed:compressed,
      success: function(res) {
        // console.log(res);
        that.setData({
          showVedio: true,
          is_btn_disabel: false,
          upload_vedio_temp: res.tempFilePath,
          //upload_vedio_cover:res.thumbTempFilePath,
          duration: res.duration,
          size: res.size
        });
        lead(openid);
        //res_sup_time = (new Date()).valueOf();
        mta.Event.stat('LaunchVideoWithNet_Launch_ChooseVideo', {
          'status': 'success'
        });
      },
      fail: function(res) {
        wx.navigateBack({
          delta: 1,
        });
        mta.Event.stat('LaunchVideoWithNet_Launch_ChooseVideo', {
          'status': 'fail'
        });
      }
    });

    //引导蒙层
    function lead(openid) {
      var user_info = wx.getStorageSync('savor_user_info');
      var guide_prompt = user_info.guide_prompt;
      if (typeof(guide_prompt) != 'undefined') {
        if (guide_prompt.length == 0) {
          that.setData({
            showGuidedMaskBeforLaunch: true,
          })
        } else {
          var is_lead = 1;
          for (var i = 0; i < guide_prompt.length; i++) {
            if (guide_prompt[i] == 3) {
              is_lead = 0;

              break;
            }
          }
          if (is_lead == 1) {
            that.setData({
              showGuidedMaskBeforLaunch: true,
            })
          }
        }
      }

    }
  },

  // 投视频前播放
  onPlayBeforeLauch: function(e) {
    let self = this;
    mta.Event.stat('LaunchVideoWithNet_BeforeLaunch_PLAY', {
      'openid': self.data.openid,
      'video': self.data.upload_vedio_temp
    });
  },

  // 投视频后播放
  onPlayAfterLauch: function(e) {
    let self = this;
    mta.Event.stat('LaunchVideoWithNet_AfterLaunch_Play', {
      'openid': self.data.openid,
      'video': self.data.oss_video_url
    });
  },

  // 投视频后暂停
  onPauseAfterLauch: function(e) {
    let self = this;
    mta.Event.stat('LaunchVideoWithNet_AfterLaunch_Pause', {
      'openid': self.data.openid,
      'video': self.data.oss_video_url
    });
  },

  // 投视频后进入/退出全屏
  onFullScreenChangeAfterLauch: function(e) {
    let self = this;
    mta.Event.stat('LaunchVideoWithNet_AfterLaunch_FullScreen', {
      'openid': self.data.openid,
      'video': self.data.oss_video_url,
      'fullscreen': e.detail.fullScreen
    });
  },

  forscreen_video: function(res) {
    //console.log(res);
    var that = this;

    var video = res.detail.value.video;
    var box_mac = res.detail.value.box_mac;
    var openid = res.detail.value.openid;
    var is_pub_hotelinfo = res.detail.value.is_pub_hotelinfo;
    var is_share = res.detail.value.is_share;
    var duration = res.detail.value.duration;
    var avatarUrl = res.detail.value.avatarUrl;
    var nickName = res.detail.value.nickName;
    var public_text = res.detail.value.public_text;
    var is_open_simple = res.detail.value.is_open_simple;
    var formId = res.detail.formId;
    var is_assist = 0;
    res_size = res.detail.value.size;
    if (is_share == 1) {
      is_assist = 1;
    }
    lead(openid, is_share);
    that.setData({
      load_fresh_char: '亲^_^投屏中,请稍后...',
      hiddens: false,
      is_btn_disabel: true,
      //is_open_control: true,
      is_share: is_share,
      is_assist: is_assist
    })

    

    wx.request({
      url: api_url + '/smallapp21/User/isForscreenIng',
      headers: {
        'Content-Type': 'application/json'
      },
      method: "POST",
      data: {
        box_mac: box_mac
      },
      success: function(res) {
        var timer8_0;
        var is_forscreen = res.data.result.is_forscreen;
        if (is_forscreen == 1) {
          wx.showModal({
            title: '确认要打断投屏',
            content: '当前电视正在进行投屏,继续投屏有可能打断当前投屏中的内容.',
            success: function(res) {
              if (res.confirm) {
                
                
                uploadVedio(video, box_mac, openid, is_pub_hotelinfo, is_share, duration, avatarUrl, nickName, public_text, timer8_0);
                app.recordFormId(openid, formId);

                if (public_text = '' || typeof (public_text) == 'undefined') {
                  public_text = 0;
                } else {
                  public_text = 1;
                }
                utils.tryCatch(mta.Event.stat('forscreenVedio', { 'ispublictext': public_text, 'ispublic': is_share, 'isforscreen': 1 }));
              } else if (res.cancel) {
                that.setData({
                  hiddens: true,
                })
                wx.navigateBack({
                  delta: 1
                })

                if (public_text = '' || typeof (public_text) == 'undefined') {
                  public_text = 0;
                } else {
                  public_text = 1;
                }
                utils.tryCatch(mta.Event.stat('forscreenVedio', { 'ispublictext': public_text, 'ispublic': is_share, 'isforscreen': 0 }));
              }
            }
          })
          
          
        } else {
          
          uploadVedio(video, box_mac, openid, is_pub_hotelinfo, is_share, duration, avatarUrl, nickName, public_text, timer8_0);
          app.recordFormId(openid, formId);
          if (public_text = '' || typeof (public_text) == 'undefined') {
            public_text = 0;
          } else {
            public_text = 1;
          }
          utils.tryCatch(mta.Event.stat('forscreenVedio', { 'ispublictext': public_text, 'ispublic': is_share, 'isforscreen': 0 }));
        }
      }
    })





    function uploadVedio(video, box_mac, openid, is_pub_hotelinfo, is_share, duration, avatarUrl, nickName, public_text, timer8_0) {

      wx.request({
        url: api_url + '/Smallapp/Index/getOssParams',
        headers: {
          'Content-Type': 'application/json'
        },
        success: function(rest) {
          policy = rest.data.policy;
          signature = rest.data.signature;
          uploadOssVedio(policy, signature, video, box_mac, openid, is_pub_hotelinfo, is_share, duration, avatarUrl, nickName, public_text, timer8_0);
        }
      });
    }

    function uploadOssVedio(policy, signature, video, box_mac, openid, is_pub_hotelinfo, is_share, duration, avatarUrl, nickName, public_text, timer8_0) {

      var filename = video; //视频url

      //var filename_img = video.thumbTempFilePath; //视频封面图
      //console.log(video);
      var index1 = filename.lastIndexOf(".");
      var index2 = filename.length;
      var mobile_brand = app.globalData.mobile_brand;
      var mobile_model = app.globalData.mobile_model;
      var postf_t = filename.substring(index1, index2); //后缀名
      var timestamp = (new Date()).valueOf();
      res_sup_time = timestamp;
      var upload_task = wx.uploadFile({
        url: oss_upload_url,
        filePath: filename,
        name: 'file',

        formData: {
          Bucket: "redian-produce",
          name: filename,
          key: "forscreen/resource/" + timestamp + postf_t,
          policy: policy,
          OSSAccessKeyId: app.globalData.oss_access_key_id,
          sucess_action_status: "200",
          signature: signature
        },
        success: function(res) {
          console.log(res)
          //clearInterval(timer8_0);
          var res_eup_time = (new Date()).valueOf();
          that.setData({
            showVedio: false,
          })
          wx.request({
            url: api_url + '/Netty/Index/pushnetty',
            headers: {
              'Content-Type': 'application/json'
            },
            method: "POST",
            data: {
              box_mac: box_mac,
              msg: '{ "action":2, "url": "forscreen/resource/' + timestamp + postf_t + '", "filename":"' + timestamp + postf_t + '","openid":"' + openid + '","resource_type":2,"video_id":"' + timestamp + '","avatarUrl":"' + avatarUrl + '","nickName":"' + nickName + '","forscreen_id":"' + timestamp + '","res_sup_time":"'+res_sup_time+'","res_eup_time":"'+res_eup_time+'","resource_size":'+res_size+'}',
            },
            success: function(result) {
              if (result.data.code != 10000) {
                wx.showToast({
                  title: '投屏失败',
                  icon: 'none',
                  duration: 2000,
                })
              }
              that.setData({
                upload_vedio_cover: oss_url + '/forscreen/resource/' + timestamp + postf_t + '?x-oss-process=video/snapshot,t_2000,f_jpg,w_450,m_fast',
              })
              wx.request({
                url: api_url + '/Smallapp21/index/recordForScreenPics',
                header: {
                  'content-type': 'application/json'
                },
                data: {
                  openid: openid,
                  box_mac: box_mac,
                  action: 2,
                  resource_type: 2,
                  mobile_brand: mobile_brand,
                  mobile_model: mobile_model,
                  forscreen_char: forscreen_char,
                  public_text: public_text,
                  imgs: '["forscreen/resource/' + timestamp + postf_t + '"]',
                  resource_id: timestamp,
                  res_sup_time: res_sup_time,
                  res_eup_time: res_eup_time,
                  resource_size: res_size,
                  is_pub_hotelinfo: is_pub_hotelinfo,
                  is_share: is_share,
                  forscreen_id: timestamp,
                  duration: duration,
                  res_nums: 1,
                  serial_number:app.globalData.serial_number
                },
                success: function(ret) {
                  wx.request({
                    url: api_url + '/Smallapp21/ForscreenHistory/getList',
                    header: {
                      'content-type': 'application/json'
                    },
                    data: {
                      openid: openid,
                      box_mac: box_mac,
                      page: page,
                    },
                    success: function(res) {
                      var hst_list = res.data.result;

                      if (JSON.stringify(hst_list) == "{}") {
                        that.setData({
                          forscreen_history_list: ''
                        })
                      } else {
                        that.setData({
                          forscreen_history_list: res.data.result
                        })
                      }

                    }
                  })
                }
              });
            },

          });
          try {
            let consumeDuration = res_eup_time - timestamp;
            mta.Event.stat('LaunchVideoWithNet_Launching_OSSDuration', {
              'duration': Math.round(parseInt(consumeDuration) / 100) / 10
            });
          } catch (e) {
            //TODO nothing
          }
        }
      });
      upload_task.onProgressUpdate((res) => {
        //console.log(res);

        that.setData({
          vedio_percent: res.progress
        });
        if (res.progress == 100) {

          that.setData({
            //showVedio:false,
            oss_video_url: oss_url + "/forscreen/resource/" + timestamp + postf_t,
            upload_vedio_temp: '',
            is_view_control: true,
            hiddens: true,
            is_open_control: false,
            forscreen_id: timestamp
          })

        }

      });
      // that.setData({
      //   replay_video_url: "forscreen/resource/" + timestamp + postf_t,
      //   showVedio: true,
      //   upload_vedio_temp: filename,
      // });
    }
    //引导蒙层
    function lead(openid) {

      if (is_share == 1) {
        var user_info = wx.getStorageSync('savor_user_info');
        var guide_prompt = user_info.guide_prompt;
        if (typeof(guide_prompt) != 'undefined') {
          if (guide_prompt.length == 0) {
            that.setData({
              showGuidedMaskAfterLaunch: true,
            })
          } else {
            var is_lead = 1;
            for (var i = 0; i < guide_prompt.length; i++) {
              if (guide_prompt[i] == 4) {
                is_lead = 0;

                break;
              }
            }
            if (is_lead == 1) {
              that.setData({
                showGuidedMaskAfterLaunch: true,
              })
            }
          }
        }

      }

    }
  },

  //重新选择视频
  chooseVedio(e) {
    var that = this;

    var is_compress = that.data.is_compress;
    if(is_compress==1){
      var compressed = true;
    }else if(is_compress==0){
      var compressed = false;
    }
    try {
      mta.Event.stat('LaunchVideoWithNet_AfterLaunch_RechooseVideo', {
        'openid': that.data.openid
      });
    } catch (e) {
      //TODO nothing
    }
    that.setData({
      item: [{
          'name': '公开时显示餐厅信息',
          'value': '1',
          'checked': true,
          'disabled': false
        },
        {
          'name': '公开发表，公众可见',
          'value': '2',
          'checked': false,
          'disabled': false
        },

      ],
      is_share: 0,
      showVedio: true,
      is_btn_disabel: true,
    });
    var box_mac = e.currentTarget.dataset.boxmac;
    var openid = e.currentTarget.dataset.openid;


    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      compressed:compressed,
      success: function(res) {

        that.setData({
          showVedio: true,
          is_btn_disabel: false,
          upload_vedio_temp: res.tempFilePath,
          //upload_vedio_cover: res.thumbTempFilePath,
          vedio_percent: 0,
          duration: res.duration,
          size: res.size
        });
        mta.Event.stat('LaunchVideoWithNet_Launch_ChooseVideo', {
          'status': 'success'
        });
      },
      fail: function(res) {
        that.setData({
          showVedio: false,
          is_btn_disabel: true,
        });
        mta.Event.stat('LaunchVideoWithNet_Launch_ChooseVideo', {
          'status': 'fail'
        });
      }
    });

  },

  //退出投屏
  exitForscreend(e) {
    var that = this;
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.boxmac;
    var timestamp = (new Date()).valueOf();
    wx.request({
      url: api_url + '/Netty/Index/pushnetty',
      headers: {
        'Content-Type': 'application/json'
      },
      method: "POST",
      data: {
        box_mac: box_mac,
        msg: '{"action": 3,"openid":"' + openid + '"}',
      },
      success: function(res) {
        wx.navigateBack({
          delta: 1,
        })
        wx.showToast({
          title: '退出成功',
          icon: 'none',
          duration: 2000
        });
        utils.tryCatch(mta.Event.stat('forVideoExit', { 'status': 1 }));
        
      },
      fail: function(res) {
        wx.showToast({
          title: '网络异常，退出失败',
          icon: 'none',
          duration: 2000
        })
        utils.tryCatch(mta.Event.stat('forVideoExit', { 'status': 0 }));
      }
    })
  },
  //是否公开显示餐厅信息
  checkboxChange: function(e) {
    var that = this;
    //console.log(e.detail.value.length);
    var check_lenth = e.detail.value.length;
    var check_arr = e.detail.value;
    if (check_lenth == 2) {
      that.setData({
        is_share: 1,
        is_pub_hotelinfo: 1
      })
    } else if (check_lenth == 1) {
      if (check_arr[0] == 1) {
        that.setData({
          is_share: 0,
          is_pub_hotelinfo: 1
        })
      } else if (check_arr[0] == 2) {
        that.setData({
          is_share: 1,
          is_pub_hotelinfo: 0
        })
      }
    } else if (check_lenth == 0) {
      that.setData({
        is_pub_hotelinfo: 0,
        is_share: 0
      })
    }
    var check_arr = e.detail.value;


  }, //是否公开显示餐厅信息结束
  
  previewImage: function(e) {
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
  replayHistory: function(e) {
    var that = this;
    var box_mac = e.target.dataset.box_mac;
    var action = 8; //重新播放
    var forscreen_id = (new Date()).valueOf(); //投屏id
    var res_type = e.target.dataset.res_type;
    var res_list = e.target.dataset.res_list;
    var res_nums = res_list.length;
    pubdetail = []
    for(var i=0;i<res_nums;i++){
      var tmp = {forscreen_url:'',res_id:'',filename:'',resource_size:'',duration:0};
      tmp.forscreen_url = res_list[i].forscreen_url;
      tmp.res_id        = res_list[i].resource_id;
      tmp.filename      = res_list[i].filename;
      tmp.resource_size = res_list[i].resource_size;
      tmp.duration      = 0;
      pubdetail[i] = tmp;
    }

    app.boxShow(box_mac, forscreen_id, pubdetail, res_type, res_nums, action, '', that);


  },
  //上拉刷新
  loadMore: function(e) {
    var that = this;
    var openid = e.target.dataset.openid;
    var box_mac = e.target.dataset.box_mac;
    page = page + 1;
    that.setData({
      load_fresh_char: '加载中...',
      hiddens: false,
    })
    wx.request({
      url: api_url + '/Smallapp21/ForscreenHistory/getList',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        page: page,
        box_mac: box_mac,
        openid: openid,
      },
      method: "POST",
      success: function(res) {
        if (res.data.code == 10000) {
          forscreen_history_list = res.data.result,
            that.setData({
              forscreen_history_list: res.data.result,
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
  changeVolume: function(e) {
    var box_mac = e.target.dataset.box_mac;
    var change_type = e.target.dataset.change_type;
    var timestamp = (new Date()).valueOf();
    wx.request({
      url: api_url + '/Netty/Index/pushnetty',
      headers: {
        'Content-Type': 'application/json'
      },
      method: "POST",
      data: {
        box_mac: box_mac,
        msg: '{"action":31,"change_type":' + change_type + '}',
      },
    })
    utils.tryCatch(mta.Event.stat('controlChangeVolume', { 'changetype': change_type }))
    
  },
  closeJump: function(e) {
    var that = this;
    that.setData({
      is_show_jump: false,
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
    var qrcode_url = api_url + '/Smallapp4/index/getBoxQr?box_mac=' + box_mac + '&type=3';
    that.setData({
      is_open_control: true,
      popRemoteControlWindow: true,
      qrcode_img: qrcode_url
    })
    utils.tryCatch(
      mta.Event.stat('openControl', {
      'linktype': app.globalData.link_type
      })
    );
    
  },
  //关闭遥控
  closeControl: function(e) {
    var that = this;
    that.setData({
      is_open_control: false,
      popRemoteControlWindow: false,
    })
    mta.Event.stat("closecontrol", {})
  },
  //遥控退出投屏
  exitForscreen: function(e) {
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    app.controlExitForscreen(openid, box_mac);
  },
  //遥控调整音量
  changeVolume: function(e) {
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var change_type = e.currentTarget.dataset.change_type;
    app.controlChangeVolume(openid, box_mac, change_type);

  },
  //遥控切换节目
  changeProgram: function(e) {
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var change_type = e.currentTarget.dataset.change_type;
    app.controlChangeProgram(openid, box_mac, change_type);
  },
  //我要助力
  assist: function(e) {
    console.log(e);
    var that = this;
    var forscreen_id = e.detail.value.forscreen_id;
    var openid = e.detail.value.openid;
    var box_mac = e.detail.value.box_mac;
    var formId = e.detail.formId;
    app.recordFormId(openid, formId);
    if (typeof(forscreen_id) == 'undefined') {
      wx.showToast({
        title: '助力参数异常，请重试或重选视频',
        icon: 'none',
        duration: 2000
      })

    } else {

      wx.request({
        url: api_url + '/Smallapp3/ForscreenHelp/helpplay',
        header: {
          'Content-Type': 'application/json'
        },
        data: {
          forscreen_id: forscreen_id,
          openid: openid,
        },
        success: function(res) {
          if (res.data.code == 10000) {
            var rec_id = res.data.result.forscreen_id;
            wx.navigateTo({
              url: '/pages/mine/assist/index?forscreen_id=' + rec_id + "&box_mac=" + box_mac + "&inside=1",
            })

          } else {
            wx.showToast({
              title: '助力参数异常，请重选照片',
              icon: 'none',
              duration: 2000
            })
          }
        },
        fail: function(res) {
          wx.showToast({
            title: '助力参数异常，请重选照片',
            icon: 'none',
            duration: 2000
          })
        }
      })
    }

  },
  phonecallevent: function(e) {
    var tel = e.target.dataset.tel;
    wx.makePhoneCall({
      phoneNumber: tel,
      success:function(res){
        utils.tryCatch(mta.Event.stat('forVideoPhoneCall', { 'status': 1 }));
        
      },fail:function(res){
        utils.tryCatch(mta.Event.stat('forVideoPhoneCall', { 'status': 0 }));
      }
    })
  },
  closeLead: function(e) {
    var that = this;
    var type = e.currentTarget.dataset.type;
    var openid = e.currentTarget.dataset.openid;
    if (type == 3) {
      that.setData({
        showGuidedMaskBeforLaunch: false,
      })
    } else if (type == 4) {
      that.setData({
        showGuidedMaskAfterLaunch: false,
      })
    }
    wx.request({
      url: api_url + '/Smallapp3/content/guidePrompt',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        openid: openid,
        type: type,
      },
      success: function(res) {
        if (res.data.code == 10000) {
          var user_info = wx.getStorageSync('savor_user_info');

          user_info.guide_prompt.push(type);
          wx.setStorageSync('savor_user_info', user_info);
        }
      }
    })
  },
  goToBack: function (e) {
    var that = this;
    var showVedio = that.data.showVedio;
    if (showVedio==true){
      var status = 0; 
    }else {
      var status = 1;
    }
    app.goToBack(status);
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})