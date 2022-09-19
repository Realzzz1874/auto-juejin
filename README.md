# auto-jujin

### 功能点

#### 自动签到

- 查询今日是否已经签到：

```bash
https://api.juejin.cn/growth_api/v1/get_today_status
```

- 签到：

```bash
https://api.juejin.cn/growth_api/v1/check_in
```

```javascript
// 查询今日是否已经签到
const getTodayCheckStatus = async () => {
  const cookie = "从浏览器的请求头里 copy 一个 cookie";
  let { data } = await axios({
    url: "https://api.juejin.cn/growth_api/v1/get_today_status",
    method: "get",
    headers: {
      Cookie: cookie,
    },
  });
  return {
    error: data.err_no !== 0,
    isCheck: data.data,
  };
};

// 签到
const checkIn = async () => {
  let { error, isCheck } = await getTodayCheckStatus();
  if (error) {
    console.log("验证签到错误");
    return;
  }
  if (isCheck) {
    console.log("已经签到");
    return;
  }
  const cookie = "从浏览器的请求头里 copy 一个 cookie";
  let { data } = await axios({
    url: "https://api.juejin.cn/growth_api/v1/check_in",
    method: "post",
    headers: {
      Cookie: cookie,
    },
  });
  if (data.err_no) {
    console.log("签到失败");
  } else {
    console.log("签到成功");
  }
};
```

#### 顺带免费抽奖

- 获取抽奖配置：

```bash
https://api.juejin.cn/growth_api/v1/lottery_config/get
```

- 发起抽奖

```bash
https://api.juejin.cn/growth_api/v1/lottery/draw
```

```javascript
const getTodayLotteryStatus = async () => {
  const cookie = "从浏览器的请求头里 copy 一个 cookie";
  let { data } = await axios({
    url: "https://api.juejin.cn/growth_api/v1/lottery_config/get",
    method: "get",
    headers: {
      Cookie: cookie,
    },
  });
  if (data.err_no) {
    return {
      error: true,
      isLotteryed: false,
    };
  } else {
    return {
      error: false,
      isLotteryed: data.data.free_count === 0,
    };
  }
};

// 抽奖
const draw = async () => {
  let { error, isLotteryed } = await getTodayLotteryStatus();
  if (error || isLotteryed) {
    console.log("抽过啦");
    return;
  }
  const cookie = "从浏览器的请求头里 copy 一个 cookie";
  let { data } = await axios({
    url: "https://api.juejin.cn/growth_api/v1/lottery/draw",
    method: "post",
    headers: {
      Cookie: cookie,
    },
  });
  if (data.err_no) {
    console.log("抽奖失败啦");
    return;
  }
  console.log("抽奖结果:\n" + data);
};
```

#### 失败了再顺带给我发个邮件

邮件服务可以参考：[**_nodemailer_**](https://nodemailer.com/about/)

```javascript
const sendEmail = async (subject, html) => {
  // xxx
};
```

将上面函数里失败的 `console.log()` 替换成邮件提醒 `await sendEmail()`

#### 丢到服务器上每天定时执行

```javascript
let job = new Cron(
  "10 10 10 * * *",
  async () => {
    await checkIn();
    await draw();
  },
  null,
  true,
  "Asia/Shanghai"
);

job.start();
```

### 注意事项

由于 cookie 会过期，所以失败之后可以尝试在浏览器里重新 copy 一个 cookie 到脚本里执行。
