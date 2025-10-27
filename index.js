const express = require('express')
const app = express()
app.use(express.json());

const cors = require('cors');
app.use(cors());
// 解析 JSON 请求体


const LoginRegister_r = require('./routes/Login')
app.use(LoginRegister_r)
const Room_r = require('./routes/Room')
app.use(Room_r)
const User_r = require('./routes/user')
app.use(User_r)
const Reserve_r = require('./routes/reserve')
app.use(Reserve_r)

app.listen(9004, () => {
  console.log("服务器已启动：9004");
})

const { startMonitor, stopMonitor } = require('./utils/monitor/Monitor.js')

// 启动服务时，启动监测
startMonitor()


// 当进程退出时，关闭定时器
process.on('SIGINT', () => {
  console.log('\n\n服务器关闭中...')
  stopMonitor()
  process.exit()
})