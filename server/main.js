import { Meteor } from 'meteor/meteor';

Players = new Mongo.Collection('players');

Meteor.startup(() => {
  // code to run on server at startup
});
