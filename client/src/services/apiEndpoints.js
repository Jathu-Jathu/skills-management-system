import API from './api';

export const personnelAPI = {
  getAll: () => API.get('/personnel'),
  getById: (id) => API.get(`/personnel/${id}`),
  create: (data) => API.post('/personnel', data),
  update: (id, data) => API.put(`/personnel/${id}`, data),
  delete: (id) => API.delete(`/personnel/${id}`),
  assignSkill: (personnelId, skillData) => 
    API.post(`/personnel/${personnelId}/skills`, skillData),
  removeSkill: (personnelId, skillId) =>
    API.delete(`/personnel/${personnelId}/skills/${skillId}`)
};

export const skillsAPI = {
  getAll: () => API.get('/skills'),
  create: (data) => API.post('/skills', data),
  update: (id, data) => API.put(`/skills/${id}`, data),
  delete: (id) => API.delete(`/skills/${id}`)
};

export const projectsAPI = {
  getAll: () => API.get('/projects'),
  getById: (id) => API.get(`/projects/${id}`),
  create: (data) => API.post('/projects', data),
  update: (id, data) => API.put(`/projects/${id}`, data),
  delete: (id) => API.delete(`/projects/${id}`)
};

export const matchingAPI = {
  getMatchingPersonnel: (projectId) => 
    API.get(`/matching/project/${projectId}`),
  searchBySkills: (skillIds) =>
    API.get(`/matching/search?skills=${skillIds.join(',')}`)
};





