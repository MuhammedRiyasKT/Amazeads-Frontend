import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
    "Expires": "0",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    // Zustand-ന്റെ amaze-erp-auth എന്ന ലോക്കൽ സ്റ്റോറേജ് കീയിൽ നിന്നും ടോക്കൺ റീഡ് ചെയ്യുന്നു (പ്രധാന മാറ്റം!)
    const authDataStr = localStorage.getItem("amaze-erp-auth");
    if (authDataStr) {
      const authData = JSON.parse(authDataStr);
      const token = authData?.state?.token;
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  }

  return config;
});

export default api;