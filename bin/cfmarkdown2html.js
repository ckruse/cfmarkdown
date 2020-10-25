#!/usr/bin/env node

import CfMarkdown from "../src";
import readline from "readline";

const loadLanguages = require("prismjs/components/");

process.stdin.resume();
process.stdin.setEncoding("utf8");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

rl.on("line", (line) => {
  try {
    let json = JSON.parse(line);
    const target = json.target || "markdown";
    const md = CfMarkdown({
      quotes: "„“‚‘",
      headerStartIndex: 3,
      ...(json.config || {}),
      target: json.target == "plain" ? "plain" : "html",
      loadLanguages,
    });

    process.title = "cfmarkdown: parsing " + json.id + " to " + target;
    const markdown = CfMarkdown.manualFixes(json.markdown);
    const result = md.render(markdown);

    process.stdout.write(
      JSON.stringify({
        status: "ok",
        html: result,
      }) + "\n--eof--\n"
    );

    process.title = "cfmarkdown: idle";
  } catch (e) {
    process.stdout.write(
      JSON.stringify({
        status: "error",
        message: "Input is no valid JSON",
      }) + "\n--eof--\n"
    );
  }
});

process.stdout.write("ok\n");
