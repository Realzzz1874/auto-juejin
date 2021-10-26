const fs = require("fs");
const configPath = "./config.json";
// const nodeMailer = require("nodemailer");

// 获取配置
const getConfig = () => {
  return JSON.parse(fs.readFileSync(configPath));
};

// 发送邮件
// const sendEmailFromQQ = async (subject, html) => {
//   let cfg = getConfig().email.qq;
//   if (!cfg || !cfg.user || !cfg.pass) return;
//   const transporter = nodeMailer.createTransport({
//     service: "qq",
//     auth: { user: cfg.user, pass: cfg.pass },
//   });
//   transporter.sendMail(
//     {
//       from: cfg.from,
//       to: cfg.to,
//       subject: subject,
//       html: html,
//     },
//     (err) => {
//       if (err) return;
//     }
//   );
// };

module.exports = {
  getConfig,
  // sendEmailFromQQ,
};
