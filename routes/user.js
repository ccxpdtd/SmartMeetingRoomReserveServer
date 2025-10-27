const db = require('../db/db')

const express = require('express')
const router = express.Router()


const selectSameNameMiddleWare = (req, res, next) => {
  const { username } = req.body
  const sql = `select * from users where username=?;`
  db.query(sql, [username], (err, result) => {
    if (err)
      return res.status(500).send({
        code: 500, msg: '查询同名用户失败'
      })
    else if (result.length > 0)
      return res.status(201).send({
        code: 201, msg: '抱歉，该用户已经存在',
      })
    else if (result.length === 0)
      next()
  })
}

//获取用户信息
router.post('/api/admin/get_users', (req, res) => {
  const { pageNo, limit } = req.body

  // 计算分页偏移量：(页号-1) * 每页条数（跳过前面的记录）
  const offset = (pageNo - 1) * limit;
  const userSql = `
    SELECT id,username,role
    FROM users 
    ORDER BY id 
    LIMIT ? OFFSET ?  
  `
  const totalSql = "select count(*) as total from users ;"


  db.query(userSql, [limit, offset], (error, user_result) => {
    if (error) {
      res.status(500).send({
        code: 500,
        message: '获取用户信息失败'
      })
    } else {
      //查询总数
      db.query(totalSql, (error, total_result) => {
        if (error) {
          res.status(500).send({
            code: 500,
            message: '获取用户数量失败'
          })
        } else {
          // console.log('user_result', user_result);
          res.status(200).send({
            code: 200,
            message: '获取用户信息成功',
            usersData: {
              users: user_result,
              total: total_result[0].total
            }
          })
        }
      })
    }
  })

})


//创建新用户
router.post('/api/admin/add_user', selectSameNameMiddleWare, (req, res) => {
  const { username, password, role } = req.body
  const sql = `
                insert into users
                (username,password,role)
                values(?,?,?)
              `
  db.query(sql, [username, password, role], (err, result) => {
    if (err) {
      return res.status(500).send({
        code: 500,
        msg: '添加用户失败'
      })
    }
    if (result.affectedRows > 0) {
      return res.status(200).send({
        code: 200,
        msg: '添加用户成功',
      })
    }
  })
})


router.post('/api/admin/update_user', (req, res) => {
  const { id, username, password, role } = req.body
  const sql = `update users set
                username=?,password=?,role=?
                where id=?            
               `
  db.query(sql, [username, password, role, id], (err, result) => {
    if (err) {
      return res.status(500).send({
        code: 500,
        msg: '编辑用户信息失败'
      })
    }
    if (result.affectedRows > 0) {
      return res.status(200).send({
        code: 200,
        msg: '编辑用户信息成功',
      })
    }
  })
})

//删除用户
router.post('/api/admin/delete_user', (req, res) => {
  const { id } = req.body
  const sql = `
    delete from users
    where id=?
  `
  db.query(sql, [id], (err, result) => {
    if (err)
      return res.status(500).send({
        code: 500,
        msg: '删除用户失败'
      })
    if (result.affectedRows > 0)
      return res.send({
        code: 200,
        msg: '删除用户成功',
      })

  })
})


//修改权限
router.post('/api/admin/change_role', (req, res) => {
  const { id, role } = req.body

  const sql = `
   update users
   set role=?
   where id=?
  `
  db.query(sql, [role, id], (err, result) => {
    if (err) {
      console.error('新增会议室SQL错误：', {
        errMsg: err.message,    // 错误描述
        sql: err.sql,          // 执行的SQL语句（方便检查语法）
        params: [role, id] // 传递的参数
      });
      return res.status(500).send({
        code: 500,
        msg: '更改权限失败'
      })
    }
    if (result.affectedRows > 0) {
      return res.status(200).send({
        code: 200,
        msg: '更改权限成功',
      })
    }
  })
})


//修改权限
router.post('/api/change_psw', (req, res) => {
  const { username, oldPassword, newPassword } = req.body

  const select_sql = 'select password from users where username=?;'
  db.query(select_sql, [username], (err, select_result) => {
    if (err)
      return res.status(500).send({
        code: 500,
        msg: '修改密码失败！'
      })
    if (select_result.length > 0) {
      if (oldPassword !== select_result[0].password)
        return res.status(201).send({
          code: 201,
          msg: '旧密码错误,请重新输入'
        })
      else {
        const update_sql = 'update users set password=? where username=?'
        db.query(update_sql, [newPassword, username], (err, update_result) => {
          if (err)
            return res.status(500).send({
              code: 500,
              msg: '修改密码失败！！'
            })
          else
            return res.status(200).send({
              code: 200, msg: '修改密码成功'
            })
        })
      }

    }
  })

  const sql = `
   update users
   set password=?
   where id=?
  `

})




module.exports = router