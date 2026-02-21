import { MainLayout } from './components/layout/MainLayout';

function App() {
  return (
    <MainLayout>
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 min-h-[500px] p-6">
        {/* Placeholder for page content */}
        <h1 className="text-2xl font-semibold text-slate-800 mb-6">Cars</h1>
        <p className="text-slate-500">
          Content for the selected module will go here.
        </p>
      </div>
    </MainLayout>
  );
}

export default App;
