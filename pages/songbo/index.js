!(function () {
  getApp();
  var t = "",
    e = "";
  let rewardedVideoAd = null;
  const AD_INTERVAL = 5 * 60 * 1000; // 5分钟间隔
  let lastAdShowTime = 0;
  let lastInterAdShowTime = 0;
  const INTER_AD_INTERVAL = 30000;

  function canShowAd() {
    const now = Date.now();
    if (now - lastAdShowTime >= AD_INTERVAL) {
      lastAdShowTime = now;
      return true;
    }
    return false;
  }

  Page({
    data: {
      auto: !1,
      count: 0,
      audio: !0,
      customAdUnitId: getApp().adConfig.customAd
    },
    onShow: function () {
      if (
        (wx.showShareMenu({
          withShareTicket: !1,
          menus: ["shareAppMessage", "shareTimeline"],
        }),
        wx.getStorageSync("sb" + this.getCurrentDate()))
      )
        console.log(wx.getStorageSync("sb" + this.getCurrentDate())),
          this.setData({
            count: wx.getStorageSync("sb" + this.getCurrentDate()),
          });
      else
        for (let t = -1; t > -3; t--)
          wx.removeStorageSync("sb" + this.getCurrentDate(t));
      if (this.tryShowInterAd) {
        this.tryShowInterAd();
      }
    },
    resetcount: function () {
      var t = this;
      wx.showModal({
        title: "提示",
        content: "是否重置数据？",
        success: function (e) {
          e.confirm
            ? (wx.getStorageSync("sb" + t.getCurrentDate()) &&
                wx.removeStorageSync("sb" + t.getCurrentDate()),
              t.setData({
                count: 0,
              }))
            : e.cancel &&
              (console.log("用户点击取消"),
              wx.reportEvent("refresh", {
                yesno: "no",
              }));
        },
      });
    },
    openaudio: function () {
      this.setData({
        audio: !this.data.audio,
      }),
        this.data.audio || this.innerAudioContext.stop();
    },
    onLoad: function () {
      var n = this;
      getApp().adConfig.videoAd &&
        wx.createRewardedVideoAd &&
        ((e = wx.createRewardedVideoAd({
          adUnitId: getApp().adConfig.videoAd,
        })).onLoad(function () {}),
        e.onError(function (t) {
          console.error('激励视频广告加载失败：', t);
          wx.showToast({
            title: '广告加载失败，请稍后重试',
            icon: 'none',
            duration: 2000
          });
        }),
        e.onClose(function (t) {
          t && t.isEnded
            ? n.overvideo()
            : wx.showToast({
                title: "完整看完才能解锁哦~",
                icon: "none",
              });
        })),
        getApp().adConfig.interAd &&
          (wx.createInterstitialAd &&
            ((t = wx.createInterstitialAd({
              adUnitId: getApp().adConfig.interAd,
            })).onLoad(function () {}),
            t.onError(function (t) {}),
            t.onClose(function () {})),
          setTimeout(function () {
            t &&
              t.show().catch(function (t) {
                console.error(t);
              });
          }, 2e3)),
        (this.innerAudioContext = wx.createInnerAudioContext()),
        (this.innerAudioContext.src = "audio/songbo.mp3"),
        this.innerAudioContext.onPlay(function () {}),
        this.innerAudioContext.onError(function (t) {
          console.log(t.errMsg), console.log(t.errCode);
        }),
        (this.aniamtion = wx.createAnimation({
          duration: 50,
          transformOrigin: "right top",
          timingFunction: "ease-in-out",
        }));
      for (var o = 0; o < 10; o++)
        this["agd" + o] = wx.createAnimation({
          duration: 1e3,
          transformOrigin: "right top",
          timingFunction: "ease",
        });
      if (wx.createRewardedVideoAd) {
        rewardedVideoAd = wx.createRewardedVideoAd({
          adUnitId: getApp().adConfig.videoAd,
        });
        rewardedVideoAd.onLoad(() => {
          console.log("激励视频 广告加载成功");
        });
        rewardedVideoAd.onError(err => {
          console.error('激励视频广告加载失败：', err);
          wx.showToast({
            title: '广告加载失败，请稍后重试',
            icon: 'none',
            duration: 2000
          });
        });
        rewardedVideoAd.onClose((res) => {
          if (res && res.isEnded) {
            this.timer = setInterval(this.konck, 2000);
            this.setData({
              auto: true
            });
            wx.setStorageSync("my-key", this.getCurrentDate());
            wx.showToast({
              title: "解锁成功",
              icon: "success"
            });
          } else {
            wx.showToast({
              title: "需要完整观看视频才能解锁",
              icon: "none"
            });
          }
        });
      }
      if (getApp().adConfig.interAd && wx.createInterstitialAd) {
        t = wx.createInterstitialAd({
          adUnitId: getApp().adConfig.interAd
        });
        
        this.tryShowInterAd = () => {
          const now = Date.now();
          const config = getApp().adConfig.interAdConfig;
          if (now - lastInterAdShowTime >= config.minInterval && 
              Math.random() < config.probability) {
            t.show().catch((err) => {
              console.error('插屏广告展示失败：', err);
            });
            lastInterAdShowTime = now;
          }
        };
      }
    },
    overvideo: function () {
      wx.setStorageSync("my-key", this.getCurrentDate());
      this.konck();
      this.timer = setInterval(this.konck, 2000);
      this.setData({
        auto: true,
      });
    },
    onHide: function () {
      if (this.innerAudioContext) {
        this.innerAudioContext.stop();
      }
      if (this.timer) {
        clearInterval(this.timer);
      }
      this.setData({
        auto: false
      });
    },
    onUnload: function () {
      this.innerAudioContext.stop();
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      if (this.interstitialAd) {
        this.interstitialAd.show().catch((err) => {
          console.error("退出页面展示广告失败", err);
        });
      }
    },
    konck: function () {
      if (!this.innerAudioContext) {
        this.innerAudioContext = wx.createInnerAudioContext();
        this.innerAudioContext.src = "audio/songbo.mp3";
      }
      try {
        this.innerAudioContext.stop();
        if (this.data.audio) {
          this.innerAudioContext.play();
        }

        var t = "" + this.data.count;
        var e = t.substr("" + t.length - 1);
        console.log(e);

        var n = ["agd" + e];
        this["agd" + e]
          .top("51%")
          .step()
          .top("40%")
          .opacity(1)
          .step(50)
          .opacity(0)
          .step()
          .step()
          .top("51%");
        this.setData({
          [n]: this["agd" + e].export(),
        });

        this.aniamtion.rotate(25).step().rotate(-25).step();
        this.setData({
          animationData: this.aniamtion.export(),
        });

        this.setData({
          count: this.data.count + 1,
        });
        wx.setStorageSync("sb" + this.getCurrentDate(), this.data.count);

        if (this.data.count > 0 && this.data.count % 100 === 0) {
          if (this.interstitialAd) {
            this.interstitialAd.show().catch((err) => {
              console.error("功德数广告展示失败", err);
            });
          }
        }
      } catch (error) {
        console.error("自动颂钵出错：", error);
        this.timer && clearInterval(this.timer);
        this.setData({
          auto: false,
        });
      }
    },
    autoplay: function () {
      var t = this;
      if (this.data.auto) {
        this.timer && clearInterval(this.timer);
        this.setData({
          auto: false
        });
        return;
      }

      if (wx.getStorageSync("my-key") && wx.getStorageSync("my-key") == this.getCurrentDate()) {
        this.timer = setInterval(() => this.konck(), 2000);
        this.setData({
          auto: true
        });
        return;
      }

      if (rewardedVideoAd) {
        wx.showModal({
          title: "未解锁",
          content: "看一段视频，可在今天无限使用此功能",
          confirmColor: "#439057",
          success: function(n) {
            if (n.confirm) {
              rewardedVideoAd.show().catch(() => {
                rewardedVideoAd.load()
                  .then(() => rewardedVideoAd.show())
                  .catch(err => {
                    console.error('激励视频广告显示失败：', err);
                    wx.showToast({
                      title: '广告加载失败，请稍后再试',
                      icon: 'none',
                      duration: 2000
                    });
                  });
              });
            }
          }
        });
      } else {
        wx.showToast({
          title: '广告功能未初始化，请稍后再试',
          icon: 'none',
          duration: 2000
        });
      }
    },
    getCurrentDate: function (t = 0) {
      const e = new Date();
      e.setDate(e.getDate() + t);
      const n = {
        year: e.getFullYear(),
        month: e.getMonth() + 1,
        date: e.getDate(),
      };
      return (
        n.year +
        "" +
        (n.month >= 10 ? n.month : "0" + n.month) +
        (n.date >= 10 ? n.date : "0" + n.date)
      );
    },
    onShareAppMessage: function () {
      if (this.interstitialAd) {
        setTimeout(() => {
          this.interstitialAd.show().catch((err) => {
            console.error("分享后展示广告失败", err);
          });
        }, 1500);
      }

      return {
        title: wx.getStorageSync("sb" + this.getCurrentDate())
          ? "今日我已功德+" +
            wx.getStorageSync("sb" + this.getCurrentDate()) +
            "，你也一起来颂钵静心吧！"
          : "发现了一款不错的解压神器！快来试一试吧！",
        path: "pages/songbo/index",
        imageUrl: "/images/share.jpg",
      };
    },
    onShareTimeline: function () {
      return {
        title: wx.getStorageSync("sb" + this.getCurrentDate())
          ? "今日我已功德+" +
            wx.getStorageSync("sb" + this.getCurrentDate()) +
            "，你也一起来颂钵静心吧！"
          : "我发现了一款不错的解压神器！快来试一试吧！",
        imageUrl: "/images/share.jpg",
        query: {
          path: "songbo",
        },
      };
    },
    onAddToFavorites: function (t) {
      return {
        title: "静心颂钵",
        imageUrl: "/images/share.jpg",
        query: {
          path: "songbo",
        },
      };
    },
  });
})();
