import React, { useState } from 'react';
import { Info, AlertTriangle, XCircle, CheckCircle, X } from 'lucide-react';

interface Alert {
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
}

interface AlertsPanelProps {
  alerts: Alert[];
  onDismiss?: (index: number) => void;
}

const alertConfig = {
  info: {
    icon: Info,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-900',
    textColor: 'text-blue-800'
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconColor: 'text-amber-600',
    titleColor: 'text-amber-900',
    textColor: 'text-amber-800'
  },
  error: {
    icon: XCircle,
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconColor: 'text-red-600',
    titleColor: 'text-red-900',
    textColor: 'text-red-800'
  },
  success: {
    icon: CheckCircle,
    bg: 'bg-green-50',
    border: 'border-green-200',
    iconColor: 'text-green-600',
    titleColor: 'text-green-900',
    textColor: 'text-green-800'
  }
};

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts, onDismiss }) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [alertToConfirm, setAlertToConfirm] = useState<{ index: number; alert: Alert } | null>(null);

  if (alerts.length === 0) return null;

  const handleDismissClick = (index: number, alert: Alert) => {
    setAlertToConfirm({ index, alert });
    setShowConfirmModal(true);
  };

  const handleConfirmDismiss = () => {
    if (alertToConfirm && onDismiss) {
      onDismiss(alertToConfirm.index);
    }
    setShowConfirmModal(false);
    setAlertToConfirm(null);
  };

  const handleCancelDismiss = () => {
    setShowConfirmModal(false);
    setAlertToConfirm(null);
  };

  return (
    <>
      <div className="space-y-3">
        {alerts.map((alert, index) => {
          const config = alertConfig[alert.type];
          const Icon = config.icon;

          return (
            <div
              key={index}
              className={`${config.bg} dark:bg-gray-800 border-l-4 ${config.border} dark:border-gray-600 rounded-lg p-4 flex items-start gap-3`}
            >
              <Icon className={`h-5 w-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
              <div className="flex-1">
                <h4 className={`text-sm font-semibold ${config.titleColor} dark:text-white mb-1`}>
                  {alert.title}
                </h4>
                <p className={`text-sm ${config.textColor} dark:text-gray-300`}>{alert.message}</p>
              </div>
              {onDismiss && (
                <button
                  onClick={() => handleDismissClick(index, alert)}
                  className={`${config.iconColor} hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg p-1 transition-all hover:scale-110 active:scale-95 flex-shrink-0`}
                  aria-label="Dismiss alert"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && alertToConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700 animate-scale-in">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Dismiss Alert
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Are you sure you want to dismiss this alert? It won't be shown again.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mb-6">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                {alertToConfirm.alert.title}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {alertToConfirm.alert.message}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelDismiss}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDismiss}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-medium hover:from-teal-700 hover:to-cyan-700 transition-all shadow-lg"
              >
                OK, Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AlertsPanel;