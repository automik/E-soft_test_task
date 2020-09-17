const http = require('http');
const fs = require('fs');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer();

server.on('request', (req, res) => {
    console.log(req.url)
    console.log(req.method)
    if(req.url === '/'){
        fs.readFile('html/index.html', (err, data) => {
            res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
            res.write(data);
            res.end();
        })
    }
});

server.listen(port, hostname, () => console.log(`Server running at http://${hostname}:${port}/`))