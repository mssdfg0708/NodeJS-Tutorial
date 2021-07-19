const http = require('http');
const fs = require('fs');

function paintHtml(title, fileList, body) {
  return `
  <!doctype html>
  <html>
  <head>
    <title>WEB1 - ${title}</title>
    <meta charset="utf-8">
  </head>
  <body>
    <h1><a href="/">WEB</a></h1>
    ${fileList}
    ${body}
  </body>
  </html>
  `
}

function makeFileList(files) {
  let fileList = '<ul>';
  files.forEach(file => {
      fileList += `<li><a href="/?id=${file}">${file}</a></li>`;
  });
  fileList += '</ul>';
  return fileList
}
 
const app = http.createServer((request,response) => {
  const baseURL = 'http://' + request.headers.host + '/';
  const reqUrl = new URL(request.url,baseURL);
  const pathname = reqUrl.pathname;
  const targetDir = '../Data';
  let title = reqUrl.searchParams.get('id');

  console.log(title);
  console.log(pathname);
  
  if(pathname === '/'){
    if (title === null) {
      fs.readdir(targetDir, (error, files) => {
        title = 'Welcome';
        const description = 'Hello Nodejs';
        const fileList = makeFileList(files);
        const template = paintHtml(title, fileList, `<h2>${title}</h2><p>${description}</p>`);
        response.writeHead(200);
        response.end(template);
      })
    } 
    else {
      fs.readdir(targetDir, (error, files) => {
        const fileList = makeFileList(files);
        fs.readFile(`../Data/${title}`, 'utf8', (err, description) => {
          const template = paintHtml(title, fileList, `<h2>${title}</h2><p>${description}</p>`);
          response.writeHead(200);
          response.end(template);
        })
      });
    }
  } 
  else {
    response.writeHead(404);
    response.end('Not found');
  }
});
app.listen(3000);
