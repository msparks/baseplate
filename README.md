# Baseplate

Baseplate is a dead-simple way to turn
[markdown](http://daringfireball.net/projects/markdown/) files into
beautifully-styled webpages without any external programs. Just drop files in a
web-accessible directory and go. It uses
[showdown.js](https://github.com/coreyti/showdown) to render markdown on the
fly in the browser.

Features:

* Updating the output is simple: just edit the markdown source files. Whenever
  you reload the Baseplate index page, AJAX fetches the markdown file and
  re-renders the output using showdown.js.
* `Last-Modified` headers are parsed and included in the page footer to
  indicate when the content was last changed.
* Page titles are automatically updated with the content of the first H1 header.

Non-features:

* Baseplate is not as flexible as alternatives like
  [jekyll](http://jekyllrb.com/); it cannot run other programs like
  [Sass](http://sass-lang.com/) to post-process or minimize CSS or JavaScript
  files.
* All markdown source files must be web-accessible. Otherwise, Baseplate would
  not be able to read them.

## Installation and usage

Copy the files from the
[Baseplate repository](https://github.com/msparks/baseplate) into a
web-accessible directory, then add new markdown files (with the extension
*.md*) in that same directory.

To see these pages using Baseplate, add `#!/pagename` to the URL, where
`pagename` is the name of the corresponding file without the *.md*
extension. For example, the content for this page is in `README.md`, so the
rendered page can be accessed at [#!/README](#!/README).

If no page is specified in the URL, Baseplate will attempt to load `index.md`
first. If that fails, it will try to load `README.md` (this file).

### Using Baseplate on Dropbox

[Dropbox](http://db.tt/hcdgDWe) is a free service for putting your files in the
cloud. All Dropbox accounts include a
[Public directory](http://www.dropbox.com/help/16) that you can drop files in
to instantly publish on the web. This feature works great with Baseplate; just
install Baseplate in your Public directory and copy the public link to the
`index.html` file in your Baseplate installation.
