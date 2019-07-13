import MarkdownIt from "markdown-it";
import MarkdownItFootnote from "markdown-it-footnote";
import MarkdownItKatex from "markdown-it-katex";
import MarkdownItDeflist from "markdown-it-deflist";
import MarkdownItLinkAttributes from "markdown-it-link-attributes";

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

  const highlight = function(str, lang) {
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
  };

  let md = MarkdownIt({
    quotes: options.quotes,
    html: options.html,
    typographer: false,
    linkify: false,
    highlight: highlight
  })
    .use(MarkdownItFootnote)
    .use(MarkdownItKatex)
    .use(MarkdownItSignature)
    .use(MarkdownItIals)
    .use(MarkdownItCfEnhancements)
    .use(MarkdownItDeflist)
    .use(MarkdownItLinkAttributes, [
      {
        pattern: /^https:\/\/wiki.selfhtml.org\//,
        attrs: {}
      },
      {
        pattern: /./,
        attrs: {
          rel: "nofollow"
        }
      }
    ]);

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

    md.renderer.rules.code_inline = (tokens, idx, options, env, slf) => {
      var token = tokens[idx];
      const klass = token.attrGet("class") || "";
      const tag = "<code" + slf.renderAttrs(token) + ">";

      if (klass.match(/language-(\w+)/)) {
        const lang = RegExp.$1;
        return tag + highlight(tokens[idx].content, lang) + "</code>";
      } else {
        return tag + escapeHtml(tokens[idx].content) + "</code>";
      }
    };
  } else if (options.target == "plain") {
    md.renderer = new PlainTextRenderer();
  }

  return md;
};
