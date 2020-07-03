import MarkdownIt from "markdown-it";
import MarkdownItFootnote from "markdown-it-footnote";
import MarkdownItDeflist from "markdown-it-deflist";

import Prism from "prismjs";
import { escapeHtml } from "markdown-it/lib/common/utils";

import { repeatStr } from "./utils";

import MarkdownItSignature from "./markdown-it-signature";
import MarkdownItIals from "./markdown-it-ials";
import MarkdownItCfEnhancements from "./markdown-it-cf-enhancements";

import PlainTextRenderer from "./plain_text_rules";

const loadLanguages =
  typeof window == "undefined" ? require("prismjs/components/") : undefined;

const defaultOptions = {
  html: false,
  headerStartIndex: 1,
  quotes: "“”‘’",
  languageAliases: {
    html: "markup",
    "c++": "cpp",
    js: "javascript",
  },
  target: "html",
  linkTarget: null,
  followWhitelist: null,
  base: "http://localhost/",
};

const CfMarkdown = (options = {}) => {
  options = Object.assign({}, defaultOptions, options);

  if (options.followWhitelist && options.followWhitelist.length > 0) {
    options.followWhitelist = "^(?:" + options.followWhitelist.join("|") + ")";
  } else {
    options.followWhitelist = null;
  }

  const highlight = function (str, lang) {
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

  const newlineSpaces = (state, silent) => {
    var max,
      pos = state.pos;

    if (state.src.charCodeAt(pos) !== 0x5c /* \n */) {
      return false;
    }

    max = state.posMax;

    // '\\' + '\\' + '\n' -> hardbreak
    if (!silent) {
      if (max >= pos + 1 && state.src.charCodeAt(pos + 1) === 0x5c) {
        if (max >= pos + 2 && state.src.charCodeAt(pos + 2) === 0x0a) {
          state.pending = state.pending.replace(/\\\\$/, "");
          state.push("hardbreak", "br", 0);
          state.pos += 3;
          return true;
        }
      }
    }

    return false;
  };

  let md = MarkdownIt({
    quotes: options.quotes,
    html: options.html,
    typographer: false,
    linkify: false,
    highlight,
  })
    .use(MarkdownItFootnote)
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

  const defaultLinkRenderer =
    md.renderer.rules.link_open ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };

  md.renderer.rules.link_open = (tokens, idx, tokOptions, env, self) => {
    const token = tokens[idx];
    const rel = [];

    if (options.linkTarget) {
      token.attrSet("target", options.linkTarget);
    }

    if (options.followWhitelist) {
      try {
        const url = new URL(token.attrGet("href"), options.base);
        if (!url.host.match(options.followWhitelist)) {
          rel.push("nofollow");
        }
      } catch (e) {}
    } else {
      rel.push("nofollow");
    }

    rel.push("noopener noreferrer");
    token.attrSet("rel", rel.join(" "));

    return defaultLinkRenderer(tokens, idx, tokOptions, env, self);
  };

  md.inline.ruler.before("newline", "newline_spaces", newlineSpaces);

  return md;
};

CfMarkdown.manualFixes = (text) => {
  let ncnt = "";
  let quote_level = 0;
  let lines = text.split(/\r\n|\n|\r/);

  lines.forEach((l) => {
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

  ncnt = ncnt.replace(/(^|[^\n])\n-- \n/, "$1\n\n-- \n");

  return ncnt;
};

export default CfMarkdown;
