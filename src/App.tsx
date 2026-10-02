import { useState, useMemo } from 'react';
import { LandingPage } from '@/components/LandingPage';
import { BusinessTypeSelector } from '@/components/BusinessTypeSelector';
import { CostEstimateEditor } from '@/components/CostEstimateEditor';
import { ResultsView } from '@/components/ResultsView';
import { ScenarioView } from '@/components/ScenarioView';
import type { AppStep, BusinessEstimate } from '@/types';
import { generateEstimate, generateCustomEstimate, findTemplate } from '@/lib/businessData';
import { calculate, sumIngredients, sumCostItems } from '@/lib/calc';

function App() {
  const [step, setStep] = useState<AppStep>('landing');
  const [businessKey, setBusinessKey] = useState<string>('');
  const [businessLabel, setBusinessLabel] = useState<string>('');
  const [estimate, setEstimate] = useState<BusinessEstimate | null>(null);
  const [targetProfit, setTargetProfit] = useState<number>(5000000);
  const [sellingPrice, setSellingPrice] = useState<number>(25000);

  const handleSelectBusiness = (key: string, customLabel?: string) => {
    setBusinessKey(key);
    if (key === 'custom' && customLabel) {
      setBusinessLabel(customLabel);
      const est = generateCustomEstimate(customLabel);
      setEstimate(est);
      setSellingPrice(Math.round((est.suggestedPriceRange.min + est.suggestedPriceRange.max) / 2 / 500) * 500);
    } else {
      const template = findTemplate(key);
      if (template) {
        setBusinessLabel(template.label);
        const est = generateEstimate(template);
        setEstimate(est);
        setSellingPrice(Math.round((est.suggestedPriceRange.min + est.suggestedPriceRange.max) / 2 / 500) * 500);
      }
    }
    setStep('cost-estimate');
  };

  const calc = useMemo(() => {
    if (!estimate) return null;
    return calculate(
      estimate.ingredients,
      estimate.monthlyFixedCosts,
      estimate.startupCosts,
      sellingPrice,
      targetProfit,
    );
  }, [estimate, sellingPrice, targetProfit]);

  if (step === 'landing') {
    return <LandingPage onStart={() => setStep('business-type')} />;
  }

  if (step === 'business-type') {
    return (
      <BusinessTypeSelector
        onSelect={handleSelectBusiness}
        onBack={() => setStep('landing')}
      />
    );
  }

  if (step === 'cost-estimate' && estimate) {
    return (
      <CostEstimateEditor
        businessType={businessLabel}
        estimate={estimate}
        onUpdate={setEstimate}
        targetProfit={targetProfit}
        onTargetProfitChange={setTargetProfit}
        sellingPrice={sellingPrice}
        onSellingPriceChange={setSellingPrice}
        onContinue={() => setStep('results')}
        onBack={() => setStep('business-type')}
      />
    );
  }

  if (step === 'results' && estimate && calc) {
    return (
      <ResultsView
        calc={calc}
        estimate={estimate}
        onContinue={() => setStep('scenarios')}
        onBack={() => setStep('cost-estimate')}
      />
    );
  }

  if (step === 'scenarios' && estimate && calc) {
    return (
      <ScenarioView
        businessType={businessLabel}
        estimate={estimate}
        calc={calc}
        onBack={() => setStep('results')}
        onSellingPriceChange={setSellingPrice}
      />
    );
  }

  return <LandingPage onStart={() => setStep('business-type')} />;
}

export default App;
