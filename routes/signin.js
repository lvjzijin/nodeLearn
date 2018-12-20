const express = require('express');
const router = express.Router();
const checkLogin = require('../middlewares/check').checkLogin;

//GET /signin登陆页
router.get('/', checkLogin, (req, res, next)=>{
    res.send('登录页')
});

//POST /signin用户登录
router.post('/', checkLogin, (req, res, next)=>{
    res.send('登录')
});

module.exports = router;