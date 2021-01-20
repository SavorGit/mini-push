// scene/pages/forscreen/forimages.js
/**
 * 【场景】商务宴请 - 图片投屏
 */
const utils = require('../../../utils/util.js')
var mta = require('../../../utils/mta_analysis.js')
const app = getApp()
var api_v_url = app.globalData.api_v_url;
var oss_upload_url = app.globalData.oss_upload_url;
var openid;
var box_mac;
var mobile_brand = app.globalData.mobile_brand;
var mobile_model = app.globalData.mobile_model;
var scene_type ;  //来源类型1：商务宴请 2：生日聚会
var all_images_num = 9;
var policy;
var signature;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    SystemInfo: getApp().SystemInfo,
    oss_url:app.globalData.oss_url,
    images_list:[], //已选择投屏照片列表
    del_images:[],  //删除的图片列表
    addDisabled:false,  //保存按钮是否可用
    upDisabled:false,   //上传按钮是否可用
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    openid  = options.openid;  
    box_mac = options.box_mac;
    scene_type    = options.scene_type; 
    wx.request({
      url: api_v_url + '/Index/getOssParams',
      headers: {
        'Content-Type': 'application/json'
      },
      success: function (rest) {
        policy = rest.data.policy;
        signature = rest.data.signature;
      },fail:function(){
        app.showToast('网络异常,请重试')
        wx.navigateBack({
          delta: 1,
        })
      }
    })
    this.getImageList(openid,box_mac,scene_type);
  },
  getImageList:function(openid,box_mac,scene_type){
    var that = this;
    utils.PostRequest(api_v_url + '/file/detail', {
      openid:openid,
      box_mac:box_mac,
      type:scene_type
    }, (data, headers, cookies, errMsg, statusCode) =>{
      var images_list = data.result.images;
      var images_num = data.result.images_num;
      
      that.setData({'images_list':images_list,'images_num':images_num})
    })
  },
  //选择上传图片
  uploadImage: function (e) {
    console.log(e)
    var that = this;
    var type = e.currentTarget.dataset.type; //多张还是单张
    var keys  = '';
    if(type=='one'){
      var choose_num = 1;
      var total_pic = that.data.images_list;
      var keys = e.currentTarget.dataset.keys;
    }else {
      var total_pic = that.data.images_list.length;
      var choose_num = all_images_num - total_pic;
      if (total_pic >= all_images_num) {
        app.showToast('最多上传'+all_images_num+'张照片');
        return false;
      }
    }
    
    wx.showLoading({
      title: '图片上传中...',
      mask: true
    })
    that.setData({
      addDisabled: true,
      upDisabled: true
    })

    wx.chooseImage({
      count: choose_num, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        var tempFilePaths = res.tempFilePaths; //多张图片临时地址
        var total_choose_img = tempFilePaths.length;
        console.log(res)
        console.log('total_pic'+total_pic)
        total_choose_img += total_pic;
        console.log('一共选择了'+total_choose_img);

        for (var i = 0; i < tempFilePaths.length; i++) {
          var filename = tempFilePaths[i];
          var resource_size = res.tempFiles[i].size
          var index1 = filename.lastIndexOf(".");
          var index2 = filename.length;
          var timestamp = (new Date()).valueOf();

          var postf = filename.substring(index1, index2); //后缀名
          var postf_t = filename.substring(index1, index2); //后缀名
          var postf_w = filename.substring(index1 + 1, index2); //后缀名

          var img_url = timestamp + postf;
          //console.log(img_url)
          that.upOss(filename, postf_w, img_url,resource_size, policy, signature,  type,total_choose_img,keys)
          app.sleep(1)
        }
      },
      fail: function (e) {
        wx.hideLoading();
        that.setData({
          addDisabled: false,
          upDisabled: false
        })
      }
    })
  },
  upOss: function (filename, postf_w, img_url, resource_size,policy, signature,  type,total_choose_img,keys) {
    var that = this;
    wx.uploadFile({
      url: oss_upload_url,
      filePath: filename,
      name: 'file',
      header: {
        'Content-Type': 'image/' + postf_w
      },
      formData: {
        Bucket: "redian-produce",
        name: img_url,
        key: "forscreen/resource/" + img_url,
        policy: policy,
        OSSAccessKeyId: app.globalData.oss_access_key_id,
        sucess_action_status: "200",
        signature: signature

      },
      success: function (res) {
        var dish_img_url = "forscreen/resource/" + img_url
        var tmp_info = {};
        tmp_info.oss_file_path = dish_img_url;
        tmp_info.file_id       = 0;
        tmp_info.resource_size = resource_size;
        if(type=='all'){
          
          var images_list = that.data.images_list;
          images_list.push(tmp_info);
          var end_flag = images_list.length
          if (end_flag == total_choose_img) {
            that.setData({
              images_list: images_list
            })
          }
        }else if(type=='one'){
          
          var images_list = that.data.images_list;
          var del_images  = that.data.del_images;
          var or_image_info = images_list[keys];
          if(or_image_info.file_id>0){
            del_images.push(or_image_info.file_id)
          }
          for (var i = 0; i < images_list.length; i++) {
            if (i == keys) {
              images_list[i] = tmp_info;
              break;
            }
          }
          that.setData({
            images_list: images_list,
            del_images:del_images,
          })
        }
        console.log(images_list);
        wx.hideLoading();
        that.setData({
          addDisabled: false,
          upDisabled: false
        })

        
        
      },fail:function(e){
        wx.hideLoading();
        app.showToast('图片上传失败,请重试')
        
        that.setData({
          addDisabled: false,
          upDisabled: false
        })
      }
    })
  },
  delPic: function (e) {
    var that = this;
    var keys = e.currentTarget.dataset.keys;
    var images_list = that.data.images_list;
    var del_images  = that.data.del_images;
    var img_id      = e.currentTarget.dataset.img_id;
    if(img_id>0){
      del_images.push(img_id);
    }
    images_list.splice(keys, 1);
    that.setData({images_list: images_list,del_images:del_images})
    
  },
  submitForImages:function(e){
    var that = this;
    var images_list = that.data.images_list;
    var file_path = '';
    var space  = '';
    for(let i in images_list){
      file_path+=space + images_list[i].oss_file_path;
      space  = ',';
    }
    var json_images_list = JSON.stringify(images_list)
    console.log(json_images_list);
    var del_images = that.data.del_images;
    var file_ids = '';
    var space  = '';
    for(let i in del_images){
      file_ids +=space+del_images[i];
      space  = ',';
    }
    utils.PostRequest(api_v_url + '/file/addFile', {
      openid:openid,
      box_mac:box_mac,
      type:scene_type,
      file_path:file_path,
      file_ids:file_ids,
      file_info:json_images_list
    }, (data, headers, cookies, errMsg, statusCode) =>{
      app.showToast('保存成功',2000,'success');
      app.sleep(1000)
      wx.navigateBack({
        delta: 1,
      })
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