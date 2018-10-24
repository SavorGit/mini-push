// pages/forscreen/forvideo/index.js
const app = getApp();
var tmp;
var openid;
var policy;
var signature;
var postf;   //上传文件扩展名
var box_mac = '';
var forscreen_char = '';
var res_sup_time;
var page = 1;
var forscreen_history_list;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showVedio:false,
    showRechoose:false,
    upload_vedio_temp:'',
    duration:0,
    //upload_vedio_img_temp:'',
    vedio_percent: 0,
    item: [
      { 'name': '公开时显示餐厅信息', 'value': '1', 'checked': true, 'disabled': false },
      { 'name': '公开发表，公众可见', 'value': '2', 'checked': false, 'disabled': false },

    ],
    is_pub_hotelinfo: 1,  //是否公开酒楼信息
    is_share: 0 ,         //是否分享到发现栏目
    is_btn_disabel:false,
    avatarUrl: '',
    nickName: '',
    replay_video_url:'',
    is_replay_disabel:false,
    djs:10,
    forscreen_history_list:'',
    hiddens: true,   //上拉加载中
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    var that = this
    var box_mac = e.box_mac;
    var openid = e.openid;
    var user_info = wx.getStorageSync("savor_user_info");
    var avatarUrl = user_info.avatarUrl;
    var nickName  = user_info.nickName;
    that.setData({
      openid: openid,
      box_mac: box_mac,
      upload_vedio_temp: '',
      avatarUrl: avatarUrl,
      nickName: nickName,
    })

    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success: function (res) {
        that.setData({
          showVedio: true,
          upload_vedio_temp:res.tempFilePath,
          duration: res.duration
        });
        
        //res_sup_time = (new Date()).valueOf();
        //uploadVedio(res, box_mac, openid, res_sup_time);
      },fail:function(res){
        wx.navigateBack({
          delta: 1,
        })
      }
    });
    
    
  },

  forscreen_video: function (res) {
    //console.log(res);
    var that= this;
    that.setData({
      is_btn_disabel:true,
    })
    var video = res.target.dataset.video;
    var box_mac = res.target.dataset.box_mac;
    var openid = res.target.dataset.openid;
    var is_pub_hotelinfo = res.target.dataset.is_pub_hotelinfo;
    var is_share = res.target.dataset.is_share;
    var duration = res.target.dataset.duration;
    var avatarUrl = res.target.dataset.avatarurl;
    var nickName = res.target.dataset.nickname;
    
    res_sup_time = (new Date()).valueOf();
    uploadVedio(video, box_mac, openid, res_sup_time, is_pub_hotelinfo, is_share, duration, avatarUrl, nickName);
    function uploadVedio(video, box_mac, openid, res_sup_time, is_pub_hotelinfo, is_share, duration, avatarUrl, nickName) {
     
      wx.request({
        url: 'https://mobile.littlehotspot.com/Smallapp/Index/getOssParams',
        headers: {
          'Content-Type': 'application/json'
        },
        success: function (rest) {
          policy = rest.data.policy;
          signature = rest.data.signature;
          uploadOssVedio(policy, signature, video, box_mac, openid, res_sup_time, is_pub_hotelinfo, is_share, duration, avatarUrl, nickName);
        }
      });
    }
    function uploadOssVedio(policy, signature, video, box_mac, openid, res_sup_time, is_pub_hotelinfo, is_share, duration, avatarUrl, nickName) {
      
      var filename = video;          //视频url

      //var filename_img = video.thumbTempFilePath; //视频封面图
      //console.log(video);
      var index1 = filename.lastIndexOf(".");
      var index2 = filename.length;
      var mobile_brand = app.globalData.mobile_brand;
      var mobile_model = app.globalData.mobile_model;
      var postf_t = filename.substring(index1, index2);//后缀名
      var timestamp = (new Date()).valueOf();

      var upload_task = wx.uploadFile({
        url: "https://image.littlehotspot.com",
        filePath: filename,
        name: 'file',

        formData: {
          Bucket: "redian-produce",
          name: filename,
          key: "forscreen/resource/" + timestamp + postf_t,
          policy: policy,
          OSSAccessKeyId: "LTAITjXOpRHKflOX",
          sucess_action_status: "200",
          signature: signature

        },
        success: function (res) {

        }
      });
      upload_task.onProgressUpdate((res) => {
        //console.log(res);

        that.setData({
          vedio_percent: res.progress
        });
        if (res.progress == 100) {
          var res_eup_time = (new Date()).valueOf();
          //console.log(res_eup_time);
          that.setData({
            showVedio:false,
          })
          wx.request({
            url: 'https://mobile.littlehotspot.com/Smallapp21/index/recordForScreenPics',
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
              imgs: '["forscreen/resource/' + timestamp + postf_t + '"]',
              resource_id: timestamp,
              res_sup_time: res_sup_time,
              res_eup_time: res_eup_time,
              resource_size: res.totalBytesSent,
              is_pub_hotelinfo: is_pub_hotelinfo,
              is_share: is_share,
              forscreen_id: res_eup_time,
              duration: duration,
            },
            success: function (ret) {
              wx.request({
                url: "https://netty-push.littlehotspot.com/push/box",
                header: {
                  "Content-Type": "application/x-www-form-urlencoded"
                },
                method: "POST",
                data: {
                  box_mac: box_mac,
                  cmd: 'call-mini-program',
                  msg: '{ "action":2, "url": "forscreen/resource/' + timestamp + postf_t + '", "filename":"' + timestamp + postf_t + '","openid":"' + openid + '","resource_type":2,"video_id":"' + timestamp + '","avatarUrl":"' + avatarUrl +'","nickName":"'+nickName+'"}',
                  req_id: timestamp
                },
                success: function (result) {
                    

                },
                
              });
              wx.request({
                url: 'https://mobile.littlehotspot.com/Smallapp21/ForscreenHistory/getList',
                header: {
                  'content-type': 'application/json'
                },
                data: {
                  openid: openid,
                  box_mac: box_mac,
                  page: page,
                },
                success: function (res) {
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
        }

      });
      that.setData({
        replay_video_url: "forscreen/resource/" + timestamp + postf_t,
        showVedio: true,
        upload_vedio_temp: filename,
        //upload_vedio_img_temp: filename_img,

      });
    }
  },

  //重新选择视频
  chooseVedio(e) {
    var that = this
    that.setData({
      item: [
        { 'name': '公开时显示餐厅信息', 'value': '1', 'checked': true, 'disabled': false },
        { 'name': '公开发表，公众可见', 'value': '2', 'checked': false, 'disabled': false },

      ],
      is_share: 0,
      is_btn_disabel:false
    })
    var box_mac = e.currentTarget.dataset.boxmac;
    var openid = e.currentTarget.dataset.openid;
    

    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success: function (res) {
        
        that.setData({
          showVedio: true,
          upload_vedio_temp: res.tempFilePath,
          vedio_percent:0
        });
        //uploadVedio(res, box_mac, openid);
      }
    });
    function uploadVedio(video, box_mac, openid) {
      wx.request({
        url: 'https://mobile.littlehotspot.com/Smallapp/Index/getOssParams',
        headers: {
          'Content-Type': 'application/json'
        },
        success: function (rest) {
          policy = rest.data.policy;
          signature = rest.data.signature;
          uploadOssVedio(policy, signature, video, box_mac, openid);
        }
      });
    }
    function uploadOssVedio(policy, signature, video, box_mac, openid) {

      var filename = video.tempFilePath;          //视频url
      //var filename_img = video.thumbTempFilePath; //视频封面图
      //console.log(video);
      var index1 = filename.lastIndexOf(".");
      var index2 = filename.length;
      var mobile_brand = app.globalData.mobile_brand;
      var mobile_model = app.globalData.mobile_model;
      var postf_t = filename.substring(index1, index2);//后缀名
      var timestamp = (new Date()).valueOf();

      var upload_task = wx.uploadFile({
        url: "https://image.littlehotspot.com",
        filePath: filename,
        name: 'file',

        formData: {
          Bucket: "redian-produce",
          name: filename,
          key: "forscreen/resource/" + timestamp + postf_t,
          policy: policy,
          OSSAccessKeyId: "LTAITjXOpRHKflOX",
          sucess_action_status: "200",
          signature: signature

        },
        success: function (res) {

          /*wx.request({
            url: "https://netty-push.littlehotspot.com/push/box",
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            data: {
              box_mac: box_mac,
              cmd: 'call-mini-program',
              msg: '{ "action":2, "url": "forscreen/resource/' + timestamp + postf_t + '", "filename":"' + timestamp + postf_t + '","openid":"' + openid + '","resource_type":2,"video_id":"' + timestamp+'"}',
              req_id: timestamp
            },
            success: function (result) {
             

            },
          });*/
        }
      });
      upload_task.onProgressUpdate((res) => {
        //console.log(res.progress);
        that.setData({
          vedio_percent: res.progress
        })
        if (res.progress == 100) {
          var res_eup_time = (new Date()).valueOf();
          //console.log(res_eup_time);

          wx.request({
            url: 'https://mobile.littlehotspot.com/Smallapp21/index/recordForScreenPics',
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
              imgs: '["forscreen/resource/' + timestamp + postf_t + '"]',
              resource_id: timestamp,
              res_sup_time: res_sup_time,
              res_eup_time: res_eup_time,
              resource_size: res.totalBytesSent
            },
            success:function(ret){
              wx.request({
                url: "https://netty-push.littlehotspot.com/push/box",
                header: {
                  "Content-Type": "application/x-www-form-urlencoded"
                },
                method: "POST",
                data: {
                  box_mac: box_mac,
                  cmd: 'call-mini-program',
                  msg: '{ "action":2, "url": "forscreen/resource/' + timestamp + postf_t + '", "filename":"' + timestamp + postf_t + '","openid":"' + openid + '","resource_type":2,"video_id":"' + timestamp + '"}',
                  req_id: timestamp
                },
                success: function (result) {


                },
              });
            }
          });
        }

      });
      that.setData({
        
        showVedio: true,
        upload_vedio_temp: filename

      });
    }
  },

  //退出投屏
  exitForscreen(e) {
    var that = this;
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.boxmac;
    var timestamp = (new Date()).valueOf();
    wx.request({
      url: "https://netty-push.littlehotspot.com/push/box",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "POST",
      data: {
        box_mac: box_mac,
        cmd: 'call-mini-program',
        msg: '{ "action": 3,"openid":"' + openid + '"}',
        req_id: timestamp
      },
      success: function (res) {
        wx.navigateBack({
          delta: 1
        })
        wx.showToast({
          title: '退出成功',
          icon: 'none',
          duration: 2000
        });
      },
      fail: function (res) {
        wx.showToast({
          title: '网络异常，退出失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  //是否公开显示餐厅信息
  checkboxChange: function (e) {
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


  },//是否公开显示餐厅信息结束
  //重播
  replayVideo:function(e){
    var that = this;
    var user_info = wx.getStorageSync("savor_user_info");
    
    var box_mac = e.target.dataset.box_mac;
    var replay_video_url = e.target.dataset.replay_video_url;
    var openid = e.target.dataset.openid;
    var video_arr = replay_video_url.split('/');
    var filename = video_arr[2];
    var tmp_arr = filename.split('.');
    var video_id = tmp_arr[0]; 
    var timestamp = (new Date()).valueOf();
    var mobile_brand = app.globalData.mobile_brand;
    var mobile_model = app.globalData.mobile_model;
    var duration = 10;
    wx.request({
      url: "https://netty-push.littlehotspot.com/push/box",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "POST",
      data: {
        box_mac: box_mac,
        cmd: 'call-mini-program',
        msg: '{ "action":2, "url":"' + replay_video_url + '", "filename":"' + filename + '","openid":"' + openid + '","resource_type":2,"video_id":"' + video_id + '","avatarUrl":"' + user_info.avatarUrl + '","nickName":"' + user_info.nickName+'"}',
        req_id: timestamp
      },
      success: function (result) {
        that.setData({
          is_replay_disabel:true
        })
        var djs = duration;
        that.setData({
          djs: djs
        })
        var timer8_0 = setInterval(function () {
          djs -=1;
          that.setData({
            djs: djs
          });
          if (djs==0){
            that.setData({
              is_replay_disabel: false,
            })
            clearInterval(timer8_0);
          }
        
        }, 1000);
        //记录
        wx.request({
          url: 'https://mobile.littlehotspot.com/Smallapp21/index/recordForScreenPics',
          header: {
            'content-type': 'application/json'
          },
          data: {
            openid: openid,
            box_mac: box_mac,
            action: 8,
            resource_type: 2,
            mobile_brand: mobile_brand,
            mobile_model: mobile_model,
            forscreen_char: '',
            imgs: '["' + replay_video_url + '"]',
            resource_id: video_id,
            res_sup_time: 0,
            res_eup_time: 0,
            resource_size: 0,
            is_pub_hotelinfo: 0,
            is_share: 0,
            forscreen_id: timestamp,
            
          },
        });
      },
    });
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
  replayHistory:function(e){
    console.log(e);
    var that = this;
    var user_info = wx.getStorageSync("savor_user_info");
    //console.log(user_info);
    var avatarUrl = user_info.avatarUrl;
    var nickName = user_info.nickName;
    var forscreen_char = '';
    var mobile_brand = app.globalData.mobile_brand;
    var mobile_model = app.globalData.mobile_model;
    //console.log(e);
    var openid = e.target.dataset.openid;
    var box_mac= e.target.dataset.box_mac;
    var res_type = e.target.dataset.res_type;
    var res_list = e.target.dataset.res_list;
    var res_len = res_list.length;
    var forscreen_id = (new Date()).valueOf();  //投屏id
    var action = 8;  //重新播放
    if (res_type == 1) {
      for (var i = 0; i < res_len; i++) {
        var order = i + 1;
        wx.request({//start
          url: 'https://mobile.littlehotspot.com/Smallapp/index/recordForScreenPics',
          header: {
            'content-type': 'application/json'
          },
          data: {
            forscreen_id: forscreen_id,
            openid: openid,
            box_mac: box_mac,
            action: action,
            mobile_brand: mobile_brand,
            mobile_model: mobile_model,
            forscreen_char: forscreen_char,
            imgs: '["' + res_list[i]['forscreen_url'] + '"]',
            resource_id: res_list[i]['resource_id'],
            res_sup_time: 0,
            res_eup_time: 0,
            resource_size: 0,
            is_pub_hotelinfo: 0,
            is_share: 0
          },
          success: function (ret) {
          }
        });//end
        var url = res_list[i]['forscreen_url'];
        var filename = res_list[i]['filename'];
        var res_id = res_list[i]['resource_id'];

        wx.request({
          url: "https://netty-push.littlehotspot.com/push/box",
          header: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          method: "POST",
          data: {
            box_mac: box_mac,
            cmd: 'call-mini-program',
            msg: '{ "action": 4, "resource_type":2, "url":"' + url + '","filename":"' + filename + '","openid":"' + openid + '","img_nums":' + res_len + ',"forscreen_char":"' + forscreen_char + '","order":' + order + ',"forscreen_id":"' + forscreen_id + '","img_id":"' + res_id + '","avatarUrl":"' + avatarUrl + '","nickName":"' + nickName + '"}',
            req_id: res_id
          },
          success: function (result) {

            wx.showToast({
              title: '重播成功,电视即将开始播放',
              icon: 'none',
              duration: 5000
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
    } else {//视频投屏
      for (var i = 0; i < res_len; i++) {
        wx.request({
          url: 'https://mobile.littlehotspot.com/Smallapp/index/recordForScreenPics',
          header: {
            'content-type': 'application/json'
          },
          data: {
            openid: openid,
            box_mac: box_mac,
            action: action,

            mobile_brand: mobile_brand,
            mobile_model: mobile_model,
            forscreen_char: forscreen_char,
            imgs: '["' + res_list[i]['forscreen_url'] + '"]',
            resource_id: res_list[i]['resource_id'],
            res_sup_time: 0,
            res_eup_time: 0,
            resource_size: 0,
            is_pub_hotelinfo: 0,
            is_share: 0,
            forscreen_id: forscreen_id,
            duration: 0,
          },
          success: function (ret) {

          }
        });

        wx.request({
          url: "https://netty-push.littlehotspot.com/push/box",
          header: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          method: "POST",
          data: {
            box_mac: box_mac,
            cmd: 'call-mini-program',
            msg: '{ "action":2, "url": "' + res_list[i]['forscreen_url'] + '", "filename":"' + res_list[i]['filename'] + '","openid":"' + openid + '","resource_type":2,"video_id":"' + res_list[i]['resource_id'] + '","avatarUrl":"' + avatarUrl + '","nickName":"' + nickName + '"}',
            req_id: res_list[i]['resource_id']
          },
          success: function (result) {

            wx.showToast({
              title: '重播成功,电视即将开始播放',
              icon: 'none',
              duration: 2000
            });
          },
          fail: function (res) {
            wx.showToast({
              title: '网络异常,点播失败',
              icon: 'none',
              duration: 2000
            })
          }
        });
      }
    }

  },
  //上拉刷新
  loadMore: function (e) {
    var that = this;
    var openid = e.target.dataset.openid;
    var box_mac = e.target.dataset.box_mac;
    page = page + 1;
    that.setData({
      hiddens: false,
    })
    wx.request({
      url: 'https://mobile.littlehotspot.com/Smallapp21/ForscreenHistory/getList',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        page: page,
        box_mac:box_mac,
        openid: openid,
      },
      method: "POST",
      success: function (res) {
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