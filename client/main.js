import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Players = new Mongo.Collection('players');

Template.table.helpers({
	'player': function(){
		return Players.find();
	}
});

Template.insertPlayer.helpers({
	'lessthanFourPlayers': function(){
		if(Players.find().count()==4){
			return false;
		} else {
			return true;
		}
	}
});

Template.roll.helpers({
	'enoughPlayers': function(){
		if(Players.find().count()==4){
			return true;
		} else {
			return false;
		}
	}
});

Template.roll.events({

	'click #remove': function(event){
		var playerId = this._id;
		Players.remove({_id:playerId});
	},
	

	'click #roll': function(event){

		//array of players' Id
		var playersArray = Players.find({}, {_id:1}).map(function(item){ return item._id; });
		
		var playerId=this._id;

		Session.set('selectedPlayer', playerId)
		
		//generate random number
		var num = (Math.floor(Math.random() * (6 - 1 + 1)) + 1);
		
		//scores array 
		var scoresArray = Players.find({}, {_id:1}).map(function(item){ return item.score; });

		//update score
		Players.update({ _id: playerId},
			{$inc: {score: num}});
		
		if (num==1){
			var msg="Move " + num + " step forward";
		} else {
			var msg="Move " + num + " steps forward";
		}

		//update message
		Players.update({ _id: playerId}, 
			{$set: {msg: msg, msg2:"", msg3:"" }});

		//getting the next player's Id
		var i = 0;
		while (playerId!=playersArray[i]) {
			if (i==3){
				i=0;
			} else {
				i+=1;
			}
		};

		if (i==3){
			i=-1;
		};

		var nextPlayer = playersArray[i+1];

		//updating the turn and roll buttons
		for (i=0; i<playersArray.length; i++){
			if (playersArray[i]!=nextPlayer){
				$('.' + playersArray[i]).prop('disabled',true);
				Players.update({ _id: playersArray[i]},
					{$set: {turn: "N" }});
			} 
			$('.' + nextPlayer).prop('disabled', false);
			Players.update({ _id: nextPlayer},
				{$set: {turn: "Your Turn" }});

		}

		//Snake
		if ((this.score+num)%6==0 && this.score>=7){
			Players.update({ _id: playerId},
				{$inc: {score: -7 }});
			Players.update({_id: playerId},
				{$set: {msg2: "Snake! Move 7 steps back"}})
		}

		//Ladder
		if ((this.score+num)%13==0){
			Players.update({ _id: playerId},
				{$inc: {score: 10 }});
			Players.update({_id: playerId},
				{$set: {msg2: "Ladder! Move 10 steps forward"}})
		}

		var finalScore = Players.find({_id:playerId}).fetch()[0].score;

		//if 2 players have the same score
		if(scoresArray.indexOf(finalScore)!= -1){
			Players.update({_id: playerId},
				{$set: {msg3: "Oh no same grid as the other player! Return to the start!"}});
			Players.update({ _id: playerId},
				{$set: {score: 0 }});
		}

		//Winner
		if (finalScore>=100){
			for (i=0; i<playersArray.length; i++){
				$('.' + playersArray[i]).prop('disabled',true);
				Players.update({_id: playersArray[i]}, {$set: {turn: "", msg:"", msg2:"", msg3:""}})
				if(playersArray[i]==playerId) {
					Players.update({ _id: playerId},
						{$set: {score: 100, turn:"You won!" }})
				};
			} alert(this.name + " won!");
		}
	}
});

Template.reset.events({
	'click #reset': function(event){

		var playersArray = Players.find({}, {_id:1}).map(function(item){ return item._id; });

		for (i=0; i<playersArray.length; i++){
			Players.update({ _id: playersArray[i]},
				{$set: {score: 0 , turn:"", msg:"", msg2:"", msg3:""}});
			$('.' + playersArray[i]).prop('disabled',false);
		}
	}
});

Template.insertPlayer.events({
	
	'submit form': function(event){
		event.preventDefault();
		var PlayerName = event.target.PlayerName.value;
		Players.insert({
			name: PlayerName,
			score: 0,
			turn: "",
			msg: "",
			msg2: "",
			msg3: "",
		});

		event.target.PlayerName.value="";
	}
});

// Template.hello.helpers({
// 	counter() {
// 		return Template.instance().counter.get();
// 	},
// });

// Template.hello.events({
// 	'click button'(event, instance) {
//     // increment the counter when button is clicked
//     instance.counter.set(instance.counter.get() + 1);
// },
// });
