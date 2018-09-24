import assert from "assert";
import MarkdownIt from "markdown-it";
import MarkdownItIals from "../src/markdown-it-ials";

const md = MarkdownIt().use(MarkdownItIals);

describe("markdown-it-ials", () => {
  it("renders an IAL with a class correctly", () => {
    assert.equal(
      md.render("*abcd*{:.foo}"),
      '<p><em class="foo">abcd</em></p>\n'
    );
  });

  it("renders an IAL with a class in a nested context", () => {
    assert.equal(
      md.render("*abcd *def**{:.foo}"),
      '<p><em class="foo">abcd <em>def</em></em></p>\n'
    );
    assert.equal(
      md.render("*abcd *def*{:.foo}*"),
      '<p><em>abcd <em class="foo">def</em></em></p>\n'
    );
  });

  it("renders an block IAL with a class correctly", () => {
    assert.equal(md.render("# abcd\n{:.foo}"), '<h1 class="foo">abcd</h1>\n');
  });

  it("renders an block IAL with a class and an id correctly", () => {
    assert.equal(
      md.render("# abcd\n{:.foo #lulu}"),
      '<h1 class="foo" id="lulu">abcd</h1>\n'
    );
  });

  it("renders an IAL with an ID correctly", () => {
    assert.equal(md.render("_abcd_{:#foo}"), '<p><em id="foo">abcd</em></p>\n');
  });

  it("renders an IAL with a lang correctly", () => {
    assert.equal(md.render("_abcd_{:@de}"), '<p><em lang="de">abcd</em></p>\n');
  });

  it("renders an IAL with an ID, a class and a lang correctly", () => {
    assert.equal(
      md.render("_abcd_{:.bar #foo @de}"),
      '<p><em class="bar" id="foo" lang="de">abcd</em></p>\n'
    );
  });

  it("renders multiple IALs correctly", () => {
    assert.equal(
      md.render("_abcd_{:#foo} **foo**{:.bar}"),
      '<p><em id="foo">abcd</em> <strong class="bar">foo</strong></p>\n'
    );
  });

  it("renders IALs with spaces", () => {
    assert.equal(
      md.render(
        "Mit `br { display: none }`{: .language-css} erreicht man, dass die Zeilen nicht umbrochen werden, aber den horizontalen Abstand habe ich auf die Schnelle ohne zusätzliche line-Elemente nicht erreichen können."
      ),
      '<p>Mit <code class="language-css">br { display: none }</code> erreicht man, dass die Zeilen nicht umbrochen werden, aber den horizontalen Abstand habe ich auf die Schnelle ohne zusätzliche line-Elemente nicht erreichen können.</p>\n'
    );
  });

  it("renders a complex IAL", () => {
    assert.equal(
      md.render("`&copy`{:.language-html} - `&copy;`{:.language-html}"),
      '<p><code class="language-html">&amp;copy</code> - <code class="language-html">&amp;copy;</code></p>\n'
    );
  });
});
