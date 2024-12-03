"use strict";

const settingBlock = document.getElementById('setting');
const manageFileBlock = document.getElementById('manageFiles');
const sidebarSettingBtn = document.getElementById('settingBtn');
const sidebarManageFilesBtn = document.getElementById('manageFilesBtn');
const selectFolderBtn = document.getElementById('selectFolderBtn');
const selectedFolderInput = document.getElementById('selectedFolder');
const portInput = document.getElementById('port');
const studyUIDInput = document.getElementById('studyUID');
const institutionCodeInput = document.getElementById('institutionCode');
const bucketNameInput = document.getElementById('bucketName');
const searchBtn = document.getElementById('findBtn');
const liveToast = document.getElementById('liveToast');
const toastBodyElement = document.getElementsByClassName('toast-body')[0];

const toastBootstrap = bootstrap.Toast.getOrCreateInstance(liveToast);

const blockItems = [
  settingBlock,
  manageFileBlock
];

const sidebarItems = [
  sidebarSettingBtn,
  sidebarManageFilesBtn
];

manageFileBlock.style.display = 'none';
sidebarSettingBtn.classList.add('sidebar__btn--active');


const rootFolder = localStorage.getItem('rootFolder');
selectedFolderInput.value = rootFolder;

const port = localStorage.getItem('port') || 3000;
portInput.value = port;
portInput.addEventListener('input', () => {
  localStorage.setItem('port', event.target.value);
})

searchBtn.addEventListener('click', findDicomFiles);

if (selectFolderBtn) {
  selectFolderBtn.addEventListener('click', async (event) => {
    const folderPath = await electronAPI.selectFolder();
    if (folderPath) {
      localStorage.setItem('rootFolder', folderPath);
      selectedFolderInput.value = folderPath;
    }
    
  })
}

async function findDicomFiles() {
  const studyUID = studyUIDInput.value;
  const institutionCode = institutionCodeInput.value;
  const bucketName = bucketNameInput.value;

  const errors = [];
  if (!studyUID) errors.push('studyUID');
  if (!institutionCode) errors.push('institutionCode');
  if (!bucketName) errors.push('bucketName');
  if (errors.length > 0) {
    const message = 'Invalid ' + errors.join(', ');
    toastBodyElement.textContent = message;
    toastBootstrap.show();
    return;
  }

  const data = {
    studyUID,
    institutionCode,
    bucketName
  };
  try {
    const files = await electronAPI.findDicomFiles(data);
    // TODO: list the files in UI.
    console.log(files);
  } catch(err) {
    console.log('[ERROR] Failed to search files, error: ', err);
  }
}

function chooseTabItem(item) {
  switch (item) {
    case 'setting':
      hideAllTabItems();
      settingBlock.style.display = 'block';
      sidebarSettingBtn.classList.add('sidebar__btn--active');
      break;
    case 'manageFiles':
      hideAllTabItems();
      manageFileBlock.style.display = 'block';
      sidebarManageFilesBtn.classList.add('sidebar__btn--active');
      break;
  
    default:
      break;
  }
}

function hideAllTabItems() {
  blockItems.forEach(element => element.style.display = 'none');
  sidebarItems.forEach(element => element.classList.remove('sidebar__btn--active'))
}
