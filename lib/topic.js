const db = require('./db')
const qs = require('querystring');
const template = require('./template.js')
const sanitizeHtml = require('sanitize-html');

exports.home = (request, response) => {
    db.query('SELECT * FROM topic', function (error, queryResults) {
        if (error) {
            throw error
        }
        title = 'Welcome';
        const description = 'Hello Nodejs';
        const fileList = template.makeFileList(queryResults);
        const html = template.paintHtml(title, fileList, 
          `<h2>${title}</h2><p>${description}</p>`,
          `<a href = "/create">create</a>`);
        response.writeHead(200);
        response.end(html);
    });
}

exports.page = (request, response) => {
    const baseURL = 'http://' + request.headers.host + '/';
    const reqUrl = new URL(request.url,baseURL);
    const pathname = reqUrl.pathname;
    const queryID = reqUrl.searchParams.get('id');
    let title = reqUrl.searchParams.get('id');
    db.query('SELECT * FROM topic', function (error, queryResults) {
        if(error) {
            throw error;
        }
        db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id = author.id WHERE topic.id = ?`,[queryID], function (error2, queryResult) {
            if(error2) {
                throw error2
            }
            title = queryResult[0].title;
            const description = queryResult[0].description;
            const fileList = template.makeFileList(queryResults);
            const html = template.paintHtml(title, fileList, 
            `<h2>${sanitizeHtml(title)}</h2><p>${sanitizeHtml(description)}</p>
                <p>by ${sanitizeHtml(queryResult[0].name)}</p>`,
            `<a href = "/create">create</a>
                <a href="/update?id=${queryID}">update</a> 
                <form action = "deleteProcess" method = "post">
                <input type = "hidden" name = "id" value ="${queryID}">
                <input type = "submit" value = "delete">
                </form>`);
            response.writeHead(200);
            response.end(html);
        })
    })
}

exports.create = (request, response) => {
    db.query('SELECT * FROM topic', function (error, queryResults) {
        if (error) {
            throw error
        }
        db.query('SELECT * FROM author', (error2, authorsQuery) => {
          if (error2) {
            throw error2
          }
          const fileList = template.makeFileList(queryResults);
          const html = template.paintHtml('', fileList, 
          `<form action="/createProcess" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>
            ${template.authorSelect(authorsQuery)}
            <p>
              <input type="submit", value = "save">
            </p>
          </form>
          `, '');
          response.writeHead(200);
          response.end(html);
        })
    })
}

exports.createProcess = (request, response) => {
    let body = '';
    request.on('data', (data) => {
        body += data;
    });
    request.on('end', () => {
      const post = qs.parse(body);
      db.query(`
      INSERT INTO topic (title, description, created, author_id) 
        VALUES(?, ?, NOW(), ?)`,
      [post.title, post.description, post.author], 
      function(error, result){
        if(error){
          throw error;
        }
        response.writeHead(302, {Location: `/?id=${result.insertId}`});
        response.end();
        })
    })
}

exports.update = (request, response) => {
    const baseURL = 'http://' + request.headers.host + '/';
    const reqUrl = new URL(request.url,baseURL);
    const queryID = reqUrl.searchParams.get('id');
    db.query('SELECT * FROM topic', function(error, queryResults){
        if (error) {
          throw error;
        }
        db.query(`SELECT * FROM topic WHERE id = ?`, [queryID], function(error2, queryResult){
          if (error2){
            throw error2;
          }
          db.query('SELECT * FROM author', (error3, authorsQuery) => {
            if (error3) {
              throw error3
            }
            const fileList = template.makeFileList(queryResults);
            const html = template.paintHtml(sanitizeHtml(queryResult[0].title), fileList,
               `
              <form action="/updateProcess" method="post">
                <input type="hidden" name="id" value="${queryResult[0].id}">
                <p><input type="text" name="title" placeholder="title" value="${sanitizeHtml(queryResult[0].title)}"></p>
                <p>
                  <textarea name="description" placeholder="description">${sanitizeHtml(queryResult[0].description)}</textarea>
                </p>
                <p>
                ${template.authorSelect(authorsQuery, queryResult[0].author_id)}
                </p>
                <p>
                  <input type="submit",  value = "save">
                </p>
              </form>
              `, '');
            response.writeHead(200);
            response.end(html);
            })
        })
    })
}

exports.updateProcess = (request, response) => {
    let body = '';
    request.on('data', (data) => {
        body += data;
    });
    request.on('end', () => {
      const post = qs.parse(body);
      db.query('UPDATE topic SET title=?, description=?, author_id=? WHERE id=?', [post.title, post.description, post.author, post.id], function(error, result){
        response.writeHead(302, {Location: `/?id=${post.id}`});
        response.end();
        })
    })
}

exports.deleteProcess = (request, response) => {
    let body = '';
    request.on('data', (data) => {
        body += data;
    });
    request.on('end', () => {
      const post = qs.parse(body);
      db.query('DELETE FROM topic WHERE id = ?', [post.id], (error, result) => {
        if (error) {
          throw error
        }
        response.writeHead(302, {Location: `/`});
        response.end();
        })
    })
}
