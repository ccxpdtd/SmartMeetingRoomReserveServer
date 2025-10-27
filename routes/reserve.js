const { delete_reservation, } = require('../utils/monitor/changeReservationState')
const { getCurrentReservations } = require('../utils/monitor/Monitor.js')
const {
  updateRoomReservationCount,
  changeRoomStateFromOccupiedToReservedOrFree
} = require('../utils/monitor/changeRoomState')

const db = require('../db/db')

const express = require('express')
const router = express.Router()

const checkScheduleConflictMiddleWare = (req, res, next) => {
  const { room_id, reservation_date, start_time, end_time } = req.body
  const reservations = getCurrentReservations()
  const flag = reservations.find(r => {
    const isSameRoom = room_id === r.room_id
    const isSameDate = r.reservation_date === reservation_date
    const isSameTimeRange = (start_time < r.end_time && end_time > r.start_time)
    return isSameRoom && isSameDate && isSameTimeRange
  })
  if (flag) res.status(201).send({ code: 201, msg: '抱歉，该时间段已被预约' })
  else next()
}

//更改会议室状态中间件：当有预约发生，如果该会议室空闲就将其从空闲状态转换成已预约状态
const freeToReservedMiddleWare = (req, res, next) => {
  const { room_id } = req.body
  const sql = `
              update rooms
              set state='已预约'
              where id=?&&state='空闲'
            `
  db.query(sql, [room_id], (err, result) => {
    if (err) {
      console.error('新增会议室SQL错误：', {
        errMsg: err.message,    // 错误描述
        sql: err.sql,          // 执行的SQL语句（方便检查语法）
        params: [room_id] // 传递的参数
      });
      return res.status(500).send({ code: 500, msg: '更改会议室空闲状态失败' })
    }
    next()
  })
}


//预约
router.post('/api/reserve', checkScheduleConflictMiddleWare, freeToReservedMiddleWare, (req, res) => {
  const { user_id, room_id, reservation_date, start_time, end_time, reason } = req.body
  const insert_sql = `
                insert into 
                reservations(user_id,room_id,reservation_date,start_time, end_time,reason)
                values(?,?,?,?,?,?)
              `
  const updateRoomState_sql = 'update rooms set reservation_count=reservation_count+1 where id=?'

  db.query(insert_sql, [user_id, room_id, reservation_date, start_time, end_time, reason], (err, insert_result) => {
    if (err)
      return res.status(500).send({ code: 500, msg: '预约失败' })
    if (insert_result.affectedRows > 0) {
      db.query(updateRoomState_sql, [room_id], (err, update_result) => {
        if (err)
          return res.status(500).send({ code: 500, msg: '关联会议室预约数量失败' })
        if (update_result.affectedRows > 0) {
          return res.status(200).send({
            code: 200,
            msg: '预约成功',
          })
        }
      })
    }
  })
})

//获取所有预约记录
router.get('/api/get_reservations', (req, res) => {
  const sql = 'select * from reservations ;'
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).send({ code: 500, msg: '获取预约记录失败' })
    }
    if (result.length >= 0) {
      return res.status(200).send({
        code: 200,
        msg: '获取预约记录成功',
        reservations: result
      })
    }
  })
})



//删除预约
router.post('/api/delete_reservation', (req, res) => {
  const { id, rid } = req.body
  console.log('@', rid);

  try {
    //预约结束删除预约
    delete_reservation(id)
    //更改会议室预约数
    updateRoomReservationCount(rid)
    //查看预约结束的会议室的剩余预约数，根据预约数决定会议室的状态（已预约、空闲）
    changeRoomStateFromOccupiedToReservedOrFree(rid)
    res.status(200).send({
      code: 200,
      msg: '取消预约成功'
    })
  } catch (error) {
    res.status(500).send({
      code: 500,
      msg: '取消预约失败'
    })
  }


})


module.exports = router