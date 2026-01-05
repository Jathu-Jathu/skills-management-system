import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import PersonnelList from './components/Personnel/PersonnelList';
import PersonnelForm from './components/Personnel/PersonnelForm';
import PersonnelDetail from './components/Personnel/PersonnelDetail';
import SkillsList from './components/Skills/SkillsList';
import SkillForm from './components/Skills/SkillForm';
import ProjectsList from './components/Projects/ProjectsList';
import ProjectForm from './components/Projects/ProjectForm';
import ProjectDetail from './components/Projects/ProjectDetail';
import MatchingForm from './components/Matching/MatchingForm';
import AdvancedSearch from './components/Search/AdvancedSearch';
import './styles/App.css';
import './styles/components.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/personnel" />} />
          <Route path="personnel" element={<PersonnelList />} />
          <Route path="personnel/new" element={<PersonnelForm />} />
          <Route path="personnel/:id" element={<PersonnelDetail />} />
          <Route path="personnel/:id/edit" element={<PersonnelForm />} />
          <Route path="skills" element={<SkillsList />} />
          <Route path="skills/new" element={<SkillForm />} />
          <Route path="skills/:id/edit" element={<SkillForm />} />
          <Route path="projects" element={<ProjectsList />} />
          <Route path="projects/new" element={<ProjectForm />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="projects/:id/edit" element={<ProjectForm />} />
          <Route path="matching" element={<MatchingForm />} />
          <Route path="advanced-search" element={<AdvancedSearch />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;