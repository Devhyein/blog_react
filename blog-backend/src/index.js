require( 'dotenv' ).config();

const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const api = require('./api');

const mongoose = require('mongoose');
const {
    PORT:port=4000,//값이 존재하지 않으면 4000 default
    MONGO_URI: mongoURI
} = process.env;

mongoose.Promise = global.Promise; //Node의 Promise를 사용
mongoose.connect('mongodb://localhost:27017/blog', {useNewUrlParser: true}).then(() => {
    console.log('connected to mongodb');
}).catch((e) => {
    console.error(e);
});

const app = new Koa();
const router = new Router();

//라우터 설정
router.use('/api', api.routes()); //api 라우트 적용

//라우터 적용 전에 bodyParser 적용
app.use(bodyParser());

//app 인스턴스에 라우터 적용
app.use(router.routes()).use(router.allowedMethods());

app.listen(port,()=>{
    console.log('listening to port', port);
});