const WXAPI = require('apifm-wxapi')
Page({

  /**
   * 页面的初始数据
   */
  data: {
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(e) {
    // 读取分享链接中的邀请人编号
    if (e && e.inviter_id) {
      wx.setStorageSync('referrer', e.inviter_id)
    }
    // 弹出编辑昵称头像框
    getApp().initNickAvatarUrlPOP(this)
  },
  onShow() {
  },
  chooseInvoiceTitle(){
    wx.chooseInvoiceTitle({
      success: (res) => {
        this.setData({
          wxInvoiceInfo: res
        })
      },
      fail: err => {
        console.error(err);
        wx.showToast({
          title: '读取失败',
          icon: 'none'
        })
      }
    })
  },
  onShareAppMessage() {    
    return {
      title: '申请开票',
      path: '/pages/invoice/apply?inviter_id=' + wx.getStorageSync('uid'),
      imageUrl: wx.getStorageSync('invoice_share_pic')
    }
  },
  onShareTimeline() {
    return {
      title: '申请开票',
      query: 'inviter_id=' + wx.getStorageSync('uid'),
      imageUrl: wx.getStorageSync('invoice_share_pic')
    }
  },
  async bindSave(e) {
    const invoice_subscribe_ids = wx.getStorageSync('invoice_subscribe_ids')
    if (invoice_subscribe_ids) {
      wx.requestSubscribeMessage({
        tmplIds: invoice_subscribe_ids.split(','),
        success(res) {
          console.log(res)
        },
        fail(err) {
          console.error(err)
        },
        complete: (res) => {
          this._bindSave(e)
        },
      })
    } else {
      this._bindSave(e)
    }
  },
  async _bindSave(e) {
    // 提交保存
    let comName = e.detail.value.comName;
    let tfn = e.detail.value.tfn;
    let mobile = e.detail.value.mobile;
    let amount = e.detail.value.amount;
    let consumption = e.detail.value.consumption;
    let remark = e.detail.value.remark;
    let email = e.detail.value.email
    let address = e.detail.value.address;
    let bank = e.detail.value.bank;
    if (!mobile) {
      wx.showToast({
        title: '请填写您在工厂注册的手机号码',
        icon: 'none'
      })
      return
    }
    if (!comName) {
      wx.showToast({
        title: '公司名称不能为空',
        icon: 'none'
      })
      return
    }
    if (!tfn) {
      wx.showToast({
        title: '税号不能为空',
        icon: 'none'
      })
      return
    }
    if (!consumption) {
      wx.showToast({
        title: '发票内容不能为空',
        icon: 'none'
      })
      return
    }
    if (!email) {
      wx.showToast({
        title: '请填写邮箱地址',
        icon: 'none'
      })
      return
    }
    if (!amount || amount*1 < 100) {
      wx.showToast({
        title: '开票金额不能低于100',
        icon: 'none'
      })
      return
    }
    const extJsonStr = {}
    extJsonStr['api工厂账号'] = mobile
    extJsonStr['地址与电话'] = address
    extJsonStr['开户行与账号'] = bank
    WXAPI.invoiceApply({
      token: wx.getStorageSync('token'),
      comName,
      tfn,
      amount,
      consumption,
      remark,
      email,
      extJsonStr: JSON.stringify(extJsonStr)
    }).then(res => {
      if (res.code == 2000) {
        wx.navigateTo({
            url: '/pages/login/index',
        })
        return
      }
      if (res.code == 0) {
        wx.showModal({
          title: '成功',
          content: '提交成功，请耐心等待我们处理！',
          showCancel: false,
          confirmText: '我知道了',
          success(res) {
            wx.navigateTo({
              url: "/pages/invoice/list"
            })
          }
        })
      } else {
        wx.showModal({
          title: '失败',
          content: res.msg,
          showCancel: false,
          confirmText: '我知道了'
        })
      }
    })
  },
})