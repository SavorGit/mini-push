const app = getApp();
var tmp;
var openid;
var policy;
var signature;
var postf;   //上传文件扩展名
var box_mac = '';
var upimgs = [];
var post_imgs = [];
var img_lenth = 0;
var oss_img = [];
var tmp_percent = [];
var forscreen_char = '';
var pic_show_cur = [];
var page = 1;
var forscreen_history_list;
Page({
  data: {
    showSecond:false,    //页面是否展示
    showThird: false,    //重选照片 退出投屏
    showTpBt:true,       //投屏添加文字
    openid: '',          //微信用户唯一标识
    box_mac: '',         //机顶盒mac
    percent: '',         //上传图片百分比
    hotel_room: '',      //当前连接酒楼版位名称
    up_imgs: '',         //上传照片数组
    tmp_percent: [],     //上传照片百分比数组
    pic_show_cur: [],    //当前上传照片是否被选中,
    item: [
      { 'name': '公开时显示餐厅信息', 'value': '1', 'checked':true,'disabled': false },
      { 'name': '公开发表，公众可见', 'value': '2', 'checked': false, 'disabled': false },
      
    ],
    is_pub_hotelinfo:1,  //是否公开酒楼信息
    is_share :0,          //是否分享到发现栏目
    is_btn_disabel:false,
    avatarUrl:'',       //用户头像 
    nickName:'',        //用户昵称
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    var that = this;
    var user_info = wx.getStorageSync("savor_user_info");

    openid = e.openid;
    box_mac = e.box_mac;
    that.setData({
      openid: openid,
      box_mac: box_mac,
      up_imgs: [],
      tmp_percent: [],
      tmp_imgs: [],
      pic_show_cur: [],
      avatarUrl: user_info.avatarUrl,
      nickName: user_info.nickName

    });
    wx.chooseImage({
      count: 6, // 默认6
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        uploadInfos(res, box_mac, openid);
        
        that.setData({
          showTpBt: true,
          showThird: false,
          showSecond:true
        })
      },
      fail:function(res){
        wx.navigateBack({
          delta: 1
        })
      }
    })
    
    function uploadInfos(res, box_mac, openid) {
      var img_len = res.tempFilePaths.length;
      if (img_len > 0 && img_len < 10) {
        var tmp_imgs = [];
        for (var i = 0; i < img_len; i++) {
          tmp_imgs[i] = { "tmp_img": res.tempFilePaths[i] };
        }
        that.setData({
          showFirst: false,
          showSecond: true,
          showView: false,
          showThird: false,
          percent: 0,
          up_imgs: tmp_imgs,
          img_lenth: img_len,
        })
      }
    } 
  },

  chooseImage(e) {//重新选择照片开始
    var that = this;
    
    that.setData({
      item: [
        { 'name': '公开时显示餐厅信息', 'value': '1', 'checked': true, 'disabled': false },
        { 'name': '公开发表，公众可见', 'value': '2', 'checked': false, 'disabled': false },

      ],
      is_share:0,
      is_btn_disabel: false
    })
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.boxmac;
    
    wx.chooseImage({
      count: 6, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        that.setData({
          up_imgs: [],
          tmp_percent: [],
          tmp_imgs: [],
          pic_show_cur: []

        });
        uploadInfos(res, box_mac, openid);
        that.setData({
          showTpBt: true,
          showThird: false,
        })
      }
    })
    function uploadInfos(res, box_mac, openid) {
      var img_len = res.tempFilePaths.length;
      if (img_len > 0 && img_len < 10) {
        var tmp_imgs = [];
        for (var i = 0; i < img_len; i++) {
          tmp_imgs[i] = { "tmp_img": res.tempFilePaths[i] };
        }
        that.setData({
          showFirst: false,
          showSecond: true,
          showView: false,
          showThird: false,
          percent: 0,
          up_imgs: tmp_imgs,
          img_lenth: img_len,

        })
      }
    }
  },//重新选择照片结束

  up_forscreen(e) {//多张图片投屏开始(不分享到发现)

    var that = this;
    that.setData({
      is_btn_disabel:true,
    })
    img_lenth = e.detail.value.img_lenth;
    openid = e.detail.value.openid;
    box_mac = e.detail.value.box_mac;
    forscreen_char = e.detail.value.forscreen_char;
    var is_pub_hotelinfo = e.detail.value.is_pub_hotelinfo;   //是否公开显示餐厅信息
    var is_share = e.detail.value.is_share;
    var avatarUrl = e.detail.value.avatarUrl;
    var nickName = e.detail.value.nickName;


    if (e.detail.value.upimgs0 != '' && e.detail.value.upimgs0 != undefined) upimgs[0] = e.detail.value.upimgs0;
    if (e.detail.value.upimgs1 != '' && e.detail.value.upimgs1 != undefined) upimgs[1] = e.detail.value.upimgs1;
    if (e.detail.value.upimgs2 != '' && e.detail.value.upimgs2 != undefined) upimgs[2] = e.detail.value.upimgs2;
    if (e.detail.value.upimgs3 != '' && e.detail.value.upimgs3 != undefined) upimgs[3] = e.detail.value.upimgs3;
    if (e.detail.value.upimgs4 != '' && e.detail.value.upimgs4 != undefined) upimgs[4] = e.detail.value.upimgs4;
    if (e.detail.value.upimgs5 != '' && e.detail.value.upimgs5 != undefined) upimgs[5] = e.detail.value.upimgs5;
    if (e.detail.value.upimgs6 != '' && e.detail.value.upimgs6 != undefined) upimgs[6] = e.detail.value.upimgs6;
    if (e.detail.value.upimgs7 != '' && e.detail.value.upimgs7 != undefined) upimgs[7] = e.detail.value.upimgs7;
    if (e.detail.value.upimgs8 != '' && e.detail.value.upimgs8 != undefined) upimgs[8] = e.detail.value.upimgs8;

    wx.request({
      url: 'https://mobile.littlehotspot.com/Smallapp/Index/getOssParams',
      headers: {
        'Content-Type': 'application/json'
      },
      success: function (rest) {

        policy = rest.data.policy;
        signature = rest.data.signature;
        uploadOss_multy(policy, signature, upimgs, box_mac, openid, img_lenth, forscreen_char, avatarUrl, nickName);
      }
    });
    function uploadOssNew(policy, signature, img_url, box_mac, openid, timestamp, flag, img_len, forscreen_char, forscreen_id, res_sup_time, avatarUrl, nickName) {

      var filename = img_url;
      var index1 = filename.lastIndexOf(".");
      var index2 = filename.length;
      var mobile_brand = app.globalData.mobile_brand;
      var mobile_model = app.globalData.mobile_model;
      var order = flag + 1;
      var postf_t = filename.substring(index1, index2);//后缀名
      var postf_w = filename.substring(index1 + 1, index2);//后缀名
      //console.log(postf_w);

      var upload_task = wx.uploadFile({
        url: "https://image.littlehotspot.com",
        filePath: img_url,
        name: 'file',
        header: {
          'Content-Type': 'image/' + postf_w
        },
        formData: {
          Bucket: "redian-produce",
          name: img_url,
          key: "forscreen/resource/" + timestamp + postf_t,
          policy: policy,
          OSSAccessKeyId: "LTAITjXOpRHKflOX",
          sucess_action_status: "200",
          signature: signature

        },

        success: function (res) {
          
        },
        complete: function (es) {
          tmp_percent[flag] = { "percent": 100 };
          that.setData({
            tmp_percent: tmp_percent
          })
        },
        fial: function ({ errMsg }) {
          console.log('uploadImage fial,errMsg is', errMsg)
        },
      });
      upload_task.onProgressUpdate((res) => {
        tmp_percent[flag] = { "percent": res.progress };
        //console.log(res.progress);
        that.setData({
          tmp_percent: tmp_percent
        });
        if (res.progress==100){
          var res_eup_time = (new Date()).valueOf();
          wx.request({
                url: 'https://mobile.littlehotspot.com/Smallapp21/index/recordForScreenPics',
                header: {
                  'content-type': 'application/json'
                },
                data: {
                  forscreen_id: forscreen_id,
                  openid: openid,
                  box_mac: box_mac,
                  action: 4,
                  mobile_brand: mobile_brand,
                  mobile_model: mobile_model,
                  forscreen_char: forscreen_char,
                  imgs: '["forscreen/resource/' + timestamp + postf_t + '"]',
                  resource_id: timestamp,
                  res_sup_time: res_sup_time,
                  res_eup_time: res_eup_time,
                  resource_size: res.totalBytesSent,
                  is_pub_hotelinfo: is_pub_hotelinfo,
                  is_share:is_share
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
                      msg: '{ "action": 4, "resource_type":2, "url": "forscreen/resource/' + timestamp + postf_t + '", "filename":"' + timestamp + postf_t + '","openid":"' + openid + '","img_nums":' + img_len + ',"forscreen_char":"' + forscreen_char + '","order":' + order + ',"forscreen_id":"' + forscreen_id + '","img_id":"' + timestamp + '","avatarUrl":"' + avatarUrl + '","nickName":"' + nickName+'"}',
                      req_id: timestamp
                    },
                    success: function (result) {

                      that.setData({
                        showFirst: false,
                        showSecond: true,
                        showView: false,
                        percent: 0
                      })
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

      })

    }
    function uploadOss_multy(policy, signature, upimgs, box_mac, openid, img_len, forscreen_char, avatarUrl, nickName) {
      //console.log(img_len);
      var tmp_imgs = [];
      var forscreen_id = (new Date()).valueOf();
      for (var i = 0; i < img_len; i++) {
        var res_sup_time = (new Date()).valueOf();
        var filename = upimgs[i];
        var index1 = filename.lastIndexOf(".");
        var index2 = filename.length;
        var timestamp = (new Date()).valueOf();
        postf = filename.substring(index1, index2);//后缀名
        post_imgs[i] = "forscreen/resource/" + timestamp + postf;

        tmp_imgs[i] = { "oss_img": post_imgs[i] };
        that.setData({
          tmp_imgs: tmp_imgs
        });
        uploadOssNew(policy, signature, filename, box_mac, openid, timestamp, i, img_len, forscreen_char, forscreen_id, res_sup_time, avatarUrl, nickName);
      }
      that.setData({
        showThird: true,
        showTpBt: false
      });
    }
  }, //多张图片投屏结束(不分享到发现)

  up_single_pic(e) {//指定单张图片投屏开始
    
    var that = this;
    box_mac = e.target.dataset.boxmac;
    openid = e.target.dataset.openid;
    var forscreen_img = e.target.dataset.img;
    var pos = forscreen_img.lastIndexOf('/');
    var filename = forscreen_img.substring(pos + 1);
    var timestamp = (new Date()).valueOf();
    var mobile_brand = app.globalData.mobile_brand;
    var mobile_model = app.globalData.mobile_model;
    var img_index = e.target.dataset.imgindex;
    var img_len = e.target.dataset.imglen;

    var user_info = wx.getStorageSync("savor_user_info");
    var avatarUrl = user_info.avatarUrl;
    var nickName  = user_info.nickName;

    for (var p = 0; p < img_len; p++) {
      if (img_index == p) {
        pic_show_cur[p] = true;

      } else {
        pic_show_cur[p] = false;
      }
      that.setData({
        pic_show_cur: pic_show_cur
      })
    }
    wx.request({
      url: "https://netty-push.littlehotspot.com/push/box",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "POST",
      data: {
        box_mac: box_mac,
        cmd: 'call-mini-program',
        msg: '{ "action": 2,"resource_type":1, "url": "' + forscreen_img + '", "filename":"' + filename + '","openid":"' + openid + '","avatarUrl":"' + avatarUrl + '","nickName":"' + nickName+'"}',
        req_id: timestamp
      },
      success: function (result) {
        wx.request({
          url: 'https://mobile.littlehotspot.com/Smallapp21/index/recordForScreenPics',
          header: {
            'content-type': 'application/json'
          },
          data: {
            openid: openid,
            box_mac: box_mac,
            action: 2,
            resource_type: 1,
            mobile_brand: mobile_brand,
            mobile_model: mobile_model,
            imgs: '["' + forscreen_img + '"]'
          },
        });
      },
    })
  },//指定单张图片投屏结束
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
  },//退出投屏结束
  //是否公开显示餐厅信息
  checkboxChange:function(e){
    var that = this;
    //console.log(e.detail.value.length);
    var check_lenth = e.detail.value.length;
    var check_arr = e.detail.value;
    if(check_lenth==2){
      that.setData({
        is_share: 1,
        is_pub_hotelinfo: 1
      })
    }else if(check_lenth==1){
      if (check_arr[0]==1){
        that.setData({
          is_share:0,
          is_pub_hotelinfo: 1
        })
      }else if(check_arr[0]==2){
        that.setData({
          is_share: 1,
          is_pub_hotelinfo:0
        })
      }
    }else if(check_lenth==0){
       that.setData({
         is_pub_hotelinfo: 0,
         is_share: 0
       })
    }
    var check_arr = e.detail.value;
    

  },//是否公开显示餐厅信息结束
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
  replayHistory: function (e) {
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
    var box_mac = e.target.dataset.box_mac;
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
        box_mac: box_mac,
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
})
