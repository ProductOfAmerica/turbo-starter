module.exports = {
	hooks: {
		afterAllResolved: (lockfile, ctx) => {
			// Approve scripts for specific packages
			lockfile.packages['@biomejs/biome'].scriptsApproved = true;
			lockfile.packages.sharp.scriptsApproved = true;
			return lockfile;
		},
	},
};
