import { useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import {
  buildSchemaDocs,
  graphSkeletonExample,
  nodeExample,
} from '../schema/schemaDocs';
import type { FieldDoc, NodeDoc, SchemaDocs, SnippetFormat, ValueKindDoc } from '../schema/schemaDocs';

type Props = {
  /** Which syntax the example snippets are written in. */
  format: SnippetFormat;
  height?: number | string;
};

const styles = {
  panel: {
    border: '1px solid #333',
    borderRadius: 4,
    background: '#14141c',
    color: '#ddd',
    fontSize: 12,
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  } satisfies CSSProperties,
  search: {
    background: '#111',
    color: '#eee',
    border: '1px solid #333',
    borderRadius: 4,
    padding: '6px 8px',
    fontSize: 12,
    margin: 8,
  } satisfies CSSProperties,
  body: { overflowY: 'auto', padding: '0 8px 8px', flex: 1 } satisfies CSSProperties,
  h3: { fontSize: 13, color: '#eee', margin: '14px 0 6px', borderBottom: '1px solid #2a2a3a', paddingBottom: 4 } satisfies CSSProperties,
  muted: { color: '#999' } satisfies CSSProperties,
  // index.css styles `code` as a padded pill for prose; inside a dense
  // reference table that reads as noise, so reset it to plain inline mono.
  code: {
    fontFamily: 'monospace',
    color: '#9cf',
    display: 'inline',
    padding: 0,
    background: 'none',
    fontSize: 12,
    lineHeight: 'inherit',
  } satisfies CSSProperties,
  pre: {
    background: '#0c0c12',
    border: '1px solid #262636',
    borderRadius: 4,
    padding: 8,
    margin: '6px 0',
    fontSize: 11,
    fontFamily: 'monospace',
    overflowX: 'auto',
    whiteSpace: 'pre',
    color: '#ccc',
  } satisfies CSSProperties,
  summary: { cursor: 'pointer', padding: '4px 0', color: '#eee' } satisfies CSSProperties,
  details: { borderBottom: '1px solid #222', padding: '2px 0' } satisfies CSSProperties,
  table: { borderCollapse: 'collapse', width: '100%', margin: '4px 0' } satisfies CSSProperties,
  th: { textAlign: 'left', color: '#888', fontWeight: 'normal', padding: '2px 6px 2px 0', borderBottom: '1px solid #2a2a3a' } satisfies CSSProperties,
  td: { padding: '3px 6px 3px 0', verticalAlign: 'top', borderBottom: '1px solid #1e1e2a' } satisfies CSSProperties,
  badge: {
    display: 'inline-block',
    fontSize: 10,
    padding: '0 5px',
    borderRadius: 3,
    marginLeft: 6,
    background: '#3a2a2a',
    color: '#f99',
    verticalAlign: 'middle',
  } satisfies CSSProperties,
};

function Code({ children }: { children: ReactNode }) {
  return <code style={styles.code}>{children}</code>;
}

function FieldsTable({ fields }: { fields: FieldDoc[] }) {
  return (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>Field</th>
          <th style={styles.th}>Type</th>
          <th style={styles.th}>Notes</th>
        </tr>
      </thead>
      <tbody>
        {fields.map(f => (
          <tr key={f.name}>
            <td style={styles.td}>
              <Code>{f.name}</Code>
              {f.required && <span style={styles.muted}> *</span>}
            </td>
            <td style={{ ...styles.td, ...styles.muted }}>{f.type}</td>
            <td style={styles.td}>
              {f.description}
              {f.fields && <FieldsTable fields={f.fields} />}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function NodeEntry({ node, format, open }: { node: NodeDoc; format: SnippetFormat; open: boolean }) {
  return (
    <details style={styles.details} open={open}>
      <summary style={styles.summary}>
        <Code>{node.type}</Code>
        <span style={styles.muted}> — {node.title}</span>
        {node.deprecated && <span style={styles.badge}>deprecated</span>}
      </summary>
      {node.description && <p style={{ margin: '4px 0 6px' }}>{node.description}</p>}

      {node.params.length > 0 ? (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Param</th>
              <th style={styles.th}>Value kind</th>
              <th style={styles.th}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {node.params.map(p => (
              <tr key={p.name}>
                <td style={styles.td}>
                  <Code>{p.name}</Code>
                  {p.required && <span style={styles.muted}> *</span>}
                  {p.deprecated && <span style={styles.badge}>deprecated</span>}
                </td>
                <td style={{ ...styles.td, ...styles.muted }}>
                  {p.valueKind}
                  {p.refable && <span title="Accepts { ref: 'nodeId.port' }"> · ref ok</span>}
                </td>
                <td style={styles.td}>{p.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ ...styles.muted, margin: '4px 0' }}>No params.</p>
      )}

      {node.outputs.length > 0 && (
        <p style={{ margin: '4px 0' }}>
          <span style={styles.muted}>Outputs: </span>
          {node.outputs.map((o, i) => (
            <span key={o.name}>
              {i > 0 && ', '}
              <Code>{o.name}</Code>
              <span style={styles.muted}> ({o.valueType})</span>
            </span>
          ))}
        </p>
      )}

      <pre style={styles.pre}>{nodeExample(node, format)}</pre>
    </details>
  );
}

function ValueKindEntry({ kind, open }: { kind: ValueKindDoc; open: boolean }) {
  return (
    <details style={styles.details} open={open}>
      <summary style={styles.summary}>
        <Code>{kind.name}</Code>
        <span style={styles.muted}> — {kind.shape}</span>
        {!kind.staticAllowed && <span style={styles.badge}>ref only</span>}
      </summary>
      {kind.description && <p style={{ margin: '4px 0 6px' }}>{kind.description}</p>}
      {kind.staticAllowed && !kind.fields && (
        <p style={{ margin: '4px 0' }}>
          Written as <Code>{`{ v: ${kind.shape} }`}</Code>
        </p>
      )}
      {kind.fields && (
        <>
          <p style={{ margin: '4px 0' }}>
            Written as <Code>{'{ v: { … } }'}</Code> with fields:
          </p>
          <FieldsTable fields={kind.fields} />
        </>
      )}
    </details>
  );
}

function matchesQuery(haystack: (string | undefined)[], query: string): boolean {
  return haystack.some(s => s?.toLowerCase().includes(query));
}

/**
 * Reference documentation generated from the JSON schema: top-level graph
 * fields, every node type per section (params, outputs, an example in the
 * active editor's syntax), and the value kinds params are written in.
 */
export function SchemaDocsPanel({ format, height = 400 }: Props) {
  const docs: SchemaDocs = useMemo(() => buildSchemaDocs(), []);
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const filtering = q.length > 0;

  const sections = docs.sections
    .map(s => ({
      ...s,
      nodes: filtering
        ? s.nodes.filter(n =>
            matchesQuery([n.type, n.title, n.description, ...n.params.map(p => p.name), ...n.outputs.map(o => o.name)], q)
          )
        : s.nodes,
    }))
    .filter(s => s.nodes.length > 0);

  const valueKinds = filtering
    ? docs.valueKinds.filter(k => matchesQuery([k.name, k.description, ...(k.enumValues ?? [])], q))
    : docs.valueKinds;

  return (
    <aside aria-label="Schema documentation" style={{ ...styles.panel, height }}>
      <input
        type="search"
        aria-label="Search documentation"
        placeholder="Search node types, params, value kinds…"
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={styles.search}
      />
      <div style={styles.body}>
        {!filtering && (
          <>
            <h3 style={{ ...styles.h3, marginTop: 4 }}>{docs.title}</h3>
            {docs.description && <p style={{ margin: '0 0 6px', ...styles.muted }}>{docs.description}</p>}
            <pre style={styles.pre}>{graphSkeletonExample(format)}</pre>
            <FieldsTable fields={docs.graphFields} />
            <p style={{ ...styles.muted, margin: '4px 0' }}>
              * required. Params take either a static value <Code>{'{ v: … }'}</Code> or, where marked
              "ref ok", a reference to another node's output <Code>{"{ ref: 'nodeId.port' }"}</Code>.
            </p>
          </>
        )}

        {sections.map(s => (
          <section key={s.key}>
            <h3 style={styles.h3}>
              {s.title} <span style={{ ...styles.muted, fontWeight: 'normal' }}>({s.nodes.length})</span>
            </h3>
            {s.description && <p style={{ margin: '0 0 6px', ...styles.muted }}>{s.description}</p>}
            {s.key === 'render' && !filtering && docs.renderConfigFields.length > 0 && (
              <details style={styles.details}>
                <summary style={styles.summary}>
                  <Code>renderConfig</Code>
                  <span style={styles.muted}> — required on every render node</span>
                </summary>
                <FieldsTable fields={docs.renderConfigFields} />
              </details>
            )}
            {s.nodes.map(n => (
              <NodeEntry key={n.type} node={n} format={format} open={filtering} />
            ))}
          </section>
        ))}

        {valueKinds.length > 0 && (
          <section>
            <h3 style={styles.h3}>Value kinds</h3>
            {valueKinds.map(k => (
              <ValueKindEntry key={k.name} kind={k} open={filtering} />
            ))}
          </section>
        )}

        {filtering && sections.length === 0 && valueKinds.length === 0 && (
          <p style={styles.muted}>Nothing matches "{query}".</p>
        )}
      </div>
    </aside>
  );
}
