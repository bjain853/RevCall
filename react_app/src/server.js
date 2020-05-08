const SignalServer=require('react-rtc-real/server/SignalServer.js');
const https=require('https');
const express=require('express');
const path=require('path');
const app=express();

app.use(express.urlencoded({extende:true}));
const portNUm=process.env.PORT || 5000;
const server = https.createServer(app);
const signal = new SignalServer({server});
signal.connect();

server.listen(portNUm,()=>{
    console.log('listening on '+portNUm);
});