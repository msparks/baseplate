function init() {
  var hash = window.location.hash;
  var doc_name;
  var title;
  if (hash.substr(0, 3) == '#!/') {
    doc_name = hash.substr(3);

    // Hashes like '#!/test/' are treated as directory accesses.
    if (doc_name.substr(-1) == '/') {
      doc_name += 'index';
    }

    title = doc_name;
  }

  if (doc_name) {
    // Change title.
    title = title.replace(/_/g, ' ');
    $('title').html(title);

    // Load file.
    loadFile(doc_name);
  } else {
    loadFile('index');
  }
}

function loadFile(doc_name) {
  var doc = new baseplate.Document(doc_name);
  doc.addSuccessCallback(function() { loadFileSuccess(doc); });
  doc.addErrorCallback(function(xhr) { loadFileError(doc, xhr); });
  doc.load();
}

function loadFileSuccess(doc) {
  var converter = new Showdown.converter();

  // HTMLize content.
  var html = converter.makeHtml(doc.content());
  $('#content').html(html);

  // Update title if an h1 header exists.
  var header_title = $('h1').html();
  if (header_title) {
    $('title').html(header_title);
  }

  // Show date modified in footer.
  var lastModified = doc.lastModified();
  if (lastModified > 0) {
    var modifiedDate = new Date();
    modifiedDate.setTime(lastModified * 1000);  // ms since epoch.
    $('.footer .meta').html('Modified ' + modifiedDate.toDateString());
  }
}

function loadFileError(doc, xhr) {
  if (doc.name() == 'index') {
    // Index file is missing. Try to load the README instead.
    loadFile('README');
    return;
  }

  showError('Error ' + xhr.status + ': ' + xhr.statusText);
}

function showError(error_msg) {
  $('#content').html(error_msg);
}

// Run init when the location #hash changes.
$(window).bind('hashchange', init);

// Run init on page load.
$(init);
