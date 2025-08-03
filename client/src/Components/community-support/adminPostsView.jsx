import React, { useState, useEffect, useRef } from "react";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaImage,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaTags,
  FaTable,
  FaTh,
  FaSearch,
} from "react-icons/fa";
import { Image, Plus, LayoutGrid, List } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { format } from "date-fns";
import { Toaster, toast } from "react-hot-toast";
import Modal from "../main-components/Model";
import { useModal } from "../main-components/ModalContext";

import PostForm from "./PostForm";

const adminPostView = () => {
  const [imageModalUrl, setImageModalUrl] = useState(null);
  const [imageModalTitle, setImageModalTitle] = useState("");
  const [imageModalDescription, setImageModalDescription] = useState("");
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [shouldFocusSearch, setShouldFocusSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isModalOpen, setIsModalOpen } = useModal();
  const [pendingPosts, setPendingPosts] = useState([]);
  const [approvedPosts, setApprovedPosts] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const deleteToastRef = useRef(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Disaster");
  const [location, setLocation] = useState("");
  const [disasterDate, setDisasterDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isUpcoming, setIsUpcoming] = useState(false);
  const [dateError, setDateError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/posts");
      const data = await response.json();
      const filtered = Array.isArray(data)
        ? data
            .filter((post) =>
              statusFilter === "All" ? true : post.status === statusFilter
            )
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : [];

      setPosts(filtered);
    } catch (error) {
      toast.error("Error fetching posts: " + error.message);
      console.error("Error fetching posts:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shouldFocusSearch) {
      searchInputRef.current?.focus();
      setShouldFocusSearch(false);
    }

    fetch("/api/posts/status?status=pending")
      .then((res) => res.json())
      .then(setPendingPosts);

    fetch("/api/posts/status?status=approved")
      .then((res) => res.json())
      .then(setApprovedPosts);

    fetchPosts();
  }, [shouldFocusSearch, statusFilter]);

  const approvePost = async (postId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/posts/${postId}/approve`,
        {
          method: "PUT",
        }
      );
      if (!response.ok) throw new Error("Failed to approve post");
      toast.success("Post approved successfully");
      fetchPosts();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const rejectPost = async (postId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/posts/${postId}/reject`,
        {
          method: "PUT",
        }
      );
      if (!response.ok) throw new Error("Failed to reject post");
      toast.success("Post rejected");
      fetchPosts();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
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

  const handleEdit = (post) => {
    setEditingPost(post);
    setTitle(post.title);
    setDescription(post.description);
    setCategory(post.category);
    setLocation(post.location);
    setDisasterDate(post.disasterDate || "");
    setImageUrl(post.imageUrl);
    setIsUpcoming(post.isUpcoming);
    setIsEditModalOpen(true);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsModalOpen(false);
  };

  const handleDelete = async (postId) => {
    if (deleteToastRef.current) {
      return;
    }
    toast.dismiss();
    toast(
      (t) => (
        <div className="flex items-center gap-4">
          <p>Are you sure you want to delete this post?</p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                try {
                  // Send DELETE request to backend
                  const response = await fetch(
                    `http://localhost:5000/api/posts/${postId}`,
                    {
                      method: "DELETE",
                    }
                  );

                  const data = await response.json();

                  if (!response.ok) {
                    throw new Error(data.message || "Failed to delete post");
                  }

                  // Remove from local state
                  setPosts((prev) =>
                    prev.filter((post) => post._id !== postId)
                  );
                  toast.dismiss(t.id);
                  toast.success("Post deleted successfully");
                } catch (error) {
                  toast.dismiss(t.id);
                  toast.error("Error deleting post: " + error.message);
                }
              }}
              className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: 5000,
        position: "top-center",
      }
    );
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("Disaster");
    setLocation("");
    setDisasterDate("");
    setImageUrl("");
    setIsUpcoming(false);
    setDateError("");
    setSuccessMessage("");
    setEditingPost(null);
  };

  const TableView = () => (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm text-left text-gray-700">
        <thead className="text-xs uppercase bg-gray-50">
          <tr className="border-b border-gray-200">
            <th className="px-6 py-4 font-semibold text-gray-600">Title</th>
            <th className="px-6 py-4 font-semibold text-gray-600">Category</th>
            <th className="px-6 py-4 font-semibold text-gray-600">Location</th>
            <th className="px-6 py-4 font-semibold text-gray-600">Date</th>
            <th className="px-6 py-4 font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPosts.map((post) => (
            <tr
              key={post._id}
              className="bg-white hover:bg-gray-50 transition-colors relative group"
            >
              <td className="px-6 py-4 font-medium">{post.title}</td>
              <td className="px-6 py-4">
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                    post.category === "Disaster"
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {post.category}
                </span>
              </td>
              <td className="px-6 py-4">{post.location}</td>
              <td className="px-6 py-4">
                {format(new Date(post.createdAt), "MMM d, yyyy")}
              </td>
              <td className="px-6 py-4">
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleEdit(post)}
                    className="text-gray-600 hover:text-green-600 transition-colors"
                  >
                    <FaEdit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <FaTrash size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setImageModalUrl(post.imageUrl);
                      setImageModalTitle(post.title);
                      setImageModalDescription(post.description);
                    }}
                    className="text-gray-600 flex flex-row items-center gap-2 hover:text-green-600 border-[1px] border-gray-300 px-2 py-[2px] rounded-[4px] transition-colors"
                  >
                    <Image className="h-4 w-4" /> Preview
                  </button>{" "}
                  {post.status === "pending" && (
                    <div className="flex text-left">
                      <button
                        onClick={() => approvePost(post._id)}
                        className="text-white flex flex-row items-center gap-2 text-[15px] bg-green-500 hover:bg-green-600 border-[1px] border-gray-300 px-2 py-[2px] rounded-[4px] transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectPost(post._id)}
                        className="text-white flex flex-row items-center gap-2 text-[15px] bg-red-500 hover:bg-red-600 border-[1px] border-gray-300 px-2 py-[2px] rounded-[4px] transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const GridView = () => (
    <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
      {filteredPosts.map((post) => (
        <div
          key={post._id}
          className="bg-white rounded-lg border-gray-100 border shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-48 object-cover rounded-t-lg"
            />
          )}
          <div className="p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-lg font-semibold text-gray-900">
                {post.title}
              </h2>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  post.category === "Disaster"
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {post.category}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-3">{post.description}</p>

            <div className="space-y-1 text-xs text-gray-500">
              <div className="flex items-center">
                <FaMapMarkerAlt className="mr-1" /> {post.location}
              </div>
              <div className="flex items-center">
                <FaCalendarAlt className="mr-1" /> Posted:{" "}
                {format(new Date(post.createdAt), "MMM d, yyyy")}
              </div>
              {post.category === "Disaster" && (
                <div
                  className={`flex items-center ${post.isUpcoming ? "text-green-600" : "text-red-600"}`}
                >
                  🚨 Disaster Date:{" "}
                  {format(new Date(post.disasterDate), "MMM d, yyyy")}
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 flex items-center justify-between">
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setImageModalUrl(post.imageUrl);
                    setImageModalTitle(post.title);
                    setImageModalDescription(post.description);
                  }}
                  className="text-gray-600 flex flex-row items-center gap-2 hover:text-green-600 border-[1px] border-gray-300 px-2 py-[2px] rounded-[4px] transition-colors"
                >
                  <Image className="h-4 w-4" /> Preview
                </button>
                {post.status === "pending" && (
                  <div className="flex text-left">
                    <button
                      onClick={() => approvePost(post._id)}
                      className="text-white flex flex-row items-center gap-2 text-[15px] bg-green-500 hover:bg-green-600 border-[1px] border-gray-300 px-2 py-[2px] rounded-[4px] transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectPost(post._id)}
                      className="text-white flex flex-row items-center gap-2 text-[15px] bg-red-500 hover:bg-red-600 border-[1px] border-gray-300 px-2 py-[2px] rounded-[4px] transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>

              <div className="  border-t border-gray-100 flex justify-end space-x-2">
                <button
                  onClick={() => handleEdit(post)}
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  <FaEdit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(post._id)}
                  className="text-gray-600 hover:text-red-600 transition-colors"
                >
                  <FaTrash size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const SearchBar = () => {
    const searchInputRef = useRef(null);

    return (
      <div className="relative max-w-md w-full">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <FaSearch className="h-4 w-4 text-gray-400 z-50" />
        </div>
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg bg-white/50 backdrop-blur-sm h-[36px] text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 outline-none focus:ring-green-500 focus:border-transparent transition-all duration-200 text-[13px]"
          placeholder="Search posts..."
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery("");
              setShouldFocusSearch(true);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <span className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-100 transition-colors">
              ✕
            </span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 ">
      <Toaster />
      <header className="bg-gray-50 shadow-sm sticky top-0 z-40">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center text-left">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Community Management
              </h1>
              <p className="text-sm text-gray-500">Admin Dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              <SearchBar />
              {/* Filter Dropdown */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                }}
                className="border text-[13px] border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="All">All</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
              <div className="flex flex-row  gap-2">
                <div className="inline-flex items-center rounded-lg z-20 border border-gray-200 bg-white p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    type="button"
                    className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      viewMode === "grid"
                        ? "bg-emerald-100 text-emerald-800"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4 mr-1 " />
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    type="button"
                    className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      viewMode === "list"
                        ? "bg-emerald-100 text-emerald-800"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <List className="w-4 h-4 mr-1" />
                    Table
                  </button>
                </div>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setIsAddModalOpen(true);
                  setIsModalOpen(true);
                }}
                className=" hover:border-green-300 active:bg-green-100 z-10 w-[145px] h-[38px] mt-[1px] border border-gray-200 bg-white p-1 justify-center text-[#626262] hover:text-green-600 px-2 py-3 rounded-md transition-all duration-300 text-[14px] font-medium !rounded-button whitespace-nowrap cursor-pointer shadow-sm flex items-center"
              >
                <Plus className="mr-2" /> Add Post
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-3 text-sm bg-red-50 border border-red-200 rounded-md text-red-600">
            {error}
          </div>
        )}
        {loading ? (
          <div className="text-center text-gray-500 text-[15px] py-10">
            Loading posts...
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center text-gray-400 text-[16px] py-10">
            No records found.
          </div>
        ) : viewMode === "grid" ? (
          <GridView />
        ) : (
          <TableView />
        )}
      </main>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
          handleModalClose();
          setIsModalOpen(false);
        }}
        title="Create New Post"
      >
        <PostForm
          onSubmit={(formData) => {
            setPosts([
              ...posts,
              {
                ...formData,
                _id: Date.now().toString(),
                createdAt: new Date().toISOString(),
              },
            ]);
            setIsAddModalOpen(false);
            setIsModalOpen(true);
            resetForm();
          }}
          onPostCreated={handleModalClose}
          onUpdateSuccess={fetchPosts}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setIsModalOpen(true);
          resetForm();
        }}
        title="Edit Post"
      >
        <PostForm
          initialData={editingPost}
          isEdit={true}
          onSubmit={(formData) => {
            setPosts(
              posts.map((post) =>
                post._id === editingPost._id ? { ...post, ...formData } : post
              )
            );
            setIsEditModalOpen(false);
            setIsModalOpen(true);
            resetForm();
          }}
          onPostCreated={handleModalClose}
          onUpdateSuccess={fetchPosts}
        />
      </Modal>
      <Modal
        isOpen={!!imageModalUrl}
        onClose={() => setImageModalUrl(null)}
        title="Image Preview"
      >
        <div className="space-y-4">
          <img
            src={imageModalUrl}
            alt="Preview"
            className="w-full h-auto rounded-lg"
          />
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {imageModalTitle}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {imageModalDescription}
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default adminPostView;
