install-dev:
  deno install --global -A --config deno.json -n quickblog-dev ./mod.ts -f

uninstall-dev:
  deno uninstall --global quickblog-dev

test:
  deno test --allow-write --allow-read --allow-env --coverage

test-watch:
  deno test --allow-write --allow-read --allow-env --watch

serve-coverage:
  deno run --allow-net --allow-read jsr:@std/http/file-server --port 8001 coverage/html/

lint:
  deno lint && deno check && deno fmt
