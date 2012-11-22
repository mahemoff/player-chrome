//var user;
//
/*
$(function() {

  console.log('helo? this is app');
  user = window.opener.user;
  populateEpisodes();
  //var template = _.template(templateHTML)
  //var templateHTML = $('#appTemplate').html();
  //var appHTML = template(window.opener);
  //$('$appContainer').html(appHTML);

});
*/

function refresh(user) {
  var html = '';
  console.log('html');

  //_(user.episodes.slice(0,500)).each(function(episode) {
  _(user.episodes.slice(0,20)).each(function(episode) {
    console.log('good', new Date(episode.publishedAt * 1000), episode.channelRecords.map(function(c) { return c.title; }).join(','), episode);
    $("<tr>" +
      "<td>" + episode.title + "</td> " +
      "<td>" + (episode.publishedAt) + "</td> " +
      "<td>" + $.timeago(episode.publishedAt*1000) + "</td> " +
      "<td>" + _(episode.channelRecords).map(function(c) { return c.title; }).join(',') + "</td> " +
      "<td> <audio src='"+episode.url+"' controls></audio></td>" +
      "</tr>").appendTo('.episodes')
    $('.appContainer').html();
  });
}

$(function() {
  window.opener.addUserListener(refresh);
  console.log(window.opener.user.ready);
  if (window.opener.user.ready) refresh(window.opener.user);
});

