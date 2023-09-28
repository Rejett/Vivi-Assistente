document.addEventListener('deviceready', onDeviceReady, false);

var app = new Framework7({
  // App root element
  el: '#app',
  // App Name
  name: 'Vivi Assistente',
  // App id
  id: 'br.com.vivi.assistente',
  // Enable swipe panel
  panel: {
    swipe: true,
  },
  // Add default routes
  routes: [
    {
      name: "home",
      path: '/index/',
      url: 'index.html',
      on: {
        pageInit: function(e, page) {
          $.getScript('js/index.js')
        }
      }
    },
    {
      name: "memorias",
      path: '/memorias/',
      url: 'memorias.html',
      on: {
        pageInit: function(e, page) {
          $.getScript('js/memorias.js')
        }
      }
    },
  ],
  // ... other parameters
});

function onDeviceReady(){
  var mainView = app.views.create('.view-main');
}
