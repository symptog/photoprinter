# PhotoPrinter

Description coming soon ;)

## Development (Ubuntu 14.04)

### Requirements:

* [yarn](https://yarnpkg.com)
* libcups2-dev

  ```
  sudo apt-get install libcups2-dev
  ```

### Install Node Packages and NW.js

```
yarn install
yarn install-nw
```

### Run App

```
yarn start
```

You may want to change the window size while developing.

Change the following in `package.json`:

```json
"window": {
  "kiosk": false,
  "width": 800,
  "height": 480
}
```

### Build App

```
yarn build
```

## Build for Raspberry PI 3

On your PI:

Install [node.js](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions)

Install [yarn](https://yarnpkg.com/en/docs/install)

Install `nw-gyp` global:

```
npm install -g nw-gyp
```

Get the Repo:

```
git clone https://github.com/symptog/photoprinter.git
cd photoprinter
yarn install --production
```

Create `.nw` file:

```
zip -r ../${PWD##*/}.nw *
```

Get [NW.js for ARMv7](https://github.com/LeonardLaszlo/nw.js-armv7-binaries/releases) on your Raspberry PI 3

Run `path/to/nw path/to/photoprinter.nw`


