import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  AlertTriangle,
  Clock,
  LayoutGrid,
  LayoutList,
  Bell,
  Calendar,
  Users,
  Shield,
  Wind,
  Droplets,
  Flame,
  Plus,
  Send,
  CloudLightning,
  CloudRain,
  Tornado,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Modal from "../main-components/Model";
import PostForm from "./PostForm";

const PostView = () => {
  const SIDE_MENU_ITEMS = [
    { icon: Bell, label: "Notifications", count: 5 },
    { icon: Calendar, label: "Upcoming Events", count: 3 },
    { icon: Users, label: "Emergency Contacts", count: 8 },
    { icon: Shield, label: "Safety Guidelines", count: null },
  ];

  const [disasterTypes, setDisasterTypes] = useState([]);

  const [weather, setWeather] = useState({
    temperature: null,
    windSpeed: null,
    precipitation: null,
    loading: true,
    error: null,
  });

  const formatDate = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const timeDiff = now - postDate;
    const days = Math.floor(timeDiff / (1000 * 3600 * 24));
    const hours = Math.floor(timeDiff / (1000 * 3600));
    const minutes = Math.floor(timeDiff / (1000 * 60));

    if (days === 0) {
      if (hours < 1) return `${minutes}m`;
      return `${hours}h`;
    }
    if (days === 1) return "1d";
    return `${days}d`;
  };

  const SidebarMenu = ({ items, title }) => (
    <div className="glassmorphism rounded-xl w-[250px]  mb-4 text-left ">
      <h2 className="font-semibold text-gray-900 pl-2 mr-2 mb-4 border-b border-gray-200 pb-2">
        {title}
      </h2>
      <div className="space-y-2">
        {items.map((item, index) => (
          <button
            key={index}
            className="interactive-button  w-full flex items-center justify-around p-2 rounded-lg hover:bg-primary-50 transition-all duration-300"
          >
            <div className="flex items-center space-x-4 w-full ">
              <item.icon className="h-5 w-5 text-primary-600" />
              <span className="text-gray-700 w-auto text-[13px]">
                {item.label}
              </span>
            </div>
            {item.count !== null && (
              <span className="bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full text-xs">
                {item.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  const DisasterTypes = ({ items }) => (
    <div className="glassmorphism rounded-xl  w-[250px]  mb-4 text-left">
      <h2 className="font-semibold text-gray-900 pl-2 mr-2 mb-4 border-b border-gray-200 pb-2">
        Disaster Types
      </h2>
      <div className="space-y-2">
        {items.map((item, index) => (
          <button
            key={index}
            className={`interactive-button w-full flex items-center justify-between p-2 rounded-lg transition-all duration-300 ${
              item.active
                ? "bg-primary-100 text-primary-700"
                : "hover:bg-primary-50 text-gray-600"
            }`}
          >
            <div className="flex items-center space-x-3">
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </div>
            <span className="bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full text-xs">
              {item.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [shouldFocusSearch, setShouldFocusSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const currentUserId = "user1"; // Example, update accordingly

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/posts");
      const data = await response.json();
      const approvedPosts = Array.isArray(data)
        ? data
            .filter((post) => post.status === "approved")
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : [];
      setPosts(approvedPosts);
      console.log(approvedPosts);
    } catch (error) {
      toast.error("Error fetching posts: " + error.message);
      console.error("Error fetching posts:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    //Colombo, Sri Lanka coordinates Get Current Weather Update
    const lat = 6.9271;
    const lon = 79.8612;
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    )
      .then((res) => res.json())
      .then((data) => {
        setWeather({
          temperature: data.current_weather.temperature,
          windSpeed: data.current_weather.windspeed,
          precipitation: data.current_weather.precipitation ?? 0,
          loading: false,
          error: null,
        });
      })
      .catch((err) => {
        setWeather((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to fetch weather",
        }));
      });

    if (shouldFocusSearch) {
      searchInputRef.current?.focus();
      setShouldFocusSearch(false);
    }
    fetchPosts();
  }, [shouldFocusSearch]);

  const handlePostCreated = () => {
    setIsAddModalOpen(false);
    fetchPosts();
  };

  const filteredPosts = posts.filter((post) => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(searchTerm) ||
      post.description.toLowerCase().includes(searchTerm) ||
      post.category.toLowerCase().includes(searchTerm) ||
      post.location.toLowerCase().includes(searchTerm)
    );
  });

  const handleLike = async (postId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/posts/${postId}/like`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: currentUserId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to toggle like");
      }

      const updatedPost = await response.json();

      // Update local state with the updated post
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post._id === postId ? updatedPost : post))
      );
    } catch (error) {
      console.error("Error liking post:", error.message);
    }
  };

  const toggleComments = (postId) => {
    setShowComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleAddComment = async (postId, text) => {
    if (!text.trim()) return;

    const newComment = {
      user: "CurrentUser", // Replace with actual logged-in user
      text,
      createdAt: new Date().toISOString(),
    };

    // Optimistically update UI
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      )
    );
    try {
      const response = await fetch(`/api/posts/${postId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "CurrentUser", // Replace with actual logged-in user
          text,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      const updatedPost = await response.json();

      // Optionally, update the state with the new comment data from the backend (if needed)
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, comments: updatedPost.comments }
            : post
        )
      );
    } catch (error) {
      console.error("Error adding comment:", error);
      // Optionally handle the error (e.g., revert the optimistic update)
    }
  };

  const PostCard = ({ post, handleAddComment }) => (
    <div className="relative border rounded-xl mix-w-[500px] shadow-sm mt-2 bg-white overflow-hidden">
      {/* Header */}
      <div className="mx-5 flex items-center border-b justify-between   border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <div className="flex flex-col justify-start text-left">
            <p className="font-semibold text-gray-900">{post.title}</p>
            <p className="text-xs text-gray-500">
              {formatDate(post.createdAt)}
            </p>
          </div>
        </div>

        <div className="p-4">
          <div
            className={`px-3 py-1 rounded-full text-sm ${
              post.category === "Floods"
                ? "bg-blue-100 text-blue-800"
                : post.category === "Earthquakes"
                  ? "bg-yellow-100 text-yellow-800"
                  : post.category === "Landslides"
                    ? "bg-green-100 text-green-800"
                    : post.category === "Tornadoes"
                      ? "bg-orange-100 text-orange-800"
                      : post.category === "Wildfires"
                        ? "bg-red-100 text-red-800"
                        : post.category === "Hurricanes"
                          ? "bg-indigo-100 text-indigo-800"
                          : post.category === "Tsunami"
                            ? "bg-cyan-100 text-cyan-800"
                            : "bg-gray-100 text-gray-800"
            }`}
          >
            {post.category}
          </div>
        </div>
      </div>

      {/* Image */}
      <div className="overflow-hidden relative rounded-md shadow-md group mx-5 mt-2">
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full aspect-[8/5] rounded-md shadow-md object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {post.disasterDate && (
          <div className="absolute bottom-4 left-4 px-4 py-2 rounded-lg flex items-center space-x-2 bg-white/50 backdrop-blur-md border border-white/30 shadow-md">
            <Clock className="h-4 w-4 text-primary-600" />
            <span className="text-gray-900 text-sm font-medium">
              Expected: {new Date(post.disasterDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-5">
        <div className="flex items-center justify-between space-x-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleLike(post._id)}
              className={`interactive-button flex items-center space-x-1 transition-all duration-300 rounded-lg px-3 py-1 ${
                post.likes.includes(currentUserId)
                  ? "bg-red-100 text-red-500"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <ThumbsUp className="h-4 w-4" />
              <span className="text-[14px]">{post.likes.length}</span>
            </button>
            <button
              onClick={() => toggleComments(post._id)}
              className="interactive-button flex items-center space-x-1 text-gray-600 hover:bg-gray-100 transition-all duration-300 rounded-lg px-3 py-1"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-[14px]">{post.comments.length}</span>
            </button>
            <button className="interactive-button flex items-center space-x-1 text-gray-600 hover:bg-gray-100 transition-all duration-300 rounded-lg px-3 py-1 ml-auto">
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          <div
            className={`px-3 mr-3 py-1 rounded-full text-sm ${
              post.isUpcoming
                ? "bg-blue-100 text-blue-800"
                : "bg-red-100/80 text-red-800"
            } ${post.isUpcoming ? "pulse-animation" : ""}`}
          >
            {post.isUpcoming ? "Upcoming" : "Ongoing"}
          </div>
        </div>

        {/* Content */}
        <div className="mt-4 text-left">
          <h2 className="font-semibold text-gray-900 text-[16px]">
            {post.title}
          </h2>
          <p className="mt-1 text-gray-600 text-[14px]">{post.description}</p>
        </div>

        <hr className="border-t border-gray-200 my-4" />

        {/* Comments */}
        {showComments[post._id] && (
          <div className="mt-4 space-y-3">
            {post.comments.map((comment, index) => (
              <div
                key={index}
                className="flex space-x-2 text-left items-center bg-white rounded-[10px] shadow-sm"
              >
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200"></div>
                <div className="flex-1 glass-card rounded-2xl p-3">
                  <p className="font-medium text-sm text-gray-900">
                    {comment.user}
                  </p>
                  <p className="text-sm text-gray-600">{comment.text}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(comment.createdAt)}
                  </p>
                </div>
              </div>
            ))}

            {/* Comment input section */}
            <div className="flex relative items-center space-x-2 mt-3">
              <input
                type="text"
                className="w-full px-4 py-2 rounded-full border-[1px] text-[14px] border-green-200 focus:border-green-400 h-[38px] focus:outline-none focus:ring-0 focus:ring-green-200"
                placeholder="Add a comment..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.value) {
                    handleAddComment(post._id, e.target.value);
                    e.target.value = "";
                  }
                }}
                id={`comment-input-${post._id}`} // Unique ID for targeting
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById(
                    `comment-input-${post._id}`
                  );
                  if (input && input.value.trim()) {
                    handleAddComment(post._id, input.value);
                    input.value = ""; // Clear input after adding the comment
                  }
                }}
                className="p-2 absolute right-2 rounded-full bg-green-600 hover:bg-green-700 transition text-white"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-texture px-4 sm:px-6 lg:px-6 pt-0 ">
      <div className=" mx-auto ">
        {/* Fixed Header */}
        <div className="fixed top-0 left-0 w-full z-50 bg-texture bg-white py-4">
          <div className="flex justify-between items-center px-4">
            <div className="flex flex-col justify-start text-left">
              <h1 className="text-2xl font-semibold text-gray-700">
                Disaster Community
              </h1>
              <p className="text-sm text-gray-400 mt-0">
                Stay informed with the Community updates
              </p>
            </div>

            <div className="flex items-center space-x-2 glassmorphism rounded-lg p-1">
              <button
                onClick={() => {
                  setIsAddModalOpen(true);
                }}
                className=" hover:border-green-300 active:bg-green-100 z-10 w-[145px] h-[38px] mt-[1px] border border-gray-200 bg-white p-1 justify-center text-[#626262] hover:text-green-600 px-2 py-3 rounded-md transition-all duration-300 text-[14px] font-medium !rounded-button whitespace-nowrap cursor-pointer shadow-sm flex items-center"
              >
                <Plus className="mr-2" /> Create Post
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`interactive-button p-2 rounded-md transition-all duration-300 ${
                  viewMode === "list"
                    ? "bg-green-100 text-green-500"
                    : "text-gray-600 hover:bg-primary-50"
                }`}
              >
                <LayoutList className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`interactive-button p-2 rounded-md transition-all duration-300 ${
                  viewMode === "grid"
                    ? "bg-green-100 text-green-500"
                    : "text-gray-600 hover:bg-primary-50"
                }`}
              >
                <LayoutGrid className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-row  gap-8   ">
          {/* Left Sidebar - Sticky */}
          <div className="hidden lg:block lg:fixed top-4 flex-shrink-0 h-screen w-[300px]">
            <div className="sticky top-28 space-y-6 ">
              <SidebarMenu
                items={SIDE_MENU_ITEMS}
                title="Quick Access"
                className="border-b border-gray-200 pb-2"
              />
              <DisasterTypes items={disasterTypes} />
            </div>
          </div>

          {/* Main Content */}
          <div
            className={`flex-1 pl-4 pr-10 pt-[80px] ml-[260px] mr-[260px]  ${viewMode === "list" ? "space-y-8" : "grid grid-cols-1 md:grid-cols-2 gap-8"}`}
          >
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>

          {/* Right Sidebar - Sticky, Hidden in Grid View */}
          <div
            className={`hidden pt-[90px] ${viewMode === "list" ? "xl:block fixed right-0 " : ""} w-80 flex-shrink-0`}
          >
            <div className="sticky top-28 space-y-6">
              <div className="glass-card text-left rounded-xl p-4 ">
                <h2 className="font-semibold text-[16px] ml-4 text-gray-900 mb-4 border-b border-gray-200 pb-2">
                  Emergency Contacts
                </h2>
                <div className="space-y-3 mx-4">
                  <button className="interactive-button w-full flex items-center space-x-3 p-2 rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="text-red-600 font-semibold">911</span>
                    </div>
                    <div className="text-left ">
                      <p className="font-medium text-[14px] text-gray-900">
                        Emergency Services
                      </p>
                      <p className="text-sm text-gray-600">
                        For immediate assistance
                      </p>
                    </div>
                  </button>
                  <button className="interactive-button w-full flex items-center space-x-3 p-2 rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900 text-[14px]">
                        Local Police
                      </p>
                      <p className="text-sm text-gray-600">
                        Non-emergency: 555-0123
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="glass-card rounded-xl p-4 mx-3">
                <h2 className="font-semibold text-gray-900 pl-2 mr-2 mb-4 border-b text-left text-[16px] border-gray-200 pb-2">
                  Weather Updates
                </h2>
                <div className="space-y-2 text-[14px]">
                  {weather.loading ? (
                    <div className="text-gray-400">Loading weather...</div>
                  ) : weather.error ? (
                    <div className="text-red-400">{weather.error}</div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between p-2 hover:bg-primary-50 rounded-lg transition-all duration-300">
                        <span className="text-gray-600">Temperature</span>
                        <span className="font-medium text-gray-900">
                          {weather.temperature}°C
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 hover:bg-primary-50 rounded-lg transition-all duration-300">
                        <span className="text-gray-600">Wind Speed</span>
                        <span className="font-medium text-gray-900">
                          {weather.windSpeed} km/h
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 hover:bg-primary-50 rounded-lg transition-all duration-300">
                        <span className="text-gray-600">Precipitation</span>
                        <span className="font-medium text-gray-900">
                          {weather.precipitation} mm
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Post"
      >
        <PostForm
          onPostCreated={handlePostCreated}
          onUpdateSuccess={fetchPosts}
        />
      </Modal>
    </div>
  );
};

export default PostView;
