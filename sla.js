/****************
Class Definitions
****************/
function Player(tier) {
	tier = tier || 0;
	this.name = newname();
	var A = 1.35; var B = 1.35; var C = 2; var s1 = 10.5*Math.pow(A, tier); var s2 = C*Math.pow(B, tier); var D = -s2/2; //Bal
	var strengthBase = s1 + (Math.random()*s2 + D);
	var skillBase = s1 + (Math.random()*s2 + D);
	var charismaBase = s1 + (Math.random()*s2 + D);
	var enduranceBase = s1 + (Math.random()*s2 + D);
	var clutchBase = s1 + (Math.random()*s2 + D);
	this.strength = strengthBase; 
	this.strengthGrowth = (Math.random()*0.1 + 0.05 + season*(Math.random()*0.02 + 0.02))*strengthBase;
	this.skill = skillBase;
	this.skillGrowth = (Math.random()*0.1 + 0.05 + season*(Math.random()*0.02 + 0.02))*skillBase;
	this.charisma = charismaBase;
	this.charismaGrowth = (Math.random()*0.1 + 0.05 + season*(Math.random()*0.02 + 0.02))*charismaBase;
	this.endurance = enduranceBase;
	this.enduranceGrowth = (Math.random()*0.1 + 0.05 + season*(Math.random()*0.02 + 0.02))*enduranceBase;
	this.clutch = clutchBase;
	this.clutchGrowth = (Math.random()*0.1 + 0.05 + season*(Math.random()*0.02 + 0.02))*clutchBase;
	this.team = undefined;
	this.salary = 1; //pay per game
	this.contract = 0; //How many seasons left before can be bought again.
	this.level = 0;
	this.points = 0;
	this.experience = 0;
	this.tier = tier;
	this.calculateAskingPrice();
	this.lastOfferMadeOn = [-1, -1]; //To prevent the player from offering multiple contracts per turn (gaming the chance portion of it)
}

Player.prototype.addExperience = function (exp) {
	this.experience += exp;
	while (this.experience >= Math.floor(10*Math.pow(1.2,this.level))){ //Bal
		this.experience -= Math.floor(10*Math.pow(1.2, this.level));
		this.levelUp();
	}
}

Player.prototype.levelUp = function () {
	this.level++;
	this.points += 2; //Bal
	this.strength += this.strengthGrowth + this.team.trainers*(trainerStrGive + managerCons[2].level*managerCons[2].bonus);
	this.skill += this.skillGrowth + this.team.coaches*(coachSklGive + managerCons[3].level*managerCons[3].bonus);
	this.charisma += this.charismaGrowth + managerCons[4].level*managerCons[4].bonus + managerCons[5].level*managerCons[5].bonus;
	this.endurance += this.enduranceGrowth + this.team.trainers*(trainerEndGive + managerCons[2].level*managerCons[2].bonus);
	this.clutch += this.clutchGrowth + this.team.coaches*(coachCltGive + managerCons[3].level*managerCons[3].bonus);
	this.calculateAskingPrice();
	if (this.team === playerTeamCons) {
		playerLeveled = true;
	}
}

Player.prototype.assignPoint = function (stat) {
	if (this.points > 0){
		this[stat] += 1;
		this.points--;
	}
	updateRosterUI();
}

Player.prototype.decideOffer = function (offer, length, team) {
	length = length || 0;
	if (team === playerTeamCons){
		if (season == this.lastOfferMadeOn[0] && currentGame == this.lastOfferMadeOn[1]){
			if (team === playerTeamCons){
				pushHeadline(this.name + " declined because you already made an offer this turn.");
			}
			return false;
		} else {
			this.lastOfferMadeOn[0] = season;
			this.lastOfferMadeOn[1] = currentGame;
		}
	}
	if (this.contract > 0 && this.team !== team && this.team.money > 0){
		//A player under contract cannot leave for a new team
		//UNLESS the current team is in debt
		if (team === playerTeamCons){
			pushHeadline(this.name + " declined due to contractual obligations.");
		}
		return false;
	}
	if (this.team === team && offer > this.salary && length <= this.contract){
		//Automatically accept
		this.salary = offer;
		this.contract = length;
		updateRosterUI();
		updateSummaryUI();
		if (team === playerTeamCons){
			pushHeadline(this.name + " accepted the new offer.");
		}
		return true;
	}
	var offerPercent = offer / Math.max(this.askingPrice, this.salary);
	var relPercent = offerPercent - (length * 0.05);
	relPercent = relPercent - ((leagues.indexOf(team.league) - this.tier) * 0.05);
	if ((Math.random() * 0.2 + 0.9) < relPercent){
		//accept the offer
		if (this.team !== team){
			var found = false;
			for (var i = 0; i < team.maxSubs; i++){
				if (!team.substitutes[i]){
					team.substitutes[i] = this;
					recruits[this.tier].splice(recruits[this.tier].indexOf(this), 1);
					found = true;
					break;
				}
			}
			if (!found){
				pushHeadline(this.name + " declined because you don't have the resources.");
				return false; //No space on your team, brah
			}
			//We also need to tell the original team that it lost a player... TODO
		}
		this.salary = offer;
		this.contract = length;
		this.team = team;
		updateRosterUI();
		updateSummaryUI();
		updateRecruitUI();
		if (team === playerTeamCons){
			pushHeadline(this.name + " accepted the offer.");
		}
		return true;
	} else {
		console.log("decline because not a good enough offer " + relPercent);
		if (team === playerTeamCons){
			pushHeadline(this.name + " decline because the offer wasn't good enough");
		}
		return false;
	}
}

Player.prototype.calculateAskingPrice = function () {
	var price = this.tier * 5;
	price += Math.log(this.strength)/Math.log(10); //Bal
	price += Math.log(this.skill)/Math.log(10);
	price += Math.log(this.charisma)/Math.log(10);
	price += Math.log(this.endurance)/Math.log(10);
	price += Math.log(this.clutch)/Math.log(10);
	price *= (Math.random() * 0.2) + 0.9 //range{0.9 - 1.1}
	this.askingPrice = Math.floor(price);
}

function Team() {
	this.roster = [];
	this.name = newteamname();
	this.league = 0;
	this.substitutes = [];
	this.schedule = [];
	this.trainers = 0;
	this.coaches = 0;
	this.managers = [];
	this.money = 0;
	this.wins = 0;
	this.loss = 0;
	this.pointsFor = 0;
	this.pointsAgainst = 0;
	this.maxSubs = 0;
	this.sponsors = 0;
}

Team.prototype.buyTrainer = function () {
	var trainerCost = trainerBaseCost*Math.pow(trainerGrowth, this.trainers);
	if (this.money >= trainerCost){
		this.money -= trainerCost;
		this.trainers++;
		if (this === playerTeamCons){
			listeners.forEach(function (cv, ind, arr) {
				cv.notify("trainer");
			});
		}
	}
	updateRosterUI();
	updateSummaryUI();
}

Team.prototype.buyCoach = function () {
	var coachCost = coachBaseCost*Math.pow(coachGrowth, this.coaches);
	if (this.money >= coachCost){
		this.money -= coachCost;
		this.coaches++;
		if (this === playerTeamCons){
			listeners.forEach(function (cv, ind, arr) {
				cv.notify("coach");
			});
		}
	}
	updateRosterUI();
	updateSummaryUI();
}

Team.prototype.earnMoney = function (money) {
	this.money += money;
	if (this === playerTeamCons && money > 0){
		allTime.money += money;
		notifyAll("money");
	}
}

Team.prototype.addSponsor = function (sponsor, percent) {
	percent = percent || false;
	if (!percent) {
		this.sponsors += sponsor;
	} else {
		this.sponsors *= 1+sponsor;
	}
	if (this.sponsors < 0){
		this.sponsors = 0;
	}
}

Team.prototype.updateMoney = function (delta) {
	delta = delta || 0;
	var salaries = 0;
	for (var i = 0; i < this.roster.length; i++){
		salaries += parseInt(this.roster[i].salary);
	}
	for (var i = 0; i < this.substitutes.length; i++){
		if (this.substitutes[i]){
			salaries += parseInt(this.substitutes[i].salary);
		}
	}
	this.earnMoney(delta+this.sponsors-salaries);
}

Team.prototype.firePlayer = function (index) {
	if (this.substitutes[index]){
		recruits[this.substitutes[index].tier].push(this.substitutes[index]);
		this.substitutes[index] = undefined;
		updateRosterUI();
		updateRecruitUI();
	}
}

function League() {
	this.teams = [];
	this.sortedTeams = []
	this.todemote = 0;
	this.topromote = 0;
	this.playoffs = 0;
	this.name = "";
	this.playoffBracket;
	this.playoffType;
	this.payPerGame = 0;
	this.seasonSetup = [1, 20]; //Play at least [0] games against each team, and then games against random teams until you have [1] games in your schedule
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
	this.ots = 0; //Overtimes
	this.scores = [{1: 0, 2: 0}, {1: 0, 2: 0}, {1: 0, 2: 0}, {1: 0, 2: 0}];
}

function Match(bestOf) {
	this.team1 = 0;
	this.team2 = 0;
	this.winner = 0;
	this.loser = 0;
	this.bestOf = bestOf;
	this.games = [];
	this.team1wins = 0;
	this.team2wins = 0;
	this.played = false;
}

Match.prototype.getNextGame = function () {
	if (this.team1wins >= Math.ceil(this.bestOf/2)){
		this.played = true;
		this.winner = this.team1;
		this.loser = this.team2;
		return false;
	}
	if (this.team2wins >= Math.ceil(this.bestOf/2)){
		this.played = true;
		this.winner = this.team2;
		this.loser = this.team1;
		return false;
	}
	if (this.games.length > 0 && !this.games[this.games.length-1].played){
		return this.games[this.games.length-1];
	}
	var game = new Game();
	game.team1 = this.team1;
	game.team2 = this.team2;
	this.games.push(game);
	return game;
}

Match.prototype.updateWins = function (game) {
	if (this.games.indexOf(game) >= 0){
		if (game.played){
			if (game.winner === game.team1){
				this.team1wins++;
			} else {
				this.team2wins++;
			}
			if (this.team1wins >= Math.ceil(this.bestOf/2)){
				this.winner = this.team1;
				this.loser = this.team2;
				this.played = true;
			}
			if (this.team2wins >= Math.ceil(this.bestOf/2)){
				this.winner = this.team2;
				this.loser = this.team1;
				this.played = true;
			}
		} //We could actually update this function to add the next game to make the UI a bit more intuitive when displaying Matches TODO
	}
}

function Bracket(l, h) {
	l = l || 0;
	h = h || 0;
	this.matches = [];
	this.matchTier = []; //will be used for display purposes?
	this.advancesTo = []; //will be used to place the winner of a match into the next match
	this.retreatsTo = []; //like advancesTo but for losers instead of winners
	this.teams = [];
	this.resultsRank = []; //[0] is first, [1] is second, ... , [length-1] is last place.
	this.playing = 0;
	this.over = false;
	this.description = "";
	this.display = [];
	this.dispClasses = [];
	this.dispFill = [];
	this.dispLength = l;
	this.dispHeight = h;
	for (var i = 0; i < this.dispHeight; i++){
		this.display.push([]);
		this.dispClasses.push([]);
		this.dispFill.push([]);
		for (var j = 0; j < this.dispLength; j++){
			this.display[i].push([]);
			this.dispClasses.push([]);
			this.dispFill.push([]);
		}
	}
}

Bracket.prototype.getTop = function (n) {
	return this.resultsRank.splice(0,n);
}

Bracket.prototype.playNextGame = function() {
	var nextGame = this.matches[this.playing];
	var gameToPlay;
	if (nextGame === undefined){
		return false;
	}
	if (nextGame instanceof Match){
		gameToPlay = nextGame.getNextGame();
		if (!gameToPlay){
			return false;
		}
	} else {
		gameToPlay = nextGame;
	}
	if (gameToPlay.team1 === playerTeamCons || gameToPlay.team2 === playerTeamCons){
		playPlayerGame(gameToPlay);
	} else {
		playSingleGame(gameToPlay);
		this.finishNextGame();
	}
	return true;
}

Bracket.prototype.finishNextGame = function () {
	var nextGame = this.matches[this.playing];
	var gameToPlay;
	if (nextGame === undefined){
		return false;
	}
	if (nextGame instanceof Match){
		gameToPlay = nextGame.games[nextGame.games.length-1];
		nextGame.updateWins(gameToPlay);
	} else {
		gameToPlay = nextGame;
	}
	if (nextGame.played){
		if (this.advancesTo[this.playing]){
			var nextMatch = this.matches[this.advancesTo[this.playing]];
			if (nextMatch.team1){
				nextMatch.team2 = nextGame.winner;
			} else {
				nextMatch.team1 = nextGame.winner;
			}
		}
		if (this.retreatsTo[this.playing]){
			var nextMatch = this.matches[this.retreatsTo[this.playing]];
			if (nextMatch.team1){
				nextMatch.team2 = nextGame.loser;
			} else {
				nextMatch.team1 = nextGame.loser;
			}
		}
		this.updateResultsRank();
		this.playing++;
	}
	updateUI();
	return true;
}

Bracket.prototype.playAllGames = function () {
	while (this.playNextGame()){}
}

Bracket.prototype.updateResultsRank = function () {
	//Defined in inheriting classes
}

Bracket.prototype.updateDisplay = function (parentEl) {
	for (var i = 0; i < this.dispHeight; i++){
		var rowEl = document.createElement("tr");
		if (!this.display[i]){
			parentEl.appendChild(rowEl);
			continue;
		}
		for (var j = 0; j < this.dispLength; j++){
			var dimEl = document.createElement("td");
			if (!this.display[i][j]){
				rowEl.appendChild(dimEl);
				continue;
			}
			dimEl.innerHTML = this.display[i][j];
			if (this.dispClasses[i] && this.dispClasses[i][j]){
				dimEl.className = this.dispClasses[i][j];
			}
			if (this.dispFill[i] && this.dispFill[i][j]){
				var re = /m(\d+)\./g;
				var result = re.exec(this.dispFill[i][j]);
				if (result != null) {
					var matchInd = result[1];
					if (this.matches[matchInd]) {
						var regex = /t(\d+)\./g;
						var nresult = regex.exec(this.dispFill[i][j]);
						if (nresult != null){
							if (nresult[1] == 1){
								dimEl.innerHTML += (this.matches[matchInd].team1.name ? this.matches[matchInd].team1.name : "TBD");
							}
							if (nresult[1] == 2){
								dimEl.innerHTML += (this.matches[matchInd].team2.name ? this.matches[matchInd].team2.name : "TBD");
							}
						} else {
							regex = /s(\d+)\./g;
							nresult = regex.exec(this.dispFill[i][j]);
							if (nresult != null){
								if (nresult[1] == 1){
									if (this.matches[matchInd] instanceof Match) {
										dimEl.innerHTML += this.matches[matchInd].team1wins;
									} else {
										dimEl.innerHTML += this.matches[matchInd].team1points;
									}
								}
								if (nresult[1] == 2){
									if (this.matches[matchInd] instanceof Match) {
										dimEl.innerHTML += this.matches[matchInd].team2wins;
									} else {
										dimEl.innerHTML += this.matches[matchInd].team2points;
									}
								}
							}
						}
					}
				}
			}
			rowEl.appendChild(dimEl);
		}
		parentEl.appendChild(rowEl);
	}
}

/**********************
Constant Initialization
**********************/
var state = "pre-reg"; //"reg", "pre-po", "po", "pre-promo", "promo", "pre-reg"
var positions = ["Striker", "Forward", "Forward", "Mid-Fielder", "Mid-Fielder", "Defender", "Defender", "Keeper"];
var pos = ["stri", "for1", "for2", "mid1", "mid2", "def1", "def2", "keep"];
var stat = ["str", "skl", "end", "chr", "clt"];
var statNames = ["strength", "skill", "endurance", "charisma", "clutch"];
var leagues = [];
var numLeagues = 26;
var promotions = [];
var promotionTypes = [];
var currentLeague = 0;
var playerTeamCons = 0;
var highestTier = 0;
var currentGame = 0;
var promote = true; //If true, your team is being promoted, if false, your team is being demoted
var playerTeam;
var recruits = [];
var season = 0;
var titles = [];
var achievements = [];
var playerLeveled = false;
var version = 0;

var trainerBaseCost = 150; //Bal
var trainerGrowth = 2;
var trainerStrGive = 2;
var trainerEndGive = 2;
var coachBaseCost = 150;
var coachGrowth = 2;
var coachSklGive = 2;
var coachCltGive = 2;

var listeners = [];
var managerCons = [];
var news = [];
var dispNews = new Array(20);

var intervalTick = 0;
var m_interval;
var allTime = {
	wins: 0,
	loss: 0,
	pointsFor: 0,
	pointsAgainst: 0,
	highestLeague: 0,
	money: 0
};

/******
On Load
******/
function onload() {
	//Finish Constant Initialization
	makeManagers();
	makeAchievements();
	
	createLeagues();
	createRecruits();
	
	nextSeason();
	
	//Assign Button Click Actions
	var nextGameEl = document.getElementById("next-game");
	nextGameEl.addEventListener("click", playNextGame);
	
	var nextSeasonEl = document.getElementById("next-season");
	nextSeasonEl.addEventListener("click", nextSeason);
	
	var startPlayoffsEl = document.getElementById("start-playoffs");
	startPlayoffsEl.addEventListener("click", playPlayoffs);
	
	var startPromosEl = document.getElementById("start-promos");
	startPromosEl.addEventListener("click", playPromotions);
	
	nextGameEl = document.getElementById("playoff-game");
	nextGameEl.addEventListener("click", playNextGame);
	
	nextSeasonEl = document.getElementById("playoff-next-season");
	nextSeasonEl.addEventListener("click", nextSeason);
	
	startPlayoffsEl = document.getElementById("playoff-start-playoffs");
	startPlayoffsEl.addEventListener("click", playPlayoffs);
	
	startPromosEl = document.getElementById("playoff-start-promos");
	startPromosEl.addEventListener("click", playPromotions);
	
	nextGameEl = document.getElementById("promo-game");
	nextGameEl.addEventListener("click", playNextGame);
	
	nextSeasonEl = document.getElementById("promo-next-season");
	nextSeasonEl.addEventListener("click", nextSeason);
	
	startPlayoffsEl = document.getElementById("promo-start-playoffs");
	startPlayoffsEl.addEventListener("click", playPlayoffs);
	
	startPromosEl = document.getElementById("promo-start-promos");
	startPromosEl.addEventListener("click", playPromotions);
	
	for (var i = 0; i < pos.length; i++){
		for (var j = 0; j < stat.length; j++){
			var buttonEl = document.getElementById(pos[i]+"-"+stat[j]+"-but");
			(function (_i, _j) {
				buttonEl.onClick = function () {
					playerTeamCons.roster[_i].assignPoint(statNames[_j]);
				};
			})(i, j);
		}
	}
	
	var trainerBuyEl = document.getElementById("trainer-buy");
	trainerBuyEl.addEventListener("click", function () { playerTeamCons.buyTrainer(); });
	
	var coachBuyEl = document.getElementById("coach-buy");
	coachBuyEl.addEventListener("click", function () { playerTeamCons.buyCoach(); });
	
	var nameChangeEl = document.getElementById("team-name-change");
	nameChangeEl.addEventListener("keydown", function (e) {
		if (!e) {
			var e = window.event;
		}
		if (e.keyCode == 13) { //Thirteen is Enter, or so the Internet tells me.
			e.preventDefault();
			nameChange();
			this.value = "";
		}
	});
	
	var gameSkipEl = document.getElementById("sched-skip-game");
	gameSkipEl.addEventListener("click", skipToEndOfGame);
	
	gameSkipEl = document.getElementById("po-skip-game");
	gameSkipEl.addEventListener("click", skipToEndOfGame);
	gameSkipEl.style.display = "none";
	
	gameSkipEl = document.getElementById("promo-skip-game");
	gameSkipEl.addEventListener("click", skipToEndOfGame);
	gameSkipEl.style.display = "none";
	
	jss.set('.recruit-req', {'display': 'none'});
	jss.set('.contract-req', {'display': 'none'});
	
	//Show Everything
	updateUI();
}

/*******************
Game Logic Functions
*******************/
function playNextGame() {
	switch(state){
		case "reg":
			var league = leagues[currentLeague];
			var outsideGame;
			for (var i = 0; i < league.teams.length; i++){
				var gameToPlay = league.teams[i].schedule[currentGame];
				if (!gameToPlay.played){
					if (gameToPlay.team1 === playerTeamCons || gameToPlay.team2 === playerTeamCons){
						outsideGame = gameToPlay;
						continue;
					}
					playSingleGame(gameToPlay);
				}
			}
			playPlayerGame(outsideGame);
			currentGame++;
			break;
		case "po":
			leagues[currentLeague].playoffBracket.playNextGame();
			playoffEndCheck();
			updateUI();
			break;
		case "promo":
			if (promote){
				if (promotions[currentLeague]){
					promotions[currentLeague].playNextGame();
				}
			} else {
				if (promotions[currentLeague-1]){
					promotions[currentLeague-1].playNextGame();
				}
			}
			promoEndCheck();
			updateUI();
			break;
		case "pre-po":
		case "pre-promo":
		case "pre-reg":
		default:
			console.log("Warning: playNextGame() does nothing for state: " + state);
			break;
	}
}

function sortAllTeams(){
	for (var i = 0; i < numLeagues; i++){
		leagues[i].sortedTeams.sort(sortTeams);
	}
}

function playSingleGame(game){
	for (var i = 0; i < 4; i++){
		for (var j = 0; j < 60; j++){
			playTick(game, i+1); //need to pass in quarter for endurance reasons
		}
	}
	while (game.team1points == game.team2points){
		game.ots++;
		game.scores.push({1: 0, 2: 0});
		for (var j = 0; j < 40; j++){
			playTick(game, 4); //we'll pass in 4 so we can base all the calculations off quarter+ots
		}
	}
	if (game.team1points > game.team2points){
		game.winner = game.team1;
		game.loser = game.team2;
	} else {
		game.winner = game.team2;
		game.loser = game.team1;
	}
	finishGame(game);
}

function playPlayerGame(game){
	//This will require the use of setInterval
	intervalTick = 0;
	m_interval = setInterval(function () {
		var q = Math.min(4, Math.floor(intervalTick/60)+1);
		var i = intervalTick < 240 ? intervalTick % 60 : intervalTick % 40;
		playTick(game, q);
		updateGameUI(game, q, i);
		intervalTick++;
		if (intervalTick % 40 == 0 && intervalTick >= 240){
			if (game.team1points == game.team2points){
				game.ots++;
				game.scores.push({1: 0, 2: 0});
			} else {
				if (game.team1points > game.team2points){
					game.winner = game.team1;
					game.loser = game.team2;
				} else {
					game.winner = game.team2;
					game.loser = game.team1;
				}
				clearInterval(m_interval);
				m_interval = undefined;
				finishGame(game);
				updateGameUI(game, 4, (game.ots > 0 ? 40 : 60));
				if (state === "reg"){
					sortAllTeams();
					playoffCheck();
				}
				if (state === "po"){
					leagues[currentLeague].playoffBracket.finishNextGame();
					playoffEndCheck();
				}
				if (state === "promo"){
					if (promote) {
						promotions[currentLeague].finishNextGame();
					} else {
						promotions[currentLeague-1].finishNextGame();
					}
					promoEndCheck();
				}
				updateUI();
			}
		}
	}, 250);
}

function skipToEndOfGame(){
	if (m_interval){
		clearInterval(m_interval);
		m_interval = undefined;
		var game = playerTeamCons.schedule[currentGame-1];
		for (var i = intervalTick; i < 240; i++){
			playTick(game, Math.min(4, Math.floor(i/60)+1));
		}
		while (game.team1points == game.team2points){
			for (var i = 0; i < 40; i++){
				playTick(game, 4);
			}
		}
		if (game.team1points > game.team2points){
			game.winner = game.team1;
			game.loser = game.team2;
		} else {
			game.winner = game.team2;
			game.loser = game.team1;
		}
		finishGame(game);
		updateGameUI(game, 4, (game.ots > 0 ? 40 : 60));
		if (state === "reg"){
			sortAllTeams();
			playoffCheck();
		}
		if (state === "po"){
			leagues[currentLeague].playoffBracket.finishNextGame();
			playoffEndCheck();
		}
		if (state === "promo"){
			if (promote) {
				promotions[currentLeague].finishNextGame();
			} else {
				promotions[currentLeague-1].finishNextGame();
			}
			promoEndCheck();
		}
		updateUI();
		
	} else {
		console.log("game is not in progress");
	}
}

function finishGame(game){
	game.played = true;
	game.team1.pointsFor += game.team1points;
	game.team1.pointsAgainst += game.team2points;
	game.team2.pointsFor += game.team2points;
	game.team2.pointsAgainst += game.team1points;
	if (game.team1 === playerTeamCons){
		allTime.pointsFor += game.team1points;
		allTime.pointsAgainst += game.team2points;
	}
	if (game.team2 === playerTeamCons){
		allTime.pointsFor += game.team2points;
		allTime.pointsAgainst += game.team1points;
	}
	if (game.winner === playerTeamCons){
		allTime.wins++;
		notifyAll("gamewin");
	} else if (game.loser === playerTeamCons){
		allTime.loss++;
		notifyAll("gamelose");
	}
	game.winner.wins++;
	game.loser.loss++;
	var charismaBonus = 0;
	for (var i = 0; i < game.team1.roster.length; i++){
		game.team1.roster[i].addExperience(4); //Bal
		game.team2.roster[i].addExperience(4);
		charismaBonus += game.team1.roster[i].charisma;
		charismaBonus += game.team2.roster[i].charisma;
	}
	for (var i = 0; i < game.team1.substitutes.length; i++){
		if (game.team1.substitutes[i]){
			game.team1.substitutes[i].addExperience(4); //Bal (sub get percent of total?)
			charismaBonus += game.team1.substitutes[i].charisma;
		}
	}
	for (var i = 0; i < game.team2.substitutes.length; i++){
		if (game.team2.substitutes[i]){
			game.team2.substitutes[i].addExperience(4);
			charismaBonus += game.team2.substitutes[i].charisma;
		}
	}
	charismaBonus = 0.02*Math.log(charismaBonus)/Math.log(1.1); //Bal
	game.team1.updateMoney(game.team1.league.payPerGame + charismaBonus);
	game.team2.updateMoney(game.team2.league.payPerGame + charismaBonus);
	var A = 1.15; var B = 20; var C = 1; //Bal
	var ind = leagues.indexOf(game.team1.league);
	var genspon = B*(ind+1)*Math.pow(A,ind);
	if (game.winner === playerTeamCons){
		var yGenspon = genspon;
		if (playerTeamCons.managers.indexOf(managerCons[6]) >= 0 && managerCons[6].level > 0){
			yGenspon *= managerCons[6].level;
			if (Math.random() > Math.min((playerTeamCons.sponsors / yGenspon)*C), 0.99){
				var newSponsor = (Math.random()*0.03 + 0.005)*yGenspon;
				playerTeamCons.addSponsor(newSponsor);
				pushHeadline("You've been sponsored for " + formatMoney(newSponsor) + " per game!");
			}
		}
	} else {
		if (Math.random() > (game.winner.sponsors / genspon)*C){
			game.winner.addSponsor((Math.random()*0.03 + 0.005)*genspon);
		}
	}
	if (game.loser === playerTeamCons){
		var yGenspon = genspon;
		if (playerTeamCons.managers.indexOf(managerCons[6]) >= 0 && managerCons[6].level > 0){
			yGenspon *= managerCons[6].level;
			if (Math.random() > (playerTeamCons.sponsors / yGenspon)*C){
				var newSponsor = (Math.random()*0.015 + 0.0025)*yGenspon;
				playerTeamCons.addSponsor(newSponsor);
				pushHeadline("You've been sponsored for " + formatMoney(newSponsor) + " per game!");
			}
		}
	} else {
		if (Math.random()/4 > (game.loser.sponsors / genspon)*C){
			game.loser.addSponsor((Math.random()*0.015 + 0.0025)*genspon);
		}
	}
}

function setupPlayoffs(){
	for (var i = 0; i < leagues.length; i++){
		var league = leagues[i];
		var playoffTeams = [];
		for (var j = 0; j < league.playoffs; j++) {
			playoffTeams.push(league.sortedTeams[j]);
		}
		league.playoffBracket = new league.playoffType (playoffTeams);
	}
}

function playPlayoffs(){
	//To play non-user league's playoffs
	if (state !== "pre-po"){
		console.log("Warning: playPlayoffs() does nothing for state: " + state);
		return;
	}
	state = "po";
	var tabEl = document.getElementById("tab-playoffs");
	tabEl.checked = true;
	for (var i = 0; i < leagues.length; i++){
		if (i === currentLeague){
			continue;
		}
		var league = leagues[i];
		league.playoffBracket.playAllGames();
	}
}

function setupPromotions(){
	for (var i = 0; i < leagues.length - 1; i++){
		var promoteLeague = leagues[i];
		var demoteLeague = leagues[i+1];
		var teams = [];
		var teamsToAdd = demoteLeague.sortedTeams.splice(demoteLeague.sortedTeams.length - demoteLeague.todemote, demoteLeague.todemote);
		for (var j = 0; j < demoteLeague.todemote; j++){
			var team = teamsToAdd[j];
			if (team === playerTeamCons){
				promote = false;
			}
			var ind = demoteLeague.teams.indexOf(team);
			demoteLeague.teams.splice(ind, 1);
			teams.push(team);
		}
		var prom = promoteLeague.playoffBracket.getTop(promoteLeague.topromote);
		for (var j = 0; j < prom.length; j++){
			var team = prom[j];
			if (team === playerTeamCons){
				promote = true;
			}
			var ind = promoteLeague.teams.indexOf(team);
			promoteLeague.teams.splice(ind, 1); //We don't have to remove from sortedTeams because that array will be rewritten after promos are over
			teams.push(team);
		}
		promotions[i] = new promotionTypes[i](teams);
	}
}

function playPromotions(){
	//To play non-user promotion/demotion
	if (state !== "pre-promo"){
		console.log("Warning: setupPromotions() does nothing for state: " + state);
		return;
	}
	state = "promo";
	var tabEl = document.getElementById('tab-promos');
	tabEl.checked = true;
	//There should only be 2 promotions we have to check TODO
	for (var i = 0; i < promotions.length; i++){
		var promo = promotions[i];
		var hasUser = false;
		for (var j = 0; j < promo.teams.length; j++){
			if (promo.teams[j] === playerTeamCons){
				hasUser = true;
			}
		}
		if (!hasUser) {
			promo.playAllGames();
		}
	}
	updatePromosUI();
}

function nextSeason() {
	if (state !== "pre-reg"){
		console.log("Warning: nextSeason() does nothing for state: " + state);
		return;
	}
	//Schedule creation (a.k.a. the ugliest fucking abomination I've ever written)
	for (var i = 0; i < leagues.length; i++){
		var league = leagues[i];
		
		for (var j = 0; j < league.teams.length; j++){
			league.teams[j].schedule = [];
			league.teams[j].wins = 0;
			league.teams[j].loss = 0;
			league.teams[j].pointsFor = 0;
			league.teams[j].pointsAgainst = 0;
		}

		for (var z = 0; z < league.seasonSetup[0]; z++) {
		var toPlayAgainst = [];
		for (var j = 0; j < league.teams.length; j++){
			toPlayAgainst.push([]);
			for (var k = 0; k < league.teams.length; k++){
				toPlayAgainst[j].push(j != k ? 1 : 0);
			}
		}
		var done = false;
		while (!done){
			playingThisRound = [];
			for (var j = 0; j < league.teams.length; j++){
				playingThisRound.push(1);
			}
			var offset = 1;
			for (var j = 0; j < playingThisRound.length; j++){
				if (playingThisRound[j] == 0){
					continue;
				}
				var t1 = j;
				var t2;
				var found = false;
				for (var k = (j+offset)%playingThisRound.length; k != (j+(offset-1))%playingThisRound.length; k = (k+1)%playingThisRound.length){
					if (playingThisRound[k] == 1 && toPlayAgainst[t1][k] == 1){
						t2 = k;
						found = true;
						break;
					}
				}
				if (found){
					toPlayAgainst[t1][t2] = 0;
					toPlayAgainst[t2][t1] = 0;
					var g = new Game();
					g.team1 = league.teams[t1];
					g.team2 = league.teams[t2];
					league.teams[t1].schedule.push(g);
					league.teams[t2].schedule.push(g);
					offset = 1;
					playingThisRound[t1] = 0;
					playingThisRound[t2] = 0;
				} else {
					j--;
					var g = league.teams[j].schedule[league.teams[j].schedule.length-1];
					var t1 = j;
					var t2 = league.teams.indexOf(g.team2);
					offset = (t1 < t2 ? (t2 - t1) + 1 : (t2 + playingThisRound.length - t1) + 1);
					playingThisRound[t1] = 1;
					playingThisRound[t2] = 1;
					toPlayAgainst[t1][t2] = 1;
					toPlayAgainst[t2][t1] = 1;
					j--;
				}
			}
			done = true;
			for (var m = 0; m < playingThisRound.length; m++){
				for (var n = 0; n <playingThisRound.length; n++){
					if (toPlayAgainst[m][n] == 1){
						done = false;
						break;
					}
				}
			}
		}
		
		} //Ending the z-loop
		
		while (league.teams[0].schedule.length < league.seasonSetup[1]){
			var teamsLeftToFace = [];
			for (var j = 0; j < league.teams.length; j++){
				teamsLeftToFace.push(league.teams[j]);
			}
			while (teamsLeftToFace.length > 0){
				var team1 = teamsLeftToFace.splice(Math.floor(Math.random() * teamsLeftToFace.length), 1)[0];
				var team2 = teamsLeftToFace.splice(Math.floor(Math.random() * teamsLeftToFace.length), 1)[0];
				var game = new Game();
				game.team1 = team1;
				game.team2 = team2;
				if (!team1 || !team2){
					console.log(league);
				}
				team1.schedule.push(game);
				team2.schedule.push(game);
			}
		}
		
	}
	
	state = "reg";
	if (season > 0){
		var tabEl = document.getElementById("tab-league");
		tabEl.checked = true;
	}
	currentGame = 0;
	season++;
	for (var i = 0; i < recruits.length; i++){
		for (var j = 0; j < recruits[i].length; j++){
			//Decide if this recruit should leave the pool or not
			if (Math.random() < 0.3){ //Bal
				recruits[i].splice(j, 1);
				j--;
			}
		}
		while (recruits[i].length < 5 || (Math.random() < 0.7 && recruits[i].length < 15)) { //Bal
			//Re=add to the recruit pool so it doesn't get to small.
			recruits[i].push(new Player(i));
		}
	}
	for (var i = 0; i < leagues.length; i++){
		for (var j = 0; j < leagues[i].teams.length; j++){
			for (var k = 0; k < leagues[i].teams[j].roster.length; k++){
				if (leagues[i].teams[j].roster[k].contract > 0){
					leagues[i].teams[j].roster[k].contract--;
				}
			}
			for (var k = 0; k < leagues[i].teams[j].maxSubs; k++){
				if (leagues[i].teams[j].substitutes[k]){
					if (leagues[i].teams[j].substitutes[k].contract > 0){
						leagues[i].teams[j].substitutes[k].contract--;
					}
				}
			}
		}
	}
	AITick();
	playSeason();
	updateUI();
}

function playSeason() {
	//To auto-play the leagues that the player isn't in.
	for (var i = 0; i < leagues.length; i++){
		if (i == currentLeague){
			continue;
		}
		var league = leagues[i];
		for (var j = 0; j < league.teams.length; j++){
			for (var k = 0; k < league.teams[j].schedule.length; k++){
				var game = league.teams[j].schedule[k];
				if (game.played == false){
					playSingleGame(game);
				}
			}
		}
		league.sortedTeams.sort(sortTeams);
	}
}

function finishPromos() {
	//Everybody in promos/demotes gets put into their new league.
	//Since teams were removed from their leagues before promos, we just have to add them back in now.
	for (var i = 0; i < promotions.length; i++){
		var prom = promotions[i];
		var goingUp = prom.getTop(leagues[i+1].todemote);
		var goingDown = prom.getTop(leagues[i].topromote);
		for (var j = 0; j < goingUp.length; j++){
			var team = goingUp[j];
			team.addSponsor(2*i);
			leagues[i+1].teams.push(team);
			team.league = leagues[i+1];
			if (team === playerTeamCons){
				currentLeague = i+1;
				if (currentLeague > highestTier){
					highestTier = currentLeague;
					allTime.highestLeague = currentLeague;
				}
				pushHeadline("You've won promoitons!");
				pushHeadline("You've gained a sponsorship for " + formatMoney(10*currentLeague) + " per game!");
				playerTeamCons.addSponsor(10*currentLeague); //Bal
			}
		}
		for (var j = 0; j < goingDown.length; j++){
			var team = goingDown[j];
			leagues[i].teams.push(team);
			team.league = leagues[i];
			if (team === playerTeamCons){
				currentLeague = i;
				pushHeadline("You've lost promotions.");
				pushHeadline("You've lost some sponsorships.");
				playerTeamCons.addSponsor(-0.03, true); //Bal
			}
		}
	}
	//Also reset sortedTeams
	for (var i = 0; i < leagues.length; i++){
		var league = leagues[i];
		league.sortedTeams = [];
		for (var j = 0; j < league.teams.length; j++){
			league.sortedTeams.push(league.teams[j]);
		}
	}
}

function playoffCheck() {
	if (currentGame >= leagues[currentLeague].teams[0].schedule.length){
		if (state === "reg"){
			state = "pre-po";
			setupPlayoffs();
			updatePlayoffUI();
		}
	}
}

function playoffEndCheck() {
	if (leagues[currentLeague].playoffBracket.playing >= leagues[currentLeague].playoffBracket.matches.length){
		state = "pre-promo";
		bracket = leagues[currentLeague].playoffBracket;
		if (bracket.resultsRank[0] === playerTeamCons){
			titles.push("1st place in " + leagues[currentLeague].name + ", Season" + season);
		}
		if (bracket.resultsRank[1] === playerTeamCons){
			titles.push("2nd place in " + leagues[currentLeague].name + ", Season" + season);
		}
		if (bracket.resultsRank[2] === playerTeamCons){
			titles.push("3rd place in " + leagues[currentLeague].name + ", Season" + season);
		}
		setupPromotions();
		updatePromosUI();
		updateTitlesUI();
	}
}

function promoEndCheck() {
	var promInd;
	if (promote){
		promInd = currentLeague;
	} else {
		promInd = currentLeague - 1;
	}
	var bracket = promotions[promInd];
	if (bracket && bracket.playing >= bracket.matches.length){
		state = "pre-reg";
		finishPromos();
	}
	if (!bracket){
		state = "pre-reg";
		finishPromos();
	}
}

function updateUI(){
	updateRosterUI();
	updateScheduleUI();
	updateLeagueUI();
	updateRecruitUI();
	updateTitlesUI();
	updatePlayoffUI();
	updatePromosUI();
	updateSummaryUI();
	updateNewsreelUI();
}

function updateRosterUI(){
	for (var i = 0; i < pos.length; i++){
		var toName = document.getElementById(pos[i]+"-name");
		toName.innerHTML = playerTeamCons.roster[i].name;
		for (var j = 0; j < stat.length; j++){
			var toShow = document.getElementById(pos[i]+"-"+stat[j]);
			toShow.innerHTML = Math.floor(playerTeamCons.roster[i][statNames[j]]);
			var toButton = document.getElementById(pos[i]+"-"+stat[j]+"-but");
			if (playerTeamCons.roster[i].points > 0){
				toButton.disabled = false;
				if (!toButton.onclick){
					(function (_player, _stat) {
						toButton.onclick = function() {
							_player.assignPoint(_stat);
						}
					}) (playerTeamCons.roster[i], statNames[j]);
				}
			} else {
				toButton.disabled = true;
			}
		}
		var pointsEl = document.getElementById(pos[i]+"-points-left");
		pointsEl.innerHTML = playerTeamCons.roster[i].points;
		var salaryEl = document.getElementById(pos[i]+"-cost-per-game");
		salaryEl.innerHTML = Math.floor(playerTeamCons.roster[i].salary);
		var contractEl = document.getElementById(pos[i]+"-contract");
		contractEl.innerHTML = playerTeamCons.roster[i].contract;
		var offerEl = document.getElementById(pos[i]+"-offer");
		if (!offerEl.onclick){
			(function (_player) {
				offerEl.onclick = function() {
					console.log("roster main prompt");
					var offer = prompt("How much will you pay this player per game?", _player.salary);
					if (isNaN(offer)){
						console.log("value " + offer + " does not make any sense for offer.");
						return;
					}
					var length = 0;
					if (playerTeamCons.managers.indexOf(managerCons[1]) >= 0 && managerCons[1].level > 0){
						var length = prompt("How many seasons will this player be contracted for?", _player.contract);
					}
					if (isNaN(length)){
						console.log("value " + length + " does not make any sense for length.");
						return;
					}
					_player.decideOffer(offer, length, playerTeamCons);
					updateNewsreelUI();
				};
			}) (playerTeamCons.roster[i]);
		}
		var fireEl = document.getElementById(pos[i]+"-fire");
		if (fireEl){
			fireEl.style.display = 'none';
		}
	}
	subEl = document.getElementById("substitutes-word");
	if (playerTeamCons.maxSubs == 0 || playerTeamCons.substitutes.length == 0){
		subEl.style.display = "none";
	} else {
		subEl.style.display = "inline";
		var subCount = 0;
		subListEl = document.getElementById("subs");
		subListEl.innerHTML = "";
		for (var i = 0; i < playerTeamCons.substitutes.length; i++){
			var subToShow = playerTeamCons.substitutes[i];
			if (subToShow){
				subCount++;
				var newSubEl = document.createElement("span");
				newSubEl.innerHTML = format(playerSubText, ["sub"+i+"A", subToShow.name, Math.floor(subToShow.strength), Math.floor(subToShow.skill), Math.floor(subToShow.endurance), Math.floor(subToShow.charisma), Math.floor(subToShow.clutch), subToShow.points, subToShow.tier, subToShow.salary, subToShow.contract]);
				subListEl.appendChild(newSubEl);
				for (var j = 0; j < stat.length; j++){
					var buttonEl = document.getElementById("sub"+i+"A-"+stat[j]+"-but");
					if (subToShow.points > 0){
						buttonEl.disabled = false;
						if (!buttonEl.onclick){
							(function (_sub, _stat) {
								buttonEl.onclick = function() {
									_sub.assignPoint(_stat);
								}
							}) (subToShow, statNames[j]);
						}
					} else {
						buttonEl.disabled = true;
					}
				}
				var offerEl = document.getElementById("sub"+i+"A-offer");
				(function (_sub) {
					offerEl.addEventListener("click", function() {
						console.log("roster sub prompt");
						var offer = prompt("How much will you pay this player per game?", _sub.salary);
						if (isNaN(offer)){
							console.log("value " + offer + " does not make any sense for offer.")
						}
						var length = 0;
						if (playerTeamCons.managers.indexOf(managerCons[1]) >= 0 && managerCons[1].level > 0){
							var length = prompt("How many seasons will this player be contracted for?", _player.contract);
						}
						if (isNaN(length)){
							console.log("value " + length + " does not make any sense for length.")
						}
						_sub.decideOffer(offer, length, playerTeamCons);
						updateNewsreelUI();
					});
				}) (subToShow);
				var subTableEl = document.getElementById("sub"+i+"A");
				var newRow = document.createElement("tr");
				newRow.innerHTML = "<td><button id=\"sub"+i+"A-fire\">Fire Player</button></td>";
				subTableEl.appendChild(newRow);
				var fireEl = document.getElementById("sub"+i+"A-fire");
				(function (_i) {
					fireEl.addEventListener("click", function () {
						playerTeamCons.firePlayer(_i);
					});
				})(i);
			}
		}
		subEl.innerHTML = "Substitutes ("+subCount+"/"+playerTeamCons.maxSubs+"):";
	}
	
	var trainerNumEl = document.getElementById("trainer-num");
	trainerNumEl.innerHTML = playerTeamCons.trainers;
	var trainerStrEl = document.getElementById("trainer-str");
	trainerStrEl.innerHTML = trainerStrGive + (playerTeamCons.managers.indexOf(managerCons[2]) >= 0 ? managerCons[2].bonus*managerCons[2].level : 0);
	var trainerEndEl = document.getElementById("trainer-end");
	trainerEndEl.innerHTML = trainerEndGive + (playerTeamCons.managers.indexOf(managerCons[2]) >= 0 ? managerCons[2].bonus*managerCons[2].level : 0);
	if (playerTeamCons.managers.indexOf(managerCons[4]) >= 0){
		var trainerCharismaEl = document.getElementById("trainer-charisma");
		trainerCharismaEl.innerHTML = "Each trainer also gives players " + managerCons[4].bonus + " charisma when they level up.";
	}
	var trainerCost = trainerBaseCost*Math.pow(trainerGrowth, playerTeamCons.trainers);
	var trainerCostEl = document.getElementById("trainer-cost");
	trainerCostEl.innerHTML = trainerCost.toFixed(2);
	var trainerBuyButton = document.getElementById("trainer-buy");
	if (playerTeamCons.money >= trainerCost){
		trainerBuyButton.disabled = false;
	} else {
		trainerBuyButton.disabled = true;
	}
	
	var coachNumEl = document.getElementById("coach-num");
	coachNumEl.innerHTML = playerTeamCons.coaches;
	var coachStrEl = document.getElementById("coach-skl");
	coachStrEl.innerHTML = coachSklGive + (playerTeamCons.managers.indexOf(managerCons[3]) >= 0 ? managerCons[3].bonus*managerCons[3].level : 0);
	var coachEndEl = document.getElementById("coach-clt");
	coachEndEl.innerHTML = coachCltGive + (playerTeamCons.managers.indexOf(managerCons[3]) >= 0 ? managerCons[3].bonus*managerCons[3].level : 0);
	if (playerTeamCons.managers.indexOf(managerCons[5]) >= 0){
		var tainerCharismaEl = document.getElementById("coach-charisma");
		trainerCharismaEl.innerHTML = "Each coach also gives players " + managerCons[5].bonus + " charisma when they level up.";
	}
	var coachCost = coachBaseCost*Math.pow(coachGrowth, playerTeamCons.coaches);
	var coachCostEl = document.getElementById("coach-cost");
	coachCostEl.innerHTML = coachCost.toFixed(2);
	var coachBuyButton = document.getElementById("coach-buy");
	if (playerTeamCons.money >= coachCost){
		coachBuyButton.disabled = false;
	} else {
		coachBuyButton.disabled = true;
	}
	
	var managerWordEl = document.getElementById("managers-word");
	if (playerTeamCons.managers.length == 0){
		managerWordEl.style.display = "none";
	} else {
		managerWordEl.style.display = "inline";
		var managerEl = document.getElementById("manager");
		managerEl.innerHTML = "";
		for (var i = 0; i < playerTeamCons.managers.length; i++){
			var manager = playerTeamCons.managers[i];
			var manEl = document.createElement("p");
			manEl.innerHTML = "<div>" + manager.displayName + "</div><div>" + manager.description + "</div><div>Level: " + manager.level + "</div>";
			if (manager.maxLevel == -1 || manager.level < manager.maxLevel) {
				var cost = manager.baseCost*Math.pow(manager.growth, manager.level);
				manEl.innerHTML += "<div>Cost for next level: " + cost + "</div><div><button id=\""+ manager.id + "-button\">Buy Next Level</button></div>";
			} else {
				manEl.innerHTML += "<div>This manager is at its maximum level</div>";
			}
			managerEl.appendChild(manEl);
			manButton = document.getElementById(manager.id+"-button");
			if (manButton){
				(function (_manager) {
					manButton.addEventListener("click", function () {
						if (_manager.levelUp(playerTeamCons)){
							updateUI();
						}
					});
				})(manager);
				if (cost > playerTeamCons.money){
					manButton.disabled = true;
				} else {
					manButton.disabled = false;
				}
			}
		}
	}
}

function updateScheduleUI() {
	var scheduleTable = document.getElementById("schedule");
	scheduleTable.innerHTML = "";
	var sched = playerTeamCons.schedule;
	for (var i = 0; i < sched.length; i++){
		var rowEl = document.createElement("tr");
		var oppEl = document.createElement("td");
		if (sched[i].team1 == playerTeamCons){
			oppEl.innerHTML = sched[i].team2.name;
		} else {
			oppEl.innerHTML = sched[i].team1.name;
		}
		rowEl.appendChild(oppEl);
		var outEl = document.createElement("td");
		if (sched[i].winner == 0){
			outEl.innerHTML = " -- ";
		} else {
			if (sched[i].winner == playerTeamCons){
				outEl.innerHTML = " W ";
				outEl.className = "win";
			} else {
				outEl.innerHTML = " L ";
				outEl.className = "loss";
			}
		}
		rowEl.appendChild(outEl);
		var scoreEl = document.createElement("td");
		scoreEl.innerHTML = (sched[i].team1 == playerTeamCons ? sched[i].team1points + "-" + sched[i].team2points : sched[i].team2points + "-" + sched[i].team1points)
							+ (sched[i].ots > 0 ? " " + sched[i].ots + "OT" : "");
		rowEl.appendChild(scoreEl);
		scheduleTable.appendChild(rowEl);
	}
	
	var nextGameButton = document.getElementById('next-game');
	nextGameButton.disabled = false;
	var nextSeasonButton = document.getElementById('next-season');
	var startPlayoffsButton = document.getElementById('start-playoffs');
	var startPromosButton = document.getElementById('start-promos');
	switch (state) {
		case 'reg':
			nextGameButton.style.display = 'inline';
			nextSeasonButton.style.display = 'none';
			startPlayoffsButton.style.display = 'none';
			startPromosButton.style.display = 'none';
			break;
		case 'pre-po':
			nextGameButton.style.display = 'none';
			nextSeasonButton.style.display = 'none';
			startPlayoffsButton.style.display = 'inline';
			startPromosButton.style.display = 'none';
			break;
		case 'po':
			nextGameButton.style.display = 'inline';
			nextSeasonButton.style.display = 'none';
			startPlayoffsButton.style.display = 'none';
			startPromosButton.style.display = 'none';
			break;
		case 'pre-promo':
			nextGameButton.style.display = 'none';
			nextSeasonButton.style.display = 'none';
			startPlayoffsButton.style.display = 'none';
			startPromosButton.style.display = 'inline';
			break;
		case 'promo':
			nextGameButton.style.display = 'inline';
			nextSeasonButton.style.display = 'none';
			startPlayoffsButton.style.display = 'none';
			startPromosButton.style.display = 'none';
			break;
		case 'pre-reg':
			nextGameButton.style.display = 'none';
			nextSeasonButton.style.display = 'inline';
			startPlayoffsButton.style.display = 'none';
			startPromosButton.style.display = 'none';
	}
}

function updateLeagueUI() {
	var leagueName = document.getElementById("league-name");
	leagueName.innerHTML = leagues[currentLeague].name;
	
	var leagueDet = document.getElementById("league-type-details");
	leagueDet.innerHTML = "# Teams to Playoff Series: " + leagues[currentLeague].playoffs + "<BR>"+
							"# Teams to Promotion Tournament: " + leagues[currentLeague].topromote + "<BR>"+
							"# Teams to Demotion Tournament: " + leagues[currentLeague].todemote;
	
	leagueTeamEl = document.getElementById("league-teams-body");
	leagueTeamEl.innerHTML = "";
	for (var i = 0; i < leagues[currentLeague].sortedTeams.length; i++){
		var thisTeam = leagues[currentLeague].sortedTeams[i];
		var rowEl = document.createElement("tr");
		rowEl.innerHTML = "<td>"+(i+1)+"</td>";
		rowEl.innerHTML += "<td>"+thisTeam.name+"</td>";
		rowEl.innerHTML += "<td>"+thisTeam.wins+"</td>";
		rowEl.innerHTML += "<td>"+thisTeam.loss+"</td>";
		rowEl.innerHTML += "<td>"+thisTeam.pointsFor+"</td>";
		rowEl.innerHTML += "<td>"+thisTeam.pointsAgainst+"</td>";
		leagueTeamEl.appendChild(rowEl);
	}
	
	var leagueDetailsTable = document.getElementById("league-details");
	leagueDetailsTable.innerHTML = "";
	for (var i = 0; i < leagues[currentLeague].teams.length; i++){
		var team = leagues[currentLeague].teams[i];
		var rowEl = document.createElement("tr");
		var nameEl = document.createElement("td");
		nameEl.innerHTML = team.name;
		rowEl.appendChild(nameEl);
		var recordEl = document.createElement("td");
		recordEl.innerHTML = team.wins + "-" + team.loss;
		rowEl.appendChild(recordEl);
		var rosterEl = document.createElement("td");
		rosterEl.innerHTML = "Striker: " + team.roster[0].name + " ("+Math.floor(team.roster[0].strength)+","+Math.floor(team.roster[0].skill)+","+Math.floor(team.roster[0].endurance)+","+Math.floor(team.roster[0].charisma)+","+Math.floor(team.roster[0].clutch)+")";
		for (var j = 1; j < team.roster.length; j++){
			rosterEl.innerHTML += "<br>" + positions[j] + ": " + team.roster[j].name + " ("+Math.floor(team.roster[j].strength)+","+Math.floor(team.roster[j].skill)+","+Math.floor(team.roster[j].endurance)+","+Math.floor(team.roster[j].charisma)+","+Math.floor(team.roster[j].clutch)+")";
		}
		rowEl.appendChild(rosterEl);
		leagueDetailsTable.appendChild(rowEl);
	}
}

function updateRecruitUI() {
	var tabEl = document.getElementById("recruit");
	if (playerTeamCons.managers.indexOf(managerCons[0]) >= 0 && managerCons[0].level > 0){
	
	tabEl.style.display = 'block';
	var recruitListEl = document.getElementById("recruit-list");
	recruitListEl.innerHTML = "";
	for (var i = recruits.length - 1; i >= 0; i--){
		if (i > highestTier){
			//recruitEl.style.display = "none";
			continue;
		}
		for (var j = 0; j < recruits[i].length; j++){
			var recruitEl = document.createElement('li');
			recruitEl.innerHTML = format(playerText, ["rec"+j+"tier"+i+"A", recruits[i][j].name, Math.floor(recruits[i][j].strength), Math.floor(recruits[i][j].skill), Math.floor(recruits[i][j].endurance), Math.floor(recruits[i][j].charisma), Math.floor(recruits[i][j].clutch), recruits[i][j].askingPrice, i]);
			recruitListEl.appendChild(recruitEl);
			var offerButton = document.getElementById("rec"+j+"tier"+i+"A-offer");
			if (recruits[i][j].lastOfferMadeOn[0] == season & recruits[i][j].lastOfferMadeOn[1] == currentGame){
				offerButton.disabled = true;
			} else {
				(function (_i, _j) {
				offerButton.addEventListener("click", function () {
					//spawn a dialog which collects information and then calls recruit.decideOffer(offer, length, team)
					console.log("recruit prompts");
					var offer = prompt("How much will you pay this player per game?", "0");
					if (isNaN(offer)){
						console.log("value " + offer + " does not make any sense for offer.")
					}
					var length = 0;
					if (playerTeamCons.managers.indexOf(managerCons[1]) >= 0 && managerCons[1].level > 0){
						var length = prompt("How many seasons will this player be contracted for?", _player.contract);
					}
					if (isNaN(length)){
						console.log("value " + length + " does not make any sense for length.")
					}
					recruits[_i][_j].decideOffer(parseInt(offer), Math.ceil(parseInt(length)), playerTeamCons);
					updateNewsreelUI();
				});
				})(i, j);
			}
		}
	}
	
	} else {
		tabEl.style.display = 'none';
	}
}

function updateTitlesUI() {
	var tabEl = document.getElementById("titles");
	if (titles.length == 0 && achievements.length == 0){
		tabEl.style.display = 'none';
	} else {
		tabEl.style.display = 'block';
		var titleEl = document.getElementById("titles-content");
		titleEl.innerHTML = "";
		for (var i = titles.length - 1; i >= 0; i--){
			var wordEl = document.createElement("div");
			wordEl.innerHTML = titles[i];
			titleEl.appendChild(wordEl);
		}
		var achieveEl = document.getElementById("achieve-content");
		achieveEl.innerHTML = "";
		for (var i = 0; i < achievements.length; i++){
			var wordEl = document.createElement("div");
			wordEl.innerHTML = achievements[i].title;
			achieveEl.appendChild(wordEl);
		}
	}
}

function updatePlayoffUI() {
	if (state === "pre-po" || state === "po"){
		var bracket = leagues[currentLeague].playoffBracket;
		var playoffDet = document.getElementById("playoff-type-details");
		playoffDet.innerHTML = "Playoff Type: " + bracket.description;
		var teamEl = document.getElementById("playoff-teams-body");
		teamEl.innerHTML = "";
		for (var i = 0; i < bracket.teams.length; i++){
			var rowEl = document.createElement("tr");
			rowEl.innerHTML = "<td>"+(i+1)+"</td>";
			rowEl.innerHTML += "<td>"+bracket.teams[i].name+"</td>";
			var place = bracket.resultsRank.indexOf(bracket.teams[i]);
			rowEl.innerHTML += "<td>"+(place >= 0 ? (place + 1) : "")+"</td>";
			rowEl.innerHTML += "<td>"+""+"</td>"; //record, but I'm not sure how I'm going to do this yet TODO (probably add to bracket class)
			teamEl.appendChild(rowEl);
		}
		var matchEl = document.getElementById("playoff-matches");
		matchEl.innerHTML = "";
		for (var i = 0; i < bracket.matches.length; i++){
			var games = [];
			if (bracket.matches[i] instanceof Match){
				for (var j = 0; j < bracket.matches[i].games.length; j++){
					games.push(bracket.matches[i].games[j]);
				}
			} else {
				games.push(bracket.matches[i]);
			}
			for (var j = 0; j < games.length; j++){
				var listEl = document.createElement("li");
				listEl.innerHTML = (games[j].team1 == 0 ? "TBD" : games[j].team1.name) +
							   " vs. " +
							   (games[j].team2 == 0 ? "TBD" : games[j].team2.name) +
							   " (" + games[j].team1points + "-" + games[j].team2points + ") " +
							   (games[j].ots > 0 ? " " + games[j].ots + "OT" : "");
				matchEl.appendChild(listEl);
			}
		}
		var bracketDisplayEl = document.getElementById("bracket");
		bracketDisplayEl.innerHTML = "";
		bracket.updateDisplay(bracketDisplayEl);
	}
	
	var tabEl = document.getElementById("playoffs");
	if (state === "pre-po" || state === "po" || state === "pre-promo"){
		tabEl.style.display = 'block';
	} else {
		tabEl.style.display = 'none';
	}
	
	var nextGameButton = document.getElementById('playoff-game');
	nextGameButton.disabled = false;
	var nextSeasonButton = document.getElementById('playoff-next-season');
	var startPlayoffsButton = document.getElementById('playoff-start-playoffs');
	var startPromosButton = document.getElementById('playoff-start-promos');
	switch (state) {
		case 'reg':
			nextGameButton.style.display = 'inline';
			nextSeasonButton.style.display = 'none';
			startPlayoffsButton.style.display = 'none';
			startPromosButton.style.display = 'none';
			break;
		case 'pre-po':
			nextGameButton.style.display = 'none';
			nextSeasonButton.style.display = 'none';
			startPlayoffsButton.style.display = 'inline';
			startPromosButton.style.display = 'none';
			break;
		case 'po':
			nextGameButton.style.display = 'inline';
			nextSeasonButton.style.display = 'none';
			startPlayoffsButton.style.display = 'none';
			startPromosButton.style.display = 'none';
			break;
		case 'pre-promo':
			nextGameButton.style.display = 'none';
			nextSeasonButton.style.display = 'none';
			startPlayoffsButton.style.display = 'none';
			startPromosButton.style.display = 'inline';
			break;
		case 'promo':
			nextGameButton.style.display = 'inline';
			nextSeasonButton.style.display = 'none';
			startPlayoffsButton.style.display = 'none';
			startPromosButton.style.display = 'none';
			break;
		case 'pre-reg':
			nextGameButton.style.display = 'none';
			nextSeasonButton.style.display = 'inline';
			startPlayoffsButton.style.display = 'none';
			startPromosButton.style.display = 'none';
	}
}

function updatePromosUI() {
	if (state === "pre-promo" || state === "promo"){
		var bracket = promotions[currentLeague];
		var promoDet = document.getElementById("bracket-type-details");
		promoDet.innerHTML = "Promotion Type: " + bracket.description;
		if (bracket === undefined){
			bracket = promotions[currentLeague-1];
		}
		var teamEl = document.getElementById("promo-teams");
		teamEl.innerHTML = "";
		for (var i = 0; i < bracket.teams.length; i++){
			var listEl = document.createElement("li");
			listEl.innerHTML = bracket.teams[i].name;
			teamEl.appendChild(listEl);
		}
		var matchEl = document.getElementById("promo-matches");
		matchEl.innerHTML = "";
		for (var i = 0; i < bracket.matches.length; i++){
			var games = [];
			if (bracket.matches[i] instanceof Match){
				for (var j = 0; j < bracket.matches[i].games.length; j++){
					games.push(bracket.matches[i].games[j]);
				}
			} else {
				games.push(bracket.matches[i]);
			}
			for (var j = 0; j < games.length; j++){
				var listEl = document.createElement("li");
				listEl.innerHTML = (games[j].team1 == 0 ? "TBD" : games[j].team1.name) +
							   " vs. " +
							   (games[j].team2 == 0 ? "TBD" : games[j].team2.name) +
							   " (" + games[j].team1points + "-" + games[j].team2points + ") " +
							   (games[j].ots > 0 ? " " + games[j].ots + "OT" : "");
				matchEl.appendChild(listEl);
			}
		}
		var leagueDetailsTable = document.getElementById("promo-details");
		leagueDetailsTable.innerHTML = "";
		for (var i = 0; i < bracket.teams.length; i++){
			var team = bracket.teams[i];
			var rowEl = document.createElement("tr");
			var nameEl = document.createElement("td");
			nameEl.innerHTML = team.name;
			rowEl.appendChild(nameEl);
			var rosterEl = document.createElement("td");
			rosterEl.innerHTML = "Striker: " + team.roster[0].name + " ("+Math.floor(team.roster[0].strength)+","+Math.floor(team.roster[0].skill)+","+Math.floor(team.roster[0].endurance)+","+Math.floor(team.roster[0].charisma)+","+Math.floor(team.roster[0].clutch)+")";
			for (var j = 1; j < team.roster.length; j++){
				rosterEl.innerHTML += "<br>" + positions[j] + ": " + team.roster[j].name + " ("+Math.floor(team.roster[j].strength)+","+Math.floor(team.roster[j].skill)+","+Math.floor(team.roster[j].endurance)+","+Math.floor(team.roster[j].charisma)+","+Math.floor(team.roster[j].clutch)+")";
			}
			rowEl.appendChild(rosterEl);
			leagueDetailsTable.appendChild(rowEl);
		}
	} 
	
	var tabEl = document.getElementById('promos');
	if (state === "pre-promo" || state === "promo" || state === "pre-reg") {
		tabEl.style.display = 'block';
	} else {
		tabEl.style.display = 'none';
	}
	
	var nextGameButton = document.getElementById('promo-game');
	nextGameButton.disabled = false;
	var nextSeasonButton = document.getElementById('promo-next-season');
	var startPlayoffsButton = document.getElementById('promo-start-playoffs');
	var startPromosButton = document.getElementById('promo-start-promos');
	switch (state) {
		case 'reg':
			nextGameButton.style.display = 'inline';
			nextSeasonButton.style.display = 'none';
			startPlayoffsButton.style.display = 'none';
			startPromosButton.style.display = 'none';
			break;
		case 'pre-po':
			nextGameButton.style.display = 'none';
			nextSeasonButton.style.display = 'none';
			startPlayoffsButton.style.display = 'inline';
			startPromosButton.style.display = 'none';
			break;
		case 'po':
			nextGameButton.style.display = 'inline';
			nextSeasonButton.style.display = 'none';
			startPlayoffsButton.style.display = 'none';
			startPromosButton.style.display = 'none';
			break;
		case 'pre-promo':
			nextGameButton.style.display = 'none';
			nextSeasonButton.style.display = 'none';
			startPlayoffsButton.style.display = 'none';
			startPromosButton.style.display = 'inline';
			break;
		case 'promo':
			nextGameButton.style.display = 'inline';
			nextSeasonButton.style.display = 'none';
			startPlayoffsButton.style.display = 'none';
			startPromosButton.style.display = 'none';
			break;
		case 'pre-reg':
			nextGameButton.style.display = 'none';
			nextSeasonButton.style.display = 'inline';
			startPlayoffsButton.style.display = 'none';
			startPromosButton.style.display = 'none';
	}
}

function updateSummaryUI(){
	var teamNameEl = document.getElementById("your-team-name");
	teamNameEl.innerHTML = playerTeamCons.name;
	var teamMoneyEl = document.getElementById("your-team-money");
	teamMoneyEl.innerHTML = "$" + playerTeamCons.money.toFixed(2);
	var teamSponsorsEl = document.getElementById("your-team-sponsors");
	teamSponsorsEl.innerHTML = "$" + playerTeamCons.sponsors.toFixed(2);
	var earnings = playerTeamCons.league.payPerGame;
	var teamEarningsEl = document.getElementById("your-team-earnings");
	teamEarningsEl.innerHTML = "$" + earnings.toFixed(2);
	var salaries = 0;
	for (var i = 0; i < playerTeamCons.roster.length; i++){
		salaries += parseInt(playerTeamCons.roster[i].salary);
	}
	for (var i = 0; i < playerTeamCons.substitutes.length; i++){
		if (playerTeamCons.substitutes[i]){
			salaries += parseInt(playerTeamCons.substitutes[i].salary);
		}
	}
	var teamSalaryEl = document.getElementById("your-team-spending");
	teamSalaryEl.innerHTML = "$" + parseInt(salaries).toFixed(2);
	var netMoney = playerTeamCons.sponsors + earnings - salaries;
	var teamNetMoneyEl = document.getElementById("your-team-net-money");
	teamNetMoneyEl.innerHTML = "$" + netMoney.toFixed(2);
	var teamLeagueNameEl = document.getElementById("your-team-league");
	teamLeagueNameEl.innerHTML = leagues[currentLeague].name;
	var recordStr = playerTeamCons.wins + "-" + playerTeamCons.loss + " ("+(100*(playerTeamCons.wins/(playerTeamCons.wins+playerTeamCons.loss))).toFixed(2)+"%)";
	var teamRecordEl = document.getElementById("your-team-record");
	teamRecordEl.innerHTML = recordStr;
	var teamPointsEl = document.getElementById("your-team-points");
	teamPointsEl.innerHTML = playerTeamCons.pointsFor + " / " + playerTeamCons.pointsAgainst;
	var teamPlaceEl = document.getElementById("your-team-place");
	teamPlaceEl.innerHTML = formatPlace(leagues[currentLeague].sortedTeams.indexOf(playerTeamCons) + 1);
	var teamAllMoneyEl = document.getElementById("your-team-alltime-earnings");
	teamAllMoneyEl.innerHTML = formatMoney(allTime.money);
	var teamAllRecordEl = document.getElementById("your-team-alltime-record");
	teamAllRecordEl.innerHTML = allTime.wins + "-" + allTime.loss + " (" + (100*allTime.wins/(allTime.wins + allTime.loss)).toFixed(2) + "%)";
	var teamAllPointsEl = document.getElementById("your-team-alltime-points");
	teamAllPointsEl.innerHTML = allTime.pointsFor + " / " + allTime.pointsAgainst;
	var teamAllLeagueEl = document.getElementById("your-team-alltime-league");
	teamAllLeagueEl.innerHTML = leagues[allTime.highestLeague].name;
}

function updateNewsreelUI() {
	if (playerLeveled){
		pushHeadline("One of your players leveled up! Head to the roster tab to increase its stats!");
		playerLeveled = false;
	}
	for (var i = dispNews.length - 1; i >= 0; i--){
		if (i + news.length >= 20){
			continue;
		} else {
			dispNews[i + news.length] = dispNews[i];
		}
	}
	for (var i = 0; i < news.length; i++){
		dispNews[news.length - 1 - i] = news[i];
	}
	var newsEl = document.getElementById("news");
	newsEl.innerHTML = "";
	for (var i = dispNews.length - 1; i >= 0; i--){
		if (dispNews[i]) {
			var headlineEl = document.createElement("div");
			headlineEl.innerHTML = dispNews[i];
			newsEl.appendChild(headlineEl);
		}
	}
	newsEl.scrollTop = newsEl.scrollHeight;
	news = [];
}

function updateGameUI(game, quarter, i){
	var prefix;
	switch (state) {
		case "reg":
			prefix = "sched-";
			break;
		case "po":
			prefix = "po-";
			break;
		case "promo":
			prefix = "promo-";
			break;
		default:
			console.log("Warning: updateGameUI() does nothing for state: " + state);
			//Actually we will target the game paragraph element and hide it TODO;
			return;
	}
	var nextGameButton = document.getElementById('next-game');
	nextGameButton.disabled = true;
	nextGameButton = document.getElementById('playoff-game');
	nextGameButton.disabled = true;
	nextGameButton = document.getElementById('promo-game');
	nextGameButton.disabled = true;
	var gameEl = document.getElementById(prefix+"game-over-time");
	gameEl.style.display = "block"; //in case it was previously hidden
	var yScoreEl = document.getElementById(prefix+"yScore");
	yScoreEl.innerHTML = (game.team1 === playerTeamCons ? game.team1points : game.team2points);
	var oScoreEl = document.getElementById(prefix+"oScore");
	oScoreEl.innerHTML = (game.team1 === playerTeamCons ? game.team2points : game.team1points);
	var totTime = (quarter-1)*15*60 + i*15 + (game.ots > 0 ? 900+(game.ots-1)*600: 0);
	var quarterTime = i*15;
	var totTimeDoneEl = document.getElementById(prefix+"total-time-done");
	totTimeDoneEl.innerHTML = formatTime(totTime);
	var totTimeTogoEl = document.getElementById(prefix+"total-time-togo");
	totTimeTogoEl.innerHTML = formatTime(3600+(600*game.ots)-totTime);
	var quaTimeDoneEl = document.getElementById(prefix+"quarter-time-done");
	quaTimeDoneEl.innerHTML = formatTime(quarterTime);
	var quaTimeTogoEl = document.getElementById(prefix+"quarter-time-togo");
	quaTimeTogoEl.innerHTML = formatTime((game.ots > 0 ? 600 : 900)-quarterTime)
	var qua1ScoreEl = document.getElementById(prefix+"q1-s");
	var qua2ScoreEl = document.getElementById(prefix+"q2-s");
	var qua3ScoreEl = document.getElementById(prefix+"q3-s");
	var qua4ScoreEl = document.getElementById(prefix+"q4-s");
	if (game.team1 === playerTeamCons){
		qua1ScoreEl.innerHTML = game.scores[0][1] + " - " + game.scores[0][2];
		qua2ScoreEl.innerHTML = game.scores[1][1] + " - " + game.scores[1][2];
		qua3ScoreEl.innerHTML = game.scores[2][1] + " - " + game.scores[2][2];
		qua4ScoreEl.innerHTML = game.scores[3][1] + " - " + game.scores[3][2];
	} else {
		qua1ScoreEl.innerHTML = game.scores[0][2] + " - " + game.scores[0][1];
		qua2ScoreEl.innerHTML = game.scores[1][2] + " - " + game.scores[1][1];
		qua3ScoreEl.innerHTML = game.scores[2][2] + " - " + game.scores[2][1];
		qua4ScoreEl.innerHTML = game.scores[3][2] + " - " + game.scores[3][1];
	}
	var qua1FillEl = document.getElementById(prefix+"q1-f");
	qua1FillEl.style.width = quarter > 1 ? "100%" : (quarter < 1 ? "0%" : Math.floor(100*quarterTime/900) + "%");
	var qua2FillEl = document.getElementById(prefix+"q2-f");
	qua2FillEl.style.width = quarter > 2 ? "100%" : (quarter < 2 ? "0%" : Math.floor(100*quarterTime/900) + "%");
	var qua3FillEl = document.getElementById(prefix+"q3-f");
	qua3FillEl.style.width = quarter > 3 ? "100%" : (quarter < 3 ? "0%" : Math.floor(100*quarterTime/900) + "%");
	var qua4FillEl = document.getElementById(prefix+"q4-f");
	qua4FillEl.style.width = game.ots > 0 ? "100%" : (quarter < 4 ? "0%" : Math.floor(100*quarterTime/900) + "%");
	var otsEl = document.getElementById(prefix+"ots");
	otsEl.innerHTML = "";
	for (var i = 0; i < game.ots; i++){
		var scoreChild = document.createElement('div');
		var barChild = document.createElement('div');
		var fillChild = document.createElement('span');
		if (game.team1 === playerTeamCons){
			scoreChild.innerHTML = game.scores[4+i][1] + " - " + game.scores[4+i][2];
		} else {
			scoreChild.innerHTML = game.scores[4+i][2] + " - " + game.scores[4+i][1];
		}
		otsEl.appendChild(scoreChild);
		barChild.className = "progress";
		fillChild.className = "progress-bar";
		fillChild.style.width = (game.ots - 1) > i ? "100%" : Math.floor(100*quarterTime/600) + "%";
		barChild.style.height = "10px";
		fillChild.style.height = "10px";
		barChild.appendChild(fillChild);
		otsEl.appendChild(barChild);
	}
	var yFrac = (game.team1 === playerTeamCons ? game.team1pos/totTime : game.team2pos/totTime);
	var yPerc = Math.floor(50*yFrac);
	var yPosTimeEl = document.getElementById(prefix+"yPosTime");
	yPosTimeEl.innerHTML = formatTime(game.team1 === playerTeamCons ? game.team1pos : game.team2pos);
	yPosTimeEl.style.width = (50-yPerc) + "%";
	var yPosTimeBarEl = document.getElementById(prefix+"yPosTimeBar");
	yPosTimeBarEl.style.width = yPerc + "%";
	var oPosTimeEl = document.getElementById(prefix+"oPosTime");
	oPosTimeEl.innerHTML = formatTime(game.team1 === playerTeamCons ? game.team2pos : game.team1pos);
	oPosTimeEl.style.width = yPerc + "%";
	var oPosTimeBarEl = document.getElementById(prefix+"oPosTimeBar");
	oPosTimeBarEl.style.width = (50-yPerc) + "%";
	
	yFrac = (game.team1 === playerTeamCons ? game.team1shots/(game.team1shots+game.team2shots) : game.team2shots/(game.team1shots+game.team2shots));
	yPerc = Math.floor(50*yFrac);
	var yShotsEl = document.getElementById(prefix+"yShots");
	yShotsEl.innerHTML = game.team1 === playerTeamCons ? game.team1shots : game.team2shots;
	yShotsEl.style.width = yFrac === Infinity ? "0%" : (50-yPerc) + "%";
	var yShotsBarEl = document.getElementById(prefix+"yShotsBar");
	yShotsBarEl.style.width = yFrac === Infinity ? "0%" : yPerc + "%";
	var oShotsEl = document.getElementById(prefix+"oShots");
	oShotsEl.innerHTML = game.team1 === playerTeamCons ? game.team2shots : game.team1shots;
	oShotsEl.style.width = yFrac === Infinity ? "0%" : yPerc + "%";
	var oShostsBarEl = document.getElementById(prefix+"oShotsBar");
	oShostsBarEl.style.width = yFrac === Infinity ? "0%" : (50-yPerc) + "%";
	
	yFrac = (game.team1 === playerTeamCons ? game.team1sog/(game.team1sog+game.team2sog) : game.team2sog/(game.team1sog+game.team2sog));
	yPerc = Math.floor(50*yFrac);
	var ySogEl = document.getElementById(prefix+"ySog");
	ySogEl.innerHTML = game.team1 === playerTeamCons ? game.team1sog : game.team2sog;
	ySogEl.style.width = yFrac === Infinity ? "0%" : (50-yPerc) + "%";
	var ySogBarEl = document.getElementById(prefix+"ySogBar");
	ySogBarEl.style.width = yFrac === Infinity ? "0%" : yPerc + "%";
	var oSogEl = document.getElementById(prefix+"oSog");
	oSogEl.innerHTML = game.team1 === playerTeamCons ? game.team2sog : game.team1sog;
	oSogEl.style.width = yFrac === Infinity ? "0%" : yPerc + "%";
	var oSogBarEl = document.getElementById(prefix+"oSogBar");
	oSogBarEl.style.width = yFrac === Infinity ? "0%" : (50-yPerc) + "%";
}

function AITick() {
	//Allowing AI teams to buy trainers should ensure that the player must seek out better recruits in order to keep progressing....hopefully.
	for (var i = 2; i < numLeagues; i++){
		var league = leagues[i];
		for (var j = 0; j < league.teams.length; j++){
			var team = league.teams[j];
			if (team === playerTeamCons){
				continue;
			}
			var canBuyTrainer = (team.money >= 8*trainerBaseCost*Math.pow(trainerGrowth, team.trainers)) //8 should ensure the player can buy 3 more than an AI team
			var canBuyCoach = (team.money >= 8*coachBaseCost*Math.pow(coachGrowth, team.coaches))
			if (canBuyTrainer && canBuyCoach){
				if (Math.random > 0.5){
					team.buyTrainer();
				} else {
					team.buyCoach();
				}
			} else if (canBuyTrainer){
				team.buyTrainer();
			} else if (canBuyCoach){
				team.buyCoach();
			}
		}
	}
}

function registerListener(listener) {
	listeners.push(listener);
}

function unregisterListener(listener) {
	listeners.splice(listeners.indexOf(listener),1);
}

function notifyAll(stateChange){
	listeners.forEach(function(cv, ind, arr) {
		cv.notify(stateChange);
	});
}

function pushHeadline(notif) {
	news.push(notif);
}

/****************
Utility Functions
****************/
function newname() {
	var letters = "abcdefghijklmnopqrstuvwxyz";
	var result = makeName();
	result = letters[Math.floor(Math.random() * letters.length)].toUpperCase() + ". " + result.slice(0,1).toUpperCase() + result.slice(1);
	return result;
}

function newteamname() {
	return "Team " + alliterativeName();
}

function sortTeams(a, b){
	if (a.wins == b.wins){
		if (a.pointsFor == b.pointsFor){
			if (a.pointsAgainst == b.pointsAgainst){
				return 0;
			} else {
				return a.pointsAgainst - b.pointsAgainst;
			}
		} else {
			return b.pointsFor - a.pointsFor;
		}
	} else {
		return b.wins - a.wins;
	}
}

function nameChange(){
	var nameChangeEl = document.getElementById("team-name-change");
	var newName = nameChangeEl.value;
	playerTeamCons.name = newName;
	switch (state){
		case "pre-reg":
		case "reg":
			updateLeagueUI();
			break;
		case "pre-po":
		case "po":
			updatePlayoffUI();
		case "pre-promo":
		case "promo":
			updatePromosUI();
	}
	updateSummaryUI();
}

function formatPlace(place){
	switch (place % 10){
		case 1:
			if ((place % 100) - 1 == 10){
				return place + "th";
			} else {
				return place + "st";
			}
			break;
		case 2:
			if ((place % 100) - 2 == 10){
				return place + "th";
			} else {
				return place + "nd";
			}
			break;
		case 3:
			if ((place % 100) - 3 == 10){
				return place + "th";
			} else {
				return place + "rd";
			}
		default:
			return place + "th";
	}
}

//Unused (but should be):
function formatMoney(money){
	return "$" + money.toFixed(2);
}

var suffix = ['K', 'M', 'B', 'T'];
//Unused (but should be):
function formatLarge(number){
	var toUse = -1;
	while (number > 1000){
		toUse++;
		number /= 1000;
		if (toUse == suffix.length -1){
			break;
		}
	}
	if (suffix[toUse]){
		return number.toFixed(3) + suffix[toUse];
	} else {
		return number;
	}
}

function formatTime(seconds){
	return Math.floor(seconds/60) + ":" + (seconds%60 < 10 ? "0" : "") + seconds%60;
}

//Drag and Drop
function drag(ev){
	ev.dataTransfer.setData("player-drag", ev.target.id);
}

function allowDrop(ev){
	ev.preventDefault();
}

function drop(ev){
	ev.preventDefault();
	var subDrag = false;
	var subDrop = false;
	var dragged = ev.dataTransfer.getData("player-drag");
	var dragEl = document.getElementById(dragged);
	var dropEl = ev.target;
	while (dropEl.nodeName != "TABLE"){
		dropEl = dropEl.parentElement;
	}
	if (dragEl === dropEl){
		return;
	}
	var dragInd = 0;
	if (dragged.indexOf('sub') >= 0){
		//We're dragging a substitute.
		subDrag = true;
		dragInd = dragged.match(/(\d+)/g)[0];
	} else {
		dragInd = pos.indexOf(dragged);
	}
	var dropInd = 0;
	if (dropEl.id.indexOf('sub') >= 0){
		//We're dropping onto a substitute.
		subDrop = true;
		dropInd = dropEl.id.match(/(\d+)/g)[0];
	} else {
		dropInd = pos.indexOf(dropEl.id);
	}
	var temp = dragEl.innerHTML;
	dragEl.innerHTML = dropEl.innerHTML;
	dropEl.innerHTML = temp;
	var ros = playerTeamCons.roster;
	var subs = playerTeamCons.substitutes;
	if (subDrag){
		if (subDrop){
			//Moving two substitutes
			temp = subs[dragInd];
			subs[dragInd] = subs[dropInd];
			subs[dropInd] = temp;
			replaceId("sub"+dragInd+"A", "sub"+dropInd+"A", dropEl);
			replaceId("sub"+dropInd+"A", "sub"+dragInd+"A", dragEl);
		} else {
			//Moving a substitute onto the main roster
			temp = subs[dragInd];
			subs[dragInd] = ros[dropInd];
			ros[dropInd] = temp;
			replaceId("sub"+dragInd+"A", pos[dropInd], dropEl);
			replaceId(pos[dropInd], "sub"+dragInd+"A", dragEl);
		}
	} else if (subDrop){
		//Moving a main roster onto the substitute
		temp = ros[dragInd];
		ros[dragInd] = subs[dropInd];
		subs[dropInd] = temp;
		replaceId(pos[dragInd], "sub"+dropInd+"A", dropEl);
		replaceId("sub"+dropInd+"A", pos[dragInd], dragEl);
	} else {
		//moving two main roster
		temp = ros[dragInd];
		ros[dragInd] = ros[dropInd];
		ros[dropInd] = temp;
		replaceId(pos[dragInd], pos[dropInd], dropEl);
		replaceId(pos[dropInd], pos[dragInd], dragEl);
	}
	updateRosterUI(); //Readds event listeners
}

/*Saving/Loading
function gameSave(){
	//Things we should save:
	//  leagues (Make sure to not store recursively)(This will actually take care of most of the information)
	//  recruits
	//  titles/achievements
	//  state? -> promotions (teams may not be in league)? playoffs (how do we link teams back to their original (pointers))?
	//  version -> forward compatibility in case more/less informatin needs to be stored
	//  playerTeamCons -> How do we assign this in a way that is retrievable?
	//  currentGame/currentLeague
	//Most everything else should be determined at start up (downloaded fresh in case of update)
	
	//With all objects as fields, I need to return the stringify of that object (actuall makes playoffBracket easier, in a way)
	localStorage.setItem('leagues', JSON.stringify(leagues, function (key, val){
		//Here we make sure we don't recurse through the object
		//console.log("KEY: " + key + ", VAL: " + val);
		if (key === 'sortedTeams'){
			return 0;
		}
		if (key === 'playoffType'){
			return 0;
		}
		if (key === 'teams'){
			if (typeof this === Bracket){
				var teamIndexes = [];
				var teamForm = this[key][0].league.teams;
				for (var i = 0; i < this[key].length; i++){
					var ind = teamFrom.indexOf(this[key][i]);
					teamIndexes.push(ind);
				}
				return JSON.stringify(teamIndexes);
			}
			return val;
		}
		if (key === 'league'){
			return 0;
		}
		if (key === 'team'){
			return 0;
		}
		if (key === 'team1' || key === 'team2' || key === 'winner' || key === 'loser'){
			if (this[key] == 0){
				return 0;
			} else {
				return this[key].league.teams.indexOf(this[key]);
			}
		}
		return val;
	}));
	localStorage.setItem('recruits', JSON.stringify(recruits, function (key, val){
		if (key === 'team'){
			return 0;
		}
		return val;
	}));
	localStorage.setItem('titles', JSON.stringify(titles));
	localStorage.setItem('achievements', JSON.stringify(achievements));
	localStorage.setItem('state', state);
	localStorage.setItem('curGame', currentGame);
	localStorage.setItem('curLeague', currentLeague);
	if (state === 'promo' || state === 'pre-promo'){
		localStorage.set('promotions', JSON.stringify(promotions, function (k, v) {
			if (key === 'league'){
				return 0;
			}
			if (key === 'schedule'){
				return 0;
			}
			if (key === 'team'){
				return 0;
			}
			if (key === 'team1' || key === 'team2' || key === 'winner' || key === 'loser'){
				if (this[key] == 0){
					return "n"; //This doesn't happen for some reason?
				} else {
					for (var i = 0; i < promotions.length; i++){
						for (var j = 0; j < promotions[i].teams.length; j++){
							if (promotions[i].teams[j] === this[key]){
								return j;
							}
						}
					}
					return "n";
				}
			}
			return v;
		}));
	} else {
		localStorage.setItem('playerInd', leagues[currentLeague].teams.indexOf(playerTeamCons));
	}
	localStorage.setItem('version', 1);
}

function gameLoad(){
	//This won't work. We need to do this during creation because PROTOTYPES AREN'T STORED IN JSON
	//return true or false. That way we know if we should build a new game or continue with the loaded one
	var version = localStorage.getItem('version');
	if (version == 1){
		var l = localStorage.getItem('leagues');
		leagues = JSON.parse(l);
		for (var i = 0; i < leagues.length; i++){
			leagues[i].sortedTeams = [];
			for (var j = 0; j < leagues[i].teams.length; j++){
				var team = leagues[i].teams[j];
				team.league = leagues[i];
				leagues[i].sortedTeams.push(team);
				for (var k = 0; k < team.roster.length; k++){
					team.roster[k].team = team;
				}
				for (var k = 0; k < team.substitutes.length; k++){
					team.substitutes[k].team = team;
				}
				for (var k = 0; k < team.schedule.length; k++){
					if (team.schedule[k].team1 == "n"){
						team.schedule[k].team1 = 0;
					} else {
						team.schedule[k].team1 = leagues[i].teams[team.schedule[k].team1];
					}
					if (team.schedule[k].team2 == "n"){
						team.schedule[k].team2 = 0;
					} else {
						team.schedule[k].team2 = leagues[i].teams[team.schedule[k].team2];
					}
					if (team.schedule[k].winner == "n"){
						team.schedule[k].winner = 0;
					} else {
						team.schedule[k].winner = leagues[i].teams[team.schedule[k].winner];
					}
					if (team.schedule[k].loser == "n"){
						team.schedule[k].loser = 0;
					} else {
						team.schedule[k].loser = leagues[i].teams[team.schedule[k].loser];
					}
				}
			}
			if (leagues[i].playoffBracket){
				for (var j = 0; j < leagues[i].playoffBracket.teams.length; j++){
					leagues[i].playoffBracket.teams[j] = leagues[i].teams[leagues[i].playoffBracket.teams[j]];
				}
			}
		}
		sortAllTeams();
		var r = localStorage.getItem('recruits');
		recruits = JSON.parse(r);
		var t = localStorage.getItem('titles');
		titles = JSON.parse(t);
		var a = localStorage.getItem('achievements');
		achievements = JSON.parse(a);
		state = localStorage.getItem('state');
		currentGame = localStorage.getItem('curGame');
		currentLeague = localStorage.getItem('curLeague');
		if (state === 'promo' || state === 'pre-promo'){
			var p = localStorage.getItem('promotions');
			promotions = JSON.parse(p);
			for (var prom = 0; prom < promotions.length; prom++){
				var promotion = promotions[prom];
				for (var i = 0; i < promotion.matches.length; i++){
					if (typeof team.schedule[i] === Game){
						if (team.schedule[i].team1 == "n"){
							team.schedule[i].team1 = 0;
						} else {
							team.schedule[i].team1 = promotion.teams[team.schedule[i].team1];
						}
						if (team.schedule[i].team2 == "n"){
							team.schedule[i].team2 = 0;
						} else {
							team.schedule[i].team2 = promotion.teams[team.schedule[i].team2];
						}
						if (team.schedule[i].winner == "n"){
							team.schedule[i].winner = 0;
						} else {
							team.schedule[i].winner = promotion.teams[team.schedule[i].winner];
						}
						if (team.schedule[i].loser == "n"){
							team.schedule[i].loser = 0;
						} else {
							team.schedule[i].loser = promotion.teams[team.schedule[i].loser];
						}
					} else {
						if (team.schedule[i].team1 == "n"){
							team.schedule[i].team1 = 0;
						} else {
							team.schedule[i].team1 = promotion.teams[team.schedule[i].team1];
						}
						if (team.schedule[i].team2 == "n"){
							team.schedule[i].team2 = 0;
						} else {
							team.schedule[i].team2 = promotion.teams[team.schedule[i].team2];
						}
						for (var j = 0; j < team.schedule[i].games.length; j++){
							var game = team.schedule[i].game[j];
							if (game.team1 = "n"){
								game.team1 = 0;
							} else {
								game.team1 = promotion.teams[game.team1];
							}
							if (game.team2 = "n"){
								game.team2 = 0;
							} else {
								game.team2 = promotion.teams[game.team2];
							}
							if (game.winner = "n"){
								game.winner = 0;
							} else {
								game.winner = promotion.teams[game.winner];
							}
							if (game.loser = "n"){
								game.loser = 0;
							} else {
								game.loser = promotion.teams[game.loser];
							}
						}
					}
				}
			}
		} else {
			var p = localStorage.getItem('playerInd');
			playerTeamCons = leagues[currentLeague].teams[p];
		}
		return true;
	} else {
		return false;
	}
}

function gameImport(){
	//Not yet implemented
}

function gameExport(){
	//Not yet implemented
}
*/
function replaceId(fromStr, toStr, el){
	el.id = el.id.replace(fromStr, toStr);
	for (var i = 0; i < el.children.length; i++){
		replaceId(fromStr, toStr, el.children[i]);
	}
}

function createLeagues(loading){
	loading = loading || false;
	for (var i = 0; i < numLeagues; i++){
		leagues.push(new League());
	}
	for (var i = 0; i < numLeagues-1; i++){
		promotionTypes[i] = Promotion2TeamBO3;
	}
	//(most of) This for loop will need to be separated out when we diversify the leagues, sorry future me.
	for (var k = 0; k < numLeagues; k++){
		league = leagues[k];
		league.topromote = 1;
		league.todemote = 1;
		league.playoffs = 4;
		league.playoffType = Bracket4TeamMinimal;
		league.payPerGame = 10*(k+1);
		for (var i = 0; i < 16; i++){
			var team = new Team();
			for (var j = 0; j < 8; j++){
				var newPlayer = new Player(k);
				team.roster.push(newPlayer);
				newPlayer.team = team;
			}
			team.league = league;
			league.teams.push(team);
			league.sortedTeams.push(team);
		}
	}
	
	//leagues[0].playoffs = 8;
	//leagues[0].playoffType = Bracket8TeamDoubleElimFull;
	leagues[0].todemote = 0;
	
	leagues[1].playoffs = 8;
	leagues[1].playoffType = Bracket8TeamDoubleElimFull;
	
	leagues[2].playoffs = 8;
	leagues[2].playoffType = Bracket8TeamDoubleElimFull;
	
	leagues[25].topromote = 0;
	
	playerTeamCons = leagues[0].teams[0];
	
	leagues[0].name = "First Steps NewPro Series";
	leagues[1].name = "Small-Time Delta League";
	leagues[2].name = "Small-Time Gamma League";
	leagues[3].name = "Small-Time Beta League";
	leagues[4].name = "Small-Time Alpha League";
	leagues[5].name = "Local Minors Series";
	leagues[6].name = "Local Majors Series";
	leagues[7].name = "Local Top Dog Series";
	leagues[8].name = "Regional Minors Series";
	leagues[9].name = "Regional Majors Series";
	leagues[10].name = "Regional All-Star Series";
	leagues[11].name = "National Semi-Pro D-League";
	leagues[12].name = "National Semi-Pro C-League";
	leagues[13].name = "National Semi-Pro B-League";
	leagues[14].name = "National Semi-Pro A-League";
	leagues[15].name = "National Pro League 3rd String";
	leagues[16].name = "National Pro League 2nd String";
	leagues[17].name = "National Professional League";
	leagues[18].name = "Continental SubPro League";
	leagues[19].name = "Continental Tier 2 Pro League";
	leagues[20].name = "Continental Tier 1 Pro League";
	leagues[21].name = "Global Tier 3 League";
	leagues[22].name = "Global Tier 2 League B";
	leagues[23].name = "Global Tier 2 League A";
	leagues[24].name = "Global Tier 1 League";
	leagues[25].name = "True Professional";
}

function createRecruits(loading) {
	loading = loading || false;
	for (var i = 0; i < numLeagues; i++){
		var tierRecruits = [];
		for (var j = 0; j < 10; j++){
			tierRecruits.push(new Player(i));
		}
		recruits.push(tierRecruits);
	}
}

function playTick(game, quarter){
	var ros1 = game.team1.roster;
	var ros2 = game.team2.roster;
	var charMod1 = [];
	for (var i = 0; i < 8; i++){
		charMod1.push(charismaModifer(ros1[i-1], ros1[i+1]));
	}
	var charMod2 = [];
	for (var i = 0; i < 8; i++){
		charMod2.push(charismaModifer(ros2[i-1], ros2[i+1]));
	}
	//Roll for possesion time this tick
	var A = 1; var B = 0; var C = .3; var D = .3; var E = .3; //Bal
	var str1 = (ros1[3].strength*A) + (ros1[3].skill*B) + (charMod1[3]*C) + (enduranceModifier(ros1[3], quarter+game.ots)*D) + (clutchModifier(game, ros1[3])*E);
	str1 += (ros1[4].strength*A) + (ros1[4].skill*B) + (charMod1[4]*C) + (enduranceModifier(ros1[4], quarter+game.ots)*D) + (clutchModifier(game, ros1[4])*E);
	var str2 = (ros2[3].strength*A) + (ros2[3].skill*B) + (charMod2[3]*C) + (enduranceModifier(ros2[3], quarter+game.ots)*D) + (clutchModifier(game, ros2[3])*E);
	str2 += (ros2[4].strength*A) + (ros2[4].skill*B) + (charMod2[4]*C) + (enduranceModifier(ros2[4], quarter+game.ots)*D) + (clutchModifier(game, ros2[4])*E);
	var pivot = str1 / (str1 + str2); //A number between 0 and 1
	var swing = pivot - Math.random();
	var try1, try2;
	if (swing > 0.75){
		try1 = 2;
		game.team1pos += 15;
		try2 = 0;
		game.team2pos += 0;
	} else if (swing > 0.25){
		try1 = 1;
		game.team1pos += 10;
		try2 = 0;
		game.team2pos += 5;
	} else if (swing > -0.25){
		try1 = 0;
		game.team1pos += 7.5;
		try2 = 0;
		game.team2pos += 7.5;
	} else if (swing > -0.75){
		try1 = 0;
		game.team1pos += 5;
		try2 = 1;
		game.team2pos += 10;
	} else {
		try1 = 0;
		game.team1pos += 0;
		try2 = 2;
		game.team1pos += 15;
	}
	for (var i = 0; i < try1; i++){
		//Roll to see if you make the shot (Forward's Strength vs Defender's Strength and Skill)
		A = 1; B = 0.3; C = 0.3; D = 0.3; //Bal
		str1 = (ros1[1].strength*A) + (charMod1[1]*B) + (enduranceModifier(ros1[1], quarter+game.ots)*C) + (clutchModifier(game, ros1[1])*D);
		str1 += (ros1[2].strength*A) + (charMod1[2]*B) + (enduranceModifier(ros1[2], quarter+game.ots)*C) + (clutchModifier(game, ros1[2])*D);
		A = 0.5; B = 0.5; C = 0.3; D = 0.3; E = 0.3; //Bal
		str2 = (ros2[5].strength*A) + (ros2[5].skill*B) + (charMod2[5]*C) + (enduranceModifier(ros2[5], quarter+game.ots)*D) + (clutchModifier(game, ros2[5])*E);
		str2 += (ros2[6].strength*A) + (ros2[6].skill*B) + (charMod2[6]*C) + (enduranceModifier(ros2[6], quarter+game.ots)*D) + (clutchModifier(game, ros2[6])*E);
		pivot = str1 / (str1 + str2);
		swing = pivot - Math.random();
		if (swing >= 0){
			game.team1shots++;
			//Roll to see if shot is on goal (Forward's Skill vs Defender's Strength and Skill)
			A = 1; B = 0.3; C = 0.3; D = 0.3; //Bal
			str1 = (ros1[1].skill*A) + (charMod1[1]*B) + (enduranceModifier(ros1[1], quarter+game.ots)*C) + (clutchModifier(game, ros1[1])*D);
			str1 += (ros1[2].skill*A) + (charMod1[2]*B) + (enduranceModifier(ros1[2], quarter+game.ots)*C) + (clutchModifier(game, ros1[2])*D);
			//A = 0.5; B = 0.5; C = 0.3; D = 0.3; E = 0.3; //Bal
			//str2 = (ros2[5].strength*A) + (ros2[5].skill*B) + (charMod2[5]*C) + (enduranceModifier(ros2[5], quarter+game.ots)*D) + (clutchModifier(game, ros2[5])*E);
			//str2 += (ros2[6].strength*A) + (ros2[6].skill*B) + (charMod2[6]*C) + (enduranceModifier(ros2[6], quarter+game.ots)*D) + (clutchModifier(game, ros2[6])*E);
			pivot = str1 / (str1 + str2);
			swing = pivot - Math.random();
			if (swing >= 0){
				game.team1sog++;
				//Roll to see if shot is a point (Striker vs Keeper)
				A = 0.6; B = 0.6; C = 0.25; D = 0.25; E = 0.5; //Bal
				str1 = (ros1[0].skill*A) + (ros1[0].clutch*B) + (charMod1[0]*C) + (enduranceModifier(ros1[0], quarter+game.ots)*D) + (clutchModifier(game, ros1[0])*E);
				str2 = (ros2[7].skill*A) + (ros2[7].clutch*B) + (charMod2[7]*C) + (enduranceModifier(ros2[7], quarter+game.ots)*D) + (clutchModifier(game, ros2[7])*E);
				pivot = str1 / (str1 + str2);
				swing = pivot - Math.random();
				if (swing >= 0){
					game.team1points++;
					game.scores[quarter+game.ots-1][1]++;
				}
			}
		}
	}
	for (var i = 0; i < try2; i++){
		//Roll to see if you make the shot (Forward's Strength vs Defender's Strength and Skill)
		A = 1; B = 0.3; C = 0.3; D = 0.3;
		str2 = (ros2[2].strength*A) + (charMod2[2]*B) + (enduranceModifier(ros2[2], quarter+game.ots)*C) + (clutchModifier(game, ros2[2])*D);
		str2 += (ros2[1].strength*A) + (charMod2[1]*B) + (enduranceModifier(ros2[1], quarter+game.ots)*C) + (clutchModifier(game, ros2[1])*D);
		A = 0.5; B = 0.5; C = 0.3; D = 0.3; E = 0.3;
		str1 = (ros1[5].strength*A) + (ros1[5].skill*B) + (charMod1[5]*C) + (enduranceModifier(ros1[5], quarter+game.ots)*D) + (clutchModifier(game, ros1[5])*E);
		str1 += (ros1[6].strength*A) + (ros1[6].skill*B) + (charMod1[6]*C) + (enduranceModifier(ros1[6], quarter+game.ots)*D) + (clutchModifier(game, ros1[6])*E);
		pivot = str2 / (str2 + str1);
		swing = pivot - Math.random();
		if (swing >= 0){
			game.team2shots++;
			//Roll to see if shot is on goal (Forward's Skill vs Defender's Strength and Skill)
			A = 1; B = 0.3; C = 0.3; D = 0.3;
			str2 = (ros2[2].skill*A) + (charMod2[2]*B) + (enduranceModifier(ros2[2], quarter+game.ots)*C) + (clutchModifier(game, ros2[2])*D);
			str2 += (ros2[1].skill*A) + (charMod2[1]*B) + (enduranceModifier(ros2[1], quarter+game.ots)*C) + (clutchModifier(game, ros2[1])*D);
			//A = 0.5; B = 0.5; C = 0.3; D = 0.3; E = 0.3;
			//str1 = (ros1[5].strength*A) + (ros1[5].skill*B) + (charMod1[5]*C) + (enduranceModifier(ros1[5], quarter+game.ots)*D) + (clutchModifier(game, ros1[5])*E);
			//str1 += (ros1[6].strength*A) + (ros1[6].skill*B) + (charMod1[6]*C) + (enduranceModifier(ros1[6], quarter+game.ots)*D) + (clutchModifier(game, ros1[6])*E);
			pivot = str2 / (str2 + str1);
			swing = pivot - Math.random();
			if (swing >= 0){
				game.team2sog++;
				//Roll to see if shot is a point (Striker vs Keeper)
				A = 0.6; B = 0.6; C = 0.15; D = 0.15; E = 0.5;
				str2 = (ros2[0].skill*A) + (ros2[0].clutch*B) + (charMod2[0]*C) + (enduranceModifier(ros2[0], quarter+game.ots)*D) + (clutchModifier(game, ros2[0])*E);
				str1 = (ros1[7].skill*A) + (ros1[7].clutch*B) + (charMod1[7]*C) + (enduranceModifier(ros1[7], quarter+game.ots)*D) + (clutchModifier(game, ros1[7])*E);
				pivot = str2 / (str2 + str1);
				swing = pivot - Math.random();
				if (swing >= 0){
					game.team2points++;
					game.scores[quarter+game.ots-1][2]++;
				}
			}
		}
	}
}

function charismaModifer(left, right){ //Bal
	var mod = 0;
	if (left){
		mod += left.charisma/2;
	}
	if (right){
		mod += right.charisma/2;
	}
	return mod;
}

function enduranceModifier(player, section){ //section = quarter + overtimes //Bal
	A = 1; //For easy toggling/balancing
	B = 10;
	return A*(Math.log(player.endurance)/Math.log(B/section));
	//Check the math on this, but it should be getting exponentially better at every quarter?
}

function clutchModifier(game, player) { //Bal
	var diff = Math.abs(game.team1points - game.team2points);
	var A = 2;
	var B = 4;
	return (diff == 0 ? B : A / diff)*player.clutch;
}

function format(str, b) {
	//Based on some stackoverflow code because js doesn't have a string formatting function built in.
	return str.replace(/{(\d+)}/g, function(match, number) {
		return typeof b[number] != 'undefined' ? b[number] : match;
	});
}

var playerText = "<table class=\"player tier{8}A\" id=\"{0}\"><tr><td class=\"name\" id=\"{0}-name\">{1}</td><td></td><td class=\"{0}-injury\"></td></tr><tr><td>Strength:</td><td class=\"up-button\"></td><td class=\"stat strength\" id=\"{0}-str\">{2}</td></tr><tr><td>Skill:</td><td class=\"up-button\"></td><td class=\"stat skill\" id=\"{0}-skl\">{3}</td></tr><tr><td>Endurance:</td><td class=\"up-button\"></td><td class=\"stat endurance\" id=\"{0}-end\">{4}</td</tr><tr><td>Charisma:</td><td class=\"up-button\"></td><td class=\"stat charisma\" id=\"{0}-chr\">{5}</td></tr><tr><td>Clutch:</td><td class=\"up-button\"></td><td class=\"stat clutch\" id=\"{0}-clt\">{6}</td></tr><tr><td>Asking Pay:</td><td></td><td id=\"{0}-cost-per-game\">{7}</td></tr><tr><td><button id=\"{0}-offer\">Offer Position</button></td></tr></table>";
//{0} is positions (rec#tier#A)
//{1} is player.name
//{2} is player.strength
//{3} is player.skill
//{4} is player.endurance
//{5} is player.charisma
//{6} is player.clutch
//{7} is player asking pay per game
//{8} is player.tier

var playerSubText = "<table class=\"player tier{8}A\" id=\"{0}\" draggable=\"true\" ondragstart=\"drag(event)\" ondragover=\"allowDrop(event)\" ondrop=\"drop(event)\"><tr><td class=\"name\" id=\"{0}-name\">{1}</td><td></td><td class=\"{0}-injury\"></td></tr><tr><td>Strength:</td><td class=\"up-button\"><button id=\"{0}-str-but\">+</button></td><td class=\"stat strength\" id=\"{0}-str\">{2}</td></tr><tr><td>Skill:</td><td class=\"up-button\"><button id=\"{0}-skl-but\">+</button></td><td class=\"stat skill\" id=\"{0}-skl\">{3}</td></tr><tr><td>Endurance:</td><td class=\"up-button\"><button id=\"{0}-end-but\">+</button></td><td class=\"stat endurance\" id=\"{0}-end\">{4}</td</tr><tr><td>Charisma:</td><td class=\"up-button\"><button id=\"{0}-chr-but\">+</button></td><td class=\"stat charisma\" id=\"{0}-chr\">{5}</td></tr><tr><td>Clutch:</td><td class=\"up-button\"><button id=\"{0}-clt-but\">+</button></td><td class=\"stat clutch\" id=\"{0}-clt\">{6}</td></tr><tr><td>Points Left:</td><td></td><td id=\"{0}-points-left\">{7}</td></tr><tr><td>Cost Per Game:</td><td></td><td id=\"{0}-cost-per-game\">{9}</td></tr><tr class=\"contract-req\"><td>Contract Seasons Left</td><td></td><td id=\"{0}-contract\">{10}</td></tr><tr><td><button id=\"{0}-offer\">Offer New Salary</button></td></tr></table>";
//{0} is position (sub#A)
//{1}-{6} are the same
//{7} is points remaining
//{8} is player tier
//{9} is cost per game
//{10} is contact length
