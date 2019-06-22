import { scan, trimStart, trim, addClass } from "./utils";

const IAL_RX = /(?:^|\s+)(?:(\.\w[\w-]*)|(#\w[\w-]*)|(@\w+)|(\w[\w-]+)=((\w[\w-]*)|((["'])[^\8]+\8)))/g;

const parseIal = str => {
  const matchData = scan(str, IAL_RX);

  const opts = matchData.reduce((opts, elem) => {
    let [klass, id, lang, key, value] = elem;

    if (klass) {
      opts.class = trimStart((opts.class || "") + ` ${klass.substr(1)}`);
    } else if (id) {
      opts.id = id.substr(1);
    } else if (lang) {
      opts.lang = lang.substr(1);
    } else {
      opts[key] = value.replace(/^(["'])|\1$/, "");
    }

    return opts;
  }, {});

  return opts;
};

const mergeAttributes = (from, to) => {
  Object.keys(from).forEach(k => {
    if (k == "class") {
      addClass(from.class, to);
    } else {
      to.push([k, from[k]]);
    }
  });
};

const parseInlineIal = (state, silent) => {
  const remainder = state.src.slice(state.pos);
  let matchData = remainder.match(/^\{:([^}]+)\}/);

  if (!matchData) {
    return false;
  }

  const ial = trim(matchData[1]);

  if (!ial) {
    return false;
  }

  state.pos += matchData[0].length;

  /* inline IALs are ignored when there is no preceding inline element */
  if (!state.tokens.length) {
    return true;
  }

  const attributes = parseIal(ial);

  const token = state.push("inline_ial", null, 0);
  token.markup = matchData[0];
  token.attrs = attributes;
  token.hidden = true;

  return true;
};

const parseBlockIal = (state, startLine, endLine, silent) => {
  const pos = state.bMarks[startLine] + state.tShift[startLine];
  const max = state.eMarks[startLine];
  const str = state.src.slice(pos, max);
  const matchData = str.match(/^\s*\{:([^\}]+)\}\s*$/m);

  if (!matchData) {
    return false;
  }

  state.line += 1;

  const attrs = parseIal(matchData[1]);
  const target = findTarget(state.tokens, state.tokens.length - 1);

  if (!target) {
    return true;
  }

  if (!target.attrs) {
    target.attrs = [];
  }

  mergeAttributes(attrs, target.attrs);

  return true;
};

const findTarget = (tokens, idx) => {
  let closes = 0;

  for (var i = idx - 1; i >= 0; --i) {
    if (tokens[i].type.match(/_close$/)) {
      closes++;
    } else if (tokens[i].type.match(/_open$/)) {
      closes--;
    }

    if (closes <= 0 && tokens[i].type != "text" && tokens[i].type != "inline") {
      return tokens[i];
    }
  }

  return null;
};

const postProcess = state => {
  for (let i = 0; i < state.tokens.length; ++i) {
    if (state.tokens[i].type == "inline_ial") {
      const target = findTarget(state.tokens, i);

      if (!target) {
        continue;
      }

      if (!target.attrs) {
        target.attrs = [];
      }

      if (!(target.attrs instanceof Array)) {
        const newAttrs = [];
        Object.keys(target.attrs).forEach(k => {
          newAttrs.push([k, target.attrs[k]]);
        });
        target.attrs = newAttrs;
      }

      mergeAttributes(state.tokens[i].attrs, target.attrs);
    }
  }
};

export default (md, options) => {
  md.inline.ruler.push("inline_ial", parseInlineIal);
  md.inline.ruler2.push("inline_ial", postProcess);

  md.block.ruler.before("blockquote", "block_ial", parseBlockIal);
};
