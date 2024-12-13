!(function () {
  const n = wx.getUpdateManager();
  App({
    onLaunch: function () {},
    onShow: function (o) {
      console.log(o),
        1154 == o.scene &&
          wx.showModal({
            title: "提示",
            content: '请点击下方"前往小程序"体验完整功能',
            showCancel: !1,
            cancelText: "知道了",
            success: () => {},
          }),
        1155 == o.scene &&
          o.query.path &&
          wx.switchTab({
            url: "pages/" + o.query.path + "/index",
          }),
        n.onCheckForUpdate(function (n) {
          console.log(n.hasUpdate);
        }),
        n.onUpdateReady(function (o) {
          wx.showModal({
            title: "更新提示",
            content: "新版本已经准备好，是否重启应用？",
            success(o) {
              o.confirm && n.applyUpdate();
            },
          });
        }),
        n.onUpdateFailed(function (n) {});
    },
    onHide: function () {},
    onError: function (n) {},
    // 广告位ID配置
    adConfig: {
      videoAd: "adunit-ad4d4340a835bd7f", // 激励频广告
      interAd: "adunit-afaa5078393bc700", // 插屏广告
      // 插屏广告配置
      interAdConfig: {
        minInterval: 30000, // 最小展示间隔，30秒
        probability: 0.4    // 展示概率，40%
      }
    },
  });
})();
