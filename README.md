# Deno QuickBlog Engine

A simple blog generator powered by Deno,
[GitHub Flavored Markdown (GFM)](https://github.github.com/gfm/) and a little
[Preact](https://preactjs.com/).\
It's an all-in-one TypeScript file to generate a static blog from markdown
files.

[![Deno Test](https://github.com/simonneutert/deno-quickblog/actions/workflows/deno.yaml/badge.svg)](https://github.com/simonneutert/deno-quickblog/actions/workflows/deno.yaml)

> [!CAUTION]
> This project is in a public alpha stage. The engine will be pulled out into a
> separate package in the future, and this repository will serve as a
> demo/showcase/template for how to use it.\
> So expect breaking changes and a lot of updates in the near future. **Most
> likely I will drop and re-create the GitHub repository itself.**\
> But if you want to try it out and give feedback, please do! Just make sure to
> back up your content before pulling the latest changes.

## Template

See
[Deno QuickBlog Template](https://github.com/simonneutert/deno-quickblog-template)
on GitHub.

## Features

- **Markdown-based**: Write posts in Markdown with TOML frontmatter
- **GitHub Flavored Markdown**: Full GFM support with syntax highlighting
- **Preact Support**: Create dynamic pages with JSX
- **i18n Ready**: Built-in internationalization support
- **Zero Configuration**: Works out of the box, customize when needed
- **Fast**: Built with Deno for blazing fast builds
- **Responsive**: Mobile-friendly HTML output

## Quick Start

### Install Globally

```bash
# Install the CLI globally.
#
# `-A` allow all permissions
# `-n quickblog` sets the command name to `quickblog`
#
# You can omit `-n quickblog` to use `deno run -A jsr:@simonneutert/quickblog` for commands instead.
deno install -A -n quickblog jsr:@simonneutert/quickblog
```

### Initialize a New Blog

```bash
# Initialize a new blog in the current directory
deno run -A jsr:@simonneutert/quickblog init

# Or when you installed globally
quickblog init
```

This creates the following structure:

```
my-blog/
├── posts/              # Your blog posts
├── pages/              # Static pages (about, etc.)
├── public/             # Static assets (images, CSS, etc.)
├── index.md            # Homepage content
├── nav.md              # Navigation menu
└── footer.md           # Footer content
```

### Create a New Post

```bash
# Create a new post with a custom title (TOML frontmatter by default)
deno run -A jsr:@simonneutert/quickblog new "My Post Title"

# Create a post with YAML frontmatter
deno run -A jsr:@simonneutert/quickblog new "My Post" --yaml

# Or with global install
quickblog new "My Post"
quickblog new "My Post" --yaml
```

Posts are automatically named with the current date: `YYYY-MM-DD-slug.md`

**Frontmatter Formats:**

- **TOML** (default): Uses `+++` delimiters
- **YAML**: Uses `---` delimiters (add `--yaml` or `-y` flag)

### Build Your Blog

```bash
# Build the blog
deno run -A jsr:@simonneutert/quickblog build

# Or with global install
quickblog build
```

The static site will be generated in the `dist/` directory.

### Preview Locally

```bash
deno run --allow-net --allow-read jsr:@std/http/file-server dist/
```

Then visit `http://localhost:4507` in your browser.

## Usage Without Global Install

You can run the CLI commands directly from JSR without installing:

```bash
# Initialize a new blog
deno run -A jsr:@simonneutert/quickblog init

# Create a new post
deno run -A jsr:@simonneutert/quickblog new "My Post Title"

# Build the blog
deno run -A jsr:@simonneutert/quickblog build
```

## Writing Content

### Posts

Posts must be placed in the `posts/` directory and follow the naming convention:
`YYYY-MM-DD-slug.md`

Example: `2026-02-07-my-first-post.md`

**With TOML frontmatter** (default):

```markdown
+++
title = "My First Post"
+++

# Welcome!

This is my first blog post. You can use **Markdown** formatting.

\`\`\`javascript console.log("Code blocks with syntax highlighting!"); \`\`\`
```

**With YAML frontmatter** (use `--yaml` flag):

```markdown
---
title: "My First Post"
---

# Welcome!

You can use either YAML or TOML frontmatter!
```

### Pages

Pages are placed in the `pages/` directory and can be written in Markdown
(`.md`) or JSX (`.jsx`).

**Markdown Page** (`pages/about.md`):

```markdown
+++
title = "About"
+++

# About Me

Information about me!
```

**JSX Page** (`pages/artists.jsx`):

```jsx
export default function Artists({ posts }) {
  return (
    <div>
      <h1>Artists</h1>
      <ul>
        {posts.map(([key, date, title, url]) => (
          <li key={key}>
            <a href={url}>{title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Placeholders and Functions

There are several placeholders and functions available for use in your Markdown
content.

#### Posts List

Use the `{{ POSTS_LIST }}` placeholder in your Markdown to display a list of all
posts:

```markdown
# All Posts

{{ POSTS_LIST }}
```

Or use the `{{ POSTS_LIST(n) }}` function to show the latest `n` posts:

```markdown
# Latest Posts

{{ POSTS_LIST(3) }}
```

#### Latest Posts with Full Content

Use the `{{ LATEST_POSTS }}` placeholder to display the full content of the
latest post, or `{{ LATEST_POSTS(n) }}` to display the latest `n` posts:

```markdown
# Most Recent Post

{{ LATEST_POSTS }}

# Render 5 of the Most Recent Posts

{{ LATEST_POSTS(5) }}
```

## Directory Structure

```
my-blog/
├── posts/                          # Blog posts
│   └── 2026-02-07-my-post.md
├── pages/                          # Static pages
│   ├── about.md
│   └── artists.jsx
├── public/                         # Static assets (copied to dist/)
│   └── img/
├── index.md                        # Homepage
├── nav.md                          # Navigation (rendered on all pages)
├── footer.md                       # Footer (rendered on all pages)
```

## Configuration

### Navigation

Edit `nav.md` to customize your navigation menu:

```markdown
[Home](/) | [About](/pages/about.html) | [Posts](/pages/posts.html)
```

### Footer

Edit `footer.md` to customize your footer:

```markdown
© 2026 My Blog | [RSS](/feed.xml) | [GitHub](https://github.com/yourusername)
```

## CLI Commands

- `build` - Build your blog (default command)
- `new "Title"` - Create a new blog post
- `init` - Initialize a new blog directory
- `help` - Show help message

## Development

### Working on the Engine

```bash
# Clone the repository
git clone https://github.com/simonneutert/deno-quickblog-engine.git
cd deno-quickblog-engine

# Build with watch mode
deno task dev-watch

# Format code
deno fmt

# Run tests
deno test
```

### Testing Locally Before Publishing

To test your local changes before publishing to JSR:

```bash
# Install from your local directory with config
deno install --global -A --config deno.json -n quickblog-dev ./mod.ts

# Create a test directory
mkdir ../test-blog
cd ../test-blog

# Test the commands
quickblog-dev init
quickblog-dev new "Test Post"
quickblog-dev build

# Preview the result
deno run --allow-net --allow-read jsr:@std/http/file-server dist/

# Uninstall when done testing
deno uninstall quickblog-dev
```

Alternatively, run commands directly without installing:

```bash
# From your test directory
deno run -A --config ../deno-quickblog-engine/deno.json ../deno-quickblog-engine/mod.ts init
deno run -A --config ../deno-quickblog-engine/deno.json ../deno-quickblog-engine/mod.ts build
```

### Local Tasks

The engine includes several Deno tasks for development:

```bash
deno task build        # Build the blog
deno task new         # Create a new post
deno task dev-watch   # Build with watch mode
deno task serve       # Serve the dist/ folder locally
```

## Publishing to JSR

This package is published to JSR (JavaScript Registry) for easy installation and
usage.

```bash
# Publish to JSR (maintainers only)
deno publish
```

## License

MIT

## Contributing

Contributions are welcome! Please discuss your ideas or issues first, before
submitting a Pull Request.

## Author

Simon Neutert ([@simonneutert](https://github.com/simonneutert))
