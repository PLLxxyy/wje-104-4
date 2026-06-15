import { Navigate, Route, Routes } from "react-router-dom";
import { ROUTES } from "../constants/app";
import { Editor } from "../pages/Editor";
import { Gallery } from "../pages/Gallery";
import { Home } from "../pages/Home";

export const AppRouter = (): JSX.Element => (
  <Routes>
    <Route path={ROUTES.home} element={<Home />} />
    <Route path={ROUTES.editor} element={<Editor />} />
    <Route path={`${ROUTES.editor}/:artworkId`} element={<Editor />} />
    <Route path={ROUTES.gallery} element={<Gallery />} />
    <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
  </Routes>
);

