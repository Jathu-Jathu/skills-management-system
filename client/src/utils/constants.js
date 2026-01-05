export const experienceLevels = ['Junior', 'Mid-Level', 'Senior'];

export const proficiencyLevels = [
  { value: 'Beginner', label: 'Beginner', level: 1 },
  { value: 'Intermediate', label: 'Intermediate', level: 2 },
  { value: 'Advanced', label: 'Advanced', level: 3 },
  { value: 'Expert', label: 'Expert', level: 4 }
];

export const skillCategories = [
  'Programming Language',
  'Framework',
  'Tool',
  'Soft Skill',
  'Database',
  'Cloud'
];

export const projectStatuses = ['Planning', 'Active', 'Completed'];

export const proficiencyMap = {
  'Beginner': 1,
  'Intermediate': 2,
  'Advanced': 3,
  'Expert': 4
};

export const getProficiencyLevel = (proficiency) => {
  return proficiencyMap[proficiency] || 0;
};

export const statusColors = {
  'Planning': '#ffd166',
  'Active': '#06d6a0',
  'Completed': '#118ab2'
};

export const experienceColors = {
  'Junior': '#ffe066',
  'Mid-Level': '#a3d9ff',
  'Senior': '#b5ead7'
};
