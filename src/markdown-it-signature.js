export default (md, options) => {
  const signatureBlock = (state, start, end, silent) => {
    const pos = state.bMarks[start] + state.tShift[start];
    const remainder = state.src.slice(pos);

    if (!/^-- \n/.test(remainder) || remainder.indexOf("-- \n", 5) != -1) {
      return false;
    }

    const oldParent = state.parentType;
    state.parentType = "container";

    let token = state.push("signature_block", "div", 1);
    token.block = true;
    token.map = [start, state.line];
    token.markup = "-- \n";
    state.line = end;

    //state.md.block.tokenize(state, start + 1, end, true);
    token = state.push("inline", "", 0);
    token.content = remainder.replace(/^-- \n/, "");
    token.map = [start + 1, end];
    token.children = [];

    token = state.push("signature_block_close", "div", -1);
    token.block = true;

    state.parentType = oldParent;
    state.line = end;

    return true;
  };

  const blockRenderer = (tokens, idx) => {
    return '<div class="signature">-- <br>\n';
  };

  md.block.ruler.after("blockquote", "signature_block", signatureBlock);
  md.renderer.rules.signature_block = blockRenderer;
};
