import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminBookManager from "./pages/AdminBookManager";
import Catalog from "./components/Catalog";
import Header from "./components/Header";
import PromoBoxes from "./components/PromoBoxes";
import { NewOnSite } from './components/NewOnSite';
import { NewInMarket } from './components/NewInMarket';
import CategoriesView from "./components/CategoriesView";
import BookDetails from "./components/BookDetails";
import NotFound from "./components/NotFound";

function App() {
  return (
    <Router>
      <div dir="rtl" className="font-sans">
        <Header />
        <Routes>
          <Route
            path="/"
            element={
              <div>
                <NewOnSite />
                <PromoBoxes />
                <NewInMarket />
                <Catalog />
              </div>
            }
          />
          <Route path="/admin" element={<AdminBookManager />} />
          <Route path="/categories" element={<CategoriesView />} />
          <Route path="/books/:id" element={<BookDetails />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;