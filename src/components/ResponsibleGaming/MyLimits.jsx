import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { rgApi } from "../../api/rgApi";
import { useAuth } from "../../context/AuthContext";

export default function MyLimits() {
  const [limits, setLimits] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { currency: authCurrency, updateConfig } = useAuth();
  const currency = authCurrency ?? "";

  useEffect(() => {
    loadLimits();
  }, []);

  const loadLimits = async () => {
    try {
      const response = await rgApi.getMyLimits();
      if (response.data.success) {
        setLimits(response.data.data.limits);
        setStatus(response.data.data.status);
        if (response.data.data.currency) {
          updateConfig({ currency: response.data.data.currency });
        }
      }
    } catch (err) {
      setError("Failed to load limits. Please try again.");
      console.error("Failed to load limits:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="spinner w-12 h-12 border-4 mx-auto mb-4 text-primary-600"></div>
          <p className="text-gray-600">Loading your limits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="alert-error">
          <p>{error}</p>
        </div>
        <button onClick={loadLimits} className="btn-primary mt-4">
          Try Again
        </button>
      </div>
    );
  }

  if (!limits || !hasAnyLimits(limits)) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No Limits Set Yet
          </h2>
          <p className="text-gray-600 mb-6">
            You haven't set any responsible gaming controls yet. Set limits to
            protect yourself and stay in control.
          </p>
          <Link to="/set-limits" className="btn-primary inline-block">
            Set Your Limits Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-0">
          My Responsible Gaming Controls
        </h1>
        <Link to="/set-limits" className="btn-primary">
          Update Controls
        </Link>
      </div>

      {status && (
        <div className="space-y-3 mb-6">
          {status.is_in_time_out && (
            <div className="alert-warning">
              <p className="font-semibold">You are currently in time-out</p>
              <p className="text-sm mt-1">
                You cannot access gambling services until your time-out period
                ends.
              </p>
            </div>
          )}

          {status.is_self_excluded && (
            <div className="alert-error">
              <p className="font-semibold">You are self-excluded</p>
              <p className="text-sm mt-1">
                You cannot access gambling services. Contact support for
                assistance.
              </p>
            </div>
          )}

          {status.is_in_night_curfew && (
            <div className="alert-info">
              <p className="font-semibold">Night curfew is currently active</p>
              <p className="text-sm mt-1">
                Gambling access is blocked during your configured curfew hours.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {limits.stake_per_bet_limit.enabled && (
          <LimitCard
            title="Stake Per Bet"
            value={formatCurrencyValue(
              limits.stake_per_bet_limit.amount,
              currency
            )}
            description="Maximum amount per single bet"
          />
        )}

        {limits.deposit_limit.enabled && (
          <LimitCard
            title="Deposit Limit"
            value={formatCurrencyValue(limits.deposit_limit.amount, currency)}
            description="Maximum deposit amount"
          />
        )}

        {limits.bet_count_limit.enabled && (
          <LimitCard
            title="Bet Count"
            value={`${limits.bet_count_limit.amount} bets`}
            description="Maximum number of bets"
          />
        )}

        {limits.time_out.enabled && <TimeOutCard timeOut={limits.time_out} />}

        {limits.self_exclusion.enabled && (
          <SelfExclusionCard selfExclusion={limits.self_exclusion} />
        )}

        {limits.session_break.enabled && (
          <SessionBreakCard sessionBreak={limits.session_break} />
        )}

        {limits.night_curfew.enabled && (
          <NightCurfewCard curfew={limits.night_curfew} />
        )}
      </div>
    </div>
  );
}

function hasAnyLimits(limits) {
  return (
    limits.stake_per_bet_limit.enabled ||
    limits.deposit_limit.enabled ||
    limits.bet_count_limit.enabled ||
    limits.time_out.enabled ||
    limits.self_exclusion.enabled ||
    limits.session_break.enabled ||
    limits.night_curfew.enabled
  );
}

function LimitCard({ title, value, description }) {
  return (
    <div className="card-hover">
      <div className="flex items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-3xl font-bold text-primary-600 mt-2">{value}</p>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}

function formatCurrencyValue(amount, currency) {
  if (amount == null) return "-";
  if (!currency) {
    return `${amount}`;
  }
  return `${amount} ${currency}`;
}

function TimeOutCard({ timeOut }) {
  return (
    <div className="card-hover">
      <div className="flex items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">Time-Out</h3>
          <p className="text-lg font-medium text-gray-700 mt-2">
            {formatTimeOutOption(timeOut.option)}
          </p>
          {timeOut.active && (
            <>
              <p className="text-sm text-gray-600 mt-2">
                Until: {new Date(timeOut.end_at).toLocaleString()}
              </p>
              <span className="badge-warning mt-2">ACTIVE</span>
            </>
          )}
          {!timeOut.active && timeOut.end_at && (
            <p className="text-sm text-gray-500 mt-2">Expired</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SelfExclusionCard({ selfExclusion }) {
  return (
    <div className="card-hover">
      <div className="flex items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            Self-Exclusion
          </h3>
          <p className="text-lg font-medium text-gray-700 mt-2">
            {formatSelfExclusionOption(selfExclusion.option)}
          </p>
          {selfExclusion.active && (
            <>
              {selfExclusion.end_at && (
                <p className="text-sm text-gray-600 mt-2">
                  Until: {new Date(selfExclusion.end_at).toLocaleString()}
                </p>
              )}
              {!selfExclusion.end_at && (
                <p className="text-sm text-gray-600 mt-2">Permanent</p>
              )}
              <span className="badge-danger mt-2">ACTIVE</span>
            </>
          )}
          {!selfExclusion.active && selfExclusion.end_at && (
            <p className="text-sm text-gray-500 mt-2">
              Expired - Contact support to reactivate
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function SessionBreakCard({ sessionBreak }) {
  return (
    <div className="card-hover">
      <div className="flex items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            Session Breaks
          </h3>
          <p className="text-sm text-gray-600 mt-2">
            <strong>{sessionBreak.duration} minute</strong> break every{" "}
            <strong>{sessionBreak.frequency} minutes</strong> of play
          </p>
          <span className="badge-info mt-2">ENABLED</span>
        </div>
      </div>
    </div>
  );
}

function NightCurfewCard({ curfew }) {
  return (
    <div className="card-hover bg-gray-50 border border-gray-200">
      <div className="flex items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">Night Curfew</h3>
          <p className="text-lg font-medium text-gray-700 mt-2">
            {curfew.daily_start_time} - {curfew.daily_end_time}
          </p>
          <p className="text-sm text-gray-600 mt-1">Daily block hours</p>
          {curfew.currently_in_curfew && (
            <span className="badge-warning mt-2">ACTIVE NOW</span>
          )}
          {!curfew.currently_in_curfew && (
            <span className="badge-info mt-2">ENABLED</span>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTimeOutOption(option) {
  const map = {
    "24_hours": "24 Hours",
    "48_hours": "48 Hours",
    "7_days": "7 Days",
  };
  return map[option] || option;
}

function formatSelfExclusionOption(option) {
  const map = {
    "1_month": "1 Month",
    "3_months": "3 Months",
    "6_months": "6 Months",
    "1_year": "1 Year",
    indefinitely: "Indefinitely (Permanent)",
  };
  return map[option] || option;
}
