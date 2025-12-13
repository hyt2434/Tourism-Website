const API_URL = "http://127.0.0.1:5000/api";

////////////////////////////////////////////////////////////////////////////////
// 🔥 NORMALIZER
////////////////////////////////////////////////////////////////////////////////
export function normalizePost(raw) {
  if (!raw) return null;

  return {
    id: raw.id,
    image: raw.image_url,                  
    caption: raw.content,                   
    hashtags: raw.tags || [],               
    
    user: {
      id: raw.author?.id,
      username: raw.author?.username,
      displayName: raw.author?.username,
      avatar: raw.author?.avatar || null
    },

    likes: raw.like_count || 0,
    comments: raw.comment_count || 0,
    timestamp: raw.created_at,
    linkedService: raw.linked_service || null,
  };
}

export function normalizePostArray(arr) {
  return Array.isArray(arr) ? arr.map(normalizePost) : [];
}

////////////////////////////////////////////////////////////////////////////////
// 📌 POSTS
////////////////////////////////////////////////////////////////////////////////

export const getAllPosts = async () => {
  const res = await fetch(`${API_URL}/social/posts`);
  const data = await res.json();
  if (!res.ok) throw data;
  return normalizePostArray(data.posts || data);
};

export const getPostById = async (postId) => {
  const res = await fetch(`${API_URL}/social/posts/${postId}`);
  const data = await res.json();
  if (!res.ok) throw data;
  return normalizePost(data);
};

export const searchPosts = async (query) => {
  if (!query?.trim()) return [];
  const res = await fetch(`${API_URL}/social/posts/search?q=${encodeURIComponent(query)}`);
  const data = await res.json();
  if (!res.ok) throw data;
  return normalizePostArray(data.posts || data);
};

export const createPost = async ({ authorEmail, content, imageUrl }) => {
  const res = await fetch(`${API_URL}/social/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      author_email: authorEmail,
      content,
      image_url: imageUrl
    })
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return normalizePost(data);
};

////////////////////////////////////////////////////////////////////////////////
// 📌 COMMENTS
////////////////////////////////////////////////////////////////////////////////

export const addComment = async (postId, { authorEmail, content }) => {
  const res = await fetch(`${API_URL}/social/posts/${postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      author_email: authorEmail,
      content
    })
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

////////////////////////////////////////////////////////////////////////////////
// 📌 LIKES
////////////////////////////////////////////////////////////////////////////////

export const toggleLike = async (postId, userEmail) => {
  const res = await fetch(`${API_URL}/social/posts/${postId}/like`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_email: userEmail })
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

////////////////////////////////////////////////////////////////////////////////
// 📌 STORIES
////////////////////////////////////////////////////////////////////////////////

export const getStories = async () => {
  const res = await fetch(`${API_URL}/social/stories`);
  const data = await res.json();
  if (!res.ok) throw data;
  return data.stories || data;
};

export const createStory = async ({ authorEmail, content, imageUrl, expiresAt }) => {
  const res = await fetch(`${API_URL}/social/stories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      author_email: authorEmail,
      content,
      image_url: imageUrl,
      expires_at: expiresAt
    })
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

////////////////////////////////////////////////////////////////////////////////
// 📌 TAGS
////////////////////////////////////////////////////////////////////////////////

export const getAllTags = async () => {
  const res = await fetch(`${API_URL}/social/tags`);
  const data = await res.json();
  if (!res.ok) throw data;
  return data.tags || data;
};

export const getPostsByTag = async (tagName) => {
  const res = await fetch(`${API_URL}/social/tags/${tagName}/posts`);
  const data = await res.json();
  if (!res.ok) throw data;
  return normalizePostArray(data.posts || data);
};

////////////////////////////////////////////////////////////////////////////////
// 📌 UPLOAD IMAGE
////////////////////////////////////////////////////////////////////////////////

export const uploadImage = async (file) => {
  if (!file) throw new Error("No file provided");

  const form = new FormData();
  form.append("image", file);

  const res = await fetch(`${API_URL}/social/upload`, {
    method: "POST",
    body: form
  });

  const data = await res.json();
  if (!res.ok) throw data;

  return data; 
};
