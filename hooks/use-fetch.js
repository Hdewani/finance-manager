import { useState, useCallback } from "react";
import { toast } from "sonner";

const useFetch = (fn) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      console.log("🚀 useFetch: Starting API call with args:", args);
      console.log("🚀 useFetch: Function name:", fn.name || "anonymous");
      
      setLoading(true);
      setError(null);
      
      try {
        console.log("⏳ useFetch: Calling function...");
        const result = await fn(...args);
        console.log("✅ useFetch: Function call successful:", result);
        
        setData(result);
        return result;
      } catch (err) {
        console.error("❌ useFetch: Function call failed:", err);
        console.error("❌ useFetch: Error details:", {
          message: err.message,
          stack: err.stack,
          name: err.name
        });
        
        setError(err);
        throw err;
      } finally {
        console.log("🏁 useFetch: Setting loading to false");
        setLoading(false);
      }
    },
    [fn]
  );

  console.log("🔄 useFetch: Current state:", {
    loading,
    hasData: !!data,
    hasError: !!error,
    errorMessage: error?.message
  });

  return {
    loading,
    data,
    error,
    fn: execute,
  };
};

export default useFetch;
