import { parse as shellParser } from "shell-quote";

const globalRe = /(?:\s*|\n*){:([^}]+)}/g;
const fullMtRe = /^(?:\s*|\n*)({:([^}]+)}\n?)+$/g;
const singleRe = /(?:\s*|\n*){:([^}]+)}/;

const arrayUniq = array => {
  return array.filter((val, index, ary) => {
    return ary.indexOf(val) === index;
  });
};

const cleanupChildrenAndRemoveCurly = token => {
  let children = [],
    childFound;
  token.content.replace(singleRe, "");

  token.children.forEach((child, i) => {
    if (child.type == "text" && child.content.match(singleRe)) {
      childFound = true;
      child.content = child.content.replace(singleRe, "");
      if (child.content != "") {
        children.push(child);
      } else {
        let previousChild = children[children.length - 1];
        if (previousChild && previousChild.type == "softbreak") {
          children.pop();
        }
      }
    } else if (!(childFound && child.type == "softbreak")) {
      children.push(child);
    }
  });

  token.children = children;
};

const addClass = (attr, target) => {
  let classes;

  target.attrs.forEach(ary => {
    if (ary[0] == "class") {
      classes = ary;
    }
  });

  if (!classes) {
    classes = ["class", ""];
    target.attrs.push(classes);
  }

  classes[1] = classes[1].split(/\s+/);
  classes[1].push(attr.replace(/^\s*\./, ""));
  classes[1] = arrayUniq(classes[1])
    .join(" ")
    .trim();
};

const addID = (attr, target) => {
  target.attrs.push(["id", attr.replace(/^\s*#/, "")]);
};

const addAttr = (attr, target) => {
  attr = attr.split(/\s*=\s*/);
  target.attrs.push([attr[0], attr.slice(1, attr.length).join("=")]);
};

const addLang = (attr, target) => {
  target.attrs.push(["lang", attr.replace(/^\s*@/, "")]);
};

const shouldIgnoreTokenForBlockRe = (target, prev) => {
  return (
    target.type == "inline" ||
    target.type.match(/_close$/) ||
    (target.type.match(/_open$/) && prev && prev.content.match(fullMtRe))
  );
};

const specials = [
  "/",
  ".",
  "*",
  "+",
  "?",
  "|",
  "(",
  ")",
  "[",
  "]",
  "{",
  "}",
  "\\"
];
const sRE = new RegExp("(\\" + specials.join("|\\") + ")", "g");
const regexEscape = text => text.replace(sRE, "\\$1");

const findTarget = (state, token, tokens, index, attrs) => {
  if (token.content.match(fullMtRe)) {
    let current = tokens.length;
    let target = tokens[current];

    do {
      current -= 1;
      target = tokens[current];
    } while (shouldIgnoreTokenForBlockRe(target, tokens[current + 1]));

    return target;
  } else if (token.children[0].type == "text") {
    return state.tokens[index - 1];
  } else {
    //target = token.children[0];
    //console.log("else", target);
    const rx = new RegExp(regexEscape(attrs));
    for (let i = 0; i < token.children.length; ++i) {
      if (rx.test(token.children[i].content)) {
        if (token.children[i - 1].type.match(/_close$/)) {
          for (; i >= 0; --i) {
            if (token.children[i].type.match(/_open$/)) {
              return token.children[i];
            }
          }
        }
      }
    }

    return token.children[0];
  }
};

const parseIals = state => {
  let skipNext = false,
    tokens = [];

  state.tokens.forEach((token, i) => {
    if (!skipNext) {
      tokens.push(token);
    } else {
      skipNext = false;
    }

    if (token.block && token.type == "inline") {
      let attrMatches = token.content.match(globalRe);
      if (attrMatches && attrMatches.length > 0) {
        attrMatches.forEach(attrs => {
          const target = findTarget(state, token, tokens, i, attrs);
          attrs = shellParser(attrs.match(singleRe)[1].replace(/#/, "\\#"));

          if (!target.attrs) {
            target.attrs = [];
          }

          attrs.forEach(attr => {
            if (attr.match(/^\s*\./)) {
              addClass(attr, target);
            } else if (attr.match(/^\s*#/)) {
              addID(attr, target);
            } else if (attr.match(/^\s*@/)) {
              addLang(attr, target);
            } else {
              addAttr(attr, target);
            }
          });
        });

        cleanupChildrenAndRemoveCurly(token);

        if (token.content.match(fullMtRe)) {
          tokens.pop();
          if (state.tokens[i - 1].type == "paragraph_open") {
            tokens.pop();
            if (state.tokens[i + 1].type == "paragraph_close") {
              skipNext = true;
            }
          }
        }
      }
    }
  });

  state.tokens = tokens;
};

export default markdown => {
  markdown.core.ruler.before("replacements", "kramdown_attrs", parseIals);
};
