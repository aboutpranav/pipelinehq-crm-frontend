import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import {
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  SOURCE_OPTIONS,
  TAG_OPTIONS,
  API_BASE_URL,
} from "../../utils/constants";
import { getStatusColor, getPriorityColor } from "../../utils/helpers";
import { toast } from "react-toastify";
import "./LeadDetail.css";

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { leads, agents, updateLead, deleteLead } = useApp();

  const [lead, setLead] = useState(null);
  const [editLead, setEditLead] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [processedTags, setProcessedTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentError, setCommentError] = useState(null);

  useEffect(() => {
    const fetchLeadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const foundLead = leads.find((l) => l._id === id);

        if (!foundLead) {
          setError("Lead not found");
          setLead(null);
          setComments([]);
          setLoading(false);
          return;
        }

        setLead(foundLead);
        setEditLead(foundLead);
        setProcessedTags(foundLead.tags || []);

        if (foundLead.salesAgent?.name && agents.length > 0) {
          const assignedAgent = agents.find(
            (a) => a.name === foundLead.salesAgent.name
          );
          if (assignedAgent) {
            setSelectedAuthor(assignedAgent._id);
          } else if (agents.length > 0) {
            setSelectedAuthor(agents[0]._id);
          }
        } else if (agents.length > 0) {
          setSelectedAuthor(agents[0]._id);
        }

        setCommentsLoading(true);
        const commentsResponse = await fetch(
          `${API_BASE_URL}/leads/${id}/comments`
        );

        if (commentsResponse.ok) {
          const commentsData = await commentsResponse.json();
          setComments(commentsData);
        } else {
          console.error("Failed to fetch comments");
          setComments([]);
        }
      } catch (err) {
        console.error("Error fetching lead data:", err);
        setError("Failed to load lead details");
      } finally {
        setLoading(false);
        setCommentsLoading(false);
      }
    };

    if (leads.length > 0 && agents.length > 0) {
      fetchLeadData();
    }
  }, [id, leads, agents]);

  const handleToggleEdit = () => {
    if (!lead) return;
    setEditLead(lead);
    setIsEditing((prev) => !prev);
  };

  const handleEditFieldChange = (field, value) => {
    setEditLead((prev) => ({
      ...prev,
      [field]:
        field === "salesAgent"
          ? { ...(prev.salesAgent || {}), name: value }
          : value,
    }));
  };

  const handleTagToggle = (tag) => {
    setEditLead((prev) => {
      const current = prev.tags || [];
      const exists = current.includes(tag);
      const updated = exists
        ? current.filter((t) => t !== tag)
        : [...current, tag];
      return { ...prev, tags: updated };
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editLead) return;

    try {
      await updateLead(editLead._id, editLead);
      setLead(editLead);
      setProcessedTags(editLead.tags || []);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating lead:", err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${lead.name}?`)) {
      try {
        await deleteLead(id);
        navigate("/leads");
      } catch (err) {
        console.error("Error deleting lead:", err);
      }
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !lead) return;

    if (!selectedAuthor) {
      setCommentError("Please select who is commenting");
      toast.error("⚠️ Please select who is commenting");
      return;
    }

    setCommentError(null);

    try {
      const commentData = {
        commentText: newComment.trim(),
        author: selectedAuthor,
      };

      const response = await fetch(`${API_BASE_URL}/leads/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commentData),
      });

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      const savedComment = await response.json();

      const newCommentItem = {
        id: savedComment.id,
        author: savedComment.author,
        createdAt: savedComment.createdAt,
        commentText: savedComment.commentText,
      };

      setComments((prev) => [...prev, newCommentItem]);
      setNewComment("");

      toast.success("💬 Comment added successfully!");
    } catch (err) {
      console.error("Error adding comment:", err);
      setCommentError("Failed to add comment. Please try again.");

      toast.error(`❌ Failed to add comment: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <span className="loading-text">Loading lead details...</span>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="error-container">
        <div className="error-box">⚠️ {error || "Lead not found"}</div>
        <button
          onClick={() => navigate("/leads")}
          style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}
        >
          Back to Leads
        </button>
      </div>
    );
  }

  return (
    <div className="lead-detail-container">
      <div className="lead-detail-wrapper">
        <div className="header-card">
          <div className="header-left">
            <div className="header-title-row">
              <div className="header-icon">🧩</div>
              <h1 className="header-title">{lead.name}</h1>
            </div>

            <div className="header-badges">
              <span
                className="status-badge"
                style={{ background: getStatusColor(lead.status) }}
              >
                <span className="status-indicator" />
                {lead.status}
              </span>

              <span
                className="priority-badge"
                style={{
                  background: `${getPriorityColor(lead.priority)}20`,
                  color: getPriorityColor(lead.priority),
                }}
              >
                🚩 {lead.priority} Priority
              </span>

              <span className="created-date">
                📅 Created: {new Date(lead.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="header-actions">
            <button
              onClick={handleToggleEdit}
              className={`btn-edit ${isEditing ? "editing" : "not-editing"}`}
            >
              {isEditing ? "Cancel Edit" : "Edit Lead"}
            </button>

            <button onClick={handleDelete} className="btn-delete">
              Delete Lead
            </button>
          </div>
        </div>

        <div className="content-grid">
          <div className="left-column">
            <div className="card">
              <div className="card-header">
                <span>ℹ️</span>
                <h2 className="card-title">
                  {isEditing ? "Edit Lead" : "Lead Information"}
                </h2>
              </div>

              {isEditing && editLead ? (
                <form onSubmit={handleSaveEdit}>
                  <div className="edit-form-grid">
                    <div className="form-field">
                      <label>Status</label>
                      <select
                        value={editLead.status}
                        onChange={(e) =>
                          handleEditFieldChange("status", e.target.value)
                        }
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-field">
                      <label>Priority</label>
                      <select
                        value={editLead.priority}
                        onChange={(e) =>
                          handleEditFieldChange("priority", e.target.value)
                        }
                      >
                        {PRIORITY_OPTIONS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-field">
                      <label>Sales Agent</label>
                      <select
                        value={editLead.salesAgent?.name || ""}
                        onChange={(e) =>
                          handleEditFieldChange("salesAgent", e.target.value)
                        }
                      >
                        <option value="">Unassigned</option>
                        {agents.map((agent) => (
                          <option key={agent.id} value={agent.name}>
                            {agent.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-field">
                      <label>Source</label>
                      <select
                        value={editLead.source}
                        onChange={(e) =>
                          handleEditFieldChange("source", e.target.value)
                        }
                      >
                        {SOURCE_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-field">
                      <label>Time to Close (days)</label>
                      <input
                        type="number"
                        value={editLead.timeToClose}
                        onChange={(e) =>
                          handleEditFieldChange(
                            "timeToClose",
                            Number(e.target.value) || 0
                          )
                        }
                      />
                    </div>

                    <div className="form-field">
                      <label>Tags</label>
                      <div className="tag-selector">
                        {TAG_OPTIONS.map((tag) => {
                          const active = (editLead.tags || []).includes(tag);
                          return (
                            <span
                              key={tag}
                              onClick={() => handleTagToggle(tag)}
                              className={`tag-option ${
                                active ? "active" : "inactive"
                              }`}
                            >
                              {tag}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-save">
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleEdit}
                      className="btn-cancel"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="info-grid">
                  <div>
                    <div className="info-field">
                      <div className="info-label">
                        <span>👤</span>
                        <span>Sales Agent</span>
                      </div>
                      <div className="info-value">
                        {lead.salesAgent?.name || "Unassigned"}
                      </div>
                    </div>

                    <div className="info-field">
                      <div className="info-label">
                        <span>🌐</span>
                        <span>Source</span>
                      </div>
                      <div className="info-value-normal">{lead.source}</div>
                    </div>

                    <div>
                      <div className="info-label">
                        <span>⏱️</span>
                        <span>Time to Close</span>
                      </div>
                      <div className="info-value-normal">
                        <span className="time-badge">
                          {lead.timeToClose} days
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div>
                      <div className="info-label">
                        <span>🏷️</span>
                        <span>Tags</span>
                      </div>
                      <div className="tags-container">
                        {processedTags.length > 0 ? (
                          processedTags.map((tag, index) => (
                            <span key={index} className="tag">
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="no-tags">No tags</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="card">
              <div className="comments-header">
                <div className="comments-title-row">
                  <span>💬</span>
                  <h2 className="comments-title">
                    Comments ({comments.length})
                  </h2>
                </div>
              </div>

              {commentsLoading ? (
                <div className="no-comments">Loading comments...</div>
              ) : (
                <>
                  <div className="comments-list">
                    {comments.length === 0 ? (
                      <div className="no-comments">
                        <div className="no-comments-icon">💭</div>
                        No comments yet. Be the first to add one!
                      </div>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="comment-item">
                          <div className="comment-header">
                            <div className="comment-author-row">
                              <span className="comment-avatar">
                                {comment.author?.charAt(0) || "U"}
                              </span>
                              <span className="comment-author-name">
                                {comment.author}
                              </span>
                            </div>
                            <span className="comment-date">
                              {new Date(comment.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="comment-text">
                            {comment.commentText}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {commentError && (
                    <div
                      style={{
                        color: "#ef4444",
                        padding: "0.5rem",
                        fontSize: "0.875rem",
                      }}
                    >
                      {commentError}
                    </div>
                  )}

                  <form onSubmit={handleAddComment}>
                    <div className="comment-form-field">
                      <label className="comment-form-label">Comment as</label>
                      <select
                        value={selectedAuthor}
                        onChange={(e) => setSelectedAuthor(e.target.value)}
                        className="comment-textarea"
                        style={{
                          height: "auto",
                          padding: "0.75rem",
                          marginBottom: "1rem",
                        }}
                      >
                        <option value="">Select who is commenting...</option>
                        {agents.map((agent) => (
                          <option key={agent._id} value={agent._id}>
                            👤 {agent.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="comment-form-field">
                      <label className="comment-form-label">
                        Add a comment
                      </label>
                      <textarea
                        rows={3}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your thoughts or updates about this lead..."
                        className="comment-textarea"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!newComment.trim() || !selectedAuthor}
                      className="btn-add-comment"
                    >
                      ➕ Add Comment
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

          <div>
            <div className="card">
              <div className="card-header">
                <span>⏳</span>
                <h2 className="card-title">Lead Timeline</h2>
              </div>

              <div className="timeline-list">
                <div className="timeline-item">
                  <div
                    className="timeline-dot"
                    style={{ background: "#3b82f6" }}
                  />
                  <div className="timeline-content">
                    <div className="timeline-title">Lead Created</div>
                    <div className="timeline-date">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="timeline-item">
                  <div
                    className="timeline-dot"
                    style={{ background: "#f59e0b" }}
                  />
                  <div className="timeline-content">
                    <div className="timeline-title">Status: {lead.status}</div>
                    <div className="timeline-date">Current status</div>
                  </div>
                </div>

                {comments.length > 0 && (
                  <div className="timeline-item">
                    <div
                      className="timeline-dot"
                      style={{ background: "#10b981" }}
                    />
                    <div className="timeline-content">
                      <div className="timeline-title">Latest Comment</div>
                      <div className="timeline-date">
                        {new Date(
                          comments[comments.length - 1].createdAt
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;
