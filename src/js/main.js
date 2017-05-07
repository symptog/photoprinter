/* global nw Navigo Materialize */
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const Navigo = require('navigo');

const settingsFile = 'settings.json';
const settingsFilePath = path.join(nw.App.dataPath, settingsFile);
let appSettings = {};

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
  appSettings = Object.assign({}, appSettings, settings);
  saveSettingsToFile(appSettings);
}

function saveSetting(el) {
  const data = {};
  data[el.name] = el.value;
  saveSettings(data);
}

function loadSettingsFromFile() {
  fs.readFile(settingsFilePath, (err, data) => {
    if (err) {
      console.log('Error loading Settings!');
    } else {
      appSettings = JSON.parse(data);
      console.log('Settings loaded');
    }
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
        });
  }
}

router
  .on({
    '/settings': () => setContent('Settings'),
    '*': () => setContent('Home'),
  })
  .resolve();


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

nw.Window.get().showDevTools();

router.navigate('/');

loadSettingsFromFile();

