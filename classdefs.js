//THIS FILE IS NOT BEING USED RIGHT NOW AND MAY CONTAIN OUTDATED CODE. UPDATE IN SLA.JS

/****************
Class Definitions
****************/
function Player(tier = 0) {
	this.name = newname();
	//Rebalance TODO
	this.strength = 10 + ((2*(tier+1)) * (Math.random() - 0.5)) + (1.5*(tier+1)); 
	this.strengthGrowth = 0.75 + (Math.random()*0.75*(tier+1)) + season;
	this.skill = 10 + ((2*(tier+1)) * (Math.random() - 0.5)) + (1.5*(tier+1));
	this.skillGrowth = 0.75 + (Math.random()*0.75*(tier+1)) + season;
	this.charisma = 10 + ((2*(tier+1)) * (Math.random() - 0.5)) + (1.5*(tier+1));
	this.charismaGrowth = 0.75 + (Math.random()*0.75*(tier+1)) + season;
	this.endurance = 10 + ((2*(tier+1)) * (Math.random() - 0.5)) + (1.5*(tier+1));
	this.enduranceGrowth = 0.75 + (Math.random()*0.75*(tier+1)) + season;
	this.clutch = 10 + ((2*(tier+1)) * (Math.random() - 0.5)) + (1.5*(tier+1));
	this.clutchGrowth = 0.75 + (Math.random()*0.75*(tier+1)) + season;
	this.age = 18;
	this.team = undefined;
	this.salary = 0; //pay per game
	this.contract = 0; //How many seasons left before can be bought again.
	this.popularity = 0;
	this.level = 0;
	this.points = 0;
	this.experience = 0;
	this.injured = 0; //weeks of injury
	this.tier = tier;
}

Player.prototype.addExperience = function (exp) {
	this.experience += exp;
	while (this.experience >= Math.floor(5*Math.pow(1.2,this.level))){ //REBALANCE TODO
		this.experience -= Math.floor(5*Math.pow(1.2, this.level));
		this.levelUp();
	}
}

Player.prototype.levelUp = function () {
	this.level++;
	this.points += 5; //REBALANCE TODO
	this.strength += this.strengthGrowth + this.team.trainers*trainerStrGive;
	this.skill += this.skillGrowth + this.team.coaches*coachSklGive;
	this.charisma += this.charismaGrowth;
	this.endurance += this.enduranceGrowth + this.team.trainers*trainerEndGive;
	this.clutch += this.clutchGrowth + this.team.coaches*coachCltGive;
}

Player.prototype.assignPoint = function (stat) {
	if (this.points > 0){
		this[stat] += 1;
		this.points--;
	}
	updateRosterUI();
}

function Team() {
	this.roster = [];
	this.name = newteamname();
	this.elo = 2000;
	this.league = 0;
	this.substitutes = [];
	this.schedule = [];
	this.trainers = 0;
	this.coaches = 0;
	this.managers = [];
	this.titles = [];
	this.money = 0;
	this.wins = 0;
	this.loss = 0;
	this.pointsFor = 0;
	this.pointsAgainst = 0;
	this.maxSubs = 2; //Will start at 0 (?) and be altered by managers TODO
	this.sponsors = 0;
}

Team.prototype.buyTrainer = function () {
	var trainerCost = trainerBaseCost*Math.pow(trainerGrowth, this.trainers);
	if (this.money >= trainerCost){
		this.money -= trainerCost;
		this.trainers++;
	}
	updateRosterUI();
	updateSummaryUI();
}

Team.prototype.buyCoach = function () {
	var coachCost = coachBaseCost*Math.pow(coachGrowth, this.coaches);
	if (this.money >= coachCost){
		this.money -= coachCost;
		this.coaches++;
	}
	updateRosterUI();
	updateSummaryUI();
}

function League() {
	this.teams = [];
	this.sortedTeams = []
	this.games = [];
	this.todemote = 0;
	this.topromote = 0;
	this.playoffs = 0;
	this.name = "";
	this.playoffBracket = new Bracket();
	this.playoffType;
}

function Game() {
	this.team1 = 0;
	this.team2 = 0;
	this.team1pos = 0;
	this.team2pos = 0;
	this.team1shots = 0;
	this.team2shots = 0;
	this.team1sog = 0;
	this.team2sog = 0;
	this.team1saves = 0;
	this.team2saves = 0;
	this.team1points = 0;
	this.team2points = 0;
	this.played = false;
	this.winner = 0;
	this.loser = 0;
}

function Bracket() {
	this.matches = [];
	this.matchTier = []; //will be used for display purposes?
	this.advancesTo = []; //will be used to place the winner of a match into the next match
	this.retreatsTo = []; //like advancesTo but for losers instead of winners
	this.teams = [];
	this.resultsRank = []; //[0] is first, [1] is second, ... , [length-1] is last place.
	this.playing = 0;
	this.over = false;
}

Bracket.prototype.getTop = function (n) {
	return this.resultsRank.splice(0,n);
}

Bracket.prototype.playNextGame = function() {
	var gameToPlay = this.matches[this.playing];
	if (gameToPlay === undefined){
		return; //No need to error out, we'll show ourselves the door
	}
	for (var j = 0; j < 4; j++){
		playQuarter(gameToPlay, j, gameToPlay.team1 == playerTeamCons || gameToPlay.team2 == playerTeamCons);
	}
	if (this.advancesTo[this.playing]){
		var nextMatch = this.matches[this.advancesTo[this.playing]];
		if (nextMatch.team1){
			nextMatch.team2 = gameToPlay.winner;
		} else {
			nextMatch.team1 = gameToPlay.winner;
		}
	}
	if (this.retreatsTo[this.playing]){
		var nextMatch = this.matches[this.retreatsTo[this.playing]];
		if (nextMatch.team1){
			nextMatch.team2 = gameToPlay.loser;
		} else {
			nextMatch.team1 = gameToPlay.loser;
		}
	}
	this.updateResultsRank();
	this.playing++;
	updateUI();
}

Bracket.prototype.playAllGames = function () {
	for (var i = 0; i < this.matches.length; i++){
		this.playNextGame();
	}
}

Bracket.prototype.updateResultsRank = function () {
	
}