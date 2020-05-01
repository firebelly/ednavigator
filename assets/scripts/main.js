// import local dependencies
import Router from './util/Router';
import common from './routes/common';
import singlePost from './routes/singlePost';

import appState from './util/appState';

/** Populate Router instance with DOM routes */
const routes = new Router({
  common,
  singlePost,
});

// Inits
appState.init();

// Load Events
$(document).ready(() => routes.loadEvents());