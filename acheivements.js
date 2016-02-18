function Achieve (title = "", descrip = "", awardedFor = "", id = 0, displayId = 0) {
	this.title = title;
	this.description = descrip;
	this.awardedFor = awardedFor; //Maybe keep this
	this.id = id;
	this.displayId = displayId; //Forward compatibility, I've learned from your mistakes Orteil
}

Achieve.prototype.notify = function (stateChange) {}

function AchieveWin () {
	Achieve.call(this, "Win", "Yay!", "Win 10 games.", 1, 1);
}
AchieveWin.prototype = Object.create(Achieve.prototype);

AchieveWin.prototype.notify = function (stateChange) {
	if (stateChange.indexOf("win") >= 0 && playerTeamCons.wins >= 10){
		achievements.push(this);
		unregisterListener(this);
		pushHeadline("You earned a new achievement: " + this.title);
	}
}

function makeAchievements () {
	listeners.push(new AchieveWin());
}