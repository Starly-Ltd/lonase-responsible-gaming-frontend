import { useState, useEffect } from "react";
import { rgApi } from "../../api/rgApi";

export default function History() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const response = await rgApi.getHistory();
            if (response.data.success) {
                setHistory(response.data.data);
            }
        } catch (err) {
            setError("Failed to load history. Please try again.");
            console.error("Failed to load history:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="spinner w-12 h-12 border-4 mx-auto mb-4 text-primary-600"></div>
                    <p className="text-gray-600">Loading history...</p>
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
                <button onClick={loadHistory} className="btn-primary mt-4">
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-0">
                    Webhook Delivery History
                </h1>
                <button onClick={loadHistory} className="btn-secondary">
                    Refresh
                </button>
            </div>

            <div className="alert-info mb-6">
                <p className="text-sm">
                    This shows notifications sent to gambling operators when you
                    set or update your limits. Operators use these notifications
                    to enforce your controls.
                </p>
            </div>

            {history.length === 0 ? (
                <div className="card text-center py-12">
                    <div className="text-6xl mb-4">📜</div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        No History Yet
                    </h2>
                    <p className="text-gray-600">
                        When you set limits, notifications to operators will
                        appear here.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {history.map((item) => (
                        <HistoryItem key={item.id} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
}

function HistoryItem({ item }) {
    const [expanded, setExpanded] = useState(false);

    const getStatusBadge = () => {
        if (item.status === "delivered") {
            return <span className="badge-success">Delivered</span>;
        }
        if (item.status === "failed") {
            return <span className="badge-danger">Failed</span>;
        }
        return <span className="badge-warning">Pending</span>;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleString();
    };

    const formatEventType = (type) => {
        const map = {
            "limit.created": "Limits Created",
            "limit.updated": "Limits Updated",
            "limit.cleared": "Limits Cleared",
        };
        return map[type] || type;
    };

    return (
        <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 mb-4 sm:mb-0">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {item.operator}
                        </h3>
                        {getStatusBadge()}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                        <p>
                            <span className="font-medium">Event:</span>{" "}
                            {formatEventType(item.event_type)}
                        </p>
                        <p>
                            <span className="font-medium">Created:</span>{" "}
                            {formatDate(item.created_at)}
                        </p>
                        {item.delivered_at && (
                            <p>
                                <span className="font-medium">Delivered:</span>{" "}
                                {formatDate(item.delivered_at)}
                            </p>
                        )}
                        {item.failed_at && (
                            <p className="text-red-600">
                                <span className="font-medium">Failed:</span>{" "}
                                {formatDate(item.failed_at)}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    {item.retry_count > 0 && (
                        <div className="text-sm text-gray-600">
                            <span className="font-medium">Retries:</span>{" "}
                            {item.retry_count}
                        </div>
                    )}
                    {item.response_code && (
                        <div className="text-sm">
                            <span className="font-medium">Code:</span>{" "}
                            <span
                                className={
                                    item.response_code === 200
                                        ? "text-green-600"
                                        : "text-red-600"
                                }
                            >
                                {item.response_code}
                            </span>
                        </div>
                    )}
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="btn-secondary text-sm px-3 py-1"
                    >
                        {expanded ? "Hide" : "Details"}
                    </button>
                </div>
            </div>

            {expanded && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">
                                Delivery Info
                            </h4>
                            <dl className="space-y-1">
                                <div>
                                    <dt className="inline font-medium">ID:</dt>
                                    <dd className="inline ml-2 text-gray-600">
                                        {item.id}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="inline font-medium">
                                        Status:
                                    </dt>
                                    <dd className="inline ml-2 text-gray-600">
                                        {item.status}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="inline font-medium">
                                        Retry Count:
                                    </dt>
                                    <dd className="inline ml-2 text-gray-600">
                                        {item.retry_count}
                                    </dd>
                                </div>
                                {item.response_code && (
                                    <div>
                                        <dt className="inline font-medium">
                                            Response Code:
                                        </dt>
                                        <dd className="inline ml-2 text-gray-600">
                                            {item.response_code}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">
                                Timestamps
                            </h4>
                            <dl className="space-y-1">
                                <div>
                                    <dt className="inline font-medium">
                                        Created:
                                    </dt>
                                    <dd className="inline ml-2 text-gray-600">
                                        {formatDate(item.created_at)}
                                    </dd>
                                </div>
                                {item.delivered_at && (
                                    <div>
                                        <dt className="inline font-medium">
                                            Delivered:
                                        </dt>
                                        <dd className="inline ml-2 text-gray-600">
                                            {formatDate(item.delivered_at)}
                                        </dd>
                                    </div>
                                )}
                                {item.failed_at && (
                                    <div>
                                        <dt className="inline font-medium">
                                            Failed:
                                        </dt>
                                        <dd className="inline ml-2 text-gray-600">
                                            {formatDate(item.failed_at)}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    </div>

                    {item.response_body && item.status === "failed" && (
                        <div className="mt-4">
                            <h4 className="font-semibold text-gray-900 mb-2">
                                Error Details
                            </h4>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800 overflow-x-auto">
                                <pre className="whitespace-pre-wrap break-words">
                                    {typeof item.response_body === "string"
                                        ? item.response_body
                                        : JSON.stringify(
                                              item.response_body,
                                              null,
                                              2
                                          )}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
