module.exports = {
	hooks: {
		afterAllResolved: (lockfile, ctx) => {
			// Use the full package specifiers from pnpm-lock.yaml with leading "/"
			if (lockfile.packages['/@biomejs/biome@1.9.4']) {
				lockfile.packages['/@biomejs/biome@1.9.4'].scriptsApproved = true;
			}
			if (lockfile.packages['/sharp@0.33.5']) {
				lockfile.packages['/sharp@0.33.5'].scriptsApproved = true;
			}
			return lockfile;
		},
	},
};
