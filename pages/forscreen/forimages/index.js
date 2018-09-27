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
    pic_show_cur: [],    //当前上传照片是否被选中
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    var that = this;
    openid = e.openid;
    //注册用户
    wx.getUserInfo({
      success: function (res) {
        wx.request({
          url: 'https://mobile.littlehotspot.com/smallapp/User/register',
          data: {
            "openid": openid,
            "avatarUrl": res.userInfo.avatarUrl,
            "nickName": res.userInfo.nickName,
            "gender": res.userInfo.gender
          },
          header: {
            'content-type': 'application/json'
          },
          success: function (res) {
            wx.setStorage({
              key: 'savor_user_info',
              data: res.data.result,
            })
          }
        })
      }
    });
    box_mac = e.box_mac;
    that.setData({
      openid: openid,
      box_mac: box_mac,
      up_imgs: [],
      tmp_percent: [],
      tmp_imgs: [],
      pic_show_cur: []

    });
    wx.chooseImage({
      count: 9, // 默认9
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
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.boxmac;
    
    wx.chooseImage({
      count: 9, // 默认9
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

  up_forscreen(e) {//多张图片投屏开始
    var that = this;
    img_lenth = e.detail.value.img_lenth;
    openid = e.detail.value.openid;
    box_mac = e.detail.value.box_mac;
    forscreen_char = e.detail.value.forscreen_char;
    


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
        uploadOss_multy(policy, signature, upimgs, box_mac, openid, img_lenth, forscreen_char);
      }
    });
    function uploadOssNew(policy, signature, img_url, box_mac, openid, timestamp, flag, img_len, forscreen_char, forscreen_id, res_sup_time) {

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
          /*wx.request({
            url: "https://netty-push.littlehotspot.com/push/box",
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            data: {
              box_mac: box_mac,
              cmd: 'call-mini-program',
              msg: '{ "action": 4, "resource_type":2, "url": "forscreen/resource/' + timestamp + postf_t + '", "filename":"' + timestamp + postf_t + '","openid":"' + openid + '","img_nums":' + img_len + ',"forscreen_char":"' + forscreen_char + '","order":' + order + ',"forscreen_id":"' + forscreen_id + '","img_id":"' + timestamp+'"}',
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
          })*/
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
                url: 'https://mobile.littlehotspot.com/Smallapp/index/recordForScreenPics',
                header: {
                  'content-type': 'application/json'
                },
                data: {
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
                      msg: '{ "action": 4, "resource_type":2, "url": "forscreen/resource/' + timestamp + postf_t + '", "filename":"' + timestamp + postf_t + '","openid":"' + openid + '","img_nums":' + img_len + ',"forscreen_char":"' + forscreen_char + '","order":' + order + ',"forscreen_id":"' + forscreen_id + '","img_id":"' + timestamp + '"}',
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
                  })
                }
          });
        }

      })

    }
    function uploadOss_multy(policy, signature, upimgs, box_mac, openid, img_len, forscreen_char) {
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
        uploadOssNew(policy, signature, filename, box_mac, openid, timestamp, i, img_len, forscreen_char, forscreen_id, res_sup_time);
      }
      that.setData({
        showThird: true,
        showTpBt: false
      });
    }
  }, //多张图片投屏结束

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
        msg: '{ "action": 2,"resource_type":1, "url": "' + forscreen_img + '", "filename":"' + filename + '","openid":"' + openid + '"}',
        req_id: timestamp
      },
      success: function (result) {
        wx.request({
          url: 'https://mobile.littlehotspot.com/Smallapp/index/recordForScreenPics',
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
  },
})
