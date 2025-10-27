/*
  已预约 ---> 占用
  占用 ---> 已预约
  占用 ---> 空闲
*/

const db = require('../../db/db')


//删除预约后将会议室的预约数减1
const updateRoomReservationCount = (rid) => {
  const updateRoomState_sql = 'update rooms set reservation_count=reservation_count-1 where id=?'
  db.query(updateRoomState_sql, [rid], (err, update_result) => {
    if (err) return console.log("更新会议室预约数量失败：", err.message)
    if (update_result.affectedRows > 0) return console.log('room: reservation_count--\n');

  })
}
//已预约 ---> 占用
const changeRoomStateFromReservedToOccupied = (rid) => {
  const updateRoomState_sql = 'update rooms set state="占用" where id=?&&state="已预约"'
  db.query(updateRoomState_sql, [rid], (err, update_result) => {
    if (err) return console.log("failed: reserved ---> occupied", err.message)
    if (update_result.affectedRows > 0) return console.log("room: reserved ---> occupied\n")
  })
}
//占用 ---> 已预约 | 占用 ---> 空闲
const changeRoomStateFromOccupiedToReservedOrFree = (rid) => {
  const updateRoomState_sql = `
                                UPDATE rooms 
                                SET state = CASE 
                                  WHEN reservation_count > 0 THEN '已预约' 
                                  ELSE '空闲' 
                                END 
                                WHERE id = ?; 
                               `
  db.query(updateRoomState_sql, [rid], (err, update_result) => {
    if (err) return console.log("failed: occupied ---> free or reserved", err.message)
    if (update_result.affectedRows > 0) return console.log("room: occupied ---> free or reserved\n")
  })
}

module.exports = {
  updateRoomReservationCount,
  changeRoomStateFromReservedToOccupied,
  changeRoomStateFromOccupiedToReservedOrFree
}