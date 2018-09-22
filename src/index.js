import MarkdownIt from "markdown-it";
import MarkdownItSignature from "./markdown-it-signature";
import MarkdownItFootnote from "markdown-it-footnote";
import MarkdownItKatex from "markdown-it-katex";

const defaultOptions = {
  html: false,
  headerStartIndex: 1,
  quotes: "“”‘’"
};

export default (options = {}) => {
  options = Object.assign({}, defaultOptions, options);
  let md = MarkdownIt({
    quotes: options.quotes,
    html: options.html,
    typographer: false,
    linkify: false
  })
    .use(MarkdownItFootnote)
    .use(MarkdownItKatex)
    .use(MarkdownItSignature);

  if (!options.html) {
    md.disable("entity");
  }

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

  return md;
};
