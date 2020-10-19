// components/toast/message.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    //是否显示modal
    show: {
      type: Boolean,
      value: true
    },
    // 显示内容
    content: {
      type: String,
      value: ''
    },
    // 显示时长
    showSecond: {
      type: Number,
      value: 2
    },
    // 显示时间单位
    delayUnit: {
      type: String,
      value: 'S'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {

  },

  observers: {
    show: function () {
      let self = this;
      // console.log("observers.show",self.data);
      function cutTime() {
        // console.log("observers.show", "cutTime");
        let showSecond = self.data.showSecond;
        showSecond--;
        self.setData({ showSecond: showSecond }, execCutTime);
      }
      function execCutTime() {
        // console.log("observers.show","execCutTime", self.data);
        if (self.data.show === true) {
          if (self.data.showSecond > 0) {
            // console.log("observers.show", "execCutTime", "if");
            setTimeout(cutTime, 1000);
          } else {
            // console.log("observers.show", "execCutTime", "else");
            self.setData({ show: false });
          }
        }
      }
      execCutTime();
    }
  },

  ready: function () {
    let self = this;
    // // console.log(self.data.show);
    // function cutTime() {
    //   // console.log("cutTime");
    //   let showSecond = self.data.showSecond;
    //   showSecond--;
    //   self.setData({ showSecond: showSecond }, execCutTime);
    // }
    // function execCutTime() {
    //   // console.log("execCutTime");
    //   if (self.data.show == true && self.data.showSecond > 0) {
    //     setTimeout(cutTime, 1000);
    //   } else {
    //     self.setData({ show: false });
    //   }
    // }
    // execCutTime();
  },

})
