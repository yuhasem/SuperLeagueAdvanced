function Manager (displayName = "", cost = 0, growth = 1, maxLevel = -1, descrip = "", idName = "1") {
	this.displayName = displayName;
	this.level = 0;
	this.baseCost = cost;
	this.growth = growth;
	this.maxLevel = maxLevel; //-1 for infinite
	this.description = descrip;
	this.id = idName;
}

Manager.prototype.notify = function (stateChange) {}

Manager.prototype.levelUp = function (team) {
	if (this.maxLevel == -1 || this.level < this.maxLevel){
		var cost = this.baseCost*Math.pow(this.growth, this.level);
		if (team.money >= cost){
			this.level++;
			team.money -= cost;
			return true;
		}
	}
	return false;
}

function ManagerSubstitutes () {
	Manager.call(this, "Sabastien Utsmor", 200, 5, 10, "Allows you to Recruit free agents. Each level gives room for 2 more substitutes in your roster.", "subsmanager");
}
ManagerSubstitutes.prototype = Object.create(Manager.prototype);

ManagerSubstitutes.prototype.notify = function (stateChange) {
	if (stateChange.indexOf("money") >= 0){
		if (allTime.money >= this.baseCost){
			playerTeamCons.managers.push(this);
			unregisterListener(this);
			pushHeadline("You unlocked a new manager: " + this.displayName);
		}
	}
}

ManagerSubstitutes.prototype.levelUp = function (team) {
	var res = Manager.prototype.levelUp.call(this, team);
	if (res){
		team.maxSubs += 2;
	}
	if (this.level == 1){
		jss.set('.recruit-req', {'display': 'table-row'});
	}
	return res;
}

function ManagerContracts () {
	Manager.call(this, "Ken Trakter", 1000, 1, 1, "Allows you to Contract players. Contracted players cannot leave for another team unless you are in debt.", "contractmanager");
}
ManagerContracts.prototype = Object.create(Manager.prototype);

ManagerContracts.prototype.notify = function (stateChange) {
	if (stateChange.indexOf("money") >= 0) {
		if (allTime.money >= this.baseCost) {
			playerTeamCons.managers.push(this);
			unregisterListener(this);
			pushHeadline("You unlocked a new manager: " + this.displayName);
		}
	}
}

ManagerContracts.prototype.levelUp = function (team){
	var res = Manager.prototype.levelUp.call(this, team);
	if (this.level == 1){
		jss.set('.contract-req', {'display': 'table-row'});
	}
	return res;
}

function ManagerTrainer () {
	this.bonus = 2;
	Manager.call(this, "Trent Perlov", 2000, 3, -1, "Each level increases the amount of Strength and Endurance each Trainer provides per level up by " + this.bonus + ".", "trainermanager");
	this.ableToBuy = false;
}
ManagerTrainer.prototype = Object.create(Manager.prototype);

ManagerTrainer.prototype.notify = function (stateChange) {
	if (stateChange.indexOf("trainer") >= 0){
		this.ableToBuy = true;
		console.log("trainer bought and Trainer Manager unlockable");
	}
	if (this.ableToBuy && stateChange.indexOf("money") >= 0){
		if (allTime.money >= this.baseCost){
			playerTeamCons.managers.push(this);
			unregisterListener(this);
			registerListener(managerCons[4]);
			pushHeadline("You unlocked a new manager: " + this.displayName);
		}
	}
}

function ManagerCoach () {
	this.bonus = 2;
	Manager.call(this, "Cory Perlov", 2000, 3, -1, "Each level increases the amount of Skill and Clutch each Coach provides per level up by " + this.bonus + ".", "coachmanager");
	this.ableToBuy = false;
}
ManagerCoach.prototype = Object.create(Manager.prototype);

ManagerCoach.prototype.notify = function (stateChange) {
	if (stateChange.indexOf("coach") >= 0){
		this.ableToBuy = true;
		console.log("coach bought and Coach Manager unlockable");
	}
	if (this.ableToBuy && stateChange.indexOf("money") >= 0){
		if (allTime.money >= this.baseCost){
			playerTeamCons.managers.push(this);
			unregisterListener(this);
			registerListener(managerCons[5]);
			pushHeadline("You unlocked a new manager: " + this.displayName);
		}
	}
}

function ManagerCharismaTrainer () {
	this.bonus = 2;
	Manager.call(this, "Chris McTren", 3000, 4, -1, "Trainers also provide Charisma per level up, equal to " + this.bonus + " times this manager's level.", "trainercharisma");
}
ManagerCharismaTrainer.prototype = Object.create(Manager.prototype);

ManagerCharismaTrainer.prototype.notify = function (stateChange){
	if (stateChange.indexOf("money") >= 0){
		if (allTime.money >= this.baseCost){
			playerTeamCons.managers.push(this);
			unregisterListener(this);
			pushHeadline("You unlocked a new manager: " + this.displayName);
		}
	}
}

function ManagerCharismaCoach () {
	this.bonus = 2;
	Manager.call(this, "Kris McCotton", 3000, 4, -1, "Coaches also provide Charisma per level up, equal to " + this.bonus + " times this manager's level.", "coachcharisma");
}
ManagerCharismaCoach.prototype = Object.create(Manager.prototype);

ManagerCharismaCoach.prototype.notify = function (stateChange){
	if (stateChange.indexOf("money") >= 0){
		if (allTime.money >= this.baseCost){
			playerTeamCons.managers.push(this);
			unregisterListener(this);
			pushHeadline("You unlocked a new manager: " + this.displayName);
		}
	}
}

function ManagerSpy () {
	//Not yet implemented!
	Manager.call(this, "Grover Staspy", 100, 5, 3, "Each level gives you the ability to see the growth stat of one stat of one player.", "spymanager");
}

function ManagerIdle () {
	//Not yet implemented!
	Manager.call(this, "Otto Idol", 100, 1, 1, "Unlocks Idle Mode.");
}

function ManagerSponsors () {
	Manager.call(this, "Spencer Chip", 10, 12, 5, "Allows you to recieve sponsors, who will pay you after every game. The amount of each sponsorship increases per level.", "sponsormanager");
}
ManagerSponsors.prototype = Object.create(Manager.prototype);

ManagerSponsors.prototype.notify = function (stateChange){
	if (stateChange.indexOf("money") >= 0){
		if (playerTeamCons.money >= this.baseCost){
			playerTeamCons.managers.push(this);
			unregisterListener(this);
			pushHeadline("You unlocked a new manager: " + this.displayName);
		}
	}
}

function makeManagers() {
	var man = new ManagerSubstitutes();
	registerListener(man);
	managerCons.push(man);
	man = new ManagerContracts();
	registerListener(man);
	managerCons.push(man);
	man = new ManagerTrainer();
	registerListener(man);
	managerCons.push(man);
	man = new ManagerCoach();
	registerListener(man);
	managerCons.push(man);
	man = new ManagerCharismaTrainer();
	managerCons.push(man);
	man = new ManagerCharismaCoach();
	managerCons.push(man);
	man = new ManagerSponsors();
	registerListener(man);
	managerCons.push(man);
}