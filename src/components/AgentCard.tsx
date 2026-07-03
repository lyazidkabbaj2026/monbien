import { Clock, ShieldCheck } from "lucide-react";
import { site } from "../../site.config";

/** Signal de confiance affiché près des formulaires. */
export function AgentCard({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`flex items-center gap-3.5 rounded-2xl border border-line bg-primary-soft ${
        compact ? "p-3.5" : "p-4"
      }`}
    >
      <span
        aria-hidden
        className="font-display flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-white"
      >
        {site.agent.name.charAt(0)}
      </span>
      <div className="min-w-0">
        <p className="text-[14.5px] leading-tight font-bold text-ink">
          {site.agent.name}
        </p>
        <p className="text-[12.5px] text-ink/60">{site.agent.role}</p>
        <p className="mt-1 flex items-center gap-1.5 text-[12.5px] font-semibold text-primary">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          {site.agent.responseTime}
        </p>
      </div>
      {!compact && (
        <ShieldCheck className="ml-auto h-6 w-6 shrink-0 text-primary/50" aria-hidden />
      )}
    </div>
  );
}
