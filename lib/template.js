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
      <a href="/author">author</a>
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
  },

  authorTable:function(authors){
    let tag = '<table>';
    for (i = 0; i < authors.length; i ++){
      tag += `
        <tr>
          <td>${authors[i].name}</td>
          <td>${authors[i].profile}</td> 
          <td><a href = '/author/update?id=${authors[i].id}'>update</a></td> 
          <td>
            <form action = '/author/deleteProcess' method = 'post'>
              <input type = 'hidden' name = 'id' value = ${authors[i].id}>
              <input type = 'submit' value = 'delete'>
            </form>
          </td>     
        </tr>                   
        `    
      }
    tag += '</table>';
    return tag;
  }
}
