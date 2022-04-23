#!/usr/bin/env node

const parseargv = require('./module/parseargv')
const { stat, readdirSync, createReadStream } = require('fs')
// console.log(parseargv)
const argvs = parseargv({ 'h': 'help', 'p': 'port' })
const port = argvs.port ? argvs.port : 8080

require('http').createServer((req,res)=>{
    
    const URL = './'+req.url.replace(/(^\/+)|(\/+$)/g,'')
    console.log('[URL]',(URL))
    stat( decodeURI(URL), (err,stats)=>{
        if(err){
            res.statusCode=404;
            res.end('404 Page Not Found')
        }else if(stats.isDirectory()){
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<ul>'+readdirSync(decodeURI(URL)).map(v=>`<li><a href="${URL=="./"?'':encodeURI(URL.replace(/^./,''))}/${encodeURI(v)}">${v}</li>`).join('')+'</ul>')
        }else{
            const file_name = URL.split('/').splice(-1)[0]
            const mime = URL.split('.').splice(-1)[0]
            const range = req.headers.range
            const parts = range == undefined ? undefined : range.replace(/bytes=/, "").replace(/\/([0-9|*]+)$/, '').split("-").map(v => parseInt(v));
            console.log('[file_name]',file_name,'[stats]',stats,mime, '[range]',range)
            
            const file_type = ['txt','css','js','ts','html'].includes(mime)?`text/${mime=='txt'?'plain':mime.replace('js','javascript')}; charset=utf-8`:'application'
            // res.writeHead(200, {
            //     'Content-Type':, 
            //     'Content-Length':stats.size, 
            //     'Accept-Ranges': 'bytes',
            //     'Content-Transfer-Encoding': 'binary',
            //     'Content-disposition': `filename="${encodeURI(file_name)}"`//encodeURICmponent
            // });//attachment;
            


            if (!parts || parts.length != 2 || isNaN(parts[0]) || parts[0] < 0) {
                res.writeHead(200, {
                    'Content-Type': file_type,
                    'Content-Length': stats.size,
                    'Accept-Ranges': 'bytes',
                });
                const readStream = createReadStream(decodeURI(URL))
                readStream.pipe(res);
            } else {
                const start = parts[0];
                const MAX_CHUNK_SIZE = 1024 * 1024 * 8;
                const end = Math.min((parts[1] < stats.size - 1) ? parts[1] : stats.size - 1, start + MAX_CHUNK_SIZE - 1)
                console.log('[file-분할전송 - else]', start, end, '크기:', stats.size, parts);
                const readStream = createReadStream(decodeURI(URL), { start, end });
                res.writeHead((end == stats.size) ? 206 : 206, { //이어진다는 뜻
                    'Content-Type': file_type,
                    'Accept-Ranges': 'bytes',
                    'Content-Range': `bytes ${start}-${end}/${stats.size}`,
                    'Content-Length': end - start + 1,
                });
                //-1 안 하면 다 안받은 걸로 생각하는듯?
                readStream.pipe(res);
            }

            // var stream = createReadStream(decodeURI(URL));
            // stream.on('data', data=>res.write(data));
            // stream.on('end', ()=>res.end());
            // stream.on('error', (err)=>{
            //     console.log('err',err);
            //     res.end('500 Internal Server');
            // });
        }
    })
}).listen(port, ()=>{console.log(`server is ruuning at ${port}`)})