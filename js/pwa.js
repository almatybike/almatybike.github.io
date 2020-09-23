let deferredPrompt;
const buttonInstall = document.getElementById('button-install');
const installBar = document.getElementById('install-bar');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallPromotion();
});

buttonInstall.addEventListener('click', (e) => {
    hideMyInstallPromotion();
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
    });
  });

function showInstallPromotion() {
    installBar.classList.remove('hide');
}

function hideMyInstallPromotion() {
    installBar.classList.add('hide');
}