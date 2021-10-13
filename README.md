<!-- SHADOW_SECTION_LOGO_START -->

<div><img alt="Logo" src="https://raw.githubusercontent.com/wessberg/sass-extended-importer/master/documentation/asset/logo.png" height="200"   /></div>

<!-- SHADOW_SECTION_LOGO_END -->

<!-- SHADOW_SECTION_DESCRIPTION_SHORT_START -->

> A Custom Sass Import Resolver with included support for Node Module Resolution, additional file extensions, and path mapping

<!-- SHADOW_SECTION_DESCRIPTION_SHORT_END -->

<!-- SHADOW_SECTION_BADGES_START -->

<a href="https://npmcharts.com/compare/sass-extended-importer?minimal=true"><img alt="Downloads per month" src="https://img.shields.io/npm/dm/sass-extended-importer.svg"    /></a>
<a href="https://www.npmjs.com/package/sass-extended-importer"><img alt="NPM version" src="https://badge.fury.io/js/sass-extended-importer.svg"    /></a>
<a href="https://david-dm.org/wessberg/sass-extended-importer"><img alt="Dependencies" src="https://img.shields.io/david/wessberg%2Fsass-extended-importer.svg"    /></a>
<a href="https://github.com/wessberg/sass-extended-importer/graphs/contributors"><img alt="Contributors" src="https://img.shields.io/github/contributors/wessberg%2Fsass-extended-importer.svg"    /></a>
<a href="https://github.com/prettier/prettier"><img alt="code style: prettier" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg"    /></a>
<a href="https://opensource.org/licenses/MIT"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg"    /></a>
<a href="https://www.patreon.com/bePatron?u=11315442"><img alt="Support on Patreon" src="https://img.shields.io/badge/patreon-donate-green.svg"    /></a>

<!-- SHADOW_SECTION_BADGES_END -->

<!-- SHADOW_SECTION_DESCRIPTION_LONG_START -->

## Description

<!-- SHADOW_SECTION_DESCRIPTION_LONG_END -->

This is an implementation of the [Sass Import Resolve algorithm](https://github.com/sass/dart-sass/blob/0f7f9e69a72e612412b51bfa2fe1384f778e2821/lib/src/importer/utils.dart), with added support for [Node Module Resolution](https://nodejs.org/api/modules.html#modules_all_together), and path mapping/path aliasing.

At the moment, without this Custom importer, to import files via Node Module Resolution, Sass library creators and consumers can:

- Ship `.scss`, `.sass`, or `.css` files via `node_modules`, and let consumers depend on files directly, - but not support hoisted dependencies/monorepos.
- Use [`Eyeglass`](https://github.com/sass-eyeglass/eyeglass)

There are no known other import resolvers that support path mapping, which can be useful for simplifying import paths or dividing packages in a monorepo.

This implementation follows the convention of existing tooling and similar solutions that paths with a leading `~` will be resolved via [Node Module Resolution](https://nodejs.org/api/modules.html#modules_all_together).

<!-- SHADOW_SECTION_FEATURES_START -->

### Features

<!-- SHADOW_SECTION_FEATURES_END -->

<!-- SHADOW_SECTION_FEATURE_IMAGE_START -->

<!-- SHADOW_SECTION_FEATURE_IMAGE_END -->

<!-- SHADOW_SECTION_BACKERS_START -->

## Backers

[Become a sponsor/backer](https://github.com/wessberg/sass-extended-importer?sponsor=1) and get your logo listed here.

| <a href="https://usebubbles.com"><img alt="Bubbles" src="https://uploads-ssl.webflow.com/5d682047c28b217055606673/5e5360be16879c1d0dca6514_icon-thin-128x128%402x.png" height="70"   /></a> | <a href="https://github.com/cblanc"><img alt="Christopher Blanchard" src="https://avatars0.githubusercontent.com/u/2160685?s=400&v=4" height="70"   /></a> | <a href="https://github.com/ideal-postcodes"><img alt="Ideal Postcodes" src="https://avatars.githubusercontent.com/u/4996310?s=200&v=4" height="70"   /></a> | <a href="https://www.xerox.com"><img alt="Xerox" src="https://avatars.githubusercontent.com/u/9158512?s=200&v=4" height="70"   /></a> | <a href="https://changelog.me"><img alt="Trent Raymond" src="https://avatars.githubusercontent.com/u/1509616?v=4" height="70"   /></a> |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| [Bubbles](https://usebubbles.com)<br><strong>Twitter</strong>: [@usebubbles](https://twitter.com/usebubbles)                                                                                | [Christopher Blanchard](https://github.com/cblanc)                                                                                                         | [Ideal Postcodes](https://github.com/ideal-postcodes)                                                                                                        | [Xerox](https://www.xerox.com)                                                                                                        | [Trent Raymond](https://changelog.me)                                                                                                  |

### Patreon

<a href="https://www.patreon.com/bePatron?u=11315442"><img alt="Patrons on Patreon" src="https://img.shields.io/endpoint.svg?url=https%3A%2F%2Fshieldsio-patreon.vercel.app%2Fapi%3Fusername%3Dwessberg%26type%3Dpatrons"  width="200"  /></a>

<!-- SHADOW_SECTION_BACKERS_END -->

<!-- SHADOW_SECTION_TOC_START -->

## Table of Contents

- [Description](#description)
  - [Features](#features)
- [Backers](#backers)
  - [Patreon](#patreon)
- [Table of Contents](#table-of-contents)
- [Install](#install)
  - [npm](#npm)
  - [Yarn](#yarn)
  - [pnpm](#pnpm)
- [Usage](#usage)
- [Contributing](#contributing)
- [Maintainers](#maintainers)
- [FAQ](#faq)
- [License](#license)

<!-- SHADOW_SECTION_TOC_END -->

<!-- SHADOW_SECTION_INSTALL_START -->

## Install

### npm

```
$ npm install sass-extended-importer --save-dev
```

### Yarn

```
$ yarn add sass-extended-importer --dev
```

### pnpm

```
$ pnpm add sass-extended-importer --save-dev
```

<!-- SHADOW_SECTION_INSTALL_END -->

<!-- SHADOW_SECTION_USAGE_START -->

## Usage

<!-- SHADOW_SECTION_USAGE_END -->

### Usage with sass

To use it with the primary [`sass`](https://github.com/sass/dart-sass) package (dart-sass), simply import the default export from this package and invoke it with the options you want to provide.
Then pass it to `sass` is an import resolver:

```typescript
import importer from "sass-extended-importer";
import sass from "sass";

sass({
			file: "/path/to/your/file.scss",
			importer: importer({
        // options
      })
		});
```

### Usage with node-sass

To use it with [`node-sass`](https://github.com/sass/node-sass), simply import the default export from this package and invoke it with the options you want to provide.
Then pass it to `node-sass` is an import resolver:

```typescript
import importer from "sass-extended-importer";
import sass from "node-sass";

sass({
			file: "/path/to/your/file.scss",
			importer: importer({
        // options
      })
		});
```

### Resolving files within Node Modules

Prefix the path with a `~` to indicate that the Node Module Resolution algorithm should be used:

```scss
@import "~my-library";
```

The resolve function will use [Node Module Resolution](https://nodejs.org/api/modules.html#modules_all_together) to find the library, and then look at the `main` property within the related `package.json` file.
If it points to a file, for example `index.js`, for which there is an identically named file with an extension of `.scss`, `.sass` , or `.css`, or if the `main`
property directly points to a file with a supported extension, that file will be resolved. Alternatively, if the main property is left out, it will default to looking for a file called `index` with one of the supported extensions directly within the package folder.

This means that all of the following examples will work:

```scss
// Uses the package.json file's main property to look for a file with a supported extension.
// Defaults to looking for a file named `index` with a supported extension
@import "~my-library";

// Specifically looks for a file called 'index' inside the package folder, with a supported extension
@import "~my-library/index";

// Specifically looks for a file with the filename `index.scss`
@import "~my-library/index.scss";

// Looks inside the /foo folder from the package folder and for a file called `bar` with a supported extension
// (or if bar is a folder, a file within it called `index` with a supported extension)
@import "~my-library/foo/bar";
```

#### Customizing the prefix

The default prefix of `~` (tilde) is a convention used by several popular tools and is the general recommendation. However, you can customize it with the `nodeModuleResolutionPrefix` option for the importer:

```typescript
import importer from "sass-extended-importer";
import sass from "sass";

sass({
			// ...
			importer: importer({
        // Use # instead of ~
        nodeModuleResolutionPrefix: "#"
      })
		});
```

### Path mapping/aliasing

You can use path mapping to map import paths to other import paths.
This can be useful to simplify import statements, or if you use sass/scss/css in combination with a build pipeline that performs path mapping on your other application- or library code.
For example, you might be using TypeScript's path mapping feature, and want to make sure the same paths are supported inside the sass/scss/css files you're importing from there.
You can customize it with the `paths` option for the importer:  

```typescript
import importer from "sass-extended-importer";
import sass from "sass";

sass({
			// ...
			importer: importer({
        paths: {
          "my-alias": ["../other-folder/src/index.scss"],
          "my-alias/*": ["../other-folder/src/*"]
        }
      })
		});
```

This allows you do write styles such as:

```scss
@import "my-alias/foo";
```

Which will actually be mapped to `../other-folder/src/foo.scss`.

### Adjusting allowed extensions

You can alter what kind of extensions that can be resolved via the `extensions` option for the importer:

```typescript
import importer from "sass-extended-importer";
import sass from "sass";

sass({
			// ...
			importer: importer({
        // Use # instead of ~
        extensions: [
          ".myextension",
          ".foo",
          ".bar"
        ]
      })
		});
```

### Customizing the file system

If you use a virtual file system, such as one that exists within memory, you can pass it in as the `fileSystem` option for the importer. If you don't, it defaults to using the `fs` module:

```typescript
import importer from "sass-extended-importer";
import sass from "sass";
import path from "path";
import {createFsFromVolume, Volume} from "memfs";

const volume = new Volume();

vol.mkdirSync("/my/directory", {recursive: true});
vol.writeFileSync("/my/directory/foo.scss", "p {color: red}");
const fileSystem = createFsFromVolume(vol);

sass({
			// ...
			importer: importer({
        // Use another file system
        fileSystem
      })
		});
```

<!-- SHADOW_SECTION_CONTRIBUTING_START -->

## Contributing

Do you want to contribute? Awesome! Please follow [these recommendations](./CONTRIBUTING.md).

<!-- SHADOW_SECTION_CONTRIBUTING_END -->

<!-- SHADOW_SECTION_MAINTAINERS_START -->

## Maintainers

| <a href="mailto:frederikwessberg@hotmail.com"><img alt="Frederik Wessberg" src="https://avatars2.githubusercontent.com/u/20454213?s=460&v=4" height="70"   /></a>                                                                |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Frederik Wessberg](mailto:frederikwessberg@hotmail.com)<br><strong>Twitter</strong>: [@FredWessberg](https://twitter.com/FredWessberg)<br><strong>Github</strong>: [@wessberg](https://github.com/wessberg)<br>_Lead Developer_ |

<!-- SHADOW_SECTION_MAINTAINERS_END -->

<!-- SHADOW_SECTION_FAQ_START -->

## FAQ

<!-- SHADOW_SECTION_FAQ_END -->

<!-- SHADOW_SECTION_LICENSE_START -->

## License

MIT © [Frederik Wessberg](mailto:frederikwessberg@hotmail.com) ([@FredWessberg](https://twitter.com/FredWessberg)) ([Website](https://github.com/wessberg))

<!-- SHADOW_SECTION_LICENSE_END -->
