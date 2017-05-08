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
