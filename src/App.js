import { useState } from "react";
import Login from "./Login";
import PharmacyInventory from "./PharmacyInventory";

function App() {
  const [user, setUser] = useState(null);

  function handleLogin(userData) {
    setUser(userData);
  }

  function handleLogout() {
    setUser(null);
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return <PharmacyInventory user={user} onLogout={handleLogout} />;
}

export default App;