const express = require('express');
const PostModel = require('../models/posts');
const CommentModel = require('../models/comments');
const router = express.Router();

const checkLogin = require('../middlewares/check').checkLogin;

//GET /posts所有用户或者特定用户的文章页
router.get('/', (req, res, next)=>{
    const author = req.query.author;
    PostModel.getPosts(author).then((posts)=>{
        res.render('posts', {
            posts: posts
        })
    }).catch(next);
});

// GET /posts/create 发表文章页
router.get('/create', checkLogin, (req, res, next)=>{
    res.render('create')
});

// POST /posts/create 发表一篇文章
router.post('/create', checkLogin, (req, res, next)=>{
    const author = req.session.user._id;
    const title = req.fields.title;
    const content = req.fields.content;

    try {
        if(!title.length){
            throw new Error('请填写标题')
        }
        if(!content.length){
            throw new Error('请填写内容');
        }
    } catch(e){
        req.flash('error', e.message);
        return res.redirect('back');
    }
    let post = {
        author: author,
        title: title,
        content: content,
    }
    PostModel.create(post).then((result)=>{
        //此post是插入mongodb后的值，包含_id
        post = result.ops[0];
        req.flash('success', '发表成功');
        res.redirect(`/posts/${post._id}`)
    }).catch(next);

});


router.get('/:postId', (req, res, next)=>{
    const postId = req.params.postId;
    Promise.all([
        PostModel.getPostById(postId),
        CommentModel.getComments(postId),//获取文章所有留言
        PostModel.incPv(postId),
    ]).then((result)=>{
        const post = result[0];
        const comments = result[1];
        if(!post){
            throw new Error('该文章不存在')
        }else{
            res.render('post', {
                post: post,
                comments: comments
            })
        }
    }).catch(next);
});

//GET /posts/:postId/edit 更新文章页
router.get('/:postId/edit', checkLogin, (req, res, next)=>{
    const postId = req.params.postId;
    const author = req.session.user._id;

    PostModel.getRawPostById(postId).then((post)=>{
        if(!post){
            throw new Error('该文章不存在')
        }
        if(author.toString()!== post.author._id.toString()){
            throw new Error('权限不足')
        }
        res.render('edit',{
            post: post
        })
    }).catch(next)
});

//POST /posts/:postId/edit 更新一篇文章
router.post('/:postId/edit', checkLogin, (req, res, next)=>{
    const postId = req.params.postId;
    const author = req.session.user._id;
    const title = req.fields.title;
    const content = req.fields.content;

    //参数校验
    try{
        if(!title.length){
            throw new Error('请填写标题')
        }
        if(!content.length){
            throw new Error('请填写内容')
        }
    }catch(e){
        req.flash('error', e.message);
        return res.redirect('back')
    }
    PostModel.getRawPostById(postId)
        .then(function (post) {
            if (!post) {
                throw new Error('该文章不存在')
            }
            if (author.toString() !== post.author._id.toString()) {
                throw new Error('权限不足')
            }
            PostModel.updatePostById(postId, {title: title, content: content}).then(()=>{
                req.flash('success', '编辑文章成功');
                res.redirect(`/posts/${postId}`)
            })
        }).catch(next)

});
router.get('/:postId/remove', checkLogin, (req, res, next)=>{
    const postId = req.params.postId;
    const author = req.session.user._id;

    PostModel.getRawPostById(postId).then((post)=>{
        if(!post){
            throw new Error('该文章不存在')
        }
        if(author.toString()!== post.author._id.toString()){
            throw new Error('权限不足')
        }
        PostModel.delPostById(postId).then(()=>{
            req.flash('success', '删除文章成功');
            res.redirect('/posts')
        })
    }).catch(next)
});

module.exports = router;