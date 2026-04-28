import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Intro from "./pages/Intro";
import Home from "./pages/Home";
import Timer from "./pages/Timer";
import Stats from "./pages/Stats";
import Ranking from "./pages/Ranking";
import Reward from "./pages/Reward";
import Settings from "./pages/Settings";
import Terms from "./pages/Terms";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});

type TdsEventModule = {
  tdsEvent?: {
    addEventListener: (
      name: string,
      opts: { onEvent: (data: { id: string }) => void },
    ) => () => void;
  };
};

function NavigationAccessoryHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    if (import.meta.env.DEV) return;
    let cleanup: (() => void) | undefined;

    import('@apps-in-toss/web-framework')
      .then((sdk) => {
        const tdsEvent = (sdk as unknown as TdsEventModule).tdsEvent;
        cleanup = tdsEvent?.addEventListener('navigationAccessoryEvent', {
          onEvent: ({ id }) => {
            if (id === 'settings') navigate('/settings');
          },
        });
      })
      .catch(() => {});

    return () => cleanup?.();
  }, [navigate]);

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <NavigationAccessoryHandler />
        <Routes>
          <Route path="/" element={<Intro />} />
          <Route path="/home" element={<Home />} />
          <Route path="/timer" element={<Timer />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/reward" element={<Reward />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
