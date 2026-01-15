import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Generator from './pages/Generator';
import Pricing from './pages/Pricing';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <Toaster position="bottom-center" />
      <Routes>
        <Route path="/" element={<Generator />} />
        <Route path="/pricing" element={<Pricing />} />
      </Routes>
    </Router>
  );
}

export default App;
