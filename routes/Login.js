const db = require('../db/db')
const express = require('express')

const jwt = require('jsonwebtoken') // ✅ 引入 JWT 模块
const SECRET_KEY = 'your-secret-key' // ✅ 自定义密钥，可放入 .env 文件中


const router = express.Router()


// 用户登录接口
router.post('/api/login', (req, res) => {

  const { username, password } = req.body

  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?'


  db.query(sql, [username, password], (err, result) => {
    if (err) {
      console.error('数据库登录用户查询失败:', err)
      return res.status(500).send({ code: 500, msg: '登录出错' })
    }

    if (result.length > 0) {
      const user = result[0]

      // ✅ 生成 token，包含用户 id 和用户名，可自行添加字段
      const token = jwt.sign(
        // { id: user.id, username: user.username, ava: user.avatar },
        { id: user.id, username: user.username, role: user.role },
        SECRET_KEY,
        { expiresIn: '2h' } // Token 两小时后过期
      )

      // ✅ 返回 token 给前端
      res.status(200).send({
        code: 200,
        msg: '登录成功',
        user: result[0],
        token
      })
    } else {
      res.status(201).send({ code: 201, msg: '用户名或密码错误', ok: 0 })
    }
  })
})


module.exports = router