const modes = {
	p2: 'solo',
	p10: 'duo',
	p9: 'squad',
	curr_p2: 'current_solo',
	curr_p10: 'current_duo',
	curr_p9: 'current_squad',
};

/**
 * A Profile
 * @typedef {object} Profile
 * @property {string} id.required - The title
 * @property {string} username - The artist
 * @property {string} platform - The artist
 * @property {string} url - The artist
 * @property {Modes} stats - the stats
 */
class Profile {
	/**
   * @param {Object} profile The stats for this specific profile
   */
	constructor(profile) {
		this.id = profile.accountId;
		this.username = profile.epicUserHandle;
		this.platform = profile.platformNameLong;
		this.url = `https://fortnitetracker.com/profile/${profile.platformName}/${this.username}`;
		this.stats = {};

		for (const mode in profile.stats) {
			this.stats[modes[mode]] = new Mode(profile.stats[mode]);
		}

		this.stats.lifetime = profile.lifeTimeStats.map(stat => new Stat(stat)).reduce((a, b) => ({ ...a, ...b }));
		this.stats.recent = profile.recentMatches.map(game => new Game(game));
	}
}

/**
 * A Game
 * @typedef {object} Game
 * @property {string} warning - The title
 * @property {string} id - The artist
 * @property {string} date - The artist
 * @property {string} score - The artist
 */
class Game {
	/**
   * @param {Object} game Each individual game
   */
	constructor(game) {
		this.warning = 'These stats seem to be botched, this is not my fault. Sorry for any inconvenience.';
		this.id = game.id;
		this.date = game.dateCollected;
		this.mode = modes[game.playlist];
		this.score = game.score;
		this.kills = game.kills;
		this.trn_rating = game.trnRating;
	}
}

/**
 * A Mode
 * @typedef {object} Mode
 * @property {string} score - The title
 * @property {string} kd - The artist
 * @property {string} matches - The artist
 * @property {string} kills - The artist
 */
class Mode {
	/**
   * @param {Object} stat Each individual stat
   */
	constructor(stat) {
		this.score = stat.score.valueInt;
		this.kd = stat.kd.valueDec;
		this.matches = stat.matches.valueInt;
		this.kills = stat.kills.valueInt;
		this.kills_per_match = stat.kpg.valueDec;
		this.score_per_match = stat.scorePerMatch.valueDec;
		this.wins = stat.top1.valueInt;
		this.top_3 = stat.top3.valueInt + this.wins;
		this.top_5 = stat.top5.valueInt + this.top_3 + this.wins;
		this.top_6 = stat.top6.valueInt + this.top_5 + this.top_3 + this.wins;
		this.top_12 = stat.top12.valueInt + this.top_6 + this.top_5 + this.top_3 + this.wins;
		this.top_25 = stat.top25.valueInt + this.top_12 + this.top_6 + this.top_5 + this.top_3 + this.wins;
	}
}

class Stat {
	/**
   * @param {Object} stat Each individual stat
   */
	constructor(stat) {
		stat.value = Number(stat.value);

		switch (stat.key) {
		case 'Score': this.score = stat.value; break;
		case 'K/d': this.kd = stat.value; break;
		case 'Matches Played': this.matches = stat.value; break;
		case 'Kills': this.kills = stat.value; break;
		case 'Wins': this.wins = stat.value; break;
		case 'Top 3s': this.top_3 = stat.value; break;
		case 'Top 5s': this.top_5 = stat.value; break;
		case 'Top 6s': this.top_6 = stat.value; break;
		case 'Top 12s': this.top_12 = stat.value; break;
		case 'Top 25s': this.top_25 = stat.value; break;
		}
	}
}


/**
 * A Modes
 * @typedef {object} Modes
 * @property {Mode} solo - The title
 * @property {Mode} duo - The artist
 * @property {Mode} undefined - The artist
 * @property {Mode} current_solo - The artist
 * @property {Mode} current_duo - the stats
 * @property {Mode} current_squad - the stats
 * @property {Mode} lifetime - the stats
 * @property {array<Game>} recent - the stats
*/

module.exports = Profile;
