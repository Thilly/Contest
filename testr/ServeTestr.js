/*
Nick Evans
Thilly.net
14 Dec 2013
*/

//var files = require('fs');
var files = require('graceful-fs');//file system
var logging = {
	files: false
}

console.log("ServeTestr Started " + new Date());//something to say the server is actually up and running

var num = 1;

var interval = setInterval(function(){
	myWriteFile('./test' + num, 'toWrite', function(error, data){//create a file
		console.log('test written with: ' + data);
		if(error)
			console.log(error);
		myAppendFile('./test' + num, 'toAppend', function(error, appData){
			console.log('test appended with: ' + appData);
			if(error)
				console.log(error);
			myReadFile('./test' + num, function(error, readData){
				console.log('test' + num + 'read :' + readData.toString());
				if(error)
					console.log(error);
				num++;
			});
		});
	});

}, 10);

function myReadFile(fileName, callback)
{//get the entire contents of a single file and then close it immediately
	try
	{
		files.open(fileName, 'r', function(error, fd){//open the file
			if(error)
				console.log(error);
			files.fstat(fd, function(error, stats){//get the stats
				if(error)
					console.log(error);
				if(logging.files)//log them if need be
				{
					console.log(stats);
					console.log('opened: ' + fd);
				}//file descriptor, a new buffer the size of the page, start at beginning of buffer, get the whole page, from beginning of file, then callback
				files.read(fd, new Buffer(stats.size), 0, stats.size, 0, function(error, bytesRead, bufferRead){//read the file
					if(error)//log any error
					{
						if(typeof(callback) == 'function')
							callback(error, "");
						console.log(error);
					}
					else//no error
					{
						files.close(fd, function(){//close the file
							if(logging.files)
								console.log('file ' + fd + ' closed');
						});
							console.log('read: ' + bytesRead + ' bytes');
						if(typeof(callback) == 'function')
							callback(error, bufferRead);//give file to client
					}
				});
			});	
		});
	}
	catch(error)
	{
		console.log('error in myReadFile');
		console.log(error);
	}
}

function myWriteFile(fileName, dataToWrite, callback)
{//write into a file, either create it or clear then fill with new contents
	try
	{	
		var buffer = new Buffer(dataToWrite);
		files.open(fileName, 'w', function(error, fd){//open the file or create if not there yet
			if(error)
				console.log(error);				//file descriptor, buffer to be written, start at beginning of buffer, write the whole buffer, from beginning of file, then callback
			files.write(fd, buffer, 0, buffer.length, 0, function(error, written, buffer){//write to the file
				if(error)//log any error
				{
					if(typeof(callback) == 'function')
						callback(error);
				}
				else//no error
				{
					files.close(fd, function(){//close the file
						if(logging.files)
							console.log('file ' + fd + ' closed');
					});
					if(logging.files)//give some debug info
						console.log('wrote: ' + written + ' bytes');
					if(typeof(callback) == 'function')
						callback(error);
				}
			});
		});	
	}
	catch(error)
	{
		console.log('error in myWriteFile');
		console.log(error);
	}
}

function myAppendFile(fileName, dataToWrite, callback)
{//add additional information into a file then close it
	try
	{	
		var buffer = new Buffer(dataToWrite);
		files.open(fileName, 'a', function(error, fd){//open the file or create if not there yet
			if(error)
				console.log(error);				//file descriptor, buffer to be written, start at beginning of buffer, write the whole buffer, from beginning of file, then callback
			files.write(fd, buffer, 0, buffer.length, 0, function(error, written, buffer){//write to the file
				if(error)//log any error
				{
					if(typeof(callback) == 'function')
						callback(error);
				}
				else//no error
				{
					files.close(fd, function(){//close the file
						if(logging.files)
							console.log('file ' + fd + ' closed');
					});
					if(logging.files)//give some debug info
						console.log('appended: ' + written + ' bytes');
					if(typeof(callback) == 'function')
						callback(error, dataToWrite);
				}
			});
		});	
	}
	catch(error)
	{
		console.log('error in myAppendFile');
		console.log(error);
	}
}

