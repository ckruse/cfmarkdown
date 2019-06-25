#!/usr/bin/env node

import CfMarkdown from "../src";
import readline from "readline";
import { repeatStr } from "../src/utils";

process.stdin.resume();
process.stdin.setEncoding("utf8");

const md = CfMarkdown({
  quotes: "„“‚‘",
  headerStartIndex: 3
});

const mdPlain = CfMarkdown({
  quotes: "„“‚‘",
  headerStartIndex: 3,
  target: "plain"
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

const manualFixes = text => {
  let ncnt = "";
  let quote_level = 0;
  let lines = text.split(/\r\n|\n|\r/);

  lines.forEach(l => {
    let mdata = l.match(/^(> *)+/);
    let currentQl = ((mdata ? mdata[0] : "").match(/>/) || []).length;

    if (currentQl < quote_level && !/^(?:> *)*\s*$/m.test(l)) {
      ncnt += repeatStr("> ", currentQl) + "\n";
    } else if (currentQl > quote_level) {
      ncnt += repeatStr("> ", quote_level) + "\n";
    }

    quote_level = currentQl;

    if (l.match(/^(?:> )*~~~\s*(?:\w+)/)) {
      l = l.replace(
        /~~~(\s*)(\w+)/g,
        (_, m1, m2) => "~~~" + m1.toLowerCase() + m2.toLowerCase()
      );
    }

    ncnt += l + "\n";
  });

  ncnt = ncnt.replace(/(?<!\n)\n-- \n/, "\n\n-- \n");

  return ncnt;
};

rl.on("line", line => {
  try {
    let json = JSON.parse(line);
    const target = json.target || "markdown";
    process.title = "cfmarkdown: parsing " + json.id + " to " + target;
    let markdown = manualFixes(json.markdown);
    let result =
      json.target == "plain" ? mdPlain.render(markdown) : md.render(markdown);

    process.stdout.write(
      JSON.stringify({
        status: "ok",
        html: result
      }) + "\n--eof--\n"
    );

    process.title = "cfmarkdown: idle";
  } catch (e) {
    process.stdout.write(
      JSON.stringify({
        status: "error",
        message: "Input is no valid JSON"
      }) + "\n--eof--\n"
    );
  }
});
