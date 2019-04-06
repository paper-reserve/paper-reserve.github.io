const replace = require("replace-in-file");
const options = {
  files: "dist/ng7-pre/ngsw-worker.js",
  from: `onFetch(event) {`,
  to: `onFetch(event) {
            if (event.request.url.indexOf('dropboxapi') !== -1) { return; }`
};

replace(options)
  .then(changes => {
    console.log("Modified files:", changes.join(", "));
  })
  .catch(error => {
    console.error("Error occurred:", error);
  });
