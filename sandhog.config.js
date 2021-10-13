/* eslint-disable @typescript-eslint/no-require-imports */
// @ts-check

/**
 * @type {import("helpertypes").PartialDeep<import("sandhog").SandhogConfig>}
 */
const config = {
	...require("@wessberg/ts-config/sandhog.config.json"),
	isDevelopmentPackage: true,
	logo: {
		url: "https://raw.githubusercontent.com/wessberg/sass-extended-importer/master/documentation/asset/logo.png",
		height: 200
	}
};
module.exports = config;
