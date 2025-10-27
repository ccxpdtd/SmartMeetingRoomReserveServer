/*分时监测：
    监测每一个预约
    if (当前时间 between 预约时间 && 会议室状态==='已预约')
      修改会议室状态为 '占用'
    if (会议室状态==='占用' && 当前时间 > 预约时间)
      修改会议室状态为 '空闲'||'已预约'
*/

const db = require('../../db/db')


// 定义一个获取预约表的函数
const getReservations = async () => {
  return new Promise((resolve, reject) => {
    const sql = 'select * from reservations;'
    db.query(sql, (err, result) => {
      if (err) {
        console.log('获取预约表数据失败\n', err.message);
        return reject(err)
      }
      resolve(result)
    })
  })
}
//预约结束，删除记录
const delete_reservation = (id) => {
  const sql = 'DELETE FROM reservations WHERE id = ?'
  db.query(sql, [id], (err, result) => {
    if (err) return console.log("删除预约记录失败：", err.message)
    if (result.affectedRows > 0) return console.log("reservation: ongoing ---> delete\n")
  })
}
//预约开始，更改状态
const ReservationNotStartedToOngoing = (id) => {
  const sql = 'update reservations set state=1 where id=?;'
  db.query(sql, [id], (err, result) => {
    if (err) return console.log("failed: not start ---> ongoing", err.message)
    if (result.affectedRows > 0) return console.log(` reservation: not start ---> ongoing \n`)
  })
}

module.exports = {
  getReservations,
  delete_reservation,
  ReservationNotStartedToOngoing,
}
