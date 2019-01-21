<a href="https://npmcharts.com/compare/@wessberg/sass-extended-import-resolve?minimal=true"><img alt="Downloads per month" src="https://img.shields.io/npm/dm/%40wessberg%2Fsass-extended-import-resolve.svg" height="20"></img></a>
<a href="https://david-dm.org/wessberg/sass-extended-import-resolve"><img alt="Dependencies" src="https://img.shields.io/david/wessberg/sass-extended-import-resolve.svg" height="20"></img></a>
<a href="https://www.npmjs.com/package/@wessberg/sass-extended-import-resolve"><img alt="NPM Version" src="https://badge.fury.io/js/%40wessberg%2Fsass-extended-import-resolve.svg" height="20"></img></a>
<a href="https://github.com/wessberg/sass-extended-import-resolve/graphs/contributors"><img alt="Contributors" src="https://img.shields.io/github/contributors/wessberg%2Fsass-extended-import-resolve.svg" height="20"></img></a>
<a href="https://opensource.org/licenses/MIT"><img alt="MIT License" src="https://img.shields.io/badge/License-MIT-yellow.svg" height="20"></img></a>
<a href="https://www.patreon.com/bePatron?u=11315442"><img alt="Support on Patreon" src="https://c5.patreon.com/external/logo/become_a_patron_button@2x.png" height="20"></img></a>

# `@wessberg/sass-extended-import-resolve`

> A Custom Sass Import Resolver with included support for Node Module Resolution and additional file extensions

## Description

This is an implementation of the [Sass Import Resolve algorithm](https://github.com/sass/dart-sass/blob/0f7f9e69a72e612412b51bfa2fe1384f778e2821/lib/src/importer/utils.dart), with added support for Node Module Resolution.

At the moment, without this Custom importer, Sass library creators and consumers can:

- Ship `.scss`, `.sass`, or `.css` files via `node_modules`, and let consumers depend on files directly, - but not support hoisted dependencies/monorepos.
- Use [`Eyeglass`](https://github.com/sass-eyeglass/eyeglass)

This implementation follows the convention of existing tooling and similar solutions that paths with a leading `~` will be resolved via node module resolution.

## Install

### NPM

```
$ npm install @wessberg/sass-extended-import-resolve
```

### Yarn

```
$ yarn add @wessberg/sass-extended-import-resolve
```

## Usage

By default, you can simply use this library to resolve `.scss`, `.sass`, and `.css` files in exactly the same way as Sass currently does it:

```typescript
import {resolve} from "@wessberg/sass-extended-import-resolve";

// Resolve "./a" from "/some/folder".
resolve("./a", {cwd: "/some/folder"});
```

This would be equivalent to a `.scss` file with a `@import "./a"` statement within the folder `/some/folder`.

### Resolving files within Node Modules

Prefix the path with a `~` to indicate to the resolve algorithm that you'll be loading the library Node Modules:

```typescript
resolve("~my-library");
```

The resolve function will use Node Module Resolution to find the library, and then look at the `main` property within the related `package.json` file.
If it points to a file, for example `index.js`, for which there is an identically named file with an extension of `.scss`, `.sass` , or `.css`, or if the `main`
property directly points to a file with a supported extension, that file will be resolved.

### Adjusting supported extensions

You can alter what kind of extensions that can be resolved by providing an Iterable list of strings as an options argument to `resolve`:

```typescript
resolve("foo/bar", {
  extensions: [".myextname", ".awesome", ".foobarbaz"]
});
```

## Contributing

Do you want to contribute? Awesome! Please follow [these recommendations](./CONTRIBUTING.md).

## Maintainers

- <a href="https://github.com/wessberg"><img alt="Frederik Wessberg" src="https://avatars2.githubusercontent.com/u/20454213?s=460&v=4" height="11"></img></a> [Frederik Wessberg](https://github.com/wessberg): _Maintainer_

## Backers 🏅

[Become a backer](https://www.patreon.com/bePatron?u=11315442) and get your name, logo, and link to your site listed here.

## License 📄

MIT © [Frederik Wessberg](https://github.com/wessberg)
