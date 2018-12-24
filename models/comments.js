const marked = require('marked');
const Comment = require('../lib/mongo').Comment;

Comment.plugin('contentToHtml', {
    afterFind: function(comments){
        return comments.map((comment)=>{
            comment.content = marked(comment.content);
            return comment;
        })
    }
});

module.exports = {
    create: function create(comment){
        return Comment.create(comment).exec();
    },

    //通过留言Id获取一个留言
    getCommentById: function getCommentById(commentId){
        return Comment.findOne({_id: commentId}).exec();
    },

    //通过留言Id删除一个留言
    delCommentById: function delCommentById(commentId){
        return Comment.deleteOne({_id:commentId}).exec();
    },

    //通过文章id删除该文章下的所有留言
    delCommentByPostId: function delCommentByPostId(postId){
        return Comment.deleteMany({postId: postId}).exec();
    },

    //根据PostId删除该文章下的所有留言，按照留言创建时间升序
    getComments: function getComments(postId){
        return Comment.find({postId: postId}).populate({path: 'author', model: 'User'}).sort({_id: -1}).addCreatedAt().contentToHtml().exec();
    },

    //根据文章id获取该文章下的留言数
    getCommentsCount: function getCommentsCount(postId){
        return Comment.count({postId: postId}).exec();
    }
};
