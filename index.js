const Cron = require("cron").CronJob;
const axios = require('axios');
const { getConfig } = require("./util.js");

// 获取今天免费抽奖的次数
const getTodayDrawStatus = async () => {
  const { cookie, baseUrl, apiUrl } = getConfig();
  let { data } = await axios({
    url: baseUrl + apiUrl.getLotteryConfig,
    method: "get",
    headers: {
      Cookie: cookie,
    },
  });
  if (data.err_no) {
    return {
      error: true,
      isDraw: false,
    };
  } else {
    return {
      error: false,
      isDraw: data.data.free_count === 0,
    };
  }
};

// 抽奖
const draw = async () => {
  let { error, isDraw } = await getTodayDrawStatus();
  if (error) return;
  if (isDraw) return;
  const { cookie, baseUrl, apiUrl } = getConfig();
  let { data } = await axios({
    url: baseUrl + apiUrl.drawLottery,
    method: "post",
    headers: {
      Cookie: cookie,
    },
  });
  if (data.err_no) return;
};

// 查询今日是否已经签到
const getTodayCheckStatus = async () => {
  const { cookie, baseUrl, apiUrl } = getConfig();
  let { data } = await axios({
    url: baseUrl + apiUrl.getTodayStatus,
    method: "get",
    headers: {
      Cookie: cookie,
    },
  });
  console.log(data);
  return {
    error: data.err_no !== 0,
    isCheck: data.data,
  };
};

// 签到
const checkIn = async () => {
  let { error, isCheck } = await getTodayCheckStatus();
  if (error) return;
  if (isCheck) return;
  const { cookie, baseUrl, apiUrl } = getConfig();
  let { data } = await axios({
    url: baseUrl + apiUrl.checkIn,
    method: "post",
    headers: {
      Cookie: cookie,
    },
  });
  if (data.err_no) {
    console.log('fail')
  } else {
    console.log('success')
  }
};

let job = new Cron(
  "0 23 0 * * *",
  async () => {
    await checkIn();
    await draw();
  },
  null,
  true,
  'Asia/Shanghai'
);

job.start();
