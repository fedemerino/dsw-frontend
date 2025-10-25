import { Route, Routes, BrowserRouter } from 'react-router-dom';
import { Home } from './components/home/home';
import { Property } from './components/properties/property';

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/listing/:id' element={<Property />} />
      </Routes>
    </BrowserRouter>
  );
};
