import React, { useState } from 'react';
import { Layout, type PageKey } from '@/components/Layout';
import { DashboardPage } from '@/pages/DashboardPage';
import { AnalyzerPage } from '@/pages/AnalyzerPage';
import { ImpactMapPage } from '@/pages/ImpactMapPage';
import { AffectedOrdersPage } from '@/pages/AffectedOrdersPage';
import { InventoryRiskPage } from '@/pages/InventoryRiskPage';
import { ResponsePlannerPage } from '@/pages/ResponsePlannerPage';
import { EvidencePage } from '@/pages/EvidencePage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { ScenarioPage } from '@/pages/ScenarioPage';
import { analyzeDisruption, type ImpactAnalysis } from '@/data/engine';

function App() {
  const [page, setPage] = useState<PageKey>('dashboard');
  const [impact, setImpact] = useState<ImpactAnalysis | null>(null);

  const runScenario = (text: string) => {
    setImpact(analyzeDisruption(text));
  };

  return (
    <Layout page={page} setPage={setPage}>
      {page === 'dashboard'  && <DashboardPage impact={impact} setPage={setPage} />}
      {page === 'analyzer'   && <AnalyzerPage impact={impact} setImpact={setImpact} setPage={setPage} />}
      {page === 'impact'     && <ImpactMapPage impact={impact} />}
      {page === 'orders'     && <AffectedOrdersPage impact={impact} />}
      {page === 'inventory'  && <InventoryRiskPage impact={impact} />}
      {page === 'response'   && <ResponsePlannerPage impact={impact} />}
      {page === 'evidence'   && <EvidencePage impact={impact} />}
      {page === 'analytics'  && <AnalyticsPage />}
      {page === 'scenarios'  && <ScenarioPage impact={impact} runScenario={runScenario} setPage={setPage} />}
    </Layout>
  );
}

export default App;
