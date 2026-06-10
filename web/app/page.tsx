"use client";

import { useChat } from "ai/react";
import { useEffect, useRef } from "react";

const GAP_COVERAGE = [
  ["Product launch planning", "Launch tasks with owner, date, risk, and blocker"],
  ["Channel execution", "Amazon, Best Buy, Walmart, and Target readiness view"],
  ["Sales / inventory tracking", "Forecast, actual sales, stock, and risk flags by SKU"],
  ["Pricing / product data QA", "MSRP, promo price, product copy, image, and spec checks"],
  ["Business reviews", "Weekly action memo with escalations and next owner"],
];

const CHANNELS = [
  {
    channel: "Amazon",
    status: "Ready",
    owner: "Sales Ops",
    risk: "Low",
    next: "Monitor launch-week sell-through",
  },
  {
    channel: "Best Buy",
    status: "At Risk",
    owner: "Channel Marketing",
    risk: "Asset gap",
    next: "Confirm lifestyle images and promo price",
  },
  {
    channel: "Walmart",
    status: "Needs QA",
    owner: "Ops",
    risk: "Inventory timing",
    next: "Verify inbound units before launch date",
  },
  {
    channel: "Target",
    status: "Blocked",
    owner: "Product",
    risk: "Spec mismatch",
    next: "Resolve product copy and UPC mismatch",
  },
];

const SKU_RISKS = [
  ["A2579", "Nano USB-C Charger", "1,240", "1,080", "3,600", "Low"],
  ["A1688", "Power Bank 10K", "920", "780", "880", "Medium"],
  ["T8210", "Smart Camera", "650", "710", "420", "High"],
  ["A3947", "Wireless Earbuds", "1,100", "990", "1,900", "Low"],
];

const SIGNALS = [
  {
    source: "Best Buy buyer note",
    text: "Lifestyle images missing; promo price needs confirmation before launch lock.",
  },
  {
    source: "Walmart ops update",
    text: "Inbound units may arrive after launch week unless shipment clears by Friday.",
  },
  {
    source: "Target product QA",
    text: "Product copy and UPC do not match the latest spec sheet.",
  },
];

const EXAMPLES = [
  {
    dir: "Launch risk",
    text:
      "Best Buy buyer said the product page is missing lifestyle images, promo price needs confirmation, and inventory may not arrive before launch week. Log this as a launch risk.",
    label: "Log Best Buy launch risk",
  },
  {
    dir: "Readiness",
    text:
      "Audit channel readiness for Amazon, Best Buy, Walmart, and Target. Show launch risks, missing data, owner, and next action.",
    label: "Audit channel readiness",
  },
  {
    dir: "Review memo",
    text:
      "Prep a weekly GTM business review memo for the launch manager. Include channel risks, SKU risks, owner, next action, and what needs escalation.",
    label: "Draft weekly GTM memo",
  },
  {
    dir: "CRM read",
    text:
      "Prep me for my next touch with Jamie Chen - pull their CRM context and associated deals, then give me a GTM action memo with the next best action and a draft outreach.",
    label: "Run original CRM demo",
  },
];

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, append, status, error, reload } =
    useChat({ api: "/api/chat" });
  const endRef = useRef<HTMLDivElement>(null);
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <main className="gtm-page" style={S.wrap}>
      <section style={S.topbar}>
        <div>
          <p style={S.kicker}>Retail GTM Launch Workflow</p>
          <h1 className="gtm-title" style={S.h1}>HubSpot + launch tracker demo for channel execution</h1>
          <p style={S.thesis}>
            HubSpot stores partner facts. The launch tracker stores product facts. The skill
            preserves GTM judgment: risk, owner, next action, and the human checkpoint before
            CRM updates.
          </p>
        </div>
        <div style={S.proofBox}>
          <div style={S.proofLabel}>Side-project target</div>
          <div style={S.proofText}>Fill the Anker GTM Specialist gap without claiming formal retail ownership.</div>
        </div>
      </section>

      <section className="gtm-grid" style={S.grid}>
        <Panel title="Gap Coverage" subtitle="What this project proves for Anker">
          <div style={S.coverageList}>
            {GAP_COVERAGE.map(([gap, proof]) => (
              <div key={gap} className="coverage-row" style={S.coverageRow}>
                <div style={S.coverageGap}>{gap}</div>
                <div style={S.coverageProof}>{proof}</div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Channel Readiness" subtitle="Retail partner launch status">
          <div className="gtm-table-wrap" style={S.tableWrap}>
            <table className="gtm-table" style={S.table}>
              <thead>
                <tr>
                  <Th>Channel</Th>
                  <Th>Status</Th>
                  <Th>Risk</Th>
                  <Th>Owner</Th>
                  <Th>Next Action</Th>
                </tr>
              </thead>
              <tbody>
                {CHANNELS.map((row) => (
                  <tr key={row.channel}>
                    <Td>{row.channel}</Td>
                    <Td>
                      <StatusBadge status={row.status} />
                    </Td>
                    <Td>{row.risk}</Td>
                    <Td>{row.owner}</Td>
                    <Td>{row.next}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>

      <section className="gtm-grid" style={S.grid}>
        <Panel title="SKU Sales / Inventory" subtitle="Mock launch data for weekly review">
          <div className="gtm-table-wrap" style={S.tableWrap}>
            <table className="gtm-table" style={S.table}>
              <thead>
                <tr>
                  <Th>SKU</Th>
                  <Th>Product</Th>
                  <Th>Forecast</Th>
                  <Th>Actual</Th>
                  <Th>Stock</Th>
                  <Th>Risk</Th>
                </tr>
              </thead>
              <tbody>
                {SKU_RISKS.map(([sku, product, forecast, actual, stock, risk]) => (
                  <tr key={sku}>
                    <Td>{sku}</Td>
                    <Td>{product}</Td>
                    <Td>{forecast}</Td>
                    <Td>{actual}</Td>
                    <Td>{stock}</Td>
                    <Td>
                      <RiskBadge risk={risk} />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Messy Partner Signals" subtitle="Raw inputs that should become GTM judgment">
          <div style={S.signalList}>
            {SIGNALS.map((signal) => (
              <div key={signal.source} style={S.signalRow}>
                <div style={S.signalSource}>{signal.source}</div>
                <div style={S.signalText}>{signal.text}</div>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section style={S.chatPanel}>
        <div className="chat-intro" style={S.chatIntro}>
          <div>
            <h2 style={S.h2}>Live Assistant</h2>
            <p style={S.panelSubtitle}>
              Use the same HubSpot MCP workflow, now framed around launch risk, channel
              readiness, and weekly GTM action memos.
            </p>
          </div>
          <div style={S.guardrail}>No deletes. Confirm before writes. No production admin claim.</div>
        </div>

        {messages.length === 0 && (
          <section style={S.examples}>
            {EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                style={S.exampleBtn}
                disabled={busy}
                onClick={() => append({ role: "user", content: ex.text })}
              >
                <span style={S.exampleDir}>{ex.dir}</span>
                <span>{ex.label}</span>
              </button>
            ))}
          </section>
        )}

        <section style={S.chat}>
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                ...S.msg,
                ...(m.role === "user" ? S.msgMe : S.msgAi),
              }}
            >
              <div style={S.who}>{m.role === "user" ? "You" : "Skill"}</div>
              <div style={S.msgBody}>{m.content}</div>
            </div>
          ))}
          {busy && (
            <div style={{ ...S.msg, ...S.msgAi }}>
              <div style={S.who}>Skill</div>
              <div style={{ ...S.msgBody, color: "var(--muted)" }}>Working...</div>
            </div>
          )}
          {error && !busy && (
            <div style={S.error}>
              <div style={S.errorTitle}>The assistant hit an error</div>
              <div style={S.errorBody}>{error.message || "Unknown error."}</div>
              <button style={S.retry} onClick={() => reload()}>
                Retry
              </button>
            </div>
          )}
          <div ref={endRef} />
        </section>

        <form onSubmit={handleSubmit} style={S.form}>
          <input
            style={S.input}
            value={input}
            onChange={handleInputChange}
            placeholder='Try: "Audit channel readiness..."'
            disabled={busy}
          />
          <button type="submit" style={S.send} disabled={busy || !input.trim()}>
            Send
          </button>
        </form>
      </section>
    </main>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section style={S.panel}>
      <div style={S.panelHead}>
        <h2 style={S.h2}>{title}</h2>
        <p style={S.panelSubtitle}>{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th style={S.th}>{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td style={S.td}>{children}</td>;
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "Ready"
      ? S.badgeGreen
      : status === "At Risk"
        ? S.badgeGold
        : status === "Blocked"
          ? S.badgeRed
          : S.badgeBlue;
  return <span className="gtm-badge" style={{ ...S.badge, ...tone }}>{status}</span>;
}

function RiskBadge({ risk }: { risk: string }) {
  const tone = risk === "Low" ? S.badgeGreen : risk === "Medium" ? S.badgeGold : S.badgeRed;
  return <span className="gtm-badge" style={{ ...S.badge, ...tone }}>{risk}</span>;
}

const S: Record<string, React.CSSProperties> = {
  wrap: {
    width: "100%",
    maxWidth: 1180,
    margin: "0 auto",
    padding: "24px 16px 60px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    minHeight: "100vh",
    overflowX: "hidden",
  },
  topbar: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 16,
    alignItems: "stretch",
    minWidth: 0,
    width: "100%",
  },
  kicker: {
    margin: "0 0 6px",
    color: "var(--green)",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  h1: {
    margin: "0 0 8px",
    fontSize: 30,
    lineHeight: 1.15,
    letterSpacing: 0,
    overflowWrap: "anywhere",
  },
  thesis: {
    maxWidth: 820,
    margin: 0,
    color: "var(--muted)",
    fontSize: 15,
  },
  proofBox: {
    border: "1px solid var(--line)",
    borderRadius: 8,
    background: "var(--paper)",
    padding: 16,
    boxShadow: "var(--shadow)",
  },
  proofLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "var(--blue)",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0,
  },
  proofText: {
    fontSize: 14,
    color: "var(--ink)",
    lineHeight: 1.45,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 16,
    minWidth: 0,
    width: "100%",
  },
  panel: {
    border: "1px solid var(--line)",
    borderRadius: 8,
    background: "var(--paper)",
    padding: 16,
    boxShadow: "var(--shadow)",
    minWidth: 0,
  },
  panelHead: { marginBottom: 12 },
  h2: {
    margin: 0,
    fontSize: 17,
    lineHeight: 1.25,
    letterSpacing: 0,
  },
  panelSubtitle: {
    margin: "4px 0 0",
    color: "var(--muted)",
    fontSize: 13,
    lineHeight: 1.45,
  },
  coverageList: { display: "grid", gap: 10 },
  coverageRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: 10,
    paddingBottom: 10,
    borderBottom: "1px solid var(--line)",
  },
  coverageGap: { fontWeight: 700, fontSize: 13 },
  coverageProof: { color: "var(--muted)", fontSize: 13, lineHeight: 1.45 },
  tableWrap: {
    width: "100%",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    minWidth: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed",
    fontSize: 13,
  },
  th: {
    textAlign: "left",
    padding: "8px 8px",
    color: "var(--muted)",
    fontWeight: 700,
    borderBottom: "1px solid var(--line)",
    whiteSpace: "normal",
    wordBreak: "break-word",
  },
  td: {
    padding: "9px 8px",
    borderBottom: "1px solid var(--line)",
    verticalAlign: "top",
    wordBreak: "break-word",
  },
  badge: {
    display: "inline-flex",
    minWidth: 64,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 999,
    padding: "2px 8px",
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  badgeGreen: { color: "var(--green)", background: "var(--green-soft)" },
  badgeGold: { color: "var(--gold)", background: "var(--gold-soft)" },
  badgeRed: { color: "var(--red)", background: "var(--red-soft)" },
  badgeBlue: { color: "var(--blue)", background: "var(--blue-soft)" },
  signalList: { display: "grid", gap: 10 },
  signalRow: {
    borderLeft: "3px solid var(--blue)",
    padding: "4px 0 4px 10px",
  },
  signalSource: {
    fontSize: 12,
    color: "var(--blue)",
    fontWeight: 700,
    marginBottom: 2,
  },
  signalText: {
    fontSize: 13,
    color: "var(--ink)",
    lineHeight: 1.45,
  },
  chatPanel: {
    border: "1px solid var(--line)",
    borderRadius: 8,
    background: "var(--paper)",
    padding: 16,
    boxShadow: "var(--shadow)",
    minWidth: 0,
    width: "100%",
  },
  chatIntro: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 16,
    alignItems: "flex-start",
    marginBottom: 14,
  },
  guardrail: {
    flexShrink: 0,
    maxWidth: 330,
    border: "1px solid var(--line)",
    borderRadius: 8,
    padding: "8px 10px",
    color: "var(--muted)",
    fontSize: 12,
    lineHeight: 1.35,
    background: "var(--soft)",
  },
  examples: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 8,
    marginBottom: 14,
  },
  exampleBtn: {
    minHeight: 76,
    textAlign: "left",
    background: "var(--soft)",
    border: "1px solid var(--line)",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    color: "var(--ink)",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  exampleDir: {
    alignSelf: "flex-start",
    fontSize: 11,
    fontWeight: 700,
    color: "var(--green)",
    background: "var(--green-soft)",
    borderRadius: 999,
    padding: "2px 8px",
  },
  chat: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    minHeight: 180,
    maxHeight: 520,
    overflowY: "auto",
  },
  msg: {
    padding: "11px 14px",
    borderRadius: 8,
    fontSize: 14,
    maxWidth: "90%",
    whiteSpace: "pre-wrap",
  },
  msgMe: {
    background: "var(--green-soft)",
    alignSelf: "flex-end",
  },
  msgAi: {
    background: "var(--blue-soft)",
    alignSelf: "flex-start",
  },
  who: {
    fontSize: 10,
    fontWeight: 700,
    color: "var(--muted)",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0,
  },
  msgBody: { lineHeight: 1.55 },
  form: { display: "flex", gap: 10, marginTop: 16 },
  input: {
    flex: 1,
    padding: "11px 13px",
    border: "1px solid var(--line)",
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "inherit",
    background: "var(--paper)",
    minWidth: 0,
  },
  send: {
    background: "var(--green)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "11px 20px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  error: {
    alignSelf: "flex-start",
    maxWidth: "90%",
    padding: "11px 14px",
    borderRadius: 8,
    border: "1px solid #f3c2c2",
    background: "var(--red-soft)",
    color: "var(--red)",
    fontSize: 13,
  },
  errorTitle: { fontWeight: 700, marginBottom: 4 },
  errorBody: { lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word" },
  retry: {
    marginTop: 8,
    background: "var(--red)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "6px 14px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },
};
