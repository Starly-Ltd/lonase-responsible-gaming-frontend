import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { rgApi } from "../../api/rgApi";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../hooks/useTranslation";

export default function MyLimits() {
  const { t } = useTranslation();
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
      setError(t("my_limits_error_load_failed"));
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
          <p className="text-gray-600">{t("my_limits_loading")}</p>
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
          {t("my_limits_try_again")}
        </button>
      </div>
    );
  }

  if (!limits || !hasAnyLimits(limits)) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t("my_limits_no_limits_title")}
          </h2>
          <p className="text-gray-600 mb-6">
            {t("my_limits_no_limits_description")}
          </p>
          <Link to="/set-limits" className="btn-primary inline-block">
            {t("my_limits_set_limits_now")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-0">
          {t("my_limits_title")}
        </h1>
        <Link to="/set-limits" className="btn-primary">
          {t("my_limits_update_controls")}
        </Link>
      </div>

      {status && (
        <div className="space-y-3 mb-6">
          {status.is_in_time_out && (
            <div className="alert-warning">
              <p className="font-semibold">
                {t("my_limits_status_timeout_title")}
              </p>
              <p className="text-sm mt-1">
                {t("my_limits_status_timeout_description")}
              </p>
            </div>
          )}

          {status.is_self_excluded && (
            <div className="alert-error">
              <p className="font-semibold">
                {t("my_limits_status_self_excluded_title")}
              </p>
              <p className="text-sm mt-1">
                {t("my_limits_status_self_excluded_description")}
              </p>
            </div>
          )}

          {status.is_in_night_curfew && (
            <div className="alert-info">
              <p className="font-semibold">
                {t("my_limits_status_curfew_title")}
              </p>
              <p className="text-sm mt-1">
                {t("my_limits_status_curfew_description")}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {limits.stake_per_bet_limit.enabled && (
          <LimitCard
            title={t("my_limits_stake_per_bet_title")}
            value={formatCurrencyValue(
              limits.stake_per_bet_limit.amount,
              currency
            )}
            description={t("my_limits_stake_per_bet_description")}
          />
        )}

        {limits.deposit_limit.enabled && (
          <LimitCard
            title={t("my_limits_deposit_limit_title")}
            value={formatCurrencyValue(limits.deposit_limit.amount, currency)}
            description={t("my_limits_deposit_limit_description")}
          />
        )}

        {limits.bet_count_limit.enabled && (
          <LimitCard
            title={t("my_limits_bet_count_title")}
            value={`${limits.bet_count_limit.amount} ${t("my_limits_bets")}`}
            description={t("my_limits_bet_count_description")}
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
  const { t } = useTranslation();
  return (
    <div className="card-hover bg-yellow-50 border border-yellow-200">
      <div className="flex items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {t("my_limits_timeout_title")}
          </h3>
          <p className="text-lg font-medium text-gray-700 mt-2">
            {formatTimeOutOption(timeOut.option, t)}
          </p>
          {timeOut.active && (
            <>
              <p className="text-sm text-gray-600 mt-2">
                {t("my_limits_until")}{" "}
                {new Date(timeOut.end_at).toLocaleString()}
              </p>
              <span className="badge-warning mt-2">
                {t("my_limits_active")}
              </span>
            </>
          )}
          {!timeOut.active && timeOut.end_at && (
            <p className="text-sm text-gray-500 mt-2">
              {t("my_limits_expired")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function SelfExclusionCard({ selfExclusion }) {
  const { t } = useTranslation();
  return (
    <div className="card-hover bg-red-50 border border-red-200">
      <div className="flex items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {t("my_limits_self_exclusion_title")}
          </h3>
          <p className="text-lg font-medium text-gray-700 mt-2">
            {formatSelfExclusionOption(selfExclusion.option, t)}
          </p>
          {selfExclusion.active && (
            <>
              {selfExclusion.end_at && (
                <p className="text-sm text-gray-600 mt-2">
                  {t("my_limits_until")}{" "}
                  {new Date(selfExclusion.end_at).toLocaleString()}
                </p>
              )}
              {!selfExclusion.end_at && (
                <p className="text-sm text-gray-600 mt-2">
                  {t("my_limits_permanent")}
                </p>
              )}
              <span className="badge-danger mt-2">{t("my_limits_active")}</span>
            </>
          )}
          {!selfExclusion.active && selfExclusion.end_at && (
            <p className="text-sm text-gray-500 mt-2">
              {t("my_limits_expired_contact_support")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function SessionBreakCard({ sessionBreak }) {
  const { t } = useTranslation();
  return (
    <div className="card-hover">
      <div className="flex items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {t("my_limits_session_breaks_title")}
          </h3>
          <p className="text-sm text-gray-600 mt-2">
            <strong>
              {sessionBreak.duration} {t("my_limits_minute")}
            </strong>{" "}
            {t("my_limits_break_every")}{" "}
            <strong>
              {sessionBreak.frequency} {t("my_limits_minutes")}
            </strong>{" "}
            {t("my_limits_of_play")}
          </p>
          <span className="badge-info mt-2">{t("my_limits_enabled")}</span>
        </div>
      </div>
    </div>
  );
}

function NightCurfewCard({ curfew }) {
  const { t } = useTranslation();
  return (
    <div className="card-hover bg-gray-50 border border-gray-200">
      <div className="flex items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {t("my_limits_night_curfew_title")}
          </h3>
          <p className="text-lg font-medium text-gray-700 mt-2">
            {curfew.daily_start_time} - {curfew.daily_end_time}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {t("my_limits_daily_block_hours")}
          </p>
          {curfew.currently_in_curfew && (
            <span className="badge-warning mt-2">
              {t("my_limits_active_now")}
            </span>
          )}
          {!curfew.currently_in_curfew && (
            <span className="badge-info mt-2">{t("my_limits_enabled")}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTimeOutOption(option, t) {
  const map = {
    "24_hours": t("my_limits_format_24_hours"),
    "48_hours": t("my_limits_format_48_hours"),
    "7_days": t("my_limits_format_7_days"),
  };
  return map[option] || option;
}

function formatSelfExclusionOption(option, t) {
  const map = {
    "1_month": t("my_limits_format_1_month"),
    "3_months": t("my_limits_format_3_months"),
    "6_months": t("my_limits_format_6_months"),
    "1_year": t("my_limits_format_1_year"),
    indefinitely: t("my_limits_format_indefinitely"),
  };
  return map[option] || option;
}
