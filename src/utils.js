export const trim = s => s.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
export const trimStart = s => s.replace(/^[\s\uFEFF\xA0]+/g, "");

export const scan = (str, re) => {
  if (!re.global) {
    throw "RegExp must be global";
  }

  let m,
    r = [];

  while ((m = re.exec(str))) {
    m.shift();
    r.push(m);
  }

  return r;
};

export const repeatStr = (count, str) => {
  if (str.length == 0 || count == 0) {
    return "";
  }

  let rpt = "";
  for (var i = 0; i < count; i++) {
    rpt += str;
  }

  return rpt;
};

export const arrayUniq = array => {
  return array.filter((val, index, ary) => {
    return ary.indexOf(val) === index;
  });
};

export const addClass = (attr, target) => {
  let classes;

  target.forEach(ary => {
    if (ary[0] == "class") {
      classes = ary;
    }
  });

  if (!classes) {
    classes = ["class", ""];
    target.push(classes);
  }

  classes[1] = classes[1].split(/\s+/);
  classes[1].push(attr.replace(/^\s*\./, ""));
  classes[1] = trim(arrayUniq(classes[1]).join(" "));
};
