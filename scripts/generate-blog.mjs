import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname.replace(/^\//, '').replace(/%20/g, ' ');
const postsDir = join(root, 'blog', 'posts');
const blogDir = join(root, 'blog');
const files = (await readdir(postsDir)).filter(file => file.endsWith('.md')).sort();

const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const inline = value => escapeHtml(value).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
const markdownToHtml = markdown => markdown.trim().split(/\r?\n/).reduce((html, line) => {
  if (!line.trim()) return html;
  if (line.startsWith('# ')) return html + `<h1>${inline(line.slice(2))}</h1>`;
  if (line.startsWith('## ')) return html + `<h2>${inline(line.slice(3))}</h2>`;
  if (line.startsWith('- ')) return html + `<li>${inline(line.slice(2))}</li>`;
  return html + `<p>${inline(line)}</p>`;
}, '').replace(/(<li>.*<\/li>)+/g, list => `<ul>${list}</ul>`);

const posts = [];
for (const file of files) {
  const source = await readFile(join(postsDir, file), 'utf8');
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) throw new Error(`Missing front matter in ${file}`);
  const metadata = Object.fromEntries(match[1].split(/\r?\n/).filter(Boolean).map(line => {
    const index = line.indexOf(':');
    return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
  }));
  const slug = metadata.slug || file.replace(/\.md$/, '');
  const post = { ...metadata, slug, source: `posts/${file}` };
  posts.push(post);
  const article = markdownToHtml(match[2]);
  const page = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${escapeHtml(metadata.excerpt)}"><title>${escapeHtml(metadata.title)} | Zeeshan Younas</title><style>body{margin:0;background:#080808;color:#f5f5f5;font:16px/1.8 Georgia,serif}main{max-width:760px;margin:0 auto;padding:72px 24px}a{color:#f5d77a}h1,h2{font-family:Arial,sans-serif;line-height:1.15}h1{font-size:clamp(42px,8vw,76px)}h2{margin-top:42px;color:#f5d77a}p{color:#c6c2b9}code{color:#f5d77a}header{font:12px Arial,sans-serif;letter-spacing:2px;color:#a1a1aa}img{width:100%;margin:28px 0;border:1px solid #3c3323}</style></head><body><main><header><a href="../index.html">ZEESHAN YOUNAS</a> / ${escapeHtml(metadata.category)} / ${escapeHtml(metadata.date)}</header>${metadata.featuredImage ? `<img src="../../${escapeHtml(metadata.featuredImage.replace('../',''))}" alt="">` : ''}${article}<p><a href="../index.html#blog">Back to blog</a></p></main></body></html>`;
  await writeFile(join(postsDir, `${slug}.html`), page, 'utf8');
}

await mkdir(blogDir, { recursive: true });
await writeFile(join(blogDir, 'posts.json'), JSON.stringify(posts, null, 2), 'utf8');
const cards = posts.map(post => `<article><img src="${escapeHtml(post.featuredImage)}" alt=""><small>${escapeHtml(post.category)} · ${escapeHtml(post.date)} · ${escapeHtml(post.readingTime)}</small><h2>${escapeHtml(post.title)}</h2><p>${escapeHtml(post.excerpt)}</p><a href="posts/${escapeHtml(post.slug)}.html">Read more</a></article>`).join('');
await writeFile(join(blogDir, 'index.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Blog | Zeeshan Younas</title><style>body{margin:0;background:#080808;color:#f5f5f5;font:16px/1.7 Arial,sans-serif}main{max-width:1100px;margin:auto;padding:64px 24px}h1{font-size:clamp(48px,8vw,92px)}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:18px}article{padding:24px;border:1px solid #3c3323;background:#161616}img{width:100%;aspect-ratio:16/8;object-fit:cover}small{color:#f5d77a;letter-spacing:1px}p{color:#a1a1aa}a{color:#f5d77a}@media(max-width:700px){.grid{grid-template-columns:1fr}}</style></head><body><main><a href="../index.html">Back to portfolio</a><h1>Writing on intelligent systems.</h1><section class="grid">${cards}</section></main></body></html>`, 'utf8');
console.log(`Generated ${posts.length} blog posts.`);
