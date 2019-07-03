// pages/forscreen/forfile/files.js
const app = getApp()
var api_url = app.globalData.api_url;
var openid;
var box_mac;
var page = 1;
var policy;
var signature;
var oss_bucket = app.globalData.oss_bucket;
var oss_access_key_id = app.globalData.oss_access_key_id;
var oss_upload_url = app.globalData.oss_upload_url;
var mobile_brand = app.globalData.mobile_brand;
var mobile_model = app.globalData.mobile_model;
var pos_id = 1;   //当前播放的文件图片索引
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    hiddens:true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //console.log(options);
    var that = this;
    openid  = options.openid;
    box_mac = options.box_mac;
    that.setData({
      openid:openid,
      box_mac:box_mac,
    })

    wx.request({
      url: api_url + '/smallapp3/index/getConfig',
      headers: {
        'Content-Type': 'application/json'
      },
      success: function (rst) {
        var file_exts = rst.data.result.file_exts;
        var file_max_size = rst.data.result.file_max_size;
        var polling_time = rst.data.result.polling_time;
        console.log(rst);
        wx.chooseMessageFile({
          count: 1,
          type: 'file',
          extension: file_exts,
          success(res) {
            // tempFilePath可以作为img标签的src属性显示图片
            console.log(res);
            var tempFilePaths = res.tempFilePaths
            var file_path = res.tempFiles[0].path;
            var file_size = res.tempFiles[0].size;
            var file_name = res.tempFiles[0].name;
            
            if (file_size >= file_max_size) {//如果文件超过最大配置大小 不可投屏
              wx.navigateBack({
                delta: 1,
              })
            } else {//如果文件未超过设置的最大值
               wx.request({
                url: api_url + '/Smallapp/Index/getOssParams',
                headers: {
                  'Content-Type': 'application/json'
                },
                success: function (rest) {
                  policy = rest.data.policy;
                  signature = rest.data.signature;
                  uploadOssFile(policy, signature, file_path,openid,box_mac,file_name,file_size,polling_time,that);
                }
              });
            }

          }, fail: function (res) {
            wx.navigateBack({
              delta: 1,
            })
          }
        });
      }
    })

    function uploadOssFile(policy, signature, file_path, openid, box_mac, file_name, file_size, polling_time, that){
      
      var index1 = file_path.lastIndexOf(".");
      var index2 = file_path.length;
      var mobile_brand = app.globalData.mobile_brand;
      var mobile_model = app.globalData.mobile_model;
      var postf_t = file_path.substring(index1, index2);//后缀名
      var timestamp = (new Date()).valueOf();
      var oss_file_path = "forscreen/resource/" + timestamp + postf_t;
      console.log(timestamp);
      var upload_task = wx.uploadFile({
        url: oss_upload_url,
        filePath: file_path,
        name: 'file',

        formData: {
          Bucket: oss_bucket,
          name: file_path,
          key: oss_file_path,
          policy: policy,
          OSSAccessKeyId: oss_access_key_id,
          sucess_action_status: "200",
          signature: signature

        },
        success: function (res) {
          
        }
      });
      var res_eup_time = (new Date()).valueOf();
      upload_task.onProgressUpdate((res) => {

        
        if (res.progress == 100) {
          //1、记录日志接口
          //recordUploadFile(openid, box_mac,  timestamp, res_eup_time, postf_t, res.totalBytesSent);
          //2、处理文件接口
          dealFile(oss_file_path, file_name, file_size, polling_time, that) ;
        }
        
      });

    }
    function dealFile(oss_file_path, file_name, file_size, polling_time,that) {
      console.log(polling_time);
      console.log(that);
      //首先调用文件处理接口  if 如果返回文件处理完成则结束  else 轮询调用获取文件处理的图片接口
      wx.request({
        url: api_url + '/smallapp3/index/getConfig',   //调用文件处理接口？？？？？？
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          oss_file_path: oss_file_path,
          file_name: file_name,
          file_size: file_size
        }, 
        success: function (res) {
          if (res.data.code == 1000000000000) {
            that.setData({
              files:res.data.result.files,
            })
          } else {

            var timer8_0 = setInterval(function () {
              polling_time -= 1;
              console.log(polling_time);
              wx.request({
                url: api_url + '/smallapp3/index/getConfig',  //轮询获取文件处理结果接口？？？？？？
                headers: {
                  'Content-Type': 'application/json'
                },
                success:function(res){
                  clearInterval(timer8_0);
                }
              })
              if (polling_time == 0) {
                
                clearInterval(timer8_0);
              }
            }, 1000);
          }
        },
        fail:function(res){
          
          wx.navigateBack({
            delta: 1,
          });
          wx.showToast({
            title: '投屏失败',
            icon: 'none',
            duration: 2000
          });
        }
      })

    }
    
  },
  /**
   * @desc 加载更多 (分页)
   */
  loadMore:function(e){

    var that = this;
    var openid = e.target.dataset.openid;
    var forscreen_id = e.target.dataset.forscreen_id;
    page = page + 1;
    that.setData({
      hiddens: false,
    })
    wx.request({
      url: api_url + '/aa/bb/cc',       //分页接口
      header: {
        'Content-Type': 'application/json'
      },
      data:{
        page:page,
        forscreen_id:forscreen_id,
      },success:function(res){
        if(res.data.code==10000){
          that.setData({
            hiddens:true,
            file_result:res.data.result.files,
          })
        }else {
          that.setData({
            hiddens: true
          })
        }
      }
    })
  },
  /**
   * @desc  上一张  下一张
   */
  changePic:function(e){
    var that = this;
    var pic_count = e.target.dataset.pic_count;          //当前图片总张数
    pos_id        = e.target.dataset.pos_id;             //当前投屏图片索引
    var action    = e.target.dataset.action;             //图片切换方式1：上一张 2：下一张
    var forscreen_img = e.target.dataset.forscreen_img;  //图片的oss地址
    var filename  = e.target.dataset.filename;           //文件名称
    var forscreen_id = (new Date()).valueOf();           //投屏唯一标识
    if(action==1){
      if(pos_id>1){
        pos_id -=1;
      }else {
        pos_id = 1;
      }
    }else if(action==2){
      if(pos_id<pic_count){
        pos_id +=1;
      }else {
        pos_id = pic_count;
      }
    }
    that.setData({
      pos_id:pos_id
    })
    //单张图片投屏
    wx.request({
      url: api_url + '/Netty/Index/index',
      headers: {
        'Content-Type': 'application/json'
      },
      method: "POST",
      data: {
        box_mac: box_mac,
        msg: '{ "action": 7,"resource_type":1, "url": "' + forscreen_img + '", "filename":"' + filename + '","openid":"' + openid + '","avatarUrl":"' + avatarUrl + '","nickName":"' + nickName + '","forscreen_id":"' + forscreen_id + '"}',
      },
      success: function (result) {
        wx.request({
          url: api_url + '/Smallapp21/index/recordForScreenPics',
          header: {
            'content-type': 'application/json'
          },
          data: {
            forscreen_id: forscreen_id,
            openid: openid,
            box_mac: box_mac,
            action: 31,
            resource_type: 1,
            mobile_brand: mobile_brand,
            mobile_model: mobile_model,
            imgs: '["' + forscreen_img + '"]'
          },
        });
      },
    })
  },
  /**
   * @desc 指定单张图片投屏
   */
  appointPic:function(e){
    var that = this;
    pos_id = e.target.dataset.pos_id;  //指定图片的索引
    that.setData({
      pos_id:pos_id,
    })
    var forscreen_img = e.target.dataset.forscreen_img;  //图片的oss地址
    var filename = e.target.dataset.filename;           //文件名称
    var forscreen_id = (new Date()).valueOf();           //投屏唯一标识
    //单张图片投屏
    wx.request({
      url: api_url + '/Netty/Index/index',
      headers: {
        'Content-Type': 'application/json'
      },
      method: "POST",
      data: {
        box_mac: box_mac,
        msg: '{ "action": 7,"resource_type":1, "url": "' + forscreen_img + '", "filename":"' + filename + '","openid":"' + openid + '","avatarUrl":"' + avatarUrl + '","nickName":"' + nickName + '","forscreen_id":"' + forscreen_id + '"}',
      },
      success: function (result) {
        wx.request({
          url: api_url + '/Smallapp21/index/recordForScreenPics',
          header: {
            'content-type': 'application/json'
          },
          data: {
            forscreen_id: forscreen_id,
            openid: openid,
            box_mac: box_mac,
            action: 31,
            resource_type: 1,
            mobile_brand: mobile_brand,
            mobile_model: mobile_model,
            imgs: '["' + forscreen_img + '"]'
          },
        });
      },
    })
  },
  //重选文件
  reChooseFile:function(e){
    wx.request({
      url: api_url + '/smallapp3/index/getConfig',
      headers: {
        'Content-Type': 'application/json'
      },
      success: function (rst) {
        var file_exts = rst.data.result.file_exts;
        var file_max_size = rst.data.result.file_max_size;
        var polling_time = rst.data.result.polling_time;
        console.log(rst);
        wx.chooseMessageFile({
          count: 1,
          type: 'file',
          extension: file_exts,
          success(res) {
            // tempFilePath可以作为img标签的src属性显示图片
            console.log(res);
            var tempFilePaths = res.tempFilePaths
            var file_path = res.tempFiles[0].path;
            var file_size = res.tempFiles[0].size;
            var file_name = res.tempFiles[0].name;

            if (file_size >= file_max_size) {//如果文件超过最大配置大小 不可投屏
              wx.navigateBack({
                delta: 1,
              })
            } else {//如果文件未超过设置的最大值
              wx.request({
                url: api_url + '/Smallapp/Index/getOssParams',
                headers: {
                  'Content-Type': 'application/json'
                },
                success: function (rest) {
                  policy = rest.data.policy;
                  signature = rest.data.signature;
                  uploadOssFile(policy, signature, file_path, openid, box_mac, file_name, file_size, polling_time, that);
                }
              });
            }

          }, fail: function (res) {
            wx.navigateBack({
              delta: 1,
            })
          }
        });
      }
    })

    function uploadOssFile(policy, signature, file_path, openid, box_mac, file_name, file_size, polling_time, that) {

      var index1 = file_path.lastIndexOf(".");
      var index2 = file_path.length;
      var mobile_brand = app.globalData.mobile_brand;
      var mobile_model = app.globalData.mobile_model;
      var postf_t = file_path.substring(index1, index2);//后缀名
      var timestamp = (new Date()).valueOf();
      var oss_file_path = "forscreen/resource/" + timestamp + postf_t;
      console.log(timestamp);
      var upload_task = wx.uploadFile({
        url: oss_upload_url,
        filePath: file_path,
        name: 'file',

        formData: {
          Bucket: oss_bucket,
          name: file_path,
          key: oss_file_path,
          policy: policy,
          OSSAccessKeyId: oss_access_key_id,
          sucess_action_status: "200",
          signature: signature

        },
        success: function (res) {

        }
      });
      var res_eup_time = (new Date()).valueOf();
      upload_task.onProgressUpdate((res) => {


        if (res.progress == 100) {
          //1、记录日志接口
          //recordUploadFile(openid, box_mac,  timestamp, res_eup_time, postf_t, res.totalBytesSent);
          //2、处理文件接口
          dealFile(oss_file_path, file_name, file_size, polling_time, that);
        }

      });

    }
    function dealFile(oss_file_path, file_name, file_size, polling_time, that) {
      console.log(polling_time);
      console.log(that);
      //首先调用文件处理接口  if 如果返回文件处理完成则结束  else 轮询调用获取文件处理的图片接口
      wx.request({
        url: api_url + '/smallapp3/index/getConfig',   //调用文件处理接口？？？？？？
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          oss_file_path: oss_file_path,
          file_name: file_name,
          file_size: file_size
        },
        success: function (res) {
          if (res.data.code == 1000000000000) {
            that.setData({
              files: res.data.result.files,
            })
          } else {

            var timer8_0 = setInterval(function () {
              polling_time -= 1;
              console.log(polling_time);
              wx.request({
                url: api_url + '/smallapp3/index/getConfig',  //轮询获取文件处理结果接口？？？？？？
                headers: {
                  'Content-Type': 'application/json'
                },
                success: function (res) {
                  clearInterval(timer8_0);
                }
              })
              if (polling_time == 0) {

                clearInterval(timer8_0);
              }
            }, 1000);
          }
        },
        fail: function (res) {

          wx.navigateBack({
            delta: 1,
          });
          wx.showToast({
            title: '投屏失败',
            icon: 'none',
            duration: 2000
          });
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