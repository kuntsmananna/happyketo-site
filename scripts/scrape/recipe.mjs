// Split a post's blocks into ingredients / instructions / remaining body.
//
// Walks blocks with a small state machine:
//   body  --(ingredients heading)-->  ing  --(steps heading)-->  steps  --(paragraph after a list, divider)--> after
// Any other heading inside ing/steps starts a titled sub-group ("לרוטב", "יבשים", "הכנת הקרמל").

const ING_RE = /^ה?(מצרכים|מרכיבים|רכיבים|חומרים)(?=$|[\s:])/;
const STEP_RE = /^(אופן\s+(ה)?הכנה|הוראות\s+(ה)?הכנה|ה?הכנה|איך\s+מכינים|שלבי\s+(ה)?הכנה)(?=$|[\s:])/;
const GENERIC_ING_RE = /^ה?(מצרכים|מרכיבים|רכיבים|חומרים)\s*:?$/;
const GENERIC_STEP_RE = /^(אופן\s+(ה)?הכנה|הוראות\s+(ה)?הכנה|ה?הכנה|איך\s+מכינים|שלבי\s+(ה)?הכנה)\s*:?$/;
const SIGNOFF_RE = /^(בתאבון|לבריאות|שיהיה|תהנו|בהצלחה)/;

const stripColon = (s) => s.replace(/\s*:\s*$/, '').trim();
const stripBullet = (s) => s.replace(/^[•·\-–*]\s*/, '').trim();

/** A heading, or a short bold-only paragraph acting as one. */
function headingText(b) {
  if (b.type === 'h') return b.text;
  if (b.type === 'p' && b.bold && b.text.length <= 45 && !b.text.includes('\n')) return b.text;
  return null;
}

export function extractRecipe(blocks) {
  const ingredients = [];
  const instructions = [];
  const body = [];
  const flags = [];
  let mode = 'body';
  let group = null; // current group object
  let groupHasList = false;
  let insertAt = -1; // index in `body` where the recipe section sat in the original post
  let sawRecipe = false; // explicit "מצרכים"/"אופן ההכנה" sections (used for recipe-vs-article classification)
  let implicit = false; // sections found only through the heading+list rule

  const newGroup = (kind, title) => {
    if (insertAt < 0) insertAt = body.length;
    // Continue the previous untitled group of the same kind instead of starting an empty twin.
    const list = kind === 'ing' ? ingredients : instructions;
    const last = list.at(-1);
    if (!title && last && !last.title && group === last) {
      groupHasList = false;
      return;
    }
    group = kind === 'ing' ? { title, items: [] } : { title, steps: [] };
    (kind === 'ing' ? ingredients : instructions).push(group);
    groupHasList = false;
  };
  const push = (text) => {
    const t = stripBullet(text);
    if (!t) return;
    (mode === 'ing' ? group.items : group.steps).push(t);
  };

  for (let idx = 0; idx < blocks.length; idx++) {
    const b = blocks[idx];
    const next = blocks[idx + 1];
    const h = headingText(b);

    if (h && ING_RE.test(h)) {
      mode = 'ing';
      sawRecipe = true;
      newGroup('ing', GENERIC_ING_RE.test(h) ? undefined : stripColon(h));
      continue;
    }
    if (h && STEP_RE.test(h) && (mode !== 'body' || sawRecipe || b.type === 'h')) {
      mode = 'steps';
      sawRecipe = true;
      newGroup('steps', GENERIC_STEP_RE.test(h) ? undefined : stripColon(h));
      continue;
    }

    // Recipe without a "מצרכים" heading: "יבשים" / "לבסיס" heading directly followed by a bullet list.
    if (mode === 'body' && h && b.type === 'h' && next?.type === 'ul') {
      mode = 'ing';
      implicit = true;
      newGroup('ing', stripColon(h));
      group.source = b;
      continue;
    }

    if (mode === 'ing' || mode === 'steps') {
      if (h) {
        // Sub-section inside the recipe ("לבסיס", "מצרכים לרוטב", "הכנת הקרמל").
        // A heading followed by a bullet list while in steps mode is a new ingredient group.
        if (mode === 'steps' && next?.type === 'ul' && !groupHasList) mode = 'ing';
        newGroup(mode, stripColon(h));
        group.source = b; // returned to the body if the group stays empty
        continue;
      }
      if (b.type === 'ul' || b.type === 'ol') {
        for (const i of b.items) {
          // "בתאבון!" as the last list item is a sign-off, not a step.
          if (mode === 'steps' && SIGNOFF_RE.test(i.text) && i.text.length <= 30) body.push({ type: 'p', html: i.html, text: i.text });
          else push(i.text);
        }
        groupHasList = true;
        continue;
      }
      if (b.type === 'p') {
        const lines = b.text.split('\n').map((l) => l.trim()).filter(Boolean);
        if (SIGNOFF_RE.test(b.text)) {
          if (mode === 'steps') mode = 'after';
          body.push(b);
          continue;
        }
        const colonTitle = lines.length === 1 && b.text.length <= 45 && /:\s*$/.test(b.text);
        // "מצרכים לרוטב:"-style line right before a list → titled group.
        if (colonTitle && (next?.type === 'ul' || next?.type === 'ol')) {
          if (next.type === 'ul' && mode === 'ing') newGroup('ing', stripColon(b.text));
          else if (next.type === 'ol') {
            mode = 'steps';
            newGroup('steps', stripColon(b.text));
          } else push(b.text); // e.g. "במחבת קטנה להמיס:" before an ingredient list inside steps
          continue;
        }
        if (mode === 'ing') {
          // A prose sentence after the ingredient list → the steps have started (no heading).
          if (groupHasList && (b.text.length > 40 || colonTitle)) {
            mode = 'steps';
            newGroup('steps', undefined);
            lines.forEach(push);
            continue;
          }
          // Ingredients written as plain lines rather than a list.
          if (lines.every((l) => l.length <= 120)) {
            lines.forEach(push);
            continue;
          }
        } else if (!groupHasList) {
          lines.forEach(push);
          continue;
        }
        // Paragraph after the steps list → notes; recipe section is over.
        if (mode === 'steps') mode = 'after';
        body.push(b);
        continue;
      }
      if (b.type === 'hr') {
        if (mode === 'steps') mode = 'after';
        continue;
      }
      // images, videos, buttons inside the recipe → keep in body
      body.push(b);
      continue;
    }

    body.push(b);
  }

  // A titled group that collected nothing was really a body line (e.g. a bold credit after the steps).
  for (const g of [...ingredients, ...instructions]) {
    if (!(g.items ?? g.steps).length && g.source) body.push(g.source);
    delete g.source;
  }
  const ing = ingredients.filter((g) => g.items.length);
  const steps = instructions.filter((g) => g.steps.length);
  // A single group needs no title unless it is meaningful ("מצרכים לבלילה") — keep as-is.
  const found = sawRecipe || implicit;
  if (found && !ing.length) flags.push('no-ingredients');
  if (found && !steps.length) flags.push('no-instructions');
  if (implicit && !sawRecipe) flags.push('implicit-sections');
  if (ing.length > 3 || steps.length > 3) flags.push('many-groups');
  return { ingredients: ing, instructions: steps, body, insertAt: insertAt < 0 ? body.length : insertAt, sawRecipe, implicit, flags };
}

/** Prep time in minutes from title/text ("5 דק", "זמן הכנה: 20 דקות", "חצי שעה"). */
export function guessPrepTime(title, blocks) {
  const text = [title, ...blocks.filter((b) => b.type === 'p').map((b) => b.text)].join('\n');
  const explicit = text.match(/זמן\s+(ה)?הכנה\s*:?\s*(?:כ-?\s*)?(\d+)\s*(דק|דקות)/);
  if (explicit) return Number(explicit[2]);
  // Note: \b doesn't work after Hebrew letters in JS regex, hence the explicit lookahead.
  const inTitle = title.match(/(\d+)\s*(דק|דקות)(?=$|[\s׳'.,)])/);
  if (inTitle) return Number(inTitle[1]);
  return undefined;
}
