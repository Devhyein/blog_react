const Post = require('models/post');
const Joi = require('joi');
const {ObjectId} = require('mongoose').Types;

exports.checkObjectId = (ctx, next) => {
    const {id} = ctx.params;
    //검증 실패
    if(!ObjectId.isValid(id)){
        ctx.statue=400;
        return null;
    }
    return next();//next를 리턴해야 ctx.body가 설정됨
};

exports.write = async (ctx) => {
    //객체가 지닌 값들을 검증
    const schema = Joi.object().keys({title:Joi.string().required(),
    body:Joi.string().required(), tags:Joi.array().items(Joi.string()).required()});
    
    //첫번쨰 파라미터는 검증할 객체, 두번째는 스키마
    const result = Joi.validate(ctx.request.body, schema);

    //오류가 발생하면 오류 내용 응답
    if(result.error){
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }
    
    const {title,body,tags} = ctx.request.body;
    //새 Post 인스턴스 생성
    const post = new Post({
        title, body, tags
    });
    try {
        await post.save(); //데이터베이스에 등록
        ctx.body=post; //저장된 결과를 반환
    } catch(e){
        ctx.throw(e,500);
    }
};
exports.list = async (ctx) => {
    //page가 주어지지 않았으면 1, 값은 query에서 받아옴
    //query는 문자열 형태로 받아오므로 숫자로 변환
    const page = parseInt(ctx.query.page || 1,10);
    //잘못된 페이지가 주어지면 오류
    if(page<1){
        ctx.status = 400;
        return;
    }

    try {
        const posts = await Post.find()
        .sort({_id:-1})
        .limit(10)
        .skip((page-1)+10)
        //불필요한 데이터 방지하는 방법2
       // .lean()
        .exec();
        const postCount = await Post.count().exec();
        
        const limitBodyLength = post => ({
            ...post.toJSON(),//불필요한 데이터 방지하는 방법1
             body:post.body.length<200 ? post.body:`${post.body.slice(0,200)}...`
        });
        //ctx.set은 response header를 설정
        ctx.set('Last-Page', Math.ceil(postCount/10));
        ctx.body = posts.map(limitBodyLength);
    } catch(e) {
        ctx.throw(e,500);
    }
};
exports.read = async (ctx) => {
    const {id} = ctx.params;
    try {
        const post = await Post.findById(id).exec(); 
        //포스트가 존재하지 않습니다.
        if(!post){
            ctx.status = 404;
            return;
        }
        ctx.body = post;
    } catch(e) {
        ctx.throw(e,500);
    }
};
exports.remove = async (ctx) => {
    const {id} = ctx.params;
    try{
        await Post.findByIdAndRemove(id).exec();
        ctx.status = 204;
    } catch(e) {
        ctx.throw(e,500);
    }
};
exports.update = async (ctx) => {
    const{id} = ctx.params;
    try{
        const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
            new : true
            //설정해줘야 업데이트 된 객체 반환
            //안해주면 이전의 객체를 반환
        }).exec();
        if(!post){
            //포스트가 존재하지 않을 때
            ctx.status = 404;
            return;
        }
        ctx.body = post;
    } catch(e){
        ctx.throw(e,500);
    }
};
