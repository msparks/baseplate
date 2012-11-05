function init() {
  var hash = window.location.hash;
  var docName;
  var title;
  if (hash.substr(0, 3) == '#!/') {
    docName = hash.substr(3);

    // Hashes like '#!/test/' are treated as directory accesses.
    if (docName.substr(-1) == '/') {
      docName += 'index';
    }

    title = docName;
  }

  if (docName) {
    // Change title.
    title = title.replace(/_/g, ' ');
    $('title').html(title);

    // Load file.
    loadFile(docName);
  } else {
    loadFile('index');
  }
}

function loadFile(docName) {
  var doc = new baseplate.Document(docName);
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
  var headerTitle = $('h1').html();
  if (headerTitle) {
    $('title').html(headerTitle);
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
