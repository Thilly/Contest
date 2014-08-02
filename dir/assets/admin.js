/*
Nick Evans
Thilly.net
12 Jan 2014
*/

var memory = {//memory object to handle all the memory logging
	maxSteps: 150,//final resolution of the graph
	queue: {
		rss: [],
		used: [],
		total: []
	},//queue of memory objects
	highest: { 
		rss: 0,//RSS, total memory of entire (parent) process on server
		used: 0,//heapUsed by process
		total: 0//heapTotal, available memory before additional allocation
	},
	lowest: {//lowest 3 factors of memory
		rss: 0,
		used: 0,
		total: 0
	}
}

var bigScore;//var to hold score board object

socket.emit('getFlags');
socket.emit('getScore');
//ask for the flags and score after the admin page is served

/*
	Begin Events
*/

window.onresize = function()
{//when changing window size, redraw the score
	updateScoreBoard(bigScore);
}

socket.on('flags', function(data)
{//event when the server sends the current logging object
	console.log(data);
	var flagBox = document.getElementById('serverFlags');
	flagBox.innerHTML = "";//clear the box first to not get double objects
	flagBox.innerHTML = 'Logging:';//put the tag back in
	for(var log in data)
	{
		var label = document.createElement('label');
		label.id='aFlag';
		label.innerHTML += log;
		console.log(log + ':' + data[log] + ': ' + typeof(data[log]));
		if(typeof(data[log]) == 'boolean')
		{
			
			var button = document.createElement('input');
			button.type = 'checkbox';
			button.name = log;
			button.checked = data[log];
			button.onchange = function(){setFlags(this);};
			label.appendChild(button);
			
			
		}
		else if (typeof(data[log]) =='number')
		{
			var text = document.createElement('input');
			text.type = 'text';
			text.value = data[log];
			text.name = log;
			text.id = 'aFlag';
			text.onchange = function(){setFlags(this);};
			label.appendChild(text);
		}
		
		flagBox.appendChild(label);
	}
});

socket.on('memory', function(myMemory)
{//when this socket receives a memory event
	
	if(logging.debug)//if debugging log the event
		console.log(myMemory);
	addDataPoint(memory.queue, myMemory);//add this data point to the list
	
	if(memory.queue.rss.length > memory.maxSteps)//*2sec = 5mins of RAM usage history
	{
		memory.queue.rss.shift();//take oldest off front
		memory.queue.used.shift();
		memory.queue.total.shift();
	}
		
	memory.highest.rss = findHighest(memory.queue.rss);//get highest
	memory.lowest.rss = findLowest(memory.queue.rss);//get lowest
	
	memory.highest.used = findHighest(memory.queue.used);
	memory.lowest.used = findLowest(memory.queue.used);
	
	memory.highest.total = findHighest(memory.queue.total);
	memory.lowest.total = findLowest(memory.queue.total);
	
	if(logging.debug)//if debugging log the bounds
	{
		console.log('lowest RUT: ' + memory.lowest.rss+ " "+ memory.lowest.used+ " "+ memory.lowest.total); 
		console.log('highest RUT: ' + memory.highest.rss+ " "+ memory.highest.used+ " "+ memory.highest.total); 
	}

	drawGraph();//draw the memory graph
});

socket.on('reconnect', function () 
{//when / if the server restarts while connected
	
	memory = {//clear the memory object
		maxSteps: 150,
		queue: {
			rss: [],
			used: [],
			total: []
		},//queue of memory objects
		highest: { 
			rss: 0,//max RSS 
			used: 0,//max heapUsed
			total: 0//max heapTotal
		},
		lowest: {//lowest 3 factors of memory
			rss: 0,
			used: 0,
			total: 0
		}
	}
	
	//dont need double events
	socket.removeAllListeners('memory');//get rid of old admin related events, they will be re-bound
	socket.emit('getFlags');
});

socket.on('score', function(data)
{//when the score or teams is changed
	bigScore = data;
	if(logging.messages)
		console.log(data);
	updateScoreBoard(data);
});

socket.on('theLastAttempt', function(data)
{//when the last attempt from the selected participant is selected
	var codeBox = document.getElementById('code');
	codeBox.value = data;
});

/*
	Begin Functions
*/

function updateScoreBoard(data)
{//update the scoreboard when new score event comes in or on resize
	document.getElementById('score').style.display = 'none';
	var scoreBoard = document.getElementById('scoreBoard');//get the scoreBoardElement
		scoreBoard.style.height = ((1 + data.teams.length) * 60) + 'px';//prevent page thrashing
	var width = (scoreBoard.clientWidth/(document.getElementById('problem').childNodes.length +1))-4 + 'px';
		scoreBoard.innerHTML = "";
	var problemRow = document.createElement('div');
		problemRow.className = 'problemRow';
		scoreBoard.appendChild(problemRow);
	var problemTile = document.createElement('div');
		problemTile.className = 'problemTile';
		problemTile.style.width = width;
		problemRow.appendChild(problemTile);
	var totalRight = 0;
	var totalWrong = 0;
	for(var problem in data.problems)//list all problem attempts and correct
	{
		var problemTile = document.createElement('div');
		problemTile.className = 'problemTile';
		problemTile.innerHTML = ' ' + data.problems[problem].correct + '/' + data.problems[problem].wrong + ' ';
		totalRight += data.problems[problem].correct;
		totalWrong += data.problems[problem].wrong + data.problems[problem].correct;
		problemTile.style.width = width;
		problemRow.appendChild(problemTile);
	}
	problemRow.childNodes[0].innerHTML = 'Totals</br>' + totalRight + '</br>' + totalWrong; 
	
	for(var aTeam in data.teams)//for each team
	{
		var teamRow = document.createElement('div');
			teamRow.className = 'teamRow';
		var teamTile = document.createElement('div');
			teamTile.className = 'teamTile';
			teamTile.id = data.teams[aTeam].team;
			teamTile.innerHTML = data.teams[aTeam].team;
			teamTile.style.width = width;
			teamTile.onclick = function(){serveTeamButtons(this);};
		teamRow.appendChild(teamTile);
		scoreBoard.appendChild(teamRow);
		for(var problem in data.problems)//list all problem attempts and correct
		{
			teamTile = document.createElement('div');
			teamTile.className = 'teamTile';
			if(data.teams[aTeam].score[problem])//if user has a score
			{
				teamTile.id = 'correct';
				teamTile.innerHTML = data.problems[problem].name + ' ' + data.teams[aTeam].score[problem] + 'ms';
			}
			else
			{
				teamTile.id = 'wrong';
				teamTile.innerHTML = data.problems[problem].name;	
			}
			teamTile.style.width = width;
			teamRow.appendChild(teamTile);
		}
	}
}

function serveTeamButtons(box)
{//replacing team name with assist/ban buttons
	box.innerHTML = "";
	
	var getFileButton = document.createElement('button');
		getFileButton.innerHTML = 'help';
		getFileButton.onclick = function(){socket.emit('getLastAttempt',box.id);};
	var banHammer = document.createElement('button');
		banHammer.innerHTML = 'ban';
		banHammer.onclick = function(){
			var reason = prompt("why");
			socket.emit('banHammer',{who:box.id, why:reason});
		};
		
	box.appendChild(getFileButton);
	box.appendChild(banHammer);
	box.onclick = function(){clearTeamButtons(this);};//click away from a button to clear buttons
}

function clearTeamButtons(box)
{//remove the assist/ban buttons from the team name box
	var id = box.id;
	box.innerHTML = "";
	box.innerHTML = id;
	box.onclick = function(){serveTeamButtons(this);};//put the function to get buttons back in
}

function setFlags(data)
{//function to change the logging object on the server
	socket.emit('updateFlag', {name: data.name, value: (data.type=='checkbox')?data.checked:data.value});
}

function drawGraph()
{//draw the memory usage on the canvas in the admin panel

	var canvas = document.getElementById('memoryLog');//get the canvas from the webpage
	var context = canvas.getContext('2d');//the context in which the drawings will happen, only x,y
	context.clearRect(0,0, canvas.width, canvas.height);//clear the entire canvas
	
	drawLine('Green', memory.queue.used, memory.lowest.used, memory.highest.used, 65);
	drawLine('Blue', memory.queue.total, memory.lowest.total, memory.highest.total, 130);
	drawLine('Red', memory.queue.rss, memory.lowest.rss, memory.highest.rss, 195);

	context.fillStyle = 'Red';//put a legend at the top left so can easily read which line is which peice of memory
	context.fillText('RSS:' + (memory.lowest.rss/(1024*1024)).toPrecision(4) + '-' + (memory.highest.rss/(1024*1024)).toPrecision(4) + ' MB', 0, 16);
	context.fillStyle = 'Blue';
	context.fillText('Total:' + (memory.lowest.total/(1024*1024)).toPrecision(4) + '-' + (memory.highest.total/(1024*1024)).toPrecision(4) + ' MB', 0, 32);
	context.fillStyle = 'Green';
	context.fillText('Used:' + (memory.lowest.used/(1024*1024)).toPrecision(4) + '-' + (memory.highest.used/(1024*1024)).toPrecision(4) + ' MB', 0, 48);
	if(memory.queue.rss.length < memory.maxSteps)
	{
		context.fillStyle = 'Black';
		context.fillText('Data Points:' + memory.queue.rss.length, 0, 64);
	}
}

function drawLine(color, array, lowest, highest, offset)
{//draw the individual line
	var canvas = document.getElementById('memoryLog');//get the canvas from the webpage
	var context = canvas.getContext('2d');//the context in which the drawings will happen, only x,y
	var dX = canvas.width / array.length;//the amount of resolution I have to draw with (how many data points)
	var height;//a var to make changes easier
	context.font = '12pt Arial';//standard font
	context.textAlign = 'left';//align left... hurrrrr
	context.fillStyle = color;//color of line and text
	context.strokeStyle = color;
	context.beginPath();//drawing memory usage graph of RSS
	context.moveTo(0, canvas.height - (array[0] - lowest)*((canvas.height)/(highest-lowest+1)));//first point is at very left of graph where memory is
	for(var i = 0; i < array.length; i++)//rss portion
	{	
		height = canvas.height - (array[i] - lowest)*((canvas.height)/(highest-lowest+1));//the height of the current datapoint
		context.lineTo(i * dX + dX, height);
		if(i == array.length-1)//if last (newest) data point display the text of the amount of ram server is allocating
			context.fillText((array[i]/(1024*1024)).toPrecision(4) + 'MB', canvas.width-offset, (height>20) ? height : height+20);
	}
	context.stroke();//draw the line
}

function findLowest(queue)
{//find the lowest of the bounds
	var lowest = 0;
	for(var i = 0; i < queue.length; i++)
		if(lowest > queue[i] || lowest == 0)
			lowest = queue[i];
	
	return lowest;
}

function findHighest(queue)
{//find the highest of the bounds
	var highest = 0;
	for(var i = 0; i < queue.length; i++)
		if(highest < queue[i])
			highest = queue[i];
	
	return highest;
}

function addDataPoint(queue, dataPoint)
{//add a data point to the memory object
	queue.rss.push(dataPoint.rss);
	queue.used.push(dataPoint.heapUsed);
	queue.total.push(dataPoint.heapTotal);
}

function adminLogout()
{//when an administrator logsOut
	socket.removeAllListeners('memory');
	
	var head = document.getElementsByTagName('head')[0];//get the head block
	for(var i = 0; i < head.childNodes.length; i++)
		if(head.childNodes[i].id == 'admin.js' || head.childNodes[i].id == 'testing.js')
		{
			var child = head.childNodes[i];
			head.removeChild(child);
			console.log('Removed :' + child);
		}

}