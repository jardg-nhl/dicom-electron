const { contextBridge, ipcRenderer } = require('electron');

// Exposes electron apis to web
contextBridge.exposeInMainWorld('electronAPI', {
    findDicomFiles: (data) => ipcRenderer.invoke('find-dicom-files', data),
    onTaskCompleted: (callback) => ipcRenderer.on('task-completed', (_, response) => callback(response)),
    selectFolder: () => ipcRenderer.invoke('select-folder')
});