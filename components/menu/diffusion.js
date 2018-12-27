// components/menu/diffusion.js

var systemInfo = wx.getSystemInfoSync();
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },

  /**
   * 组件的属性列表
   */
  properties: {
    //按钮个数
    buttonCount: {
      type: Number,
      value: 0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    buttonCount: 7, //按钮个数
    radius: 70, // 半径
    isShow: false, //是否已经弹出
    animationArray: [], //动画
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //点击弹出或者收起
    showOrHide: function(e) {
      this.triggerEvent("beforeExec");
      if (this.data.isShow) {
        //缩回动画
        this.takeback(e);
        this.setData({
          isShow: false
        })
      } else {
        //弹出动画
        this.popMenu(e);
        this.setData({
          isShow: true
        })
      }
      this.triggerEvent("afterExec");
    },

    //弹出动画
    popMenu: function(e) {
      var elementAnimationArray = [];
      for (var index = 0; index <= this.data.buttonCount; index++) {
        var animation = wx.createAnimation({
          duration: 500,
          timingFunction: 'ease-out'
        });
        if (index > 0) {
          var x = 0,
            y = 0,
            radiusFactor,
            radian = Math.PI / 180;
          if (index <= 3) {
            radian *= (180 + 45 * (index - 1));
            radiusFactor = 1
          } else if (index <= 7) {
            radian *= (180 + 30 * (index - 4));
            radiusFactor = 1.7;
          }
          x = Math.cos(radian) * this.data.radius * radiusFactor;
          y = Math.sin(radian) * this.data.radius * radiusFactor;

          animation.translate(x, y);
        }
        animation.rotateZ(405);
        if (index > 0) {
          animation.opacity(1);
        }
        animation.step();
        elementAnimationArray[index] = animation.export();
      }
      this.setData({
        animationArray: elementAnimationArray
      });
    },
    //收回动画
    takeback: function() {
      var elementAnimationArray = [];
      for (var index = 0; index <= this.data.buttonCount; index++) {
        var animation = wx.createAnimation({
          duration: 500,
          timingFunction: 'ease-out'
        });
        if (index > 0) {
          animation.translate(0, 0);
        }
        animation.rotateZ(0);
        if (index > 0) {
          animation.opacity(0);
        }
        animation.step();
        elementAnimationArray[index] = animation.export();
      }
      this.setData({
        animationArray: elementAnimationArray
      });
    }
  },
  //解决滚动穿透问题
  myCatchTouch: function() {
    return
  }
})