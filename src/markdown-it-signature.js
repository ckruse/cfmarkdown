export default function(md, options) {
  var signature_block = function(state, start, end, silent) {
    var pos = state.bMarks[start] + state.tShift[start];
    var remainder = state.src.slice(pos);

    if (!/^-- \n/.test(remainder) || remainder.indexOf("-- \n", 5) != -1) {
      return false;
    }

    var oldParent = state.parentType;
    state.parentType = "container";

    var token = state.push("signature_block", "div", 1);
    token.block = true;
    token.map = [start, state.line];
    token.markup = "-- \n";
    state.line = end;

    state.md.block.tokenize(state, start + 1, end, true);

    token = state.push("signature_block_close", "div", -1);
    token.block = true;

    state.parentType = oldParent;
    state.line = end;

    return true;
  };

  var blockRenderer = function(tokens, idx) {
    return '<div class="signature">\n';
  };

  md.block.ruler.after("blockquote", "signature_block", signature_block);
  md.renderer.rules.signature_block = blockRenderer;
}
