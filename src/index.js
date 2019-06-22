import MarkdownIt from "markdown-it";
import MarkdownItFootnote from "markdown-it-footnote";
import MarkdownItKatex from "markdown-it-katex";
import MarkdownItDeflist from "markdown-it-deflist";

import Prism from "prismjs";
let loadLanguages;

if (typeof window == "undefined") {
  loadLanguages = require("prismjs/components/");
}

import MarkdownItSignature from "./markdown-it-signature";
import MarkdownItIals from "./markdown-it-ials";
import MarkdownItCfEnhancements from "./markdown-it-cf-enhancements";

import PlainTextRenderer from "./plain_text_rules";

import { escapeHtml } from "markdown-it/lib/common/utils";

const defaultOptions = {
  html: false,
  headerStartIndex: 1,
  quotes: "“”‘’",
  languageAliases: {
    html: "markup",
    "c++": "cpp",
    js: "javascript"
  },
  target: "html"
};

export default (options = {}) => {
  options = Object.assign({}, defaultOptions, options);
  let md = MarkdownIt({
    quotes: options.quotes,
    html: options.html,
    typographer: false,
    linkify: false,
    highlight: function(str, lang) {
      lang = lang.toLowerCase().replace(/,$/, "");

      if (lang) {
        lang = options.languageAliases[lang] || lang;
        if (typeof window == "undefined") {
          loadLanguages([lang]);
        }

        if (Prism.languages[lang]) {
          return Prism.highlight(str, Prism.languages[lang], lang);
        }
      }

      return escapeHtml(str);
    }
  })
    .use(MarkdownItFootnote)
    .use(MarkdownItKatex)
    .use(MarkdownItSignature)
    .use(MarkdownItIals)
    .use(MarkdownItCfEnhancements)
    .use(MarkdownItDeflist);

  if (!options.html) {
    md.disable("entity");
  }

  if (options.target == "html") {
    md.renderer.rules.heading_open = (tokens, idx, _, __, slf) => {
      const tok = tokens[idx];
      let level = tok.markup.length + options.headerStartIndex - 1;

      if (level > 6) {
        level = 6;
      }

      return `<h${level}${slf.renderAttrs(tok)}>`;
    };

    md.renderer.rules.heading_close = (tokens, idx) => {
      const tok = tokens[idx];
      let level = tok.markup.length + options.headerStartIndex - 1;

      if (level > 6) {
        level = 6;
      }

      return `</h${level}>`;
    };
  } else if (options.target == "plain") {
    md.renderer = new PlainTextRenderer();
  }

  return md;
};
