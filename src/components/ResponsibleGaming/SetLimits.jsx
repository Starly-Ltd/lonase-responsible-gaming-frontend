import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { rgApi } from "../../api/rgApi";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../hooks/useTranslation";

export default function SetLimits() {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [currentLimits, setCurrentLimits] = useState(null);
  const [editable, setEditable] = useState(null);
  const [loadingLimits, setLoadingLimits] = useState(true);
  const { currency: authCurrency, updateConfig } = useAuth();
  const currency = authCurrency ?? "";

  useEffect(() => {
    loadCurrentLimits();
  }, []);

  const loadCurrentLimits = async () => {
    try {
      const response = await rgApi.getMyLimits();
      if (response.data.success && response.data.data.limits) {
        setCurrentLimits(response.data.data.limits);
        setEditable(response.data.data.editable);
        if (response.data.data.currency) {
          updateConfig({ currency: response.data.data.currency });
        }
      }
    } catch (err) {
      console.error("Failed to load limits:", err);
    } finally {
      setLoadingLimits(false);
    }
  };

  const stakeEnabled = watch("stake_per_bet_limit_enabled");
  const depositEnabled = watch("deposit_limit_enabled");
  const betCountEnabled = watch("bet_count_limit_enabled");
  const timeOutEnabled = watch("time_out_limit_enabled");
  const selfExclusionEnabled = watch("self_exclusion_limit_enabled");
  const sessionBreakEnabled = watch("session_break_enabled");
  const nightCurfewEnabled = watch("night_curfew_enabled");

  const existingSelfExclusionActive =
    currentLimits?.self_exclusion?.enabled &&
    (currentLimits?.self_exclusion?.option === "indefinitely" ||
      currentLimits?.self_exclusion?.active);

  const timeOutDisabled = selfExclusionEnabled || existingSelfExclusionActive;
  const timeOutDisabledMessage = existingSelfExclusionActive
    ? t("set_limits_timeout_self_exclusion_message_active")
    : selfExclusionEnabled
    ? t("set_limits_timeout_self_exclusion_message_selected")
    : null;
  const selfExclusionDisabled =
    timeOutEnabled ||
    (currentLimits?.self_exclusion?.enabled &&
      (currentLimits?.self_exclusion?.option === "indefinitely" ||
        currentLimits?.self_exclusion?.active));

  const handleExclusiveToggle = (control, checked) => {
    if (control === "time_out") {
      if (
        checked &&
        (currentLimits?.self_exclusion?.enabled ||
          watch("self_exclusion_limit_enabled"))
      ) {
        alert(t("set_limits_alert_timeout_replace"));
      }
      setValue("self_exclusion_limit_enabled", false, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue("self_exclusion_limit_option", null, {
        shouldValidate: false,
        shouldDirty: true,
      });
    }

    if (control === "self_exclusion") {
      if (
        checked &&
        (currentLimits?.time_out?.enabled || watch("time_out_limit_enabled"))
      ) {
        alert(t("set_limits_alert_self_exclusion_replace"));
      }
      setValue("time_out_limit_enabled", false, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue("time_out_limit_option", null, {
        shouldValidate: false,
        shouldDirty: true,
      });
    }

    setValue(
      control === "time_out"
        ? "time_out_limit_enabled"
        : "self_exclusion_limit_enabled",
      checked,
      { shouldValidate: true, shouldDirty: true }
    );
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    setSuccess("");

    const payload = {};

    if (!isLocked("stake_per_bet_limit")) {
      payload.stake_per_bet_limit_enabled = !!data.stake_per_bet_limit_enabled;
      if (payload.stake_per_bet_limit_enabled) {
        payload.stake_per_bet_limit_amount = parseFloat(
          data.stake_per_bet_limit_amount
        );
      }
    }

    if (!isLocked("deposit_limit")) {
      payload.deposit_limit_enabled = !!data.deposit_limit_enabled;
      if (payload.deposit_limit_enabled) {
        payload.deposit_limit_amount = parseFloat(data.deposit_limit_amount);
      }
    }

    if (!isLocked("bet_count_limit")) {
      payload.bet_count_limit_enabled = !!data.bet_count_limit_enabled;
      if (payload.bet_count_limit_enabled) {
        payload.bet_count_limit_amount = parseInt(data.bet_count_limit_amount);
      }
    }

    if (!isLocked("time_out_limit")) {
      payload.time_out_limit_enabled = !!data.time_out_limit_enabled;
      if (payload.time_out_limit_enabled) {
        payload.time_out_limit_option = data.time_out_limit_option;
      }
    }

    if (!isLocked("self_exclusion_limit")) {
      payload.self_exclusion_limit_enabled =
        !!data.self_exclusion_limit_enabled;
      if (payload.self_exclusion_limit_enabled) {
        payload.self_exclusion_limit_option = data.self_exclusion_limit_option;
      }
    }

    if (!isLocked("session_break")) {
      payload.session_break_enabled = !!data.session_break_enabled;
      if (payload.session_break_enabled) {
        payload.session_break_duration = parseInt(data.session_break_duration);
        payload.session_break_frequency = parseInt(
          data.session_break_frequency
        );
      }
    }

    if (!isLocked("night_curfew")) {
      payload.night_curfew_enabled = !!data.night_curfew_enabled;
      if (payload.night_curfew_enabled) {
        payload.night_curfew_daily_start_time =
          data.night_curfew_daily_start_time;
        payload.night_curfew_daily_end_time = data.night_curfew_daily_end_time;
      }
    }

    try {
      const response = await rgApi.setLimits(payload);
      if (response.data.success) {
        setSuccess(response.data.message);
        if (response.data.data?.currency) {
          updateConfig({ currency: response.data.data.currency });
        }
        loadCurrentLimits();

        if (response.data.data.controls_set) {
          const controlsList = response.data.data.controls_set.join("\n");
          alert(
            `${t("set_limits_alert_controls_set")}\n\n${controlsList}\n\n${t(
              "set_limits_alert_controls_locked"
            )}`
          );
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).join(
          "\n"
        );
        setError(errorMessages);
      } else {
        setError(err.response?.data?.message || t("set_limits_error_failed"));
      }
      console.error("Set limits error:", err);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  const isLocked = (controlName) => {
    if (!editable) return false;
    return editable[controlName] === false;
  };

  if (loadingLimits) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="spinner w-12 h-12 border-4 mx-auto mb-4 text-primary-600"></div>
          <p className="text-gray-600">{t("set_limits_loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        {t("set_limits_title")}
      </h1>
      <p className="text-sm text-gray-600 mb-6">
        <strong>{t("set_limits_important")}</strong>{" "}
        {t("set_limits_important_note")}
      </p>

      {success && (
        <div className="alert-success mb-6">
          <p>{success}</p>
        </div>
      )}

      {error && (
        <div className="alert-error mb-6">
          <p className="whitespace-pre-line">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <ControlCard
          title={t("set_limits_stake_per_bet_title")}
          description={t("set_limits_stake_per_bet_desc")}
          isLocked={isLocked("stake_per_bet_limit")}
          currentValue={currentLimits?.stake_per_bet_limit}
          lockMessage={t("set_limits_stake_per_bet_locked")}
          currency={currency}
          amountUnit="currency"
          t={t}
        >
          {!isLocked("stake_per_bet_limit") && (
            <>
              <div className="flex items-start mb-4">
                <input
                  type="checkbox"
                  {...register("stake_per_bet_limit_enabled")}
                  className="checkbox mt-1"
                  id="stake_enabled"
                />
                <label
                  htmlFor="stake_enabled"
                  className="ml-3 text-base font-medium cursor-pointer"
                >
                  {t("set_limits_stake_per_bet_enable")}
                </label>
              </div>

              {stakeEnabled && (
                <div className="pl-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("set_limits_stake_per_bet_max")}
                  </label>
                  <input
                    type="number"
                    {...register("stake_per_bet_limit_amount", {
                      required:
                        stakeEnabled &&
                        t("set_limits_validation_amount_required"),
                      min: {
                        value: 1,
                        message: t("set_limits_validation_min_1"),
                      },
                    })}
                    placeholder={`${t("set_limits_example")} 5000`}
                    className={
                      errors.stake_per_bet_limit_amount
                        ? "input-error"
                        : "input"
                    }
                    step="0.01"
                  />
                  {errors.stake_per_bet_limit_amount && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.stake_per_bet_limit_amount.message}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </ControlCard>

        <ControlCard
          title={t("set_limits_deposit_limit_title")}
          description={t("set_limits_deposit_limit_desc")}
          isLocked={isLocked("deposit_limit")}
          currentValue={currentLimits?.deposit_limit}
          lockMessage={t("set_limits_deposit_limit_locked")}
          currency={currency}
          amountUnit="currency"
          t={t}
        >
          {!isLocked("deposit_limit") && (
            <>
              <div className="flex items-start mb-4">
                <input
                  type="checkbox"
                  {...register("deposit_limit_enabled")}
                  className="checkbox mt-1"
                  id="deposit_enabled"
                />
                <label
                  htmlFor="deposit_enabled"
                  className="ml-3 text-base font-medium cursor-pointer"
                >
                  {t("set_limits_deposit_limit_enable")}
                </label>
              </div>

              {depositEnabled && (
                <div className="pl-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("set_limits_deposit_limit_max")}
                  </label>
                  <input
                    type="number"
                    {...register("deposit_limit_amount", {
                      required:
                        depositEnabled &&
                        t("set_limits_validation_amount_required"),
                      min: {
                        value: 1,
                        message: t("set_limits_validation_min_1"),
                      },
                    })}
                    placeholder={`${t("set_limits_example")} 20000`}
                    className={
                      errors.deposit_limit_amount ? "input-error" : "input"
                    }
                    step="0.01"
                  />
                  {errors.deposit_limit_amount && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.deposit_limit_amount.message}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </ControlCard>

        <ControlCard
          title={t("set_limits_bet_count_title")}
          description={t("set_limits_bet_count_desc")}
          isLocked={isLocked("bet_count_limit")}
          currentValue={currentLimits?.bet_count_limit}
          lockMessage={t("set_limits_bet_count_locked")}
          currency={currency}
          amountUnit="bets"
          t={t}
        >
          {!isLocked("bet_count_limit") && (
            <>
              <div className="flex items-start mb-4">
                <input
                  type="checkbox"
                  {...register("bet_count_limit_enabled")}
                  className="checkbox mt-1"
                  id="bet_count_enabled"
                />
                <label
                  htmlFor="bet_count_enabled"
                  className="ml-3 text-base font-medium cursor-pointer"
                >
                  {t("set_limits_bet_count_enable")}
                </label>
              </div>

              {betCountEnabled && (
                <div className="pl-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("set_limits_bet_count_max")}
                  </label>
                  <input
                    type="number"
                    {...register("bet_count_limit_amount", {
                      required:
                        betCountEnabled &&
                        t("set_limits_validation_amount_required"),
                      min: {
                        value: 1,
                        message: t("set_limits_validation_min_1"),
                      },
                    })}
                    placeholder={`${t("set_limits_example")} 50`}
                    className={
                      errors.bet_count_limit_amount ? "input-error" : "input"
                    }
                    step="1"
                  />
                  {errors.bet_count_limit_amount && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.bet_count_limit_amount.message}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </ControlCard>

        <ControlCard
          title={t("set_limits_session_break_title")}
          description={t("set_limits_session_break_desc")}
          isLocked={isLocked("session_break")}
          currentValue={currentLimits?.session_break}
          lockMessage={t("set_limits_session_break_locked")}
          t={t}
        >
          {!isLocked("session_break") && (
            <>
              <div className="flex items-start mb-4">
                <input
                  type="checkbox"
                  {...register("session_break_enabled")}
                  className="checkbox mt-1"
                  id="session_break_enabled"
                />
                <label
                  htmlFor="session_break_enabled"
                  className="ml-3 text-base font-medium cursor-pointer"
                >
                  {t("set_limits_session_break_enable")}
                </label>
              </div>

              {sessionBreakEnabled && (
                <div className="pl-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("set_limits_session_break_duration")}
                    </label>
                    <input
                      type="number"
                      {...register("session_break_duration", {
                        required:
                          sessionBreakEnabled &&
                          t("set_limits_validation_required"),
                        min: {
                          value: 1,
                          message: t("set_limits_validation_min_1_minute"),
                        },
                        max: {
                          value: 60,
                          message: t("set_limits_validation_max_60_minutes"),
                        },
                      })}
                      placeholder="5"
                      className={
                        errors.session_break_duration ? "input-error" : "input"
                      }
                      step="1"
                    />
                    {errors.session_break_duration && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.session_break_duration.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("set_limits_session_break_frequency")}
                    </label>
                    <input
                      type="number"
                      {...register("session_break_frequency", {
                        required:
                          sessionBreakEnabled &&
                          t("set_limits_validation_required"),
                        min: {
                          value: 1,
                          message: t("set_limits_validation_min_1_minute"),
                        },
                        max: {
                          value: 480,
                          message: t("set_limits_validation_max_480_minutes"),
                        },
                      })}
                      placeholder="60"
                      className={
                        errors.session_break_frequency ? "input-error" : "input"
                      }
                      step="1"
                    />
                    {errors.session_break_frequency && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.session_break_frequency.message}
                      </p>
                    )}
                  </div>

                  <p className="col-span-full text-sm text-gray-600">
                    {t("set_limits_session_break_example")}
                  </p>
                </div>
              )}
            </>
          )}
        </ControlCard>

        <ControlCard
          title={t("set_limits_night_curfew_title")}
          description={t("set_limits_night_curfew_desc")}
          isLocked={isLocked("night_curfew")}
          currentValue={currentLimits?.night_curfew}
          lockMessage={t("set_limits_night_curfew_locked")}
          t={t}
        >
          {!isLocked("night_curfew") && (
            <>
              <div className="flex items-start mb-4">
                <input
                  type="checkbox"
                  {...register("night_curfew_enabled")}
                  className="checkbox mt-1"
                  id="night_curfew_enabled"
                />
                <label
                  htmlFor="night_curfew_enabled"
                  className="ml-3 text-base font-medium cursor-pointer"
                >
                  {t("set_limits_night_curfew_enable")}
                </label>
              </div>

              {nightCurfewEnabled && (
                <div className="pl-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("set_limits_night_curfew_start")}
                    </label>
                    <input
                      type="time"
                      {...register("night_curfew_daily_start_time", {
                        required:
                          nightCurfewEnabled &&
                          t("set_limits_validation_required"),
                      })}
                      className={
                        errors.night_curfew_daily_start_time
                          ? "input-error"
                          : "input"
                      }
                    />
                    {errors.night_curfew_daily_start_time && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.night_curfew_daily_start_time.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("set_limits_night_curfew_end")}
                    </label>
                    <input
                      type="time"
                      {...register("night_curfew_daily_end_time", {
                        required:
                          nightCurfewEnabled &&
                          t("set_limits_validation_required"),
                      })}
                      className={
                        errors.night_curfew_daily_end_time
                          ? "input-error"
                          : "input"
                      }
                    />
                    {errors.night_curfew_daily_end_time && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.night_curfew_daily_end_time.message}
                      </p>
                    )}
                  </div>

                  <p className="col-span-full text-sm text-gray-600">
                    {t("set_limits_night_curfew_example")}
                  </p>
                </div>
              )}
            </>
          )}
        </ControlCard>

        <ControlCard
          title={t("set_limits_timeout_title")}
          description={t("set_limits_timeout_desc")}
          isLocked={isLocked("time_out_limit")}
          currentValue={currentLimits?.time_out}
          lockMessage={
            currentLimits?.time_out?.active
              ? t("set_limits_timeout_active_until", {
                  date: new Date(
                    currentLimits.time_out.end_at
                  ).toLocaleString(),
                })
              : t("set_limits_timeout_expired")
          }
          bgColor="bg-yellow-50"
          borderColor="border-yellow-200"
          t={t}
        >
          {timeOutDisabled ? (
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
              <p className="font-semibold text-gray-900 mb-1">
                {t("set_limits_timeout_self_exclusion_effect")}
              </p>
              <p>{timeOutDisabledMessage}</p>
            </div>
          ) : (
            <>
              <div className="flex items-start mb-4">
                <input
                  type="checkbox"
                  {...register("time_out_limit_enabled")}
                  className="checkbox mt-1"
                  id="timeout_enabled"
                  disabled={timeOutDisabled}
                  onChange={(e) =>
                    handleExclusiveToggle("time_out", e.target.checked)
                  }
                />
                <label
                  htmlFor="timeout_enabled"
                  className="ml-3 text-base font-medium cursor-pointer"
                >
                  {t("set_limits_timeout_activate")}
                </label>
              </div>

              {timeOutEnabled && !timeOutDisabled && (
                <div className="pl-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("set_limits_timeout_duration")}
                  </label>
                  <select
                    {...register("time_out_limit_option", {
                      required:
                        timeOutEnabled &&
                        t("set_limits_validation_duration_required"),
                    })}
                    className={
                      errors.time_out_limit_option ? "input-error" : "input"
                    }
                  >
                    <option value="">
                      {t("set_limits_timeout_select_duration")}
                    </option>
                    <option value="24_hours">
                      {t("set_limits_timeout_24_hours")}
                    </option>
                    <option value="48_hours">
                      {t("set_limits_timeout_48_hours")}
                    </option>
                    <option value="7_days">
                      {t("set_limits_timeout_7_days")}
                    </option>
                  </select>
                  {errors.time_out_limit_option && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.time_out_limit_option.message}
                    </p>
                  )}
                  <p className="text-sm text-red-700 mt-2 font-semibold">
                    {t("set_limits_timeout_warning")}
                  </p>
                </div>
              )}
            </>
          )}
        </ControlCard>

        <ControlCard
          title={t("set_limits_self_exclusion_title")}
          description={t("set_limits_self_exclusion_desc")}
          isLocked={isLocked("self_exclusion_limit")}
          currentValue={currentLimits?.self_exclusion}
          lockMessage={
            currentLimits?.self_exclusion?.option === "indefinitely"
              ? t("set_limits_self_exclusion_permanent")
              : currentLimits?.self_exclusion?.active
              ? t("set_limits_self_exclusion_active_until", {
                  date: new Date(
                    currentLimits.self_exclusion.end_at
                  ).toLocaleString(),
                })
              : t("set_limits_self_exclusion_expired")
          }
          bgColor="bg-red-50"
          borderColor="border-red-200"
          t={t}
        >
          {!isLocked("self_exclusion_limit") && (
            <>
              {!selfExclusionDisabled && (
                <>
                  <div className="flex items-start mb-4">
                    <input
                      type="checkbox"
                      {...register("self_exclusion_limit_enabled")}
                      className="checkbox mt-1"
                      id="self_exclusion_enabled"
                      onChange={(e) =>
                        handleExclusiveToggle(
                          "self_exclusion",
                          e.target.checked
                        )
                      }
                    />
                    <label
                      htmlFor="self_exclusion_enabled"
                      className="ml-3 text-base font-medium cursor-pointer"
                    >
                      {t("set_limits_self_exclusion_activate")}
                    </label>
                  </div>

                  {selfExclusionEnabled && (
                    <div className="pl-8">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("set_limits_self_exclusion_duration")}
                      </label>
                      <select
                        {...register("self_exclusion_limit_option", {
                          required:
                            selfExclusionEnabled &&
                            t("set_limits_validation_duration_required"),
                        })}
                        className={
                          errors.self_exclusion_limit_option
                            ? "input-error"
                            : "input"
                        }
                      >
                        <option value="">
                          {t("set_limits_self_exclusion_select_duration")}
                        </option>
                        <option value="1_month">
                          {t("set_limits_self_exclusion_1_month")}
                        </option>
                        <option value="3_months">
                          {t("set_limits_self_exclusion_3_months")}
                        </option>
                        <option value="6_months">
                          {t("set_limits_self_exclusion_6_months")}
                        </option>
                        <option value="1_year">
                          {t("set_limits_self_exclusion_1_year")}
                        </option>
                        <option value="indefinitely">
                          {t("set_limits_self_exclusion_indefinitely")}
                        </option>
                      </select>
                      {errors.self_exclusion_limit_option && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.self_exclusion_limit_option.message}
                        </p>
                      )}
                      <p className="text-sm text-red-700 mt-2 font-semibold">
                        {t("set_limits_self_exclusion_warning")}
                      </p>
                    </div>
                  )}
                </>
              )}
            </>
          )}
          {selfExclusionDisabled && !selfExclusionEnabled && (
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
              <p className="font-semibold text-gray-900 mb-1">
                {t("set_limits_self_exclusion_timeout_active")}
              </p>
              <p>{t("set_limits_self_exclusion_timeout_message")}</p>
            </div>
          )}
        </ControlCard>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4 sm:mx-0 sm:border-0 sm:p-0 sm:bg-transparent safe-bottom">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-lg py-4"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="spinner w-5 h-5 border-2 mr-2"></span>
                {t("set_limits_saving")}
              </span>
            ) : (
              t("set_limits_save_controls")
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function ControlCard({
  title,
  description,
  isLocked,
  currentValue,
  lockMessage,
  children,
  bgColor = "bg-white",
  borderColor = "border-gray-200",
  currency = "",
  amountUnit = "currency",
  t,
}) {
  return (
    <div className={`card border ${borderColor} ${bgColor}`}>
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>

      {isLocked ? (
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-1">
              <p className="font-semibold text-gray-900 mb-2">
                {t("set_limits_control_locked")}
              </p>

              {currentValue?.enabled && (
                <div className="mb-3">
                  {currentValue.amount !== undefined &&
                    currentValue.amount !== null && (
                      <p className="text-2xl font-bold text-gray-700">
                        {formatAmountWithUnit(
                          currentValue.amount,
                          amountUnit === "currency" ? currency : amountUnit
                        )}
                      </p>
                    )}
                  {currentValue.duration !== undefined && (
                    <p className="text-lg font-semibold text-gray-700">
                      {currentValue.duration} {t("set_limits_minutes_abbrev")}{" "}
                      {t("set_limits_every")} {currentValue.frequency}{" "}
                      {t("set_limits_minutes_abbrev")}
                    </p>
                  )}
                  {currentValue.daily_start_time && (
                    <p className="text-lg font-semibold text-gray-700">
                      {currentValue.daily_start_time} -{" "}
                      {currentValue.daily_end_time}
                    </p>
                  )}
                  {currentValue.option && (
                    <p className="text-lg font-semibold text-gray-700">
                      {formatOption(currentValue.option, t)}
                    </p>
                  )}
                  {currentValue.end_at && (
                    <p className="text-sm text-gray-600 mt-1">
                      {currentValue.active
                        ? t("set_limits_control_active_until")
                        : t("set_limits_control_was_active_until")}
                      : {new Date(currentValue.end_at).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              <p className="text-sm text-gray-600">{lockMessage}</p>
            </div>
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

function formatOption(option, t) {
  const map = {
    "24_hours": t("set_limits_format_24_hours"),
    "48_hours": t("set_limits_format_48_hours"),
    "7_days": t("set_limits_format_7_days"),
    "1_month": t("set_limits_format_1_month"),
    "3_months": t("set_limits_format_3_months"),
    "6_months": t("set_limits_format_6_months"),
    "1_year": t("set_limits_format_1_year"),
    indefinitely: t("set_limits_format_indefinitely"),
  };
  return map[option] || option;
}

function formatAmountWithUnit(amount, unit) {
  if (unit) {
    return `${amount} ${unit}`;
  }
  return `${amount}`;
}
