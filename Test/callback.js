const dem = function(){
    console.log('Dem');
}

function runFunc(functionVariable){
    console.log('\n=== Call back ===');
    functionVariable();
}

runFunc(dem);
