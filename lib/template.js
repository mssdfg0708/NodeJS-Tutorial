module.exports = {
    paintHtml:function(title, fileList, body, control) {
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
    },

    makeFileList:function(files) {
    let fileList = '<ul>';
    files.forEach(file => {
        fileList += `<li><a href="/?id=${file.id}">${file.title}</a></li>`;
    });
    fileList += '</ul>';
    return fileList
    },

    authorSelect:function(authorsQuery, author_id){
        authorsString = '';
        for (i=0; i < authorsQuery.length; i++){
          let selected = '';
          if (authorsQuery[i].id === author_id){
            selected = ' selected';
          }
          authorsString +=`<option value = '${authorsQuery[i].id}'${selected}>${authorsQuery[i].name}</option>`
        }
      
        return`
        <p>
        <select name = 'author'>
          ${authorsString}
        </select>
        </P>`
    }
}
