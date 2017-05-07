/* global nw Navigo Materialize */
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const Navigo = require('navigo');
const mime = require('mime');

const settingsFile = 'settings.json';
const settingsFilePath = path.join(nw.App.dataPath, settingsFile);
let appSettings = {};
const pictures = [];
let pictureIndex = 0;
let ready = false;

function testFiles(p, s = null) {
  if (s && s.isDirectory()) {
    return false;
  }
  if (s && s.isFile()) {
    return !/(png|jpg|jpeg|PNG|JPG|JPEG)$/.test(p);
  }
  return false;
}

function base64Encode(file) {
  // read binary data
  const bitmap = fs.readFileSync(file);
  // convert binary data to base64 encoded string
  return new Buffer(bitmap).toString('base64');
}

const watcher = chokidar.watch(null, {
  ignored: testFiles,
  depth: 0,
  followSymlinks: false,
  disableGlobbing: true,
});

function saveSettingsToFile(settings) {
  fs.writeFile(settingsFilePath, JSON.stringify(settings), (err) => {
    if (err) {
      console.log('Error saving Settings!');
    } else {
      console.log('Settings saved');
    }
  });
}

function saveSettings(settings = {}) {
  Promise.resolve()
    .then(() => {
      if (Object.prototype.hasOwnProperty.call(settings, 'picture_path')) {
        Promise.resolve()
          .then(() => {
            // ToDo: Path not unwatched
            watcher.unwatch(appSettings.picture_path);
            return Promise.resolve();
          })
          .then(() => {
            watcher.add(settings.picture_path);
          });
      }
      return Promise.resolve();
    })
    .then(() => {
      appSettings = Object.assign({}, appSettings, settings);
      return Promise.resolve();
    })
    .then(() => {
      saveSettingsToFile(appSettings);
    });
}

function saveSetting(el) {
  const data = {};
  data[el.name] = el.value;
  if (el.type === 'file') {
    el.parentNode.querySelector(`[id="${el.id}_current"]`).innerHTML = el.value;
  }
  saveSettings(data);
}

function loadSettingsFromFile() {
  return new Promise((resolve, reject) => {
    fs.readFile(settingsFilePath, (err, data) => {
      if (err) {
        console.log('Error loading Settings!');
        reject(err);
      } else {
        appSettings = JSON.parse(data);
        console.log('Settings loaded');
        watcher.add(appSettings.picture_path);
        resolve();
      }
    });
  });
}

function loadSettingsToForm(e) {
  for (let key in appSettings) {
    if (Object.prototype.hasOwnProperty.call(appSettings, key)) {
      try {
        const el = e.querySelector(`[name="${key}"]`);
        if (el.type === 'file') {
          e.querySelector(`[id="${key}_current"]`).innerHTML = appSettings[key];
        } else {
          el.value = appSettings[key];
        }
      } catch (e) {
        console.warn(e);
      }
    }
  }
}

function prevImage() {
  const el = document.querySelector('#picture');
  const bg = document.querySelector('#blurrypicture');
  if (pictureIndex > 0) {
    pictureIndex -= 1;
  }
  const picture = pictures[pictureIndex];
  el.src = picture;
  bg.src = picture;
}

function nextImage() {
  const el = document.querySelector('#picture');
  const bg = document.querySelector('#blurrypicture');
  if (pictureIndex < pictures.length - 1) {
    pictureIndex += 1;
  }
  const picture = pictures[pictureIndex];
  el.src = picture;
  bg.src = picture;
}

function initImage() {
  const el = document.querySelector('#picture');
  const bg = document.querySelector('#blurrypicture');
  pictureIndex = pictures.length - 1;
  const picture = pictures[pictureIndex];
  el.src = picture;
  bg.src = picture;
}

function instantprint() {}

// Routing
const root = null;
const useHash = true; // Defaults to: false
const hash = '#!'; // Defaults to: '#'
const router = new Navigo(root, useHash, hash);

function setContent(content) {
  const el = document.getElementById('content');
  switch (content) {
    case 'Settings':
      fetch('/src/views/settings.html')
        .then(resp => resp.text())
        .then((text) => {
          el.innerHTML = text;
          return Promise.resolve(el);
        })
        .then(e => loadSettingsToForm(e));
      break;
    default:
      fetch('/src/views/home.html')
        .then(resp => resp.text())
        .then((text) => {
          el.innerHTML = text;
          return Promise.resolve(el);
        })
        .then(e => initImage(e));
  }
}

router
  .on({
    '/settings': () => setContent('Settings'),
    '*': () => setContent('Home'),
  })
  .resolve();

watcher
  .on('add', (p) => {
    pictures.push(`data:${mime.lookup(p)};base64, ${base64Encode(p)}`);
    if (ready) {
      initImage();
    }
  })
  .on('ready', () => {
    initImage();
    ready = true;
});

/*
// Create an empty context menu
const menu = new nw.Menu({ type: 'menubar' });

// Add some items with label
menu.append(new nw.MenuItem({
  label: 'Main',
  click: () => {
    router.navigate('/');
  },
}));
menu.append(new nw.MenuItem({
  label: 'Settings',
  click: () => {
    router.navigate('/settings');
  },
}));

nw.Window.get().menu = menu;
*/

nw.Window.get().showDevTools();

loadSettingsFromFile().then(() => router.navigate('/'));
