# PhotoPrinter

Description coming soon ;)

## Development (Ubuntu 14.04)

### Requirements:

* libcups2-dev

  ```
  sudo apt-get install libcups2-dev
  ```

* [yarn](https://yarnpkg.com)
* [NW.js](https://nwjs.io/) (SDK version)

### Install Node Packages

```
yarn install

npm install -g nw-gyp
cd node_modules/printer
nw-gyp rebuild --target=<NW.js version number>
```

### Run App

```
yarn start
```
