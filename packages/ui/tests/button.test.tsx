import test from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { Button, GeckoMascot } from "../src/index.js";

void test("Button composes its shadcn styles onto an accessible child action", (): void => {
  const markup = renderToStaticMarkup(
    <Button asChild variant="outline">
      <a href="/health">Health</a>
    </Button>
  );

  assert.match(markup, /^<a /);
  assert.match(markup, /border-input/);
  assert.match(markup, /href="\/health"/);
});

void test("GeckoMascot exposes presentation state without an accessibility duplicate", (): void => {
  const markup = renderToStaticMarkup(<GeckoMascot state="thinking" className="size-10" />);

  assert.match(markup, /aria-hidden="true"/);
  assert.match(markup, /gecko-mascot--thinking/);
});
