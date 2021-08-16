const db = require('./db')
const qs = require('querystring');
const template = require('./template.js')

exports.home = (request, response) => {
    db.query('SELECT * FROM topic', function (error, queryResults) {
        if (error)
            throw error;
        db.query('SELECT * FROM author', function (error2, authors) {
            if (error2)
                throw error2;
            const title = 'author';
            const fileList = template.makeFileList(queryResults);
            const html = template.paintHtml(title, fileList, 
                `
                ${template.authorTable(authors)}
                <style>
                    table{
                        border-collapse: collapse;
                    }
                    td{
                        border:1px solid black;
                    }
                </style>
                <form action="/author/createProcess" method="post">
                    <p>
                        <input type="text" name="name" placeholder="name">
                    </p>
                    <p>
                        <textarea name="profile" placeholder="description"></textarea>
                    </p>
                    <p>
                        <input type="submit" value = "create">
                    </p>
                </form>
                `,
                ``);
            response.writeHead(200);
            response.end(html);
        });
    });
}

exports.createProcess = (request, response) => {
    let body = '';
    request.on('data', (data) => {
        body += data;
    });
    request.on('end', () => {
      const post = qs.parse(body);
      db.query(`
      INSERT INTO author (name, profile) 
        VALUES(?, ?)`,
      [post.name, post.profile], 
      function(error, result){
        if(error){
          throw error;
        }
        response.writeHead(302, {Location: `/author`});
        response.end();
        })
    })
}

exports.update = (request, response) => {
    db.query('SELECT * FROM topic', function (error, queryResults) {
        if (error)
            throw error;
        db.query('SELECT * FROM author', function (error2, authors) {
            if (error2)
                throw error2;
            const baseURL = 'http://' + request.headers.host + '/';
            const reqUrl = new URL(request.url,baseURL);
            const pathname = reqUrl.pathname;
            const queryID = reqUrl.searchParams.get('id');
            db.query('SELECT * FROM author WHERE id = ?', [queryID], function (error3, author) {
                if (error3)
                    throw error3;
                const title = 'author';
                const fileList = template.makeFileList(queryResults);
                const html = template.paintHtml(title, fileList, 
                    `
                    ${template.authorTable(authors)}
                    <style>
                        table{
                            border-collapse: collapse;
                        }
                        td{
                            border:1px solid black;
                        }
                    </style>
                    <form action="/author/updateProcess" method="post">
                        <p>
                            <input type = "hidden" name = "id" value = ${queryID}
                        </p>
                        <p>
                            <input type="text" name="name" value = ${author[0].name} placeholder="name">
                        </p>
                        <p>
                            <textarea name="profile" placeholder="description">${author[0].profile}</textarea>
                        </p>
                        <p>
                            <input type="submit" value="update">
                        </p>
                    </form>
                    `,
                    ``);
                response.writeHead(200);
                response.end(html);
            });
        });
    });
}

exports.updateProcess = (request, response) => {
    let body = '';
    request.on('data', (data) => {
        body += data;
    });
    request.on('end', () => {
      const post = qs.parse(body);
      db.query(`
      UPDATE author SET name = ?, profile = ? WHERE id = ?`,
      [post.name, post.profile, post.id], 
      function(error, result){
        if(error){
          throw error;
        }
        response.writeHead(302, {Location: `/author`});
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
      db.query(`DELETE FROM topic WHERE author_id = ?`, [post.id], (error, deleteResult) => {
        if(error){
            throw error;
        }
      });
      db.query(`
      DELETE FROM author WHERE id = ?`,
      [post.id], 
      function(error2, result){
        if(error2){
          throw error2;
        }
        response.writeHead(302, {Location: `/author`});
        response.end();
        })
    })
}
