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
        var img_url = res.tempFilePaths[0]
        wx.getFileSystemManager().readFile({
          filePath: res.tempFilePaths[0], //选择图片返回的相对路径
          //encoding: 'base64', //编码格式
          success: rt => { //成功的回调

            
             wx.uploadFile({
              url: "http://192.168.99.2:8080/pic?isThumbnail=1&imageId=20170301&deviceId=861322036428460&deviceName=MI5&rotation=90&imageType=1&web=true",
              filePath: img_url,
              name: 'file',
              header: {
                'Content-Type': 'image/jpg'
              },
              formData: {
                fileUpload: rt.data

              },

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
    })
  },

})