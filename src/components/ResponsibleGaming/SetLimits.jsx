import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { rgApi } from "../../api/rgApi";
import { useAuth } from "../../context/AuthContext";

export default function SetLimits() {
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
    ? "A self-exclusion is currently active, so a time-out is covered automatically. Contact support or wait until the self-exclusion ends to set a shorter lock-out."
    : selfExclusionEnabled
    ? "Self-exclusion is selected. A time-out isn’t needed because the longer lock will apply."
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
        alert(
          "Activating a time-out will disable your self-exclusion. Continue only if you want to replace the longer lock."
        );
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
        alert(
          "Activating a self-exclusion will disable any existing time-out. Continue only if you want the longer lock instead."
        );
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
            `Controls Set:\n\n${controlsList}\n\nThese limits are now locked and cannot be changed.\nContact support to remove them.`
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
        setError(
          err.response?.data?.message ||
            "Failed to set limits. Please try again."
        );
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
          <p className="text-gray-600">Loading current limits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        Set Your Responsible Gaming Limits
      </h1>
      <p className="text-sm text-gray-600 mb-6">
        <strong>Important:</strong> Once set, limits cannot be changed by you.
        Only support can remove them.
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
          title="Stake Per Bet Limit"
          description="Set a maximum amount you can bet on any single bet"
          isLocked={isLocked("stake_per_bet_limit")}
          currentValue={currentLimits?.stake_per_bet_limit}
          lockMessage="Stake per bet limit is already set. Contact support to remove it."
          currency={currency}
          amountUnit="currency"
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
                  Enable stake per bet limit
                </label>
              </div>

              {stakeEnabled && (
                <div className="pl-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum bet amount
                  </label>
                  <input
                    type="number"
                    {...register("stake_per_bet_limit_amount", {
                      required: stakeEnabled && "Amount is required",
                      min: { value: 1, message: "Must be at least 1" },
                    })}
                    placeholder="e.g., 5000"
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
          title="Deposit Limit"
          description="Set a maximum amount you can deposit (operator decides enforcement window)"
          isLocked={isLocked("deposit_limit")}
          currentValue={currentLimits?.deposit_limit}
          lockMessage="Deposit limit is already set. Contact support to remove it."
          currency={currency}
          amountUnit="currency"
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
                  Enable deposit limit
                </label>
              </div>

              {depositEnabled && (
                <div className="pl-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum deposit amount
                  </label>
                  <input
                    type="number"
                    {...register("deposit_limit_amount", {
                      required: depositEnabled && "Amount is required",
                      min: { value: 1, message: "Must be at least 1" },
                    })}
                    placeholder="e.g., 20000"
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
          title="Bet Count Limit"
          description="Limit the NUMBER of bets you can place (not the amount)"
          isLocked={isLocked("bet_count_limit")}
          currentValue={currentLimits?.bet_count_limit}
          lockMessage="Bet count limit is already set. Contact support to remove it."
          currency={currency}
          amountUnit="bets"
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
                  Enable bet count limit
                </label>
              </div>

              {betCountEnabled && (
                <div className="pl-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum number of bets
                  </label>
                  <input
                    type="number"
                    {...register("bet_count_limit_amount", {
                      required: betCountEnabled && "Amount is required",
                      min: { value: 1, message: "Must be at least 1" },
                    })}
                    placeholder="e.g., 50"
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
          title="Time-Out (Cooling-Off)"
          description="Take a short break from gambling. Your account will be locked temporarily."
          isLocked={isLocked("time_out_limit")}
          currentValue={currentLimits?.time_out}
          lockMessage={
            currentLimits?.time_out?.active
              ? `Time-out is active until ${new Date(
                  currentLimits.time_out.end_at
                ).toLocaleString()}. Wait for it to expire.`
              : "Time-out has expired. You can set a new one."
          }
        >
          {timeOutDisabled ? (
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
              <p className="font-semibold text-gray-900 mb-1">
                Self-exclusion in effect
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
                  Activate time-out
                </label>
              </div>

              {timeOutEnabled && !timeOutDisabled && (
                <div className="pl-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration
                  </label>
                  <select
                    {...register("time_out_limit_option", {
                      required: timeOutEnabled && "Duration is required",
                    })}
                    className={
                      errors.time_out_limit_option ? "input-error" : "input"
                    }
                  >
                    <option value="">Select duration</option>
                    <option value="24_hours">24 Hours</option>
                    <option value="48_hours">48 Hours (2 days)</option>
                    <option value="7_days">7 Days</option>
                  </select>
                  {errors.time_out_limit_option && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.time_out_limit_option.message}
                    </p>
                  )}
                  <p className="text-sm text-red-700 mt-2 font-semibold">
                    Your account will be locked for this duration. This cannot
                    be undone.
                  </p>
                </div>
              )}
            </>
          )}
        </ControlCard>

        <ControlCard
          title="Self-Exclusion"
          description="Permanently or long-term block your account. This is for serious situations."
          isLocked={isLocked("self_exclusion_limit")}
          currentValue={currentLimits?.self_exclusion}
          lockMessage={
            currentLimits?.self_exclusion?.option === "indefinitely"
              ? "You are permanently self-excluded. Contact support to reactivate."
              : currentLimits?.self_exclusion?.active
              ? `Self-exclusion active until ${new Date(
                  currentLimits.self_exclusion.end_at
                ).toLocaleString()}. Contact support for early reactivation.`
              : "Self-exclusion has expired. You can set a new one."
          }
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
                      Activate self-exclusion
                    </label>
                  </div>

                  {selfExclusionEnabled && (
                    <div className="pl-8">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration
                      </label>
                      <select
                        {...register("self_exclusion_limit_option", {
                          required:
                            selfExclusionEnabled && "Duration is required",
                        })}
                        className={
                          errors.self_exclusion_limit_option
                            ? "input-error"
                            : "input"
                        }
                      >
                        <option value="">Select duration</option>
                        <option value="1_month">1 Month</option>
                        <option value="3_months">3 Months</option>
                        <option value="6_months">6 Months</option>
                        <option value="1_year">1 Year</option>
                        <option value="indefinitely">
                          Indefinitely (Permanent)
                        </option>
                      </select>
                      {errors.self_exclusion_limit_option && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.self_exclusion_limit_option.message}
                        </p>
                      )}
                      <p className="text-sm text-red-700 mt-2 font-semibold">
                        WARNING: Self-exclusion cannot be reversed. You'll need
                        to contact support.
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
                Time-out already active
              </p>
              <p>
                A time-out is currently running. If you continue with
                self-exclusion, the time-out will be removed and replaced by the
                longer lock.
              </p>
            </div>
          )}
        </ControlCard>

        <ControlCard
          title="Session Breaks"
          description="Take forced breaks during play to avoid gambling fatigue"
          isLocked={isLocked("session_break")}
          currentValue={currentLimits?.session_break}
          lockMessage="Session break is already set. Contact support to remove it."
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
                  Enable session breaks
                </label>
              </div>

              {sessionBreakEnabled && (
                <div className="pl-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Break duration (minutes)
                    </label>
                    <input
                      type="number"
                      {...register("session_break_duration", {
                        required: sessionBreakEnabled && "Required",
                        min: { value: 1, message: "Min 1 minute" },
                        max: { value: 60, message: "Max 60 minutes" },
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
                      Break every (minutes)
                    </label>
                    <input
                      type="number"
                      {...register("session_break_frequency", {
                        required: sessionBreakEnabled && "Required",
                        min: { value: 1, message: "Min 1 minute" },
                        max: { value: 480, message: "Max 480 minutes" },
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
                    Example: 5 minutes break every 60 minutes of play
                  </p>
                </div>
              )}
            </>
          )}
        </ControlCard>

        <ControlCard
          title="Night Curfew"
          description="Block access during specific hours every night (e.g., ensure proper sleep)"
          isLocked={isLocked("night_curfew")}
          currentValue={currentLimits?.night_curfew}
          lockMessage="Night curfew is already set. Contact support to remove it."
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
                  Enable night curfew
                </label>
              </div>

              {nightCurfewEnabled && (
                <div className="pl-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start time
                    </label>
                    <input
                      type="time"
                      {...register("night_curfew_daily_start_time", {
                        required: nightCurfewEnabled && "Required",
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
                      End time
                    </label>
                    <input
                      type="time"
                      {...register("night_curfew_daily_end_time", {
                        required: nightCurfewEnabled && "Required",
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
                    Example: 02:00 to 06:00 = No play between 2 AM and 6 AM
                    every night
                  </p>
                </div>
              )}
            </>
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
                Saving...
              </span>
            ) : (
              "Save Controls"
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
                Limit Already Set
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
                      {currentValue.duration}min every {currentValue.frequency}
                      min
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
                      {formatOption(currentValue.option)}
                    </p>
                  )}
                  {currentValue.end_at && (
                    <p className="text-sm text-gray-600 mt-1">
                      {currentValue.active
                        ? "Active until"
                        : "Was active until"}
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

function formatOption(option) {
  const map = {
    "24_hours": "24 Hours",
    "48_hours": "48 Hours",
    "7_days": "7 Days",
    "1_month": "1 Month",
    "3_months": "3 Months",
    "6_months": "6 Months",
    "1_year": "1 Year",
    indefinitely: "Indefinitely (Permanent)",
  };
  return map[option] || option;
}

function formatAmountWithUnit(amount, unit) {
  if (unit) {
    return `${amount} ${unit}`;
  }
  return `${amount}`;
}
