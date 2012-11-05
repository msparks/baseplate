function init() {
  var hash = window.location.hash;
  var filename;
  var title;
  if (hash.substr(0, 3) == '#!/') {
    filename = hash.substr(3);

    // Hashes like '#!/test/' are treated as directory accesses.
    if (filename.substr(-1) == '/') {
      filename += 'index';
    }

    title = filename;
    if (filename) {
      filename += '.md';
    }
  }

  if (filename) {
    // Change title.
    title = title.replace(/_/g, ' ');
    $('title').html(title);

    // Load file.
    loadFile(filename);
  } else {
    loadFile('index.md');
  }
}

function showError(error_msg) {
  $('#content').html(error_msg);
}

function loadFile(filename) {
  function successWithFilename(data, text_status, jq_xhr) {
    return loadFileSuccess(filename, data, text_status, jq_xhr);
  }

  function errorWithFilename(jq_xhr, text_status, error_thrown) {
    return loadFileError(filename, jq_xhr, text_status, error_thrown);
  }

  $.ajax({
    url: filename,
    success: successWithFilename,
    error: errorWithFilename
  });
}

function loadFileSuccess(filename, data, text_status, jq_xhr) {
  var converter = new Showdown.converter();

  // HTMLize content.
  var html = converter.makeHtml(data);
  $('#content').html(html);

  // Update title if an h1 header exists.
  var header_title = $('h1').html();
  if (header_title) {
    $('title').html(header_title);
  }

  // Show date modified in footer.
  var last_modified = jq_xhr.getResponseHeader('Last-Modified');
  if (last_modified) {
    var modified_date = new Date();
    modified_date.setTime(Date.parse(last_modified));
    $('.footer .meta').html('Modified ' + modified_date.toDateString());
  }
}

function loadFileError(filename, jq_xhr, text_status, error_thrown) {
  if (filename == 'index.md') {
    // Index file is missing. Try to load the README instead.
    loadFile('README.md');
    return;
  }

  showError(text_status + ': ' + error_thrown);
}

// Run init when the location #hash changes.
$(window).bind('hashchange', init);

// Run init on page load.
$(init);
