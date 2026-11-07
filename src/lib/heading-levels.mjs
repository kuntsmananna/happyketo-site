/**
 * Markdown (Sätteri mdast) plugin: the headings inside a post start at level 2, because the page's h1 is the post title.
 * Some posts came from Wix with only ### headings, so screen readers heard h1 → h3 with no h2 in between.
 * Their headings are renumbered up (### → h2, #### → h3, …) and get the class `h-look-<written level>`, so
 * `Prose` keeps the size the author chose (only `h-look-3` needs a style: no post goes deeper).
 * A post that starts at # is moved down to h2 (no class: it takes the h2 look).
 *
 * A factory, so every document gets its own `shift`: `before` finds the shallowest heading, the visitor renumbers.
 */
/** @param {any} node @returns {number} */
const minDepth = (node) =>
  node.type === 'heading' ? node.depth : Math.min(Infinity, ...(node.children ?? []).map(minDepth));

/** @type {import('satteri').MdastPluginEntry} */
const headingLevels = () => {
  let shift = 0;
  return {
    name: 'heading-levels',
    before(root) {
      const min = minDepth(root);
      shift = Number.isFinite(min) ? min - 2 : 0;
    },
    heading(node, ctx) {
      if (!shift) return;
      const written = node.depth;
      ctx.setProperty(node, 'depth', /** @type {1|2|3|4|5|6} */ (Math.min(6, Math.max(2, written - shift))));
      if (shift > 0) {
        const data = /** @type {any} */ (node.data) ?? {};
        const props = data.hProperties ?? {};
        const className = [props.className ?? []].flat();
        ctx.setProperty(node, 'data', { ...data, hProperties: { ...props, className: [...className, `h-look-${written}`] } });
      }
    },
  };
};

export default headingLevels;
