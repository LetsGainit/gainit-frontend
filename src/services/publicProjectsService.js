import publicApi from './publicApi';

// Public API functions for Search Projects page (no authentication required)

export const getPublicActiveProjects = async () => {
  try {
    const response = await publicApi.get('/projects/active');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch public active projects:', error);
    throw error;
  }
};

export const getPublicTemplateProjects = async () => {
  try {
    const response = await publicApi.get('/projects/templates');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch public template projects:', error);
    throw error;
  }
};
