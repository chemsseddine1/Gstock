import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Journal from "./Components/Journal";
import Inventory from "./Components/Inventory";

import Stock from "./Components/Stock";

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Journal />} />
        <Route path='/inventory' element={<Inventory />} />
        <Route path='/stock' element={<Stock />} />
      </Routes>
    </Router>
  );
}

export default App;
