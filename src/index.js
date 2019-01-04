import MarkdownIt from "markdown-it";
import MarkdownItFootnote from "markdown-it-footnote";
import MarkdownItKatex from "markdown-it-katex";

import Prism from "prismjs";
import loadLanguages from "prismjs/components/index";

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
    html: "markup"
  },
  target: "html"
};

function unaliasLang(lang) {
  switch (lang) {
    case "c++":
      return "cpp";
    default:
      return lang;
  }
}

export default (options = {}) => {
  options = Object.assign({}, defaultOptions, options);
  let md = MarkdownIt({
    quotes: options.quotes,
    html: options.html,
    typographer: false,
    linkify: false,
    highlight: function(str, lang) {
      lang = lang.toLowerCase().replace(/,$/, "");
      lang = unaliasLang(lang);

      if (lang) {
        loadLanguages([options.languageAliases[lang] || lang]);

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
    .use(MarkdownItCfEnhancements);

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
