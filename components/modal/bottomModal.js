// components/modal/bottomModal.js

/**
 * 自定义modal浮层
 * 使用方法：
 *   
<bottomModal show="{{showModal}}" width="98%" height='60%' background-color='#ffffff' border-radius="0rpx" title-text='Title' title-color="#f6f3ee" confirm-text='确定' confirm-color="#f6f3ee" cancel-text='取消' cancel-color='rgba(7,17,27,0.6)' bindclickMask='modalClickMask' bindcancel="modalCancel" bindconfirm='modalConfirm'>
  <view>你自己需要展示的内容</view>
</bottomModal>
 
属性说明：
 show：            控制modal显示与隐藏
 backgroundColor:  modal的背景色
 width：           modal的宽度
 height：          modal的高度
 borderRadius：    modal的圆角
 titleText：       modal的标题
 titleColor：      modal的标题颜色
 confirmText：     modal的确定按钮文本
 confirmColor：    modal的确定按钮文本颜色
 cancelText：      modal的取消按钮文本
 cancelColor：     modal的取消按钮文本颜色

事件说明：
 bindclickMask: 点击遮盖层的回调函数
 bindcancel：   点击取消按钮的回调函数
 bindconfirm：  点击确定按钮的回调函数
 

 
使用模块：
 场馆 -> 发布 -> 选择使用物品
 */
Component({

  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },

  /**
   * 组件的属性列表
   */
  properties: {
    //是否显示modal
    show: {
      type: Boolean,
      value: false
    },
    //modal的背景色
    backgroundColor: {
      type: String,
      value: '#FFFFFF'
    },
    //modal的宽度
    width: {
      type: String,
      value: '80vw'
    },
    //modal的高度
    height: {
      type: String,
      value: '60vh'
    },
    //modal的高度
    borderRadius: {
      type: String,
      value: '10rpx'
    },
    titleText: {
      type: String,
      value: '提示'
    },
    titleColor: {
      type: String,
      value: '#333333'
    },
    confirmText: {
      type: String,
      value: '确定'
    },
    confirmColor: {
      type: String,
      value: '#333333'
    },
    cancelText: {
      type: String,
      value: '取消'
    },
    cancelColor: {
      type: String,
      value: 'rgba(237,230,222,0.9)'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    show: false
  },

  /**
   * 组件生命周期函数，在组件实例进入页面节点树时执行
   */
  attached: function() {
    this.setData({
      show: false
    })
  },

  /**
   * 组件生命周期函数，在组件布局完成后执行，此时可以获取节点信息
   */
  ready: function() {
    // this.setData({
    //   show: false
    // })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    clickMask(e) {
      // this.setData({show: false})
    },

    cancel(e) {
      this.setData({
        show: false
      });
      this.triggerEvent('cancel', e);
    },

    confirm(e) {
      this.setData({
        show: false
      });
      this.triggerEvent('confirm', e);
    }
  }
})