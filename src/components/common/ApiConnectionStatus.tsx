import { useEffect, useState } from "react";
import { Activity, CircleAlert, CircleCheck, RefreshCw, WifiOff } from "lucide-react";
import { checkApiHealth, type ApiConnectionSnapshot } from "../../lib/api";

const initialSnapshot: ApiConnectionSnapshot = {
  state: "checking",
  message: "Checking API status…",
  checkedAt: null,
  httpStatus: null,
};

const labels = {
  checking: "Checking API",
  healthy: "API reachable",
  degraded: "API degraded",
  unreachable: "API unavailable",
} as const;

export function ApiConnectionStatus() {
  const [snapshot, setSnapshot] = useState<ApiConnectionSnapshot>(initialSnapshot);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let active = true;
    let controller = new AbortController();

    const refresh = async () => {
      controller.abort();
      controller = new AbortController();
      try {
        const result = await checkApiHealth(controller.signal);
        if (active) setSnapshot(result);
      } catch {
        // Abort is expected when the next poll starts or the component unmounts.
      } finally {
        if (active) setRefreshing(false);
      }
    };

    void refresh();
    const interval = window.setInterval(() => void refresh(), 60_000);
    return () => {
      active = false;
      window.clearInterval(interval);
      controller.abort();
    };
  }, []);

  async function refreshNow() {
    setRefreshing(true);
    const result = await checkApiHealth();
    setSnapshot(result);
    setRefreshing(false);
  }

  const StatusIcon = snapshot.state === "healthy"
    ? CircleCheck
    : snapshot.state === "degraded"
      ? CircleAlert
      : snapshot.state === "unreachable"
        ? WifiOff
        : Activity;

  return (
    <section className={`api-connection api-connection--${snapshot.state}`} aria-label="Live API connection status" aria-live="polite">
      <span className="api-connection__icon" aria-hidden="true"><StatusIcon size={16} /></span>
      <div className="api-connection__copy">
        <strong>{labels[snapshot.state]}</strong>
        <span>{snapshot.message}</span>
      </div>
      <div className="api-connection__meta">
        {snapshot.httpStatus !== null && <span>HTTP {snapshot.httpStatus}</span>}
        {snapshot.checkedAt && <span>Checked {new Date(snapshot.checkedAt).toLocaleTimeString()}</span>}
      </div>
      <button className="api-connection__refresh" type="button" onClick={() => void refreshNow()} disabled={refreshing} aria-label="Refresh API connection status" title="Refresh API status">
        <RefreshCw size={15} className={refreshing ? "api-connection__spinning" : ""} />
      </button>
    </section>
  );
}
