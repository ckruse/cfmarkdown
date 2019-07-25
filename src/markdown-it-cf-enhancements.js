import { addClass } from "./utils";

import fence from "markdown-it/lib/rules_block/fence";

const cfEnhancements = state => {
  state.tokens.forEach(tok => {
    if (!tok.attrs) {
      tok.attrs = [];
    }

    if (tok.type == "fence") {
      addClass("block", tok.attrs);

      if (tok.info) {
        let [lang, goodBad] = tok.info.split(/,\s*/);
        if (goodBad && ["good", "bad"].includes(goodBad)) {
          tok.info = lang;
          addClass(goodBad, tok.attrs);
        }
      }
    }
  });
};

export default md => {
  md.core.ruler.after("inline", "cf-enhancements", cfEnhancements);
};
