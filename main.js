const http = require('http');
const topic = require('./lib/topic')
 
const app = http.createServer((request,response) => {
  console.log("----Catch Requset----")
  const baseURL = 'http://' + request.headers.host + '/';
  const reqUrl = new URL(request.url,baseURL);
  const pathname = reqUrl.pathname;
  const queryID = reqUrl.searchParams.get('id');
  
  if(pathname === '/'){
    if (queryID === null) {
      topic.home(request, response);
    } else {
      topic.page(request, response);
    }
  } else if(pathname === '/create') {
    topic.create(request, response);
  } else if (pathname === '/createProcess') {
    topic.createProcess(request, response);
  } else if(pathname === '/update'){
    topic.update(request, response);
  } else if(pathname === '/updateProcess') {
    topic.updateProcess(request, response);
  }
  else if(pathname === '/deleteProcess') {
    topic.deleteProcess(request, response);
  }
  else {
    response.writeHead(404);
    response.end('Not found');
  }
})
app.listen(3000);
