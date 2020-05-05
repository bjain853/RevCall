const SignalServer=require('react-rtc-real/server/SignalServer.js');
const https=require('https');
const express=require('express');
const path=require('path');
const app=express();

const portNUm=3000;
const server = https.createServer(app);
const signal = new SignalServer({server});
signal.connect();

server.listen(portNUm,()=>{
    console.log('listening on '+portNUm);
});