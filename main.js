/**
 * Copyright (c) 2012 The Chromium Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be
 * found in the LICENSE file.
 **/

var appWindow;
var MAX_FILES = 20;

/**
 * Listens for the app launching then creates the window
 *
 * @see http://developer.chrome.com/trunk/apps/app.window.html
 */
 chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create(
    'index.html',
    { height: 550, width: 800, top: 100 },
    function(_appWindow) { appWindow = _appWindow; }
  );
});

var user;
fetchUser();

function fetchUser() {
  $.getJSON('http://player.fm/michael.json', function(_user) {
    user = _user;
    user.ready = false;
    user.starredChannels.splice(3) // for development purposes
    fetchChannel(0);
  });
}

function fetchChannel(index) {
  user.starredChannels;
  if (index >= user.starredChannels.length) {
    sequenceEpisodes();
    return;
  } 
  var channel = user.starredChannels[index];
  var path = 'http://player.fm/'+channel.owner.id+'/'+channel.slug+'.json?episodes_limit=10'
  console.log('chan path', path);
  $.getJSON(path, function(_channel) {
    _(user.starredChannels[index]).extend(_channel);
  })
  .complete(function() {
    fetchChannel(index+1);
  });
}

function sequenceEpisodes() {
  // First use a map to ensure uniqeness and remember source channels
  console.log('starred', user.starredChannels);
  episodesByID = [];
  _(user.starredChannels).each(function(channel) {
    console.log ('chan', channel.title);
    _(channel.episodes).each(function(episode) {
      existingEpisode = episodesByID[episode.id];
      if (!existingEpisode) {
        existingEpisode = episode;
        existingEpisode.channelRecords = [];
        episodesByID[existingEpisode.id] = existingEpisode;
      };
      existingEpisode.channelRecords.push({title: channel.title });
    });
  });
  user.episodes = [];
  for (id in episodesByID) {
    user.episodes.push(episodesByID[id]);
  }
  user.episodes = _(user.episodes).sortBy(function(ep) { return -ep.publishedAt; });
  user.ready = true;
  syncFiles();
  _(userListeners).each(function(listener) { listener(user); });
  //console.log(_(user.episodes).map(function(ep) { return -ep.publishedAt; }));
}

// FILE INTERFACING

var filer = new Filer();
var capacity = MAX_FILES * (20 * 1024 * 1024);
filer.init({size: capacity}, onFilerInit.bind(filer), onFilerError);

function onFilerInit(fs) {
  filer.ls('/', function(entries) {
    console.log('filer - initial entries', entries);
  }, onFilerError);
};

function onFilerError(e) {
  console.log('error', e);
}

function syncFiles() {
  console.log('Syncing');
  filer.ls('/', function(entries) {

    var oldFiles = entries;
    var episodesByFilename = {};
    var newFiles = [];
    console.log ('syncfiles', user.episodes);
    _(user.episodes.slice(0,MAX_FILES-1)).each(function(ep) {
      console.log('user episode', ep);
      ep.filename = escape(ep.url);
      newFiles.push(ep.filename);
      episodesByFilename[ep.filename] = ep;
    });

    var removedFiles = _(oldFiles).without(newFiles);
    var addedFiles = _(newFiles).without(oldFiles);
    console.log('oldfiles', oldFiles, 'newfiles', newFiles, 'removed', removedFiles, 'added', addedFiles);

    _(addedFiles).each(function(filename) {
      newEpisode = episodesByFilename[filename];
      console.log('new episode', newEpisode);
    });

  }, onFilerError);
}

// PUBLIC INTERFACE FOR UI WINDOWS
function getUser() {
  return user;
}

var userListeners = [];
function addUserListener(listener) {
  userListeners.push(listener);
}
