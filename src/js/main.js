/* global nw Navigo Materialize */
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const Navigo = require('navigo');
const mime = require('mime');
const printer = require('printer');

const settingsFile = 'settings.json';
const settingsFilePath = path.join(nw.App.dataPath, settingsFile);
let appSettings = {};
const pictures = [];
let pictureIndex = 0;
let ready = false;
const printers = printer.getPrinters();

function testFiles(p, s = null) {
  if (s && s.isDirectory()) {
    return false;
  }
  if (s && s.isFile()) {
    return !/(png|jpg|jpeg|PNG|JPG|JPEG)$/.test(p);
  }
  return false;
}

function fileBuffer(file) {
  // read binary data
  const bitmap = fs.readFileSync(file);
  return new Buffer(bitmap);
}

function base64Encode(file) {
  // convert binary data to base64 encoded string
  return fileBuffer(file).toString('base64');
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

function loadSettings() {
  return new Promise((resolve, reject) => {
    fs.readFile(settingsFilePath, (err, data) => {
      if (err) {
        console.log('Error loading Settings!');
        reject(err);
      } else {
        appSettings = JSON.parse(data);
        watcher.add(appSettings.picture_path);
        console.log('Settings loaded');
        resolve();
      }
    });
  });
}

function loadSettingsToForm(e) {
  const printerSelect = e.querySelector('#printer');
  if (printers) {
    const doption = document.createElement('option');
    doption.text = 'Choose your option';
    printerSelect.add(doption);
    for (let p of printers) {
      const option = document.createElement('option');
      option.text = p.name;
      option.value = p.name;
      printerSelect.add(option);
    }
  } else {
    const doption = document.createElement('option');
    doption.text = 'No printers available!';
    printerSelect.add(doption);
  }
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

function updateImage(picture = null) {
  if (picture) {
    const el = document.querySelector('#picture');
    el.src = picture.base64;
    el.setAttribute('data-file', picture.file);
    el.setAttribute('data-type', picture.type);
    const bg = document.querySelector('#blurrypicture');
    bg.src = picture.base64;
  }
}

function prevImage() {
  if (pictureIndex > 0) {
    pictureIndex -= 1;
  }
  updateImage(pictures[pictureIndex]);
}

function nextImage() {
  if (pictureIndex < pictures.length - 1) {
    pictureIndex += 1;
  }
  updateImage(pictures[pictureIndex]);
}

function initImage() {
  pictureIndex = pictures.length - 1;
  updateImage(pictures[pictureIndex]);
}

function instantprint() {
  const el = document.querySelector('#picture');
  printer.printDirect({
    data: fileBuffer(el.getAttribute('data-file')),
    printer: appSettings.printer,
    type: el.getAttribute('data-type'),
    success: () => console.log('print successfull'),
    error: err => console.error(err),
  });
}

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
    const mimeType = mime.lookup(p);
    pictures.push({
      file: p,
      base64: `data:${mimeType};base64,${base64Encode(p)}`,
      type: mime.extension(mimeType).toUpperCase(),
    });
    if (ready) {
      initImage();
    }
  })
  .on('ready', () => {
    initImage();
    ready = true;
  });

nw.Window.get().showDevTools();

loadSettings()
  .then(() => router.navigate('/'))
  .catch(() => router.navigate('/settings'));
