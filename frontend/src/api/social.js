const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Get current user from localStorage
 */
const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

/**
 * Get authorization headers if user is logged in
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

/**
 * Get all posts
 */
export const getPosts = async () => {
  const response = await fetch(`${API_BASE_URL}/api/social/posts`);
  if (!response.ok) throw new Error('Failed to fetch posts');
  return response.json();
};

/**
 * Search posts by query (supports hashtags with #)
 */
export const searchPosts = async (query) => {
  const response = await fetch(`${API_BASE_URL}/api/social/posts/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error('Failed to search posts');
  return response.json();
};

/**
 * Get a single post by ID
 */
export const getPost = async (postId) => {
  const response = await fetch(`${API_BASE_URL}/api/social/posts/${postId}`);
  if (!response.ok) throw new Error('Failed to fetch post');
  return response.json();
};

/**
 * Create a new post
 */
export const createPost = async (data) => {
  const user = getCurrentUser();
  if (!user || !user.email) {
    throw new Error('User must be logged in to create a post');
  }

  const response = await fetch(`${API_BASE_URL}/api/social/posts`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      ...data,
      author_email: user.email,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create post');
  }
  return response.json();
};

/**
 * Upload an image file
 */
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_BASE_URL}/api/social/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload image');
  }
  return response.json();
};

/**
 * Add a comment to a post
 */
export const addComment = async (postId, content) => {
  const user = getCurrentUser();
  if (!user || !user.email) {
    throw new Error('User must be logged in to comment');
  }

  const response = await fetch(`${API_BASE_URL}/api/social/posts/${postId}/comments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      author_email: user.email,
      content,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add comment');
  }
  return response.json();
};

/**
 * Toggle like on a post
 */
export const toggleLike = async (postId) => {
  const user = getCurrentUser();
  if (!user || !user.email) {
    throw new Error('User must be logged in to like');
  }

  const response = await fetch(`${API_BASE_URL}/api/social/posts/${postId}/like`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      user_email: user.email,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to toggle like');
  }
  return response.json();
};

/**
 * Get all stories
 */
export const getStories = async () => {
  const response = await fetch(`${API_BASE_URL}/api/social/stories`);
  if (!response.ok) throw new Error('Failed to fetch stories');
  return response.json();
};

/**
 * Create a story
 */
export const createStory = async (data) => {
  const user = getCurrentUser();
  if (!user || !user.email) {
    throw new Error('User must be logged in to create a story');
  }

  const response = await fetch(`${API_BASE_URL}/api/social/stories`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      ...data,
      author_email: user.email,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create story');
  }
  return response.json();
};

/**
 * Get all tags
 */
export const getTags = async () => {
  const response = await fetch(`${API_BASE_URL}/api/social/tags`);
  if (!response.ok) throw new Error('Failed to fetch tags');
  return response.json();
};

/**
 * Get posts by tag name
 */
export const getPostsByTag = async (tagName) => {
  const response = await fetch(`${API_BASE_URL}/api/social/tags/${encodeURIComponent(tagName)}/posts`);
  if (!response.ok) throw new Error('Failed to fetch posts by tag');
  return response.json();
};

/**
 * Search hashtags from social_hashtag table
 */
export const searchHashtags = async (query, limit = 20) => {
  const response = await fetch(`${API_BASE_URL}/api/social/hashtags/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  if (!response.ok) throw new Error('Failed to search hashtags');
  return response.json();
};

