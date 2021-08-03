const http = require('http');
const fs = require('fs');
const qs = require('querystring');
const path = require('path');
const sanitizeHtml = require('sanitize-html');
const mysql = require('mysql');
const db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '8535148',
  database : 'opentuto'
});

db.connect();

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
      fileList += `<li><a href="/?id=${file.id}">${file.title}</a></li>`;
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
      db.query('SELECT * FROM topic', function (error, queryResults) {
        if (error) {
            throw error
        }
        title = 'Welcome';
        const description = 'Hello Nodejs';
        const fileList = makeFileList(queryResults);
        const template = paintHtml(title, fileList, 
          `<h2>${title}</h2><p>${description}</p>`,
          `<a href = "/create">create</a>`);
        response.writeHead(200);
        response.end(template);
    });
    } 
    else {
      db.query('SELECT * FROM topic', function (error, queryResults) {
        if(error) {
          throw error;
        }
        db.query(`SELECT * FROM topic WHERE id=?`,[title], function (error2, queryResult) {
          if(error2) {
              throw error2
          }
          title = queryResult[0].title;
          console.log(title);
          const description = queryResult[0].description;
          const fileList = makeFileList(queryResults);
          const template = paintHtml(title, fileList, 
            `<h2>${title}</h2><p>${description}</p>`,
            `<a href = "/create">create</a>
              <a href="/update?id=${title}">update</a> 
              <form action = "deleteProcess" method = "post">
                <input type = "hidden" name = "id" value ="${title}">
                <input type = "submit" value = "delete">
              </form>`);
          response.writeHead(200);
          response.end(template);
        })
      });
    }
  }
  else if(pathname === '/create') {
    db.query('SELECT * FROM topic', function (error, queryResults) {
      if (error) {
          throw error
      }
      const fileList = makeFileList(queryResults);
      const template = paintHtml('', fileList, 
      `<form action="/createProcess" method="post">
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
      // const title = post.title;
      // const description = post.description;
      // fs.writeFile(`../Data/${title}`, description, 'utf8', (err) => {
      //   response.writeHead(302, {Location: `/?id=${title}`});
      //   response.end();
      // })
      db.query(`
      INSERT INTO topic (title, description, created, author_id) 
        VALUES(?, ?, NOW(), ?)`,
      [post.title, post.description, 1], 
      function(error, result){
        if(error){
          throw error;
        }
        response.writeHead(302, {Location: `/?id=${result.insertId}`});
        response.end();
      }
    )
    });
  }
  else if(pathname === '/update'){
    // fs.readdir(targetDir, function(error, files){
    //   const filteredtitle = path.parse(title).base;
    //   fs.readFile(`../Data/${filteredtitle}`, 'utf8', function(err, description){
    //     title = reqUrl.searchParams.get('id');
    //     const fileList = makeFileList(files);
    //     const template = paintHtml(title, fileList,
    //       `
    //       <form action="/updateProcess" method="post">
    //         <input type="hidden" name="id" value="${title}">
    //         <p><input type="text" name="title" placeholder="title" value="${title}"></p>
    //         <p>
    //           <textarea name="description" placeholder="description">${description}</textarea>
    //         </p>
    //         <p>
    //           <input type="submit",  value = "save">
    //         </p>
    //       </form>
    //       `, ''
    //     );
    //     response.writeHead(200);
    //     response.end(template);
    //   });
    // });
    db.query('SELECT * FROM topic', function(error, queryResults){
      if (error) {
        throw error;
      }
      db.query(`SELECT * FROM topic WHERE title = ?`, [title], function(error2, queryResult){
        if (error2){
          throw error2;
        }
        const fileList = makeFileList(queryResults);
        const template = paintHtml(queryResult[0].title, fileList,
           `
          <form action="/updateProcess" method="post">
            <input type="hidden" name="id" value="${queryResult[0].id}">
            <p><input type="text" name="title" placeholder="title" value="${queryResult[0].title}"></p>
            <p>
              <textarea name="description" placeholder="description">${queryResult[0].description}</textarea>
            </p>
            <p>
              <input type="submit",  value = "save">
            </p>
          </form>
          `, '');
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
      console.log(post);
      // const id = post.id;
      // const title = post.title;
      // const description = post.description;
      // fs.rename(`../Data/${id}`, `../Data/${title}`, (err) => {
      //   fs.writeFile(`../Data/${title}`, description, 'utf8', (err) => {
      //     response.writeHead(302, {Location: `/?id=${title}`});
      //     response.end();
      //   })
      // })
      db.query('UPDATE topic SET title=?, description=?, author_id=1 WHERE id=?', [post.title, post.description, post.id], function(error, result){
        response.writeHead(302, {Location: `/?id=${post.id}`});
        response.end();
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
