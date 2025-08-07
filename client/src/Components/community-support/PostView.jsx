import React, { useState, useEffect, useRef, useContext } from "react";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
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
  Search,
  X,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Info,
  Activity,
  MapPin,
  Award,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Modal from "../main-components/Model";
import PostForm from "./PostForm";

const PostView = () => {
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [shouldFocusSearch, setShouldFocusSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const currentUserId = "user1";
  const [disasterTypes, setDisasterTypes] = useState([]);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [currentSharedPost, setCurrentSharedPost] = useState(null);
  const { isAuthenticated, user, logout } = useContext(AuthContext);

  const SIDE_MENU_ITEMS = [
    { icon: Bell, label: "Notifications", count: 5 },
    { icon: Calendar, label: "Upcoming Events", count: 3 },
    { icon: Users, label: "Emergency Contacts", count: 8 },
    { icon: Shield, label: "Safety Guidelines", count: null },
  ];

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
      user: user?.name || "Anonymous User",
      profile_img: user?.profile_img || "default_profile.png",
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
      const response = await fetch(
        `http://localhost:5000/api/posts/${postId}/comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user?.name || "Anonymous User",
            text,
            profile_img: user?.profile_img || "default_profile.png",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      const updatedPost = await response.json();

      // Update the state with backend data
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post._id === postId ? updatedPost : post))
      );
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleShareClick = (post) => {
    setCurrentSharedPost(post);
    setShareModalOpen(true);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copied to clipboard");
  };

  const PostCard = ({ post, handleAddComment }) => (
    <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col justify-start text-left">
            <p className="font-medium text-gray-900 text-sm">{post.title}</p>
            <p className="text-xs text-gray-500">
              {formatDate(post.createdAt)}
            </p>
          </div>
        </div>

        <div
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            post.category === "Floods"
              ? "bg-blue-100 text-blue-700"
              : post.category === "Earthquakes"
                ? "bg-yellow-100 text-yellow-700"
                : post.category === "Wildfires"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700"
          }`}
        >
          {post.category}
        </div>
      </div>

      {/* Image */}
      <div className="relative">
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full aspect-[4/3] object-cover"
        />
        {post.isUpcoming && (
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium bg-black/60 text-white backdrop-blur-sm flex items-center space-x-1">
            <Clock className="h-3 w-3 mr-1" />
            <span>
              Upcoming: {new Date(post.disasterDate).toLocaleDateString()}
            </span>
          </div>
        )}
        {post.status === "ongoing" && (
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium bg-red-500/80 text-white backdrop-blur-sm flex items-center space-x-1 animate-pulse">
            <AlertTriangle className="h-3 w-3 mr-1" />
            <span>LIVE</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 text-left">
        <h2 className="font-medium text-gray-900 text-base">{post.title}</h2>
        <p className="mt-1 text-gray-600 text-sm line-clamp-2">
          {post.description}
        </p>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleLike(post._id)}
            className={`flex items-center ${
              post.likes.includes(currentUserId)
                ? "text-red-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <ThumbsUp className="h-5 w-5" />
            <span className="ml-1 text-xs">{post.likes.length}</span>
          </button>
          <button
            onClick={() => toggleComments(post._id)}
            className="flex items-center text-gray-500 hover:text-gray-700"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="ml-1 text-xs">{post.comments.length}</span>
          </button>
          <button
            onClick={() => handleShareClick(post)}
            className="flex items-center text-gray-500 hover:text-gray-700"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>

        <button className="text-xs text-blue-600 font-medium">
          See Details
        </button>
      </div>

      {/* Comments Section */}
      {showComments[post._id] && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          {post.comments.map((comment, index) => (
            <div
              key={index}
              className="flex space-x-2 items-center mb-3 last:mb-0"
            >
              <div className="w-7 h-7 rounded-full items-center bg-gray-200 flex-shrink-0">
                <img
                  src={comment.profile_img}
                  alt="profile"
                  className="rounded-full w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-row items-center justify-between w-full pl-1 pr-5">
                <div className="flex flex-col text-[12px] text-left mr-5">
                  <span className="font-medium text-gray-900">
                    {comment.user}
                  </span>
                  <span className="text-gray-700">{comment.text}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatDate(comment.createdAt)}
                </p>
              </div>
            </div>
          ))}

          <div className="flex items-center mt-3 relative">
            <input
              type="text"
              className="w-full text-sm border border-gray-200 rounded-full py-1.5 pl-3 pr-10 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Add a comment..."
              id={`comment-input-${post._id}`}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const input = document.getElementById(
                    `comment-input-${post._id}`
                  );
                  if (input && input.value.trim()) {
                    handleAddComment(post._id, input.value);
                    input.value = "";
                  }
                }
              }}
            />
            <button
              className="absolute right-2 text-blue-500 mr-2 transition-all duration-300"
              onClick={() => {
                const input = document.getElementById(
                  `comment-input-${post._id}`
                );
                if (input && input.value.trim()) {
                  handleAddComment(post._id, input.value);
                  input.value = "";
                }
              }}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const DisasterStories = () => (
    <div className="w-full overflow-x-auto py-4 mb-6">
      <div className="flex space-x-4 px-2">
        {[
          {
            icon: <Flame className="text-red-500" />,
            label: "Wildfires",
            active: true,
            count: 3,
            description:
              "Active wildfires across forests and residential areas",
          },
          {
            icon: <Droplets className="text-blue-500" />,
            label: "Floods",
            count: 12,
            description: "Flooding in coastal and riverine regions",
          },
          {
            icon: <CloudLightning className="text-purple-500" />,
            label: "Storms",
            count: 7,
            description: "Severe thunderstorms and weather warnings",
          },
          {
            icon: <Wind className="text-yellow-600" />,
            label: "Tornado",
            count: 2,
            description: "Tornado warnings and affected areas",
          },
          {
            icon: <Shield className="text-green-500" />,
            label: "Updates",
            count: 5,
            description: "Latest safety updates and recovery efforts",
          },
        ].map((story, index) => (
          <HoverCard key={index} openDelay={200} closeDelay={100}>
            <HoverCardTrigger asChild>
              <button className="flex flex-col items-center focus:outline-none">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center ${story.active ? "ring-2 ring-offset-2 ring-red-500" : "ring-1 ring-gray-200"} mb-1 bg-gradient-to-br from-gray-50 to-gray-100 p-0.5 hover:shadow-md transition-all`}
                >
                  <div className="w-full h-full rounded-full flex items-center justify-center bg-white">
                    {story.icon}
                  </div>
                </div>
                <span className="text-xs text-gray-700">{story.label}</span>
              </button>
            </HoverCardTrigger>

            <HoverCardContent className="w-64 p-0 shadow-lg bg-white">
              <div className="p-3 border-b border-gray-100">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center bg-${story.icon.props.className.split("-")[1]}-50 mr-3`}
                  >
                    {story.icon}
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900">{story.label}</h4>
                    <p className="text-xs text-gray-500">
                      {story.count} active events
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3">
                <p className="text-sm text-left text-gray-600">
                  {story.description}
                </p>
                <button className="mt-4 text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center">
                  View all {story.label.toLowerCase()}
                  <svg
                    className="w-3 h-3 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </HoverCardContent>
          </HoverCard>
        ))}
      </div>
    </div>
  );

  const RightSidebar = () => {
    // Sample data for the disaster trend chart
    const chartData = {
      months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      data: [
        { name: "Floods", values: [3, 5, 4, 7, 8, 12] },
        { name: "Wildfires", values: [2, 1, 3, 4, 2, 3] },
        { name: "Storms", values: [4, 3, 5, 6, 7, 7] },
      ],
    };

    return (
      <div className="sticky top-0 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-100 pr-2">
        {/* Disaster Trends Chart */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
          {/* Chart Header with Gradient */}
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-2 text-white">
            <div className="flex items-center justify-between text-left">
              <div>
                <h3 className="font-medium text-white">Disaster Trends</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Incident frequency over time
                </p>
              </div>
              <select className="text-xs border-0 rounded-md py-1 px-2 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 transition-colors focus:outline-none focus:ring-1 focus:ring-white/30">
                <option>Last 6 months</option>
                <option>Last year</option>
                <option>All time</option>
              </select>
            </div>
          </div>

          {/* Chart Content */}
          <div className="p-4">
            {/* Chart Grid */}
            <div className="relative h-48 mb-2">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[0, 1, 2, 3].map((_, i) => (
                  <div key={i} className="w-full h-px bg-gray-100"></div>
                ))}
              </div>

              {/* Chart Bars */}
              <div className="h-full flex items-end space-x-2">
                {chartData.data[0].values.map((value, index) => (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center group"
                  >
                    <div className="w-full flex flex-col items-center space-y-0.5 relative">
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full mb-2 z-10 w-[100px] bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Floods: {chartData.data[0].values[index]}
                        <br />
                        Wildfires: {chartData.data[1].values[index]}
                        <br />
                        Storms: {chartData.data[2].values[index]}
                      </div>

                      {/* Stacked bars with hover effect */}
                      <div
                        className="w-full bg-blue-400 rounded-t group-hover:bg-blue-500 transition-colors duration-200"
                        style={{
                          height: `${chartData.data[0].values[index] * 5}px`,
                        }}
                      ></div>
                      <div
                        className="w-full bg-red-400 rounded-t group-hover:bg-red-500 transition-colors duration-200"
                        style={{
                          height: `${chartData.data[1].values[index] * 5}px`,
                        }}
                      ></div>
                      <div
                        className="w-full bg-purple-400 rounded-t group-hover:bg-purple-500 transition-colors duration-200"
                        style={{
                          height: `${chartData.data[2].values[index] * 5}px`,
                        }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-gray-600 mt-2">
                      {chartData.months[index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-100 pt-3">
              <div className="text-center">
                <p className="text-xs text-gray-500">Total Floods</p>
                <p className="text-lg font-semibold text-blue-500">
                  {chartData.data[0].values.reduce((a, b) => a + b, 0)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Total Wildfires</p>
                <p className="text-lg font-semibold text-red-500">
                  {chartData.data[1].values.reduce((a, b) => a + b, 0)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Total Storms</p>
                <p className="text-lg font-semibold text-purple-500">
                  {chartData.data[2].values.reduce((a, b) => a + b, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Alert Status Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
          {/* Header with subtle gradient */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-3 text-white">
            <div className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              <h3 className="font-medium">Alert Status</h3>
            </div>
          </div>

          <div className="p-4">
            <div className="space-y-3 text-left">
              {/* Low Risk - Modern Card */}
              <div className="group flex items-center  justify-between p-3 bg-gradient-to-r from-green-50 to-green-50/50 rounded-xl border border-green-100 hover:shadow-md transition-all duration-200">
                <div className="flex items-center ">
                  <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <Shield className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-700">
                      Low Risk
                    </p>
                    <p className="text-xs text-green-600/70">
                      Normal operational status
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="px-3 py-1 rounded-full text-xs font-medium text-green-600 bg-green-100 flex items-center">
                    3 <span className="ml-1 hidden sm:inline">regions</span>
                  </span>
                </div>
              </div>

              {/* Medium Risk - Modern Card */}
              <div className="group flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-yellow-50/50 rounded-xl border border-yellow-100 hover:shadow-md transition-all duration-200">
                <div className="flex items-center">
                  <div className="w-9 h-9 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                    <Activity className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-yellow-700">
                      Medium Risk
                    </p>
                    <p className="text-xs text-yellow-600/70">
                      Enhanced monitoring active
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="px-3 py-1 rounded-full text-xs font-medium text-yellow-600 bg-yellow-100 flex items-center">
                    5 <span className="ml-1 hidden sm:inline">regions</span>
                  </span>
                </div>
              </div>

              {/* High Risk - Modern Card with attention-grabbing element */}
              <div className="group flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-red-50/50 rounded-xl border border-red-100 hover:shadow-md transition-all duration-200">
                <div className="flex items-center">
                  <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center mr-3 relative">
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75"></span>
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                    <Bell className="h-4 w-4 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-700">
                      High Risk
                    </p>
                    <p className="text-xs text-red-600/70">
                      Immediate attention required
                    </p>
                  </div>
                </div>
                <div className="flex items-center ">
                  <span className="px-3 py-1 rounded-full text-xs font-medium text-red-600 bg-red-100 flex items-center">
                    2 <span className="ml-1 hidden sm:inline">regions</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Optional view all button */}
            <button className="w-full mt-3 text-xs  text-gray-500 hover:text-gray-700 font-medium flex items-center justify-center">
              View detailed risk assessment
              <svg
                className="ml-1 w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-3 text-white">
            <div className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              <h3 className="font-medium">Recent Activity</h3>
            </div>
          </div>

          <div className="p-4">
            <div className="space-y-4">
              {[
                {
                  icon: Bell,
                  color: "text-blue-500 bg-blue-50",
                  title: "Flood warning updated",
                  time: "2h ago",
                  location: "Eastern Province",
                },
                {
                  icon: Users,
                  color: "text-green-500 bg-green-50",
                  title: "5 new volunteers joined",
                  time: "5h ago",
                  location: "Colombo Region",
                },
                {
                  icon: MapPin,
                  color: "text-red-500 bg-red-50",
                  title: "New evacuation route added",
                  time: "1d ago",
                  location: "Southern Province",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-2 text-left rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                  <div
                    className={`w-10 h-10 rounded-full ${item.color.split(" ")[1]} flex items-center justify-center flex-shrink-0 shadow-sm`}
                  >
                    <item.icon
                      className={`h-5 w-5 ${item.color.split(" ")[0]}`}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {item.title}
                    </p>
                    <div className="flex items-center mt-1.5">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full mr-2">
                        {item.time}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center">
                        <MapPin className="h-3 w-3 mr-0.5" /> {item.location}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100">
              <button className="w-full  text-xs  text-gray-500 hover:text-gray-700 font-medium flex items-center justify-center">
                View all activity
                <svg
                  className="ml-1 w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Community Heroes */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-medium text-gray-800 mb-3 ">Community Heroes</h3>

          <div className="space-y-3">
            {[
              {
                name: "Sarah Johnson",
                contribution: "Rescued 5 families during floods",
                avatar: "SJ",
              },
              {
                name: "Mike Chen",
                contribution: "Organized emergency supplies",
                avatar: "MC",
              },
              {
                name: "Priya Sharma",
                contribution: "Created evacuation maps",
                avatar: "PS",
              },
            ].map((hero, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-medium text-sm">
                  {hero.avatar}
                </div>
                <div>
                  <p className="text-sm text-gray-800 font-medium text-left">
                    {hero.name}
                  </p>
                  <p className="text-xs text-gray-500">{hero.contribution}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 text-xs py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 font-medium">
            Become a volunteer
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full ">
      {/* Header */}

      <header className="sticky top-0 z-50 ">
        <div className=" mx-5">
          {/* Main Header Content */}
          <div className="px-4 py-2 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-green-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                GuardianEarth
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              {/* Search Bar - New sticky top search */}
              <div className="relative  border-gray-100 py-2 px-4  min-w-[350px] text-[14px]">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search disasters, locations, categories..."
                    className="w-full pl-10 pr-4 py-2 border h-[35px] outline-none ring-0 border-gray-200 rounded-lg bg-gray-50 focus:ring-1 focus:ring-green-500 focus:border-transparent focus:bg-white transition-colors"
                    ref={searchInputRef}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-md px-4 py-1.5 text-sm font-medium flex items-center"
              >
                <Plus className="h-4 w-4 mr-1.5" /> Report
              </button>
              <button className="text-gray-500 hover:text-gray-700">
                <Bell className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className=" mx-auto px-4 grid grid-cols-1 md:grid-cols-[330px_2fr_1fr] gap-4 overflow-hidden max-h-[calc(100vh-5rem)] scrollbar-hide ">
        {/* Left Sidebar - For Tablet & Desktop */}
        <div className="hidden md:block md:col-span-1  ">
          <div className="sticky top-0 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-100 pr-2 scrollbar-track-gray-50 scrollbar-thumb-rounded-full ">
            {/* <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
              <h3 className="font-medium text-gray-900 mb-3">Disaster Types</h3>
              <hr className="my-2 border-t border-gray-100" />

              <div className="space-y-1">
                {[
                  {
                    icon: Droplets,
                    label: "Floods",
                    count: 12,
                    color: "text-blue-500 bg-blue-50",
                  },
                  {
                    icon: CloudLightning,
                    label: "Storms",
                    count: 7,
                    color: "text-purple-500 bg-purple-50",
                  },
                  {
                    icon: Flame,
                    label: "Wildfires",
                    count: 3,
                    color: "text-red-500 bg-red-50",
                  },
                ].map((item, index) => (
                  <button
                    key={index}
                    className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-lg ${item.color.split(" ")[1]} flex items-center justify-center mr-2`}
                      >
                        <item.icon
                          className={`h-4 w-4 ${item.color.split(" ")[0]}`}
                        />
                      </div>
                      <span className="text-sm text-gray-700">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {item.count}
                    </span>
                  </button>
                ))}
              </div>
            </div> */}
            <div className="bg-white rounded-lg shadow-sm p-5 mb-4">
              <h3 className="font-medium text-gray-800 mb-4   ">
                Disaster Types
              </h3>

              <div className="space-y-2">
                {[
                  {
                    icon: Flame,
                    label: "Wildfires",
                    count: 3,
                    color: "text-red-500",
                  },
                  {
                    icon: Droplets,
                    label: "Floods",
                    count: 12,
                    color: "text-blue-500",
                  },
                  {
                    icon: CloudLightning,
                    label: "Storms",
                    count: 7,
                    color: "text-purple-500",
                  },
                ].map((item, index) => (
                  <button
                    key={index}
                    className="flex items-center justify-between w-full p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <item.icon className={`h-4 w-4 ${item.color} mr-3`} />
                      <span className="text-sm text-gray-600">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{item.count}</span>
                  </button>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <button className="text-xs text-gray-500 hover:text-gray-700 font-medium">
                  View all categories
                </button>
              </div>
            </div>

            {/* <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-medium text-gray-900 mb-3">
                Weather Updates
              </h3>
              {weather.loading ? (
                <div className="animate-pulse">
                  <div className="h-10 bg-gray-200 rounded mb-2"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mr-3">
                      <CloudRain className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Temperature</p>
                      <p className="text-lg font-medium text-gray-900">
                        {weather.temperature}°C
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center mr-3">
                      <Wind className="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Wind Speed</p>
                      <p className="text-lg font-medium text-gray-900">
                        {weather.windSpeed} km/h
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div> */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              {/* Weather Card Header with Gradient */}
              <div className="bg-gradient-to-r from-blue-500 to-sky-400 p-2 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Weather Updates</h3>
                  <span className="text-xs opacity-80">Colombo, Sri Lanka</span>
                </div>
              </div>

              {weather.loading ? (
                <div className="p-6 animate-pulse space-y-4">
                  <div className="h-12 bg-gray-200 rounded-lg mb-2"></div>
                  <div className="h-12 bg-gray-200 rounded-lg"></div>
                </div>
              ) : (
                <div className="p-5">
                  {/* Main Weather Display */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center mr-4 shadow-sm">
                        <CloudRain className="h-8 w-8 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-gray-800">
                          {weather.temperature}°C
                        </p>
                        <p className="text-sm text-gray-500">
                          Feels like {Math.round(weather.temperature - 2)}°C
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-600">Today</p>
                      <p className="text-xs text-gray-500">
                        {new Date().toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Weather Details */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mr-3">
                          <Wind className="h-4 w-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Wind Speed</p>
                          <p className="text-base font-semibold text-gray-800">
                            {weather.windSpeed}{" "}
                            <span className="text-xs font-normal">km/h</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mr-3">
                          <Droplets className="h-4 w-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Humidity</p>
                          <p className="text-base font-semibold text-gray-800">
                            {Math.round(Math.random() * 30 + 50)}%{" "}
                            {/* Placeholder value */}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Forecast Hint */}
                  <div className="mt-4 text-center">
                    <button className="text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center justify-center mx-auto">
                      View 5-day forecast
                      <svg
                        className="w-3 h-3 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Feed */}
        <div className="col-span-1 md:col-span-1 max-h-screen overflow-y-auto pb-10 scrollbar-thin scrollbar-thumb-gray-300">
          {/* Stories */}
          <DisasterStories />

          {/* Feed */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-sm p-4 animate-pulse"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/5"></div>
                    </div>
                  </div>
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  handleAddComment={handleAddComment}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar - For Tablet & Desktop */}
        <div className="hidden md:block col-span-1">
          <RightSidebar />
        </div>
      </main>

      {/* Modal for creating new post */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Report Disaster"
      >
        <PostForm
          onPostCreated={handlePostCreated}
          onUpdateSuccess={fetchPosts}
        />
      </Modal>
      {/* Share Modal */}
      <Modal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title="Share Post"
      >
        <div className="p-5">
          {currentSharedPost && (
            <>
              {/* Post Preview */}
              <div className="mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-800 mb-1">
                  {currentSharedPost.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {currentSharedPost.description}
                </p>
              </div>

              {/* Copy Link Section - Distinct from social sharing */}
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={`https://guardianearth.org/post/${currentSharedPost._id}`}
                    className="w-full py-3 pl-4 pr-[105px] bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none"
                  />
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `https://guardianearth.org/post/${currentSharedPost._id}`
                      )
                    }
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-gray-200 text-gray-500 hover:bg-green-200 hover:text-green-500  duration-300 text-xs font-medium rounded-md hover:bg-primary-700 transition-colors"
                  >
                    Copy Link
                  </button>
                </div>
              </div>

              {/* Social Share Options - Horizontal Layout */}
              <div>
                <p className="text-xs font-medium text-center text-gray-500 mb-6">
                  SHARE WITH
                </p>
                <div className="flex justify-center space-x-16">
                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/?text=Check out this disaster alert: ${currentSharedPost.title} https://guardianearth.org/post/${currentSharedPost._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mb-2 hover:shadow-md transition-shadow">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-white"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-600">WhatsApp</span>
                  </a>

                  {/* Facebook */}
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=https://guardianearth.org/post/${currentSharedPost._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mb-2 hover:shadow-md transition-shadow">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-white"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-600">Facebook</span>
                  </a>

                  {/* X (Twitter) */}
                  <a
                    href={`https://twitter.com/intent/tweet?text=Check out this disaster alert: ${currentSharedPost.title}&url=https://guardianearth.org/post/${currentSharedPost._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center mb-2 hover:shadow-md transition-shadow">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-white"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-600">Twitter</span>
                  </a>

                  {/* Email */}
                  <a
                    href={`mailto:?subject=Disaster Alert: ${currentSharedPost.title}&body=Check out this disaster alert from Guardian Earth: https://guardianearth.org/post/${currentSharedPost._id}`}
                    className="flex flex-col items-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mb-2 hover:shadow-md transition-shadow">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-600">Email</span>
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default PostView;
