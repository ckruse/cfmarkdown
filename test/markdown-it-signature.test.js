import assert from "assert";
import MarkdownIt from "markdown-it";
import MarkdownItSignature from "../src/markdown-it-signature";

describe("markdown-it-signature", () => {
  it("renders a signature correctly", () => {
    const md = MarkdownIt().use(MarkdownItSignature);
    assert.equal(
      md.render("-- \nfoo"),
      '<div class="signature">\n<p>foo</p>\n</div>\n'
    );
  });

  it("renders only the last signature as signature", () => {
    const md = MarkdownIt().use(MarkdownItSignature);
    assert.equal(
      md.render("-- \nfoo bar\n\n-- \nfoo"),
      '<p>--\nfoo bar</p>\n<div class="signature">\n<p>foo</p>\n</div>\n'
    );
  });
});
