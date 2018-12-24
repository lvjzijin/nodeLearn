const config = require('config-lite')(__dirname);
const moment = require('moment');
const objectIdToTimestamp = require('objectid-to-timestamp');
const Mongolass = require('mongolass');
const mongolass = new Mongolass();
mongolass.connect(config.mongodb);


exports.User = mongolass.model('User', {
    name: { type: 'string', required: true },
    password: { type: 'string', required: true},
    avatar: { type: 'string', required: true},
    gender: { type: 'string', enum: ['m', 'f', 'x'], default: 'x'},
    bio: { type: 'string', required: true}
});

exports.User.index({name: 1}, {unique: true}).exec() //根据用户名找到用户，用户名全局唯一

mongolass.plugin('addCreatedAt', {
    afterFind: function(results){
        results.forEach((item)=>{
            item.created_at = moment(objectIdToTimestamp(item._id)).format('YYYY-MM-DD HH:mm')
        })
        return results;
    },
    afterFindOne: function(result){
        if(result){
            result.created_at = moment(objectIdToTimestamp(result._id)).format('YYYY-MM-DD HH:mm')
        }
        return result;
    }
});

exports.Post = mongolass.model('Post', {
    author: {type: Mongolass.Types.ObjectId, required: true},
    title: {type: 'string', required: true},
    content: {type: 'string', required: true},
    pv: {type: 'number', default: 0}
});

exports.Post.index({author: 1, _id: -1}).exec();

exports.Comment= mongolass.model('Comment', {
    author: {type: Mongolass.Types.ObjectId, required: true},
    content: {type: 'string', required: true},
    postId: {type: Mongolass.Types.ObjectId, required: true}
});

//通过文章Id获取该文章下所有留言，按照留言创建时间升序。
exports.Comment.index({ postId: 1, _id: 1}).exec();