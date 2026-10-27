# Publishing Blog Posts

Posts live in `blog/posts/` as Markdown files with YAML front matter.

## Create a post

1. Copy an existing `.md` file in `blog/posts/`.
2. Update `title`, `category`, `date`, `readingTime`, `excerpt`, `featuredImage`, and `slug`.
3. Write the article body in Markdown.
4. Run `npm run build:blog`.
5. Preview the generated `blog/index.html` and `blog/posts/<slug>.html`.

The generator creates the blog listing, dedicated article pages, and `blog/posts.json`. It does not use browser localStorage or a fake CMS. A GitHub-backed CMS can be added later with authenticated server-side storage; Markdown remains the deployment-safe source of truth.
