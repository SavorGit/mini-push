// pages/forscreen/forfile/h5files_result.js
const util = require('../../../utils/util.js')
var mta = require('../../../utils/mta_analysis.js')
const app = getApp()
var api_url = app.globalData.api_url;
var api_v_url = app.globalData.api_v_url;
var openid;
var box_mac;
var is_open_simple;
var policy;
var signature;
var oss_bucket = app.globalData.oss_bucket;
var oss_access_key_id = app.globalData.oss_access_key_id;
var oss_upload_url = app.globalData.oss_upload_url;
var mobile_brand = app.globalData.mobile_brand;
var mobile_model = app.globalData.mobile_model;
var pos_id = 0;   //当前播放的文件图片索引
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: getApp().globalData.statusBarHeight,
    hiddens: true,
    pos_id: pos_id,
    file_imgs: [],
    forscreen_id: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.globalData.fromPage = "/pages/forscreen/forfile/h5files_result";
    console.log(options);
    var that = this;
    var pa_openid  = options.openid;
    var pa_box_mac = options.box_mac;
    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    console.log('1111');
    if(openid !=pa_openid){
      wx.showToast({
        title: '用户效验失败',
        icon: 'none',
        duration: 2000,
        success: function (res) {
          setTimeout(function () {
            wx.navigateBack()
          }, 2000)
        },
      })
    }else {
      box_mac = options.box_mac;
      is_open_simple = options.is_open_simple;
      that.setData({
        openid: openid,
        box_mac: box_mac,
        is_open_simple: is_open_simple,
        hiddens: false,
      })

      var oss_file_path = options.oss_addr;
      var file_name     = options.file_name;
      var file_size     = options.file_size;
      var res_sup_time  = options.res_sup_time;
      var res_eup_time  = options.res_eup_time;
      var save_type     = options.save_type;
      var is_fresh      = options.is_fresh;
      console.log('222');
      if (is_fresh==1){
        wx.request({
          url: api_url + '/smallapp3/index/getConfig',
          headers: {
            'Content-Type': 'application/json'
          },
          success: function (rst) {
            var file_max_size = rst.data.result.file_max_size;
            var polling_time = rst.data.result.polling_time;
            if (file_size >= file_max_size) {//如果文件超过最大配置大小 不可投屏
              
              var show_max_file_size = file_max_size / (1024 * 1024)
              
              wx.showToast({
                title: '投屏文件不可以超过' + show_max_file_size + 'M',
                icon: 'none',
                duration: 2000,
                success: function (res) {
                  setTimeout(function () {
                    wx.navigateBack()
                  }, 2000)
                },
              })
              
            } else {
              
            
              dealFile(oss_file_path, file_name, file_size, polling_time, res_sup_time, res_eup_time, save_type, that);
            }
          }
        })
      }else if(is_fresh==2){//投屏历史
        console.log('aaaa');
        var forscreen_id = options.forscreen_id;
        wx.request({
          url: api_v_url +'/Fileforscreen/getforscreenbyid',
          data:{
            forscreen_id: forscreen_id,
          },
          success:function(res){
            if(res.data.code==10000){
              console.log(res);
              that.setData({
                file_imgs: res.data.result.imgs,
                img_nums: res.data.result.img_num,
                oss_host: res.data.result.oss_host,
                oss_suffix: res.data.result.oss_suffix,
                forscreen_id: forscreen_id,
                hiddens: true,
              })
              forscreenFirstPic(res.data.result.imgs, forscreen_id)
            }else {
              that.setData({
                hiddens:true,
              })
              wx.showToast({
                title: '投屏失败',
                icon: 'none',
                duration: 2000,
                success: function (res) {
                  setTimeout(function () {
                    wx.navigateBack()
                  }, 2000)
                },
              })
            }
          },fail:function(res){
            that.setData({
              hiddens: true,
            })
            wx.navigateBack({
              delta: 1
            })
            wx.showToast({
              title: '投屏失败',
              icon: 'none',
              duration: 2000,
              success: function (res) {
                setTimeout(function () {
                  wx.navigateBack()
                }, 2000)
              },
            })
          }
        })
      }
    }
    function dealFile(oss_file_path, file_name, file_size, polling_time, res_sup_time, res_eup_time, save_type, that) {
      console.log(polling_time);
      console.log(that);
      var index1 = file_name.lastIndexOf(".");
      file_name = file_name.substring(0, index1);
      //首先调用文件处理接口  if 如果返回文件处理完成则结束  else 轮询调用获取文件处理的图片接口
      wx.request({
        url: api_v_url + '/Fileforscreen/fileconversion',   //调用文件处理接口
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          action: 30,
          box_mac: box_mac,
          mobile_brand: mobile_brand,
          mobile_model: mobile_model,
          openid: openid,
          oss_addr: oss_file_path,
          res_sup_time: res_sup_time,
          res_eup_time: res_eup_time,
          resource_name: file_name,
          resource_size: file_size,
          resource_type: 3,
          save_type: save_type
        },
        success: function (res) {
          console.log(res);
          if (res.data.code == 10000) {
            var task_id = res.data.result.task_id;
            var file_status = res.data.result.status;
            var forscreen_id = res.data.result.forscreen_id;


            if (file_status == 2) {//转换成功
              that.setData({
                file_imgs: res.data.result.imgs,
                img_nums: res.data.result.img_num,
                oss_host: res.data.result.oss_host,
                oss_suffix: res.data.result.oss_suffix,
                forscreen_id: forscreen_id,
                hiddens: true,
              })
              forscreenFirstPic(res.data.result.imgs, forscreen_id);
            } else if (file_status == 1) {  //转换中
              console.log('转换中');
              var timer8_0 = setInterval(function () {
                polling_time -= 1;
                console.log(polling_time);
                wx.request({
                  url: api_v_url + '/Fileforscreen/getresult',  //轮询获取文件处理结果接口
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  data: {
                    task_id: task_id,
                    forscreen_id: forscreen_id,
                  },
                  success: function (res) {
                    console.log(res);
                    if (res.data.code == 10000) {
                      if (res.data.result.status == 2) {//文件转换成功
                        that.setData({
                          file_imgs: res.data.result.imgs,
                          img_num: res.data.result.img_num,
                          oss_host: res.data.result.oss_host,
                          oss_suffix: res.data.result.oss_suffix,
                          forscreen_id: forscreen_id,
                          hiddens: true,
                        })
                        clearInterval(timer8_0);
                        console.log('转换成功')
                        forscreenFirstPic(res.data.result.imgs, forscreen_id);
                      } else if (res.data.result.status == 3 || res.data.result.status == 0) {//文件转换异常或者失败 提示投屏失败
                        that.setData({
                          hiddens: true,
                        })
                        clearInterval(timer8_0);
                        wx.showToast({
                          title: '投屏失败',
                          icon: 'none',
                          duration: 2000,
                          success: function (res) {
                            setTimeout(function () {
                              wx.navigateBack()
                            }, 2000)
                          },
                        })
                      }
                    }
                  }
                })
                if (polling_time == 0) {//超时 提示投屏失败
                  clearInterval(timer8_0);
                  wx.showToast({
                    title: '文件页码过多，投屏失败',
                    icon: 'none',
                    duration: 2000,
                    success: function (res) {
                      setTimeout(function () {
                        wx.navigateBack()
                      }, 2000)
                    },
                  })
                }
              }, 1000);
            } else if (file_status == 0 || file_status == 3) {//转换失败
              that.setData({
                hiddens: true,
              })
              wx.showToast({
                title: '投屏失败',
                icon: 'none',
                duration: 2000,
                success: function (res) {
                  setTimeout(function () {
                    wx.navigateBack()
                  }, 2000)
                },
              })
            }

          } else {//转换接口请求失败
            that.setData({
              hiddens: true,
            })
            wx.showToast({
              title: '投屏失败',
              icon: 'none',
              duration: 2000,
              success: function (res) {
                setTimeout(function () {
                  wx.navigateBack()
                }, 2000)
              },
            })

          }
        },
        fail: function (res) {
          that.setData({
            hiddens: true,
          })
          wx.showToast({
            title: '投屏失败',
            icon: 'none',
            duration: 2000,
            success: function (res) {
              setTimeout(function () {
                wx.navigateBack()
              }, 2000)
            },
          })
        }
      })
    }
    /**
     * @desc  文件转换成功 投屏第一张图片
     */
    function forscreenFirstPic(file_imgs, forscreen_id) {

      var forscreen_img = file_imgs[0];
      var file_arr = forscreen_img.split('/');
      var file_length = file_arr.length - 1;
      var filename = file_arr[file_length - 2] + '_' + file_arr[file_length - 1] + '_' + file_arr[file_length];
      var user_info = wx.getStorageSync("savor_user_info");
      var avatarUrl = user_info.avatarUrl;
      var nickName = user_info.nickName;

      var timestamp = (new Date()).valueOf();
      //单张图片投屏
      wx.request({
        url: api_url + '/Netty/Index/pushnetty',
        headers: {
          'Content-Type': 'application/json'
        },
        method: "POST",
        data: {
          box_mac: box_mac,
          msg: '{ "action": 7,"resource_type":1, "url": "' + forscreen_img + '", "filename":"' + filename + '","openid":"' + openid + '","avatarUrl":"' + avatarUrl + '","nickName":"' + nickName + '","forscreen_id":"' + forscreen_id + '","resource_id":"'+timestamp+'","serial_number":"'+app.globalData.serial_number+'"}',
        },
        success: function (result) {
          wx.request({
            url: api_v_url + '/index/recordForScreenPics',
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
              imgs: '["' + forscreen_img + '"]',
              resource_id:timestamp,
              serial_number:app.globalData.serial_number
            },
          });
        },
      })
    }
  },//onload结束
  /**
   * @desc  上一张  下一张
   */
  changePic: util.throttle(function (e) {
    console.log(e);
    var that = this;

    var user_info = wx.getStorageSync("savor_user_info");
    var avatarUrl = user_info.avatarUrl;
    var nickName = user_info.nickName;
    var file_imgs = e.currentTarget.dataset.file_imgs;
    var pic_count = file_imgs.length;          //当前图片总张数
    pic_count -= 1;
    pos_id = e.currentTarget.dataset.pos_id;            //当前投屏图片索引
    var action = e.currentTarget.dataset.action;             //图片切换方式1：上一张 2：下一张


    var forscreen_id = e.currentTarget.dataset.forscreen_id;    //投屏唯一标识

    if (pos_id == 0 && action == 1) {
      wx.showToast({
        title: '已经是第一张',
        icon: 'none',
        duration: 2000
      });
    } else if (pos_id == pic_count && action == 2) {
      wx.showToast({
        title: '已经是最后一张',
        icon: 'none',
        duration: 2000
      });
    } else {
      if (action == 1) {
        if (pos_id > 0) {
          pos_id -= 1;
        } else {
          pos_id = 0;
        }
      } else if (action == 2) {
        if (pos_id < pic_count) {
          pos_id += 1;
        } else {
          pos_id = pic_count;
        }
      }

      for (var i = 0; i < file_imgs.length; i++) {
        if (i == pos_id) {
          var forscreen_img = file_imgs[i];
          var file_arr = forscreen_img.split('/');
          var file_length = file_arr.length - 1;
          var filename = file_arr[file_length - 2] + '_' + file_arr[file_length - 1] + '_' + file_arr[file_length];
          break;
        }
      }
      var target = 'list' + pos_id;
      console.log(pos_id);
      that.setData({
        pos_id: pos_id,
        toView: target
      })


      var timestamp = (new Date()).valueOf();
      //单张图片投屏
      wx.request({
        url: api_url + '/Netty/Index/pushnetty',
        headers: {
          'Content-Type': 'application/json'
        },
        method: "POST",
        data: {
          box_mac: box_mac,
          msg: '{ "action": 7,"resource_type":1, "url": "' + forscreen_img + '", "filename":"' + filename + '","openid":"' + openid + '","avatarUrl":"' + avatarUrl + '","nickName":"' + nickName + '","forscreen_id":"' + forscreen_id + '","resource_id":"'+timestamp+'","serial_number":"'+app.globalData.serial_number+'"}',
        },
        success: function (result) {
          wx.request({
            url: api_v_url + '/index/recordForScreenPics',
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
              imgs: '["' + forscreen_img + '"]',
              resource_id:timestamp,
              serial_number:app.globalData.serial_number
            },
          });
        },
      })
    }



  }, 500),//呼大码结束,
  /**
   * @desc 指定单张图片投屏
   */
  appointPic: function (e) {
    console.log(e);
    var that = this;
    pos_id = e.currentTarget.dataset.pos_id;  //指定图片的索引
    that.setData({
      pos_id: pos_id,
    })
    var forscreen_img = e.currentTarget.dataset.forscreen_img;  //图片的oss地址
    var filename = e.currentTarget.dataset.filename;            //文件名称
    var forscreen_id = e.currentTarget.dataset.forscreen_id;    //投屏唯一标识
    var user_info = wx.getStorageSync("savor_user_info");
    var avatarUrl = user_info.avatarUrl;
    var nickName = user_info.nickName;
    var file_arr = forscreen_img.split('/');
    var file_length = file_arr.length - 1;
    var filename = file_arr[file_length - 2] + '_' + file_arr[file_length - 1] + '_' + file_arr[file_length];
    
    var timestamp = (new Date()).valueOf();
    //单张图片投屏
    wx.request({
      url: api_url + '/Netty/Index/pushnetty',
      headers: {
        'Content-Type': 'application/json'
      },
      method: "POST",
      data: {
        box_mac: box_mac,
        msg: '{ "action": 7,"resource_type":1, "url": "' + forscreen_img + '", "filename":"' + filename + '","openid":"' + openid + '","avatarUrl":"' + avatarUrl + '","nickName":"' + nickName + '","forscreen_id":"' + forscreen_id + '","resource_id":"'+timestamp+'","serial_number":"'+app.globalData.serial_number+'"}',
      },
      success: function (result) {
        wx.request({
          url: api_v_url + '/index/recordForScreenPics',
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
            imgs: '["' + forscreen_img + '"]',
            resource_id:timestamp,
            serial_number:app.globalData.serial_number
          },
        });
      },
    })
  },
  //重选文件
  reChooseFile: function (e) {
    var that = this;
    wx.navigateBack({
      delta:1
    })
   
  },
  //退出投屏
  exitForscreend(e) {
    var that = this;
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
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
      success: function (res) {
        wx.navigateBack({
          delta: 1,
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
  //遥控呼大码
  callQrCode: util.throttle(function (e) {
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var qrcode_img = e.currentTarget.dataset.qrcode_img;
    app.controlCallQrcode(openid, box_mac, qrcode_img);
  }, 3000),//呼大码结束
  //打开遥控器
  openControl: function (e) {
    var that = this;
    var qrcode_url = api_url + '/Smallapp4/index/getBoxQr?box_mac=' + box_mac + '&type=3';
    that.setData({
      showControl: true,
      qrcode_img: qrcode_url
    })
    mta.Event.stat('openControl', { 'linktype': app.globalData.link_type })
  },
  //关闭遥控
  closeControl: function (e) {
    var that = this;
    that.setData({
      showControl: false,
    })
    mta.Event.stat("closecontrol", {})
  },
  //遥控退出投屏
  exitForscreen: function (e) {
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    app.controlExitForscreen(openid, box_mac);
  },
  //遥控调整音量
  changeVolume: function (e) {
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var change_type = e.currentTarget.dataset.change_type;
    app.controlChangeVolume(openid,box_mac, change_type);

  },
  //遥控切换节目
  changeProgram: function (e) {
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.box_mac;
    var change_type = e.currentTarget.dataset.change_type;
    app.controlChangeProgram(openid,box_mac, change_type);
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