/*
Nick Evans
Thilly.net
14 Dec 2013
*/

/*
	BEGIN PREP
*/
var files = require('fs');//node #include type thing
var server = require('http').createServer(fileHandler);
	server.listen(8015);//port I'm on

var logging = {//debugging/logging stuff
	data: false,	//logging data io
	debug: false, 	//logging node info
	diffs: false,	//logging user differences
	errors: true,	//logging specific errors (user related)
	files: false, 	//logging file manipulation
	flow: false,	//logging specific data flow mechanisms
	memory: true,	//logging memory usage at all
	memMsg: false,	//logging the memory messages in the server log
	memoryInterval: 2 * 1000,	//what rate (s * ms) to log memory usage
	messages: false,//logging chat messages
	process: false,	//logging the children processes
	results: true, 	//logging submissions and outcome
	timeout: 5 * 1000, //user submission timeout (s * ms)
	users: true 	//logging user changes
};

var color = require('colors');
//colors is an external lib, to install:
//cmd>% npm install colors

var io = require('socket.io').listen(server, {log: logging.debug});
//socket.io is an external libary. to intsall it:
//cmd>% npm install socket.io 
//these will compile and do things after install then it's there forever. (if not in local directory, make sure class path knows where it is)

var admin = [];	//admin sockets
var teams = {};	//all the contest related stuff (name/pass/score)
var fileNames = [];//array of just filenames (to pass back to user quickly)
var problems = {};//object of problem objects (associative array in JS)
//filename(name) - correctAttempts(correct) - wrongAttempts(wrong)
//place all of these objects into a class (ContestClass) type thing

teams['Thilly'] = createNewTeam({team: 'Thilly', pass:8659});
//I am ALWAYS in :D
//no one else can be thilly
//move this to an admin array thing, keep the admins saved in the save file

//I am ALWAYS in :D
//no one else can be thilly
//move this to an admin array thing, keep the admins saved in the save file

console.log("Contest Server Started " + new Date());//something to say the server is actually up and running
loadContest();//when server comes up do I want to make a new one or keep ALL pre-existing stats

var KB = 1024;
var MB = 1024*1024;
var memoryTimer;
//some memory constants instead of calculating each time

/*
	BEGIN EVENTS
*/

server.on('save', function()
{//the event thrown to save the contest progress
	//logon of new team, attempted submission, score change
	saveContest();// now actually go and save it
	if(admin.length > 0)//if an admin is listening
		updateScoreBoard();
});

server.on('startMemory', function()
{//the event thrown to begin/stop/change memory frequency

	clearInterval(memoryTimer);
	if(logging.memory)
	{
		var lastMemory = {//static object
					rss: 0,
					heapUsed: 0,
					heapTotal: 0
					};//to judge differences in memory

		memoryTimer = setInterval(function(){
			var myMem = process.memoryUsage();//get memory object
			server.emit('memory', myMem);
			
			if(logging.memMsg)//if want to see the server memory in the log
			{
				if(lastMemory.rss == 0)//otherwise it's the first allocation of memory
				{
					console.log( 'HU:' + myMem.heapUsed/MB + 'MB to start'.green);
					console.log( 'TH:' + myMem.heapTotal/MB + 'MB to start'.green);
					console.log( 'RS:' + myMem.rss/MB + 'MB to start'.green);
				}
				else if(myMem.heapUsed - lastMemory.heapUsed < 0)//if memory dropped, garbage collection happened
				{
					console.log( 'HU:' + myMem.heapUsed/MB + 'MB after GC'.green);
					console.log( 'TH:' + myMem.heapTotal/MB + 'MB after GC'.green);
					console.log( 'RS:' + myMem.rss/MB + 'MB afterGC'.green);
				}
				else//if not first or GC, report as change
				{
					console.log( 'HU:' + (myMem.heapUsed - lastMemory.heapUsed)/KB + 'KB change'.yellow);
					console.log( 'TH:' + (myMem.heapTotal - lastMemory.heapTotal)/KB + 'KB change'.yellow);
					console.log( 'RS:' + (myMem.rss - lastMemory.rss)/KB + 'KB change'.yellow);
				}
				lastMemory = myMem;//set last memory to now memory
			}
		}, logging.memoryInterval);
	}
});

server.on('memory', function(memory)
{//the event thrown to update memory for administrators
	try
	{
		if(admin.length > 0)//if admin has connected
			for(var i = 0; i < admin.length; i++)
				admin[i].emit('memory', memory);
	}
	catch(error)
	{
		console.log(error)
		console.log('error in server.on memory');
	}
});

server.on('uncaughtException', function(error)
{//if something really wacky happens, don't crash server
	console.log('something happened to ' + 'server'.red);
	console.log(error);
});

process.on('uncaughtException', function(error)
{//if something is not caught within the process, don't kill process
	console.log('something happened to ' + 'process'.red);
	console.log(error);
});

server.on('loaded', function()
{//when the contest load event is finished

	io.sockets.on('connection', function (socket)
	{//events for when and 'while' a user is connected
		console.log(socket.id + ' Connected'.yellow);	//log connection
		
		if(typeof(socket.team) != 'string')
			myReadFile('./dir/changeLog.txt', function(error, text){//get dynamic changeLog
				if(error)
					console.log(error);//log any error with the file
				socket.emit('changeLog', text);
			});
		//end of initial connection work
		
		//when a user submits code for checking, callbacks are only called on successful things, errors are logged along the way
		socket.on('submission', function(data) {
			if(logging.results)
				console.log(this.team.team.blue + ' submitted an attempt at ' + problems[data.problem].name.green);//log problem recieved
			createFile(data, this.team.attempt++, function(newFile){//create a new file
				socket.team.lastSubmit = newFile;//remember the filename of the last submission
				compile(newFile, socket, problems[data.problem], function(){//file compiled/user alerted of errors
					testApplication(newFile, socket, problems[data.problem], function(answer, output, time){//run and alert user of status from a child
						differ(answer, output, time, socket, problems[data.problem]);//program ran, test the output and finally score everything
					});//end of diffing
				});//end of running
			});//end of createFile callback
		});//end of submission callback
		
		//getting the file of a users last attempt
		socket.on('getLastAttempt', function(data) {
			if(logging.messages)
				console.log(this.team.team.blue + ' is requesting last submission from user : ' + data.green);
			if(teams[data].lastSubmit)
				myReadFile(teams[data].lastSubmit.path + teams[data].lastSubmit.name, function(error, datas){
					socket.emit('theLastAttempt', datas);
				});
			else
				socket.emit('theLastAttempt', 'no last attempt from user: ' + data);
		});
		
		//when banning a user from the contest
		socket.on('banHammer', function(data){
			if(logging.users)
				console.log(this.team.team.blue + ' is banning ' + data.who.red);
			var found = false;
			if(teams[data.who].type == 'admin')
				console.log(data.who.green + ' is an administrator, cannot delete');
			else
			{
				for(var thing in io.sockets.sockets)
				{
					if(logging.data)
						console.log(thing.green);
					if(io.sockets.sockets[thing].team)
						if(io.sockets.sockets[thing].team.team == data.who)
						{
							io.sockets.sockets[thing].emit('banned', data.why);
							io.sockets.sockets[thing].team.type = 'banned';
							found = true;
						}				
				}
				if(!found)//if the team is not on-line
				{
					delete teams[data.who];//delete the team
					server.emit('save');
					if(logging.users)
						console.log(data.who.red + ' was deleted from the contest');
				}
			}
		});
		
		//checking if new team is to be added or re-tried
		socket.on('team', function(data) {
			var found = false;//make note if found team as existing or not
			for(var aTeam in teams)
				if(teams[aTeam].team.toUpperCase() == data.team.toUpperCase())
				{
					found = true;//the team was found
					if(teams[aTeam].pass == data.pass)//check pass
					{
						socket.team = teams[aTeam];//if so, this socket is now that team
						if(logging.users)
							console.log(socket.id + ' is now ' + teams[aTeam].team.blue);
						socket.emit('teamResult', teams[aTeam]);//tell user they are in
						getPageContents(socket, 'contest', function(){
							server.emit('save');
						});
						if(socket.team.type == 'admin')
							admin.push(socket);
					}
					else
						socket.emit('teamResult', 'wrong');
				}
			if(!found)//if it's a new team
			{
				var tempTeam = createNewTeam(data);
				socket.team = tempTeam;//shove to socket
				teams[tempTeam.team] = tempTeam;//shove into team list
				if(logging.users)
					console.log(socket.id + ' is now ' + tempTeam.team.blue);

				socket.emit('teamResult', tempTeam);//tell user they are in
				getPageContents(socket, 'contest');
				server.emit('save');//update the saveFile
			}
		}); //end of team callback
		
		//give all of the server flags to the administrators
		socket.on('getFlags', function(){
			socket.emit('flags', logging);
		});
		
		//give the entire score to the administrators
		socket.on('getScore', function(){
			socket.emit('score', {teams: teams, problems: problems});
		});
		
		//when an administrator changes a logging value
		socket.on('updateFlag', function(data){
			if(logging.process)
				console.log(data.name.blue + ' is now set to ' + data.value);
			logging[data.name] = data.value; 
			if((data.name).indexOf('memory')>=0)
				server.emit('startMemory');
		});
		
		//when a client logs out but does not close browser
		socket.on('logout', function() {
			getPageContents(socket, 'login', function(){
				myReadFile('./dir/changeLog.txt', function(error, text){//get dynamic changeLog
					if(error)
						console.log(error);//log any error with the file
					socket.emit('changeLog', text);
				});
			});
			if(logging.users)
				console.log(this.team.team.blue + ' logged out');
			if(this.team.type == 'admin')
				admin.splice(admin.indexOf(this),1);
			if(this.team.type == 'banned')
			{
				if(logging.users)
					console.log(this.team.team.blue + ' was' + ' banned'.red);
				delete teams[this.team.team];
				server.emit('save');	
			}
			this.team = "";//clear the socket team object
		}); //end of logout callback
		
		//when a client disconnects
		socket.on('disconnect', function() {
			if(this.team)//if they have picked a team yet
			{
				if(logging.users)
					console.log(this.team.team.blue + ' Disconnected'.red);//log it 
				if(this.team.type == 'admin')
					admin.splice(admin.indexOf(this),1);//clear this admin socket
				this.team = "";
			}
			else if(logging.users)
				console.log(socket.id + ' Disconnected'.red);//if closed before team selected
		});	//end of disconnect callback

		//when a client sends a chat message to the server
		socket.on('chatMsg', function(data) {
			if(logging.messages)
				console.log(data.team.blue + ': ' + data.txt);
			io.sockets.emit('chatMsg', data);
		});

		//when a client selects a new problem from the list
		socket.on('getProblem', function(problemName){
			myReadFile('./dir/Text/Text' + problemName, function(error, problemText){
			//read the text from the file
				if(error)//log any errors
				{
					console.log(error);
					console.log('error in getProblem');
				}
				else
				{
					try
					{
						socket.emit('problemText', problemText);//give the user back the text from the file
					}
					catch (error)//catch any disconnects
					{
						console.log(error);
						console.log('error when sending problem ' + problemName + ' to user');
					}
				
				}
			
			});
		});
		
		//serving the changeLog to the login screen
		socket.on('getChangeLog', function(changeLog){
			myReadFile('./dir/changeLog.txt', function(text){
				socket.emit('changeLog', text);
			});
		});
	
	});//end of connection events

});

/*
	BEGIN FUNCTIONS
*/

function updateScoreBoard()
{//send the full contest score to the administrators (if any)
	try
	{
		if(admin.length > 0)//if admin has connected
			for(var i = 0; i < admin.length; i++)
				admin[i].emit('score', {teams: teams, problems: problems});
	}
	catch(error)
	{
		console.log(error)
		console.log('error in updateScoreBoard()');
	}
}

function createNewTeam(data)
{//a lil constructor type thingy for the teams
	var tempTeam = {//create new object
		attempt: 0,//attempts from the user (file naming)
		lastSubmit: "",//filename of last submitted problem
		pass: data.pass,//new password
		team: data.team,//new team name
		type: (data.team.indexOf('Tester')>-1)?'tester':'user', //if the member is admin
		score: {}//fresh score
	};
	for(var i = 0; i < problems.length; i++)
		tempTeam.score[i] = 0;
		
	return tempTeam;
}

function getPageContents(socket, page, callback)
{//serve new content for dynamic page
	var fileName = './dir/assets/';
	if(page == 'contest')
	{
		if(socket.team.team == 'Thilly')//i get admin page
			fileName += 'admin.html';
		else//serve normal contest page
			fileName += 'contest.html';
	}
	else if(page == 'login')//serve the login page
		fileName += 'login.html';

	myReadFile(fileName, function(error, fileData){//get the contents of the file
		socket.emit('page', fileData)//give to the client
		if(page == 'contest')//if it's a contest page
			socket.emit('getTests', fileNames);//also give them the problems for the contest
		if(typeof(callback) == 'function')
			callback();	
	});
}

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
						console.log('fd: ' + fd + ' opened');
						//file descriptor, a new buffer the size of the page, start at beginning of buffer, get the whole page, from beginning of file, then callback
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
							{
								console.log('fd: ' + fd + ' closed');
								console.log('read: ' + bytesRead + ' bytes');
							}
						});
						if(typeof(callback) == 'function')
							callback(error, bufferRead.toString());//give file to client
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
						{
							console.log('fd: ' + fd + ' closed');
							console.log('wrote: ' + written + ' bytes');
						}
					});
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
						{
							console.log('fd: ' + fd + ' closed');
							console.log('appended: ' + written + ' bytes');
						}
					});
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

function compile(file, socket, problem, callback)
{//compile the submission, if successful call the test function
	var util = require('util');
	var exec = require('child_process').exec;
	var userMsg = "", serverMsg = "", compiled = false;
	var compile = exec('g++ -o \"' + file.path + 'a.exe\" \"' + file.path + file.name + '\"', function(compError, stdout, stderr){
		if(stdout)
			if(logging.errors)
				console.log('stdout:' + stdout);
		if(stderr)
			if(logging.errors)
				console.log('stderr:' + stderr);
		if(compError != null)//compile failed
		{
			serverMsg = socket.team.team.blue + ' did not compile'.red;
			userMsg = 'Compile Failed!' + stderr.toString(); //add a message and the errors to the .cpp file to see what user screwed up on
			problem.wrong++;
			server.emit('save');
		}
		else//compiled successfully
		{
			serverMsg = socket.team.team.blue + ' compiled successfully'.green;
			userMsg = 'Compiled successfully...';
			compiled = true;
		}
		while(userMsg.indexOf('./dir/') != -1)//trim all of the directory information from the message
			userMsg = userMsg.replace(userMsg.substring(userMsg.indexOf('./dir/'),userMsg.indexOf('.cpp')+4), "<br>");
		myAppendFile(file.path + file.name, '\n' + userMsg, function(appendError){
			if(appendError)
				console.log(appendError);
		});
		try
		{
			socket.emit('compile', userMsg);//tell user about the error 
		}
		catch (error)
		{
			if(logging.errors)
				console.log('User disconnected during compilation');
		}
		if(logging.results)
			console.log(serverMsg);
		if(compiled && typeof(callback) == 'function')
			callback(file);
			//testApplication(file, socket, problem);
	});//end of compiling callback	
	
	compile.on('close', function(code, signal){
		if(logging.process)
			console.log('compile closed with code: ' + code + ' and signal: ' + signal);
	});
	
	compile.on('exit', function(code, signal){
		if(logging.process)
			console.log('compile exited with code: ' + code + ' and signal: ' + signal);
	});
 }//end of compiling/running work
    
function differ(answer, output, totalTime, socket, problem)
{//compare the output of the application against the known correct result
	var fork = require('child_process').fork;
	var differ = fork('differ.js');//move off of main process since diff can be heavy on bigger files
		differ.send({output: output, answer: answer});
	var serverMsg, userMsg, diffs;//some variables to use later in here
	
	differ.on('message', function(data){
		if(logging.results)//when differ is finished it will send the information back
		{
			var serverString = socket.team.team.blue;
			if(data.numWrong > 0)//if there was wrong ansers, color accordingly
				serverString += ' ' + data.numWrong + ' incorrect'.red;
			else
				serverString += ' zero wrong'.green;
			console.log(serverString);
		}
		diffs = data;//take the object returned
		differ.kill('SIGINT');//killem, and free up the process
	});
	
	differ.on('exit', function(code, signal){//when it is closed, we have diff object and everything needed to judge user
		if(logging.process)
			console.log('differ exited with code: ' + code + ' and signal: ' + signal);//make sure it closed correctly
		if(diffs.values.length == 0)//if no errors
		{
			serverMsg = socket.team.team.blue + ' Correct Solution!'.green;
			userMsg = 'Correct solution! ';//let user know they are a badass
			problem.correct++;//total correct
			if(!socket.team.score[problem.name] || totalTime < socket.team.score[problem.name])//if no score or better score
				socket.team.score[problem.name] = totalTime;//set score index to totalTime to signify correct result on this problem
		}
		else//there was errors
		{
			if(logging.diffs)		
				console.log(diffs.values.trim());//if looking specifically, show the diffs
			serverMsg = socket.team.team.blue + ' Incorrect Solution!'.red;
			userMsg = 'Solution not correct! Possibly ' + diffs.numWrong + ' wrong case(s), check your logic';
			problem.wrong++;
		}
		
		if(logging.results)
			console.log(serverMsg);
		server.emit('save');//save it and if logging, log it
		
		try
		{
			socket.emit('testResult', {msg:userMsg, score:socket.team.score});//only thing that potentially throws wacky error (user DCs before response)
		}
		catch (error)
		{
			if(logging.errors)
				console.log('User disconnected during submission');
		}
		
	});
}	
		
function testApplication(file, socket, problem, callback)
{//test the users program with a known input
 	var options = {//options for running the users process
				timeout: logging.timeout,//give limit on process run time (ms)
				maxBuffer: 4 * 1024 * 1024//2 meg max buffer should be good for MOST/ALL of the problems
				};
			
	var startTime = new Date();
	var testCase = 'Test' + problem.name;//the testCase filename
	var execFile = require('child_process').execFile;//execute the file, not just a bash command	
	var readStream = files.createReadStream('./dir/Test/' + testCase, {autoClose: true});//get piped into stdin
	var writeStream = files.createWriteStream(file.path + file.name, {flags: 'a', autoClose: true});//append code file piped from stdout
	var userMsg, serverMsg;
	var testing = execFile(file.path + 'a.exe', options, function(testError, stdout, stderr){ //run newly compiled program with the corresponding testCase
		var totalTime = new Date();//get current time
		totalTime -= startTime;//subtract start time for time elapsed
		myReadFile('./dir/Answers/' + testCase.replace('Test', 'Answer'), function(readError, data){//get the 'expected' data
			if(readError)
				console.log(readError);
			if(testError != null)//if the program crashed
			{
				if(logging.errors)
					console.log('Error during runtime: ' + testError.toString());//tell me what happened
				serverMsg = socket.team.team.blue + ' terminated unexpectedly, ' + 'runtime error'.red;
				userMsg = 'Process terminated unexpectedly, runtime error, not Thillys fault!</br>';
				problem.wrong++;//still counts as a wrong answer
				//tell user shit broke, if there is any errors, give them those as well
			}
			else
			{
				serverMsg = socket.team.team.blue + ' Solution finished running'.green
				userMsg = 'Solution finished running in' + totalTime + ' ms. ';
				if(typeof(callback) == 'function')//if the callback was passed in correctly, run that now
					callback(data, stdout, totalTime);
			}
			if(logging.results)
				console.log(serverMsg);//display to admins whats up
			server.emit('save');//save it
			try
			{
				socket.emit('testResult', {msg:userMsg, score:socket.team.score});//only thing that potentially throws wacky error (user DCs before response)
			}
			catch (error)
			{
				if(logging.errors)
					console.log('User disconnected during submission');
			}
		});//end of readFile callBack
	});//end of testing callback
	
	readStream.on('data', function(chunk){//on each chunk read from the testCases file
		var ready = true;
		try
		{
			if(chunk.length>1)
			{
				ready = testing.stdin.write(chunk);//reading from the file into stdin
				if(logging.flow)
					console.log('writing chunk into program: ' + chunk.length);//logging?
			}
		}
		catch (error)//if the stream was already closed (usually)
		{
			//EPIPE means that stream closed before this was finished writing to it
			//try catch is bad form, try to handle better in subsequent builds
			if(logging.errors)
				console.log('Error before end of input :', error.toString());
			try
			{
				socket.emit('testResult', {msg:'Test Failed! Check your input format',score:socket.team.score});
			}
			catch (error)
			{
				if(logging.errors)
					console.log('User disconnected during submission');
			}
			//score will be handled by the test checker
			readStream.pause();//jus stop it, we dont care about it anymore
		}
		if(ready == false)
		{
			this.pause();//pause the stream while stdin catches up
			if(logging.flow)
				console.log('Paused stdin-stream');
			testing.stdin.once('drain', this.resume.bind(this));//get more chunks when ready
		}	
	});

	testing.stdout.on('data', function(chunk){//on each chunk that leaves the program
		if(logging.flow)
			console.log('writing chunk into file: ' + chunk);//logging?
		var ready = writeStream.write(chunk);//writing stdout into the file
		if(ready == false)//if getting backed up
		{
			this.pause();//hold on
			if(logging.flow)
				console.log('Paused stdout-stream');//when stream ready to read, get some datas
			writeStream.once('drain', this.resume.bind(this));
		}	
	});

	testing.on('uncaughtException', function(error){
		console.log('something happened during' + ' testing'.red);
		console.log(error);
	});	

	testing.on('exit', function(code, signal){
		if(logging.process)
			console.log('testing exited with code: ' + code + ' and signal: ' + signal);
		readStream.close();
		writeStream.close();
	});

	testing.on('close', function(code, signal){//announce why testing was closed IF was terminated (kill/timeout)
	var userMsg = "", serverMsg = "";
		if(signal == 'SIGTERM')//time out
		{
			userMsg = 'Process took too long';
			serverMsg = socket.team.team.blue + ' timed out: ' + signal;
			problem.wrong++;
		}
		else if(signal == "SIGSEGV")//segFault
		{
			userMsg = 'Segmentation Fault';
			serverMsg = socket.team.team.blue + ' seg fault: ' + signal;
			problem.wrong++;
		}
		else if(signal)//something else happened
		{
			userMsg = 'Thilly Can\'t Program!';
			serverMsg = 'THILLY CANT SOMETHING '.yellow + 'testing closed because of: ' + signal;
			problem.wrong++;
		}
		else//nothing out of ordinary happened
		{
			serverMsg = socket.team.team.blue + ' finished testing'.green;
		}
		if(logging.results)
			console.log(serverMsg);
		if(userMsg != "")//gotta wrap sockets to catch a disconnect
			try
			{
				socket.emit('testResult', {msg:userMsg, score:socket.team.score});
			}
			catch (error)
			{
				if(logging.errors)
					console.log('User disconnected during submission');
			}
	});//end of process close callback			
}//end of testing function
  
function loadContest()
{//load the contest from JSON
//	var files = require('graceful-fs');//file system
	//baked in node things '#include <yadda>'

	if(files.existsSync('./saveContest')) //if the save file already exists
	{
		process.stdin.resume;//node always has stdin paused unless otherwise specified
		process.stdout.write('contest save file found, load it? (y/n)');
		process.stdin.once('data', function(data){//get ONE input from console, it then re-pauses the stdIN stream
			data = data.toString().trim();//place in string and get rid of whiteSpace from entry ('y' + '\n')
			if(data == 'y' || data == 'Y')//if yes
				myReadFile('./saveContest', function(error, data){//read the save file
						if(logging.files)
							console.log(data);//if testing, log it
						problems = JSON.parse(data.substring(0,data.indexOf('\n')));//get first half as the problems
						teams = JSON.parse(data.substring(data.indexOf('\n')));//second half is the teams
						for(var problem in problems)//add the names to the name array
							fileNames.push(problem);//so i can just pass this to users
						console.log('contest loaded');
						server.emit('loaded');
						server.emit('startMemory');
				});// end of load file
			else
			{
				console.log('contest not loaded');//else (no/don't load)
				getFiles();//fill out the filenames and problems array
				server.emit('loaded');
				server.emit('startMemory');
			}
				//and do nothing
		});//end of stdin callback
	}
}

 function saveContest()
{//save the contest as JSON and create a nice readable log
//	var files = require('graceful-fs');//file system
	//baked in node things '#include <yadda>
	var saveData = JSON.stringify(problems);//add the stuff to save to a JSON string for loading
		saveData += '\n' + JSON.stringify(teams);//separate by a '\n' for ease of loadings back in

	myWriteFile('./saveContest', saveData, function(error){//write it to file
		if(error)//list any errors
			console.log('error on writing saveFile');
		if(logging.data)//display if logging
			console.log('saveContest written');
	});
	
	var readableSave = new Date() + '\n<TeamName> - successful turnins separated by \' - \'';//make another file that is easy to read
	for(var aTeam in teams)//record each teams successful turnins
	{
		var temp = teams[aTeam].team;
		for(var aProblem in problems)
			if(teams[aTeam].score[aProblem])//format is <team> - <success1> - <success2> ....
				temp += ' - ' + problems[aProblem].name;
		readableSave += '\n' + temp;
	}
	readableSave += '\n<probName> - <correct> - <attempted>';
	for(var aProblem in problems)//also list stats on each problem <problem>-<correct>-<attempts>
		readableSave += '\n' + problems[aProblem].name + ' - ' + problems[aProblem].correct + ' - ' + (problems[aProblem].correct+problems[aProblem].wrong);
		
	myWriteFile('./saveContestReadable.txt', readableSave, function(error){//write it to another file
		if(error)//list any errors
			console.log('error on writing readable saveFile');
		if(logging.data)//display if logging
			console.log('readableContest written');
	});
}
 
function createFile(data, attempt, callback)
{//create a new file for the latest submission
	var file = {
		path: "",
		name: ""
	};//keeping separate so i can work in user directory when compiling
	
	file.path = './dir/submissions/'; 	//root directory of all submissions
	file.path += data.team +'/';		//directory for team
	
	if(!files.existsSync(file.path))	//not async, has to exist BEFORE doing stuff in directory
		files.mkdirSync(file.path);		//make the folder for team if doesn't exist
		
	file.name = problems[data.problem].name;	//name of problem being tested
	file.name += attempt + '.cpp';				//tack on an attempt number and a .cpp
	//./dir/submissions/<teamName>/problemAttempt.cpp

	myWriteFile(file.path + file.name, data.code, function(){//file creation
		if(logging.files)
			console.log('File: ' + file.path.replace('./dir/submissions/','') + file.name + ' created');
		callback(file);
	});//aSync callback, must fully write before compiling	
}//end of turnin file creation

function getFiles()
{//get all the files associated with the contest

	files.readdir('./dir/Test', function(error, files){//getting the problems handy
	//read the directory for testCases, then the callBack below
		if(error)
			console.log(err.toString());//if something wacky happened
		else
		{
			if(logging.files)//logging the file names?
				console.log(JSON.stringify(files));
			for(var i = 0; i < files.length; i++)
			{
				files[i] = files[i].replace('Test','');//clean up the names for general use
				if(files[i] == 'NOTINUSE')//do not get the folder of stuff not for this contest
				{
					files.splice(i, 1);//remove the folder from the list
					i--;//schooch back
				}
				else	//add each object to the array
					problems[files[i]] = {//make an associative array
						name: files[i],//filename
						correct: 0,//how many correct
						wrong: 0//how many wrong
					};
			}
			for(var problem in problems)//add the names to the name array
				fileNames.push(problem);//so i can just pass this to users
		}
	});
}//end of getting files for contest

function fileHandler (req, res)
{//all the node webServer stuff 
//	var files = require('graceful-fs');//file system
	//baked in node things '#include <yadda>'

	var filePath = req.url;
	if(filePath == '/')//if first request
		filePath = './dir/index.html';	
		//give main page
	else	//otherwise
		filePath = './dir' + req.url;	
			//go into shared directory and get the thing requested
	if(logging.files)	
		console.log(filePath);//log thing gotten
	/*
	favicon.ico is a continued request.
	Apparently some type of google thing, possibly a heartbeat, 
	It is irritating but its part of chrome from what I'm reading
	*/
	var contentType = 'text/html';//default content type	
	var path = require('path');
	
	switch(path.extname(filePath))//what is extension of file?
	{
		case '.js'://if JS
		{
			contentType = 'application/javascript';
			break
		}
		case '.css'://if CSS
		{
			contentType = 'text/css';
			break;
		}
		//default already taken care of above
	}
	
	files.exists(filePath, function(exists) {	//read file in and tell browser what it is
		if(exists)
			myReadFile(filePath,  function (error, data) {
				if (error) {
					res.writeHead(500);
					res.end();//cant read it, bail and go elsewhere
					console.log('Error loading' + filePath); //loggit
				}
				res.writeHead(200, {'Content-Type': contentType});//serve file based on type
				res.end(data);//send it
			});
		else
		{
			res.writeHead(404);//cant find it? 404 it
			res.end;
		}
	});//end of file exist callback
}
