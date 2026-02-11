// CSS first, then PrismJS languages for syntax highlighting
import { CSS } from "@deno/gfm";
import "prismjs/components/prism-clojure.js";
import "prismjs/components/prism-python.js";
import "prismjs/components/prism-javascript.js";
import "prismjs/components/prism-typescript.js";
import "prismjs/components/prism-ruby.js";
import "prismjs/components/prism-elixir.js";
import "prismjs/components/prism-elm.js";
import "prismjs/components/prism-erlang.js";
import "prismjs/components/prism-pug.js";
import "prismjs/components/prism-haml.js";
import "prismjs/components/prism-dot.js";
import "prismjs/components/prism-dart.js";
import "prismjs/components/prism-css.js";
import "prismjs/components/prism-css-extras.js";
import "prismjs/components/prism-bash.js";
import "prismjs/components/prism-go.js";
import "prismjs/components/prism-rust.js";
import "prismjs/components/prism-java.js";
import "prismjs/components/prism-csharp.js";
import "prismjs/components/prism-sql.js";
import "prismjs/components/prism-php-extras.js";
import "prismjs/components/prism-yaml.js";
import "prismjs/components/prism-toml.js";
import "prismjs/components/prism-xml-doc.js";
import "prismjs/components/prism-regex.js";
import "prismjs/components/prism-docker.js";
import "prismjs/components/prism-json.js";
import "prismjs/components/prism-json5.js";
import "prismjs/components/prism-jsonp.js";
import "prismjs/components/prism-jq.js";
import "prismjs/components/prism-makefile.js";
import "prismjs/components/prism-log.js";
import "prismjs/components/prism-jsx.js";

export interface HtmlTemplate {
  title: string;
  header?: string;
  nav: string;
  content: string;
  footer: string;
  scripts?: string;
}

export function htmlTemplate({
  title,
  header,
  nav,
  content,
  footer,
  scripts,
}: HtmlTemplate): string {
  const buildVersion = Date.now();
  return `<!DOCTYPE html>
<html lang="${Deno.env.get("DENO_QUICKBLOG_LANG") ?? "en"}">
  <head>
    <title>${title}</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="build-version" content="${buildVersion}">
    <script>
      // Apply saved theme immediately to prevent flicker
      (function() {
        const savedMode = localStorage.getItem('colorMode');
        if (savedMode) {
          document.documentElement.setAttribute('data-color-mode', savedMode);
        }
      })();
    </script>
    <style>
      main {
        max-width: 920px;
        margin: 2rem auto;
      }
      ${CSS}
    </style>
    ${header ?? "<!-- no additional head elements given -->"}
  </head>
  <body data-color-mode="auto" data-light-theme="light" data-dark-theme="dark" class="markdown-body">
  <script>
    // Sync body with documentElement immediately
    if (document.documentElement.hasAttribute('data-color-mode')) {
      document.body.setAttribute('data-color-mode', document.documentElement.getAttribute('data-color-mode'));
    }
  </script>
  <main>
  <nav style="text-align: right; margin-top: 20px; margin-bottom: 20px;">
    ${nav}
  </nav>
    ${content}
    <hr>
    ${footer}
    </main>
    <script>
      document.addEventListener("DOMContentLoaded", function() {
        const body = document.body;
        const darkModeToggle = document.getElementById("dark-mode-toggle");
          
        // Apply saved preference (already set in head, now sync with body)
        const savedMode = localStorage.getItem('colorMode');
        if (savedMode) {
          body.setAttribute("data-color-mode", savedMode);
        }
          
        function isDarkMode() {
          const colorMode = body.getAttribute("data-color-mode");
          if (colorMode === "dark") return true;
          if (colorMode === "light") return false;
          // auto mode - check system preference
          return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
          
        function updateToggleText() {
          darkModeToggle.textContent = isDarkMode() ? "Light Mode" : "Dark Mode";
        }
          
        darkModeToggle.addEventListener("click", function(e) {
          e.preventDefault();
          const newMode = isDarkMode() ? "light" : "dark";
          body.setAttribute("data-color-mode", newMode);
          localStorage.setItem('colorMode', newMode);
          updateToggleText();
        });
          
        updateToggleText();
      });
    </script>
    ${scripts ?? "<!-- no additional scripts given -->"}
  </body>
</html>
`;
}
