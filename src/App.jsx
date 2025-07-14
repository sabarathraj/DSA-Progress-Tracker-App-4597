// Add the Admin route to the Routes component
import Admin from './pages/Admin';

// Update the Routes section
<Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/problems" element={<Problems />} />
  <Route path="/analytics" element={<Analytics />} />
  <Route path="/admin" element={<Admin />} />
  <Route path="/settings" element={<Settings />} />
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>