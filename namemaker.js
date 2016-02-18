var consonantLead = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'qu', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z', 'bl', 'br', 'ch', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gn', 'gr', 'kh', 'kl', 'kr', 'kw', 'pf', 'ph', 'pl', 'pr', 'pw', 'rh', 'sc', 'sh', 'sk', 'sl', 'sm', 'sn', 'sp', 'st', 'sw', 'scr', 'spr', 'str', 'th', 'tr', 'ts', 'tw', 'vl', 'wr', 'zh', 'zl', 'zr'];
var consLeadWeigh = [9,   5,   11,  5,   5,   3,   1,   5,   7,    7,   7,   9,   2,    8,   8,   9,   3,   4,   1,   1,   2,   1,    1,    3,    2,    2,    1,    1,    1,    1,    1,    2,    1,    1,    1,    1,    1,    2,    2,    2,    1,    1,    3,    4,    1,    2,    2,    2,    3,   3,     1,    2,     3,     3,     3,    2,    1,    1,    1,    1,    1,    1,    1];
var consLeadTot = 0;
for (var i = 0; i < consLeadWeigh.length; i++){
	consLeadTot += consLeadWeigh[i];
}
var consLeadProb = [];
var consLeadRun = 0;
for (var i = 0; i < consLeadWeigh.length; i++){
	consLeadRun += consLeadWeigh[i];
	consLeadProb.push(consLeadRun / consLeadTot);
}
var consonantMid = ['b', 'bb', 'c', 'cc', 'd', 'dd', 'f', 'ff', 'g', 'gg', 'h', 'j', 'k', 'l', 'll', 'm', 'mm', 'n', 'nn', 'p', 'pp', 'r', 'rr', 's', 'ss', 't', 'tt', 'v', 'w', 'x', 'z', 'dg', 'lg', 'lm', 'nc'];
var consMidWeigh = [3,   1,     3,   2,   3,   1,    3,    1,    3,    1,   3,   1,   3,   3,   1,    3,    2,   3,    2,    3,   1,    3,    1,  3,    1,   3,  2,     2,   2,   1,   1,   1,   1,     1,    1];
var consMidTot = 0;
for (var i = 0; i < consMidWeigh.length; i++){
	consMidTot += consMidWeigh[i];
}
var consMidProb = [];
var consMidRun = 0;
for (var i = 0; i < consMidWeigh.length; i++){
	consMidRun += consMidWeigh[i];
	consMidProb.push(consMidRun / consMidTot);
}
var consonantEnd = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z', 'bs', 'bz', 'ck', 'ct', 'cs', 'cks', 'ds', 'ft', 'fs', 'gh', 'gs', 'gth', 'hk', 'hl', 'hn', 'ht', 'kt', 'ks', 'lb', 'lc', 'ld', 'lf', 'lg', 'lk', 'lm', 'lp', 'ls', 'lt', 'll', 'mf', 'mn', 'mp', 'ms', 'nc', 'nd', 'ng', 'nk', 'nt', 'nth', 'nts', 'nths', 'ngths', 'pt', 'ps', 'rb', 'rc', 'rd', 'rf', 'rg', 'rm', 'rn', 'rp', 'rs', 'rt', 'sh', 'sk', 'sp', 'st', 'th', 'ts'];
var consEndWeigh = [3,   2,   3,   2,   2,   1,   1,    2,   2,   2,   2,   2,   2,   2,   2,   1,   2,   2,   2,   1,   1,    1,    2,    1,    1,    2,     1,    1,    1,    2,    1,    1,     1,    1,    1,    1,    1,    1,    1,    1,    1,    1,    1,    1,    1,    1,    1,    1,    1,    1,    1,    1,    1,    1,    1,   2,     1,    1,   2,     1,     1,       1,       1,    1,    1,    1,    1,    1,    1,    1,    1,    1,    1,    1,    3,    1,    2,    2,    2,    2];
var consEndTot = 0;
for (var i = 0; i < consEndWeigh.length; i++){
	consEndTot += consEndWeigh[i];
}
var consEndProb = [];
var consEndRun = 0;
for (var i = 0; i < consEndWeigh.length; i++){
	consEndRun += consEndWeigh[i];
	consEndProb.push(consEndRun / consEndTot);
}
var vowels = ['a', 'e', 'i', 'o', 'u' ,'y', 'ae', 'ai', 'au', 'ay', 'ea', 'ee', 'ei', 'eu', 'ey', 'ie', 'oa', 'oe', 'oi', 'oo', 'ou', 'ua', 'ue', 'ui', 'uo'];
var vowWeigh=[5,   10,  4,   6,   4,   2,   1,    3,    2,    1,    2,    3,    1,    1,    1,    2,    2,    1,    3,    2,    2,    1,    1,    1,    1];
var vowTot = 0;
for (var i = 0; i < vowWeigh.length; i++){
	vowTot += vowWeigh[i];
}
var vowProb = [];
var vowRun = 0;
for (var i = 0; i < vowWeigh.length; i++){
	vowRun += vowWeigh[i];
	vowProb.push(vowRun / vowTot);
}


function makeName() {
	var name = "";
	var structure = [];
	var structLength = Math.floor(Math.random() * 5) + 3; //A random int between 3 and 7 (inclusive)
	if (Math.random() < 0.75){
		structure.push('c');
	} else {
		structure.push('v');
	}
	for (var j = 1; j < structLength; j++){
		if (structure[j-1] == 'v'){
			structure.push('c');
		} else {
			if (j+1 == structLength){
				structure.push('v');
			} else if (structure[j-2] === undefined || structure[j-2] == 'c'){
				structure.push('v');
			} else {
				if (Math.random() < 0.75){
					structure.push('v');
				} else {
					structure.push('c');
				}
			}
		}
	}
	for (var j = 0; j < structLength; j++){
		if (structure[j] == 'c'){
			if (structure[j-1] === undefined){
				name += pickFrom(consonantLead, consLeadProb); //consonantLead[Math.floor(Math.random() * consonantLead.length)];
			} else {
				if (structure[j-1] == 'c'){
					name += pickFrom(consonantLead, consLeadProb); //consonantLead[Math.floor(Math.random() * consonantLead.length)];
				} else {
					if (structure[j+1] === undefined || structure[j+1] == 'c'){
						name += pickFrom(consonantEnd, consEndProb); //consonantEnd[Math.floor(Math.random() * consonantEnd.length)];
					} else {
						name += pickFrom(consonantMid, consMidProb); //consonantMid[Math.floor(Math.random() * consonantMid.length)];
					}
				}
			}
		} else {
			name += pickFrom(vowels, vowProb); //vowels[Math.floor(Math.random() * vowels.length)];
		}
	}
	return name;
}

function pickFrom(arr, prob){
	//fails if the probability for something is 0
	var choose = Math.random();
	if (choose < prob[0]){
		return arr[0];
	}
	for (var j = 0; j < prob.length - 1; j++){
		if (choose > prob[j] && choose < prob[j+1]){
			return arr[j+1];
		}
	}
	return arr[arr.length - 1];
}

var adjectives = {
	'a': ['awesome', 'acrobatic', 'artistic', 'alcoholic', 'alternative', 'apparent', 'altruistic', 'amphibious', 'astrological', 'ambient', 'acidic', 'ambiguous', 'applicable', 'advanced', 'agile'],
	'b': ['beautiful', 'botanical', 'bad-ass', 'bombastic', 'bashful', 'basic', 'blue', 'black', 'brown'],
	'c': ['cool', 'charismatic', 'coordinated', 'compulsive', 'compassionate', 'cooperative', 'colonial', 'capable', 'competitive', 'convivial', 'conservatice', 'chaotic'],
	'd': ['diabolical', 'delicious', 'dimensional', 'dilusional', 'diatery', 'dapper', 'dubious', 'deplorable'],
	'e': ['ellusive', 'elegant', 'exclusive', 'elastic', 'egalitarian', 'ethical', 'existential', 'emergent', 'enormous', 'empathetic', 'evil'],
	'f': ['furry', 'furious', 'fantastic', 'famous', 'familiar', 'ferocious', 'fashionable', 'fast'],
	'g': ['gallant', 'gargantuan', 'galatic', 'glacial', 'green', 'golden', 'glowing', 'gacious', 'generous'],
	'h': ['happy', 'horrific', 'horrible', 'hasty', 'hysterical', 'hopeful', 'holy', 'hungry'],
	'i': ['incredible', 'illustrious', 'innovative', 'intelligent', 'inspirational', 'intellectual', 'imperative', 'impossible', 'inquisitive', 'inclusive', 'implicit', 'intuitive'],
	'j': ['junior', 'jumbo'],
	'k': ['knowledgable', 'kinetic'],
	'l': ['linguistic', 'laborious', 'little', 'lucious', 'lateral', 'liquid', 'liberal', 'lawful'],
	'm': ['merry', 'mighty', 'manly', 'memorable', 'monastic', 'magical', 'medievil', 'master', 'moniacal', 'mischievous'],
	'n': ['naughty', 'nimble', 'nefarious', 'native', 'northern', 'notorious', 'nuetral'],
	'o': ['ostentatious', 'ominous', 'obvious', 'obsessive', 'orange', 'obnoxious'],
	'p': ['poignant', 'pretty', 'princely', 'patogonian', 'pretentious', 'palpable', 'popular', 'punctual', 'pragmatic', 'purple', 'pink', 'platinum', 'pernerious'],
	'q': ['quick', 'quintupled', 'quiet', 'questionable'],
	'r': ['rambunctious', 'rebellious', 'revenant', 'recycled', 'renewed', 'resourceful', 'red'],
	's': ['saintly', 'shallow', 'scary', 'special', 'super', 'sarcastic', 'scholastic', 'sloppy', 'sympathetic', 'strong', 'solar', 'silver', 'stupedous', 'serendipitous', 'silly', 'spry', 'speedy', 'solid'],
	't': ['tantalizing', 'tactful', 'terrible', 'tribal', 'tough', 'titanic', 'terrifying'],
	'u': ['ubiquitous', 'uinversal', 'undulating', 'ultimate', 'unrestrained'],
	'v': ['venerable', 'vindicated', 'vicarious', 'vengeful', 'verdant', 'vibrant'],
	'w': ['wobbly', 'warranted', 'wild'],
	'x': ['xenophobic'],
	'y': ['yikkity', 'yellow'],
	'z': ['zany'],
}

var nouns = {
	'a': ['aardvarks', 'armadillos', 'apes', 'alpacas', 'aligators', 'antelope', 'angels', 'amoebas', 'astronauts', 'arachnids', 'archers', 'abominations'],
	'b': ['bats', 'bomberdiers', 'bandits', 'buffalo', 'bulls', 'birds', 'belugas', 'bears', 'bluejays', 'barbarians', 'bumblebees', 'beavers', 'butterflies', 'broncos', 'bishops'],
	'c': ['cats', 'cows', 'chimpanzees', 'condors', 'crocodiles', 'cowboys', 'caridnals', 'colonels', 'commanders', 'captains', 'corporals', 'colts', 'chipmunks', 'cavalry', 'crickets'],
	'd': ['dogs', 'deer', 'dentists', 'daredevils', 'dragons', 'dolphins', 'ducks', 'donkeys', 'demons', 'dwarves', 'drakes', 'destroyers', 'deputies'],
	'e': ['emus', 'ewes', 'eskimos', 'elephants', 'eagles', 'elves', 'echidnas'],
	'f': ['flamingos', 'ferrets', 'frogs', 'falcons', 'foxes', 'flounders', 'finches', 'fennecs', 'fireflies'],
	'g': ['gorillas', 'giants', 'geese', 'grizzlies', 'giraffes', 'goats', 'ghosts', 'generals', 'ghouls', 'goblins', 'gurus', 'gophers', 'groundhogs', 'gerbils'],
	'h': ['harbingers', 'haberdashers', 'hamsters', 'horses', 'hornets', 'hawks', 'hippos', 'herons', 'hedgehogs'],
	'i': ['igloos', 'iguanas', 'inuits', 'insects', 'infantry'],
	'j': ['jaguars', 'jets', 'jousters', 'jokers'],
	'k': ['kangaroos', 'koalas', 'knights', 'kings', 'kappas'],
	'l': ['llamas', 'lobsters', 'lions', 'lynxes', 'lieutenants', 'leopards', 'lancers', 'leeches', 'lightnings'],
	'm': ['mastiffs', 'mice', 'mustangs', 'monkeys', 'manitees', 'mules', 'moths', 'monsters', 'midgets', 'mongrels', 'mallards', 'miners', 'minesweepers', 'minutemen', 'monks', 'moles'],
	'n': ['necromancers', 'newts', 'narwhals', 'ninjas'],
	'o': ['oysters', 'ostriches', 'orangutans', 'owls', 'ocelots', 'oxen', 'otters', 'octopuses'],
	'p': ['pigs', 'panthers', 'parrots', 'pandas', 'parakeets', 'poultry', 'ponies', 'penguins', 'pirates', 'poets', 'pigeons', 'paratroopers', 'peacocks', 'platypusses', 'pikas', 'pawns'],
	'q': ['quails', 'queens', 'quesadillas'],
	'r': ['rottweilers', 'renegades', 'rascals', 'rams', 'rocks', 'reindeer', 'rooks'],
	's': ['snakes', 'sheep', 'sloths', 'salamanders', 'sharks', 'swordfish', 'slugs', 'seals', 'stars', 'sergeants', 'skeletons', 'scientists', 'saprtans', 'scorpians', 'spiders', 'storks', 'swans', 'squirrels', 'sailors', 'sherrifs', 'squids'],
	't': ['tacticians', 'toasters', 'tucans', 'tigers', 'turtles', 'tortises', 'toads', 'titans', 'trojans', 'tarnatulas', 'turkeys', 'thunders', 'trolls', 'twins', 'triplets'],
	'u': ['utilitarians'],
	'v': ['vigilantes', 'vampires', 'vertebrates'],
	'w': ['wombats', 'whales', 'walruses', 'wasps', 'wildabeast', 'wizards', 'warriors', 'woodpeckers', 'witches', 'wallabies'],
	'x': ['xylophones'],
	'y': ['yaks', 'yetis'],
	'z': ['zebras'],
}

var adjTot = 0;
for (key in adjectives){
	adjTot += adjectives[key].length * nouns[key].length;
}
var adjProb = [];
var adjRun = 0;
for (key in adjectives){
	adjRun += adjectives[key].length * nouns[key].length;
	adjProb.push(adjRun / adjTot);
}

var letters = 'abcdefghijklmnopqrstuvwxyz';

function alliterativeName () {
	var chr = pickFrom(letters, adjProb);
	var adjName = adjectives[chr][Math.floor(Math.random()*adjectives[chr].length)];
	var nounName = nouns[chr][Math.floor(Math.random()*nouns[chr].length)];
	return adjName.slice(0,1).toUpperCase() + adjName.slice(1) + " " + nounName.slice(0,1).toUpperCase() + nounName.slice(1);
}