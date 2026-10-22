import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import { Box, Chip, Stack, TextField, Typography, CircularProgress } from '@mui/material';

import { getNetworkTopology } from 'src/repositories/area';

const COLOR = {
  UP: '#22c55e',
  DOWN: '#ef4444',
  ISOLIR: '#f59e0b',
  UNKNOWN: '#9aa8b5',
  PASSIVE: '#cbd5e1',
};
const RING = { first: 190, step: 150 };
const OPEN_DEPTH = 1; // node sampai kedalaman ini terbuka otomatis (root + POP)

function nodeColor(n) {
  if (n.kind === 'odp') {
    if (!n.total) return COLOR.PASSIVE;
    return n.isolated / n.total >= 0.5 ? COLOR.ISOLIR : COLOR.UP;
  }
  return COLOR[n.status] ?? COLOR.UNKNOWN;
}

/** Susun pohon, tentukan jumlah daun terlihat, lalu hitung koordinat radial. */
function layout(nodes, open) {
  const kids = {};
  nodes.forEach((n) => {
    kids[n.id] = [];
  });
  nodes.forEach((n) => n.parent && kids[n.parent] && kids[n.parent].push(n));
  const root = nodes.find((n) => !n.parent);
  if (!root) return { items: [], links: [], kids };

  const leaves = (n) => {
    if (!open.has(n.id) || !kids[n.id].length) return 1;
    return kids[n.id].reduce((s, c) => s + leaves(c), 0);
  };

  const items = [];
  const links = [];
  const place = (n, depth, a0, a1, parent) => {
    const ang = (a0 + a1) / 2;
    const r = depth === 0 ? 0 : RING.first + (depth - 1) * RING.step;
    const it = { n, depth, ang, x: r * Math.cos(ang), y: r * Math.sin(ang), r };
    items.push(it);
    if (parent) links.push({ from: parent, to: it });
    if (open.has(n.id) && kids[n.id].length) {
      const total = leaves(n);
      let cur = a0;
      kids[n.id].forEach((c) => {
        const span = ((a1 - a0) * leaves(c)) / total;
        place(c, depth + 1, cur, cur + span, it);
        cur += span;
      });
    }
  };
  place(root, 0, -Math.PI / 2, (3 * Math.PI) / 2, null);
  return { items, links, kids };
}

function linkPath({ from, to }) {
  // kurva halus: tarik tangen sepanjang radius
  const mr = (from.r + to.r) / 2;
  const c1 = [mr * Math.cos(from.ang), mr * Math.sin(from.ang)];
  const c2 = [mr * Math.cos(to.ang), mr * Math.sin(to.ang)];
  return `M${from.x},${from.y} C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${to.x},${to.y}`;
}

export default function NetworkTopologyMap() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(new Set());
  const [query, setQuery] = useState('');
  const [view, setView] = useState({ k: 0.8, x: 0, y: 0 });
  const wrapRef = useRef(null);
  const drag = useRef(null);
  const initialised = useRef(false);

  const load = useCallback(async () => {
    try {
      const res = await getNetworkTopology();
      setData(res);
      setError('');
      if (!initialised.current) {
        initialised.current = true;
        setOpen(new Set(res.nodes.filter((n) => n.kind === 'server' || n.kind === 'pop').map((n) => n.id)));
      }
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Gagal memuat topologi');
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  const nodes = useMemo(() => data?.nodes ?? [], [data]);
  const { items, links, kids } = useMemo(() => layout(nodes, open), [nodes, open]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return new Set();
    return new Set(nodes.filter((n) => n.label.toLowerCase().includes(q)).map((n) => n.id));
  }, [nodes, query]);

  // pencarian: buka semua induk dari node yang cocok
  useEffect(() => {
    if (!matches.size) return;
    const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
    setOpen((prev) => {
      const next = new Set(prev);
      matches.forEach((id) => {
        let p = byId[id]?.parent;
        while (p) {
          next.add(p);
          p = byId[p]?.parent;
        }
      });
      return next;
    });
  }, [matches, nodes]);

  const toggle = (n) => {
    if (!kids[n.id]?.length) return;
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(n.id)) next.delete(n.id);
      else next.add(n.id);
      return next;
    });
  };

  const onWheel = (e) => {
    const rect = wrapRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left - rect.width / 2;
    const my = e.clientY - rect.top - rect.height / 2;
    setView((v) => {
      const k = Math.min(3, Math.max(0.2, v.k * (e.deltaY < 0 ? 1.1 : 1 / 1.1)));
      const f = k / v.k;
      return { k, x: mx - (mx - v.x) * f, y: my - (my - v.y) * f };
    });
  };
  const onDown = (e) => {
    drag.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
  };
  const onMove = (e) => {
    if (!drag.current) return;
    setView((v) => ({ ...v, x: drag.current.vx + e.clientX - drag.current.x, y: drag.current.vy + e.clientY - drag.current.y }));
  };
  const onUp = () => {
    drag.current = null;
  };

  const root = nodes.find((n) => !n.parent);
  const pops = nodes.filter((n) => n.kind === 'pop');
  const summary = {
    pop: pops.length,
    olt: nodes.filter((n) => n.kind === 'olt').length,
    odp: nodes.filter((n) => n.kind === 'odp').length,
    active: root?.active ?? 0,
    isolated: root?.isolated ?? 0,
  };

  return (
    <Box sx={{ position: 'relative', height: 'calc(100vh - 200px)', minHeight: 480, bgcolor: 'background.default' }}>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        flexWrap="wrap"
        sx={{ position: 'absolute', top: 8, left: 8, right: 8, zIndex: 2 }}
      >
        <TextField
          size="small"
          placeholder="Cari POP, OLT, ODP…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ bgcolor: 'background.paper', minWidth: 260 }}
        />
        <Chip size="small" label={`${summary.pop} POP`} />
        <Chip size="small" label={`${summary.olt} OLT`} />
        <Chip size="small" label={`${summary.odp} ODP`} />
        <Chip size="small" color="success" label={`${summary.active.toLocaleString('id-ID')} pelanggan aktif`} />
        <Chip size="small" color="warning" label={`${summary.isolated.toLocaleString('id-ID')} isolir`} />
        <Chip size="small" variant="outlined" label="Reset" onClick={() => setView({ k: 0.8, x: 0, y: 0 })} />
      </Stack>

      <Stack
        direction="row"
        spacing={2}
        sx={{ position: 'absolute', bottom: 8, left: 8, zIndex: 2, bgcolor: 'background.paper', px: 1.5, py: 0.5, borderRadius: 1 }}
      >
        {[
          ['Aktif / UP', COLOR.UP],
          ['Down', COLOR.DOWN],
          ['Isolir banyak', COLOR.ISOLIR],
          ['Belum ada data', COLOR.UNKNOWN],
        ].map(([label, c]) => (
          <Stack key={label} direction="row" spacing={0.5} alignItems="center">
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: c }} />
            <Typography variant="caption">{label}</Typography>
          </Stack>
        ))}
      </Stack>

      {!data && !error && (
        <Stack alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
          <CircularProgress />
        </Stack>
      )}
      {error && (
        <Typography color="error" sx={{ p: 2, pt: 8 }}>
          {error}
        </Typography>
      )}

      {data && (
        <Box
          ref={wrapRef}
          onWheel={onWheel}
          onMouseDown={onDown}
          onMouseMove={onMove}
          onMouseUp={onUp}
          onMouseLeave={onUp}
          sx={{ width: '100%', height: '100%', cursor: drag.current ? 'grabbing' : 'grab', overflow: 'hidden' }}
        >
          <svg width="100%" height="100%" style={{ display: 'block' }}>
            <g transform={`translate(${(wrapRef.current?.clientWidth ?? 1000) / 2 + view.x},${(wrapRef.current?.clientHeight ?? 600) / 2 + view.y}) scale(${view.k})`}>
              {links.map((l) => (
                <path
                  key={l.to.n.id}
                  d={linkPath(l)}
                  fill="none"
                  stroke={l.from.depth === 0 ? '#5b8def' : '#b6c0cc'}
                  strokeWidth={l.from.depth === 0 ? 1.6 : 1}
                  opacity={0.8}
                />
              ))}
              {items.map(({ n, ang, x, y, depth }) => {
                const hasKids = (kids[n.id]?.length ?? 0) > 0;
                const flip = Math.cos(ang) < 0;
                const deg = (ang * 180) / Math.PI + (flip ? 180 : 0);
                const hit = matches.has(n.id);
                const big = n.kind === 'server' ? 14 : n.kind === 'pop' ? 8 : n.kind === 'olt' ? 7 : 5.5;
                return (
                  <g key={n.id} transform={`translate(${x},${y})`} onClick={() => toggle(n)} style={{ cursor: hasKids ? 'pointer' : 'default' }}>
                    {hit && <circle r={big + 6} fill="none" stroke="#3b82f6" strokeWidth={2} />}
                    {n.kind === 'server' ? (
                      <rect x={-14} y={-10} width={28} height={20} rx={4} fill="#1f2937" />
                    ) : (
                      <circle r={big} fill={nodeColor(n)} stroke="#fff" strokeWidth={1.5} />
                    )}
                    {hasKids && depth > 0 && !open.has(n.id) && (
                      <text textAnchor="middle" dy="0.35em" fontSize={9} fill="#fff" style={{ pointerEvents: 'none' }}>
                        +
                      </text>
                    )}
                    {depth === 0 ? (
                      <text y={28} textAnchor="middle" fontSize={12} fontWeight={700} fill="currentColor">
                        {n.label}
                      </text>
                    ) : (
                      <g transform={`rotate(${deg})`}>
                        <text
                          x={flip ? -(big + 8) : big + 8}
                          textAnchor={flip ? 'end' : 'start'}
                          dy="0.35em"
                          fontSize={n.kind === 'pop' ? 12 : 10.5}
                          fontWeight={n.kind === 'pop' || n.kind === 'olt' ? 700 : 600}
                          fill="currentColor"
                        >
                          {n.label}
                          {n.total != null && (
                            <tspan fontWeight={400} fill="#8b97a5" fontSize={9}>
                              {`  ${n.total} plg${n.isolated ? ` · ${n.isolated} iso` : ''}`}
                            </tspan>
                          )}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        </Box>
      )}
    </Box>
  );
}
