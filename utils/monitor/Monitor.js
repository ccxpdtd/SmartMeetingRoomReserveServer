/*分时监测：
    获取预约表
    监测每一个预约
    if (当前时间 between 预约时间 && 会议室状态==='已预约')
      修改会议室状态为 '占用'
    if (会议室状态==='占用' && 当前时间 > 预约时间)
      修改会议室状态为 '空闲'||'已预约'
*/



const {
  getReservations,
  delete_reservation,
  ReservationNotStartedToOngoing
} = require('./changeReservationState')

const {
  updateRoomReservationCount,
  changeRoomStateFromReservedToOccupied,
  changeRoomStateFromOccupiedToReservedOrFree
} = require('./changeRoomState')

const formatTime = require('../formatTime/formatTime')

let timer = null
//预约记录
let reservations
let notStartedReservations
let ongoingReservations


// 启动监测定时器,定时获取预约表数据
const startMonitor = () => {
  if (timer) return  // 防止重复启动
  timer = setInterval(async () => {
    try {
      reservations = await getReservations()
      //将预约记录分成未开始和正在进行
      reservationsClassification()
      //监测时间
      watchReservationTime()
      // console.log('当前预约表数据：\n', reservations, '\n')
    } catch (err) {
      console.error('定时任务报错：\n', err)
    }
  }, 1 * 1000)
  console.log('监测定时器已启动\n\n')
}

//分类：未开始、正在进行
const reservationsClassification = () => {
  notStartedReservations = reservations.filter(item => item.state === 0)//未开始
  ongoingReservations = reservations.filter(item => item.state === 1)//正在进行
}

//监视预约时间
const watchReservationTime = () => {
  const now = formatTime(new Date());
  //未开始的预约如果到预约时间了就变成正在进行
  notStartedReservations.forEach(item => {
    const start = item.reservation_date + ' ' + item.start_time
    const end = item.reservation_date + ' ' + item.end_time
    if (now >= start && now <= end) {
      //更改预约状态
      ReservationNotStartedToOngoing(item.id)
      //更改会议室状态（如果需要）: 已预约 ---> 占用
      changeRoomStateFromReservedToOccupied(item.room_id)
    }
  });
  //正在进行的预约如果过时间了就变成已完成：删除该预约记录
  ongoingReservations.forEach(item => {
    const end = item.reservation_date + ' ' + item.end_time
    if (now >= end) {
      //预约结束删除预约
      delete_reservation(item.id)
      //更改会议室预约数
      updateRoomReservationCount(item.room_id)
      //查看预约结束的会议室的剩余预约数，根据预约数决定会议室的状态（已预约、空闲）
      changeRoomStateFromOccupiedToReservedOrFree(item.room_id)
    }
  })
}

// 停止监测定时器
const stopMonitor = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
    console.log('监测定时器已关闭')
  }
}

const getCurrentReservations = () => reservations

module.exports = {
  startMonitor,
  stopMonitor,
  getCurrentReservations
}
