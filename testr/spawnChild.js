var exec = require('child_process').exec;

var differ = exec('node differ.js fileName.txt otherFilename', function(err, stdout, stderr){
	console.log(stdout);
});
	

differ.stdout.on('data', function(data){
	console.log('recieved data in spawnChild.js: ' + data)
});	

differ.on('exit', function(code){
	console.log('differ closed with: ' + code);
});
	