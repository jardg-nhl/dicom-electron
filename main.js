const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const cors = require('cors');

/**
 * *****************************************************************************
 * Constants
 */

let ROOT_FOLDER = 'D:/dicoms';
const PREFIX_DICOM = 'dicom';

/**
 * *****************************************************************************
 * Express server.
 */
const runLocalServer = () => {
  const expressApp = express();
  const PORT = 3000;
  expressApp.use(cors({
    origin: "*"
  }))
  expressApp.get('/', (req, res) => {
    res.send('hello Bat Da');
  })

  expressApp.listen(PORT, () => {
    console.log('listen on port: ', PORT)
  })
}


/**
 * *****************************************************************************
 * Main process.
 */

let window;
const createWindow = async () => {
  window = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    }
  });

  await window.loadFile('index.html');
  window.webContents.openDevTools({mode: 'right'});
  ROOT_FOLDER = await LocalStorage.getItem('rootFolder');
  runLocalServer();
}

app.whenReady().then(() => {
  createWindow();

  // open an window if there is no window opened (Mac).
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit the app if all windows are closed (Window & Linux).
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Listen for IPC messages
ipcMain.handle('find-dicom-files', (event, args) => {
  const { studyUID, institutionCode, bucketName } = args;
  console.log('studyUID: ', studyUID);
  console.log('institutionCode: ', institutionCode);
  const folderPath = `${ROOT_FOLDER}/${bucketName}/${institutionCode}/${studyUID}/`;
  const files = collectFiles(folderPath);
  console.log('Find Dicom files:', files);
  return files;
});

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(window, {
    properties: ['openDirectory'],
  });

  // Return the selected path or undefined if no folder was selected
  if (result.canceled) return null;
  rootFolder = result.filePaths[0];
  await LocalStorage.setItem('rootFolder', result.filePaths[0]);
  return result.filePaths[0];
})


/**
 * *****************************************************************************
 * Utils
 */

/**
 * Recursively collects all files from a given folder.
 * @param {string} folderPath - The path to the folder to collect files from.
 * @returns {string[]} - An array of file paths.
 */
function collectFiles(folderPath) {
  try {
    let files = [];

    // Read the contents of the current directory
    const items = fs.readdirSync(folderPath);
  
    for (const item of items) {
        const itemPath = path.join(folderPath, item);
  
        // Check if the item is a directory or a file
        if (fs.statSync(itemPath).isDirectory()) {
            // If it's a directory, recursively collect files
            files = files.concat(collectFiles(itemPath));
        } else {
            // If it's a file, add it to the list\
            if (path.extname(itemPath) === '.dcm') {
              files.push(itemPath);
            }
        }
    }
  
    return files;
  } catch(err) {
    console.log(err);
    return [];
  }
}

class LocalStorage {
  constructor () {}
  static async getItem(key) {
    return await window.webContents.executeJavaScript(`localStorage.getItem('${key}')`, true);
  }
  static async setItem(key, value) {
    return await window.webContents.executeJavaScript(`localStorage.setItem('${key}', '${value}')`, true);
  }
}