var baseplate = {};

/**
 * Logs a message to the JavaScript console.
 * @param {string} message Message to log.
 */
baseplate.log = function(message) {
  console.log('[baseplate] ' + message);
}

/**
 * Represents a text document.
 *
 * The document name is the relative path to the .md file without the .md
 * extension.
 *
 * @param {string} name The name of the document.
 * @constructor
 */
baseplate.Document = function(name) {
  /** @type {string} */
  this.name_ = "";
  if (typeof name == "string") {
    this.name_ = name;
  }

  /** @type {string} */
  this.content_ = "";

  /** @type {number} */
  this.last_modified_ = -1;

  /** @type {Array.<Function>} */
  this.success_callbacks_ = [];
};

/**
 * Returns the name of the document.
 *
 * @returns {string} The name of the document.
 */
baseplate.Document.prototype.name = function() {
  return this.name_;
};

/**
 * Returns the URL of the document.
 *
 * The URL is constructed from the document name. If the name is not set, this
 * returns an empty string.
 *
 * @returns {string} The URL to the document.
 */
baseplate.Document.prototype.url = function() {
  if (this.name_ == "") {
    return "";
  }
  return this.name_ + '.md';
};

/**
 * Sets and returns the content of the document.
 *
 * @param {string=} opt_content New content.
 * @returns {string} The content of the document.
 */
baseplate.Document.prototype.content = function(opt_content) {
  if (typeof opt_content == "string") {
    this.content_ = opt_content;
  }
  return this.content_;
};

/**
 * Returns the last modified date of the document.
 *
 * @returns {number} Unix epoch (seconds) or -1 if unavailable.
 */
baseplate.Document.prototype.lastModified = function() {
  return this.last_modified_;
};

/**
 * Adds a callback to be called when a document is loaded successfully.
 *
 * @param {function()} cb Function to be called when load() finishes.
 */
baseplate.Document.prototype.addSuccessCallback = function(cb) {
  this.success_callbacks_.push(cb);
};

/**
 * Loads the document.
 *
 * The caller should set the name of this document with name() before calling
 * this method. This method does nothing if a name is not set.
 */
baseplate.Document.prototype.load = function() {
  if (this.name_ == "") {
    return;
  }

  /** @type {string} */
  var url = this.url();

  var self = this;
  function successWithUrl(data, text_status, jq_xhr) {
    return self.loadSuccess_(self, data, text_status, jq_xhr);
  }
  function errorWithUrl(jq_xhr, text_status, error_thrown) {
    return self.loadError_(self, jq_xhr, text_status, error_thrown);
  }

  $.ajax({
    url: url,
    success: successWithUrl,
    error: errorWithUrl
  });
};

/**
 * Continuation for load() on success.
 * @private
 */
baseplate.Document.prototype.loadSuccess_ = function(
    self, data, text_status, jq_xhr) {
  self.content_ = data;

  // Parse Last-Modified HTTP header from response.
  var last_modified = jq_xhr.getResponseHeader('Last-Modified');
  if (last_modified) {
    var modified_date = new Date();
    // Date.parse returns milliseconds; we want seconds.
    self.last_modified_ = Date.parse(last_modified) / 1000 || -1;
  }

  baseplate.log('Successfully loaded ' + self.url());

  // Run all callbacks.
  for (var i in self.success_callbacks_) {
    self.success_callbacks_[i]();
  }
};

/**
 * Continuation for load() on error.
 * @private
 */
baseplate.Document.prototype.loadError_ = function(
    self, jq_xhr, text_status, error_thrown) {
  baseplate.log('Error loading ' + self.url() + ': ' + error_thrown);
};

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
