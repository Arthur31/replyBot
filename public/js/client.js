autosize($(".message-input"));
var socket = io();
var name = null;

socket.on('connect', function() {
	if (Cookies.get('id') == undefined) {
		console.log('no id');
		Cookies.set('id', socket.id);
		name = prompt('Veuillez renseigner votre nom : ', 'Arthur');
		socket.emit('identification', 'new', name);
		$(".username").text(name);
	} else {
		console.log('prev id');
		socket.prevId = Cookies.get('id');
		socket.emit('identification', Cookies.get('id'))
		Cookies.set('id', socket.id);
		$(".username").text('name');
	}
});


socket.on('setName', function(name) {
	console.log(name);
	$(".username").text(name);
})

socket.on('forceNameFromServer', function(name) {
	console.log(name);
	$(".username").text(name);
})



socket.on('getName', function() {
	name = prompt('Veuillez renseigner votre nom : ', 'Arthur');
	while (name != "null" && name != "") {
		alert('Merci de rentrer un nom pour nous contacter')
		name = prompt('Veuillez renseigner votre nom : ', 'Arthur');
	}
	socket.emit('setName', name);
	$(".username").text(name);
})

socket.on('dispMessage', function(exp, mess) {
	if (exp) {
		$('.messages-content').append('<div class="message message-personal new">' + mess.replace(/\n/g, '<br />') + '</div>')

	} else {
		var myNotification = new Notify("Nouveau message de Admin", {
			body: mess,
			notifyShow: onNotifyShow
		}).show();

		$('.messages-content').append('<div class="message new">' + mess.replace(/\n/g, '<br />') + '</div>')
	}
	$('.messages').scrollTop($('.messages')[0].scrollHeight);
});


$(".button").click(() => {
	$('.chat').toggle("slow");

})

$('.message-submit').click(function() {
	sendMessage();
});

function process(e) {
	// console.log($('.message-input').css("height"));
	$('.messages').css("height", "calc(100% - " + $('.message-input').css("height") + " - 70px)");
	// console.log(e);
	if ($('.message-input').val() == "") {
		$('.message-input').css("height", "21px");
	}
	if (e.charCode == 13 && !e.altKey && !e.shiftKey) {
		// console.log('not Alt ent and not shift ent');
		e.preventDefault()
		sendMessage()
	}
}


function sendMessage() {
	var message = $('.message-input').val();

	while (message[0] == "\n" || message[0] == " ") {
		message = message.slice(1);
	}

	if (message != "") {
		console.log(message);
		socket.emit('message', message);
		// $('.messages-content').append('<div class="message message-personal new">' + message + '</div>');
	}
	$('.message-input').css("height", "21px");
	$('.messages').css("height", "calc(100% - 21px  - 70px)");
	$('.message-input').val("");
}


$('.message-input').focusin(function() {
	console.log('is Typing ...');
	socket.emit('isTyping', 1);
})

$('.message-input').focusout(function() {
	console.log('is leave Typing ...');
	socket.emit('isTyping', 0);
})

function onNotifyShow() {
	console.log('notification was shown!');
}