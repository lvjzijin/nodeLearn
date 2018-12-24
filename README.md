原文档地址：https://github.com/nswbmw/N-blog.git
本文仅作个人学习node使用

对应文件夹及文件夹的用处:

models: 存放操作数据库的文件
public: 存放静态文件，如样式、图片等
routes: 存放路由文件
views: 存放模板文件
index.js 程序入口文件
package.json: 存放目录名、描述、依赖等等信息


对应模块的用处：
1. express: web框架
2. express-session: session中间件
3. connect-mongo: 将session存储于mongodb，结合express-session使用
4. connect-flash: 页面通知的中间件，基于session实现
5. ejs: 模板
6. express-formidable: 接收表单及文件上传的中间件
7. config-lite: 读取配置文件
8. marked: markdown解析
9. moment: 时间格式化
10. mongolass: mongodb驱动
11. objectid-to-timestamp: 根据ObjectId生成时间戳
12. sha1: sha1加密，用于密码加密
13. winston: 日志
14. express-winston: express的winston日志中间件


会话：
由于HTTP协议是无状态的协议，所以服务器端需要记录用户的状态时，就需要用某种机制来识别具体的用户，这个机制就是会话（Session）

cookie与session的区别
1.cookie存储在浏览器，有大小限制，session存储在服务端，没有大小限制
2. 通常session 的实现是基于cookie的，session id存储于cookie中。
3. session更安全， cookie可以直接在浏览器查看甚至编辑

我们通过引入express-session中间件实现对会话的支持：
app.use(session(options));
session中间件会在req上添加session对象，即req.session初始值为{},当我们登陆后设置res.session.user = 用户信息，返回浏览器的头部信息中会带上
set-cookie将session id写到浏览器cookie中，那么该用户下次请求时，通过带上来的cookie中的session id,我们就可以查找该用户，并将该用户信息保存到req.session.user.
