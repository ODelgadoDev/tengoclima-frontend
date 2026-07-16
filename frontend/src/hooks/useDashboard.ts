import { useCallback, useEffect, useState } from "react";

import { dashboardApi } from "../api/dashboardApi";
import type { DashboardData } from "../types/dashboard";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

const DASHBOARD_ERROR_MESSAGE =
  "No fue posible cargar la información del dashboard.";

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadInitialDashboard = async () => {
      try {
        const dashboardData = await dashboardApi.getDashboard();

        if (!isActive) {
          return;
        }

        setData(dashboardData);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setErrorMessage(
          getApiErrorMessage(error, DASHBOARD_ERROR_MESSAGE),
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadInitialDashboard();

    return () => {
      isActive = false;
    };
  }, []);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const dashboardData = await dashboardApi.getDashboard();

      setData(dashboardData);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, DASHBOARD_ERROR_MESSAGE),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    data,
    isLoading,
    errorMessage,
    reload,
  };
}