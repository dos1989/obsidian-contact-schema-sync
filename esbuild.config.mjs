import esbuild from "esbuild";

const production = process.argv.includes("production");

const context = await esbuild.context({
  entryPoints: ["src/main.ts"],
  bundle: true,
  format: "cjs",
  target: "es2020",
  sourcemap: production ? false : "inline",
  minify: production,
  outfile: "main.js",
  external: ["obsidian"]
});

if (production) {
  await context.rebuild();
  await context.dispose();
} else {
  await context.watch();
}
