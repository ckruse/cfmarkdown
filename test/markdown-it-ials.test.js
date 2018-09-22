import assert from "assert";
import MarkdownIt from "markdown-it";
import MarkdownItIals from "../src/markdown-it-ials";

const md = MarkdownIt().use(MarkdownItIals);

describe("markdown-it-ials", () => {
  it("renders an IAL with a class correctly", () => {
    assert.equal(md.render("abcd{:.foo}"), '<p class="foo">abcd</p>\n');
  });

  it("renders an block IAL with a class correctly", () => {
    assert.equal(md.render("# abcd\n{:.foo}"), '<h1 class="foo">abcd</h1>\n');
  });

  it("renders an IAL with an ID correctly", () => {
    assert.equal(md.render("abcd{:#foo}"), '<p id="foo">abcd</p>\n');
  });

  it("renders an IAL with a lang correctly", () => {
    assert.equal(md.render("abcd{:@de}"), '<p lang="de">abcd</p>\n');
  });

  it("renders an IAL with an ID, a class and a lang correctly", () => {
    assert.equal(
      md.render("abcd{:.bar #foo @de}"),
      '<p class="bar" id="foo" lang="de">abcd</p>\n'
    );
  });

  it("renders multiple IALs correctly", () => {
    assert.equal(
      md.render("_abcd_{:#foo} **foo**{:.bar}"),
      '<p><em id="foo">abcd</em> <strong class="bar">foo</strong></p>\n'
    );
  });
});
