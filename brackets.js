/*************************************
4 Team, Best Of 1, Single Elimination, Top 2 Place
*************************************/
function Bracket4TeamMinimal (teams) {
	Bracket.call(this, 6, 7);
	
	this.description = "4 Team, Best of 1, Single Elimination";
	for (var i = 0; i < teams.length; i++){
		this.teams.push(teams[i]);
	}
	for (var i = 0; i < 3; i++){
		this.matches.push(new Game());
	}
	this.matches[0].team1 = this.teams[0];
	this.matches[0].team2 = this.teams[3];
	this.matches[1].team1 = this.teams[1];
	this.matches[1].team2 = this.teams[2];
	this.advancesTo.push(2);
	this.advancesTo.push(2);
	this.matchTier.push(1);
	this.matchTier.push(1);
	this.matchTier.push(0);
	
	this.display[0][0] = "Semi Final 1";
	this.display[4][0] = "Semi Final 2";
	this.display[2][4] = "Final";
	this.dispFill[1][0] = "m0.t1.";
	this.dispFill[1][1] = "m0.s1.";
	this.dispFill[2][0] = "m0.t2.";
	this.dispFill[2][1] = "m0.s2.";
	this.dispFill[5][0] = "m1.t1.";
	this.dispFill[5][1] = "m1.s1.";
	this.dispFill[6][0] = "m1.t2.";
	this.dispFill[6][1] = "m1.s2.";
	this.dispFill[3][4] = "m2.t1.";
	this.dispFill[3][5] = "m2.s1.";
	this.dispFill[4][4] = "m2.t2.";
	this.dispFill[4][5] = "m2.s2.";
	this.dispClasses[1][2] = "bottom spacing";
	this.dispClasses[5][2] = "bottom";
	this.dispClasses[3][3] = "bottom left spacing";
	this.dispClasses[2][3] = "left"
	this.dispClasses[4][3] = "left";
	this.dispClasses[5][3] = "left";
	this.dispClasses[0][0] = "b-title";
	this.dispClasses[4][0] = "b-title";
	this.dispClasses[2][4] = "b-title";
}

Bracket4TeamMinimal.prototype = Object.create(Bracket.prototype);

Bracket4TeamMinimal.prototype.updateResultsRank = function () {
	//Remember this function gets called before this.playing is incremented, but after the match
	if (this.playing == 2){
		this.resultsRank.push(this.matches[this.playing].winner);
		this.resultsRank.push(this.matches[this.playing].loser);
	}
}

/*************************************
8 Team, Best Of 1, Double Elimination, Top 8 Place
*************************************/
function Bracket8TeamDoubleElimFull (teams) {
	Bracket.call(this, 17, 19);
	
	this.description = "8 Team, Best of 1, Double Elimination with 7th/8th and 5th/6th place matches"
	for (var i = 0; i < teams.length; i++){
		this.teams.push(teams[i]);
	}
	for (var i = 0; i < 16; i++){
		this.matches.push(new Game());
	}
	this.matches[0].team1 = this.teams[0];
	this.matches[0].team2 = this.teams[7];
	this.matches[1].team1 = this.teams[3];
	this.matches[1].team2 = this.teams[4];
	this.matches[2].team1 = this.teams[1];
	this.matches[2].team2 = this.teams[6];
	this.matches[3].team1 = this.teams[2];
	this.matches[3].team2 = this.teams[5];
	this.advancesTo = [6, 6, 7, 7, 8, 9, 13, 13, 12, 12, undefined, undefined, 14, 15, 15];
	this.retreatsTo = [4, 4, 5, 5, 10, 10, 9, 8, 11, 11, undefined, undefined, undefined, 14];
	this.resultsRank= [0,0,0,0,0,0,0,0];
	
	this.display[0][0] = "Round 1"; this.dispClasses[0][0] = "b-title";
	this.display[13][0] = "Round 2"; this.dispClasses[13][0] = "b-title";
	this.display[0][4] = "Round 2"; this.dispClasses[0][4] = "b-title";
	this.display[10][4] = "Round 3"; this.dispClasses[10][4] = "b-title";
	this.display[0][8] = "Winner's Semifinal"; this.dispClasses[0][8] = "b-title";
	this.display[5][8] = "Loser's Semifinal"; this.dispClasses[5][8] = "b-title";
	this.display[11][8] = "7th/8th Place Match"; this.dispClasses[11][8] = "b-title";
	this.display[5][11] = "3rd Place Match"; this.dispClasses[5][11] = "b-title";
	this.display[11][11] = "5th/6th Place Match"; this.dispClasses[11][11] = "b-title";
	this.display[2][15] = "Final"; this.dispClasses[2][15] = "b-title";
	this.dispFill[1][0] = "m0.t1."; this.dispFill[1][1] = "m0.s1."; this.dispFill[2][0] = "m0.t2."; this.dispFill[2][1] = "m0.s2.";
	this.dispFill[4][0] = "m1.t1."; this.dispFill[4][1] = "m1.s1."; this.dispFill[5][0] = "m1.t2."; this.dispFill[5][1] = "m1.s2.";
	this.dispFill[7][0] = "m2.t1."; this.dispFill[7][1] = "m2.s1."; this.dispFill[8][0] = "m2.t2."; this.dispFill[8][1] = "m2.s2.";
	this.dispFill[10][0] = "m3.t1."; this.dispFill[10][1] = "m3.s1."; this.dispFill[11][0] = "m3.t2."; this.dispFill[11][1] = "m3.s2.";
	this.dispFill[14][0] = "m4.t1."; this.dispFill[14][1] = "m4.s1."; this.dispFill[15][0] = "m4.t2."; this.dispFill[15][1] = "m4.s2.";
	this.dispFill[17][0] = "m5.t1."; this.dispFill[17][1] = "m5.s1."; this.dispFill[18][0] = "m5.t2."; this.dispFill[18][1] = "m5.s2.";
	this.dispFill[1][4] = "m6.t1."; this.dispFill[1][5] = "m6.s1."; this.dispFill[2][4] = "m6.t2."; this.dispFill[2][5] = "m6.s2.";
	this.dispFill[5][4] = "m7.t1."; this.dispFill[5][5] = "m7.s1."; this.dispFill[6][4] = "m7.t2."; this.dispFill[6][5] = "m7.s2.";
	this.dispFill[11][4] = "m8.t1."; this.dispFill[11][5] = "m8.s1."; this.dispFill[12][4] = "m8.t2."; this.dispFill[12][5] = "m8.s2.";
	this.dispFill[15][4] = "m9.t1."; this.dispFill[15][5] = "m9.s1."; this.dispFill[16][4] = "m9.t2."; this.dispFill[16][5] = "m9.s2.";
	this.dispFill[12][8] = "m10.t1."; this.dispFill[12][9] = "m10.s1."; this.dispFill[13][8] = "m10.t2."; this.dispFill[13][9] = "m10.s2.";
	this.dispFill[12][11] = "m11.t1."; this.dispFill[12][12] = "m11.s1."; this.dispFill[13][11] = "m11.t2."; this.dispFill[13][12] = "m11.s2.";
	this.dispFill[6][8] = "m12.t1."; this.dispFill[6][9] = "m12.s1."; this.dispFill[7][8] = "m12.t2."; this.dispFill[7][9] = "m12.s2.";
	this.dispFill[1][8] = "m13.t1."; this.dispFill[1][9] = "m13.s1."; this.dispFill[2][8] = "m13.t2."; this.dispFill[2][9] = "m13.s2.";
	this.dispFill[6][11] = "m14.t1."; this.dispFill[6][12] = "m14.s1."; this.dispFill[7][11] = "m14.t2."; this.dispFill[7][12] = "m14.s2.";
	this.dispFill[3][15] = "m15.t1."; this.dispFill[3][16] = "m15.s1."; this.dispFill[4][15] = "m15.t2."; this.dispFill[4][16] = "m15.s2.";
	this.dispClasses[1][2] = "bottom spacing"; this.dispClasses[4][2] = "bottom"; this.dispClasses[7][2] = "bottom"; this.dispClasses[10][2] = "bottom"; this.dispClasses[14][2] = "bottom"; this.dispClasses[17][2] = "bottom";
	this.dispClasses[1][3] = "bottom spacing"; this.dispClasses[5][3] = "bottom"; this.dispClasses[11][3] = "bottom"; this.dispClasses[15][3] = "bottom";
	this.dispClasses[1][6] = "bottom spacing"; this.dispClasses[5][6] = "bottom"; this.dispClasses[11][6] = "bottom"; this.dispClasses[15][6] = "bottom";
	this.dispClasses[1][7] = "bottom spacing"; this.dispClasses[6][7] = "bottom";
	this.dispClasses[1][10] = "bottom spacing"; this.dispClasses[6][10] = "bottom"; this.dispClasses[1][11] = "bottom"; this.dispClasses[1][12] = "bottom";
	this.dispClasses[1][13] = "bottom spacing"; this.dispClasses[6][13] = "bottom"; this.dispClasses[3][14] = "bottom spacing";
	var cols = [3,3,3,3,3,3,3,3, 3, 3, 3, 3, 3, 7,7,7,7,7,7,7,7, 7, 7, 7, 7, 7, 14,14,14,14,14];
	var rows = [2,3,4,6,7,8,9,10,12,13,14,16,17,2,3,4,5,7,8,9,10,11,12,13,14,15,2, 3, 4, 5, 6];
	for (var i = 0; i < rows.length; i++){
		if (this.dispClasses[rows[i]][cols[i]]){
			this.dispClasses[rows[i]][cols[i]] += " left";
		} else {
			this.dispClasses[rows[i]][cols[i]] = "left";
		}
	}
}

Bracket8TeamDoubleElimFull.prototype = Object.create(Bracket.prototype);

Bracket8TeamDoubleElimFull.prototype.updateResultsRank = function () {
	if (this.playing == 10){
		this.resultsRank[7] = this.matches[10].loser;
		this.resultsRank[6] = this.matches[10].winner;
	}
	if (this.playing == 11){
		this.resultsRank[5] = this.matches[11].loser;
		this.resultsRank[4] = this.matches[11].winner;
	}
	if (this.playing == 12){
		this.resultsRank[3] = this.matches[12].loser;
	}
	if (this.playing == 14){
		this.resultsRank[2] = this.matches[14].loser;
	}
	if (this.playing == 15){
		if (this.matches[15].winner === this.matches[15].team1){
			this.resultsRank[1] = this.matches[15].loser;
			this.resultsRank[0] = this.matches[15].winner;
		} else {
			this.matches.push(new Game());
			this.matches[16].team1 = this.matches[15].winner;
			this.matches[16].team2 = this.matches[15].loser;
			this.display[6][15] = "Grand Final"; this.dispClasses[6][15] = "b-title";
			this.dispFill[7][15] = "m16.t1."; this.dispFill[7][16] = "m16.s1."; this.dispFill[8][15] = "m16.t2."; this.dispFill[8][16] = "m16.s2.";
		}
	}
	if (this.playing == 16){
		this.resultsRank[1] = this.matches[16].loser;
		this.resultsRank[0] = this.matches[16].winner;
	}
}

/*************************************
16 Team, Best Of 3, Single Elimination, Top 4 Place
*************************************/
function Bracket16TeamBo3SingleElimWith3rdPlace (teams) {
	Bracket.call(this);
	
	this.description = "16 Team, Best of 3, Single Elimination with 3rd place match";
	for (var i = 0; i < teams.length; i++){
		this.teams.push(teams[i]);
	}
	for (var i = 0; i < 16; i++){
		this.matches.push(new Match(3));
	}
	this.matches[0].team1 = this.teams[0];
	this.matches[0].team2 = this.teams[15];
	this.matches[1].team1 = this.teams[7];
	this.matches[1].team2 = this.teams[8];
	this.matches[2].team1 = this.teams[3];
	this.matches[2].team2 = this.teams[12];
	this.matches[3].team1 = this.teams[4];
	this.matches[3].team2 = this.teams[11];
	this.matches[4].team1 = this.teams[1];
	this.matches[4].team2 = this.teams[14];
	this.matches[5].team1 = this.teams[6];
	this.matches[5].team2 = this.teams[9];
	this.matches[6].team1 = this.teams[2];
	this.matches[6].team2 = this.teams[13];
	this.matches[7].team1 = this.teams[5];
	this.matches[7].team2 = this.teams[10];
	this.resultsRank = [0, 0, 0, 0];
	this.advancesTo = [8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 15, 15];
	this.retreatsTo = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 14, 14];
}

Bracket16TeamBo3SingleElimWith3rdPlace.prototype = Object.create(Bracket.prototype);

Bracket16TeamBo3SingleElimWith3rdPlace.prototype.updateResultsRank = function () {
	if (this.playing == 14){
		this.resultsRank[2] = this.matches[this.playing].winner;
		this.resultsRank[3] = this.matches[this.playing].loser;
	}
	if (this.playing == 15){
		this.resultsRank[0] = this.matches[this.playing].winner;
		this.resultsRank[1] = this.matches[this.playing].loser;
	}
}

function Promotion2TeamBO3 (teams) {
	Bracket.call(this);
	
	for (var i = 0; i < teams.length; i++){
		this.teams.push(teams[i]);
	}
	this.matches.push(new Match(3));
	this.matches[0].team1 = this.teams[0];
	this.matches[0].team2 = this.teams[1];
}

Promotion2TeamBO3.prototype = Object.create(Bracket.prototype);

Promotion2TeamBO3.prototype.updateResultsRank = function () {
	if (this.playing == 0){
		this.resultsRank.push(this.matches[0].winner);
		this.resultsRank.push(this.matches[0].loser);
	}
}

//Brackets To Add

/**********************************
Brackets To Add:

16 Team Bo3 With Third Place Match (Place Top 4)
16 Team Bo5 Single Elim (Place Top 2)
8 Team Bo3 Double Elim Full
12 Team Bo3 Single Elim (Top 8 get Placed) (Top 4 form RegSeason get advantage)
16 Team 4x4 Groups Top 3 TO 8 Team Bo5 Single ELim With 3 rd place match (Top 4 place)
4 Team Bo7 Double Elim
6 Team Bo7 Double Elim (Top 2 Get Advantage)
8 Team Bo5 Double Elim (Place Top 2)
8 Team Bo5 Single Elim With 3rd Place match
20 Team ???
16 Team Bo5 Single Elim (Top 6 Place)
8 Team Bo7 Single Elim With 3rd Place
8 Team Bo7 Double Elim (Top 4 Place)
12 Team 2x4 Groups Top 4 bye Bo7 Double Elim


**********************************/