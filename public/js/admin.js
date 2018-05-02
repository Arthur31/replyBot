var messages = {};

var currentConvo = "";

var creditentials = {};

$('.convo').click(function() {
	displayConvo($(this).data('id'));
});


var audioSubmit = new Audio('/p/sound/chat_sent.m4a');
var audioReceive = new Audio('/p/sound/chat_received.m4a');
var audioConnect = new Audio('/p/sound/newCustomer.mp3');
var audioDisconnect = new Audio('/p/sound/byeCustomer.m4a');


function onNotifyShow() {
	console.log('notification was shown!');
}



autosize($(".message-input"));

var socket = io('/admin', {
	query: creditentials
});

socket.on('reconnect_attempt', () => {
	socket.io.opts.query = creditentials;
});


if ($.isEmptyObject(creditentials)) {
	console.log(creditentials);
	creditentials.username = prompt('Username :', 'admin');
	creditentials.password = prompt('Password :', 'Admin123!');
	//socket.emit('SadminAuth', creditentials.username, creditentials.password);
	//console.log(creditentials);
} else {
	console.log(creditentials);
	// socket.emit('SadminAuth', creditentials.username, creditentials.password);
}



socket.emit('getPrevMessages');

socket.on('loadPrevMessages', function(data) {
	console.log("loadPrevMessages");
	data = data.reverse();
	for (message of data) {
		$('.messages-content').append('<div class="message new">' + message.message + '</div>')
	}
})

socket.on('customerMessage', function(sessionId, message, pseudo) {
	console.log(sessionId + " --- " + message);
	audioReceive.play();

	var myNotification = new Notify("Nouveau message de " + pseudo, {
		body: message,
		notifyShow: onNotifyShow
	}).show();

	if (messages[sessionId] == undefined) {
		messages[sessionId] = [{
			"m": message,
			"exp": 0
		}]
	} else {
		messages[sessionId].push({
			"m": message,
			"exp": 0
		})
	}

	$(".side_selector").find(`[data-id='${sessionId}']`).children(".previewMessage").text(message);

	$(".side_selector").find(`[data-id='${sessionId}']`).prependTo(".side_selector");

	$(".side_selector").find(`[data-id='${sessionId}']`).css('font-weight', 'bold');


	if (currentConvo == sessionId) {
		displayConvo(sessionId);
	}

})

socket.on('newCustomer', function(sessionId, name) {
	audioConnect.play();

	var myNotification = new Notify("Nouveau client, " + name, {
		body: "",
		notifyShow: onNotifyShow
	}).show();

	console.log("connnect / reconect");
	console.log(sessionId);
	console.log(name);

	if (messages[sessionId] == undefined) {
		messages[sessionId] = [];
		$('.side_selector').append('<div class="convo" data-id="' + sessionId + '">\
            <p class="titleMessageList">' + name + '</p>\
            <p class="previewMessage"></p>\
            <div class="status"></div>\
        </div>');

		$('.convo').click(function() {
			displayConvo($(this).data('id'));
		});
	} else {
		console.log("reconnect");
		$(".side_selector").find(`[data-id='${sessionId}']`).children(".status").css('background', 'blue');
	}

	// messages[sessionId] = [];
	// $('.side_selector').append('<div class="convo" data-id="' + sessionId + '">\
	//     <p class="titleMessageList">' + name + '</p>\
	//     <p class="previewMessage"></p>\
	// </div>');
	//
	// $('.convo').click(function () {displayConvo($(this).data('id'));});
})

socket.on('connectedCustomer', function(users) {
	audioConnect.play();
	for (user of users) {
		if (messages[user.sessionId] == undefined) {
			messages[user.sessionId] = [];
			$('.side_selector').append('<div class="convo" data-id="' + user.sessionId + '">\
                <p class="titleMessageList">' + user.name + '</p>\
                <p class="previewMessage"></p>\
                <div class="status"></div>\
            </div>');

			$('.convo').click(function() {
				displayConvo($(this).data('id'));
			});
		}

	}
});



socket.on('dispMessage', function(sessionId, exp, mess) {
	console.log("dispMessage");
	messages[sessionId].push({
		"m": mess,
		"exp": exp
	})
	displayConvo(sessionId);
});


socket.on('disconnectCustomer', function(sessionId) {
	audioDisconnect.play();
	$(".side_selector").find(`[data-id='${sessionId}']`).children(".status").css('background', 'grey');
});


socket.on('clientIsTyping', function(sessionId, state) {
	// if (currentConvo == sessionId) {
	// 	displayConvo(sessionId);
	// }

	if (state && currentConvo == sessionId) {
		console.log(sessionId + ' is typing');
		$('.messages-content').append('<div class="message loading new"><span></span></div>');

	} else {
		console.log(sessionId + ' is leave typing');
		$(".loading").remove();
	}
});

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
	audioSubmit.play();
	var message = $('.message-input').val();

	while (message[0] == "\n" || message[0] == " ") {
		message = message.slice(1);
	}

	if (message != "") {
		console.log(message);
		socket.emit('message', currentConvo, message);
		// $('.messages-content').append('<div class="message message-personal new">' + message + '</div>');
	}
	$('.message-input').css("height", "21px");
	$('.messages').css("height", "calc(100% - 21px  - 70px)");
	$('.message-input').val("");
}

function displayConvo(idToRestore) {

	currentConvo = idToRestore;

	$(".side_selector").find(`[data-id='${idToRestore}']`).css('font-weight', 'normal');

	$(".chat-title").children("h1").text($(".side_selector").find(`[data-id='${idToRestore}']`).children(".titleMessageList").text());

	$('.messages-content').empty();
	console.log('click');
	console.log(idToRestore);

	var data = messages[idToRestore];

	for (message of data) {
		// console.log(message["m"].replace('\n', '<br>'));
		if (message["exp"]) {
			$('.messages-content').append('<div class="message message-personal new">' + message["m"].replace(/\n/g, '<br />') + '</div>');
		} else {
			$('.messages-content').append('<div class="message new">' + message["m"].replace(/\n/g, '<br />') + '</div>');
		}
	}

	$('.messages').scrollTop($('.messages')[0].scrollHeight);
};