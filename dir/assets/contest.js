/*
Nick Evans
Thilly.net
14 Dec 2013
*/
var logging = {
	messages: false,
	submissions: false,
	chat: false,
	debug: false
}
//my standard logging object for debugging and checking random stuff

var user = {
	code: "",
	pass: "",
	problem: "",
	score: {},
	team: "",
	type: 'user'
}
//user object

var socket;//initalized on logging in
//socket is going to be the websocket for data transmission to and from the server
//look for a session or something for better UX, instead of logging out on re-load or navigation

window.onload = getCache;//start off with trying to get any local storage

/*
	BEGIN EVENTS
*/

window.onresize = function()
{//when changing window size, redraw the score
	updateScore();
}

function attachEvents()
{//attaching all the events to the socket object
		socket.on('getTests', function (data){//when the test names are returned
			if(logging.messages)
				console.log(data);
			var dropDown = document.getElementById('problem');//problem dropdown menu
			dropDown.innerHTML = "";//clear it
			for(var i = 0; i < data.length; i++)
				dropDown.innerHTML += "<option value=\"" + data[i] + "\">" + data[i] + "</option>";//add to the list box thing
			updateScore();
		});

		socket.on('teamResult', function (data){//when the result of an attempted login is returned
			if(logging.messages)
				console.log(data);
			if(data == 'wrong')//wrong password, tell user
			{
				if(logging.messages)
					console.log('wrong password');
				alert('Wrong password for team ' + user.team + ', please try again.');
				document.getElementById('password').value = "";
			}
			else //logged in, display contest thing and hide login stuff
			{
				if(logging.messages)
					console.log('team logged in');
				user.type = data.type;
				user.team = data.team;
				user.score = data.score;

				if(user.type == 'admin')
				{
					addJS('admin.js');
				}
				if(user.type == 'tester')
					addJS('testing.js');
			}
		});
		
		socket.on('compile', function(data){//when the compile status is returned
			while(data.indexOf("^") != -1)//get rid of those dumbass carots
				data = data.replace("^","");//needed if compile errors are there
			document.getElementById('results').innerHTML += '</br>' + data;//log the message
		});
		
		socket.on('testResult', function (data){//when the result of a submission is returned
			if(logging.messages)
				console.log(data);
			user.score = data.score;
			document.getElementById('results').innerHTML += '</br>' + data.msg;
			if(data.msg.indexOf('Correct solution') >= 0)
				document.getElementById('results').style.backgroundColor = "#00FF00";
			if(data.msg.indexOf('Solution not correct') >= 0)
				document.getElementById('results').style.backgroundColor = "#FF0000";
			updateScore();
		});
	
		socket.on('page', function (data){//when the contents of the html needs to change
			var hold = "";//to account for loading the page WHILE reconnecting, do not delete the users code
			if(document.getElementById('code') != null)
				hold = document.getElementById('code').value;
			document.getElementById('fullPage').innerHTML = data.toString();
			if(hold != "")
				document.getElementById('code').value = hold;
				
			if(user.team != "")
			{
				document.getElementById('team').innerHTML = 'Team Name: ' + user.team;
			}
		});
		
		socket.on('reconnect', function (){ //when / if the server restarts while connected
			if(user.team != "")
				socket.emit('team', user);//log back in
		});
		
		socket.on('banned', function(data){//fired when user gets banned
			logOut();
			alert('You have been banned! Reason: ' + data);	
		});
		
		socket.on('chatMsg', function(msg){ //when the client receives a chat message
			if(logging.messages)//if logging, log
				console.log(msg);
			var chatWindow = document.getElementById('chatBox');//get the chat box
			var newMsg = document.createElement('div');//create a new chat element
			newMsg.id = msg.team;//set the ID to be team
			newMsg.textContent = msg.team + '- ' + msg.txt;//insert team name and msg
			if((chatWindow.scrollHeight-chatWindow.clientHeight) == chatWindow.scrollTop || (chatWindow.scrollHeight-chatWindow.clientHeight) == 0)//if user is NOT reading earlier messages
			{//add the message and keep the scroll at the bottom
				chatWindow.appendChild(newMsg);
				chatWindow.scrollTop = chatWindow.scrollHeight;
			}
			else//if they are reading other messages, just add to bottom and dont change the scroll
				chatWindow.appendChild(newMsg);
				
			if(chatWindow.childNodes.length > 1000)
			{
				chatWindow.removeChild(chatWindow.childNodes[0]);
				if(logging.debug)
					console.log('removed top node from chat');
			}
		});
		
		socket.on('problemText', function(msg){//get the problem details
			document.getElementById('code').value = msg;
		});
}//end of attach events

/*
	BEGIN FUNCTIONS
*/

function addJS(fileName)
{//getting an additional js file
	var file = document.createElement('script');//create a new external JS thingy
	file.setAttribute('id', fileName);
	file.setAttribute('type','text/javascript');//set it as JS
	file.setAttribute('src','assets/'+fileName);//get file location
	document.getElementsByTagName('head')[0].appendChild(file);//add it to head so it will be picked up by browser
}

function getCache()
{//get the session storage from the browser if there
	if(typeof(Storage) !== 'undefined')//if browser IS able to have HTML5 storage
	{
		socket = io.connect(document.URL);//say hi to the server
		if(document.getElementById('changeLog'))//if on login page, get dat changelog
			socket.on('changeLog', function(data){
				document.getElementById('changeLog').innerHTML = data;	
			});
		attachEvents();//and start listening for any replies
		
		if(sessionStorage.getItem('user') != null)//if 'my' key IS there
		{
			user = JSON.parse(sessionStorage.getItem('user'));//get login details
			login();//then go ahead and login
		}
	}
	else
		alert('your browser can\'t handle my cookies');//tell user cant use session storage
}

function login()
{//attach to the socket and also attach all the events to that socket
		socket.emit('team', user);
}

function loginEnter(key, form)
{//when user hits enter from the chatBox
	var keyCode = key.keyCode || key.which;//cross browser compat
	if(keyCode == 13)//if 'enter'
		getTeamName();//act like it was clicked
}

function chatSend(key, form)
{//when the user hits enter from the chat box
	var keyCode = key.keyCode || key.which;//cross browser compatibility
	if(keyCode == 13)//if 'enter'
	{
		var msg = {
			team : user.team,
			txt : document.getElementById('inputChat').value
			};
		if(document.getElementById('inputChat').value != "")
		{
			document.getElementById('inputChat').value = "";
			socket.emit('chatMsg', msg);
		}
	}
}

function getTeamName()
{//get the team stuff and check with server or warn user
	user.team = document.getElementById('teamName').value;
	user.pass = document.getElementById('password').value;
	sessionStorage.setItem('user', JSON.stringify(user));
	if(user.team != "" && user.pass != "") //if user did provide something
		login();
	else if(user.pass == "")
		alert("please enter a password");
	else if(user.team == "")
		alert("please enter a team name");
}

function updateScore()
{//update the score screen for the contestant
	var dropDown = document.getElementById('problem');//get the problem names
	var scoreBox = document.getElementById('score');//get the place to store the score
	var width = (scoreBox.clientWidth/(dropDown.childNodes.length +1))-4 + 'px';
	scoreBox.innerHTML = "";//clear the existing score
		var teamRow = document.createElement('div');
			teamRow.className = 'teamRow';
		var teamTile = document.createElement('div');
			teamTile.className = 'teamTile';
			teamTile.innerHTML = user.team;
			teamTile.style.width = width;
		teamRow.appendChild(teamTile);	
		scoreBox.appendChild(teamRow);
		for(var i = 0; i < dropDown.childNodes.length; i++)//list all problem attempts and correct
		{
			teamTile = document.createElement('div');
			teamTile.className = 'teamTile';
			teamTile.id = (user.score[dropDown.childNodes[i].value])?'correct':'wrong';
			teamTile.innerHTML = dropDown.childNodes[i].value;
			teamTile.style.width = width;
			teamRow.appendChild(teamTile);
		}
}

function reCode(string)
{//to parse the irritating symbols out of chat
	return string//stacked replace
		.replace('%20', ' ')//space
		.replace('%3C', '\<')//less than
		.replace('%3E', '\>')//greater than
		.replace('%5C', '\\');//a slash
}

function logOut()
{//when the user logs out but does not close the browser
	user.team = "";
	user.pass = "";//clear out team stuff
	user.score = [];
	sessionStorage.removeItem('user');
	clearBox();//clear out any programming entered
	socket.emit('logout');
	if(user.type == 'admin')
		adminLogout();
	if(user.type == 'tester')
		testerLogout();
}

function sendSub()
{//submitting an attempt to the server and updating the alert thingy
	user.code = document.getElementById('code').value + '\n';
	user.problem = document.getElementById('problem').value;
	
	socket.emit('submission', user);
	if(logging.submissions)
		console.log('user submitted for problem ' + user.problem);
	
	var resultBox = document.getElementById('results');
	resultBox.style.backgroundColor = "#cccc00";//yellow for neutral result
	resultBox.innerHTML = "Submitting...";
	//update color and content based on yes/no/error/success
}

function checkSelect()
{//when test case is changed, clear box or put in the working test-test case
	socket.emit('getProblem', document.getElementById('problem').value);
}

function clearBox()
{//clear the code box
	document.getElementById('code').value = "";
}
