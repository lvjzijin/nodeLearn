const fs = require('fs');
const path = require('path');
const sha1 = require('sha1');
const express = require('express');
const router = express.Router();

const UserModel = require('../models/users');
const checkNotLogin = require('../middlewares/check').checkNotLogin;

router.get('/', checkNotLogin, (req, res, next)=>{
    res.render('signup')
});

router.post('/', checkNotLogin, (req, res, next)=>{
    console.log(req.fields, 'kkkkkkkk');
    const name = req.fields.name;
    const gender = req.fields.gender;
    const avatar = req.files.avatar.path.split(path.sep).pop();
    const bio = req.fields.bio;
    let password = req.fields.password;
    let repassword = req.fields.repassword;

    //校验参数
    try{
        if(!(name.length>=1 && name.length<=10)){
            throw new Error('名称请限制在1-10个字符')
        }
        if(['x','f', 'm'].indexOf(gender)===-1){
            throw new Error('性别只能是m,f或x');
        }
        if (!(bio.length >= 1 && bio.length <= 30)) {
            throw new Error('个人简介请限制在 1-30 个字符')
        }
        if(!req.files.avatar.name){
            throw new Error('缺少头像')
        }
        if (password.length < 6) {
            throw new Error('密码至少 6 个字符')
        }
        if (password !== repassword) {
            throw new Error('两次输入密码不一致')
        }
    } catch(e){
        //注册失败，异步删除上传的头像
        fs.unlink(req.files.avatar.path);
        req.flash('error', e.message);
        return res.redirect('/signup')
    }
    //明文密码加密
    password = sha1(password);

    //代谢如数据库的用户信息
    let user = {
        name: name,
        password: password,
        gender: gender,
        bio: bio,
        avatar: avatar
    };
    UserModel.create(user).then((result)=>{
        //此user是插入mongodb后的值，包含_id,
        user = result.ops[0];
        //删除密码敏感信息，将信息存入session
        delete user.password;
        req.session.user = user;
        //写入flash
        req.flash('success','注册成功')
        //跳转到首页
        res.redirect('/posts');
    }).catch((e)=>{
        //注册失败，异步删除上传的头像
        fs.unlink(req.files.avatar.path)
        //用户名被占用则跳回注册页，而不是错误页
        if(e.message.match('duplicate key')){
            req.flash('error', '用户名被占用');
            return res.redirect('/signup')
        }
        next(e)
    })
});

module.exports = router;