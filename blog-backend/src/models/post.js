const mongoose = require('mongoose');

const {Schema} = mongoose;

const Post = new Schema({
    title:String,
    body:String,
    tags:[String], //문자열 배열
    publishedDate:{
        type:Date,
        default:new Date() //현재 날짜 기본값으로 설정
    }
});

module.exports = mongoose.model('Post', Post);