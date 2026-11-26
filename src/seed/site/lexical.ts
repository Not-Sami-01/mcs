/**
 * Minimal Lexical JSON builder for seeded Pest Library articles.
 *
 * The admin editor can add links and other features later; the seed only needs
 * headings, paragraphs and bullet lists, which is all these articles use.
 */

type Block =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] };

const textNode = (text: string) => ({
  type: 'text',
  version: 1,
  text,
  format: 0,
  style: '',
  mode: 'normal',
  detail: 0,
});

const base = {
  version: 1,
  format: '',
  indent: 0,
  direction: 'ltr' as const,
};

function childrenOf(block: Block) {
  if (block.type === 'ul') {
    return block.items.map((item, index) => ({
      type: 'listitem',
      value: index + 1,
      ...base,
      children: [textNode(item)],
    }));
  }

  return [textNode(block.text)];
}

export function lexicalDoc(blocks: Block[]) {
  return {
    root: {
      type: 'root',
      version: 1,
      format: '',
      indent: 0,
      direction: 'ltr' as const,
      children: blocks.map((block) => {
        if (block.type === 'ul') {
          return {
            type: 'list',
            listType: 'bullet',
            tag: 'ul',
            start: 1,
            version: 1,
            format: '',
            indent: 0,
            direction: 'ltr',
            children: childrenOf(block),
          };
        }

        if (block.type === 'h2' || block.type === 'h3') {
          return {
            type: 'heading',
            tag: block.type,
            version: 1,
            format: '',
            indent: 0,
            direction: 'ltr',
            children: childrenOf(block),
          };
        }

        return {
          type: 'paragraph',
          version: 1,
          format: '',
          indent: 0,
          direction: 'ltr',
          textFormat: 0,
          children: childrenOf(block),
        };
      }),
    },
  };
}
