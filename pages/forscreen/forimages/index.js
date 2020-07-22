const utils = require('../../../utils/util.js')
var mta = require('../../../utils/mta_analysis.js')
const app = getApp();
//var tmp;
var openid;
var policy;
var signature;
var postf;   //上传文件扩展名
var box_mac = '';
var upimgs = [];
var imgsize = [];
var post_imgs = [];
var img_lenth = 0;
//var oss_img = [];
var tmp_percent = [];
var forscreen_char = '';
var pic_show_cur = [];
var page = 1;
var forscreen_history_list;
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
var oss_upload_url = app.globalData.oss_upload_url;
var pubdetail = [];
var netty_push_info ;
var netty_push_img ;
Page({
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
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
    is_assist:0,       //是否助力
    showGuidedMaskBeforLaunch:false,
    showGuidedMaskAfterLaunch:false,
    res_head_desc:'图片',
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    //wx.hideShareMenu();
    var that = this;
    
    var user_info = wx.getStorageSync("savor_user_info");
    var is_open_simple = e.is_open_simple;
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
      nickName: user_info.nickName,
      is_open_simple: is_open_simple,
      is_show_jump: false,
      is_btn_disabel:true

    });
    wx.chooseImage({
      count: 6, // 默认6
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        that.setData({
          showTpBt: true,
          showThird: false,
          showSecond: true,
          is_btn_disabel: false
        })
        uploadInfos(res, box_mac, openid);
        lead(openid);
        utils.tryCatch(mta.Event.stat('choosePic', { 'status': 1 }))
      },
      fail:function(res){
        wx.navigateBack({
          delta: 1
        })
        utils.tryCatch(mta.Event.stat('choosePic', { 'status': 0 }))
      }
    })
    
    function uploadInfos(res, box_mac, openid) {
      var img_len = res.tempFilePaths.length;
      if (img_len > 0 && img_len < 10) {
        var tmp_imgs = [];
        for (var i = 0; i < img_len; i++) {
          tmp_imgs[i] = { "tmp_img": res.tempFilePaths[i], 'resource_size': res.tempFiles[i].size };
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
    //引导蒙层
    function lead(openid){
      
      var user_info = wx.getStorageSync('savor_user_info');
      var guide_prompt = user_info.guide_prompt;
      if(typeof(guide_prompt)!='undefined'){
        if (guide_prompt.length == 0) {
          that.setData({
            showGuidedMaskBeforLaunch: true,
          })
        } else {
          var is_lead = 1;
          for (var i = 0; i < guide_prompt.length; i++) {
            if (guide_prompt[i] == 1) {
              is_lead = 0;
              break;
            }
          }
          if (is_lead == 1) {
            that.setData({
              showGuidedMaskBeforLaunch: true
            })
          }
        }
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
      is_btn_disabel: true,
      is_show_jump: false,
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
          is_btn_disabel:false,
        })
        utils.tryCatch(mta.Event.stat('reChoosePic', { 'status': 1 }))
      },fail:function(res){
        utils.tryCatch(mta.Event.stat('reChoosePic', { 'status': 0 }))
      }
    })
    function uploadInfos(res, box_mac, openid) {
      var img_len = res.tempFilePaths.length;
      if (img_len > 0 && img_len < 10) {
        var tmp_imgs = [];
        for (var i = 0; i < img_len; i++) {
          tmp_imgs[i] = { "tmp_img": res.tempFilePaths[i], 'resource_size': res.tempFiles[i].size };
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
    netty_push_info={};
    netty_push_img = [];
    var that = this;
    var formId = e.detail.formId;
    img_lenth = e.detail.value.img_lenth;
    openid = e.detail.value.openid;
    box_mac = e.detail.value.box_mac;
    forscreen_char = e.detail.value.forscreen_char;
    var public_text = e.detail.value.public_text;
    var is_pub_hotelinfo = e.detail.value.is_pub_hotelinfo;   //是否公开显示餐厅信息
    var is_share = e.detail.value.is_share;
    lead(openid, is_share);
    var is_assist = 0;
    if(is_share==1){
      is_assist = 1
    }
    var avatarUrl = e.detail.value.avatarUrl;
    var nickName = e.detail.value.nickName;
    var is_open_simple = e.detail.value.is_open_simple;

    that.setData({
      is_btn_disabel: true,
      is_share: is_share,
      is_assist:is_assist
    })
    if (e.detail.value.upimgs0 != '' && e.detail.value.upimgs0 != undefined){
      
      upimgs[0] = e.detail.value.upimgs0;
      imgsize[0] = e.detail.value.imgSize0;
      
    } 
    if (e.detail.value.upimgs1 != '' && e.detail.value.upimgs1 != undefined){
      upimgs[1] = e.detail.value.upimgs1;
      imgsize[1] = e.detail.value.imgSize1;
    } 
    if (e.detail.value.upimgs2 != '' && e.detail.value.upimgs2 != undefined){
      upimgs[2] = e.detail.value.upimgs2;
      imgsize[2] = e.detail.value.imgSize2;
    } 
    if (e.detail.value.upimgs3 != '' && e.detail.value.upimgs3 != undefined){
      upimgs[3] = e.detail.value.upimgs3;
      imgsize[3] = e.detail.value.imgSize3;
    } 
    if (e.detail.value.upimgs4 != '' && e.detail.value.upimgs4 != undefined){
      upimgs[4] = e.detail.value.upimgs4;
      imgsize[4] = e.detail.value.imgSize4;
    }
    if (e.detail.value.upimgs5 != '' && e.detail.value.upimgs5 != undefined){
      upimgs[5] = e.detail.value.upimgs5;
      imgsize[5] = e.detail.value.imgSize5;
    } 

    wx.request({
      url: api_url+'/smallapp21/User/isForscreenIng',
      headers: {
        'Content-Type': 'application/json'
      },
      method: "POST",
      data: { box_mac: box_mac },
      success: function (res) {
        var timer8_0;
        var is_forscreen = res.data.result.is_forscreen;
        if (is_forscreen == 1) {
          wx.showModal({
            title: '确认要打断投屏',
            content: '当前电视正在进行投屏,继续投屏有可能打断当前投屏中的内容.',
            success: function (res) {
              if (res.confirm) {
                /*if (is_open_simple > 0) {
                  timer8_0 = setTimeout(function () {
                    that.setData({
                      is_show_jump: true,
                      show: true

                    })
                  }, 10000);
                }*/
                wx.request({
                  url: api_url+'/Smallapp/Index/getOssParams',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  success: function (rest) {

                    policy = rest.data.policy;
                    signature = rest.data.signature;
                    //第一步
                    uploadOss_multy(policy, signature, upimgs, imgsize, box_mac, openid, img_lenth, forscreen_char, avatarUrl, nickName, public_text, timer8_0);
                  }
                });
                
                app.recordFormId(openid,formId);
                
              } else if (res.cancel) {
                wx.navigateBack({
                  delta:1
                })
              }
            }
          })
          if (public_text == '' || typeof (public_text) == 'undefined') {
            var ispublictext = 0;
          } else {
            var ispublictext = 1;
          }
          utils.tryCatch(mta.Event.stat('forscreenImg', { 'picnums': upimgs.length, 'forscreenchar': forscreen_char, 'ispublictext': ispublictext, 'is_share': is_share, 'isforscreen': 1 }))
        }else {
          /*if (is_open_simple > 0) {
            timer8_0 = setTimeout(function () {
              that.setData({
                is_show_jump: true,
                show: true

              })
              
            }, 10000);
          }*/
          wx.request({
            url: api_url+'/Smallapp/Index/getOssParams',
            headers: {
              'Content-Type': 'application/json'
            },
            success: function (rest) {

              policy = rest.data.policy;
              signature = rest.data.signature;
              //第一步
              uploadOss_multy(policy, signature, upimgs, imgsize, box_mac, openid, img_lenth, forscreen_char, avatarUrl, nickName, public_text, timer8_0);
            }
          });
          app.recordFormId(openid,formId);
          
          if (public_text == '' || typeof (public_text) == 'undefined') {
            var ispublictext = 0;
          } else {
            var ispublictext = 1;
          }
          utils.tryCatch(mta.Event.stat('forscreenImg', { 'picnums': upimgs.length, 'forscreenchar': forscreen_char, 'ispublictext': ispublictext, 'is_share': is_share,'isforscreen':0 }))
        }
      }
    })
    
    
    
    function uploadOssNew(policy, signature, img_url, resource_size,box_mac, openid, timestamp, flag, img_len, forscreen_char, forscreen_id, res_sup_time, avatarUrl, nickName, public_text, timer8_0, tmp_imgs) {
      var filename = img_url;
      var index1 = filename.lastIndexOf(".");
      var index2 = filename.length;
      var mobile_brand = app.globalData.mobile_brand;
      var mobile_model = app.globalData.mobile_model;
      var order = flag + 1;
      var postf_t = filename.substring(index1, index2);//后缀名
      var postf_w = filename.substring(index1 + 1, index2);//后缀名
      var upload_task = wx.uploadFile({
        url: oss_upload_url,
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
          OSSAccessKeyId: app.globalData.oss_access_key_id,
          sucess_action_status: "200",
          signature: signature

        },

        success: function (res) {
          /*if (order == img_len) {
            clearTimeout(timer8_0);
          }*/
          
          that.setData({
            showThird: true,
            showTpBt: false,
            forscreen_id: forscreen_id,
          });
          var res_eup_time = (new Date()).valueOf();
          var netty_tmp = {};
          netty_tmp.url = "forscreen/resource/" + timestamp + postf_t;
          netty_tmp.filename = filename = timestamp + postf_t ;
          netty_tmp.order    = flag;
          netty_tmp.img_id   = timestamp;
          netty_tmp.resource_size = resource_size;
          

          netty_push_img.push(netty_tmp);
          
          
          wx.request({
            url: api_v_url + '/index/recordForScreenPics',
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
              public_text: public_text,
              imgs: '["forscreen/resource/' + timestamp + postf_t + '"]',
              resource_id: timestamp,
              res_sup_time: res_sup_time,
              res_eup_time: res_eup_time,
              resource_size: resource_size,
              is_pub_hotelinfo: is_pub_hotelinfo,
              is_share: is_share,
              resource_type: 1,
              res_nums: img_len,
              serial_number:app.globalData.serial_number
            },
            success: function (ret) {
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

          if (netty_push_img.length == img_len) {
            var end_time = (new Date()).valueOf();
            var diff_time = end_time - forscreen_id;
            netty_push_info.res_eup_time = (new Date()).valueOf();
            utils.tryCatch(mta.Event.stat('forscreenImgWastTime', { 'uploadtime': diff_time })); 
            netty_push_info.img_list = netty_push_img;

            netty_push_info = JSON.stringify(netty_push_info);
            
            wx.request({
              url: api_url + '/Netty/Index/pushnetty',
              headers: {
                'Content-Type': 'application/json'
              },
              method: "POST",
              data: {
                box_mac: box_mac,
  
                msg: netty_push_info,
  
              },
              success: function (result) {
                if(result.data.code!=10000){
                  wx.showToast({
                    title: '投屏失败!',
                    icon:'none',
                    duration:2000,
  
                  })
                }
              }
            })
          }
        },
        complete: function (es) {
          tmp_percent[flag] = { "percent": 100 };
          that.setData({
            tmp_percent: tmp_percent
          })
        },
        fail: function ({ errMsg }) {
          wx.navigateBack({
            delta: 1
          })
          wx.showToast({
            title: '投屏失败，请重试',
            icon:'none',
            duration:2000
          })
        },
      });
      upload_task.onProgressUpdate((res) => {
        tmp_percent[flag] = { "percent": res.progress };
        that.setData({
          tmp_percent: tmp_percent
        });
        if (res.progress==100){
          
          tmp_imgs[flag].is_sing_forscreen = 1;
          that.setData({
            tmp_imgs:tmp_imgs,
            showFirst: false,
            showSecond: true,
            showView: false,
            percent: 0
          })
          
          
        }

      })

    }
    function uploadOss_multy(policy, signature, upimgs, imgsize,box_mac, openid, img_len, forscreen_char, avatarUrl, nickName, public_text, timer8_0) {
      var tmp_imgs = [];
      var forscreen_id = (new Date()).valueOf();
      netty_push_info.forscreen_id = forscreen_id;
      netty_push_info.action = 4;
      netty_push_info.resource_type = 2;
      netty_push_info.openid = openid;
      netty_push_info.forscreen_char = forscreen_char;
      netty_push_info.avatarUrl = avatarUrl;
      netty_push_info.nickName  = nickName;
      netty_push_info.res_sup_time = (new Date()).valueOf();
      for (var i = 0; i < img_len; i++) {
        
        var res_sup_time = (new Date()).valueOf();
        var filename = upimgs[i];
        var resource_size = imgsize[i];
        var index1 = filename.lastIndexOf(".");
        var index2 = filename.length;
        var timestamp = (new Date()).valueOf();
        postf = filename.substring(index1, index2);//后缀名
        post_imgs[i] = "forscreen/resource/" + timestamp + postf;

        tmp_imgs[i] = { "oss_img": post_imgs[i],'img_id':timestamp,"resource_size":resource_size };
        // that.setData({
        //   tmp_imgs: tmp_imgs
        // });
        
        //第二步
        uploadOssNew(policy, signature, filename, resource_size, box_mac, openid, timestamp, i, img_len, forscreen_char, forscreen_id, res_sup_time, avatarUrl, nickName, public_text, timer8_0, tmp_imgs);
        app.sleep(1)
      }
      
    }
    //引导蒙层
    function lead(openid, is_share) {
      
      if(is_share==1){
        var user_info = wx.getStorageSync('savor_user_info');
        var guide_prompt = user_info.guide_prompt;
        if (typeof (guide_prompt) !='undefined'){
          if (guide_prompt.length == 0) {
            that.setData({
              showGuidedMaskAfterLaunch: true,
            })
          } else {
            var is_lead = 1;
            for (var i = 0; i < guide_prompt.length; i++) {
              if (guide_prompt[i] == 2) {
                is_lead = 0;
                break;
              }
            }
            if (is_lead == 1) {
              that.setData({
                showGuidedMaskAfterLaunch: true
              })
            }
          }
        }
        
      }
      
    }



  }, //多张图片投屏结束(不分享到发现)

  up_single_pic(e) {//指定单张图片投屏开始
    
    var that = this;
    box_mac = e.target.dataset.boxmac;
    openid = e.target.dataset.openid;
    var forscreen_img = e.target.dataset.img;
    var img_id  = e.target.dataset.img_id;
    var pos = forscreen_img.lastIndexOf('/');
    var filename = forscreen_img.substring(pos + 1);
    var timestamp = (new Date()).valueOf();
    var mobile_brand = app.globalData.mobile_brand;
    var mobile_model = app.globalData.mobile_model;
    var img_index = e.target.dataset.imgindex;
    var img_len = e.target.dataset.imglen;
    var resource_size = e.target.dataset.resource_size

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
    var forscreen_id = (new Date()).valueOf();
    var push_img = [];
    var push_info = {};
    push_info.forscreen_id = forscreen_id;
    push_info.action = 4;
    push_info.resource_type = 2;
    push_info.openid = openid;
    push_info.forscreen_char = forscreen_char;
    push_info.avatarUrl = avatarUrl;
    push_info.nickName  = nickName;
    var netty_tmp = {};
    netty_tmp.url = forscreen_img ;
    netty_tmp.filename = filename ;
    netty_tmp.img_id   = img_id;
    netty_tmp.resource_size = resource_size;

    push_img.push(netty_tmp);

    push_info.img_list = push_img;

    push_info = JSON.stringify(push_info);
    wx.request({
      url: api_url+'/Netty/Index/pushnetty',
      headers: {
        'Content-Type': 'application/json'
      },
      method: "POST",
      data: {
        box_mac: box_mac,
        msg: push_info,
      },
      success: function (result) {
        if(result.data.code!=10000){
          wx.showToast({
            title: '投屏失败!',
            icon: 'none',
            duration: 2000,

          })
        }
        wx.request({
          url: api_v_url+'/index/recordForScreenPics',
          header: {
            'content-type': 'application/json'
          },
          data: {
            forscreen_id: forscreen_id,
            openid: openid,
            box_mac: box_mac,
            action: 2,
            resource_type: 1,
            mobile_brand: mobile_brand,
            mobile_model: mobile_model,
            imgs: '["' + forscreen_img + '"]',
            serial_number : app.globalData.serial_number
          },
        });
        utils.tryCatch(mta.Event.stat("switchpic", {}))
      },
    })
  },//指定单张图片投屏结束
  exitForscreen(e) {
    var that = this;
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.boxmac;
    var timestamp = (new Date()).valueOf();
    wx.request({
      url: api_url+'/Netty/Index/pushnetty',
      headers: {
        'Content-Type': 'application/json'
      },
      method: "POST",
      data: {
        box_mac: box_mac,
        msg: '{ "action": 3,"openid":"' + openid + '"}',
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
        utils.tryCatch(mta.Event.stat('exitForscreen', { 'status': 1 }))
      },
      fail: function (res) {
        wx.showToast({
          title: '网络异常，退出失败',
          icon: 'none',
          duration: 2000
        })
        utils.tryCatch(mta.Event.stat('exitForscreen', { 'status': 0 }))
      }
    })
  },//退出投屏结束
  //是否公开显示餐厅信息
  checkboxChange:function(e){
    var that = this;
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
    wx.previewImage({
      current: urls[pkey], // 当前显示图片的http链接
      urls: urls // 需要预览的图片http链接列表
    })
  },
  replayHistory: function (e) {
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
  loadMore: function (e) {
    var that = this;
    var openid = e.target.dataset.openid;
    var box_mac = e.target.dataset.box_mac;
    page = page + 1;
    that.setData({
      hiddens: false,
    })
    wx.request({
      url: api_url+'/Smallapp21/ForscreenHistory/getList',
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
  closeJump: function (e) {
    var that = this;
    that.setData({
      is_show_jump: false,
    })
  },
  upload_wait:function(e){
    wx.showToast({
      title: '该图片未上传成功,请稍后！',
      icon: 'none',
      duration: 2000
    });
  },
  //我要助力
  assist:function(e){
    var that = this;
    var openid = e.detail.value.openid;
    var box_mac = e.detail.value.box_mac;
    var forscreen_id = e.detail.value.forscreen_id;
    var formId = e.detail.formId;
    app.recordFormId(openid, formId);
    if (typeof (forscreen_id)=='undefined'){
      wx.showToast({
        title: '助力参数异常，请重试或重选照片',
        icon:'none',
        duration:2000
      })
      
    }else {

      wx.request({
        url: api_url +'/Smallapp3/ForscreenHelp/helpplay',
        header: {
          'Content-Type': 'application/json'
        },
        data:{
          forscreen_id: forscreen_id,
          openid      : openid,
        },success:function(res){
          if(res.data.code==10000){
            var rec_id = res.data.result.forscreen_id;
            wx.navigateTo({
              url: '/pages/mine/assist/index?forscreen_id=' + rec_id + '&box_mac=' + box_mac +"&inside=1",
            })
            
          }else {
            wx.showToast({
              title: '助力参数异常，请重选照片',
              icon: 'none',
              duration: 2000
            })
          }
        },fail:function(res){
          wx.showToast({
            title: '助力参数异常，请重选照片',
            icon: 'none',
            duration: 2000
          })
        }
      })
    }
  },
  phonecallevent: function (e) {
    var tel = e.target.dataset.tel;
    wx.makePhoneCall({
      phoneNumber: tel,
      success:function(res){
        utils.tryCatch(mta.Event.stat('forImgPhoneCall', { 'status': 1 }))
      },fail:function(res){
        utils.tryCatch(mta.Event.stat('forImgPhoneCall', { 'status': 0 }))
      }
    })
  },
  closeLead:function (e){
    var that = this;
    var type = e.currentTarget.dataset.type;
    if(type==1){
      that.setData({
        showGuidedMaskBeforLaunch:false,
      })
    }else if(type==2){
      that.setData({
        showGuidedMaskAfterLaunch:false,
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
      success: function (res) {
        if (res.data.code == 10000) {
          var user_info = wx.getStorageSync('savor_user_info');

          user_info.guide_prompt.push(type);
          wx.setStorageSync('savor_user_info', user_info);

        }
      }
    })
  },
  goToBack:function(e){
    var that = this;
    var params = that.data.showThird
    if(params==true){
      var status =1;
    }else {
      var status = 0;  
    }
    app.goToBack(status);
  }
})
