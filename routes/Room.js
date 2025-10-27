/*
    console.error('新增会议室SQL错误：', {
      errMsg: err.message,    // 错误描述
      sql: err.sql,          // 执行的SQL语句（方便检查语法）
      params: [name, floor, capacity, state, equipment, remark] // 传递的参数
    });
*/

const db = require('../db/db')
const express = require('express')

const router = express.Router()

const addRoomMiddleWare = (req, res, next) => {
  const { id, name, floor, capacity, state, equipment, remark } = req.body

  //添加
  if (!id) {
    const select_sql = `select * from rooms where name=?`
    db.query(select_sql, [name], (err, select_result) => {
      if (err)
        return res.status(500).send({ code: 500, msg: '查询同名会议室失败' });
      if (select_result.length > 0)
        return res.status(201).send({ code: 201, msg: '会议室已存在' });
      else {
        const insert_sql = `insert into rooms
                    (name, floor, capacity, state, equipment, remark)
                    values(?,?,?,?,?,?)
                  `
        db.query(insert_sql, [name, floor, capacity, state, equipment, remark], (err, insert_result) => {

          if (err)
            return res.status(500).send({ code: 500, msg: '添加会议室失败' });
          if (insert_result.affectedRows > 0)
            return res.status(200).send({
              code: 200,
              msg: '添加会议室成功',
            })
        })
      }
    })
  } else next()
}


//获取会议室信息：状态面板
router.get('/api/get_rooms', (req, res) => {
  // console.log('sss');

  const sql = 'select * from rooms order by id;'
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send('获取失败')
    if (results.length > 0) return res.status(200).send({
      code: 200,
      msg: '获取成功',
      rooms: results
    })
    else return res.status(201).send('暂无数据')
  })

})



//添加会议室
router.post('/api/admin/update_room', addRoomMiddleWare, (req, res) => {
  const { id, name, floor, capacity, state, equipment, remark } = req.body
  // console.log('update');

  const sql = `
                UPDATE rooms 
                SET 
                name = ?, floor = ?, capacity = ?, state = ?, equipment = ?, remark = ? 
                WHERE id = ?;
              `
  db.query(sql, [name, floor, capacity, state, equipment, remark, id], (err, result) => {
    if (err)
      return res.status(500).send('更新失败')
    if (result.affectedRows > 0)
      return res.status(200).send({
        code: 200,
        msg: '更新成功',
      })
  })

})

//删除会议室
router.post('/api/admin/delete_room', (req, res) => {
  const { id } = req.body
  const sql = 'DELETE FROM rooms WHERE id = ?'
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).send({ code: 500, msg: '删除失败' })
    if (result.affectedRows > 0) return res.send({ code: 200, msg: '删除成功' })
  })
})


module.exports = router