// Recovers the game sources from the original single-file build.
//
// The build is one esbuild IIFE that inlines three.js (+ addons), Rapier and the game.
// Library code is identified by structural fingerprints against freshly bundled
// reference copies of the exact same library versions; every library binding the
// game references becomes a real ES import, the rest is emitted as game source.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';
import { parse } from '@babel/parser';
import traverseMod from '@babel/traverse';
import { VISITOR_KEYS } from '@babel/types';

const traverse = traverseMod.default ?? traverseMod;
const SHORT_FP = 240; // fingerprints this short can match library code by shape alone
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const INPUT = path.join(ROOT, 'reference/original-build.html');
const OUT_DIR = path.join(ROOT, 'src/legacy');
const REPORT = path.join(ROOT, 'tools/debundle/report.json');

// ---------------------------------------------------------------- fingerprints

let DECLARED = new Set();

/** Every name bound anywhere in the file; identifiers outside it are globals and kept verbatim. */
function collectDeclared(ast) {
  const set = new Set();
  const walk = (n) => {
    if (n == null || typeof n !== 'object') return;
    if (Array.isArray(n)) { n.forEach(walk); return; }
    if (typeof n.type !== 'string') return;
    if (n.type === 'VariableDeclarator') collectPattern(n.id, set);
    if ((/Function/.test(n.type) || /Class(Declaration|Expression)/.test(n.type)) && n.id) set.add(n.id.name);
    if (/Function/.test(n.type)) n.params.forEach((p) => collectPattern(p, set));
    if (n.type === 'CatchClause' && n.param) collectPattern(n.param, set);
    if (/Import(Default|Namespace)?Specifier/.test(n.type)) set.add(n.local.name);
    for (const k of VISITOR_KEYS[n.type] ?? []) walk(n[k]);
  };
  walk(ast.program);
  return set;
}

function fingerprint(node) {
  const out = [];
  const walk = (n, key, parent) => {
    if (n == null) { out.push('_'); return; }
    if (Array.isArray(n)) { out.push('['); for (const c of n) walk(c, key, parent); out.push(']'); return; }
    switch (n.type) {
      case 'Identifier': {
        const member = (parent?.type === 'MemberExpression' || parent?.type === 'OptionalMemberExpression') && key === 'property' && !parent.computed;
        const propKey = /^(ObjectProperty|ObjectMethod|ClassMethod|ClassProperty|ClassAccessorProperty)$/.test(parent?.type ?? '') && key === 'key' && !parent.computed;
        out.push(member ? '.' + n.name : propKey ? '#' + n.name : DECLARED.has(n.name) ? '$' : 'G:' + n.name);
        return;
      }
      case 'NumericLiteral': out.push('N' + n.value); return;
      case 'StringLiteral': out.push('S' + (n.value.length > 256 ? 'LONG' + n.value.length : JSON.stringify(n.value))); return;
      case 'BooleanLiteral': out.push(n.value ? 'B1' : 'B0'); return;
      case 'TemplateElement': out.push('T' + JSON.stringify(n.value.cooked ?? n.value.raw)); return;
      case 'RegExpLiteral': out.push('R' + n.pattern + '/' + n.flags); return;
      default: break;
    }
    out.push(n.type + (n.operator ?? '') + (n.kind ? ':' + n.kind : '') + (n.static ? ':s' : '') + '(');
    for (const k of VISITOR_KEYS[n.type] ?? []) {
      if (k === 'typeAnnotation' || k === 'decorators') continue;
      walk(n[k], k, n);
    }
    out.push(')');
  };
  walk(node, null, null);
  return out.join(' ');
}

// Order-free bag of the tokens that survive minification (property names, literals).
function bag(fp) {
  return fp.split(' ').filter((t) => /^[.#NSTR]/.test(t) && t.length > 1).sort().join(' ');
}

/** Top-level "units": one per declarator / function / class / other statement. */
function unitsOf(statements) {
  const units = [];
  statements.forEach((st, si) => {
    if (st.type === 'VariableDeclaration') {
      st.declarations.forEach((d, di) => {
        units.push({ si, di, name: d.id.type === 'Identifier' ? d.id.name : null, node: d.init ?? d.id, fp: d.init ? fingerprint(d.init) : 'undef', undef: !d.init });
      });
    } else if (st.type === 'FunctionDeclaration') {
      units.push({ si, di: -1, name: st.id.name, node: st, fp: fingerprint({ ...st, id: null }) });
    } else if (st.type === 'ClassDeclaration') {
      units.push({ si, di: -1, name: st.id.name, node: st, fp: fingerprint({ ...st, id: null, type: 'ClassExpression' }) });
    } else if (st.type === 'ExportNamedDeclaration' || st.type === 'ImportDeclaration') {
      // reference-bundle plumbing only
    } else {
      units.push({ si, di: -1, name: null, node: st, fp: fingerprint(st) });
    }
  });
  for (const u of units) u.bag = bag(u.fp);
  return units;
}

// ------------------------------------------------------------ reference bundles

function listAddons() {
  const base = path.join(ROOT, 'node_modules/three/examples/jsm');
  const dirs = ['postprocessing', 'shaders', 'utils', 'geometries', 'math', 'objects', 'environments', 'lines', 'curves', 'modifiers', 'misc', 'lights', 'textures', 'csm', 'helpers', 'controls'];
  const files = [];
  for (const d of dirs) {
    const dir = path.join(base, d);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.js')) continue;
      const src = fs.readFileSync(path.join(dir, f), 'utf8');
      if (/from ['"]three\/(webgpu|tsl)['"]|\/nodes\/|from ['"]\.\.\/libs\//.test(src)) continue;
      files.push(`three/examples/jsm/${d}/${f}`);
    }
  }
  return files;
}

async function buildReference(modules) {
  const entry = modules.map((m, i) => `export * as __ns${i} from ${JSON.stringify(m)};`).join('\n');
  const res = await esbuild.build({
    stdin: { contents: entry, resolveDir: ROOT, loader: 'js' },
    bundle: true, write: false, format: 'esm', target: 'esnext', platform: 'browser',
    minifySyntax: true, minifyWhitespace: false, minifyIdentifiers: false, treeShaking: true, logLevel: 'silent',
  });
  const code = res.outputFiles[0].text;
  const ast = parse(code, { sourceType: 'module' });
  DECLARED = collectDeclared(ast);
  const units = unitsOf(ast.program.body);
  // __export(ns_exports, { Name: () => local }) and the final export list give local -> {module, name}
  const nsToModule = new Map();
  const exportsOf = new Map();
  for (const st of ast.program.body) {
    if (st.type === 'ExportNamedDeclaration' && !st.source) {
      for (const sp of st.specifiers) nsToModule.set(sp.local.name, modules[Number(sp.exported.name.slice(4))]);
    }
    if (st.type === 'ExpressionStatement' && st.expression.type === 'CallExpression' && st.expression.callee.name === '__export') {
      const [ns, obj] = st.expression.arguments;
      exportsOf.set(ns.name, obj.properties.map((p) => ({ exported: p.key.name ?? p.key.value, local: p.value.body.name })));
    }
  }
  const localToExport = new Map();
  for (const [ns, list] of exportsOf) {
    const mod = nsToModule.get(ns);
    if (!mod) continue;
    for (const { exported, local } of list) {
      const importPath = mod.replace(/^three\/examples\/jsm\//, 'three/addons/');
      if (!localToExport.has(local) || mod === 'three') localToExport.set(local, { module: importPath, name: exported });
    }
  }
  return { units, localToExport };
}

// ------------------------------------------------------------------- matching

function indexUnits(units) {
  const byFp = new Map(), byBag = new Map();
  units.forEach((u, i) => {
    u.index = i;
    (byFp.get(u.fp) ?? byFp.set(u.fp, []).get(u.fp)).push(u);
    if (u.bag.length > 40) (byBag.get(u.bag) ?? byBag.set(u.bag, []).get(u.bag)).push(u);
  });
  return { byFp, byBag };
}

function pick(cands, prevIndex) {
  if (cands.length === 1) return cands[0];
  let best = null, bestD = Infinity;
  for (const c of cands) {
    const d = c.index > prevIndex ? c.index - prevIndex : 1e6 + (prevIndex - c.index);
    if (d < bestD) { bestD = d; best = c; }
  }
  return best;
}

function isRapierNamespace(node) {
  return node?.type === 'CallExpression' && node.callee.type === 'MemberExpression' && node.callee.property.name === 'freeze'
    && node.arguments[0]?.type === 'ObjectExpression'
    && node.arguments[0].properties.some((p) => p.key && (p.key.name === 'RigidBodyDesc'));
}

/** Free identifier references of a unit, in walk order (locals declared inside are skipped). */
function identsOf(node) {
  const declared = new Set();
  const refs = [];
  const walk = (n, key, parent) => {
    if (n == null) return;
    if (Array.isArray(n)) { for (const c of n) walk(c, key, parent); return; }
    if (typeof n.type !== 'string') return;
    if (n.type === 'Identifier') {
      const member = (parent?.type === 'MemberExpression' || parent?.type === 'OptionalMemberExpression') && key === 'property' && !parent.computed;
      const propKey = /^(ObjectProperty|ObjectMethod|ClassMethod|ClassProperty|ClassAccessorProperty)$/.test(parent?.type ?? '') && key === 'key' && !parent.computed;
      if (!member && !propKey) refs.push(n.name);
      return;
    }
    if (/Function|ClassDeclaration|ClassExpression/.test(n.type) && n !== node && n.id) declared.add(n.id.name);
    if (/Function/.test(n.type)) for (const p of n.params) collectPattern(p, declared);
    if (n.type === 'VariableDeclarator') collectPattern(n.id, declared);
    if (n.type === 'CatchClause' && n.param) collectPattern(n.param, declared);
    for (const k of VISITOR_KEYS[n.type] ?? []) {
      if ((n === node && k === 'id') || k === 'typeAnnotation') continue;
      walk(n[k], k, n);
    }
  };
  walk(node, null, null);
  return refs.map((name) => (declared.has(name) ? null : name));
}

function collectPattern(p, set) {
  if (!p) return;
  if (p.type === 'Identifier') set.add(p.name);
  else if (p.type === 'AssignmentPattern') collectPattern(p.left, set);
  else if (p.type === 'RestElement') collectPattern(p.argument, set);
  else if (p.type === 'ArrayPattern') p.elements.forEach((e) => collectPattern(e, set));
  else if (p.type === 'ObjectPattern') p.properties.forEach((e) => collectPattern(e.type === 'RestElement' ? e.argument : e.value, set));
}

// ----------------------------------------------------------------------- main

async function main() {
  const html = fs.readFileSync(INPUT, 'utf8');
  const js = html.match(/<script>([\s\S]*)<\/script>/)[1];
  const ast = parse(js, { sourceType: 'script' });
  const iife = ast.program.body[0].expression.callee;
  const statements = iife.body.body;
  const three = await buildReference(['three', ...listAddons()]);
  const rapier = await buildReference(['@dimforge/rapier3d-compat']);
  DECLARED = collectDeclared(ast);
  const game = unitsOf(statements);
  const refs = [
    { lib: 'three', ...three, ...indexUnits(three.units) },
    { lib: 'rapier', ...rapier, ...indexUnits(rapier.units) },
  ];

  let prev = { three: -1, rapier: -1 };
  const stats = { exact: 0, bag: 0, special: 0, game: 0 };
  const byName = new Map();
  for (const u of game) if (u.name) byName.set(u.name, u);
  // Candidates must agree with the mapping of every identifier already resolved.
  const consistent = (u, cand) => {
    const gi = identsOf(u.node), ri = identsOf(cand.node);
    if (gi.length !== ri.length) return false;
    for (let k = 0; k < gi.length; k++) {
      const g = gi[k] && byName.get(gi[k]);
      if (g?.ref && ri[k] !== g.ref.name) return false;
    }
    return true;
  };
  for (const u of game) {
    if (isRapierNamespace(u.node)) { u.lib = 'rapier'; u.special = 'namespace'; stats.special++; continue; }
    if (u.undef) { stats.game++; continue; }
    for (const r of refs) {
      let cands = r.byFp.get(u.fp);
      let how = 'exact';
      if (!cands && u.bag.length > 40) { cands = r.byBag.get(u.bag); how = 'bag'; }
      if (!cands) continue;
      if (cands.length > 1) {
        const ok = cands.filter((c) => consistent(u, c));
        if (ok.length) cands = ok;
      }
      const m = pick(cands, prev[r.lib]);
      prev[r.lib] = m.index;
      u.lib = r.lib; u.ref = m; u.how = how; stats[how]++;
      break;
    }
    if (!u.lib) stats.game++;
  }
  let fnScope = null;
  traverse(ast, {
    ArrowFunctionExpression(p) { if (p.node === iife) { fnScope = p.scope; p.stop(); } },
  });
  const topIndexOf = (p) => {
    let cur = p;
    while (cur && cur.parentPath && cur.parentPath.node !== iife.body) cur = cur.parentPath;
    return cur ? statements.indexOf(cur.node) : -1;
  };
  const unitsBySi = new Map();
  for (const g of game) (unitsBySi.get(g.si) ?? unitsBySi.set(g.si, []).get(g.si)).push(g);
  const unitAt = (si, pos) => {
    const list = unitsBySi.get(si) ?? [];
    return list.find((g) => g.di === -1 || (pos >= g.node.start && pos <= g.node.end)) ?? list[0];
  };
  const referrers = (name) => {
    const b = fnScope.bindings[name];
    if (!b) return [];
    return [...b.referencePaths, ...b.constantViolations].map((r) => unitAt(topIndexOf(r), r.node.start)).filter(Boolean);
  };
  // `var a, b, c;` without initialisers: library iff only library code touches them.
  for (const u of game) {
    if (!u.undef) continue;
    const rs = referrers(u.name).filter((r) => r !== u);
    const libs = rs.filter((r) => r.lib || (!r.name && r.di === -1));
    if (rs.length && rs.every((r) => r.lib || (r.si !== u.si && !r.name))) { u.lib = rs.find((r) => r.lib)?.lib ?? 'rapier'; u.special = 'undef'; stats.game--; stats.special++; }
    void libs;
  }
  // Unmatched top-level statements that touch only library bindings (e.g. the base64
  // table setup inside Rapier's glue, merged differently by the original bundler).
  for (const u of game) {
    if (u.lib || u.name || u.di !== -1) continue;
    const ids = identsOf(u.node).filter(Boolean).map((n) => byName.get(n)).filter(Boolean);
    if (ids.length && ids.every((g) => g.lib)) { u.lib = ids[0].lib; u.special = 'libstmt'; stats.game--; stats.special++; }
  }

  const topScopeNames = new Map(); // name -> unit
  for (const u of game) if (u.name) topScopeNames.set(u.name, u);
  const exportOf = (u) => refs.find((r) => r.lib === u.lib)?.localToExport.get(u.ref?.name);

  // Consistency: a library match must reference the same library bindings as its reference
  // counterpart. Tiny generic units (`new Vector3()`, `60`) match library temporaries by
  // shape only; they are demoted to game code here.
  const demoted = [];
  const demote = (u, why) => { u.lib = null; u.ref = null; demoted.push({ name: u.name, why }); };
  for (let changed = true; changed;) {
    changed = false;
    for (const u of game) {
      if (!u.lib || u.special || u.fp.length > SHORT_FP) continue;
      if (!u.ref) continue;
      const gi = identsOf(u.node), ri = identsOf(u.ref.node);
      for (let k = 0; k < gi.length; k++) {
        const g = gi[k] && topScopeNames.get(gi[k]);
        if (!g) continue;
        if (!g.lib) { demote(u, 'refs game ' + g.name); changed = true; break; }
        if (g.ref && ri[k] !== g.ref.name && !g.special) { demote(u, `ident ${gi[k]}->${g.ref.name} vs ${ri[k]}`); changed = true; break; }
      }
    }
  }

  // Statement classification.
  const stmtLib = statements.map(() => new Set());
  for (const u of game) stmtLib[u.si].add(u.lib ?? 'game');

  // Which library bindings does game code reference?
  const used = new Map(); // minified name -> unit
  const leaks = [];
  // Game code can only reach library exports; a "library" binding it uses that is not an
  // export is a misclassified game declaration.
  for (let changed = true; changed;) {
    changed = false;
    used.clear(); leaks.length = 0;
    for (const [name, binding] of Object.entries(fnScope.bindings)) {
      const u = topScopeNames.get(name);
      if (!u) continue;
      const writes = new Set(binding.constantViolations);
      for (const ref of [...binding.referencePaths, ...binding.constantViolations]) {
        const refUnit = unitAt(topIndexOf(ref), ref.node.start);
        const refIsGame = refUnit ? !refUnit.lib : true;
        if (u.lib && refIsGame) {
          // imports are immutable: anything the game writes to is its own variable
          if (writes.has(ref) && !u.special) { demote(u, 'written by game'); changed = true; break; }
          if (!u.special && !exportOf(u)) { demote(u, 'non-export used by game'); changed = true; break; }
          used.set(name, u);
        }
        if (!u.lib && refUnit?.lib) {
          if (refUnit.fp.length <= SHORT_FP) { demote(refUnit, 'lib refs game ' + name); changed = true; break; }
          leaks.push({ name, from: refUnit.name, lib: refUnit.lib });
        }
      }
    }
  }
  stmtLib.forEach((s) => s.clear());
  for (const u of game) stmtLib[u.si].add(u.lib ?? 'game');

  // Lone unmatched units inside library runs: printed for manual review.
  const suspicious = [];
  for (let i = 1; i < game.length - 1; i++) {
    const u = game[i];
    if (!u.lib && game[i - 1].lib && game[i + 1].lib) suspicious.push({ i, name: u.name, code: js.slice(u.node.start, Math.min(u.node.end, u.node.start + 160)) });
  }

  // Resolve import names.
  const imports = new Map(); // module -> [{name, local}]
  const unresolved = [];
  for (const [local, u] of used) {
    if (u.special === 'namespace') { imports.set('@dimforge/rapier3d-compat', [...(imports.get('@dimforge/rapier3d-compat') ?? []), { ns: true, local }]); continue; }
    const ref = refs.find((r) => r.lib === u.lib);
    const exp = ref.localToExport.get(u.ref.name);
    if (!exp) { unresolved.push({ local, refName: u.ref.name, lib: u.lib, how: u.how }); continue; }
    const mod = u.lib === 'rapier' ? '@dimforge/rapier3d-compat' : exp.module;
    (imports.get(mod) ?? imports.set(mod, []).get(mod)).push({ name: exp.name, local });
  }

  // Emit game statements (only game declarators of mixed statements).
  const parts = [];
  statements.forEach((st, si) => {
    const libs = stmtLib[si];
    if (!libs.has('game')) return;
    if (st.type === 'VariableDeclaration' && libs.size > 1) {
      const decls = st.declarations.filter((d, di) => !game.find((u) => u.si === si && u.di === di)?.lib);
      parts.push(`${st.kind} ${decls.map((d) => js.slice(d.start, d.end)).join(', ')};`);
    } else {
      parts.push(js.slice(st.start, st.end) + (/[;}]$/.test(js.slice(st.start, st.end)) ? '' : ';'));
    }
  });

  const header = [
    '// @ts-nocheck',
    '// Game code recovered from reference/original-build.html by tools/debundle.',
    '// Library bindings are real imports now; minified local names are legacy and get renamed as code is reworked.',
  ];
  const importLines = [...imports.entries()].sort(([a], [b]) => (a === 'three' ? -1 : b === 'three' ? 1 : a.localeCompare(b))).map(([mod, list]) => {
    const ns = list.find((x) => x.ns);
    if (ns) return `import * as ${ns.local} from ${JSON.stringify(mod)};`;
    const specs = list.sort((a, b) => a.name.localeCompare(b.name)).map((x) => (x.name === x.local ? x.name : `${x.name} as ${x.local}`));
    return `import { ${specs.join(', ')} } from ${JSON.stringify(mod)};`;
  });
  const raw = [...header, ...importLines, '', ...parts].join('\n');
  const pretty = (await esbuild.transform(raw, { format: 'esm', target: 'esnext', charset: 'utf8', legalComments: 'inline' })).code;
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, 'game.js'), '// @ts-nocheck\n' + pretty);

  const report = {
    stats, statements: statements.length,
    gameStatements: parts.length,
    imports: Object.fromEntries([...imports].map(([m, l]) => [m, l.map((x) => (x.ns ? '* as ' + x.local : `${x.name} as ${x.local}`))])),
    unresolved, leaks: leaks.slice(0, 50), suspicious: suspicious.slice(0, 80), demoted,
  };
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ stats, gameStatements: parts.length, importModules: imports.size, used: used.size, unresolved: unresolved.length, leaks: leaks.length, suspicious: suspicious.length }, null, 1));
}

main().catch((e) => { console.error(e); process.exit(1); });
