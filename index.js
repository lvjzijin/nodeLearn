const path = require('path');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');
const config = require('config-lite')(__dirname);
const routes = require('./routes');
const pkg = require('./package');
const winston = require('winston');
const expressWinston = require('express-winston');
const app = express();


app.set('views', path.join(__dirname, 'views')); //设置存放模版文件的目录
app.set('view engine', 'ejs');//设置模版引擎为ejs

//设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')));

//session中间件
app.use(session({
    name: config.session.key, //设置cookie中保存session id的字段名称
    secret: config.session.secret, //通过设置secret来计算hash值并放在cookie中，使产生的signedCookie防篡改
    resave: true,  //强制更新session
    saveUninitialized: false, //设置为false，强制创建一个session，即使用户为登录
    cookie: {
        maxAge: config.session.maxAge //过去时间，过期后cookie中的session id自动删除
    },
    store: new MongoStore({ //将session存储到mongodb
        url: config.mongodb //mongodb地址
    })
}));

//flash中间件，用来显示通知
app.use(flash());

//处理表单及文件上传的中间件
app.use(require('express-formidable')({
    uploadDir: path.join(__dirname, 'public/img'), //上传文件目录
    keepExtensions: true, //保留后缀
}))

//设置模版全局常量
//app.locals和res.locals都用来渲染模版，使用上的区别在于app.locals上通常挂载常量信息，如(博客名、描述、作者等不会变的信息)，res.locals上通常挂载变量信息。
app.locals.blog = {
    title: pkg.name,
    description: pkg.description
};

//添加模版必须的三个变量
app.use((req, res, next)=>{
    res.locals.user = req.session.user;
    res.locals.success = req.flash('success').toString();
    res.locals.error = req.flash('error').toString();
    next()
});

//正常请求的日志
app.use(expressWinston.logger({
    transports:[
        new(winston.transports.Console)({
            json:true,
            colorize: true
        }),
        new winston.transports.File({
            filename: 'logs/success.log'
        })
    ]
}));
//路由
routes(app);

//错误请求的日志
app.use(expressWinston.errorLogger({
    transports: [
        new winston.transports.Console({
            json: true,
            colorize: true
        }),
        new winston.transports.File({
            filename: 'logs/error.log'
        })
    ]
}));

app.use((err, req, res, next)=>{
    console.log(err);
    req.flash('error', err.message);
    res.redirect('/posts')
});

//直接启动index.js则会监听端口启动程序，如果index.js被require了，则导出app，通常用于测试。
if(module.parent){
    //被require,则导出app
    module.exports = app;
}else{
    app.listen(config.port,()=>{
        console.log(`${pkg.name} listening on port ${config.port}`)
    });
}
