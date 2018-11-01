const PlainTextRules = {};

function plain(text) {
  return text.replace(/[ <>&]/g, " ");
}

PlainTextRules.code_inline = function(tokens, idx, _options, _env, _slf) {
  return plain(tokens[idx].content);
};

PlainTextRules.code_block = function(tokens, idx, _options, _env, _slf) {
  return plain(tokens[idx].content);
};

PlainTextRules.fence = PlainTextRules.code_block;

PlainTextRules.image = function(tokens, idx, options, env, slf) {
  const tok = tokens[idx];
  const alt = slf.renderInlineAsText(tok.children, options, env);
  const title = tok.attrs[tok.attrIndex("title")] || [];

  return plain(alt + " " + (title[1] || ""));
};

PlainTextRules.hardbreak = function() {
  return "\n";
};

PlainTextRules.softbreak = PlainTextRules.hardbreak;

PlainTextRules.text = function(tokens, idx) {
  return plain(tokens[idx].content);
};

PlainTextRules.html_block = function(tokens, idx) {
  return plain(tokens[idx].content);
};

PlainTextRules.html_inline = function(tokens, idx) {
  return plain(tokens[idx].content);
};

class PlainTextRenderer {
  constructor() {
    this.rules = Object.assign({}, PlainTextRules);
  }

  renderInlineAsText(tokens, options, env) {
    var result = "";

    for (var i = 0, len = tokens.length; i < len; i++) {
      if (tokens[i].type === "text") {
        result += tokens[i].content;
      } else if (tokens[i].type === "image") {
        result += this.renderInlineAsText(tokens[i].children, options, env);
      }
    }

    return result;
  }

  renderToken(tokens, idx, _options) {
    let nextToken,
      result = "",
      needLf = false;
    const token = tokens[idx];

    // Tight list paragraphs
    if (token.hidden) {
      return "";
    }

    // Insert a newline between hidden paragraph and subsequent opening
    // block-level tag.
    //
    // For example, here we should insert a newline before blockquote:
    //  - a
    //    >
    //
    if (token.block && token.nesting !== -1 && idx && tokens[idx - 1].hidden) {
      result += "\n";
    }

    // Add token name, e.g. `<img`
    // result += (token.nesting === -1 ? "</" : "<") + token.tag;

    // Encode attributes, e.g. `<img src="foo"`
    // result += this.renderAttrs(token);

    // Add a slash for self-closing tags, e.g. `<img src="foo" /`
    // if (token.nesting === 0 && options.xhtmlOut) {
    //   result += " /";
    // }

    // Check if we need to add a newline after this tag
    if (token.block) {
      needLf = true;

      if (token.nesting === 1) {
        if (idx + 1 < tokens.length) {
          nextToken = tokens[idx + 1];

          if (nextToken.type === "inline" || nextToken.hidden) {
            // Block-level tag containing an inline tag.
            //
            needLf = false;
          } else if (nextToken.nesting === -1 && nextToken.tag === token.tag) {
            // Opening tag + closing tag of the same type. E.g. `<li></li>`.
            //
            needLf = false;
          }
        }
      }
    }

    // result += needLf ? ">\n" : ">";
    if (needLf) {
      result += "\n";
    }

    return result;
  }

  renderInline(tokens, options, env) {
    let result = "";
    const rules = this.rules;

    for (var i = 0, len = tokens.length; i < len; i++) {
      if (typeof rules[tokens[i].type] !== "undefined") {
        result += rules[tokens[i].type](tokens, i, options, env, this);
      } else {
        result += this.renderToken(tokens, i, options);
      }
    }

    return result;
  }

  render(tokens, options, env) {
    let i,
      len,
      result = "";
    const rules = this.rules;

    for (i = 0, len = tokens.length; i < len; i++) {
      if (tokens[i].type === "inline") {
        result += this.renderInline(tokens[i].children, options, env);
      } else if (typeof rules[tokens[i].type] !== "undefined") {
        result += rules[tokens[i].type](tokens, i, options, env, this);
      } else {
        result += this.renderToken(tokens, i, options, env);
      }
    }

    return result;
  }
}

export default PlainTextRenderer;
