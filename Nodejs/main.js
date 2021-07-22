const http = require('http');
const fs = require('fs');
const qs = require('querystring');
const path = require('path');
const sanitizeHtml = require('sanitize-html');

function paintHtml(title, fileList, body, control) {
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
    ${control}
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
  
  if(pathname === '/'){
    if (title === null) {
      fs.readdir(targetDir, (error, files) => {
        title = 'Welcome';
        const description = 'Hello Nodejs';
        const fileList = makeFileList(files);
        const template = paintHtml(title, fileList, 
          `<h2>${title}</h2><p>${description}</p>`,
          `<a href = "/create">create</a>`);
        response.writeHead(200);
        response.end(template);
      })
    } 
    else {
      fs.readdir(targetDir, (error, files) => {
        const fileList = makeFileList(files);
        const filteredtitle = path.parse(title).base;
        fs.readFile(`../Data/${filteredtitle}`, 'utf8', (err, description) => {
          const sanitizedTitle = sanitizeHtml(title);
          const sanitizedDescription = sanitizeHtml(description);
          const template = paintHtml(sanitizedTitle, fileList, 
            `<h2>${sanitizedTitle}</h2><p>${sanitizedDescription}</p>`,
            `<a href="/create">create</a> 
            <a href="/update?id=${sanitizedTitle}">update</a> 
            <form action = "deleteProcess" method = "post">
              <input type = "hidden" name = "id" value ="${sanitizedTitle}">
              <input type = "submit" value = "delete">
            </form>`);
          response.writeHead(200);
          response.end(template);
        })
      });
    }
  }
  else if(pathname === '/create') {
    fs.readdir(targetDir, (error, files) => {
      title = 'WEB1 - create';
      const fileList = makeFileList(files);
      const template = paintHtml(title, fileList, `
      <form action="/createProcess" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit", value = "save">
        </p>
      </form>
      `, '');
      response.writeHead(200);
      response.end(template);
    });
  }
  else if (pathname === '/createProcess') {
    let body = '';
    request.on('data', (data) => {
        body += data;
    });
    request.on('end', () => {
      const post = qs.parse(body);
      const title = post.title;
      const description = post.description;
      fs.writeFile(`../Data/${title}`, description, 'utf8', (err) => {
        response.writeHead(302, {Location: `/?id=${title}`});
        response.end();
      })
    });
  }
  else if(pathname === '/update'){
    fs.readdir(targetDir, function(error, files){
      const filteredtitle = path.parse(title).base;
      fs.readFile(`../Data/${filteredtitle}`, 'utf8', function(err, description){
        title = reqUrl.searchParams.get('id');
        const fileList = makeFileList(files);
        const template = paintHtml(title, fileList,
          `
          <form action="/updateProcess" method="post">
            <input type="hidden" name="id" value="${title}">
            <p><input type="text" name="title" placeholder="title" value="${title}"></p>
            <p>
              <textarea name="description" placeholder="description">${description}</textarea>
            </p>
            <p>
              <input type="submit",  value = "save">
            </p>
          </form>
          `, ''
        );
        response.writeHead(200);
        response.end(template);
      });
    });
  }
  else if(pathname === '/updateProcess') {
    let body = '';
    request.on('data', (data) => {
        body += data;
    });
    request.on('end', () => {
      const post = qs.parse(body);
      const id = post.id;
      const title = post.title;
      const description = post.description;
      fs.rename(`../Data/${id}`, `../Data/${title}`, (err) => {
        fs.writeFile(`../Data/${title}`, description, 'utf8', (err) => {
          response.writeHead(302, {Location: `/?id=${title}`});
          response.end();
        })
      })
    })
  }
  else if(pathname === '/deleteProcess') {
    let body = '';
    request.on('data', (data) => {
        body += data;
    });
    request.on('end', () => {
      const post = qs.parse(body);
      console.log(post);
      const id = post.id;
      console.log(id);
      fs.unlink(`../Data/${id}`, (err) => {
        response.writeHead(302, {Location: `/`});
        response.end();
      })
    })
  }
  else {
    response.writeHead(404);
    response.end('Not found');
  }
});
app.listen(3000);
