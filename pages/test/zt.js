const app = getApp()


Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },

  onLoad: function () {
    
    wx.chooseImage({
      count: 6, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        var img_len = res.tempFilePaths.length;
        var forscreen_id = (new Date()).valueOf();
        for (var i = 0; i < img_len; i++) {
          var img_url = res.tempFilePaths[i]
          wx.uploadFile({
            url: "http://192.168.99.2:8080/picH5?isThumbnail=1&imageId=20170301&deviceId=861322036428460&deviceName=MI5&rotation=90&imageType=1&web=true&forscreen_id=" + forscreen_id,
            filePath: img_url,
            name: 'fileUpload',
            //fileUpload: rt.data,
            // formData: {


            // },

            success: function (res) {
              console.log(res)
            },
            complete: function (es) {
              console.log(es)
            },
            fial: function ({ errMsg }) {
              console.log('uploadImage fial,errMsg is', errMsg)
            },
          });
        }

        

        /**/


      }
    })

    /*wx.startWifi({
      success:function(){
        wx.connectWifi({
          SSID: 'littlehotspot_bichao',
          BSSID: 'F6-28-53-09-33-94',
          password: '',
          success: function (res) {
            console.log('wifi连接成功');
            //_this.setData({ endError: 'wifi连接成功' });
          },
          fail: function (res) {
            console.log(res.errMsg);
            //_this.setData({ endError: res.errMsg });
          }
        })
      }
    })*/
    
    
    /*wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success: function (res) {
        //console.log(res)
        var video_url = res.tempFilePath;
        wx.getFileSystemManager().readFile({
          filePath: video_url, //选择图片返回的相对路径
          encoding: 'binary', //编码格式
          success: rt => { //成功的回调
            wx.uploadFile({
              url: 'http://192.168.99.2:8080/videoH5?deviceId=861322036428460&deviceName=MI5&web=true',
              filePath: video_url,
              name: 'fileName',
              success: function (res) {
                console.log(res)
              },
              complete: function (es) {
                console.log(es)
              },
              fial: function ({ errMsg }) {
                console.log('uploadImage fial,errMsg is', errMsg)
              },
            })
          }
        })
        
      }  
    })*/
    


    /*wx.chooseImage({
      count: 6, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        var img_url = res.tempFilePaths[0]
        
        wx.getFileSystemManager().readFile({
          filePath: res.tempFilePaths[0], //选择图片返回的相对路径
          encoding: 'binary', //编码格式
          success: rt => { //成功的回调

            console.log(rt);
             wx.uploadFile({
              url: "http://192.168.99.2:8080/pic?isThumbnail=1&imageId=20170301&deviceId=861322036428460&deviceName=MI5&rotation=90&imageType=1&web=true",
              filePath: img_url,
               name: 'fileUpload',
              //fileUpload: rt.data,
              // formData: {
                

              // },

              success: function (res) {
                console.log(res)
              },
              complete: function (es) {
                console.log(es)
              },
              fial: function ({ errMsg }) {
                console.log('uploadImage fial,errMsg is', errMsg)
              },
            });
          }
        })
        
        
      }
    })*/
  },

})