var t = "";
var e = "";

Page({
    data: {
      beads: [{}, {}, {}, {}, {}, {}, {}, {}, {}],
      i: 1,
      current: 0,
      firstIndex: 0,
      lastIndex: 6,
      playing: !0,
      score: 0,
      scoreAnimateData: null,
      score_animated: !1,
      htuserInfo: {},
      audio: !0,
      bannerAdUnitId: getApp().adConfig.beadsBannerAd,
    },
    audioContext: null,
    scoreAnimation: null,
    onLoad: function (a) {
      var n = this;
      // 初始化激励视频广告
      getApp().adConfig.videoAd &&
          wx.createRewardedVideoAd &&
          ((e = wx.createRewardedVideoAd({
            adUnitId: getApp().adConfig.videoAd,
          })).onLoad(function () {}),
          e.onError(function (t) {
            console.error("激励视频广告加载失败：", t);
          }),
          e.onClose((t) => {
            if (t && t.isEnded) {
              wx.setStorageSync("fz-key", n.getCurrentDate());
              if (n.data.i < 5) {
                var nextIndex = n.data.i + 1;
                n.setData({
                  i: nextIndex,
                  beadimg: "../../res/" + nextIndex + ".png"
                });
                wx.setStorage({
                  key: "i",
                  data: nextIndex
                });
              } else {
                n.setData({
                  i: 1,
                  beadimg: "../../res/1.png"
                });
                wx.setStorage({
                  key: "i",
                  data: 1
                });
              }
              wx.showToast({
                title: "解锁成功",
                icon: "success"
              });
            } else {
              wx.showToast({
                title: "完整看完才能解锁哦~",
                icon: "none"
              });
            }
          }));

      // 初始化插屏广告
      let lastInterAdShowTime = 0;
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

      // 初始化其他配置
      var o = wx.getStorageSync("i");
      if (o) {
        this.setData({
          beadimg: "../../res/" + o + ".png",
        });
      } else {
        this.setData({
          beadimg: "../../res/" + this.data.i + ".png",
        });
      }
      (this.innerAudioContext = wx.createInnerAudioContext({
        useWebAudioImplement: !0,
      })),
        (this.innerAudioContext.src = "res/sound.mp3");
      for (var o = 0; o < 10; o++)
        this["agd" + o] = wx.createAnimation({
          duration: 250,
          transformOrigin: "right top",
          timingFunction: "ease-out",
        });
      this.initAudioContext();
    },
    onShow: function () {
      if (
        (wx.showShareMenu({
          withShareTicket: !1,
          menus: ["shareAppMessage", "shareTimeline"],
        }),
        wx.getStorageSync("fz" + this.getCurrentDate()))
      )
        console.log(wx.getStorageSync("fz" + this.getCurrentDate())),
          this.setData({
            score: wx.getStorageSync("fz" + this.getCurrentDate()),
          });
      else
        for (let t = -1; t > -3; t--)
          wx.removeStorageSync("fz" + this.getCurrentDate(t));
      if (this.tryShowInterAd) {
        this.tryShowInterAd();
      }
    },
    play: function () {
      if (!this.innerAudioContext) {
        this.initAudioContext();
      }
      try {
        if (this.innerAudioContext.pause) {
          this.innerAudioContext.play();
          this.setData({ playing: !0 });
        } else {
          this.innerAudioContext.stop();
          this.setData({ playing: !1 });
        }
      } catch (err) {
        console.error("音频播放失败：", err);
        this.initAudioContext();
      }
    },
    openaudio: function () {
      this.setData({
        audio: !this.data.audio,
      });
    },
    refreshClick: function (t) {
      var e = this;
      wx.showModal({
        title: "提示",
        content: "是否重置数据？",
        success: function (t) {
          t.confirm
            ? (console.log("用户点击确定"),
              wx.reportEvent("refresh", {
                yesno: "yes",
              }),
              e.setData({
                score: 0,
              }),
              wx.getStorageSync("fz" + e.getCurrentDate()) &&
                wx.removeStorageSync("fz" + e.getCurrentDate()))
            : t.cancel &&
              (console.log("用户点击取消"),
              wx.reportEvent("refresh", {
                yesno: "no",
              }));
        },
      });
    },
    geClick() {
      var t = this;
      // 检查是否已解锁
      if (wx.getStorageSync("fz-key") && wx.getStorageSync("fz-key") == this.getCurrentDate()) {
        if (this.data.i < 5) {
          var nextIndex = this.data.i + 1;
          this.setData({
            i: nextIndex,
            beadimg: "../../res/" + nextIndex + ".png"
          });
          wx.setStorage({
            key: "i",
            data: nextIndex
          });
        } else {
          this.setData({
            i: 1,
            beadimg: "../../res/1.png"
          });
          wx.setStorage({
            key: "i",
            data: 1
          });
        }
        return;
      }

      if (e) {
        wx.showModal({
          title: "未解锁",
          content: "看一段视频，可在今日随意切换佛珠皮肤",
          confirmColor: "#439057",
          success: (res) => {
            if (res.confirm && e) {
              e.show().catch(() => {
                e.load()
                  .then(() => e.show())
                  .catch((err) => {
                    console.error("激励视频广告显示失败：", err);
                    wx.showToast({
                      title: "广告加载失败，请稍后再试",
                      icon: "none",
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
      return e.getFullYear() +
        String(e.getMonth() + 1).padStart(2, '0') +
        String(e.getDate()).padStart(2, '0');
    },
    change: function (t) {
      var e = this.data.score + 1;
      this.data.audio && this.innerAudioContext.play();
      var n = e % 10;
      console.log(n);
      var o = ["agd" + n];
      this["agd" + n]
        .top("51%")
        .step()
        .top("40%")
        .opacity(1)
        .step(50)
        .opacity(0)
        .step()
        .step()
        .top("51%"),
        this.setData({
          [o]: this["agd" + n].export(),
        }),
        this.setData({
          score: e,
        }),
        wx.setStorageSync("fz" + this.getCurrentDate(), e);
    },
    onShareAppMessage: function () {
      return {
        title: wx.getStorageSync("fz" + this.getCurrentDate())
          ? "今日我已���德+" +
            wx.getStorageSync("fz" + this.getCurrentDate()) +
            "，你也一起来用电子念珠吧！"
          : "我发现了一款不错的解压神器！快来试一试吧！",
        path: "pages/fozhu/index",
        imageUrl: "/res/share.jpg",
      };
    },
    onShareTimeline: function () {
      return {
        title: wx.getStorageSync("fz" + this.getCurrentDate())
          ? "今日我已功德+" +
            wx.getStorageSync("fz" + this.getCurrentDate()) +
            "，你也一起来用电子念珠吧！"
          : "我发现了一款不错的解压神器！快来试一试吧！",
        imageUrl: "/res/share.jpg",
        query: {
          path: "fozhu",
        },
      };
    },
    onAddToFavorites: function (t) {
      return {
        title: "电子念珠",
        imageUrl: "/res/share.jpg",
        query: {
          path: "fozhu",
        },
      };
    },
    initAudioContext: function () {
      if (this.innerAudioContext) {
        this.innerAudioContext.destroy();
      }
      try {
        this.innerAudioContext = wx.createInnerAudioContext({
          useWebAudioImplement: !0,
        });
        this.innerAudioContext.src = "res/sound.mp3";
        this.innerAudioContext.onError((err) => {
          console.error("��频加载失败：", err);
          wx.showToast({
            title: "音频加载失败",
            icon: "none",
            duration: 2000
          });
        });
      } catch (err) {
        console.error("音频初始化失败：", err);
      }
    },
    onUnload: function () {
      if (this.innerAudioContext) {
        this.innerAudioContext.destroy();
      }
      if (this.timer) {
        clearInterval(this.timer);
      }
    },
    onHide: function () {
      if (this.innerAudioContext) {
        this.innerAudioContext.stop();
      }
      if (this.timer) {
        clearInterval(this.timer);
      }
      this.setData({
        auto: false,
        playing: false
      });
    },
  });
