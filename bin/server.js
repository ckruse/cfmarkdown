import express from "express";
import bodyParser from "body-parser";

import CfMarkdown from "../src";

const app = express();
const port = process.env.PORT || 4001;

function markdown(request, response) {
  const md = CfMarkdown({
    quotes: "„“‚‘",
    headerStartIndex: 3,
    ...(request.body.config || {}),
    target: "html"
  });

  const markdown = CfMarkdown.manualFixes(request.body.markdown);
  const html = md.render(markdown);
  response.setHeader("content-type", "application/json");
  response.json({ status: "ok", html });
}

function plain(request, response) {
  console.time("/plain");

  const md = CfMarkdown({
    quotes: "„“‚‘",
    headerStartIndex: 3,
    ...(request.body.config || {}),
    target: "plain"
  });

  const markdown = CfMarkdown.manualFixes(request.body.markdown);
  const html = md.render(markdown);

  response.setHeader("content-type", "application/json");
  response.json({ status: "ok", html });

  console.timeEnd("/plain");
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.route("/markdown").post(markdown);
app.route("/plain").post(plain);

console.log("listening on port " + port);
app.listen(port);
