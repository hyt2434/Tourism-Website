const API_URL = "http://127.0.0.1:5000/api";

// Posts
export const getAllPosts = async () => {
  try {
    const response = await fetch(`${API_URL}/social/posts`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

export const searchPosts = async (query) => {
  if (!query?.trim()) {
    return [];
  }
  
  try {
    const response = await fetch(`${API_URL}/social/posts/search?q=${encodeURIComponent(query.trim())}`);
    const data = await response.json();
    
    if (!response.ok) {
      // If we got an error response from the server
      const error = new Error(data.message || 'Search request failed');
      error.response = { status: response.status, data };
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error searching posts:', error);
    throw error;
  }
};

export const createPost = async ({ authorEmail, content, imageUrl }) => {
  try {
    const response = await fetch(`${API_URL}/social/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        author_email: authorEmail,
        content,
        image_url: imageUrl
      }),
    });
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

export const getPostById = async (postId) => {
  try {
    const response = await fetch(`${API_URL}/social/posts/${postId}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching post:', error);
    throw error;
  }
};

// Comments
export const addComment = async (postId, { authorEmail, content }) => {
  try {
    const response = await fetch(`${API_URL}/social/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        author_email: authorEmail,
        content
      }),
    });
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

// Likes
export const toggleLike = async (postId, userEmail) => {
  try {
    const response = await fetch(`${API_URL}/social/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_email: userEmail
      }),
    });
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};

// Stories
export const getStories = async () => {
  try {
    const response = await fetch(`${API_URL}/social/stories`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching stories:', error);
    throw error;
  }
};

export const createStory = async ({ authorEmail, content, imageUrl, expiresAt }) => {
  try {
    const response = await fetch(`${API_URL}/social/stories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        author_email: authorEmail,
        content,
        image_url: imageUrl,
        expires_at: expiresAt
      }),
    });
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error creating story:', error);
    throw error;
  }
};

// Hashtags
export const getAllTags = async () => {
  try {
    const response = await fetch(`${API_URL}/social/tags`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw error;
  }
};

export const getPostsByTag = async (tagName) => {
  try {
    const response = await fetch(`${API_URL}/social/tags/${tagName}/posts`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching posts by tag:', error);
    throw error;
  }
};

// Upload image file to backend (returns { url })
export const uploadImage = async (file) => {
  if (!file) throw new Error('No file provided');
  try {
    const form = new FormData();
    form.append('image', file);

    const response = await fetch(`${API_URL}/social/upload`, {
      method: 'POST',
      body: form,
    });

    const data = await response.json();
    if (!response.ok) {
      const err = new Error(data.message || 'Image upload failed');
      err.response = { status: response.status, data };
      throw err;
    }
    return data; // { url }
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};