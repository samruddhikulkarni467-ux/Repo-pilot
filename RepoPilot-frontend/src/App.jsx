
import { useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Code2,
  FileCode2,
  History,
  LayoutDashboard,
  LoaderCircle,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Terminal,
  TriangleAlert,
  Upload,
  XCircle,
} from "lucide-react";

const SAMPLE_CODE = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World");
        // TODO: improve error handling
        int result = 10 / 2;
    }
}`;

const SEVERITY_ORDER = ["HIGH", "MEDIUM", "LOW"];

function getSeverity(finding) {
  return String(finding.severity || "LOW").toUpperCase();
}

function getFindingTitle(finding) {
  return finding.title || finding.ruleId || finding.rule_id || "Code issue";
}

function getFindingMessage(finding) {
  return (
    finding.message ||
    finding.description ||
    finding.details ||
    "The analyzer reported an issue in this code."
  );
}

function getFindingFix(finding) {
  return (
    finding.suggestedFix ||
    finding.suggested_fix ||
    finding.fix ||
    finding.recommendation ||
    "Review this code and apply the recommended correction."
  );
}

function normalizeFindings(data) {
  const raw =
    data?.findings ??
    data?.issues ??
    data?.results ??
    [];

  if (Array.isArray(raw)) {
    return raw.map((item, index) => {
      if (typeof item === "string") {
        return {
          id: `finding-${index}`,
          title: "Code issue",
          message: item,
          severity: "LOW",
          ruleId: "RP000",
          suggestedFix: "Review this finding and update the code.",
        };
      }

      return {
        ...item,
        id: item.id || `finding-${index}`,
        title: getFindingTitle(item),
        message: getFindingMessage(item),
        severity: getSeverity(item),
        ruleId: item.ruleId || item.rule_id || "RP000",
        suggestedFix: getFindingFix(item),
      };
    });
  }

  if (typeof raw === "string" && raw.trim()) {
    return [
      {
        id: "finding-0",
        title: "Code issue",
        message: raw,
        severity: "LOW",
        ruleId: "RP000",
        suggestedFix: "Review this finding and update the code.",
      },
    ];
  }

  return [];
}

function App() {
  const [code, setCode] = useState(SAMPLE_CODE);
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [activeTab, setActiveTab] = useState("review");
  const [search, setSearch] = useState("");
  const [historyItems, setHistoryItems] = useState([]);
  const [copied, setCopied] = useState(false);
  const [lastReviewTime, setLastReviewTime] = useState("");

  const counts = useMemo(() => {
    return {
      HIGH: findings.filter((f) => getSeverity(f) === "HIGH").length,
      MEDIUM: findings.filter((f) => getSeverity(f) === "MEDIUM").length,
      LOW: findings.filter((f) => getSeverity(f) === "LOW").length,
    };
  }, [findings]);

  const filteredFindings = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return findings;

    return findings.filter((finding) =>
      [
        finding.title,
        finding.message,
        finding.ruleId,
        finding.severity,
        finding.suggestedFix,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [findings, search]);

  async function reviewCode() {
    if (!code.trim()) {
      setError("Paste some code before starting the review.");
      return;
    }

    setLoading(true);
    setError("");
    setReviewed(false);
    setCopied(false);

    try {
      const response = await fetch(
        "http://localhost:8080/api/ai-review",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `Request failed with status ${response.status}`
        );
      }

      const normalized = normalizeFindings(data);
      const time = new Date().toLocaleString();

      setFindings(normalized);
      setReviewed(true);
      setLastReviewTime(time);

      setHistoryItems((previous) => [
        {
          id: `${Date.now()}`,
          time,
          codePreview: code.slice(0, 100),
          findingCount: normalized.length,
          findings: normalized,
        },
        ...previous,
      ]);
    } catch (err) {
      setError(
        `Could not review the code. ${err.message}. Make sure the Spring Boot backend and Python AI agent are running.`
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyResults() {
    const output = JSON.stringify(
      {
        reviewedAt: lastReviewTime,
        findingCount: findings.length,
        findings,
      },
      null,
      2
    );

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Clipboard access failed. Please copy the results manually.");
    }
  }

  function openHistory(item) {
    setFindings(item.findings);
    setLastReviewTime(item.time);
    setReviewed(true);
    setActiveTab("review");
    setError("");
  }

  function clearReview() {
    setFindings([]);
    setReviewed(false);
    setError("");
    setSearch("");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <ShieldCheck size={23} />
          </div>
          <div>
            <div className="brand-name">RepoPilot</div>
            <div className="brand-caption">AI CODE REVIEWER</div>
          </div>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === "review" ? "active" : ""}`}
            onClick={() => setActiveTab("review")}
          >
            <LayoutDashboard size={18} />
            <span>Code Review</span>
          </button>

          <button
            className={`nav-item ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            <History size={18} />
            <span>Review History</span>
            <span className="nav-count">{historyItems.length}</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="agent-card">
            <div className="agent-card-top">
              <span className="agent-status-dot" />
              <span>AGENT STATUS</span>
            </div>
            <div className="agent-status-title">Ready to review</div>
            <div className="agent-status-description">
              Your code review agent is standing by.
            </div>
          </div>

          <button
            className="nav-item secondary-nav"
            onClick={() =>
              setError(
                "Settings will be available in a future version of RepoPilot."
              )
            }
          >
            <Settings2 size={18} />
            <span>Settings</span>
          </button>

          <button
            className="nav-item secondary-nav"
            onClick={() =>
              setError(
                "Help: start both backend services, then submit code for review."
              )
            }
          >
            <CircleHelp size={18} />
            <span>Help & Support</span>
          </button>

          <div className="profile">
            <div className="profile-avatar">RP</div>
            <div className="profile-info">
              <div className="profile-name">Developer</div>
              <div className="profile-role">Personal workspace</div>
            </div>
            <ChevronDown size={16} />
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-divider">/</span>
            <strong>
              {activeTab === "history" ? "Review History" : "Code Review"}
            </strong>
          </div>

          <div className="topbar-right">
            <div className="connection-status">
              <span className="status-dot" />
              Local environment
            </div>

            <button
              className="icon-button"
              aria-label="Notifications"
              onClick={() =>
                setError("You are all caught up. No new notifications.")
              }
            >
              <Bell size={18} />
            </button>
          </div>
        </header>

        <div className="page-content">
          {activeTab === "review" ? (
            <>
              <section className="page-heading">
                <div>
                  <div className="eyebrow">
                    <Sparkles size={14} />
                    INTELLIGENT CODE ANALYSIS
                  </div>
                  <h1>Code Review</h1>
                  <p>
                    Catch issues early. Write cleaner, safer code with RepoPilot.
                  </p>
                </div>

                <button
                  className="github-button"
                  onClick={() =>
                    setError(
                      "GitHub integration is planned for the next phase. For now, paste your code below."
                    )
                  }
                >
                  <Code2 size={17} />
                  Connect GitHub
                  <ArrowUpRight size={15} />
                </button>
              </section>

              <section className="stats-grid">
                <div className="stat-card">
                  <div className="stat-top">
                    <span className="stat-label">TOTAL FINDINGS</span>
                    <div className="stat-icon purple">
                      <Activity size={18} />
                    </div>
                  </div>
                  <div className="stat-value">{findings.length}</div>
                  <div className="stat-foot">
                    {reviewed ? "From latest review" : "Run a review to begin"}
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-top">
                    <span className="stat-label">HIGH SEVERITY</span>
                    <div className="stat-icon red">
                      <XCircle size={18} />
                    </div>
                  </div>
                  <div className="stat-value">{counts.HIGH}</div>
                  <div className="stat-foot">Needs immediate attention</div>
                </div>

                <div className="stat-card">
                  <div className="stat-top">
                    <span className="stat-label">MEDIUM SEVERITY</span>
                    <div className="stat-icon orange">
                      <TriangleAlert size={18} />
                    </div>
                  </div>
                  <div className="stat-value">{counts.MEDIUM}</div>
                  <div className="stat-foot">Recommended to fix</div>
                </div>

                <div className="stat-card">
                  <div className="stat-top">
                    <span className="stat-label">LOW SEVERITY</span>
                    <div className="stat-icon green">
                      <Check size={18} />
                    </div>
                  </div>
                  <div className="stat-value">{counts.LOW}</div>
                  <div className="stat-foot">Quality improvements</div>
                </div>
              </section>

              <section className="review-layout">
                <div className="panel editor-panel">
                  <div className="panel-heading">
                    <div className="panel-title-group">
                      <div className="panel-icon">
                        <FileCode2 size={18} />
                      </div>
                      <div>
                        <h2>Source Code</h2>
                        <p>Paste code to analyze potential issues</p>
                      </div>
                    </div>

                    <span className="language-pill">
                      <span className="language-dot" />
                      Java
                    </span>
                  </div>

                  <div className="editor-toolbar">
                    <div className="editor-file">
                      <Code2 size={15} />
                      Main.java
                      <span className="unsaved-dot" />
                    </div>

                    <button
                      className="text-button"
                      onClick={() => setCode(SAMPLE_CODE)}
                    >
                      Reset sample
                    </button>
                  </div>

                  <div className="code-editor">
                    <div className="line-numbers" aria-hidden="true">
                      {code.split("\n").map((_, index) => (
                        <div key={index}>{index + 1}</div>
                      ))}
                    </div>

                    <textarea
                      value={code}
                      onChange={(event) => setCode(event.target.value)}
                      spellCheck="false"
                      aria-label="Source code editor"
                      placeholder="Paste your Java code here..."
                    />
                  </div>

                  <div className="editor-footer">
                    <span>
                      <Terminal size={14} />
                      {code.split("\n").length} lines
                    </span>
                    <span>{code.length} characters</span>
                  </div>

                  <div className="editor-actions">
                    <button
                      className="secondary-button"
                      onClick={() => {
                        const fileInput = document.getElementById("code-file");
                        fileInput?.click();
                      }}
                    >
                      <Upload size={16} />
                      Upload file
                    </button>

                    <input
                      id="code-file"
                      type="file"
                      accept=".java,.txt,.js,.jsx,.py,.ts,.tsx,.cpp,.c,.cs"
                      hidden
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;

                        try {
                          setCode(await file.text());
                          setError("");
                        } catch {
                          setError("Could not read this file.");
                        }

                        event.target.value = "";
                      }}
                    />

                    <button
                      className="primary-button"
                      onClick={reviewCode}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <LoaderCircle className="spin" size={17} />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles size={17} />
                          Review Code
                          <ArrowUpRight size={16} />
                        </>
                      )}
                    </button>
                  </div>

                  {error && (
                    <div className="error-message">
                      <TriangleAlert size={16} />
                      <span>{error}</span>
                      <button
                        aria-label="Dismiss message"
                        onClick={() => setError("")}
                      >
                        <XCircle size={15} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="panel results-panel">
                  <div className="panel-heading results-heading">
                    <div className="panel-title-group">
                      <div className="panel-icon result-icon">
                        <Activity size={18} />
                      </div>
                      <div>
                        <h2>Review Results</h2>
                        <p>
                          {reviewed
                            ? "Analysis completed"
                            : "Your findings will appear here"}
                        </p>
                      </div>
                    </div>

                    {reviewed && (
                      <button
                        className="icon-button small"
                        title="Clear results"
                        onClick={clearReview}
                      >
                        <XCircle size={16} />
                      </button>
                    )}
                  </div>

                  {reviewed ? (
                    <>
                      <div className="result-summary">
                        <div
                          className={`result-summary-icon ${
                            findings.length ? "has-issues" : "all-clear"
                          }`}
                        >
                          {findings.length ? (
                            <TriangleAlert size={22} />
                          ) : (
                            <Check size={22} />
                          )}
                        </div>

                        <div>
                          <div className="result-summary-title">
                            {findings.length
                              ? `${findings.length} finding${
                                  findings.length === 1 ? "" : "s"
                                } detected`
                              : "No issues detected"}
                          </div>
                          <div className="result-summary-subtitle">
                            {lastReviewTime}
                          </div>
                        </div>
                      </div>

                      <div className="results-filter">
                        <Search size={16} />
                        <input
                          value={search}
                          onChange={(event) => setSearch(event.target.value)}
                          placeholder="Search findings..."
                          aria-label="Search findings"
                        />
                      </div>

                      <div className="finding-list">
                        {filteredFindings.length ? (
                          filteredFindings.map((finding, index) => {
                            const severity = getSeverity(finding);
                            const severityClass = SEVERITY_ORDER.includes(
                              severity
                            )
                              ? severity.toLowerCase()
                              : "low";

                            return (
                              <article
                                className="finding-card"
                                key={finding.id || index}
                              >
                                <div className="finding-card-top">
                                  <span
                                    className={`severity-badge ${severityClass}`}
                                  >
                                    {severity}
                                  </span>
                                  <span className="rule-id">
                                    {finding.ruleId}
                                  </span>
                                </div>

                                <h3>{finding.title}</h3>
                                <p>{finding.message}</p>

                                <div className="suggested-fix">
                                  <div className="fix-heading">
                                    <Sparkles size={14} />
                                    Suggested fix
                                  </div>
                                  <p>{finding.suggestedFix}</p>
                                </div>
                              </article>
                            );
                          })
                        ) : (
                          <div className="empty-search">
                            No findings match your search.
                          </div>
                        )}
                      </div>

                      <button
                        className="copy-button"
                        onClick={copyResults}
                      >
                        {copied ? <Check size={16} /> : <Code2 size={16} />}
                        {copied ? "Copied results" : "Copy results as JSON"}
                      </button>
                    </>
                  ) : (
                    <div className="empty-results">
                      <div className="empty-illustration">
                        <div className="empty-illustration-inner">
                          <FileCode2 size={32} />
                        </div>
                        <div className="floating-sparkle">
                          <Sparkles size={17} />
                        </div>
                      </div>

                      <h3>Ready when you are</h3>
                      <p>
                        Run your first review to identify code quality issues,
                        potential bugs, and suggested improvements.
                      </p>

                      <div className="empty-feature">
                        <Check size={15} />
                        Rule-based code checks
                      </div>
                      <div className="empty-feature">
                        <Check size={15} />
                        Severity classification
                      </div>
                      <div className="empty-feature">
                        <Check size={15} />
                        Suggested fixes
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <footer className="page-footer">
                <div>
                  <span className="footer-dot" />
                  RepoPilot AI Agent
                  <span className="footer-divider">·</span>
                  Local development
                </div>
                <div>
                  <ShieldCheck size={14} />
                  Code is sent to your local backend
                </div>
              </footer>
            </>
          ) : (
            <>
              <section className="page-heading history-page-heading">
                <div>
                  <div className="eyebrow">
                    <Clock3 size={14} />
                    YOUR PAST ANALYSES
                  </div>
                  <h1>Review History</h1>
                  <p>
                    Revisit code reviews from your current session.
                  </p>
                </div>
              </section>

              <section className="panel history-panel">
                <div className="panel-heading">
                  <div className="panel-title-group">
                    <div className="panel-icon">
                      <History size={18} />
                    </div>
                    <div>
                      <h2>Recent reviews</h2>
                      <p>
                        {historyItems.length} review
                        {historyItems.length === 1 ? "" : "s"} in this session
                      </p>
                    </div>
                  </div>
                </div>

                {historyItems.length ? (
                  <div className="history-list">
                    {historyItems.map((item) => (
                      <button
                        className="history-item"
                        key={item.id}
                        onClick={() => openHistory(item)}
                      >
                        <div className="history-item-icon">
                          <FileCode2 size={20} />
                        </div>

                        <div className="history-item-main">
                          <div className="history-item-title">Main.java</div>
                          <div className="history-item-preview">
                            {item.codePreview || "Code review"}
                          </div>
                          <div className="history-item-time">{item.time}</div>
                        </div>

                        <div className="history-item-count">
                          <span>{item.findingCount}</span>
                          <small>findings</small>
                        </div>

                        <ArrowUpRight size={17} />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="history-empty">
                    <History size={30} />
                    <h3>No reviews yet</h3>
                    <p>
                      Your completed reviews will appear here during this
                      session.
                    </p>
                    <button
                      className="primary-button"
                      onClick={() => setActiveTab("review")}
                    >
                      Start a review
                      <ArrowUpRight size={16} />
                    </button>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
