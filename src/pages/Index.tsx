import ProtectedRoute from "@/components/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";

const Index = () => {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
};

export default Index;
