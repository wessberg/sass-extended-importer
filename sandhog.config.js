import baseConfig from "@wessberg/ts-config/sandhog.config.js";

export default {
	...baseConfig,
	isDevelopmentPackage: true,
	logo: {
		url: "https://raw.githubusercontent.com/wessberg/sass-extended-importer/master/documentation/asset/logo.png",
		height: 200
	}
};
