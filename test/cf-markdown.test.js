import assert from "assert";
import CfMarkown from "../src/index";

describe("CfMarkdown", () => {
  it("renders a heading at start index", () => {
    const md = CfMarkown({ headerStartIndex: 3 });
    assert.equal(md.render("# foo"), "<h3>foo</h3>");
    assert.equal(md.render("## foo"), "<h4>foo</h4>");
    assert.equal(md.render("###### foo"), "<h6>foo</h6>");
  });

  it("renders html as text", () => {
    const md = CfMarkown();
    assert.equal(md.render("<p>lala"), "<p>&lt;p&gt;lala</p>\n");
    assert.equal(md.render("&amp;lala"), "<p>&amp;amp;lala</p>\n");
  });

  it("renders plain text", () => {
    const md = CfMarkown({ target: "plain" });
    console.log(
      md.render(
        '# lala\n\n- ba\n- bu <https://wwwtech.de/>\n\nbar ![foo alt](https://wwwtech.de/img "lulu")'
      )
    );
  });
});
