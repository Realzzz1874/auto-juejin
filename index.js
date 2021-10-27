const Cron = require("cron").CronJob;
const axios = require('axios');
const fs = require("fs");
const configPath = "./config.json";
const nodeMailer = require("nodemailer");

const getConfig = () => {
  return JSON.parse(fs.readFileSync(configPath));
};

const sendEmail = async (subject, html) => {
  let cfg = getConfig().email.yeah;
  if (!cfg || !cfg.user || !cfg.pass) return;
  const transporter = nodeMailer.createTransport({
    host: "smtp.yeah.net",
    port: 25,
    secureConnection: true,
    auth: { user: cfg.user, pass: cfg.pass },
  });
  transporter.sendMail(
    {
      from: cfg.from,
      to: cfg.to,
      subject: subject,
      html: html,
    },
    (err) => {
      if (err) {
        console.log(err);
        return;
      }
    }
  );
};

const getTodayLotteryStatus = async () => {
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
    await sendEmail('抽过啦', 'QAQ');
    return;
  } 
  const { cookie, baseUrl, apiUrl } = getConfig();
  let { data } = await axios({
    url: baseUrl + apiUrl.drawLottery,
    method: "post",
    headers: {
      Cookie: cookie,
    },
  });
  if (data.err_no) {
    await sendEmail('抽奖失败啦', 'QAQ');
    return;
  }
  await sendEmail('抽奖结果', data);

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
  return {
    error: data.err_no !== 0,
    isCheck: data.data,
  };
};

// 签到
const checkIn = async () => {
  let { error, isCheck } = await getTodayCheckStatus();
  if (error) {
    await sendEmail('验证签到错误', 'QAQ');
    return;
  }
  if (isCheck) {
    await sendEmail('已经签到', 'QAQ');
    return;
  }
  const { cookie, baseUrl, apiUrl } = getConfig();
  let { data } = await axios({
    url: baseUrl + apiUrl.checkIn,
    method: "post",
    headers: {
      Cookie: cookie,
    },
  });
  if (data.err_no) {
    await sendEmail('签到失败', data);
  } else {
    await sendEmail('签到成功', 'OVO');
  }
};

let job = new Cron(
  "10 10 10 * * *",
  async () => {
    await checkIn();
    await draw();
  },
  null,
  true,
  'Asia/Shanghai'
);

job.start();
